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
exports.DiffViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const utilities_1 = require("./utilities");
const node_fs_1 = __importDefault(require("node:fs"));
class DiffViewProvider {
    constructor(_context, _lspClient) {
        this._context = _context;
        this._lspClient = _lspClient;
        this.panels = new Map();
    }
    /**
     * Creates a diff view panel for comparing file changes.
     *
     * This method creates a webview panel that displays differences between file versions.
     * If a panel for the specified file already exists, it will be brought to focus instead
     * of creating a new one.
     *
     * @param {Object} params - The parameters for creating the diff view
     * @param {Object} params.file - The file metadata for which to show the diff
     * @param {string} params.threadId - The ID of the thread associated with these changes
     * @param {string} params.toolId - The ID of the tool that generated the changes
     * @param {Function} params.onAccept - Callback function triggered when changes are accepted
     * @param {Function} params.onReject - Callback function triggered when changes are rejected
     * @returns {Promise<void>}
     */
    async createDiffView({ file, threadId, toolId, onAccept, onReject, }) {
        if (this.panels.has(file.path)) {
            const existingPanel = this.panels.get(file.path);
            existingPanel?.reveal(vscode.ViewColumn.One);
            return;
        }
        const currentPanel = vscode.window.createWebviewPanel("diffWebView", `${file.path} - Diff View`, vscode.ViewColumn.One, {
            enableScripts: true,
        });
        this.panels.set(file.path, currentPanel);
        currentPanel.webview.html = await getWebViewHtml(this._context, currentPanel.webview);
        currentPanel.onDidDispose(() => {
            this.panels.delete(file.path);
        });
        let showRevert = false;
        const diffFile = { ...file };
        if (file.accepted) {
            const fileUri = vscode.Uri.joinPath(vscode.Uri.parse(vscode.workspace.workspaceFolders[0].uri.fsPath), file.path);
            if (node_fs_1.default.existsSync(fileUri.fsPath)) {
                const code = diffFile.code;
                diffFile.code = diffFile.original;
                diffFile.original = code;
                showRevert = true;
            }
        }
        currentPanel.webview.onDidReceiveMessage(async (message) => {
            if (!message)
                return;
            const { command, value } = message;
            switch (command) {
                case "webviewLoaded": {
                    currentPanel.webview.postMessage({
                        command: "diff-file",
                        value: {
                            isDarkTheme: vscode.window.activeColorTheme.kind !== 1,
                            file: diffFile,
                            threadId,
                            toolId,
                            showRevert,
                        },
                    });
                    break;
                }
                case "accept-file-changes": {
                    await this.acceptFileChanges(currentPanel, file.path, diffFile);
                    onAccept({ files: [diffFile], threadId, toolId }, showRevert);
                    break;
                }
                case "reject-file-changes":
                    onReject({ files: [value], threadId, toolId });
                    if (currentPanel) {
                        currentPanel.dispose();
                        this.panels.delete(file.path);
                    }
                    break;
            }
        });
    }
    async acceptFileChanges(currentPanel, file, { path: artifactFile, code: markdown }) {
        const code = markdown?.startsWith("```")
            ? (0, utilities_1.extractCodeBlock)(markdown)
            : markdown;
        const relativeFilePath = vscode.workspace.asRelativePath(artifactFile);
        // Get the workspace folder URI
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0].uri;
        if (!workspaceFolder) {
            throw new Error("No workspace folder found");
        }
        // Construct the full URI of the file
        const fileUri = vscode.Uri.joinPath(workspaceFolder, relativeFilePath);
        try {
            // Check if the file exists
            await vscode.workspace.fs.stat(fileUri);
            // Check if the document is already open
            let document = vscode.workspace.textDocuments.find((doc) => doc.uri.toString() === fileUri.toString());
            if (!document) {
                // Open the text document if it is not already open
                document = await vscode.workspace.openTextDocument(fileUri);
            }
            // Replace text in the document
            await (0, utilities_1.replaceTextInDocument)(document, code, true);
        }
        catch (error) {
            if (error.code === "FileNotFound") {
                // Create the text document if it does not exist
                await vscode.workspace.fs.writeFile(fileUri, new Uint8Array());
                const document = await vscode.workspace.openTextDocument(fileUri);
                await (0, utilities_1.replaceTextInDocument)(document, code, true);
            }
            else {
                throw error;
            }
        }
        finally {
            if (currentPanel) {
                currentPanel.dispose();
                this.panels.delete(file);
            }
        }
    }
    dispose() {
        // biome-ignore lint/complexity/noForEach: <explanation>
        this.panels.forEach((panel) => panel.dispose());
    }
}
exports.DiffViewProvider = DiffViewProvider;
async function getWebViewHtml(context, webview) {
    const nonce = getNonce();
    const htmlUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "out", "views", "diff.html"));
    const htmlContent = (await vscode.workspace.fs.readFile(vscode.Uri.file(htmlUri.fsPath))).toString();
    // Replace placeholders in the HTML content
    const finalHtmlContent = htmlContent.replace(/CSP_NONCE_PLACEHOLDER/g, nonce);
    const prefix = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "out", "views"));
    const srcHrefRegex = /(src|href)="([^"]+)"/g;
    // Replace the matched filename with the prefixed filename
    const updatedHtmlContent = finalHtmlContent.replace(srcHrefRegex, (match, attribute, filename) => {
        const prefixedFilename = `${prefix}${filename}`;
        return `${attribute}="${prefixedFilename}"`;
    });
    return (0, utilities_1.addNoneAttributeToLink)(updatedHtmlContent, nonce).replace("</body>", `<script nonce="${nonce}">
(function() {
                    if (typeof vscode === 'undefined') {
                        window.vscode = acquireVsCodeApi();
                    }
                    window.addEventListener('load', () => {
                        window.vscode.postMessage({ command: 'webviewLoaded' });
                    });
                })();
            </script></body>`);
}
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=diffViewProvider.js.map