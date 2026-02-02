export declare function isGitAvailable(): Promise<boolean>;
export interface GitDiffOptions {
    includeStagedChanges?: boolean;
    includeUnstagedChanges?: boolean;
    includeUntrackedFiles?: boolean;
    includeCommittedChanges?: boolean;
    pathSpec?: string;
}
export declare class GitCommandEngine {
    protected readonly cwd: string;
    constructor(cwd: string);
    /**
     * Executes a git command and returns the output
     */
    protected executeCommand(command: string): Promise<string>;
    getBaseBranch(): Promise<string>;
    getOriginalContent(filePath: string): Promise<string>;
    getCurrentBranch(): Promise<string>;
    getChangedFiles(): Promise<string[]>;
    getDiff(options?: GitDiffOptions): Promise<string>;
    private isGitAvailable;
    private isGitRepository;
    private getBaseBranchWithFallback;
    private getMergeBaseWithFallback;
    private getUntrackedFiles;
    private formatUntrackedFilesDiff;
}
//# sourceMappingURL=gitCommandEngine.d.ts.map