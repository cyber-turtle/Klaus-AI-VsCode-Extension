"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Google = void 0;
const generic_1 = require("./models/generic");
const google_genai_1 = require("@langchain/google-genai");
const google_genai_2 = require("@langchain/google-genai");
const genai_1 = require("@google/genai");
class Google {
    constructor(settings, interactionSettings, loggingProvider, embeddingSettings) {
        this.settings = settings;
        this.interactionSettings = interactionSettings;
        this.loggingProvider = loggingProvider;
        this.embeddingSettings = embeddingSettings;
        if (!settings) {
            throw new Error("Unable to load Google settings.");
        }
        this.codeModel = this.getCodeModel(this.settings.codeModel);
    }
    async generateImage(input) {
        const ai = new genai_1.GoogleGenAI({ apiKey: this.settings.apiKey });
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp-image-generation",
            contents: input,
            config: {
                responseModalities: ["Text", "Image"],
            },
        });
        if (!response.candidates?.length) {
            return undefined;
        }
        for (const part of response.candidates[0].content?.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        return undefined;
    }
    getEmbedder() {
        return new google_genai_2.GoogleGenerativeAIEmbeddings({
            apiKey: this.embeddingSettings?.apiKey,
            model: this.embeddingSettings?.model,
        });
    }
    getLightweightModel() {
        return new google_genai_1.ChatGoogleGenerativeAI({
            model: this.settings.chatModel,
            temperature: 0,
            maxRetries: 2,
            apiKey: this.settings.apiKey,
        });
    }
    getModel(params) {
        const targetModel = params?.model ?? this.settings?.chatModel;
        return new google_genai_1.ChatGoogleGenerativeAI({
            model: targetModel,
            temperature: 0,
            maxRetries: 2,
            streaming: params?.streaming ?? true,
            apiKey: this.settings.apiKey,
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
            throw new Error("Google AI Studio embeddings are not configured properly.");
        }
        return true;
    }
    async validateSettings() {
        if (!this.settings?.apiKey ||
            !this.settings.apiKey.trim() ||
            !this.settings?.baseUrl ||
            !this.settings.baseUrl.trim()) {
            throw new Error("Google AI Studio requires an api key and a base url.");
        }
        return true;
    }
    getCodeModel(codeModel) {
        return new generic_1.GoogleModel();
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
exports.Google = Google;
//# sourceMappingURL=index.js.map