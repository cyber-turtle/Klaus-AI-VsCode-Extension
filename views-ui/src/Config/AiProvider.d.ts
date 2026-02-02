/// <reference types="react" />
import { type AiProviders, type ApiSettingsType, type AzureAISettingsType, type OllamaSettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
export type AiProviderProps = {
    settings: InitSettings;
    onProviderChanged: (provider: AiProviders) => void;
    onProviderSettingsChanged: (settings: OllamaSettingsType | ApiSettingsType | AzureAISettingsType) => void;
};
export declare const AiProvider: ({ settings, onProviderChanged, onProviderSettingsChanged, }: AiProviderProps) => import("react").JSX.Element;
//# sourceMappingURL=AiProvider.d.ts.map