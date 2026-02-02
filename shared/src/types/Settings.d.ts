import type { ComposerState } from "./Composer";
export declare const defaultMaxTokens = -1;
export type IndexFile = {
    lastModified: number;
};
export interface WorkspaceSettings {
    threadIds?: string[];
    activeThreadId?: string;
}
export interface MCPTool {
    name: string;
}
export interface AppState {
    settings: WorkspaceSettings;
    theme: number;
    workspaceFolder: string;
    totalFiles: number;
    threads?: ComposerState[];
    activeThreadId?: string;
}
interface BaseServiceSettings {
    chatModel: string;
    codeModel: string;
    baseUrl: string;
}
export interface AgentSettings {
    midsceneEnabled?: boolean;
    vibeMode?: boolean;
    automaticallyFixDiagnostics?: boolean;
    playAudioAlert?: boolean;
}
export interface InteractionSettings {
    codeCompletionEnabled: boolean;
    codeContextWindow: number;
    codeMaxTokens: number;
    chatContextWindow: number;
    chatMaxTokens: number;
}
export declare const AiProviders: readonly ["Ollama", "HuggingFace", "OpenAI", "Anthropic", "AzureAI", "xAI", "Google", "LMStudio", "OpenRouter"];
export declare const AiProvidersList: string[];
export declare const EmbeddingProviders: readonly ["Ollama", "OpenAI", "AzureAI", "Google", "LMStudio", "OpenRouter"];
export declare const EmbeddingProvidersList: string[];
export type AiProviders = (typeof AiProviders)[number];
export type EmbeddingProviders = (typeof EmbeddingProviders)[number];
export type ApiSettingsType = BaseServiceSettings & {
    apiKey: string;
};
export type OllamaSettingsType = BaseServiceSettings & {
    apiPath: string;
    modelInfoPath: string;
};
export type xAISettingsType = ApiSettingsType;
export type AnthropicSettingsType = {
    enableReasoning?: boolean;
    sparkMode?: boolean;
} & ApiSettingsType;
export type AzureAISettingsType = Omit<ApiSettingsType, "baseUrl"> & {
    apiVersion: string;
    instanceName: string;
};
export declare const defaultInteractionSettings: InteractionSettings;
export declare const defaultAgentSettings: AgentSettings;
export declare const defaultxAISettings: xAISettingsType;
export declare const defaultOllamaSettings: OllamaSettingsType;
export declare const defaultLMStudioSettings: OllamaSettingsType;
export declare const defaultHfSettings: ApiSettingsType;
export declare const defaultOpenAISettings: ApiSettingsType;
export declare const defaultOpenRouterSettings: ApiSettingsType;
export declare const defaultGoogleSettings: ApiSettingsType;
export declare const defaultAnthropicSettings: ApiSettingsType;
export declare const defaultAzureAISettings: AzureAISettingsType;
export type Settings = {
    aiProvider: (typeof AiProviders)[number];
    interactionSettings: InteractionSettings;
    providerSettings: {
        Ollama?: OllamaSettingsType;
        HuggingFace?: ApiSettingsType;
        OpenAI?: ApiSettingsType;
        Anthropic?: AnthropicSettingsType;
        AzureAI?: AzureAISettingsType;
        xAI?: xAISettingsType;
        OpenRouter?: ApiSettingsType;
        LMStudio?: OllamaSettingsType;
        Google: ApiSettingsType;
    };
    agentSettings: AgentSettings;
    embeddingProvider: (typeof EmbeddingProviders)[number];
    embeddingSettings: {
        General: {
            enabled: boolean;
            globPattern: string;
        };
        Ollama?: Omit<OllamaSettingsType, "chatModel" | "codeModel"> & {
            model: string;
            summaryModel: string;
            dimensions: number;
        };
        OpenAI?: Omit<ApiSettingsType, "chatModel" | "codeModel"> & {
            model: string;
            summaryModel: string;
            dimensions: number;
        };
        AzureAI?: Omit<AzureAISettingsType, "chatModel" | "codeModel"> & {
            model: string;
            summaryModel: string;
            dimensions: number;
        };
        OpenRouter?: Omit<ApiSettingsType, "chatModel" | "codeModel"> & {
            model: string;
            summaryModel: string;
            dimensions: number;
        };
        LMStudio?: Omit<OllamaSettingsType, "chatModel" | "codeModel"> & {
            model: string;
            summaryModel: string;
            dimensions: number;
        };
        Google?: Omit<ApiSettingsType, "chatModel" | "codeModel"> & {
            model: string;
            summaryModel: string;
            dimensions: number;
        };
    };
};
export type EmbeddingSettingsType = Settings["embeddingSettings"]["Ollama"] | Settings["embeddingSettings"]["AzureAI"] | Settings["embeddingSettings"]["OpenAI"] | Settings["embeddingSettings"]["OpenRouter"] | Settings["embeddingSettings"]["LMStudio"];
export declare const defaultSettings: Settings;
export {};
//# sourceMappingURL=Settings.d.ts.map