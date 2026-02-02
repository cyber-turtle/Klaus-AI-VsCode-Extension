import type { InteractionSettings, Settings } from "@shared/types/Settings";
import { GoogleModel } from "./models/generic";
import type { AIProvider, ModelParams } from "../base";
import type { ILoggingProvider } from "@shared/types/Logger";
import type { Embeddings } from "@langchain/core/embeddings";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
export declare class Google implements AIProvider {
    private readonly settings;
    private readonly interactionSettings;
    private readonly loggingProvider;
    private readonly embeddingSettings?;
    codeModel: GoogleModel | undefined;
    constructor(settings: Settings["providerSettings"]["Google"], interactionSettings: InteractionSettings, loggingProvider: ILoggingProvider, embeddingSettings?: any);
    generateImage(input: string): Promise<string | undefined>;
    getEmbedder(): Embeddings;
    getLightweightModel(): ChatGoogleGenerativeAI;
    getModel(params?: ModelParams): ChatGoogleGenerativeAI;
    validateEmbeddingSettings(): Promise<boolean>;
    validateSettings(): Promise<boolean>;
    private getCodeModel;
    codeComplete(beginning: string, ending: string, signal: AbortSignal, additionalContext?: string, recentClipboard?: string): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map