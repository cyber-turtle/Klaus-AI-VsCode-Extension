"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaAIModel = void 0;
const common_1 = require("../../common");
class OllamaAIModel {
    get CodeCompletionPrompt() {
        throw new Error("Method not implemented.");
    }
    get ChatPrompt() {
        return common_1.commonChatPrompt;
    }
    get genDocPrompt() {
        return common_1.commonDocPrompt;
    }
    get refactorPrompt() {
        return common_1.commonRefactorPrompt;
    }
}
exports.OllamaAIModel = OllamaAIModel;
//# sourceMappingURL=index.js.map