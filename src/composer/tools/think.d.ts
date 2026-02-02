import { ToolMessage } from "@langchain/core/messages";
import { z } from "zod";
export declare const readFileSchema: z.ZodObject<{
    thought: z.ZodObject<{
        type: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        description: string;
    }, {
        type: string;
        description: string;
    }>;
}, "strip", z.ZodTypeAny, {
    thought: {
        type: string;
        description: string;
    };
}, {
    thought: {
        type: string;
        description: string;
    };
}>;
/**
 * Creates a tool that reads file contents
 */
export declare const createThinkingTool: () => import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<{
    thought: z.ZodObject<{
        type: z.ZodString;
        description: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type: string;
        description: string;
    }, {
        type: string;
        description: string;
    }>;
}, "strip", z.ZodTypeAny, {
    thought: {
        type: string;
        description: string;
    };
}, {
    thought: {
        type: string;
        description: string;
    };
}>, {
    thought: {
        type: string;
        description: string;
    };
}, {
    thought: {
        type: string;
        description: string;
    };
}, ToolMessage>;
//# sourceMappingURL=think.d.ts.map