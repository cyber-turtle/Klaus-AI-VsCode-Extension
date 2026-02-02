import { type CancellationToken, type InlineCompletionContext, InlineCompletionItem, type InlineCompletionItemProvider, type Position, type TextDocument } from "vscode";
import type { Settings } from "@shared/types/Settings";
export declare class CodeSuggestionProvider implements InlineCompletionItemProvider {
    static readonly selector: import("vscode").DocumentSelector;
    provideInlineCompletionItems(document: TextDocument, position: Position, context: InlineCompletionContext, token: CancellationToken): Promise<InlineCompletionItem[]>;
    bouncedRequest(document: TextDocument, prefix: string, signal: AbortSignal, suffix: string, settings: Settings, additionalContext?: string): Promise<InlineCompletionItem[]>;
}
//# sourceMappingURL=codeSuggestionProvider.d.ts.map