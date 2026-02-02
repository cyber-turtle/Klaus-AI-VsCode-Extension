import * as vscode from "vscode";
export declare class ActivityStatusBar {
    activityStatusBarItem: vscode.StatusBarItem;
    isInErrorState: boolean;
    readonly onFatalError: vscode.Event<void>;
    readonly onQueryStart: vscode.Event<void>;
    readonly onQueryComplete: vscode.Event<void>;
    constructor();
    TogglePending(pending: boolean): void;
    ToggleError(): void;
    dispose(): void;
}
//# sourceMappingURL=statusBarProvider.d.ts.map