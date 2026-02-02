/// <reference types="react" />
import type { ApiSettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
type xAiSection = InitSettings["providerSettings"]["xAI"] & {
    onChange: (xAiSettings: ApiSettingsType) => void;
};
export declare const XAISettingsView: ({ codeModel, chatModel, apiKey, baseUrl, onChange, }: xAiSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=xAISettingsView.d.ts.map