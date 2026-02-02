"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createResearchTool = exports.researchSchema = void 0;
const tools_1 = require("@langchain/core/tools");
const zod_1 = require("zod");
const schemas_1 = require("./schemas");
const web_1 = require("../../server/web");
const messages_1 = require("@langchain/core/messages");
exports.researchSchema = schemas_1.baseToolSchema.extend({
    query: zod_1.z
        .string()
        .describe("The search query to research. Should be a specific topic, not code."),
    maxDepth: zod_1.z
        .number()
        .optional()
        .describe("Maximum depth of research (1-3). Defaults to 2."),
});
/**
 * Creates a tool that performs deep web research on a topic
 */
const createResearchTool = (workspace, aiProvider) => {
    const crawler = new web_1.WebCrawler(aiProvider);
    return (0, tools_1.tool)(async (input, config) => {
        const { query, maxDepth } = input;
        // Validate that the query is not code
        if (query.includes("{") ||
            query.includes("}") ||
            query.includes("function") ||
            query.includes("=>") ||
            query.includes("class ") ||
            query.includes("import ")) {
            return "Research queries should be about topics, not code snippets. Please provide a topic to research.";
        }
        try {
            // Set max depth if provided
            if (maxDepth !== undefined && maxDepth >= 1 && maxDepth <= 3) {
                // Note: The WebCrawler class would need to be updated to support this parameter
                // For now, we'll just use the default depth
            }
            // Perform deep research
            const researchResults = await crawler.deepResearch(query);
            return new messages_1.ToolMessage({
                id: config.callbacks._parentRunId,
                content: `# Research Results: ${query}\n\n${researchResults}\n\n---\nResearch complete.`,
                tool_call_id: config.toolCall.id,
            });
        }
        catch (error) {
            if (error instanceof Error) {
                return `Error performing research: ${error.message}`;
            }
            return "An unknown error occurred during research.";
        }
    }, {
        name: "research",
        description: "Performs deep web research on a topic, exploring multiple relevant sources to provide comprehensive information. Use for learning about concepts, technologies, or gathering information on specific topics. Do not use for code snippets.",
        schema: exports.researchSchema,
    });
};
exports.createResearchTool = createResearchTool;
//# sourceMappingURL=research.js.map