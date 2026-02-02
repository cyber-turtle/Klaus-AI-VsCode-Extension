"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createThinkingTool = exports.readFileSchema = void 0;
const tools_1 = require("@langchain/core/tools");
const messages_1 = require("@langchain/core/messages");
const zod_1 = require("zod");
exports.readFileSchema = zod_1.z.object({
    thought: zod_1.z.object({
        type: zod_1.z.string(),
        description: zod_1.z.string().describe("Your thoughts in plain text"),
    }),
});
/**
 * Creates a tool that reads file contents
 */
const createThinkingTool = () => {
    return (0, tools_1.tool)(async (input, config) => {
        return new messages_1.ToolMessage({
            id: config.callbacks._parentRunId,
            content: JSON.stringify({
                input,
            }),
            tool_call_id: config.toolCall.id,
        });
    }, {
        name: "think",
        description: "Use the tool to think about something. It will not obtain new information or make any changes to the repository, but just log the thought. Use it when complex reasoning or brainstorming is needed. For example, if you explore the repo and discover the source of a bug, call this tool to brainstorm several unique ways of fixing the bug, and assess which change(s) are likely to be simplest and most effective. Alternatively, if you receive some test results, call this tool to brainstorm ways to fix the failing tests.",
        schema: exports.readFileSchema,
    });
};
exports.createThinkingTool = createThinkingTool;
//# sourceMappingURL=think.js.map