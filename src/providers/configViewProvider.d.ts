import * as vscode from "vscode";
import type { LSPClient } from "../client";
export declare class ConfigViewProvider implements vscode.WebviewViewProvider {
    private readonly _extensionUri;
    private readonly workspace;
    private readonly _lspClient;
    private readonly context;
    static readonly viewType = "wingman.configview";
    static readonly showConfigCommand = "wingmanai.openconfig";
    private _mcpAdapter;
    private _view?;
    private _disposables;
    constructor(_extensionUri: vscode.Uri, workspace: string, _lspClient: LSPClient, context: vscode.ExtensionContext);
    private createPanel;
    openInPanel(): void;
    getToolsFromAdapter(): Promise<Map<string, MCPTool[]>>;
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void>;
    private init;
    private loadOllamaModels;
    private loadLMStudioModels;
    private _getSimpleViewHtml;
    private _getHtml;
    private getNonce;
    dispose(): void;
}
//# sourceMappingURL=configViewProvider.d.ts.map