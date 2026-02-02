import * as vscode from "vscode";
import type { LSPClient } from "../client";
import type { DiffViewCommand } from "@shared/types/Composer";
import type { FileMetadata } from "@shared/types/Message";
import type { UpdateComposerFileEvent } from "@shared/types/Events";
export declare class DiffViewProvider {
    private readonly _context;
    private readonly _lspClient;
    panels: Map<string, vscode.WebviewPanel>;
    constructor(_context: vscode.ExtensionContext, _lspClient: LSPClient);
    /**
     * Creates a diff view panel for comparing file changes.
     *
     * This method creates a webview panel that displays differences between file versions.
     * If a panel for the specified file already exists, it will be brought to focus instead
     * of creating a new one.
     *
     * @param {Object} params - The parameters for creating the diff view
     * @param {Object} params.file - The file metadata for which to show the diff
     * @param {string} params.threadId - The ID of the thread associated with these changes
     * @param {string} params.toolId - The ID of the tool that generated the changes
     * @param {Function} params.onAccept - Callback function triggered when changes are accepted
     * @param {Function} params.onReject - Callback function triggered when changes are rejected
     * @returns {Promise<void>}
     */
    createDiffView({ file, threadId, toolId, onAccept, onReject, }: DiffViewCommand & {
        onAccept: (event: UpdateComposerFileEvent, isRevert: boolean) => void;
        onReject: (event: UpdateComposerFileEvent) => void;
    }): Promise<void>;
    acceptFileChanges(currentPanel: vscode.WebviewPanel, file: string, { path: artifactFile, code: markdown }: FileMetadata): Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=diffViewProvider.d.ts.map