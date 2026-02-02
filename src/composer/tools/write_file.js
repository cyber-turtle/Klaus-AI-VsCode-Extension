"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWriteFileTool = exports.generateFileMetadata = exports.writeFileSchema = void 0;
const tools_1 = require("@langchain/core/tools");
const diff_1 = require("diff");
const node_fs_1 = __importStar(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const zod_1 = require("zod");
const schemas_1 = require("./schemas");
const messages_1 = require("@langchain/core/messages");
exports.writeFileSchema = schemas_1.baseFileSchema.extend({
    contents: zod_1.z
        .string()
        .min(0)
        .describe("The contents of the file as a string, this can never be empty or undefined."),
});
/**
 * Generates a diff between existing file content and new code
 */
const generateDiffFromModifiedCode = async (newCode, filePath, originalCode) => {
    try {
        if (!filePath) {
            throw new Error("File path is required");
        }
        if (typeof newCode !== "string") {
            throw new Error(`New code must be a string, received: ${typeof newCode}`);
        }
        const patch = (0, diff_1.createPatch)(filePath, originalCode ?? "", newCode, "", "", {
            context: 3,
            ignoreWhitespace: true,
        });
        const stats = {
            additions: 0,
            deletions: 0,
        };
        // Safer line parsing
        const lines = patch.split("\n");
        for (const line of lines) {
            // Skip diff headers and metadata
            if (line.startsWith("+++") ||
                line.startsWith("---") ||
                line.startsWith("Index:") ||
                line.startsWith("===") ||
                line.startsWith("@@") ||
                line.startsWith("\\")) {
                continue;
            }
            if (line.startsWith("+")) {
                stats.additions++;
            }
            else if (line.startsWith("-")) {
                stats.deletions++;
            }
        }
        return `+${stats.additions},-${stats.deletions}`;
    }
    catch (error) {
        console.error("Error generating diff:", error);
        return "+0,-0"; // Safe fallback
    }
};
const generateFileMetadata = async (workspace, id, input) => {
    // Validate input before processing
    if (!input.contents && input.contents !== "") {
        throw new Error(`File contents are required but received: ${typeof input.contents}`);
    }
    if (!input.path) {
        throw new Error("File path is required");
    }
    let fileContents = "";
    const filePath = node_path_1.default.join(workspace, input.path);
    if (node_fs_1.default.existsSync(filePath)) {
        try {
            fileContents = await node_fs_1.promises.readFile(filePath, {
                encoding: "utf-8",
            });
        }
        catch (e) {
            console.warn(`Failed to read file ${filePath}:`, e);
        }
    }
    return {
        id,
        path: input.path,
        code: input.contents,
        original: fileContents,
        diff: await generateDiffFromModifiedCode(input.contents, input.path, fileContents),
    };
};
exports.generateFileMetadata = generateFileMetadata;
/**
 * Creates a write file tool with the given workspace
 */
const createWriteFileTool = (workspace, autoCommit = false) => {
    return (0, tools_1.tool)(async (input, config) => {
        try {
            // Validate input early
            const validatedInput = exports.writeFileSchema.parse(input);
            console.log("Write file tool input:", {
                path: validatedInput.path,
                contentsType: typeof validatedInput.contents,
                contentsLength: validatedInput.contents?.length ?? 0,
                hasContents: validatedInput.contents !== undefined
            });
            const file = await (0, exports.generateFileMetadata)(workspace, config.callbacks._parentRunId, validatedInput);
            if (autoCommit) {
                file.accepted = true;
                // check if directory exists
                const dir = node_path_1.default.dirname(node_path_1.default.join(workspace, file.path));
                if (!node_fs_1.default.existsSync(dir)) {
                    await node_fs_1.default.promises.mkdir(dir, { recursive: true });
                }
                if (file.code) {
                    await node_fs_1.promises.writeFile(node_path_1.default.join(workspace, file.path), file.code);
                }
                else {
                    throw new Error("File code is undefined, cannot write file");
                }
            }
            else {
                // In manual mode, the args are supplemented with "pre-run" data points, restore those if present.
                if (config.toolCall) {
                    file.accepted = config.toolCall.args.accepted;
                    file.rejected = config.toolCall.args.rejected;
                    file.diff = config.toolCall.args.diff;
                    file.original = config.toolCall.args.original;
                }
            }
            return new messages_1.ToolMessage({
                id: config.callbacks._parentRunId,
                content: `Successfully wrote file: ${input.path}`,
                tool_call_id: config.toolCall.id,
                name: "edit_file",
                additional_kwargs: {
                    file: file,
                },
            });
        }
        catch (e) {
            console.error("Write file tool error:", e);
            console.error("Input received:", JSON.stringify(input, null, 2));
            throw e;
        }
    }, {
        name: "edit_file",
        description: "Edit or write a file to the file system, use this tool when you need to create or edit a file. The contents need to be the full file contents, do not omit any code for the file.",
        schema: exports.writeFileSchema,
        returnDirect: false,
    });
};
exports.createWriteFileTool = createWriteFileTool;
//# sourceMappingURL=write_file.js.map