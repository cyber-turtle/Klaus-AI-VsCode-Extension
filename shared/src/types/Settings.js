"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultSettings = exports.defaultAzureAISettings = exports.defaultAnthropicSettings = exports.defaultGoogleSettings = exports.defaultOpenRouterSettings = exports.defaultOpenAISettings = exports.defaultHfSettings = exports.defaultLMStudioSettings = exports.defaultOllamaSettings = exports.defaultxAISettings = exports.defaultAgentSettings = exports.defaultInteractionSettings = exports.EmbeddingProvidersList = exports.EmbeddingProviders = exports.AiProvidersList = exports.AiProviders = exports.defaultMaxTokens = void 0;
exports.defaultMaxTokens = -1;
exports.AiProviders = [
    "Ollama",
    "HuggingFace",
    "OpenAI",
    "Anthropic",
    "AzureAI",
    "xAI",
    "Google",
    "LMStudio",
    "OpenRouter",
];
exports.AiProvidersList = [...exports.AiProviders];
exports.EmbeddingProviders = [
    "Ollama",
    "OpenAI",
    "AzureAI",
    "Google",
    "LMStudio",
    "OpenRouter",
];
exports.EmbeddingProvidersList = [...exports.EmbeddingProviders];
exports.defaultInteractionSettings = {
    codeCompletionEnabled: true,
    codeContextWindow: 512,
    codeMaxTokens: 256,
    chatContextWindow: 4096,
    chatMaxTokens: 8192,
};
exports.defaultAgentSettings = {
    midsceneEnabled: false,
    automaticallyFixDiagnostics: false,
    vibeMode: true,
    playAudioAlert: false,
};
exports.defaultxAISettings = {
    codeModel: "grok-beta",
    chatModel: "grok-beta",
    baseUrl: "https://api.x.ai/v1",
    apiKey: "",
};
exports.defaultOllamaSettings = {
    codeModel: "deepseek-coder-v2:16b-lite-base-q4_0",
    chatModel: "deepseek-coder-v2:16b-lite-instruct-q4_0",
    baseUrl: "http://localhost:11434",
    apiPath: "/api/generate",
    modelInfoPath: "/api/show",
};
exports.defaultLMStudioSettings = {
    codeModel: "qwen2.5-coder-14b-instruct",
    chatModel: "qwen2.5-coder-14b-instruct",
    baseUrl: "http://localhost:1234/v1",
    apiPath: "/chat/completions",
    modelInfoPath: "/models",
};
exports.defaultHfSettings = {
    codeModel: "codellama/CodeLlama-7b-hf",
    chatModel: "mistralai/Mixtral-8x7B-Instruct-v0.1",
    baseUrl: "https://api-inference.huggingface.co/models/",
    apiKey: "",
};
exports.defaultOpenAISettings = {
    chatModel: "gpt-4o-2024-08-06",
    codeModel: "gpt-4o-2024-08-06",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    apiKey: "",
};
exports.defaultOpenRouterSettings = {
    chatModel: "deepseek/deepseek-v3-base:free",
    codeModel: "deepseek/deepseek-v3-base:free",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKey: "",
};
exports.defaultGoogleSettings = {
    chatModel: "gemini-2.5-pro-exp-03-25",
    codeModel: "gemini-2.5-pro-exp-03-25",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    apiKey: "",
};
exports.defaultAnthropicSettings = {
    chatModel: "claude-3-7-sonnet-latest",
    codeModel: "claude-3-5-haiku-latest",
    baseUrl: "https://api.anthropic.com/v1",
    apiKey: "",
};
exports.defaultAzureAISettings = {
    chatModel: "gpt-4o",
    codeModel: "gpt-4o",
    instanceName: "",
    apiKey: "",
    apiVersion: "2024-06-01",
};
exports.defaultSettings = {
    aiProvider: "Anthropic",
    interactionSettings: exports.defaultInteractionSettings,
    providerSettings: {
        Ollama: exports.defaultOllamaSettings,
        HuggingFace: exports.defaultHfSettings,
        Anthropic: exports.defaultAnthropicSettings,
        OpenAI: exports.defaultOpenAISettings,
        AzureAI: exports.defaultAzureAISettings,
        xAI: exports.defaultxAISettings,
        OpenRouter: exports.defaultOpenRouterSettings,
        LMStudio: exports.defaultLMStudioSettings,
        Google: exports.defaultGoogleSettings,
    },
    embeddingProvider: "OpenAI",
    embeddingSettings: {
        General: {
            enabled: true,
            globPattern: "",
        },
        Ollama: {
            ...exports.defaultOllamaSettings,
            model: "nomic-embed-text",
            summaryModel: "",
            dimensions: 768,
        },
        OpenAI: {
            ...exports.defaultOpenAISettings,
            model: "text-embedding-3-small",
            summaryModel: "gpt-4o-mini",
            dimensions: 1536,
        },
        AzureAI: {
            ...exports.defaultAzureAISettings,
            model: "text-embedding-3-small",
            summaryModel: "gpt-4o-mini",
            dimensions: 1536,
        },
        OpenRouter: {
            ...exports.defaultOpenRouterSettings,
            model: "nomic-embed-text",
            summaryModel: "",
            dimensions: 768,
        },
        LMStudio: {
            ...exports.defaultLMStudioSettings,
            model: "nomic-embed-text",
            summaryModel: "",
            dimensions: 768,
        },
        Google: {
            ...exports.defaultGoogleSettings,
            model: "gemini-embedding-exp-03-07",
            summaryModel: "gemini-2.0-flash",
            dimensions: 3072,
        },
    },
    agentSettings: exports.defaultAgentSettings,
};
//# sourceMappingURL=Settings.js.map