"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Codestral = void 0;
const index_1 = require("../types/index");
class Codestral extends index_1.OllamaAIModel {
    get CodeCompletionPrompt() {
        return "[SUFFIX]{ending}[PREFIX]{beginning}";
    }
}
exports.Codestral = Codestral;
//# sourceMappingURL=codestral.js.map