import { z } from "zod";
import type { VectorStore } from "../../server/files/vector";
import { ToolMessage } from "@langchain/core/messages";
export declare const semanticSearchSchema: z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    query: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    query: string;
    explanation: string;
}, {
    query: string;
    explanation: string;
}>;
/**
 * Creates a tool that performs semantic searches against a vector database
 */
export declare const createSemanticSearchTool: (settings: Settings, vectorStore: VectorStore) => import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    query: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    query: string;
    explanation: string;
}, {
    query: string;
    explanation: string;
}>, {
    query: string;
    explanation: string;
}, {
    query: string;
    explanation: string;
}, ToolMessage>;
//# sourceMappingURL=semantic_search.d.ts.map