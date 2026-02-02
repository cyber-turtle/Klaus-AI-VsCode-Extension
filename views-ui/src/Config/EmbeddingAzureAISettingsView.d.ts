/// <reference types="react" />
import type { InitSettings } from "./App";
type AzureAISection = InitSettings["embeddingSettings"]["AzureAI"] & {
    onChange: (azureAISettings: InitSettings["embeddingSettings"]["AzureAI"]) => void;
};
export declare const AzureAISettingsView: ({ model, summaryModel, instanceName, dimensions, apiVersion, apiKey, onChange, }: AzureAISection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=EmbeddingAzureAISettingsView.d.ts.map