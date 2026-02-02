"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSemanticSearchTool = exports.semanticSearchSchema = void 0;
const tools_1 = require("@langchain/core/tools");
const schemas_1 = require("./schemas");
const zod_1 = require("zod");
const models_1 = require("../../service/utils/models");
const loggingProvider_1 = require("../../server/loggingProvider");
const messages_1 = require("@langchain/core/messages");
exports.semanticSearchSchema = schemas_1.baseToolSchema.extend({
    query: zod_1.z
        .string()
        .describe("A natural language query to find relevant code files. Be specific about concepts, functionality, or implementation details you're looking for."),
});
/**
 * Creates a tool that performs semantic searches against a vector database
 */
const createSemanticSearchTool = (settings, vectorStore) => {
    const provider = (0, models_1.CreateEmbeddingProvider)(settings, loggingProvider_1.loggingProvider);
    return (0, tools_1.tool)(async (input, config) => {
        const results = await vectorStore.search(await provider.getEmbedder().embedQuery(input.query), 5);
        return new messages_1.ToolMessage({
            id: config.callbacks._parentRunId,
            content: JSON.stringify(results.map((r) => ({
                filePath: r.file_path,
                description: r.summary,
                similarity: r.similarity,
            })) ?? []),
            tool_call_id: config.toolCall.id,
        });
    }, {
        name: "semantic_search",
        description: "Quickly find relevant files across the entire codebase without knowing file locations. Ideal as your first search step when looking for implementation details, features, or understanding how code is organized. Simply describe what you're looking for in natural language, and get back the most relevant files with descriptions and paths. Use this before browsing directories for maximum efficiency.",
        schema: exports.semanticSearchSchema,
    });
};
exports.createSemanticSearchTool = createSemanticSearchTool;
//# sourceMappingURL=semantic_search.js.map