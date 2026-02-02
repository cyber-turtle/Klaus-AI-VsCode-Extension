"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuggingFace = void 0;
const generic_1 = require("./models/generic");
const hf_1 = require("@langchain/community/llms/hf");
class HuggingFace {
    constructor(settings, interactionSettings, loggingProvider) {
        this.settings = settings;
        this.interactionSettings = interactionSettings;
        this.loggingProvider = loggingProvider;
        if (!settings) {
            throw new Error("Unable to log HuggingFace configuration.");
        }
        if (!this.settings?.apiKey || !this.settings.apiKey.trim()) {
            throw new Error("Hugging Face API key is required.");
        }
        this.codeModel = this.getCodeModel(this.settings.codeModel);
    }
    getEmbedder() {
        throw new Error("Not Implemented");
    }
    async validateSettings() {
        return true;
    }
    getModel(params) {
        return new hf_1.HuggingFaceInference({
            model: this.settings?.chatModel,
            apiKey: this.settings?.apiKey,
            ...(params ?? {}),
        });
    }
    getLightweightModel() {
        return new hf_1.HuggingFaceInference({
            model: this.settings?.chatModel,
            apiKey: this.settings?.apiKey,
        });
    }
    getCodeModel(codeModel) {
        return new generic_1.GenericModel();
    }
    async codeComplete(beginning, ending, signal, additionalContext) {
        const startTime = new Date().getTime();
        const prompt = this.codeModel.CodeCompletionPrompt.replace("{beginning}", beginning)
            .replace("{ending}", ending)
            .replace("{context}", `The following are all the types available. Use these types while considering how to complete the code provided. Do not repeat or use these types in your answer.

${additionalContext ?? ""}`);
        this.loggingProvider.logInfo("HuggingFace - Code Completion started");
        let response;
        try {
            response = await this.getModel().invoke(prompt, {
                signal,
            });
        }
        catch (error) {
            return `HuggingFace - code completion request with model ${this.settings?.codeModel} failed with the following error: ${error}`;
        }
        const endTime = new Date().getTime();
        const executionTime = (endTime - startTime) / 1000;
        this.loggingProvider.logInfo(`Code Completion execution time: ${executionTime} seconds`);
        return response ?? "";
    }
}
exports.HuggingFace = HuggingFace;
//# sourceMappingURL=huggingface.js.map