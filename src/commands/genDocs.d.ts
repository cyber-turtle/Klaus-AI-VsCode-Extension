import vscode from "vscode";
import type { AIProvider } from "../service/base";
export declare class GenDocs implements vscode.CodeActionProvider {
    private readonly _aiProvider;
    constructor(_aiProvider: AIProvider);
    provideCodeActions(document: vscode.TextDocument, range: vscode.Selection | vscode.Range): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]>;
    static readonly command = "wingmanai.gendocument";
    static generateDocs(document: vscode.TextDocument, aiProvider: AIProvider, editor: vscode.TextEditor): Thenable<void> | undefined;
    static findMethod(symbols: vscode.DocumentSymbol[], editor: vscode.TextEditor, position: vscode.Position, signal: AbortSignal, provider: AIProvider): Promise<boolean>;
    static genPythonDocs(editor: vscode.TextEditor, symbol: vscode.DocumentSymbol, code: string): void;
    static genJsDocs(editor: vscode.TextEditor, symbol: vscode.DocumentSymbol, code: string): void;
    static genCSharpDocs(editor: vscode.TextEditor, symbol: vscode.DocumentSymbol, code: string): void;
}
//# sourceMappingURL=genDocs.d.ts.map