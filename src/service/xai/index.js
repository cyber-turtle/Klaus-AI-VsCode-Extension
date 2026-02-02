"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xAI = void 0;
const messages_1 = require("@langchain/core/messages");
const xai_1 = require("@langchain/xai");
const grokmodel_1 = require("./models/grokmodel");
class xAI {
    constructor(settings, interactionSettings, loggingProvider) {
        this.settings = settings;
        this.interactionSettings = interactionSettings;
        this.loggingProvider = loggingProvider;
        if (!settings) {
            throw new Error("Unable to load xAI settings.");
        }
        this.codeModel = this.getCodeModel(this.settings.codeModel);
    }
    getLightweightModel() {
        return new xai_1.ChatXAI({
            apiKey: this.settings?.apiKey,
            model: this.settings?.chatModel,
        });
    }
    getEmbedder() {
        throw new Error("Not supported.");
    }
    getModel(params) {
        const targetModel = params?.model ?? this.settings?.chatModel;
        return new xai_1.ChatXAI({
            apiKey: this.settings?.apiKey,
            model: targetModel,
            ...(params ?? {}),
        });
    }
    validateSettings() {
        if (!this.settings?.apiKey.trim()) {
            throw new Error("xAI API key is required.");
        }
        const isChatModelValid = this.settings?.chatModel?.startsWith("grok") || false;
        const isCodeModelValid = this.settings?.codeModel?.startsWith("grok") || false;
        return Promise.resolve(isChatModelValid && isCodeModelValid);
    }
    getCodeModel(codeModel) {
        switch (true) {
            case codeModel.startsWith("grok"):
                return new grokmodel_1.GrokModel();
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
exports.xAI = xAI;
//# sourceMappingURL=index.js.map