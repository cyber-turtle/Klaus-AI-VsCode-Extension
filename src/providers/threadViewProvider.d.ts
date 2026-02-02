import * as vscode from "vscode";
import type { WorkspaceSettings } from "@shared/types/Settings";
import type { LSPClient } from "../client";
export declare class ThreadViewProvider {
    private readonly _context;
    private readonly _lspClient;
    private panel;
    constructor(_context: vscode.ExtensionContext, _lspClient: LSPClient);
    visualizeThreads(settings: WorkspaceSettings): Promise<void>;
    dispose: () => void;
}
//# sourceMappingURL=threadViewProvider.d.ts.map