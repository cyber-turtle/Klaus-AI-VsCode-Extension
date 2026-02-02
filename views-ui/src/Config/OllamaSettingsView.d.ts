/// <reference types="react" />
import type { OllamaSettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
type OllamaSection = InitSettings["providerSettings"]["Ollama"] & {
    onChange: (ollamaSettings: OllamaSettingsType) => void;
};
export declare const OllamaSettingsView: ({ codeModel, chatModel, apiPath, modelInfoPath, baseUrl, onChange, }: OllamaSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=OllamaSettingsView.d.ts.map