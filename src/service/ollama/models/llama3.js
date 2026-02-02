"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Llama3 = void 0;
const index_1 = require("../types/index");
class Llama3 extends index_1.OllamaAIModel {
    get CodeCompletionPrompt() {
        return `<PRE> {beginning} <SUF> {ending} <MID>`;
    }
}
exports.Llama3 = Llama3;
//# sourceMappingURL=llama3.js.map