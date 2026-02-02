/// <reference types="react" />
import type { InitSettings } from "./App";
type OpenRouterSection = InitSettings["embeddingSettings"]["OpenRouter"] & {
    onChange: (openRouterSettings: InitSettings["embeddingSettings"]["OpenRouter"]) => void;
};
export declare const OpenRouterSettingsView: ({ model, summaryModel, baseUrl, dimensions, apiKey, onChange, }: OpenRouterSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=EmbeddingOpenRouterSettingsView.d.ts.map