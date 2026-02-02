"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenDocs = void 0;
const vscode_1 = __importDefault(require("vscode"));
const eventEmitter_1 = require("../events/eventEmitter");
const loggingProvider_1 = require("../providers/loggingProvider");
const extractFromCodeMd_1 = require("../service/extractFromCodeMd");
const langCheckers_1 = require("../service/langCheckers");
const utilities_1 = require("../providers/utilities");
const telemetryProvider_1 = require("../providers/telemetryProvider");
const common_1 = require("../service/common");
class GenDocs {
    constructor(_aiProvider) {
        this._aiProvider = _aiProvider;
    }
    provideCodeActions(document, range) {
        // only provide code actions for the languages that we support
        if (!(0, langCheckers_1.isTsRelated)(document.languageId) &&
            document.languageId !== "python" &&
            document.languageId !== "csharp") {
            return;
        }
        const codeAction = new vscode_1.default.CodeAction("✈️ Document using Wingman", vscode_1.default.CodeActionKind.QuickFix);
        codeAction.command = {
            command: GenDocs.command,
            title: "✈️ Document using Wingman",
            arguments: [document, this._aiProvider, vscode_1.default.window.activeTextEditor],
        };
        return [codeAction];
    }
    static generateDocs(document, aiProvider, editor) {
        if (!editor) {
            return;
        }
        const position = editor.selection.active; // Get the position of the cursor
        return vscode_1.default.window.withProgress({
            location: vscode_1.default.ProgressLocation.Window,
            title: "Generating docs...",
        }, async (process, token) => {
            const symbols = await vscode_1.default.commands.executeCommand("vscode.executeDocumentSymbolProvider", document.uri);
            if (!symbols) {
                return;
            }
            const abort = new AbortController();
            if (editor) {
                await GenDocs.findMethod(symbols, editor, position, abort.signal, aiProvider);
            }
        });
    }
    static async findMethod(symbols, editor, position, signal, provider) {
        for (const symbol of symbols) {
            if (signal.aborted) {
                return false;
            }
            if (symbol.kind === vscode_1.default.SymbolKind.Class &&
                symbol.range.contains(position)) {
                await GenDocs.findMethod(symbol.children, editor, position, signal, provider);
                return false;
            }
            if ((symbol.kind === vscode_1.default.SymbolKind.Method ||
                symbol.kind === vscode_1.default.SymbolKind.Function ||
                (0, utilities_1.isArrowFunction)(symbol, editor.document)) &&
                symbol.range.contains(position)) {
                const text = editor.document.getText(symbol.range);
                if (text && "genCodeDocs" in provider) {
                    eventEmitter_1.eventEmitter._onQueryStart.fire();
                    const model = provider.getModel();
                    const result = await model.invoke(`${common_1.commonDocPrompt}
Use the following file and extension to determine the appropriate language and documentation style such as jsdoc, etc.

File:
${vscode_1.default.window.activeTextEditor?.document.fileName}

Generate documentation for the following code:
${text}
`, {
                        signal,
                    });
                    eventEmitter_1.eventEmitter._onQueryComplete.fire();
                    telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_DOC_GEN);
                    const code = typeof result === "string" ? result : result.content.toString();
                    if (!code) {
                        loggingProvider_1.loggingProvider.logError(result);
                        vscode_1.default.window.showErrorMessage("Failed to generate docs");
                        return false;
                    }
                    if (editor.document.languageId === "python" && code.length) {
                        GenDocs.genPythonDocs(editor, symbol, code);
                    }
                    else if ((0, langCheckers_1.isTsRelated)(editor.document.languageId)) {
                        GenDocs.genJsDocs(editor, symbol, code);
                    }
                    else if (editor.document.languageId === "csharp") {
                        GenDocs.genCSharpDocs(editor, symbol, code);
                    }
                }
                return false;
            }
        }
        return true;
    }
    static genPythonDocs(editor, symbol, code) {
        const text = editor.document.getText(symbol.range);
        const signatureEnd = text.indexOf("\n");
        const signatureEndPosition = symbol.range.start.translate(0, signatureEnd);
        const firstLine = editor.document.lineAt(symbol.range.start.line).text;
        const docs = (0, extractFromCodeMd_1.extractStringDocs)(code);
        // get all the whitespaces for the first line
        const spaceMatch = firstLine.match(/^\s*/gm);
        if (spaceMatch?.length && docs.length) {
            const leadingWhitespace = spaceMatch[0] + spaceMatch[0];
            // Remove existing indentation from the comment
            const unindentedDocs = docs.replace(/^\s+/gm, "");
            // Prepend the leading whitespace to each line of the comment
            const indentedDocs = unindentedDocs
                .split("\n")
                .map((line) => leadingWhitespace + line)
                .join("\n");
            editor.edit((editBuilder) => {
                editBuilder.insert(signatureEndPosition, `\n${indentedDocs}`);
            });
        }
    }
    static genJsDocs(editor, symbol, code) {
        // get the space of the first line
        const firstLine = editor.document.lineAt(symbol.range.start.line).text;
        const spaceMatch = firstLine.match(/^\s*/gm);
        const docs = `${(0, extractFromCodeMd_1.extractJsDocs)(code)}\n`;
        if (spaceMatch?.length && docs.length) {
            const leadingWhitespace = spaceMatch[0];
            // need to remove all spaces and tabs from the start of the comment
            const unindentedDocs = docs.replace(/^\s+/gm, "");
            const indentedDocs = unindentedDocs
                .split("\n")
                .map((line) => leadingWhitespace + line)
                .join("\n");
            editor.edit((editBuilder) => {
                editBuilder.insert(symbol.range.start, indentedDocs.trimStart());
            });
        }
    }
    static genCSharpDocs(editor, symbol, code) {
        const docs = (0, extractFromCodeMd_1.extractCsharpDocs)(code);
        const firstLine = editor.document.lineAt(symbol.range.start.line).text;
        const spaceMatch = firstLine.match(/^\s*/gm);
        if (spaceMatch?.length && docs.length) {
            const leading = spaceMatch[0];
            const unindentedDocs = docs.replace(/^\s+/gm, "");
            const indentedDocs = unindentedDocs
                .split("\n")
                .map((line) => leading + line)
                .join("\n");
            editor.edit((editBuilder) => {
                editBuilder.insert(symbol.range.start, `${indentedDocs.trimStart()}\n${spaceMatch[0]}`);
            });
        }
    }
}
exports.GenDocs = GenDocs;
GenDocs.command = "wingmanai.gendocument";
//# sourceMappingURL=genDocs.js.map