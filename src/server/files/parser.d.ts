import { type DocumentSymbol, Location } from "vscode-languageserver";
import type { TextDocument } from "vscode-languageserver-textdocument";
import type { SgNode } from "@ast-grep/napi";
import type { SymbolRetriever } from "../retriever";
export type CodeGraphNode = {
    id: string;
    location: Location;
    parentNodeId?: string;
};
export type SkeletonizedCodeGraphNode = {
    skeleton: string;
} & CodeGraphNode;
export type CodeGraphEdgeMap = Map<string, Set<string>>;
export declare class CodeParser {
    private readonly workspace;
    private readonly symbolRetriever;
    private js;
    constructor(workspace: string, symbolRetriever: SymbolRetriever);
    initialize(): Promise<void>;
    getDocumentSymbols(textDocumentUri: string): Promise<DocumentSymbol[]>;
    processSymbol(textDocument: TextDocument, symbol: DocumentSymbol): Promise<{
        node: CodeGraphNode;
        extractedCodeNodes: CodeGraphNode[];
    }>;
    processChildSymbols(textDocument: TextDocument, parentCodeNode: CodeGraphNode, parentSymbol: DocumentSymbol, importEdges: CodeGraphEdgeMap, exportEdges: CodeGraphEdgeMap): Promise<CodeGraphNode[]>;
    mergeCodeNodeSummariesIntoParent(parentNodeLocation: Location, parentCodeBlock: string, relatedNodeEdgeIds: string[], skeletonNodes: SkeletonizedCodeGraphNode[]): string;
    private replaceLineRange;
    private extractExternalCodeNodes;
    private findReferencedSymbols;
    findImportStatements(codeBlock: string): SgNode[];
    createNodesFromDocument: (textDocument: TextDocument) => Promise<{
        nodes: Map<string, CodeGraphNode>;
        importEdges: CodeGraphEdgeMap;
        exportEdges: CodeGraphEdgeMap;
    }>;
    convertNodeId(id: string): string;
    retrieveCodeByPathAndRange(path: string, startLine: number, startCharacter: number, endLine: number, endCharacter: number): Promise<string | undefined>;
}
export declare function generateCodeNodeId(location: Location): string;
export declare function createCodeNode(location: Location): CodeGraphNode;
export declare const isMethod: (symbol: DocumentSymbol) => boolean;
//# sourceMappingURL=parser.d.ts.map