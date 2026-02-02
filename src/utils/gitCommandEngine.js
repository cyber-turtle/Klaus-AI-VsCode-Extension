"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitCommandEngine = exports.isGitAvailable = void 0;
const node_child_process_1 = require("node:child_process");
const node_util_1 = require("node:util");
const execAsync = (0, node_util_1.promisify)(node_child_process_1.exec);
async function isGitAvailable() {
    try {
        await execAsync("git --version");
        return true;
    }
    catch (error) {
        return false;
    }
}
exports.isGitAvailable = isGitAvailable;
class GitCommandEngine {
    constructor(cwd) {
        this.cwd = cwd;
    }
    /**
     * Executes a git command and returns the output
     */
    async executeCommand(command) {
        try {
            const { stdout } = await execAsync(command, {
                cwd: this.cwd,
            });
            return stdout.trim();
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Git command failed: ${error.message}`);
            }
        }
        return "";
    }
    async getBaseBranch() {
        const upstream = await this.executeCommand("git rev-parse --abbrev-ref @{upstream}");
        return upstream.split("/")[1] || "main";
    }
    async getOriginalContent(filePath) {
        try {
            const mergeBase = await this.executeCommand(`git merge-base HEAD ${await this.getBaseBranch()}`);
            return await this.executeCommand(`git show ${mergeBase.trim()}:${filePath}`);
        }
        catch (error) {
            console.error("Failed to get original content:", error);
            return "";
        }
    }
    async getCurrentBranch() {
        return this.executeCommand("git rev-parse --abbrev-ref HEAD");
    }
    async getChangedFiles() {
        const output = await this.executeCommand("git diff HEAD --name-only");
        return output.split("\n").filter((file) => file.length > 0);
    }
    async getDiff(options = {}) {
        const { includeStagedChanges = true, includeUnstagedChanges = true, includeUntrackedFiles = false, includeCommittedChanges = true, pathSpec = "", } = options;
        const diffCommands = [];
        try {
            // Check git availability
            if (!(await this.isGitAvailable())) {
                throw new Error("Git is not available in the current workspace");
            }
            // Check repository
            if (!(await this.isGitRepository())) {
                throw new Error("Current workspace is not a git repository");
            }
            const baseBranch = await this.getBaseBranchWithFallback();
            const mergeBase = await this.getMergeBaseWithFallback(baseBranch);
            if (includeCommittedChanges) {
                const allChanges = await this.executeCommand(`git diff ${mergeBase} ${pathSpec}`);
                if (allChanges)
                    diffCommands.push(allChanges);
            }
            if (includeStagedChanges) {
                const stagedDiff = await this.executeCommand(`git diff --staged ${pathSpec}`);
                if (stagedDiff)
                    diffCommands.push(stagedDiff);
            }
            if (includeUnstagedChanges) {
                const unstagedDiff = await this.executeCommand(`git diff ${pathSpec}`);
                if (unstagedDiff)
                    diffCommands.push(unstagedDiff);
            }
            if (includeUntrackedFiles) {
                const untrackedFiles = await this.getUntrackedFiles();
                if (untrackedFiles.length > 0) {
                    diffCommands.push(this.formatUntrackedFilesDiff(untrackedFiles));
                }
            }
            return diffCommands.filter(Boolean).join("\n");
        }
        catch (error) {
            console.error("Error generating diff:", error);
            throw error;
        }
    }
    async isGitAvailable() {
        try {
            await this.executeCommand("git --version");
            return true;
        }
        catch {
            return false;
        }
    }
    async isGitRepository() {
        try {
            await this.executeCommand("git rev-parse --git-dir");
            return true;
        }
        catch {
            return false;
        }
    }
    async getBaseBranchWithFallback() {
        try {
            return await this.getBaseBranch();
        }
        catch {
            const branches = await this.executeCommand('git branch --format="%(refname:short)"');
            return (branches.split("\n").find((b) => ["main", "master"].includes(b)) ||
                "HEAD~1");
        }
    }
    async getMergeBaseWithFallback(baseBranch) {
        try {
            return await this.executeCommand(`git merge-base HEAD ${baseBranch}`);
        }
        catch {
            try {
                return await this.executeCommand("git rev-list --max-parents=0 HEAD");
            }
            catch {
                return "HEAD~1";
            }
        }
    }
    async getUntrackedFiles() {
        const untrackedFiles = await this.executeCommand("git ls-files --others --exclude-standard");
        return untrackedFiles.split("\n").filter(Boolean);
    }
    formatUntrackedFilesDiff(files) {
        return files
            .map((file) => [
            `diff --git a/${file} b/${file}`,
            "new file mode 100644",
            "index 0000000..0000000",
            "--- /dev/null",
            `+++ b/${file}`,
        ].join("\n"))
            .join("\n");
    }
}
exports.GitCommandEngine = GitCommandEngine;
//# sourceMappingURL=gitCommandEngine.js.map