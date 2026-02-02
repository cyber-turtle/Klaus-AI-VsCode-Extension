import type { InteractionSettings, Settings } from "@shared/types/Settings";
import type { AIProvider, ModelParams } from "../base";
import type { ILoggingProvider } from "@shared/types/Logger";
import type { AzureAIModel } from "@shared/types/Models";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AzureChatOpenAI } from "@langchain/openai";
import type { Embeddings } from "@langchain/core/embeddings";
export declare class AzureAI implements AIProvider {
    private readonly settings;
    private readonly interactionSettings;
    private readonly loggingProvider;
    private readonly embeddingSettings?;
    codeModel: AzureAIModel | undefined;
    constructor(settings: Settings["providerSettings"]["AzureAI"], interactionSettings: InteractionSettings, loggingProvider: ILoggingProvider, embeddingSettings?: any);
    getEmbedder(): Embeddings;
    getModel(params?: ModelParams): BaseChatModel;
    getLightweightModel(): AzureChatOpenAI;
    validateEmbeddingSettings(): Promise<boolean>;
    validateSettings(): Promise<boolean>;
    private getCodeModel;
    codeComplete(beginning: string, ending: string, signal: AbortSignal, additionalContext?: string, recentClipboard?: string): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map