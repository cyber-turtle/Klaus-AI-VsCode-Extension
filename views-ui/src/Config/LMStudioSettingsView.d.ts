/// <reference types="react" />
import type { OllamaSettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
type LMStudioSection = InitSettings["providerSettings"]["LMStudio"] & {
    onChange: (lmstudioSettings: OllamaSettingsType) => void;
};
export declare const LMStudioSettingsView: ({ codeModel, chatModel, apiPath, modelInfoPath, baseUrl, onChange, }: LMStudioSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=LMStudioSettingsView.d.ts.map