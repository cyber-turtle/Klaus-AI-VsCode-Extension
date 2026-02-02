"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Anthropic = void 0;
const sonnet_1 = require("./models/sonnet");
const anthropic_1 = require("@langchain/anthropic");
const messages_1 = require("@langchain/core/messages");
const haiku_1 = require("./models/haiku");
const reasoningModels = ["claude-3-7-sonnet"];
class Anthropic {
    constructor(settings, interactionSettings, loggingProvider) {
        this.settings = settings;
        this.interactionSettings = interactionSettings;
        this.loggingProvider = loggingProvider;
        if (!settings) {
            throw new Error("Unable to load Anthropic settings.");
        }
        if (!this.settings?.apiKey || !this.settings.apiKey.trim()) {
            throw new Error("Anthropic API key is required.");
        }
        this.codeModel = this.getCodeModel(this.settings.codeModel);
    }
    async validateSettings() {
        const isChatModelValid = this.settings?.chatModel?.startsWith("claude") || false;
        const isCodeModelValid = this.settings?.codeModel?.startsWith("claude") || false;
        return isChatModelValid && isCodeModelValid;
    }
    async validateEmbeddingSettings() {
        return true;
    }
    getModel(params) {
        const targetModel = params?.model ?? this.settings?.chatModel;
        const isReasoningModel = reasoningModels.some((reasoningModel) => targetModel?.startsWith(reasoningModel));
        return new anthropic_1.ChatAnthropic({
            apiKey: this.settings?.apiKey,
            anthropicApiKey: this.settings?.apiKey,
            model: targetModel,
            temperature: this.settings?.enableReasoning ? undefined : 0,
            maxTokens: this.interactionSettings?.chatMaxTokens,
            clientOptions: {
                defaultHeaders: {
                    "anthropic-beta": "prompt-caching-2024-07-31",
                },
            },
            thinking: this.settings?.enableReasoning && isReasoningModel
                ? {
                    budget_tokens: 8096,
                    type: "enabled",
                }
                : undefined,
        });
    }
    getEmbedder() {
        throw new Error("Embeddings not supported");
    }
    getLightweightModel() {
        return new anthropic_1.ChatAnthropic({
            apiKey: this.settings?.apiKey,
            anthropicApiKey: this.settings?.apiKey,
            model: "claude-3-5-haiku-latest",
            temperature: 0,
        });
    }
    getCodeModel(codeModel) {
        switch (true) {
            case codeModel.includes("sonnet"):
                return new sonnet_1.SonnetModel();
            case codeModel.includes("haiku"):
                return new haiku_1.HaikuModel();
            default:
                throw new Error("Invalid code model name, currently code supports Claude 3 model(s).");
        }
    }
    async codeComplete(beginning, ending, signal, additionalContext, recentClipboard) {
        try {
            const response = await this.getModel({
                temperature: 0.2,
                model: this.settings?.codeModel,
            }).invoke([
                new messages_1.SystemMessage({
                    content: this.codeModel.CodeCompletionPrompt.replace("{context}", `The following are some of the types available in their file. 
	Use these types while considering how to complete the code provided. 
	Do not repeat or use these types in your answer.
	
	${additionalContext || ""}
	
	-----
	
	${recentClipboard
                        ? `The user recently copied these items to their clipboard, use them if they are relevant to the completion:
	
	${recentClipboard}
	
	-----`
                        : ""}`),
                }),
                new messages_1.HumanMessage({
                    content: `${beginning}[FILL IN THE MIDDLE]${ending}`,
                }),
            ], { signal });
            return response.content.toString();
        }
        catch (e) {
            if (e instanceof Error) {
                this.loggingProvider.logError(`Code Complete failed: ${e.message}`, !e.message.includes("AbortError"));
            }
        }
        return "";
    }
}
exports.Anthropic = Anthropic;
//# sourceMappingURL=index.js.map