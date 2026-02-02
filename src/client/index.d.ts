import * as vscode from "vscode";
import type { ExtensionContext } from "vscode";
import type { IndexFile, Settings } from "@shared/types/Settings";
import type { ComposerState } from "@shared/types/Composer";
import { WingmanFileWatcher } from "../providers/fileWatcher";
export declare class LSPClient {
    composerWebView: vscode.Webview | undefined;
    settings: Settings | undefined;
    fileWatcher: WingmanFileWatcher | undefined;
    activate: (context: ExtensionContext, settings: Settings | undefined) => Promise<void>;
    indexFiles: (indexFiles: Map<string, IndexFile>) => Promise<void>;
    removeFileFromIndex: (filePath: string) => Promise<void>;
    setComposerWebViewReference: (webview: vscode.Webview) => void;
    compose: (request: ComposerRequest) => Promise<ComposerResponse>;
    isRunning: () => boolean;
    validate: () => Promise<boolean>;
    fixDiagnostics: (event: FixDiagnosticsEvent) => Promise<ComposerResponse>;
    clearChatHistory: (activeThreadId: string) => Promise<unknown>;
    updateComposerFile: (event: UpdateComposerFileEvent) => Promise<ComposerState>;
    updateCommand: ({ command, threadId, }: UpdateCommandEvent) => Promise<ComposerState>;
    branchThread: ({ threadId, originalThreadId, }: {
        threadId: string;
        originalThreadId: string | undefined;
    }) => Promise<unknown>;
    loadThread: (threadId: string) => Promise<ComposerState>;
    createThread: (thread: ComposerThread) => Promise<unknown>;
    deleteThread: (threadId: string) => Promise<unknown>;
    updateThread: (thread: ComposerThread) => Promise<unknown>;
    deleteIndex: () => Promise<unknown>;
    cancelComposer: (threadId: string) => Promise<unknown>;
    getIndexedFiles: () => Promise<string[]>;
    resyncIndex: () => Promise<unknown>;
    updateSettings: () => Promise<unknown>;
    deactivate: () => Thenable<void> | undefined;
}
declare const lspClient: LSPClient;
export default lspClient;
//# sourceMappingURL=index.d.ts.map