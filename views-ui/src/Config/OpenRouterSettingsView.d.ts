/// <reference types="react" />
import type { ApiSettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
type OpenRouterSection = InitSettings["providerSettings"]["OpenRouter"] & {
    onChange: (openAISettings: ApiSettingsType) => void;
};
export declare const OpenRouterSettingsView: ({ codeModel, chatModel, baseUrl, apiKey, onChange, }: OpenRouterSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=OpenRouterSettingsView.d.ts.map