/// <reference types="react" />
import type { Settings } from "@shared/types/Settings";
type InteractionSettings = Required<Settings>["interactionSettings"];
export type InteractionSettingsConfigProps = {
    interactions: InteractionSettings;
    onChange: (settings: InteractionSettings) => void;
};
export declare const InteractionSettingsConfig: ({ interactions, onChange, }: InteractionSettingsConfigProps) => import("react").JSX.Element;
export {};
//# sourceMappingURL=InteractionSettingsConfig.d.ts.map