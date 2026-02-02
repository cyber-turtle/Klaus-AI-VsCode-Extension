import * as vscode from "vscode";
export declare class QuickFixProvider implements vscode.CodeActionProvider {
    static readonly selector: vscode.DocumentSelector;
    static readonly providedCodeActionKinds: vscode.CodeActionKind[];
    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]>;
}
//# sourceMappingURL=quickFixProvider.d.ts.map