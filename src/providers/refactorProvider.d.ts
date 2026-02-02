import * as vscode from "vscode";
import type { AIProvider } from "../service/base";
export declare class RefactorProvider implements vscode.CodeActionProvider {
    static readonly command = "wingmanai.refactorcode";
    static readonly selector: vscode.DocumentSelector;
    static readonly providedCodeActionKinds: vscode.CodeActionKind[];
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): Promise<vscode.CodeAction[]>;
    static refactorCode(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, aiProvider: AIProvider, editor: vscode.TextEditor): Thenable<void>;
}
//# sourceMappingURL=refactorProvider.d.ts.map