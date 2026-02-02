import { ToolMessage } from "@langchain/core/messages";
import { z } from "zod";
export declare const webSearchSchema: z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    url: z.ZodString;
    options: z.ZodOptional<z.ZodObject<{
        timeout: z.ZodOptional<z.ZodNumber>;
        retries: z.ZodOptional<z.ZodNumber>;
        delay: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeout?: number | undefined;
        retries?: number | undefined;
        delay?: number | undefined;
    }, {
        timeout?: number | undefined;
        retries?: number | undefined;
        delay?: number | undefined;
    }>>;
}>, "strip", z.ZodTypeAny, {
    url: string;
    explanation: string;
    options?: {
        timeout?: number | undefined;
        retries?: number | undefined;
        delay?: number | undefined;
    } | undefined;
}, {
    url: string;
    explanation: string;
    options?: {
        timeout?: number | undefined;
        retries?: number | undefined;
        delay?: number | undefined;
    } | undefined;
}>;
/**
 * Creates a tool that searches a web page and returns its content as markdown
 * Simplified implementation with improved SPA detection
 */
export declare const createWebSearchTool: (storagePath: string) => import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    url: z.ZodString;
    options: z.ZodOptional<z.ZodObject<{
        timeout: z.ZodOptional<z.ZodNumber>;
        retries: z.ZodOptional<z.ZodNumber>;
        delay: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeout?: number | undefined;
        retries?: number | undefined;
        delay?: number | undefined;
    }, {
        timeout?: number | undefined;
        retries?: number | undefined;
        delay?: number | undefined;
    }>>;
}>, "strip", z.ZodTypeAny, {
    url: string;
    explanation: string;
    options?: {
        timeout?: number | undefined;
        retries?: number | undefined;
        delay?: number | undefined;
    } | undefined;
}, {
    url: string;
    explanation: string;
    options?: {
        timeout?: number | undefined;
        retries?: number | undefined;
        delay?: number | undefined;
    } | undefined;
}>, {
    url: string;
    explanation: string;
    options?: {
        timeout?: number | undefined;
        retries?: number | undefined;
        delay?: number | undefined;
    } | undefined;
}, {
    url: string;
    explanation: string;
    options?: {
        timeout?: number | undefined;
        retries?: number | undefined;
        delay?: number | undefined;
    } | undefined;
}, string | ToolMessage>;
//# sourceMappingURL=web_search.d.ts.map