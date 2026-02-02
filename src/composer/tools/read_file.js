"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReadFileTool = exports.readFileSchema = void 0;
const tools_1 = require("@langchain/core/tools");
const node_fs_1 = __importDefault(require("node:fs"));
const node_path_1 = __importDefault(require("node:path"));
const schemas_1 = require("./schemas");
const utils_1 = require("../../server/files/utils");
const messages_1 = require("@langchain/core/messages");
exports.readFileSchema = schemas_1.baseFileSchema.extend({
// Additional read-specific properties would go here
});
/**
 * Creates a tool that reads file contents
 */
const createReadFileTool = (workspace, codeParser) => {
    return (0, tools_1.tool)(async (input, config) => {
        const filePath = node_path_1.default.isAbsolute(input.path)
            ? input.path
            : node_path_1.default.join(workspace, input.path);
        if (!node_fs_1.default.existsSync(filePath)) {
            return "File does not exist (create if required).";
        }
        const textDocument = await (0, utils_1.getTextDocumentFromPath)(filePath);
        if (!textDocument) {
            return "Unable to read file contents. Text document could not be created.";
        }
        const { importEdges, exportEdges } = await codeParser.createNodesFromDocument(textDocument);
        return new messages_1.ToolMessage({
            id: config.callbacks._parentRunId,
            content: JSON.stringify({
                id: config.toolCall.id,
                content: textDocument.getText(),
                path: node_path_1.default.relative(workspace, input.path),
                explanation: input.explanation,
                importedBy: importEdges,
                exportedTo: exportEdges,
            }),
            tool_call_id: config.toolCall.id,
        });
    }, {
        name: "read_file",
        description: "Reads the contents of a specific file, includes file path, files that depend on this file (imported by), and files that consume this file (exported to) in response.",
        schema: exports.readFileSchema,
    });
};
exports.createReadFileTool = createReadFileTool;
//# sourceMappingURL=read_file.js.map