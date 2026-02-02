"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LMStudio = void 0;
const generic_1 = require("./models/generic");
const openai_1 = require("@langchain/openai");
class LMStudio {
    constructor(settings, interactionSettings, loggingProvider, embeddingSettings) {
        this.settings = settings;
        this.interactionSettings = interactionSettings;
        this.loggingProvider = loggingProvider;
        this.embeddingSettings = embeddingSettings;
        if (!settings) {
            throw new Error("Unable to load LMStudio settings.");
        }
        this.codeModel = this.getCodeModel(this.settings.codeModel);
    }
    async validateSettings() {
        if (!this.settings?.modelInfoPath.trim() ||
            !this.settings?.baseUrl.trim()) {
            throw new Error("LMStudio requires the base url and modelInfoPath configured.");
        }
        if (!(await this.validateModelExists(this.settings?.chatModel ?? "unknown"))) {
            return false;
        }
        if (!(await this.validateModelExists(this.settings?.codeModel ?? "unknown"))) {
            return false;
        }
        if (!this.codeModel)
            return false;
        return true;
    }
    async validateEmbeddingSettings() {
        if (this.embeddingSettings &&
            (!this.embeddingSettings.baseUrl ||
                !this.embeddingSettings.baseUrl.trim() ||
                !this.embeddingSettings.dimensions ||
                Number.isNaN(this.embeddingSettings.dimensions) ||
                this.embeddingSettings.dimensions <= 0 ||
                !this.embeddingSettings.model ||
                !this.embeddingSettings.model.trim() ||
                !this.embeddingSettings.summaryModel ||
                !this.embeddingSettings.summaryModel.trim())) {
            throw new Error("LMStudio embeddings are not configured properly.");
        }
        return true;
    }
    async validateModelExists(modelName) {
        try {
            const response = await fetch(new URL(this.settings?.modelInfoPath, this.settings?.baseUrl));
            if (!response.ok) {
                return false;
            }
            const models = (await response.json());
            const model = models.data.find((m) => m.id === modelName);
            if (!model) {
                this.loggingProvider.logError(`Model ${modelName} not found in LMStudio.`);
                return false;
            }
            if (response.status === 200) {
                return true;
            }
        }
        catch (error) {
            console.error(error);
        }
        return false;
    }
    getEmbedder() {
        return new openai_1.OpenAIEmbeddings({
            model: this.embeddingSettings?.model,
            configuration: {
                baseURL: this.embeddingSettings?.baseUrl,
            },
        });
    }
    getLightweightModel() {
        return new openai_1.OpenAI({
            model: this.embeddingSettings?.summaryModel,
            apiKey: "123",
            temperature: 0,
            maxTokens: this.interactionSettings.chatMaxTokens,
            configuration: {
                baseURL: this.embeddingSettings?.baseUrl,
            },
        });
    }
    getModel(params) {
        const targetModel = params?.model ?? this.settings?.chatModel;
        return new openai_1.ChatOpenAI({
            model: targetModel,
            apiKey: "123",
            temperature: 0,
            maxTokens: this.interactionSettings.chatMaxTokens,
            ...(params ?? {}),
            configuration: {
                baseURL: this.settings?.baseUrl,
            },
        });
    }
    getCodeModel(codeModel) {
        return new generic_1.LMStudioModel();
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
            this.loggingProvider.logError(`LMStudio code completion failed: ${error}`);
        }
        return "";
    }
}
exports.LMStudio = LMStudio;
//# sourceMappingURL=index.js.map