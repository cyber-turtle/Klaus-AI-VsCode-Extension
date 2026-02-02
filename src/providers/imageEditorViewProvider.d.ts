import * as vscode from "vscode";
import type { LSPClient } from "../client";
export declare class ImageEditorViewProvider {
    private readonly _context;
    private readonly _lspClient;
    private panel;
    constructor(_context: vscode.ExtensionContext, _lspClient: LSPClient);
    openEditor(): Promise<void>;
    dispose: () => void;
}
//# sourceMappingURL=imageEditorViewProvider.d.ts.map