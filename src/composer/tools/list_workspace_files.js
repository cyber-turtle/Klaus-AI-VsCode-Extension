"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createListDirectoryTool = void 0;
const tools_1 = require("@langchain/core/tools");
const node_path_1 = __importDefault(require("node:path"));
const zod_1 = require("zod");
const utils_1 = require("../utils");
const schemas_1 = require("./schemas");
const messages_1 = require("@langchain/core/messages");
const listDirectorySchema = schemas_1.baseToolSchema.extend({
    directory: zod_1.z.string().describe("The directory to list files from"),
    depth: zod_1.z
        .number()
        .optional()
        .describe("The level of subdirectories to recursively descend into during the scan. For example, a depth of 1 will scan the initial directory and its direct subdirectories, while 2 will go one level deeper. The default value is 3."),
});
/**
 * Creates a tool that lists contents of a directory
 */
const createListDirectoryTool = (workspace, withCache = true) => {
    const toolConfig = {
        name: "list_directory",
        description: "Lists files and directories from the specified path with configurable depth. Returns a structured tree representation of the filesystem hierarchy. To avoid redundant operations, save the results and reference them in your reasoning when exploring the same directory.",
        schema: listDirectorySchema,
        cache_control: { type: "ephemeral" },
    };
    if (!withCache) {
        if (toolConfig.cache_control) {
            //@ts-expect-error
            // biome-ignore lint/performance/noDelete: <explanation>
            delete toolConfig.cache_control;
        }
    }
    return (0, tools_1.tool)(async (input, config) => {
        try {
            const dirPath = node_path_1.default.isAbsolute(input.directory)
                ? input.directory
                : node_path_1.default.join(workspace, input.directory);
            // Use the provided depth or default to 3
            const depth = input.depth !== undefined ? input.depth : 3;
            const files = await (0, utils_1.scanDirectory)(dirPath, depth);
            return new messages_1.ToolMessage({
                id: config.callbacks._parentRunId,
                content: JSON.stringify({
                    files,
                    message: `Directory structure for ${input.directory} with depth ${depth}. To avoid redundant filesystem operations, save this result and reference it in your reasoning when you need information about this directory.`,
                    explanation: input.explanation,
                }),
                tool_call_id: config.toolCall.id,
            });
        }
        catch (error) {
            console.error("Error in list_directory tool:", error);
            return `Error: Could not list files in ${input.directory}. ${error instanceof Error ? error.message : ""}`;
        }
    }, toolConfig);
};
exports.createListDirectoryTool = createListDirectoryTool;
//# sourceMappingURL=list_workspace_files.js.map