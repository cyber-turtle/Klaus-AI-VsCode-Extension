import type { WorkspaceSettings } from "@shared/types/Settings";
import type { ExtensionContext } from "vscode";
export declare class Workspace {
    private readonly context;
    readonly workspaceFolder: string;
    readonly workspacePath: string;
    private settings;
    constructor(context: ExtensionContext, workspaceFolder: string, workspacePath: string);
    getSettings(): WorkspaceSettings;
    clear(): Promise<void>;
    save(data: Partial<WorkspaceSettings>): Promise<void>;
    load(): Promise<WorkspaceSettings>;
    createThread(id: string): Promise<void>;
    deleteThread(threadId: string): Promise<boolean>;
    switchThread(id: string): Promise<void>;
}
//# sourceMappingURL=workspace.d.ts.map