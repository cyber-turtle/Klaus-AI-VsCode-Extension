"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LSPServer = void 0;
const node_1 = require("vscode-languageserver/node");
const node_fs_1 = __importDefault(require("node:fs"));
const node_os_1 = __importDefault(require("node:os"));
const vscode_uri_1 = require("vscode-uri");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const parser_1 = require("./files/parser");
const retriever_1 = require("./retriever");
const Composer_1 = require("@shared/types/Composer");
const loggingProvider_1 = require("./loggingProvider");
const node_path_1 = __importDefault(require("node:path"));
const composer_1 = require("../composer");
const checkpointer_1 = require("../composer/checkpointer");
const settings_1 = require("../service/settings");
const vector_1 = require("./files/vector");
const models_1 = require("../service/utils/models");
class LSPServer {
    constructor() {
        this.workspaceFolders = [];
        this.documentQueue = [];
        this.documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
        this.postInitialize = async () => {
            const workspaceFolder = this.workspaceFolders[0];
            loggingProvider_1.loggingProvider.logInfo(`Wingman LSP initialized for workspace: ${workspaceFolder}`);
            this.codeParser = new parser_1.CodeParser(workspaceFolder, this.symbolRetriever);
            await this.codeParser.initialize();
            this.checkPointer = new checkpointer_1.PartitionedFileSystemSaver(this.getPersistancePath("checkpoints"));
            const settings = await settings_1.wingmanSettings.loadSettings();
            if (settings.embeddingSettings[settings.embeddingProvider]?.dimensions &&
                settings.embeddingSettings.General.enabled) {
                this.vectorStore = new vector_1.VectorStore(settings, this.workspaceFolders[0], this.getPersistancePath("embeddings"));
                await this.vectorStore.initialize();
            }
            this.composer = new composer_1.WingmanAgent(this.workspaceFolders[0], this.checkPointer, this.codeParser, this.storagePath, this.vectorStore, this.diagnosticsRetriever);
            await this.composer.initialize();
            try {
                const provider = (0, models_1.CreateAIProvider)(settings, loggingProvider_1.loggingProvider);
                if (settings.embeddingSettings.General.enabled) {
                    this.embedder = (0, models_1.CreateEmbeddingProvider)(settings, loggingProvider_1.loggingProvider).getEmbedder();
                }
            }
            catch (e) {
                console.error(e);
            }
        };
        this.getPersistancePath = (folder) => {
            const homeDir = node_os_1.default.homedir();
            const targetPath = node_path_1.default.join(homeDir, ".wingman", node_path_1.default.basename(this.workspaceFolders[0]), folder);
            // Ensure the directory exists
            const dbDir = node_path_1.default.dirname(targetPath);
            node_fs_1.default.mkdirSync(dbDir, { recursive: true });
            return targetPath;
        };
        this.compose = async (request, files, command, temp) => {
            try {
                if (!this.composer)
                    return false;
                await this.composer.initialize();
                for await (const event of this.composer.execute(request, files, command, temp)) {
                    if (event.event === "no-op") {
                        return false;
                    }
                    await this.connection?.sendRequest("wingman/compose", event);
                    const settings = await settings_1.wingmanSettings.loadSettings();
                    if (event.event === "composer-done" &&
                        !event.state.canResume &&
                        event.state.messages &&
                        settings.agentSettings.automaticallyFixDiagnostics) {
                        try {
                            const toolMessages = event.state.messages.filter((m) => m instanceof Composer_1.ToolMessage && m.metadata && m.metadata.file);
                            const files = toolMessages.map((m) => m.metadata.file);
                            if (!files)
                                return true;
                            const diagnostics = await this.diagnosticsRetriever.getFileDiagnostics(files.map((f) => f.path) ?? []);
                            if (settings.agentSettings.automaticallyFixDiagnostics &&
                                diagnostics &&
                                diagnostics.length) {
                                await this.fixDiagnostics({
                                    diagnostics: diagnostics,
                                    threadId: event.state.threadId,
                                });
                            }
                        }
                        catch (e) {
                            console.error(e);
                        }
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
            return true;
        };
        this.fixDiagnostics = async (event) => {
            const { threadId, diagnostics } = event;
            if (diagnostics?.length === 0)
                return;
            const aboslutePaths = diagnostics.map((d) => {
                if (node_path_1.default.isAbsolute(this.workspaceFolders[0]))
                    return d.path;
                return node_path_1.default.join(this.workspaceFolders[0], d.path);
            });
            const input = diagnostics
                .map((d) => {
                return `<file_with_error>
Path: ${node_path_1.default.relative(this.workspaceFolders[0], d.path)}
${d.importErrors?.length > 0 ? d.importErrors.map((e) => `Import Error:${e.message}\nLine: ${e.start.line + 1}\nCharacter: ${e.start.character}`).join("\n") : ""}
${d.lintErrors?.length > 0 ? d.lintErrors.map((e) => `Linting Error: ${e.message}\nLine: ${e.start.line + 1}\nCharacter: ${e.start.character}`).join("\n") : ""}
</file_with_error>`;
            })
                .join("\n");
            return this.compose({
                input: `The following files have import or linting errors, fix them all without making any breaking changes.
Each error type details the message, line it occurs on and character it starts at.

${input}`,
                contextFiles: aboslutePaths,
                recentFiles: [],
                threadId,
            }, undefined, undefined, true);
        };
        this.initialize = async () => {
            let hasConfigurationCapability = false;
            let hasWorkspaceFolderCapability = false;
            this.connection?.onInitialize(async (params) => {
                if (params.workspaceFolders) {
                    this.workspaceFolders = params.workspaceFolders.map((folder) => vscode_uri_1.URI.parse(folder.uri).fsPath);
                }
                this.storagePath = params.initializationOptions.storagePath;
                this.connection?.console.log(`Workspace folders: ${this.workspaceFolders.join(", ")}`);
                const capabilities = params.capabilities;
                await this.postInitialize();
                await this.addEvents();
                // Does the client support the `workspace/configuration` request?
                // If not, we fall back using global settings.
                hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
                hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
                const result = {
                    capabilities: {
                        textDocumentSync: {
                            change: node_1.TextDocumentSyncKind.Incremental,
                            save: {
                                includeText: true,
                            },
                        },
                    },
                };
                if (hasWorkspaceFolderCapability) {
                    result.capabilities.workspace = {
                        workspaceFolders: {
                            supported: true,
                            changeNotifications: true,
                        },
                        fileOperations: {
                            didDelete: {
                                filters: [{ pattern: { glob: "**/*" } }],
                            },
                            didRename: {
                                filters: [{ pattern: { glob: "**/*" } }],
                            },
                        },
                    };
                }
                return result;
            });
            this.connection?.onInitialized(async () => {
                if (hasConfigurationCapability) {
                    // Register for all configuration changes.
                    this.connection?.client.register(node_1.DidChangeConfigurationNotification.type, undefined);
                }
                if (hasWorkspaceFolderCapability) {
                    this.connection?.workspace.onDidChangeWorkspaceFolders((_event) => {
                        this.connection?.console.log("Workspace folder change event received.");
                    });
                }
                try {
                    await this.postInitialize();
                    await this.addEvents();
                }
                catch (e) {
                    console.error(e);
                }
            });
            this.connection?.onShutdown(() => {
                loggingProvider_1.loggingProvider.logInfo("LSP Server is shutting down.");
                if (this.checkPointer) {
                    this.checkPointer.cleanup();
                }
            });
            if (this.connection) {
                this.documents.listen(this.connection);
                this.connection?.listen();
            }
        };
        /**
         * Sets up event listeners and request handlers for the language server connection.
         *
         * This method initializes various event handlers for:
         * - Diagnostics reporting
         * - Configuration changes
         * - Workspace folder management
         * - Index management and querying
         * - Chat history management
         * - Code composition and file operations
         * - Web search functionality
         * - Embedding retrieval
         *
         * @private
         * @async
         * @returns {Promise<void>} A promise that resolves when all event handlers are registered
         */
        this.addEvents = async () => {
            this.connection?.languages.diagnostics.on(async (params) => {
                const document = this.documents.get(params.textDocument.uri);
                if (document !== undefined) {
                    return {
                        kind: node_1.DocumentDiagnosticReportKind.Full,
                        items: [],
                    };
                }
                // We don't know the document. We can either try to read it from disk
                // or we don't report problems for it.
                this.connection?.console.log(`Document not found: ${params.textDocument.uri}`);
                return {
                    kind: node_1.DocumentDiagnosticReportKind.Full,
                    items: [],
                };
            });
            this.connection?.onDidChangeConfiguration((change) => {
                this.connection?.languages.diagnostics.refresh();
            });
            this.connection?.onNotification(node_1.DidChangeWorkspaceFoldersNotification.type, (params) => {
                // biome-ignore lint/complexity/noForEach: <explanation>
                params.event.added.forEach((folder) => {
                    const folderPath = vscode_uri_1.URI.parse(folder.uri).fsPath;
                    if (!this.workspaceFolders.includes(folderPath)) {
                        this.workspaceFolders.push(folderPath);
                        this.connection?.console.log(`Workspace folder added: ${folderPath}`);
                    }
                });
                // biome-ignore lint/complexity/noForEach: <explanation>
                params.event.removed.forEach((folder) => {
                    const folderPath = vscode_uri_1.URI.parse(folder.uri).fsPath;
                    const index = this.workspaceFolders.indexOf(folderPath);
                    if (index !== -1) {
                        this.workspaceFolders.splice(index, 1);
                        this.connection?.console.log(`Workspace folder removed: ${folderPath}`);
                    }
                });
            });
            this.connection?.onRequest("wingman/clearChatHistory", async (threadId) => {
                return this.composer?.updateThread({
                    thread: { id: threadId },
                    messages: [],
                });
            });
            this.connection?.onRequest("wingman/cancelComposer", async (threadId) => {
                this.composer?.cancel(threadId);
            });
            this.connection?.onRequest("wingman/compose", async ({ request }) => {
                return this.compose(request);
            });
            this.connection?.onRequest("wingman/fixDiagnostics", async (event) => {
                return this.fixDiagnostics(event);
            });
            this.connection?.onRequest("wingman/updateSettings", async () => {
                const settings = await settings_1.wingmanSettings.loadSettings(true);
                await this.composer?.initialize();
                if (settings.embeddingSettings.General.enabled) {
                    this.embedder = (0, models_1.CreateEmbeddingProvider)(settings, loggingProvider_1.loggingProvider).getEmbedder();
                }
                if (this.vectorStore) {
                    const stats = await this.vectorStore.getStats();
                    const embeddingSettings = settings.embeddingSettings[settings.embeddingProvider];
                    if (embeddingSettings &&
                        settings.embeddingSettings.General.enabled &&
                        stats.dimensions !== embeddingSettings?.dimensions) {
                        this.vectorStore.removeIndex();
                        this.vectorStore = new vector_1.VectorStore(settings, this.workspaceFolders[0], this.getPersistancePath("embeddings"));
                        await this.vectorStore.initialize();
                    }
                }
                else if (!this.vectorStore &&
                    settings.embeddingSettings.General.enabled) {
                    this.vectorStore = new vector_1.VectorStore(settings, this.workspaceFolders[0], this.getPersistancePath("embeddings"));
                    await this.vectorStore.initialize();
                }
            });
            this.connection?.onRequest("wingman/getThreadById", async (threadId) => {
                // Race condition against LSP starting up and the client side retrieving history for chat panel
                if (!this.composer?.initialized) {
                    const waitForInitialization = async () => {
                        for (let attempt = 0; attempt < 20; attempt++) {
                            await new Promise((resolve) => setTimeout(resolve, 250));
                            if (this.composer?.initialized) {
                                break;
                            }
                        }
                    };
                    await waitForInitialization();
                    return this.composer?.getState(threadId);
                }
                return this.composer?.getState(threadId);
            });
            this.connection?.onRequest("wingman/indexFiles", async (indexFiles) => {
                if (!this.vectorStore || !this.embedder)
                    return;
                for (const [filePath, metadata] of indexFiles) {
                    if (!node_fs_1.default.existsSync(filePath))
                        continue;
                    const fileContents = (await node_fs_1.default.promises.readFile(filePath)).toString();
                    this.vectorStore.upsert(filePath, fileContents, metadata);
                }
            });
            this.connection?.onRequest("wingman/getIndexedFiles", async () => {
                if (!this.vectorStore)
                    return;
                return this.vectorStore.getIndexedFiles();
            });
            this.connection?.onRequest("wingman/resyncIndex", async () => {
                if (!this.vectorStore)
                    return;
                return this.vectorStore.resync();
            });
            this.connection?.onRequest("wingman/updateComposerFile", async (event) => {
                const fromUserAction = event.files.every((f) => f.accepted || f.rejected);
                const resumed = await this.compose({
                    input: "",
                    threadId: event.threadId,
                    contextFiles: [],
                }, event.files);
                if (!fromUserAction || !resumed) {
                    await this.composer?.updateFile(event);
                }
                return resumed;
            });
            this.connection?.onRequest("wingman/updateCommand", async (event) => {
                const resumed = await this.compose({
                    input: "",
                    threadId: event.threadId,
                    contextFiles: [],
                }, undefined, event.command);
                return resumed;
            });
            this.connection?.onRequest("wingman/createThread", async (thread) => {
                return this.composer?.createThread(thread);
            });
            this.connection?.onRequest("wingman/updateThread", async (thread) => {
                return this.composer?.updateThread({ thread });
            });
            this.connection?.onRequest("wingman/branchThread", async ({ threadId, originalThreadId, }) => {
                return this.composer?.branchThread(originalThreadId, undefined, threadId);
            });
            this.connection?.onRequest("wingman/deleteThread", async (threadId) => {
                return this.composer?.deleteThread(threadId);
            });
        };
        // Create a connection for the server, using Node's IPC as a transport.
        // Also include all preview / proposed LSP features.
        this.connection = (0, node_1.createConnection)(node_1.ProposedFeatures.all);
        this.symbolRetriever = (0, retriever_1.createSymbolRetriever)(this.connection);
        this.diagnosticsRetriever = (0, retriever_1.createDiagnosticsRetriever)(this.connection);
        this.initialize();
    }
}
exports.LSPServer = LSPServer;
const lsp = new LSPServer();
exports.default = lsp;
//# sourceMappingURL=index.js.map