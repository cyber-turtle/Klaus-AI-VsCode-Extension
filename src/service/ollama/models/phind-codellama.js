"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhindCodeLlama = void 0;
const index_1 = require("../types/index");
class PhindCodeLlama extends index_1.OllamaAIModel {
    get CodeCompletionPrompt() {
        return `<PRE> {beginning} <SUF> {ending} <MID>`;
    }
}
exports.PhindCodeLlama = PhindCodeLlama;
//# sourceMappingURL=phind-codellama.js.map