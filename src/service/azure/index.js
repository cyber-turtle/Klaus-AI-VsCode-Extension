"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureAI = void 0;
const messages_1 = require("@langchain/core/messages");
const openai_1 = require("@langchain/openai");
const gptmodel_1 = require("../openai/models/gptmodel");
const reasoningModels = ["o3-mini"];
class AzureAI {
    constructor(settings, interactionSettings, loggingProvider, embeddingSettings) {
        this.settings = settings;
        this.interactionSettings = interactionSettings;
        this.loggingProvider = loggingProvider;
        this.embeddingSettings = embeddingSettings;
        if (!settings) {
            throw new Error("Unable to load AzureAI settings.");
        }
        this.codeModel = this.getCodeModel(this.settings.codeModel);
    }
    getEmbedder() {
        return new openai_1.AzureOpenAIEmbeddings({
            apiKey: this.embeddingSettings?.apiKey,
            azureOpenAIApiKey: this.embeddingSettings?.apiKey,
            azureOpenAIApiInstanceName: this.embeddingSettings?.instanceName,
            model: this.embeddingSettings?.model,
            azureOpenAIApiDeploymentName: this.embeddingSettings?.model,
            openAIApiVersion: this.settings?.apiVersion,
            deploymentName: this.embeddingSettings?.model,
        });
    }
    getModel(params) {
        const targetModel = params?.model ?? this.settings?.chatModel;
        const isReasoningModel = reasoningModels.some((reasoningModel) => targetModel?.startsWith(reasoningModel));
        return new openai_1.AzureChatOpenAI({
            apiKey: this.settings?.apiKey,
            azureOpenAIApiKey: this.settings?.apiKey,
            azureOpenAIApiInstanceName: this.settings?.instanceName,
            model: targetModel,
            azureOpenAIApiDeploymentName: targetModel,
            openAIApiVersion: this.settings?.apiVersion,
            deploymentName: targetModel,
            reasoningEffort: isReasoningModel ? "medium" : undefined,
            ...(params ?? {}),
        });
    }
    getLightweightModel() {
        return new openai_1.AzureChatOpenAI({
            apiKey: this.embeddingSettings?.apiKey,
            azureOpenAIApiKey: this.embeddingSettings?.apiKey,
            azureOpenAIApiInstanceName: this.embeddingSettings?.instanceName,
            model: this.embeddingSettings?.summaryModel,
            azureOpenAIApiDeploymentName: this.embeddingSettings?.summaryModel,
            openAIApiVersion: this.embeddingSettings?.apiVersion,
            deploymentName: this.embeddingSettings?.summaryModel,
        });
    }
    async validateEmbeddingSettings() {
        if (this.embeddingSettings &&
            (!this.embeddingSettings.apiKey ||
                !this.embeddingSettings.apiKey.trim() ||
                !this.embeddingSettings.apiVersion ||
                !this.embeddingSettings.instanceName ||
                !this.embeddingSettings.model ||
                !this.embeddingSettings.model.trim() ||
                !this.embeddingSettings.summaryModel ||
                !this.embeddingSettings.summaryModel.trim())) {
            throw new Error("AzureAI embeddings are not configured properly.");
        }
        return true;
    }
    validateSettings() {
        if (!this.settings?.apiKey.trim() ||
            !this.settings?.apiVersion.trim() ||
            !this.settings?.instanceName.trim() ||
            !this.settings?.chatModel.trim() ||
            !this.settings?.codeModel.trim()) {
            throw new Error("AzureAI is not configured correctly, all field are required.");
        }
        const isChatModelValid = this.settings?.chatModel?.startsWith("gpt-4") ||
            this.settings?.chatModel?.startsWith("o") ||
            false;
        const isCodeModelValid = this.settings?.codeModel?.startsWith("gpt-4") ||
            this.settings?.codeModel?.startsWith("o") ||
            false;
        return Promise.resolve(isChatModelValid &&
            isCodeModelValid &&
            !!this.settings?.instanceName &&
            !!this.settings?.apiVersion);
    }
    getCodeModel(codeModel) {
        if (!codeModel) {
            return undefined;
        }
        switch (true) {
            case codeModel.startsWith("gpt-4") || codeModel.startsWith("o"):
                return new gptmodel_1.GPTModel();
        }
    }
    async codeComplete(beginning, ending, signal, additionalContext, recentClipboard) {
        const startTime = new Date().getTime();
        const prompt = this.codeModel.CodeCompletionPrompt.replace("{beginning}", beginning).replace("{ending}", ending);
        let response;
        try {
            response = await this.getModel({
                temperature: 0.2,
                model: this.settings?.codeModel,
            }).invoke([
                new messages_1.HumanMessage({
                    content: prompt.replace("{context}", `The following are some of the types available in their file. 
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
            ], {
                signal,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                this.loggingProvider.logError(`Code Complete failed: ${error.message}`);
            }
            return "";
        }
        const endTime = new Date().getTime();
        const executionTime = (endTime - startTime) / 1000;
        this.loggingProvider.logInfo(`Code Complete To First Token execution time: ${executionTime} ms`);
        return response.content.toString();
    }
}
exports.AzureAI = AzureAI;
//# sourceMappingURL=index.js.map