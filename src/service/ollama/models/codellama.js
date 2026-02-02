"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeLlama = void 0;
const index_1 = require("../types/index");
class CodeLlama extends index_1.OllamaAIModel {
    get CodeCompletionPrompt() {
        return "<PRE> {beginning} <SUF> {ending} <MID>";
    }
}
exports.CodeLlama = CodeLlama;
//# sourceMappingURL=codellama.js.map