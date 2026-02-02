"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAI = void 0;
const gptmodel_1 = require("./models/gptmodel");
const openai_1 = require("@langchain/openai");
const reasoningModels = ["o3-mini"];
class OpenAI {
    constructor(settings, interactionSettings, loggingProvider, embeddingSettings) {
        this.settings = settings;
        this.interactionSettings = interactionSettings;
        this.loggingProvider = loggingProvider;
        this.embeddingSettings = embeddingSettings;
        if (!settings) {
            throw new Error("Unable to load OpenAI settings.");
        }
        this.codeModel = this.getCodeModel(this.settings.codeModel);
    }
    getEmbedder() {
        return new openai_1.OpenAIEmbeddings({
            apiKey: this.embeddingSettings?.apiKey,
            model: this.embeddingSettings?.model,
            openAIApiKey: this.embeddingSettings?.apiKey,
        });
    }
    getLightweightModel() {
        return new openai_1.ChatOpenAI({
            apiKey: this.embeddingSettings?.apiKey,
            model: this.embeddingSettings?.summaryModel,
            openAIApiKey: this.embeddingSettings?.apiKey,
        });
    }
    getModel(params) {
        const targetModel = params?.model ?? this.settings?.chatModel;
        const isReasoningModel = reasoningModels.some((reasoningModel) => targetModel?.startsWith(reasoningModel));
        return new openai_1.ChatOpenAI({
            apiKey: this.settings?.apiKey,
            model: targetModel,
            openAIApiKey: this.settings?.apiKey,
            reasoningEffort: isReasoningModel ? "medium" : undefined,
            ...(params ?? {}),
        });
    }
    async validateEmbeddingSettings() {
        if (this.embeddingSettings &&
            (!this.embeddingSettings.apiKey ||
                !this.embeddingSettings.apiKey.trim() ||
                !this.embeddingSettings.dimensions ||
                Number.isNaN(this.embeddingSettings.dimensions) ||
                this.embeddingSettings.dimensions <= 0 ||
                !this.embeddingSettings.model ||
                !this.embeddingSettings.model.trim() ||
                !this.embeddingSettings.summaryModel ||
                !this.embeddingSettings.summaryModel.trim())) {
            throw new Error("OpenAI embeddings are not configured properly.");
        }
        return true;
    }
    async validateSettings() {
        if (!this.settings?.apiKey || !this.settings.apiKey.trim()) {
            throw new Error("OpenAI API key is required.");
        }
        const isChatModelValid = this.settings?.chatModel?.startsWith("gpt-4") ||
            this.settings?.chatModel?.startsWith("o") ||
            false;
        const isCodeModelValid = this.settings?.codeModel?.startsWith("gpt-4") ||
            this.settings?.codeModel?.startsWith("o") ||
            false;
        return isChatModelValid && isCodeModelValid;
    }
    getCodeModel(codeModel) {
        return new gptmodel_1.GPTModel();
    }
    async codeComplete(beginning, ending, signal, additionalContext, recentClipboard) {
        const startTime = new Date().getTime();
        const prompt = this.codeModel.CodeCompletionPrompt.replace("{beginning}", beginning)
            .replace("{ending}", ending)
            .replace("{context}", `The following are some of the types available in their file. 
Use these types while considering how to complete the code provided. 
Do not repeat or use these types in your answer.

${additionalContext || ""}

-----

${recentClipboard
            ? `The user recently copied these items to their clipboard, use them if they are relevant to the completion:

${recentClipboard}

-----`
            : ""}`);
        try {
            const response = await this.getModel({
                temperature: 0.2,
                model: this.settings?.codeModel,
            }).invoke(prompt, { signal });
            return response.content.toString();
        }
        catch (error) {
            this.loggingProvider.logError(error);
        }
        return "";
    }
}
exports.OpenAI = OpenAI;
//# sourceMappingURL=index.js.map