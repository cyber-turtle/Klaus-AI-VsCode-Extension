import type { InteractionSettings, Settings } from "@shared/types/Settings";
import { OpenRouterModel } from "./models/generic";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { OpenAI } from "@langchain/openai";
import type { AIProvider, ModelParams } from "../base";
import type { ILoggingProvider } from "@shared/types/Logger";
import type { Embeddings } from "@langchain/core/embeddings";
export declare class OpenRouter implements AIProvider {
    private readonly settings;
    private readonly interactionSettings;
    private readonly loggingProvider;
    private readonly embeddingSettings?;
    codeModel: OpenRouterModel | undefined;
    constructor(settings: Settings["providerSettings"]["OpenRouter"], interactionSettings: InteractionSettings, loggingProvider: ILoggingProvider, embeddingSettings?: any);
    getEmbedder(): Embeddings;
    getLightweightModel(): OpenAI<import("@langchain/openai").OpenAICallOptions>;
    getModel(params?: ModelParams): BaseChatModel;
    validateEmbeddingSettings(): Promise<boolean>;
    validateSettings(): Promise<boolean>;
    private getCodeModel;
    codeComplete(beginning: string, ending: string, signal: AbortSignal, additionalContext?: string, recentClipboard?: string): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map