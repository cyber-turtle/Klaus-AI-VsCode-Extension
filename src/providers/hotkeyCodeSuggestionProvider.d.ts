import vscode from "vscode";
export declare class HotKeyCodeSuggestionProvider implements vscode.CompletionItemProvider {
    static provider: HotKeyCodeSuggestionProvider | null;
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, _: vscode.CompletionContext): Promise<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>>;
    static command: string;
    static showSuggestion(): Promise<void>;
}
//# sourceMappingURL=hotkeyCodeSuggestionProvider.d.ts.map