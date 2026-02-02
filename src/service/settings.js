"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wingmanSettings = exports.WingmanSettings = void 0;
const Settings_1 = require("@shared/types/Settings");
const node_os_1 = require("node:os");
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
class WingmanSettings {
    constructor() {
        this.isDefault = false;
        this.path = node_path_1.default.join((0, node_os_1.homedir)(), "/.wingman/settings.json");
    }
    mergeSettings(defaults, loaded) {
        return {
            ...defaults,
            ...loaded,
            interactionSettings: {
                ...defaults.interactionSettings,
                ...loaded.interactionSettings,
            },
            providerSettings: {
                ...defaults.providerSettings,
                ...loaded.providerSettings,
            },
            agentSettings: {
                ...defaults.agentSettings,
                ...loaded.agentSettings,
            },
        };
    }
    registerOnChangeHandler(handler) {
        this.onSettingsChanged = handler;
    }
    async saveSettings(settings) {
        this.isDefault = false;
        await node_fs_1.promises.mkdir(node_path_1.default.dirname(this.path), { recursive: true });
        await node_fs_1.promises.writeFile(this.path, Buffer.from(JSON.stringify(settings, null, 2)));
        this.settings = settings;
        if (this.onSettingsChanged) {
            this.onSettingsChanged(this.settings);
        }
    }
    async loadSettings(force = false) {
        if (this.settings && !force)
            return this.settings;
        try {
            const fileContents = (await node_fs_1.promises.readFile(this.path)).toString();
            const loadedSettings = JSON.parse(fileContents.toString());
            this.settings = this.mergeSettings(Settings_1.defaultSettings, loadedSettings);
        }
        catch (e) {
            if (e instanceof Error) {
                console.error(`Settings file not found or corrupt, creating a new one. Error - ${e.message}`);
            }
            this.settings = { ...Settings_1.defaultSettings };
            this.isDefault = true;
        }
        if (!this.settings.embeddingSettings.General) {
            this.settings.embeddingSettings.General = {
                ...Settings_1.defaultSettings.embeddingSettings.General,
            };
        }
        return this.settings;
    }
}
exports.WingmanSettings = WingmanSettings;
exports.wingmanSettings = new WingmanSettings();
//# sourceMappingURL=settings.js.map