"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMethod = exports.createCodeNode = exports.generateCodeNodeId = exports.CodeParser = void 0;
const vscode_languageserver_1 = require("vscode-languageserver");
const utils_1 = require("./utils");
const node_url_1 = require("node:url");
const node_path_1 = __importDefault(require("node:path"));
async function loadAstGrepBinding() {
    try {
        const { js } = await Promise.resolve().then(() => __importStar(require("@ast-grep/napi")));
        if (!js) {
            console.error("js is undefined after importing @ast-grep/napi");
        }
        return js;
    }
    catch (error) {
        console.error("Error importing @ast-grep/napi:", error);
        throw error;
    }
}
class CodeParser {
    constructor(workspace, symbolRetriever) {
        this.workspace = workspace;
        this.symbolRetriever = symbolRetriever;
        this.createNodesFromDocument = async (textDocument) => {
            const importEdges = new Map();
            const exportEdges = new Map();
            const nodes = new Map();
            const symbols = await this.symbolRetriever.getSymbols(textDocument.uri);
            const documentText = textDocument.getText();
            if (symbols.length === 0) {
                // calculate the last line and last character of the document
                const lastLine = textDocument.lineCount - 1;
                const lastCharacter = documentText.split("\n")?.pop()?.length || 0;
                const node = createCodeNode(vscode_languageserver_1.Location.create(textDocument.uri, vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(0, 0), vscode_languageserver_1.Position.create(lastLine, lastCharacter))));
                nodes.set(node.id, node);
                return { nodes, importEdges, exportEdges };
            }
            for (const symbol of symbols) {
                const { node, extractedCodeNodes } = await this.processSymbol(textDocument, symbol);
                nodes.set(node.id, node);
                for (const extractedCodeNode of extractedCodeNodes) {
                    nodes.set(extractedCodeNode.id, extractedCodeNode);
                    if (node.id !== extractedCodeNode.id) {
                        const convertedNodeId = this.convertNodeId(node.id);
                        const convertedExtractedId = this.convertNodeId(extractedCodeNode.id);
                        if (importEdges.has(convertedNodeId)) {
                            importEdges.get(convertedNodeId)?.add(convertedExtractedId);
                        }
                        else {
                            importEdges.set(convertedNodeId, new Set().add(convertedExtractedId));
                        }
                        if (exportEdges.has(convertedExtractedId)) {
                            exportEdges.get(convertedExtractedId)?.add(convertedNodeId);
                        }
                        else {
                            exportEdges.set(convertedExtractedId, new Set().add(convertedNodeId));
                        }
                    }
                }
                const childNodes = await this.processChildSymbols(textDocument, node, symbol, importEdges, exportEdges);
                for (const childNode of childNodes) {
                    nodes.set(childNode.id, childNode);
                }
            }
            return {
                nodes,
                importEdges,
                exportEdges,
            };
        };
    }
    async initialize() {
        this.js = await loadAstGrepBinding();
    }
    async getDocumentSymbols(textDocumentUri) {
        return this.symbolRetriever.getSymbols(textDocumentUri);
    }
    async processSymbol(textDocument, symbol) {
        const symbolText = textDocument.getText(symbol.range);
        const node = createCodeNode(vscode_languageserver_1.Location.create(textDocument.uri, symbol.range));
        const referencedSymbols = this.findReferencedSymbols(symbolText);
        const extractedCodeNodes = await this.extractExternalCodeNodes(textDocument, symbol.selectionRange, referencedSymbols ?? []);
        return {
            node,
            extractedCodeNodes,
        };
    }
    async processChildSymbols(textDocument, parentCodeNode, parentSymbol, importEdges, exportEdges) {
        const nodes = [];
        if (!parentSymbol.children) {
            return nodes;
        }
        for await (const child of parentSymbol.children) {
            if (!(0, exports.isMethod)(child)) {
                continue;
            }
            const { node: childNode, extractedCodeNodes } = await this.processSymbol(textDocument, child);
            childNode.parentNodeId = parentCodeNode.id;
            nodes.push(childNode);
            for (const extractedCodeNode of extractedCodeNodes) {
                nodes.push(extractedCodeNode);
                if (childNode.id !== extractedCodeNode.id) {
                    if (importEdges.has(childNode.id)) {
                        importEdges.get(childNode.id)?.add(extractedCodeNode.id);
                    }
                    else {
                        importEdges.set(childNode.id, new Set().add(extractedCodeNode.id));
                    }
                }
                if (extractedCodeNode.id !== childNode.id) {
                    if (exportEdges.has(extractedCodeNode.id)) {
                        exportEdges.get(extractedCodeNode.id)?.add(childNode.id);
                    }
                    else {
                        exportEdges.set(extractedCodeNode.id, new Set().add(childNode.id));
                    }
                }
            }
        }
        return nodes;
    }
    // This is not perfect, but it's a good start
    mergeCodeNodeSummariesIntoParent(parentNodeLocation, parentCodeBlock, relatedNodeEdgeIds, skeletonNodes) {
        let codeBlock = parentCodeBlock;
        for (const childNodeId of relatedNodeEdgeIds) {
            const childNode = skeletonNodes.find((n) => n.id === childNodeId);
            if (!childNode) {
                continue;
            }
            codeBlock = this.replaceLineRange(codeBlock, childNode.location.range.start.line -
                parentNodeLocation.range.start.line, childNode.location.range.end.line - parentNodeLocation.range.start.line, [childNode.skeleton]);
        }
        return codeBlock;
    }
    replaceLineRange(input, startLine, endLine, newLines) {
        const lines = input.split("\n");
        if (lines.length === 1) {
            lines.push(...newLines);
        }
        else {
            lines.splice(startLine, endLine - startLine + 1, ...newLines);
        }
        return lines.join("\n");
    }
    async extractExternalCodeNodes(textDocument, symbolDefRange, referencedSymbols) {
        const matchedSymbols = new Map();
        // Cache text documents to avoid reopening them
        const documentCache = new Map();
        // Helper function to get text document, with caching
        const getCachedDocument = async (uri) => {
            if (!documentCache.has(uri)) {
                const doc = await (0, utils_1.getTextDocumentFromUri)(uri);
                if (doc) {
                    documentCache.set(uri, doc);
                }
            }
            return documentCache.get(uri);
        };
        const matchesPromises = referencedSymbols.map(async (refSymbol) => {
            if (!refSymbol) {
                return [];
            }
            try {
                const refSymbolRange = refSymbol.range();
                const symbolPosition = vscode_languageserver_1.Position.create(symbolDefRange.start.line + refSymbolRange.start.line, refSymbolRange.start.column);
                const [def, typeDef] = await Promise.all([
                    this.symbolRetriever.getDefinition(textDocument.uri.toString(), symbolPosition),
                    this.symbolRetriever.getTypeDefinition(textDocument.uri.toString(), symbolPosition),
                ]);
                const matches = (0, utils_1.filterSystemLibraries)([
                    ...(def || []),
                    ...(typeDef || []),
                ]).filter((loc, index, self) => index ===
                    self.findIndex((t) => t.uri === loc.uri &&
                        t.range.start.line === loc.range.start.line) && loc.uri.startsWith("file://"));
                // .filter(
                // 	(loc) =>
                // 		!(
                // 			loc.uri === textDocument.uri &&
                // 			loc.range.start.line >=
                // 				symbolRange.start.line &&
                // 			loc.range.end.line <= symbolRange.end.line
                // 		)
                // );
                return matches;
            }
            catch (error) {
                console.error(error);
                return [];
            }
        });
        const allMatches = (await Promise.all(matchesPromises)).flat();
        for (const match of allMatches) {
            if (Array.from(matchedSymbols.values()).some((node) => match.range.start.line > node.location.range.start.line &&
                match.range.end.line < node.location.range.end.line)) {
                continue;
            }
            try {
                const matchDoc = match.uri !== textDocument.uri
                    ? await getCachedDocument(match.uri)
                    : textDocument;
                if (!matchDoc) {
                    continue;
                }
                const symbols = await this.symbolRetriever.getSymbols(matchDoc.uri);
                const matchedSymbol = symbols.find((s) => 
                //This is done explicitly to prevent keywords getting in the way (ex: export)
                s.selectionRange.start.line === match.range.start.line);
                if (matchedSymbol) {
                    const codeNode = createCodeNode(vscode_languageserver_1.Location.create(match.uri, matchedSymbol.range));
                    if (!matchedSymbols.has(codeNode.id)) {
                        matchedSymbols.set(codeNode.id, codeNode);
                    }
                }
            }
            catch (error) {
                console.error("Failed to process match", error);
            }
        }
        return Array.from(matchedSymbols.values());
    }
    findReferencedSymbols(codeBlock) {
        const ast = this.js?.parse(codeBlock);
        if (!ast)
            return;
        const root = ast.root();
        const stack = [root];
        const symbols = [];
        while (stack.length > 0) {
            const node = stack.pop();
            if (node === undefined) {
                continue;
            }
            const nodeKind = node.kind();
            const nodeText = node.text();
            if (codeBlock !== nodeText) {
                //Covers:
                //JS/TS Arrow functions
                if (nodeKind === "variable_declarator") {
                    symbols.push(node);
                }
                else if (nodeKind === "identifier") {
                    symbols.push(node);
                }
                else if (nodeKind === "expression_statement") {
                    symbols.push(node);
                }
                else if (nodeKind === "lexical_declaration") {
                    const nodeChildren = node.children();
                    if (nodeChildren.length >= 1) {
                        const subNodeChildren = nodeChildren[1].children();
                        if (subNodeChildren.length >= 2) {
                            symbols.push(subNodeChildren[2]);
                        }
                    }
                }
            }
            stack.push(...node.children());
        }
        return symbols;
    }
    findImportStatements(codeBlock) {
        const ast = this?.js?.parse(codeBlock);
        if (!ast)
            return [];
        const root = ast.root();
        const importPatterns = [
            "import { $A } from '$B'",
            "import $A from '$B'",
            'import { $A } from "$B"',
            'import $A from "$B"',
            "import * as $A from '$B'",
            'import * as $A from "$B"',
            "import '$B'",
            'import "$B"',
            "const $A = require('$B')",
            'const $A = require("$B")',
            "var $A = require('$B')",
            'var $A = require("$B")',
            "let $A = require('$B')",
            'let $A = require("$B")',
        ];
        const findImports = (root, patterns) => {
            return patterns.flatMap((pattern) => root.findAll(pattern));
        };
        const allImports = findImports(root, importPatterns);
        // Use a Map to ensure unique nodes based on their range
        const uniqueImportsMap = new Map();
        for (const node of allImports) {
            const range = node.range();
            const key = `${range.start.line}:${range.start.column}`;
            if (!uniqueImportsMap.has(key)) {
                uniqueImportsMap.set(key, node);
            }
        }
        return Array.from(uniqueImportsMap.values());
    }
    convertNodeId(id) {
        // Find the last occurrence of '-' followed by numbers (line/char)
        const uriEndIndex = id.search(/-\d+-\d+$/);
        if (uriEndIndex === -1) {
            // Handle cases where the ID might not have line/char (though it should based on generation)
            // Or maybe it's already just a path/URI? Log or handle appropriately.
            console.warn(`Could not parse URI from node ID: ${id}`);
            // Attempt conversion anyway, or return a default/error
            try {
                return node_path_1.default.relative(this.workspace, (0, node_url_1.fileURLToPath)(id));
            }
            catch {
                return id; // Fallback or further error handling
            }
        }
        const uri = id.substring(0, uriEndIndex);
        try {
            const filePath = (0, node_url_1.fileURLToPath)(uri);
            return node_path_1.default.relative(this.workspace, filePath);
        }
        catch (e) {
            console.error(`Error converting URI ${uri} from node ID ${id}:`, e);
            return id; // Fallback or further error handling
        }
    }
    async retrieveCodeByPathAndRange(path, startLine, startCharacter, endLine, endCharacter) {
        const textDocument = await (0, utils_1.getTextDocumentFromUri)((0, node_url_1.pathToFileURL)(path).toString());
        const codeBlock = textDocument?.getText(vscode_languageserver_1.Range.create(vscode_languageserver_1.Position.create(startLine, startCharacter), vscode_languageserver_1.Position.create(endLine, endCharacter)));
        return codeBlock;
    }
}
exports.CodeParser = CodeParser;
function generateCodeNodeId(location) {
    return `${location.uri}-${location.range.start.line}-${location.range.start.character}`;
}
exports.generateCodeNodeId = generateCodeNodeId;
function createCodeNode(location) {
    return {
        id: generateCodeNodeId(location),
        location,
    };
}
exports.createCodeNode = createCodeNode;
const isMethod = (symbol) => symbol.kind === vscode_languageserver_1.SymbolKind.Method ||
    symbol.kind === vscode_languageserver_1.SymbolKind.Function ||
    symbol.kind === vscode_languageserver_1.SymbolKind.Constructor;
exports.isMethod = isMethod;
//# sourceMappingURL=parser.js.map