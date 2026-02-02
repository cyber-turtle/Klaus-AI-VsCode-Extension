import type { InteractionSettings, Settings } from "@shared/types/Settings";
import { LMStudioModel } from "./models/generic";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import type { AIProvider, ModelParams } from "../base";
import type { ILoggingProvider } from "@shared/types/Logger";
import type { Embeddings } from "@langchain/core/embeddings";
export declare class LMStudio implements AIProvider {
    private readonly settings;
    private readonly interactionSettings;
    private readonly loggingProvider;
    private readonly embeddingSettings?;
    codeModel: LMStudioModel | undefined;
    constructor(settings: Settings["providerSettings"]["LMStudio"], interactionSettings: InteractionSettings, loggingProvider: ILoggingProvider, embeddingSettings?: any);
    validateSettings(): Promise<boolean>;
    validateEmbeddingSettings(): Promise<boolean>;
    validateModelExists(modelName: string): Promise<boolean>;
    getEmbedder(): Embeddings;
    getLightweightModel(): OpenAI<import("@langchain/openai").OpenAICallOptions>;
    getModel(params?: ModelParams): ChatOpenAI<import("@langchain/openai").ChatOpenAICallOptions>;
    private getCodeModel;
    codeComplete(beginning: string, ending: string, signal: AbortSignal, additionalContext?: string, recentClipboard?: string): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map