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
exports.HotKeyCodeSuggestionProvider = void 0;
const vscode_1 = __importStar(require("vscode"));
const eventEmitter_1 = require("../events/eventEmitter");
const contentWindow_1 = require("../service/utils/contentWindow");
const telemetryProvider_1 = require("./telemetryProvider");
const settings_1 = require("../service/settings");
const models_1 = require("../service/utils/models");
const loggingProvider_1 = require("./loggingProvider");
class HotKeyCodeSuggestionProvider {
    async provideCompletionItems(document, position, token, _) {
        const abort = new AbortController();
        token.onCancellationRequested(() => {
            try {
                abort.abort();
            }
            finally {
                eventEmitter_1.eventEmitter._onQueryComplete.fire();
            }
        });
        if (abort.signal.aborted) {
            return [];
        }
        try {
            const settings = await settings_1.wingmanSettings.loadSettings();
            const aiProvider = (0, models_1.CreateAIProvider)(settings, loggingProvider_1.loggingProvider);
            const [prefix, suffix] = (0, contentWindow_1.getContentWindow)(document, position, settings.interactionSettings.codeContextWindow);
            //get the biginning of the last line in prefix
            const lastLineStart = prefix.lastIndexOf("\n");
            // count the starting spaces in the last line
            const spaces = prefix.substring(lastLineStart + 1).search(/\S/) ?? 0;
            eventEmitter_1.eventEmitter._onQueryStart.fire();
            try {
                telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_CODE_COMPLETE_HOTKEY, {
                    language: document.languageId,
                    aiProvider: settings.aiProvider,
                    model: settings.providerSettings[settings.aiProvider]?.codeModel ||
                        "Unknown",
                });
            }
            catch { }
            const response = await aiProvider.codeComplete(prefix, suffix, abort.signal);
            const snippet = new vscode_1.default.SnippetString(response.replace(new RegExp(`\n[\\s]{${spaces}}`, "g"), "\n"));
            const item = new vscode_1.default.CompletionItem(response, vscode_1.default.CompletionItemKind.Snippet);
            item.insertText = snippet;
            return [item];
        }
        catch (error) {
            console.error(error);
            return [];
        }
        finally {
            eventEmitter_1.eventEmitter._onQueryComplete.fire();
        }
    }
    static async showSuggestion() {
        const editor = vscode_1.default.window.activeTextEditor;
        if (!editor || !HotKeyCodeSuggestionProvider.provider) {
            return;
        }
        const documnet = editor.document;
        const position = editor.selection.active;
        const token = new vscode_1.default.CancellationTokenSource().token;
        const context = {
            triggerKind: vscode_1.CompletionTriggerKind.Invoke,
            triggerCharacter: "ctrl+shift+space",
        };
        const items = await HotKeyCodeSuggestionProvider.provider.provideCompletionItems(documnet, position, token, context);
        if (!items || !Array.isArray(items)) {
            return;
        }
        if (!items.length) {
            return;
        }
        const quickPickItem = {
            label: "Code Suggestion",
            description: items[0].insertText.value,
        };
        const lines = quickPickItem.description.split("\n");
        const decoratorsForEachLine = lines.map((line, index) => {
            const range = new vscode_1.default.Range(position.translate(index, 0), position.translate(index, line.length));
            return [
                vscode_1.default.window.createTextEditorDecorationType({
                    after: {
                        color: new vscode_1.default.ThemeColor("editorSuggestWidget.foreground"),
                        contentText: line,
                    },
                }),
                range,
            ];
        });
        // add new lines to the editor
        editor.insertSnippet(new vscode_1.SnippetString("\n".repeat(lines.length)), position);
        // biome-ignore lint/complexity/noForEach: <explanation>
        decoratorsForEachLine.forEach(([decorator, range]) => {
            editor.setDecorations(decorator, [range]);
        });
        const selected = await vscode_1.default.window.showQuickPick([quickPickItem]);
        // remove the new lines from the editor
        const linesEnd = position.translate(lines.length, 0);
        const range = new vscode_1.default.Range(position, linesEnd);
        await editor.edit((editBuilder) => {
            editBuilder.delete(range);
        });
        if (selected) {
            const insertText = items[0].insertText;
            editor.insertSnippet(insertText, position);
        }
        // biome-ignore lint/complexity/noForEach: <explanation>
        decoratorsForEachLine.forEach(([decorator]) => {
            decorator.dispose();
        });
    }
}
exports.HotKeyCodeSuggestionProvider = HotKeyCodeSuggestionProvider;
HotKeyCodeSuggestionProvider.provider = null;
HotKeyCodeSuggestionProvider.command = "wingmanai.triggercodecomplete";
//# sourceMappingURL=hotkeyCodeSuggestionProvider.js.map