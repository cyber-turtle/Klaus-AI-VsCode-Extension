import type { FileMetadata } from "@shared/types/Message";
/**
 * Tracks the most recently opened files in VSCode
 */
export declare class RecentFileTracker {
    private static instance;
    private recentFiles;
    private readonly maxFiles;
    private disposables;
    private constructor();
    /**
     * Gets the singleton instance of RecentFileTracker
     */
    static getInstance(): RecentFileTracker;
    /**
     * Adds a file to the recent files list
     */
    private addFile;
    /**
     * Gets the list of recent files
     */
    getRecentFiles(): FileMetadata[];
    /**
     * Opens a file from the recent files list
     */
    openFile(file: FileMetadata): void;
    /**
     * Disposes of all registered event listeners
     */
    dispose(): void;
}
export declare const getRecentFileTracker: () => RecentFileTracker;
//# sourceMappingURL=recentFileTracker.d.ts.map