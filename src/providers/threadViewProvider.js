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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreadViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const utilities_1 = require("./utilities");
class ThreadViewProvider {
    constructor(_context, _lspClient) {
        this._context = _context;
        this._lspClient = _lspClient;
        this.dispose = () => {
            this.panel?.dispose();
        };
    }
    async visualizeThreads(settings) {
        if (this.panel) {
            this.panel.dispose();
        }
        this.panel = vscode.window.createWebviewPanel("threadWebView", "Threads", vscode.ViewColumn.One, {
            enableScripts: true,
        });
        this.panel.webview.html = await getWebViewHtml(this._context, this.panel.webview);
        const states = await Promise.all(settings.threadIds?.map((threadId) => {
            return this._lspClient.loadThread(threadId);
        }) ?? []);
        this.panel.webview.onDidReceiveMessage(async (message) => {
            if (!message)
                return;
            const { command, value } = message;
            switch (command) {
                case "webviewLoaded":
                    this.panel?.webview.postMessage({
                        command: "thread-data",
                        value: {
                            states: states?.filter((s) => !!s.title),
                            activeThreadId: settings.activeThreadId,
                        },
                    });
                    break;
            }
        });
    }
}
exports.ThreadViewProvider = ThreadViewProvider;
async function getWebViewHtml(context, webview) {
    const nonce = getNonce();
    const htmlUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "out", "views", "threads.html"));
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
//# sourceMappingURL=threadViewProvider.js.map