import * as vscode from "vscode";
export declare const supportedLanguages: vscode.DocumentSelector;
export declare function getSymbolsFromOpenFiles(): Promise<string>;
export declare function isArrowFunction(symbol: vscode.DocumentSymbol, document: vscode.TextDocument): boolean;
export declare function extractCodeBlock(text: string): string;
export declare function addNoneAttributeToLink(htmlString: string, noneValue: string): string;
export declare function getNonce(): string;
export declare function replaceTextInDocument(document: vscode.TextDocument, newContent: string, shouldSave?: boolean): Promise<void>;
export declare function getActiveWorkspace(): string;
//# sourceMappingURL=utilities.d.ts.map