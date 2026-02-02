import type React from "react";
import { type FC, type PropsWithChildren } from "react";
import type { Settings } from "@shared/types/Settings";
export type View = "composer";
interface SettingsContextType {
    view: View;
    setView: React.Dispatch<React.SetStateAction<View>>;
    settings?: Settings;
    isLightTheme: boolean;
}
export declare const useSettingsContext: () => SettingsContextType;
export declare const SettingsProvider: FC<PropsWithChildren>;
export {};
//# sourceMappingURL=settingsContext.d.ts.map