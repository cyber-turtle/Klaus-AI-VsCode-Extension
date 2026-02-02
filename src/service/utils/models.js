"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEmbeddingProvider = exports.CreateAIProvider = void 0;
const huggingface_1 = require("../huggingface/huggingface");
const anthropic_1 = require("../anthropic");
const openai_1 = require("../openai");
const ollama_1 = require("../ollama");
const azure_1 = require("../azure");
const xai_1 = require("../xai");
const openrouter_1 = require("../openrouter");
const google_1 = require("../google");
const lmstudio_1 = require("../lmstudio");
function CreateAIProvider(settings, loggingProvider) {
    if (settings.aiProvider === "HuggingFace") {
        return new huggingface_1.HuggingFace(settings.providerSettings.HuggingFace, settings.interactionSettings, loggingProvider);
    }
    if (settings.aiProvider === "OpenAI") {
        return new openai_1.OpenAI(settings.providerSettings.OpenAI, settings.interactionSettings, loggingProvider);
    }
    if (settings.aiProvider === "Anthropic") {
        return new anthropic_1.Anthropic(settings.providerSettings.Anthropic, settings.interactionSettings, loggingProvider);
    }
    if (settings.aiProvider === "AzureAI") {
        return new azure_1.AzureAI(settings.providerSettings.AzureAI, settings.interactionSettings, loggingProvider);
    }
    if (settings.aiProvider === "xAI") {
        return new xai_1.xAI(settings.providerSettings.xAI, settings.interactionSettings, loggingProvider);
    }
    if (settings.aiProvider === "OpenRouter") {
        return new openrouter_1.OpenRouter(settings.providerSettings.OpenRouter, settings.interactionSettings, loggingProvider);
    }
    if (settings.aiProvider === "Google") {
        return new google_1.Google(settings.providerSettings.Google, settings.interactionSettings, loggingProvider);
    }
    if (settings.aiProvider === "LMStudio") {
        return new lmstudio_1.LMStudio(settings.providerSettings.LMStudio, settings.interactionSettings, loggingProvider);
    }
    return new ollama_1.Ollama(settings.providerSettings.Ollama, settings.interactionSettings, loggingProvider, settings.embeddingSettings.Ollama);
}
exports.CreateAIProvider = CreateAIProvider;
function CreateEmbeddingProvider(settings, loggingProvider) {
    if (settings.embeddingProvider === "OpenAI") {
        return new openai_1.OpenAI(settings.providerSettings.OpenAI, settings.interactionSettings, loggingProvider, settings.embeddingSettings.OpenAI);
    }
    if (settings.embeddingProvider === "AzureAI") {
        return new azure_1.AzureAI(settings.providerSettings.AzureAI, settings.interactionSettings, loggingProvider, settings.embeddingSettings.AzureAI);
    }
    if (settings.embeddingProvider === "OpenRouter") {
        return new openrouter_1.OpenRouter(settings.providerSettings.OpenRouter, settings.interactionSettings, loggingProvider, settings.embeddingSettings.OpenRouter);
    }
    if (settings.embeddingProvider === "Google") {
        return new google_1.Google(settings.providerSettings.Google, settings.interactionSettings, loggingProvider, settings.embeddingSettings.Google);
    }
    if (settings.embeddingProvider === "LMStudio") {
        return new lmstudio_1.LMStudio(settings.providerSettings.LMStudio, settings.interactionSettings, loggingProvider, settings.embeddingSettings.LMStudio);
    }
    return new ollama_1.Ollama(settings.providerSettings.Ollama, settings.interactionSettings, loggingProvider, settings.embeddingSettings.Ollama);
}
exports.CreateEmbeddingProvider = CreateEmbeddingProvider;
//# sourceMappingURL=models.js.map