/// <reference types="react" />
import type { InitSettings } from "./App";
type LMStudioSection = InitSettings["embeddingSettings"]["LMStudio"] & {
    onChange: (lmstudioSettings: InitSettings["embeddingSettings"]["LMStudio"]) => void;
};
export declare const LMStudioSettingsView: ({ model, summaryModel, dimensions, apiPath, modelInfoPath, baseUrl, onChange, }: LMStudioSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=EmbeddingLMStudioSettingsView.d.ts.map