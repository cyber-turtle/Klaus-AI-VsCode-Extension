/// <reference types="react" />
import type { ApiSettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
type OpenAiSection = InitSettings["providerSettings"]["OpenAI"] & {
    onChange: (openAISettings: ApiSettingsType) => void;
};
export declare const OpenAISettingsView: ({ codeModel, chatModel, baseUrl, apiKey, onChange, }: OpenAiSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=OpenAISettingsView.d.ts.map