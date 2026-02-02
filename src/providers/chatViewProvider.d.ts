import * as vscode from "vscode";
import type { LSPClient } from "../client/index";
import type { DiffViewProvider } from "./diffViewProvider";
import type { Workspace } from "../service/workspace";
import type { ConfigViewProvider } from "./configViewProvider";
import type { ThreadViewProvider } from "./threadViewProvider";
export type ChatView = "composer" | "indexer";
export declare class ChatViewProvider implements vscode.WebviewViewProvider {
    private readonly _lspClient;
    private readonly _context;
    private readonly _diffViewProvider;
    private readonly _threadViewProvider;
    private readonly _workspace;
    private readonly _settingsViewProvider;
    static readonly viewType = "wingman.chatview";
    static readonly showComposerCommand = "wingmanai.opencomposer";
    private _disposables;
    private _webview;
    private _launchView;
    private _imageCanvas;
    constructor(_lspClient: LSPClient, _context: vscode.ExtensionContext, _diffViewProvider: DiffViewProvider, _threadViewProvider: ThreadViewProvider, _workspace: Workspace, _settingsViewProvider: ConfigViewProvider);
    dispose(): void;
    setLaunchView(view: ChatView): void;
    showView(view: ChatView): void;
    updateSettingsOnUI(): Promise<void>;
    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken): void;
    private saveImage;
    private undoFile;
    private acceptFile;
    private rejectFile;
    private acceptOrRejectCommand;
    private clearChatHistory;
    private getHtmlForWebview;
}
//# sourceMappingURL=chatViewProvider.d.ts.map