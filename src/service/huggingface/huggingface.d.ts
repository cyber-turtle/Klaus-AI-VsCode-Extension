import type { HuggingFaceAIModel } from "@shared/types/Models";
import type { InteractionSettings, Settings } from "@shared/types/Settings";
import type { AIProvider, ModelParams } from "../base";
import type { ILoggingProvider } from "@shared/types/Logger";
import type { Embeddings } from "@langchain/core/embeddings";
import { HuggingFaceInference } from "@langchain/community/llms/hf";
export declare class HuggingFace implements AIProvider {
    private readonly settings;
    private readonly interactionSettings;
    private readonly loggingProvider;
    codeModel: HuggingFaceAIModel | undefined;
    constructor(settings: Settings["providerSettings"]["HuggingFace"], interactionSettings: InteractionSettings, loggingProvider: ILoggingProvider);
    getEmbedder(): Embeddings;
    validateSettings(): Promise<boolean>;
    getModel(params?: ModelParams): HuggingFaceInference;
    getLightweightModel(): HuggingFaceInference;
    private getCodeModel;
    codeComplete(beginning: string, ending: string, signal: AbortSignal, additionalContext?: string): Promise<string>;
}
//# sourceMappingURL=huggingface.d.ts.map