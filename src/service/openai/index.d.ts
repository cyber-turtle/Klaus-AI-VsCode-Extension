import type { InteractionSettings, Settings } from "@shared/types/Settings";
import type { OpenAIModel } from "@shared/types/Models";
import { ChatOpenAI } from "@langchain/openai";
import type { AIProvider, ModelParams } from "../base";
import type { ILoggingProvider } from "@shared/types/Logger";
import type { Embeddings } from "@langchain/core/embeddings";
export declare class OpenAI implements AIProvider {
    private readonly settings;
    private readonly interactionSettings;
    private readonly loggingProvider;
    private readonly embeddingSettings?;
    codeModel: OpenAIModel | undefined;
    constructor(settings: Settings["providerSettings"]["OpenAI"], interactionSettings: InteractionSettings, loggingProvider: ILoggingProvider, embeddingSettings?: any);
    getEmbedder(): Embeddings;
    getLightweightModel(): ChatOpenAI<import("@langchain/openai").ChatOpenAICallOptions>;
    getModel(params?: ModelParams): ChatOpenAI<import("@langchain/openai").ChatOpenAICallOptions>;
    validateEmbeddingSettings(): Promise<boolean>;
    validateSettings(): Promise<any>;
    private getCodeModel;
    codeComplete(beginning: string, ending: string, signal: AbortSignal, additionalContext?: string, recentClipboard?: string): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map