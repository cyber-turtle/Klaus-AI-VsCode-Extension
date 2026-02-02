import { createConnection, TextDocuments } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { CodeParser } from "./files/parser";
import { type DiagnosticRetriever, type SymbolRetriever } from "./retriever";
import { WingmanAgent } from "../composer";
import { PartitionedFileSystemSaver } from "../composer/checkpointer";
import { VectorStore } from "./files/vector";
import type { Embeddings } from "@langchain/core/embeddings";
export type CustomRange = {
    start: {
        line: number;
        character: number;
    };
    end: {
        line: number;
        character: number;
    };
};
export type CustomSymbol = {
    name: string;
    kind: number;
    range: CustomRange;
    selectionRange: CustomRange;
    children: CustomSymbol[] | undefined;
};
export type DocumentQueueEvent = {
    uri: string;
    languageId: string;
    symbols: CustomSymbol[];
};
export type EmbeddingsResponse = {
    codeDocs: string[];
    projectDetails: string;
};
export declare class LSPServer {
    workspaceFolders: string[];
    codeParser: CodeParser | undefined;
    symbolRetriever: SymbolRetriever;
    diagnosticsRetriever: DiagnosticRetriever;
    documentQueue: TextDocument[];
    connection: ReturnType<typeof createConnection> | undefined;
    composer: WingmanAgent | undefined;
    documents: TextDocuments<TextDocument>;
    checkPointer: PartitionedFileSystemSaver | undefined;
    vectorStore: VectorStore | undefined;
    embedder: Embeddings | undefined;
    storagePath: string | undefined;
    constructor();
    private postInitialize;
    private getPersistancePath;
    private compose;
    private fixDiagnostics;
    private initialize;
    /**
     * Sets up event listeners and request handlers for the language server connection.
     *
     * This method initializes various event handlers for:
     * - Diagnostics reporting
     * - Configuration changes
     * - Workspace folder management
     * - Index management and querying
     * - Chat history management
     * - Code composition and file operations
     * - Web search functionality
     * - Embedding retrieval
     *
     * @private
     * @async
     * @returns {Promise<void>} A promise that resolves when all event handlers are registered
     */
    private addEvents;
}
declare const lsp: LSPServer;
export default lsp;
//# sourceMappingURL=index.d.ts.map