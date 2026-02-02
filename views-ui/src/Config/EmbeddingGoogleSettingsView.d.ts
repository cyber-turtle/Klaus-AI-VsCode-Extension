/// <reference types="react" />
import type { InitSettings } from "./App";
type GoogleSection = InitSettings["embeddingSettings"]["Google"] & {
    onChange: (googleSettings: InitSettings["embeddingSettings"]["Google"]) => void;
};
export declare const GoogleSettingsView: ({ model, summaryModel, baseUrl, dimensions, apiKey, onChange, }: GoogleSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=EmbeddingGoogleSettingsView.d.ts.map