import type { createConnection, DocumentSymbol, Location } from "vscode-languageserver/node";
import type { Position } from "vscode-languageserver-textdocument";
import type { FileDiagnostic } from "@shared/types/Composer";
export type TypeRequestEvent = {
    uri: string;
    position: Position;
};
export interface DiagnosticRetriever {
    getFileDiagnostics(filePaths: string[]): Promise<FileDiagnostic[]>;
}
export interface SymbolRetriever {
    getSymbols(documentUri: string): Promise<DocumentSymbol[]>;
    getDefinition(documentUri: string, position: Position): Promise<Location[]>;
    getTypeDefinition(documentUri: string, position: Position): Promise<Location[]>;
}
export declare const createDiagnosticsRetriever: (connection: ReturnType<typeof createConnection>) => DiagnosticRetriever;
export declare const createSymbolRetriever: (connection: ReturnType<typeof createConnection>) => SymbolRetriever;
//# sourceMappingURL=retriever.d.ts.map