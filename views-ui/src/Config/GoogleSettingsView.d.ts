/// <reference types="react" />
import type { ApiSettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
type GoogleSection = InitSettings["providerSettings"]["Google"] & {
    onChange: (openAISettings: ApiSettingsType) => void;
};
export declare const GoogleSettingsView: ({ codeModel, chatModel, baseUrl, apiKey, onChange, }: GoogleSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=GoogleSettingsView.d.ts.map