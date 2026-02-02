"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFileInspectorTool = exports.fileInspectorSchema = void 0;
const tools_1 = require("@langchain/core/tools");
const schemas_1 = require("./schemas");
const messages_1 = require("@langchain/core/messages");
const node_path_1 = __importDefault(require("node:path"));
const utils_1 = require("../../server/files/utils");
exports.fileInspectorSchema = schemas_1.baseFileSchema.extend({});
/**
 * Inspects a file for linting issues, syntax errors, and other diagnostics.
 */
const createFileInspectorTool = (retriever, workspace) => {
    return (0, tools_1.tool)(async (input, config) => {
        let fileUri = input.path;
        if (!node_path_1.default.isAbsolute(fileUri)) {
            fileUri = (0, utils_1.filePathToUri)(node_path_1.default.join(workspace, fileUri));
        }
        const result = await retriever.getFileDiagnostics([fileUri]);
        return new messages_1.ToolMessage({
            id: config.callbacks._parentRunId,
            content: "File inspection completed successfully",
            tool_call_id: config.toolCall.id,
        });
    }, {
        name: "file_inspector",
        description: "Inspects a file for linting issues, syntax errors, and other diagnostics.",
        schema: exports.fileInspectorSchema,
    });
};
exports.createFileInspectorTool = createFileInspectorTool;
//# sourceMappingURL=file_inspector.js.map