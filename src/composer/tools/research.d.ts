import { z } from "zod";
import type { AIProvider } from "../../service/base";
import { ToolMessage } from "@langchain/core/messages";
export declare const researchSchema: z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    query: z.ZodString;
    maxDepth: z.ZodOptional<z.ZodNumber>;
}>, "strip", z.ZodTypeAny, {
    query: string;
    explanation: string;
    maxDepth?: number | undefined;
}, {
    query: string;
    explanation: string;
    maxDepth?: number | undefined;
}>;
/**
 * Creates a tool that performs deep web research on a topic
 */
export declare const createResearchTool: (workspace: string, aiProvider: AIProvider) => import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    query: z.ZodString;
    maxDepth: z.ZodOptional<z.ZodNumber>;
}>, "strip", z.ZodTypeAny, {
    query: string;
    explanation: string;
    maxDepth?: number | undefined;
}, {
    query: string;
    explanation: string;
    maxDepth?: number | undefined;
}>, {
    query: string;
    explanation: string;
    maxDepth?: number | undefined;
}, {
    query: string;
    explanation: string;
    maxDepth?: number | undefined;
}, string | ToolMessage>;
//# sourceMappingURL=research.d.ts.map