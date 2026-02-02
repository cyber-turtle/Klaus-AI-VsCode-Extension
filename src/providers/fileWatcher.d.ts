import * as vscode from "vscode";
import type { LSPClient } from "../client";
export declare class WingmanFileWatcher {
    private readonly lspClient;
    private fileIndex;
    private indexingQueue;
    private isProcessingQueue;
    private debounceTimers;
    private fileWatcher;
    private readonly debounceTimeMs;
    private gitHeadWatcher;
    private isReindexing;
    private branchSwitchDebounceTimer;
    private inclusionFilter;
    private gitignoreMap;
    private gitignoreWatcher;
    private progressTask;
    private readonly defaultIgnorePatterns;
    constructor(lspClient: LSPClient);
    dispose(): void;
    /**
     * Set up file system watchers to track file changes
     */
    setupFileWatchers(): vscode.FileSystemWatcher;
    /**
     * Set up watchers for .gitignore files
     */
    private setupGitignoreWatchers;
    /**
     * Read and parse a .gitignore file for a specific folder
     */
    private updateGitignoreForFolder;
    /**
     * Find and load all .gitignore files in the workspace
     */
    private loadAllGitignoreFiles;
    /**
     * Get the appropriate ignore instance for a file path
     */
    private getIgnoreInstanceForFile;
    /**
     * Check if a file should be ignored based on inclusion filter pattern and gitignore rules
     */
    private shouldIgnoreFile;
    /**
     * Debounces file indexing to prevent excessive processing
     */
    private debounceFileIndexing;
    /**
     * Add a file to the indexing queue and start processing if not already in progress
     */
    private queueFileForIndexing;
    /**
     * Process files in the indexing queue
     */
    private processIndexingQueue;
    private shouldIndexFile;
    /**
     * Remove a file from the index
     */
    private removeFileFromIndex;
    /**
     * Check if a file has changed since last indexing
     */
    private hasFileChanged;
    /**
     * Set up workspace watcher for folder changes
     */
    setupWorkspaceWatcher(): void;
    /**
     * Set up a watcher for Git branch switches
     */
    private setupGitBranchWatcher;
    /**
     * Handle a Git branch switch by re-indexing the workspace
     */
    private handleGitBranchSwitch;
    /**
     * Clear all indexed files for a specific folder
     */
    private clearFolderFromIndex;
    /**
     * Add a command to manually trigger re-indexing
     */
    reindexWorkspace(): Promise<void>;
    /**
     * Queue a folder for indexing with non-blocking approach
     */
    private queueFolderForIndexing;
    /**
     * Find all eligible files recursively in a folder
     * Uses combined .gitignore and inclusionFilter patterns
     */
    private findEligibleFiles;
    /**
     * Initial indexing of the entire workspace with progress indication
     */
    initialIndexing(): Promise<void>;
    /**
     * Start progressive indexing without blocking the UI
     */
    private startProgressiveIndexing;
    /**
     * Initialize the extension with all watchers and indexing
     */
    initialize(inclusionFilter: string): Promise<void>;
}
//# sourceMappingURL=fileWatcher.d.ts.map