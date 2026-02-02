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
exports.ConfigViewProvider = void 0;
const vscode = __importStar(require("vscode"));
const node_fs_1 = __importDefault(require("node:fs"));
const utilities_1 = require("./utilities");
const settings_1 = require("../service/settings");
const mcpAdapter_1 = require("../composer/tools/mcpAdapter");
const loggingProvider_1 = require("./loggingProvider");
let panel;
class ConfigViewProvider {
    constructor(_extensionUri, workspace, _lspClient, context) {
        this._extensionUri = _extensionUri;
        this.workspace = workspace;
        this._lspClient = _lspClient;
        this.context = context;
        this._disposables = [];
        this.init = async (value) => {
            const initSettings = await settings_1.wingmanSettings.loadSettings();
            const settings = structuredClone(initSettings);
            //@ts-expect-error
            settings.ollamaModels = await this.loadOllamaModels(settings.providerSettings.Ollama?.baseUrl ?? "");
            return JSON.stringify(settings);
        };
        this.loadOllamaModels = async (url) => {
            if (!url) {
                return ["Failed to load."];
            }
            try {
                const modelsResponse = await fetch(new URL("/api/tags", url));
                const modelsJson = (await modelsResponse.json());
                return modelsJson.models.map((m) => m.name);
            }
            catch (e) {
                console.error(e);
                loggingProvider_1.loggingProvider.logError(e);
                return ["Failed to load."];
            }
        };
        this.loadLMStudioModels = async (url) => {
            if (!url) {
                return ["Failed to load."];
            }
            try {
                const modelsResponse = await fetch(url);
                const modelsJson = (await modelsResponse.json());
                return modelsJson.data.map((m) => m.id);
            }
            catch (e) {
                console.error(e);
                loggingProvider_1.loggingProvider.logError(e);
                return ["Failed to load."];
            }
        };
        this._getSimpleViewHtml = (webview) => {
            const nonce = this.getNonce();
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
    <title>Config View</title>
    <style nonce="${nonce}">
        button {
            padding: 8px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            cursor: pointer;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
  <div>
    <h3>Wingman</h3>
    <button id="open">Open Settings</button>
  </div>
    <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        document.getElementById('open').addEventListener('click', () => {
            vscode.postMessage({ command: 'openSettings' });
        });
    </script>
</body>
</html>`;
        };
        this._getHtml = (webview) => {
            const htmlUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "views", "config.html"));
            const nonce = this.getNonce();
            const htmlContent = node_fs_1.default.readFileSync(htmlUri.fsPath, "utf8");
            // Replace placeholders in the HTML content
            const finalHtmlContent = htmlContent.replace(/CSP_NONCE_PLACEHOLDER/g, nonce);
            const prefix = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, "out", "views"));
            const srcHrefRegex = /(src|href)="([^"]+)"/g;
            // Replace the matched filename with the prefixed filename
            const updatedHtmlContent = finalHtmlContent.replace(srcHrefRegex, (match, attribute, filename) => {
                const prefixedFilename = `${prefix}${filename}`;
                return `${attribute}="${prefixedFilename}"`;
            });
            return (0, utilities_1.addNoneAttributeToLink)(updatedHtmlContent, nonce);
        };
        this.getNonce = () => {
            let text = "";
            const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < 32; i++) {
                text += possible.charAt(Math.floor(Math.random() * possible.length));
            }
            return text;
        };
        this._mcpAdapter = new mcpAdapter_1.MCPAdapter(vscode.workspace.workspaceFolders
            ? vscode.workspace.workspaceFolders[0].uri.fsPath
            : this.workspace);
    }
    createPanel() {
        panel = vscode.window.createWebviewPanel("wingmanConfig", "Wingman Configuration", vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        });
        panel.webview.html = this._getHtml(panel.webview);
        return panel;
    }
    openInPanel() {
        if (panel) {
            panel.reveal();
            return;
        }
        const settingsPanel = this.createPanel();
        settingsPanel.onDidDispose(() => {
            panel = undefined;
            if (this._view) {
                this._view.webview.postMessage({ command: "panelClosed" });
            }
            if (this._mcpAdapter) {
                this._mcpAdapter.close();
            }
        });
        // Handle messages from the panel
        settingsPanel.webview.onDidReceiveMessage(async (data) => {
            if (!data) {
                return;
            }
            const { command, value } = data;
            switch (command) {
                case "init": {
                    const settings = await this.init(value);
                    let indexedFiles = [];
                    try {
                        indexedFiles = await this._lspClient.getIndexedFiles();
                    }
                    catch (e) {
                        console.error(e);
                    }
                    const mcpTools = await this.getToolsFromAdapter();
                    settingsPanel.webview.postMessage({
                        command,
                        value: {
                            settings: JSON.parse(settings),
                            theme: vscode.window.activeColorTheme.kind,
                            indexedFiles,
                            tools: Array.from(mcpTools.entries()),
                        },
                    });
                    break;
                }
                case "resync": {
                    try {
                        await this._lspClient.resyncIndex();
                    }
                    catch (e) {
                        console.error(e);
                    }
                    settingsPanel.webview.postMessage({
                        command: "files",
                        value: await this._lspClient.getIndexedFiles(),
                    });
                    break;
                }
                case "fetch-mcp": {
                    const mcpTools = await this.getToolsFromAdapter();
                    settingsPanel.webview.postMessage({
                        command: "tools",
                        value: Array.from(mcpTools),
                    });
                    break;
                }
                case "saveSettings":
                    await settings_1.wingmanSettings.saveSettings(value);
                    try {
                        const result = await this._lspClient.validate();
                        if (!result) {
                            throw new Error("Failed to validate settings for your AI Provider(s). Please confirm your settings are correct");
                        }
                        if (!this._lspClient.isRunning()) {
                            await this._lspClient.activate(this.context, await settings_1.wingmanSettings.loadSettings());
                        }
                        await this._lspClient.updateSettings();
                    }
                    catch (e) {
                        if (e instanceof Error) {
                            loggingProvider_1.loggingProvider.logError(e);
                            await settingsPanel.webview.postMessage({
                                command: "save-failed",
                            });
                            const result = await vscode.window.showErrorMessage(e.message, "Open Settings");
                            if (result === "Open Settings") {
                                await vscode.commands.executeCommand(ConfigViewProvider.showConfigCommand);
                            }
                            break;
                        }
                    }
                    settingsPanel.webview.postMessage({
                        command: "settingsSaved",
                    });
                    break;
                case "load-ollama-models": {
                    settingsPanel.webview.postMessage({
                        command: "ollama-models",
                        value: await this.loadOllamaModels(String(value)),
                    });
                    break;
                }
                case "load-lmstudio-models": {
                    const initSettings = await settings_1.wingmanSettings.loadSettings();
                    settingsPanel.webview.postMessage({
                        command: "lmstudio-models",
                        value: await this.loadLMStudioModels(new URL(initSettings.providerSettings.LMStudio?.modelInfoPath ?? "", String(value))),
                    });
                    break;
                }
            }
        });
    }
    async getToolsFromAdapter() {
        const mcpTools = new Map();
        try {
            await this._mcpAdapter.initialize();
            const results = await this._mcpAdapter.getTools();
            if (results) {
                for (const [server, tool] of Object.entries(results)) {
                    const mcpTool = {
                        name: tool.name,
                    };
                    if (mcpTools.has(server)) {
                        mcpTools.get(server)?.push(mcpTool);
                    }
                    else {
                        mcpTools.set(server, [mcpTool]);
                    }
                }
            }
        }
        catch (e) {
            console.error(e);
        }
        return mcpTools;
    }
    resolveWebviewView(webviewView, context, token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };
        webviewView.webview.html = this._getSimpleViewHtml(webviewView.webview);
        this._disposables.push(webviewView.webview.onDidReceiveMessage(async (data) => {
            if (!data) {
                return;
            }
            const { command, value } = data;
            switch (command) {
                case "openSettings":
                    this.openInPanel();
                    break;
            }
        }));
    }
    dispose() {
        // biome-ignore lint/complexity/noForEach: <explanation>
        this._disposables.forEach((d) => d.dispose());
        this._disposables = [];
    }
}
exports.ConfigViewProvider = ConfigViewProvider;
ConfigViewProvider.viewType = "wingman.configview";
ConfigViewProvider.showConfigCommand = "wingmanai.openconfig";
//# sourceMappingURL=configViewProvider.js.map