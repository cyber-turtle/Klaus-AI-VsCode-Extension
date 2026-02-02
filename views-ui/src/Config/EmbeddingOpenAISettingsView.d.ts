/// <reference types="react" />
import type { InitSettings } from "./App";
type OpenAiSection = InitSettings["embeddingSettings"]["OpenAI"] & {
    onChange: (openAISettings: InitSettings["embeddingSettings"]["OpenAI"]) => void;
};
export declare const OpenAISettingsView: ({ model, summaryModel, baseUrl, dimensions, apiKey, onChange, }: OpenAiSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=EmbeddingOpenAISettingsView.d.ts.map