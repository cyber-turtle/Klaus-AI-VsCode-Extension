/// <reference types="react" />
import type { AzureAISettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
type AzureAISection = InitSettings["providerSettings"]["AzureAI"] & {
    onChange: (azureAISettings: AzureAISettingsType) => void;
};
export declare const AzureAISettingsView: ({ codeModel, chatModel, instanceName, apiVersion, apiKey, onChange, }: AzureAISection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=AzureAISettingsView.d.ts.map