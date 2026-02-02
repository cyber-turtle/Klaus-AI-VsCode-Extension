"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workspace = void 0;
const defaultSettings = {
    threadIds: [],
    activeThreadId: undefined,
};
class Workspace {
    constructor(context, workspaceFolder, workspacePath) {
        this.context = context;
        this.workspaceFolder = workspaceFolder;
        this.workspacePath = workspacePath;
        // Initialize settings with default values
        this.settings = defaultSettings;
    }
    getSettings() {
        return this.settings;
    }
    async clear() {
        await this.context.workspaceState.update("settings", defaultSettings);
    }
    async save(data) {
        this.settings = {
            ...this.settings,
            ...data,
        };
        try {
            await this.context.workspaceState.update("settings", this.settings);
        }
        catch (error) {
            console.error("Error saving workspace settings:", error);
        }
    }
    async load() {
        try {
            this.settings =
                (await this.context.workspaceState.get("settings")) ?? defaultSettings;
            if (!this.settings.threadIds) {
                this.settings.threadIds = [];
                this.settings.activeThreadId = undefined;
            }
        }
        catch (error) {
            console.error("Error loading workspace settings:", error);
            this.settings = defaultSettings;
        }
        return this.settings;
    }
    // Thread management methods
    async createThread(id) {
        const threadIds = [...(this.settings.threadIds ?? []), id];
        await this.save({
            threadIds,
            activeThreadId: id,
        });
    }
    async deleteThread(threadId) {
        const threadIds = [...(this.settings.threadIds || [])];
        const remainingThreadIds = threadIds.filter((i) => i !== threadId);
        await this.save({
            threadIds: remainingThreadIds,
        });
        return true;
    }
    async switchThread(id) {
        await this.save({ activeThreadId: id });
    }
}
exports.Workspace = Workspace;
//# sourceMappingURL=workspace.js.map