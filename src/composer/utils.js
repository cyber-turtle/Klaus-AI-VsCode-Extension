"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanDirectory = exports.loadWingmanRules = exports.formatMessages = void 0;
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const utils_1 = require("../server/files/utils");
function formatMessages(messages) {
    return messages
        .map((msg) => {
        const role = msg.role === "user" ? "User" : "Assistant";
        return `${role}: ${msg.content}`;
    })
        .join("\n\n");
}
exports.formatMessages = formatMessages;
async function loadWingmanRules(workspace) {
    try {
        const wingmanRules = await node_fs_1.promises.readFile(node_path_1.default.join(workspace, ".wingmanrules"), "utf-8");
        return wingmanRules;
    }
    catch (e) {
        console.error("Failed to load wingman rules", e);
    }
}
exports.loadWingmanRules = loadWingmanRules;
async function scanDirectory(dir, maxDepth, cwd) {
    const contents = [];
    const workspaceDir = cwd ?? dir;
    const gitignorePatterns = await (0, utils_1.getGitignorePatterns)(workspaceDir);
    const systemDirs = [
        ".git",
        ".vscode",
        ".idea",
        ".DS_Store",
        "node_modules",
        "dist",
        "build",
    ];
    async function scan(currentPath, currentDepth) {
        if (currentDepth > maxDepth)
            return;
        const entries = await node_fs_1.promises.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = node_path_1.default.join(currentPath, entry.name);
            const relativePath = node_path_1.default.relative(dir, fullPath);
            // Skip system directories
            if (systemDirs.includes(entry.name))
                continue;
            // Check if path matches gitignore patterns
            const shouldExclude = await (0, utils_1.isFileExcludedByGitignore)(fullPath, workspaceDir);
            if (shouldExclude)
                continue;
            if (entry.isDirectory()) {
                contents.push({
                    type: "directory",
                    name: entry.name,
                    path: relativePath,
                    depth: currentDepth,
                });
                await scan(fullPath, currentDepth + 1);
            }
            else {
                contents.push({
                    type: "file",
                    name: entry.name,
                    path: relativePath,
                    depth: currentDepth,
                });
            }
        }
    }
    await scan(dir, 0);
    return contents;
}
exports.scanDirectory = scanDirectory;
//# sourceMappingURL=utils.js.map