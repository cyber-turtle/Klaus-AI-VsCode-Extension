/// <reference types="react" />
import type { ApiSettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
type HFSection = InitSettings["providerSettings"]["HuggingFace"] & {
    onChange: (ollamaSettings: ApiSettingsType) => void;
};
export declare const HFSettingsView: ({ codeModel, chatModel, baseUrl, apiKey, onChange, }: HFSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=HFSettingsView.d.ts.map