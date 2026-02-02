import { ToolMessage } from "@langchain/core/messages";
import type { AIProvider } from "../../service/base";
import { z } from "zod";
export declare const generateImageSchema: z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    imageDescription: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    explanation: string;
    imageDescription: string;
}, {
    explanation: string;
    imageDescription: string;
}>;
/**
 * Creates a tool that reads file contents
 */
export declare const createImageGenerationTool: (aiProvider: AIProvider) => import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    imageDescription: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    explanation: string;
    imageDescription: string;
}, {
    explanation: string;
    imageDescription: string;
}>, {
    explanation: string;
    imageDescription: string;
}, {
    explanation: string;
    imageDescription: string;
}, ToolMessage>;
//# sourceMappingURL=generate_image.d.ts.map