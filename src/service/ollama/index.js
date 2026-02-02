"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ollama = void 0;
const codellama_1 = require("./models/codellama");
const codeqwen_1 = require("./models/codeqwen");
const codestral_1 = require("./models/codestral");
const deepseek_1 = require("./models/deepseek");
const magicoder_1 = require("./models/magicoder");
const ollama_1 = require("@langchain/ollama");
const qwen_1 = require("./models/qwen");
const phi_1 = require("./models/phi");
class Ollama {
    constructor(settings, interactionSettings, loggingProvider, embeddingSettings) {
        this.settings = settings;
        this.loggingProvider = loggingProvider;
        this.embeddingSettings = embeddingSettings;
        if (!settings) {
            throw new Error("Unable to load Ollama settings.");
        }
        this.codeModel = this.getCodeModel(this.settings.codeModel);
    }
    getEmbedder() {
        return new ollama_1.OllamaEmbeddings({
            baseUrl: this.embeddingSettings.baseUrl,
            model: this.embeddingSettings.model,
            maxRetries: 2,
        });
    }
    getModel(params) {
        return new ollama_1.ChatOllama({
            baseUrl: this.settings.baseUrl,
            model: this.settings.chatModel,
            temperature: 0,
            streaming: true,
            maxRetries: 2,
            ...(params ?? {}),
        });
    }
    getLightweightModel() {
        return new ollama_1.ChatOllama({
            baseUrl: this.embeddingSettings.baseUrl,
            model: this.embeddingSettings.summaryModel,
            temperature: 0,
            maxRetries: 2,
        });
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
            throw new Error("Ollama embeddings are not configured properly.");
        }
        return true;
    }
    async validateSettings() {
        if (!this.settings?.modelInfoPath.trim() ||
            !this.settings?.baseUrl.trim()) {
            throw new Error("Ollama requires the base url and modelInfoPath configured.");
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
    getCodeModel(codeModel) {
        if (!codeModel)
            return undefined;
        switch (true) {
            case codeModel.startsWith("phi4"):
                return new phi_1.Phi();
            case codeModel.startsWith("qwen"):
                return new qwen_1.Qwen();
            case codeModel.includes("magicoder"):
                return new magicoder_1.Magicoder();
            case codeModel.startsWith("codellama"):
                return new codellama_1.CodeLlama();
            case codeModel.startsWith("deepseek"):
                return new deepseek_1.Deepseek();
            case codeModel.startsWith("codeqwen"):
                return new codeqwen_1.CodeQwen();
            case codeModel.startsWith("codestral"):
                return new codestral_1.Codestral();
            default:
                return undefined;
        }
    }
    async fetchModelResponse(payload, signal) {
        if (signal.aborted) {
            return undefined;
        }
        return fetch(new URL(this.settings?.apiPath, this.settings?.baseUrl), {
            method: "POST",
            body: JSON.stringify(payload),
            signal,
        });
    }
    async validateModelExists(modelName) {
        try {
            const response = await fetch(new URL(this.settings?.modelInfoPath, this.settings?.baseUrl), {
                method: "POST",
                body: JSON.stringify({
                    name: modelName,
                }),
            });
            if (response.status === 200) {
                return true;
            }
        }
        catch (error) {
            console.error(error);
        }
        return false;
    }
    async codeComplete(beginning, ending, signal, additionalContext, recentClipboard) {
        const startTime = new Date().getTime();
        const prompt = this.codeModel.CodeCompletionPrompt.replace("{beginning}", beginning)
            .replace("{ending}", ending)
            .replace("{context}", `The following are all the types available. Use these types while considering how to complete the code provided. Do not repeat or use these types in your answer.

${additionalContext ?? ""}

-----

${recentClipboard
            ? `The user recently copied these items to their clipboard, use them if they are relevant to the completion:
  
${recentClipboard}

-----`
            : ""}`);
        const codeRequestOptions = {
            model: this.settings?.codeModel,
            prompt: prompt,
            stream: false,
            raw: true,
            options: {
                temperature: 0.6,
                num_predict: this.interactionSettings?.codeMaxTokens ?? -1,
                top_k: 30,
                top_p: 0.2,
                repeat_penalty: 1.1,
                stop: [
                    "<｜end▁of▁sentence｜>",
                    "<｜EOT｜>",
                    "\\n",
                    "</s>",
                    "<|eot_id|>",
                ],
            },
        };
        let response;
        try {
            response = await this.fetchModelResponse(codeRequestOptions, signal);
        }
        catch (error) {
            console.error(error);
        }
        const endTime = new Date().getTime();
        const executionTime = (endTime - startTime) / 1000;
        this.loggingProvider.logInfo(`Code Completion execution time: ${executionTime} seconds`);
        if (!response?.body) {
            return "";
        }
        const ollamaResponse = (await response.json());
        return ollamaResponse.response;
    }
}
exports.Ollama = Ollama;
//# sourceMappingURL=index.js.map