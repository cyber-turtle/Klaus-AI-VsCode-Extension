import { type Settings } from "@shared/types/Settings";
export declare class WingmanSettings {
    private settings?;
    private path;
    private onSettingsChanged?;
    isDefault: boolean;
    constructor();
    private mergeSettings;
    registerOnChangeHandler(handler: (settings: Settings) => void | Promise<void>): void;
    saveSettings(settings: Settings): Promise<void>;
    loadSettings(force?: boolean): Promise<Settings>;
}
export declare const wingmanSettings: WingmanSettings;
//# sourceMappingURL=settings.d.ts.map