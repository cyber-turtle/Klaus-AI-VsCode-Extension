"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouter = void 0;
const generic_1 = require("./models/generic");
const openai_1 = require("@langchain/openai");
class OpenRouter {
    constructor(settings, interactionSettings, loggingProvider, embeddingSettings) {
        this.settings = settings;
        this.interactionSettings = interactionSettings;
        this.loggingProvider = loggingProvider;
        this.embeddingSettings = embeddingSettings;
        if (!settings) {
            throw new Error("Unable to load OpenRouter settings.");
        }
        this.codeModel = this.getCodeModel(this.settings.codeModel);
    }
    getEmbedder() {
        return new openai_1.OpenAIEmbeddings({
            apiKey: this.embeddingSettings?.apiKey,
            model: this.embeddingSettings?.model,
            openAIApiKey: this.embeddingSettings?.apiKey,
            configuration: {
                baseURL: this.settings?.baseUrl,
            },
        });
    }
    getLightweightModel() {
        return new openai_1.OpenAI({
            apiKey: this.embeddingSettings?.apiKey,
            model: this.embeddingSettings?.summaryModel,
            openAIApiKey: this.embeddingSettings?.apiKey,
            maxTokens: this.interactionSettings.chatMaxTokens,
            configuration: {
                baseURL: this.settings?.baseUrl,
            },
        });
    }
    getModel(params) {
        const targetModel = params?.model ?? this.settings?.chatModel;
        return new openai_1.ChatOpenAI({
            apiKey: this.settings?.apiKey,
            model: targetModel,
            openAIApiKey: this.settings?.apiKey,
            maxTokens: this.interactionSettings.chatMaxTokens,
            ...(params ?? {}),
            configuration: {
                baseURL: this.settings?.baseUrl,
            },
        });
    }
    async validateEmbeddingSettings() {
        if (this.embeddingSettings &&
            (!this.embeddingSettings.apiKey ||
                !this.embeddingSettings.baseUrl ||
                !this.embeddingSettings.apiKey.trim() ||
                !this.embeddingSettings.dimensions ||
                Number.isNaN(this.embeddingSettings.dimensions) ||
                this.embeddingSettings.dimensions <= 0 ||
                !this.embeddingSettings.model ||
                !this.embeddingSettings.model.trim() ||
                !this.embeddingSettings.summaryModel ||
                !this.embeddingSettings.summaryModel.trim())) {
            throw new Error("OpenRouter embeddings are not configured properly.");
        }
        return true;
    }
    async validateSettings() {
        if (!this.settings?.apiKey.trim() || !this.settings?.baseUrl.trim()) {
            throw new Error("OpenRouter requires an api key and a base url.");
        }
        return true;
    }
    getCodeModel(codeModel) {
        return new generic_1.OpenRouterModel();
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
exports.OpenRouter = OpenRouter;
//# sourceMappingURL=index.js.map