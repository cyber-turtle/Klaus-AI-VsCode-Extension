import type { InteractionSettings, Settings } from "@shared/types/Settings";
import type { AIProvider, ModelParams } from "../base";
import type { ILoggingProvider } from "@shared/types/Logger";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatXAI } from "@langchain/xai";
import { GrokModel } from "./models/grokmodel";
import type { Embeddings } from "@langchain/core/embeddings";
export declare class xAI implements AIProvider {
    private readonly settings;
    private readonly interactionSettings;
    private readonly loggingProvider;
    codeModel: GrokModel | undefined;
    constructor(settings: Settings["providerSettings"]["xAI"], interactionSettings: InteractionSettings, loggingProvider: ILoggingProvider);
    getLightweightModel(): ChatXAI;
    getEmbedder(): Embeddings;
    getModel(params?: ModelParams): BaseChatModel;
    validateSettings(): Promise<boolean>;
    private getCodeModel;
    codeComplete(beginning: string, ending: string, signal: AbortSignal, additionalContext?: string, recentClipboard?: string): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map