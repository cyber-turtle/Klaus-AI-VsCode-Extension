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
exports.RefactorProvider = void 0;
const vscode = __importStar(require("vscode"));
const utilities_1 = require("./utilities");
const eventEmitter_1 = require("../events/eventEmitter");
const telemetryProvider_1 = require("./telemetryProvider");
const settings_1 = require("../service/settings");
const models_1 = require("../service/utils/models");
const loggingProvider_1 = require("./loggingProvider");
const common_1 = require("../service/common");
// biome-ignore lint/style/useConst: <explanation>
let abortController = new AbortController();
class RefactorProvider {
    async provideCodeActions(document, range, context, token) {
        if (context.triggerKind !== vscode.CodeActionTriggerKind.Invoke) {
            return [];
        }
        const codeAction = new vscode.CodeAction("✈️ Refactor using Wingman", vscode.CodeActionKind.Refactor);
        codeAction.edit = new vscode.WorkspaceEdit();
        codeAction.command = {
            command: RefactorProvider.command,
            title: "✈️ Refactor using Wingman",
            arguments: [
                document,
                range,
                (0, models_1.CreateAIProvider)(await settings_1.wingmanSettings.loadSettings(), loggingProvider_1.loggingProvider),
                vscode.window.activeTextEditor,
            ],
        };
        return [codeAction];
    }
    static refactorCode(document, range, aiProvider, editor) {
        return vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: "Refactoring...",
        }, async (process, token) => {
            if (token.isCancellationRequested && abortController) {
                abortController.abort();
            }
            eventEmitter_1.eventEmitter._onQueryStart.fire();
            const codeContextRange = new vscode.Range(range.start, range.end);
            const highlightedCode = document.getText(codeContextRange);
            const symbols = await (0, utilities_1.getSymbolsFromOpenFiles)();
            telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_REFACTOR);
            const model = aiProvider.getModel();
            const result = await model.invoke(`${common_1.commonRefactorPrompt}
${symbols
                ? `\nHere are the available types to use as a reference in answering questions, these may not be related to the code provided:
	
${symbols}`
                : ""}

Code to refactor:
\`\`\`${document.languageId}
${highlightedCode}
\`\`\``, {
                signal: abortController.signal,
            });
            const newCode = (0, utilities_1.extractCodeBlock)(result.content.toString());
            if (newCode) {
                editor?.edit((builder) => {
                    builder.replace(codeContextRange, newCode);
                });
            }
            eventEmitter_1.eventEmitter._onQueryComplete.fire();
        });
    }
}
exports.RefactorProvider = RefactorProvider;
RefactorProvider.command = "wingmanai.refactorcode";
RefactorProvider.selector = utilities_1.supportedLanguages;
RefactorProvider.providedCodeActionKinds = [
    vscode.CodeActionKind.Refactor,
];
//# sourceMappingURL=refactorProvider.js.map