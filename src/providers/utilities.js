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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveWorkspace = exports.replaceTextInDocument = exports.getNonce = exports.addNoneAttributeToLink = exports.extractCodeBlock = exports.isArrowFunction = exports.getSymbolsFromOpenFiles = exports.supportedLanguages = void 0;
const vscode = __importStar(require("vscode"));
exports.supportedLanguages = [
    { scheme: "file", language: "typescript" },
    { scheme: "file", language: "javascript" },
    { scheme: "file", language: "javascriptreact" },
    { scheme: "file", language: "typescriptreact" },
    { scheme: "file", language: "csharp" },
    { scheme: "file", language: "java" },
    { scheme: "file", language: "python" },
    { scheme: "file", language: "go" },
    { scheme: "file", language: "php" },
    { scheme: "file", language: "ruby" },
    { scheme: "file", language: "rust" },
    { scheme: "file", language: "css" },
    { scheme: "file", language: "markdown" },
    { scheme: "file", language: "sql" },
    { scheme: "file", language: "less" },
    { scheme: "file", language: "scss" },
    { scheme: "file", language: "html" },
    { scheme: "file", language: "json" },
    { scheme: "file", language: "jsonc" },
    { scheme: "file", language: "vue" },
    { scheme: "file", language: "vue-html" },
    { scheme: "file", language: "shellscript" },
    { scheme: "file", language: "sh" },
    { scheme: "file", language: "bash" },
    { scheme: "file", language: "dockerfile" },
    { scheme: "file", language: "yaml" },
    { scheme: "file", language: "json" },
    { scheme: "file", language: "xml" },
    { scheme: "file", language: "markdown" },
    { scheme: "file", language: "powershell" },
    { scheme: "file", language: "astro" },
    { scheme: "file", language: "svelte" },
    { scheme: "file", language: "dart" },
    { scheme: "file", language: "kotlin" },
    { scheme: "file", language: "swift" },
    { scheme: "file", language: "lua" },
    { scheme: "file", language: "graphql" },
    { scheme: "file", language: "toml" },
    { scheme: "file", language: "c" },
    { scheme: "file", language: "cpp" },
    { scheme: "file", language: "perl" },
    { scheme: "file", language: "razor" },
    { scheme: "file", language: "bat" },
    { scheme: "file", language: "plaintext" },
];
async function getSymbolsFromOpenFiles() {
    const openDocuments = vscode.workspace.textDocuments.filter((d) => d.uri.scheme === "file");
    const types = [];
    await Promise.all(openDocuments.map(async (d) => {
        const symbols = (await vscode.commands.executeCommand("vscode.executeDocumentSymbolProvider", d.uri));
        if (symbols) {
            await findMethod(symbols, d, types);
        }
    }));
    return types.join("\n");
}
exports.getSymbolsFromOpenFiles = getSymbolsFromOpenFiles;
function isArrowFunction(symbol, document) {
    const isProperty = symbol.kind === vscode.SymbolKind.Property ||
        symbol.kind === vscode.SymbolKind.Variable;
    if (!isProperty) {
        return false;
    }
    return (document
        .getText(new vscode.Range(symbol.range.start, symbol.range.end))
        .includes("=>") ||
        document.lineAt(symbol.range.start.line).text.includes("=>"));
}
exports.isArrowFunction = isArrowFunction;
async function findMethod(symbols, document, types, currentSymbol) {
    for (const symbol of symbols) {
        if (symbol.kind === vscode.SymbolKind.Class ||
            symbol.kind === vscode.SymbolKind.Interface) {
            const objName = await getHoverResultsForSymbol(symbol, document);
            const customSymbol = {
                name: symbol.name,
                value: objName,
            };
            await findMethod(symbol.children, document, types, customSymbol);
            types.push(formatSymbolAsString(customSymbol));
        }
        else if (symbol.kind === vscode.SymbolKind.Method ||
            symbol.kind === vscode.SymbolKind.Function ||
            symbol.kind === vscode.SymbolKind.Property ||
            isArrowFunction(symbol, document)) {
            const results = await getHoverResultsForSymbol(symbol, document);
            if (results) {
                if (currentSymbol) {
                    if (!currentSymbol.properties) {
                        currentSymbol.properties = [];
                    }
                    currentSymbol.properties.push(results);
                }
                else {
                    types.push(extractCodeBlock(results));
                }
            }
        }
    }
}
function formatSymbolAsString(customSymbol) {
    let result = `${extractCodeBlock(customSymbol.value)}\n`;
    for (const property of customSymbol.properties ?? []) {
        result += `${extractCodeBlock(property)}\n`;
    }
    return result;
}
async function getHoverResultsForSymbol(symbol, document) {
    const hover = (await vscode.commands.executeCommand("vscode.executeHoverProvider", document.uri, symbol.selectionRange.start));
    if (hover && hover.length > 0) {
        return hover[0].contents[0].value.replace("(loading...)", "");
    }
    return "";
}
function extractCodeBlock(text) {
    const regex = /```.*?\n([\s\S]*?)\n```/g;
    const matches = [];
    let match;
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while ((match = regex.exec(text)) !== null) {
        matches.push(match[1]);
    }
    return matches.length > 0 ? matches.join("\n") : text;
}
exports.extractCodeBlock = extractCodeBlock;
function addNoneAttributeToLink(htmlString, noneValue) {
    // Regular expression to match the link tag
    const linkRegex = /<link\s+(?:[^>]*?\s+)?href=["']https:\/\/file%2B\.vscode-resource\.vscode-cdn\.net\/[^"']*\.css["'][^>]*>/i;
    // Function to add the none attribute
    const addNoneAttribute = (match) => {
        if (match.includes("nonce=")) {
            // If none attribute already exists, return the original match
            return match;
        }
        // Add none attribute before the closing angle bracket
        return match.replace(/>$/, ` nonce="${noneValue}">`);
    };
    // Replace the matched link tag with the modified version
    return htmlString.replace(linkRegex, addNoneAttribute);
}
exports.addNoneAttributeToLink = addNoneAttributeToLink;
function getNonce() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
exports.getNonce = getNonce;
async function replaceTextInDocument(document, newContent, shouldSave = false) {
    // Create a range for the entire document
    const startPosition = new vscode.Position(0, 0);
    const endPosition = new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    const range = new vscode.Range(startPosition, endPosition);
    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, range, newContent);
    // Apply the edit to replace the entire content
    const success = await vscode.workspace.applyEdit(edit);
    if (success && shouldSave) {
        await document.save();
    }
}
exports.replaceTextInDocument = replaceTextInDocument;
function getActiveWorkspace() {
    const defaultWorkspace = "default";
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
        return (vscode.workspace.getWorkspaceFolder(activeEditor.document.uri)?.name ??
            defaultWorkspace);
    }
    return vscode.workspace.workspaceFolders?.[0].name ?? defaultWorkspace;
}
exports.getActiveWorkspace = getActiveWorkspace;
//# sourceMappingURL=utilities.js.map