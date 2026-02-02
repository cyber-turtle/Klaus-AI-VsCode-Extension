"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LSPClient = void 0;
const vscode = __importStar(require("vscode"));
const node_1 = require("vscode-languageclient/node");
const node_path_1 = __importDefault(require("node:path"));
const utils_1 = require("./utils");
const loggingProvider_1 = require("../providers/loggingProvider");
const telemetryProvider_1 = require("../providers/telemetryProvider");
const fileWatcher_1 = require("../providers/fileWatcher");
const settings_1 = require("../service/settings");
const globProvider_1 = require("../providers/globProvider");
const models_1 = require("../service/utils/models");
const sound = __importStar(require("sound-play"));
let client;
class LSPClient {
    constructor() {
        this.activate = async (context, settings) => {
            this.settings = settings;
            const serverModule = vscode.Uri.joinPath(context.extensionUri, "out", "server.js").fsPath;
            const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
            // If the extension is launched in debug mode then the debug server options are used
            // Otherwise the run options are used
            const serverOptions = {
                run: { module: serverModule, transport: node_1.TransportKind.ipc },
                debug: {
                    module: serverModule,
                    transport: node_1.TransportKind.ipc,
                    options: debugOptions,
                },
            };
            const clientOptions = {
                documentSelector: [{ scheme: "file", language: "*" }],
                outputChannel: vscode.window.createOutputChannel("Wingman Language Server"),
                connectionOptions: {
                    maxRestartCount: 3,
                },
                initializationOptions: {
                    extensionPath: context.extensionPath,
                    storagePath: context.globalStorageUri.fsPath,
                },
            };
            client = new node_1.LanguageClient("WingmanLSP", "Wingman Language Server", serverOptions, clientOptions);
            // Start the client. This will also launch the server
            await client.start();
            if (settings?.embeddingSettings.General.enabled) {
                if (!settings.embeddingSettings.General.globPattern) {
                    (0, globProvider_1.generateWorkspaceGlobPatterns)((0, models_1.CreateAIProvider)(settings, loggingProvider_1.loggingProvider), vscode.workspace.workspaceFolders[0].uri.fsPath)
                        .then(async (msg) => {
                        const settings = await settings_1.wingmanSettings.loadSettings();
                        const textContent = typeof msg === "string"
                            ? msg
                            : Array.isArray(msg.content)
                                ? msg.content.find((m) => m.type === "text").text
                                : msg.content;
                        await settings_1.wingmanSettings.saveSettings({
                            ...settings,
                            embeddingSettings: {
                                ...settings.embeddingSettings,
                                General: {
                                    enabled: settings.embeddingSettings.General.enabled,
                                    globPattern: textContent,
                                },
                            },
                        });
                        if (settings.embeddingSettings[settings.embeddingProvider]
                            ?.dimensions) {
                            this.fileWatcher = new fileWatcher_1.WingmanFileWatcher(this);
                            await this.fileWatcher.initialize(this.settings?.embeddingSettings.General.globPattern);
                        }
                    })
                        .catch((e) => {
                        loggingProvider_1.loggingProvider.logError(`Unable to generate glob patterns: ${e}`);
                    });
                }
                else {
                    if (settings.embeddingSettings[settings.embeddingProvider]?.dimensions) {
                        this.fileWatcher = new fileWatcher_1.WingmanFileWatcher(this);
                        await this.fileWatcher.initialize(this.settings?.embeddingSettings.General.globPattern);
                    }
                }
            }
            client.onRequest("wingman/compose", async (params) => {
                loggingProvider_1.loggingProvider.logInfo(JSON.stringify(params));
                telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_COMPOSE_PHASE, {
                    phase: params.event,
                });
                const settings = await settings_1.wingmanSettings.loadSettings();
                if (settings.agentSettings.playAudioAlert &&
                    (params.event === "composer-done" ||
                        params.event === "composer-error" ||
                        params.state.canResume)) {
                    try {
                        const filePath = node_path_1.default.join(context.extensionPath, "audio", "ui-notification.mp3");
                        sound.play(filePath);
                    }
                    catch (e) {
                        console.error("Failed to play sound", e);
                    }
                }
                await this.composerWebView?.postMessage({
                    command: "compose-response",
                    value: params,
                });
            });
            client.onRequest("wingman/provideDocumentSymbols", async (params) => {
                if (!params.uri) {
                    return [];
                }
                const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(params.uri));
                const symbols = await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", document.uri);
                return symbols?.map((s) => (0, utils_1.mapSymbol)(s)) || [];
            });
            client.onRequest("wingman/provideDefinition", async (params) => {
                const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(params.uri));
                const locations = await vscode.commands.executeCommand("vscode.executeDefinitionProvider", document.uri, params.position);
                return locations?.map((l) => (0, utils_1.mapLocation)(l)) || [];
            });
            client.onRequest("wingman/provideTypeDefiniton", async (params) => {
                const document = await vscode.workspace.openTextDocument(vscode.Uri.parse(params.uri));
                const locations = await vscode.commands.executeCommand("vscode.executeTypeDefinitionProvider", document.uri, params.position);
                return locations?.map((l) => (0, utils_1.mapLocation)(l)) || [];
            });
            client.onRequest("wingman/provideFileDiagnostics", async (filePaths) => {
                // Deduplicate file paths to avoid processing the same file multiple times
                const uniqueFilePaths = [...new Set(filePaths)];
                const fileUrls = uniqueFilePaths.map((p) => {
                    return node_path_1.default.isAbsolute(p)
                        ? vscode.Uri.parse(p)
                        : vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, p);
                });
                const fileDiagnostics = [];
                for (const uri of fileUrls) {
                    // Get all diagnostics for this file
                    const allDiagnostics = vscode.languages.getDiagnostics(uri);
                    // Deduplicate diagnostics by message to avoid showing the same error from different sources
                    const seenMessages = new Set();
                    const uniqueDiagnostics = allDiagnostics.filter((diag) => {
                        if (seenMessages.has(diag.message)) {
                            return false;
                        }
                        seenMessages.add(diag.message);
                        return true;
                    });
                    // First get import-related issues from the unique list
                    const importIssues = uniqueDiagnostics.filter((diag) => diag.message.includes("import") ||
                        diag.message.includes("Cannot find module"));
                    // Then get linting errors, excluding those already captured as import issues
                    const lintingErrors = uniqueDiagnostics.filter((diag) => (diag.source === "eslint" ||
                        diag.source === "tslint" ||
                        diag.source === "biome" ||
                        diag.source === "ts") &&
                        !importIssues.includes(diag));
                    if (lintingErrors.length === 0 && importIssues.length === 0)
                        continue;
                    fileDiagnostics.push({
                        path: vscode.workspace.asRelativePath(uri),
                        importErrors: importIssues.map((f) => ({
                            message: f.message,
                            start: {
                                line: f.range.start.line,
                                character: f.range.start.character,
                            },
                            end: {
                                line: f.range.end.line,
                                character: f.range.end.character,
                            },
                        })),
                        lintErrors: lintingErrors.map((f) => ({
                            message: f.message,
                            start: {
                                line: f.range.start.line,
                                character: f.range.start.character,
                            },
                            end: {
                                line: f.range.end.line,
                                character: f.range.end.character,
                            },
                        })),
                    });
                }
                if (this.composerWebView) {
                    this.composerWebView.postMessage({
                        command: "diagnostics",
                        value: fileDiagnostics,
                    });
                }
                return fileDiagnostics;
            });
        };
        this.indexFiles = async (indexFiles) => {
            const settings = await settings_1.wingmanSettings.loadSettings();
            if (settings.embeddingSettings.General.enabled) {
                if (!this.fileWatcher) {
                    this.fileWatcher = new fileWatcher_1.WingmanFileWatcher(this);
                    await this.fileWatcher.initialize(settings.embeddingSettings.General.globPattern);
                }
            }
            else {
                if (this.fileWatcher) {
                    this.fileWatcher.dispose();
                    this.fileWatcher = undefined;
                }
            }
            client.sendRequest("wingman/indexFiles", Array.from(indexFiles.entries()));
        };
        this.removeFileFromIndex = async (filePath) => {
            console.log(filePath);
        };
        this.setComposerWebViewReference = (webview) => {
            this.composerWebView = webview;
        };
        this.compose = async (request) => {
            try {
                telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_COMPOSE_STARTED, {
                    numberOfFiles: request.contextFiles.length.toString(),
                    aiProvider: this.settings?.aiProvider || "Unknown",
                    model: this.settings?.providerSettings[this.settings.aiProvider]
                        ?.codeModel || "Unknown",
                });
            }
            catch { }
            return client.sendRequest("wingman/compose", {
                request,
            });
        };
        this.isRunning = () => client?.isRunning() ?? false;
        this.validate = async () => {
            const settings = await settings_1.wingmanSettings.loadSettings();
            try {
                let aiProvider = (0, models_1.CreateAIProvider)(settings, loggingProvider_1.loggingProvider);
                if (!(await aiProvider.validateSettings())) {
                    telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_AI_PROVIDER_VALIDATION_FAILED, {
                        aiProvider: settings.aiProvider,
                    });
                    throw new Error(`AI Provider: ${settings.aiProvider} is not configured correctly.`);
                }
                if (settings.embeddingSettings.General.enabled) {
                    aiProvider = (0, models_1.CreateEmbeddingProvider)(settings, loggingProvider_1.loggingProvider);
                    if (!(await aiProvider.validateEmbeddingSettings())) {
                        telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_AI_PROVIDER_VALIDATION_FAILED, {
                            aiProvider: settings.embeddingProvider,
                        });
                        throw new Error(`AI Embedding Provider: ${settings.embeddingProvider} is not configured correctly.`);
                    }
                }
                return true;
            }
            catch (e) {
                loggingProvider_1.loggingProvider.logError(e);
                throw e;
            }
        };
        this.fixDiagnostics = async (event) => {
            return client.sendRequest("wingman/fixDiagnostics", event);
        };
        this.clearChatHistory = async (activeThreadId) => {
            return client.sendRequest("wingman/clearChatHistory", activeThreadId);
        };
        this.updateComposerFile = async (event) => {
            return client.sendRequest("wingman/updateComposerFile", event);
        };
        this.updateCommand = async ({ command, threadId, }) => {
            return client.sendRequest("wingman/updateCommand", {
                command,
                threadId,
            });
        };
        this.branchThread = async ({ threadId, originalThreadId, }) => {
            return client.sendRequest("wingman/branchThread", {
                threadId,
                originalThreadId,
            });
        };
        this.loadThread = async (threadId) => {
            return client.sendRequest("wingman/getThreadById", threadId);
        };
        this.createThread = async (thread) => {
            return client.sendRequest("wingman/createThread", thread);
        };
        this.deleteThread = async (threadId) => {
            return client.sendRequest("wingman/deleteThread", threadId);
        };
        this.updateThread = async (thread) => {
            return client.sendRequest("wingman/updateThread", thread);
        };
        this.deleteIndex = async () => {
            return client.sendRequest("wingman/deleteIndex");
        };
        this.cancelComposer = async (threadId) => {
            return client.sendRequest("wingman/cancelComposer", threadId);
        };
        this.getIndexedFiles = async () => {
            return client.sendRequest("wingman/getIndexedFiles");
        };
        this.resyncIndex = async () => {
            return client.sendRequest("wingman/resyncIndex");
        };
        this.updateSettings = async () => {
            const settings = await settings_1.wingmanSettings.loadSettings();
            try {
                if (settings.embeddingSettings.General.enabled &&
                    !settings.embeddingSettings.General.globPattern) {
                    (0, globProvider_1.generateWorkspaceGlobPatterns)((0, models_1.CreateAIProvider)(settings, loggingProvider_1.loggingProvider), vscode.workspace.workspaceFolders[0].uri.fsPath)
                        .then(async (msg) => {
                        const settings = await settings_1.wingmanSettings.loadSettings();
                        const textContent = typeof msg === "string"
                            ? msg
                            : Array.isArray(msg.content)
                                ? msg.content.find((m) => m.type === "text").text
                                : msg.content;
                        await settings_1.wingmanSettings.saveSettings({
                            ...settings,
                            embeddingSettings: {
                                ...settings.embeddingSettings,
                                General: {
                                    enabled: settings.embeddingSettings.General.enabled,
                                    globPattern: textContent,
                                },
                            },
                        });
                        if (settings.embeddingSettings[settings.embeddingProvider]
                            ?.dimensions) {
                            this.fileWatcher = new fileWatcher_1.WingmanFileWatcher(this);
                            await this.fileWatcher.initialize(this.settings?.embeddingSettings.General.globPattern);
                        }
                    })
                        .catch((e) => {
                        loggingProvider_1.loggingProvider.logError(`Unable to generate glob patterns: ${e}`);
                    });
                }
                else if (settings.embeddingSettings.General.enabled &&
                    settings.embeddingSettings.General.globPattern) {
                    if (settings.embeddingSettings[settings.embeddingProvider]?.dimensions) {
                        if (!this.fileWatcher) {
                            this.fileWatcher = new fileWatcher_1.WingmanFileWatcher(this);
                            await this.fileWatcher.initialize(this.settings?.embeddingSettings.General.globPattern);
                        }
                    }
                }
            }
            catch (e) {
                loggingProvider_1.loggingProvider.logError(e);
            }
            return client.sendRequest("wingman/updateSettings");
        };
        this.deactivate = () => {
            if (!client) {
                return undefined;
            }
            if (this.fileWatcher) {
                this.fileWatcher.dispose();
            }
            return client.stop();
        };
    }
}
exports.LSPClient = LSPClient;
const lspClient = new LSPClient();
exports.default = lspClient;
//# sourceMappingURL=index.js.map