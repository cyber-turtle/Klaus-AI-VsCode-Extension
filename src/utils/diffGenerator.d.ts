import type { CodeReview } from "@shared/types/Message";
import { GitCommandEngine, type GitDiffOptions } from "./gitCommandEngine";
interface DiffOptions {
    includeStagedChanges?: boolean;
    includeUnstagedChanges?: boolean;
    includeUntrackedFiles?: boolean;
    includeCommittedChanges?: boolean;
    pathSpec?: string;
}
export declare class DiffGenerator extends GitCommandEngine {
    /**
     * Gets the base branch name (usually main or master)
     * @returns The base branch name
     */
    getBaseBranch(): Promise<string>;
    /**
     * Gets the content of a file from the base branch
     * @param filePath The path to the file
     * @returns The file content from the base branch
     */
    getOriginalContent(filePath: string): Promise<string>;
    /**
     * Executes a git command and returns the output
     * @param command The git command to execute
     * @returns The command output
     */
    private executeGitCommand;
    /**
     * Gets the current git branch name
     * @returns The current branch name
     */
    getCurrentBranch(): Promise<string>;
    generateDiffWithLineNumbersAndMap(params?: GitDiffOptions): Promise<CodeReview["fileDiffMap"]>;
    private processDiff;
    getDiff(options?: DiffOptions): Promise<string>;
    /**
     * Shows diff for a specific file
     * @param filePath The path of the file to show diff for
     * @returns The git diff output for the specified file
     */
    showDiffForFile(filePath: string): Promise<string>;
    /**
     * Gets a list of changed files in the current branch
     * @returns Array of changed file paths
     */
    getChangedFiles(): Promise<string[]>;
}
export {};
//# sourceMappingURL=diffGenerator.d.ts.map