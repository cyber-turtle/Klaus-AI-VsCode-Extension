/// <reference types="react" />
import type { AgentSettings } from "@shared/types/Settings";
import type { InitSettings } from "./App";
export type AgentFeatureViewProps = {
    validationSettings: InitSettings["agentSettings"];
    onValidationChanged: (validationSettings: AgentSettings) => void;
};
export declare const AgentFeaturesView: ({ validationSettings, onValidationChanged, }: AgentFeatureViewProps) => import("react").JSX.Element;
//# sourceMappingURL=AgentFeaturesView.d.ts.map