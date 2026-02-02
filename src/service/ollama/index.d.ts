import type { OllamaAIModel } from "./types";
import type { InteractionSettings, Settings } from "@shared/types/Settings";
import type { AIProvider, ModelParams } from "../base";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { ILoggingProvider } from "@shared/types/Logger";
import type { Embeddings } from "@langchain/core/embeddings";
export declare class Ollama implements AIProvider {
    private readonly settings;
    private readonly loggingProvider;
    private readonly embeddingSettings;
    codeModel: OllamaAIModel | undefined;
    interactionSettings: InteractionSettings | undefined;
    constructor(settings: Settings["providerSettings"]["Ollama"], interactionSettings: InteractionSettings, loggingProvider: ILoggingProvider, embeddingSettings: Settings["embeddingSettings"]["Ollama"]);
    getEmbedder(): Embeddings;
    getModel(params?: ModelParams): BaseChatModel;
    getLightweightModel(): BaseChatModel;
    validateEmbeddingSettings(): Promise<boolean>;
    validateSettings(): Promise<boolean>;
    private getCodeModel;
    private fetchModelResponse;
    validateModelExists(modelName: string): Promise<boolean>;
    codeComplete(beginning: string, ending: string, signal: AbortSignal, additionalContext?: string, recentClipboard?: string): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map