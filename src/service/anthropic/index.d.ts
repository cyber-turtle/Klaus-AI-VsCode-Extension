import type { AIProvider, ModelParams } from "../base";
import type { InteractionSettings, Settings } from "@shared/types/Settings";
import type { AnthropicModel } from "@shared/types/Models";
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatAnthropic } from "@langchain/anthropic";
import type { ILoggingProvider } from "@shared/types/Logger";
import type { Embeddings } from "@langchain/core/embeddings";
export declare class Anthropic implements AIProvider {
    private readonly settings;
    private readonly interactionSettings;
    private readonly loggingProvider;
    codeModel: AnthropicModel | undefined;
    constructor(settings: Settings["providerSettings"]["Anthropic"], interactionSettings: InteractionSettings, loggingProvider: ILoggingProvider);
    validateSettings(): Promise<boolean>;
    validateEmbeddingSettings(): Promise<boolean>;
    getModel(params?: ModelParams): BaseChatModel;
    getEmbedder(): Embeddings;
    getLightweightModel(): ChatAnthropic;
    private getCodeModel;
    codeComplete(beginning: string, ending: string, signal: AbortSignal, additionalContext?: string, recentClipboard?: string): Promise<string>;
}
//# sourceMappingURL=index.d.ts.map