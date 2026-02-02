/// <reference types="react" />
import type { ApiSettingsType } from "@shared/types/Settings";
import type { InitSettings } from "./App";
type AnthropicSection = InitSettings["providerSettings"]["Anthropic"] & {
    onChange: (anthropicSettings: ApiSettingsType) => void;
    enableReasoning?: boolean;
};
export declare const AnthropicSettingsView: ({ codeModel, chatModel, baseUrl, apiKey, onChange, enableReasoning, sparkMode }: AnthropicSection) => import("react").JSX.Element;
export {};
//# sourceMappingURL=AnthropicSettingsView.d.ts.map