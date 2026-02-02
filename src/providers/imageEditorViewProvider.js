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
exports.ImageEditorViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const utilities_1 = require("./utilities");
const settings_1 = require("../service/settings");
const models_1 = require("../service/utils/models");
const loggingProvider_1 = require("./loggingProvider");
const node_fs_1 = __importDefault(require("node:fs"));
class ImageEditorViewProvider {
    constructor(_context, _lspClient) {
        this._context = _context;
        this._lspClient = _lspClient;
        this.dispose = () => {
            this.panel?.dispose();
        };
    }
    async openEditor() {
        if (this.panel) {
            this.panel.dispose();
        }
        this.panel = vscode.window.createWebviewPanel("imageEditorView", "Canvas", vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        this.panel.webview.html = await getWebViewHtml(this._context, this.panel.webview);
        this.panel.webview.onDidReceiveMessage(async (message) => {
            if (!message)
                return;
            const { command, value } = message;
            switch (command) {
                case "generate-image": {
                    const { imageData, instructions } = value;
                    try {
                        const settings = await settings_1.wingmanSettings.loadSettings();
                        const ai = (0, models_1.CreateAIProvider)(settings, loggingProvider_1.loggingProvider);
                        if (!ai.generateImage) {
                            break;
                        }
                        const contents = [{ text: instructions }];
                        if (imageData) {
                            contents.push({
                                //@ts-expect-error
                                inlineData: {
                                    mimeType: "image/png",
                                    data: imageData.split("data:image/png;base64,")[1],
                                },
                            });
                        }
                        this.panel?.webview.postMessage({
                            command: "image-result",
                            value: await ai.generateImage(contents),
                        });
                    }
                    catch (e) {
                        this.panel?.webview.postMessage({
                            command: "image-failure",
                            value: e.message,
                        });
                    }
                    break;
                }
                case "save-object-image": {
                    // Handle the save object as image request
                    if (!value)
                        break;
                    const base64Data = String(value);
                    try {
                        // Check if data URL prefix is present to extract mime type
                        let mimeType = "image/png"; // Default mime type
                        let base64Image = base64Data;
                        const dataUrlMatch = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
                        if (dataUrlMatch) {
                            mimeType = dataUrlMatch[1];
                            base64Image = dataUrlMatch[2];
                        }
                        else {
                            // If no data URL prefix, just remove it if it exists
                            base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
                        }
                        // Determine file extension from mime type
                        const extensionMap = {
                            "image/png": "png",
                            "image/jpeg": "jpg",
                            "image/jpg": "jpg",
                            "image/webp": "webp",
                            "image/gif": "gif",
                            "image/svg+xml": "svg",
                            "image/bmp": "bmp",
                        };
                        const extension = extensionMap[mimeType] || "png";
                        // Create a buffer from the base64 string
                        const imageBuffer = Buffer.from(base64Image, "base64");
                        // Get current workspace folder as default location
                        const workspaceFolders = vscode.workspace.workspaceFolders;
                        const defaultUri = workspaceFolders && workspaceFolders.length > 0
                            ? vscode.Uri.joinPath(workspaceFolders[0].uri, `image.${extension}`)
                            : vscode.Uri.file(`image.${extension}`);
                        // Show native save dialog
                        const result = await vscode.window.showSaveDialog({
                            defaultUri,
                            filters: {
                                Images: ["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp"],
                            },
                        });
                        if (result) {
                            // Write the file
                            node_fs_1.default.writeFileSync(result.fsPath, imageBuffer);
                            vscode.window.showInformationMessage(`Image saved to ${result.fsPath}`);
                        }
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to save image: ${error.message}`);
                    }
                    break;
                }
            }
        });
    }
}
exports.ImageEditorViewProvider = ImageEditorViewProvider;
async function getWebViewHtml(context, webview) {
    const nonce = getNonce();
    const htmlUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "out", "views", "image.html"));
    const htmlContent = (await vscode.workspace.fs.readFile(vscode.Uri.file(htmlUri.fsPath))).toString();
    // Replace placeholders in the HTML content
    const finalHtmlContent = htmlContent.replace(/CSP_NONCE_PLACEHOLDER/g, nonce);
    const prefix = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, "out", "views"));
    const srcHrefRegex = /(src|href)=\"([^\"]+)\"/g;
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
//# sourceMappingURL=imageEditorViewProvider.js.map