/// <reference types="react" />
import type { InitSettings } from "./App";
type OllamaSection = InitSettings["embeddingSettings"]["Ollama"] & {
    onChange: (ollamaSettings: InitSettings["embeddingSettings"]["Ollama"]) => void;
};
export declare const OllamaSettingsView: ({ model, summaryModel, dimensions, apiPath, modelInfoPath, baseUrl, onChange, }: OllamaSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=EmbeddingOllamaSettingsView.d.ts.map