/// <reference types="react" />
import { type EmbeddingProviders, type EmbeddingSettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
export type EmbeddingProviderProps = {
    settings: InitSettings;
    indexedFiles?: string[];
    onProviderChanged: (provider: EmbeddingProviders) => void;
    onProviderSettingsChanged: (settings: EmbeddingSettingsType) => void;
};
export declare const EmbeddingProvider: ({ settings, indexedFiles, onProviderChanged, onProviderSettingsChanged, }: EmbeddingProviderProps) => import("react").JSX.Element;
//# sourceMappingURL=EmbeddingProvider.d.ts.map