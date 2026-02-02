import { z } from "zod";
import { ToolMessage } from "@langchain/core/messages";
/**
 * Creates a tool that lists contents of a directory
 */
export declare const createListDirectoryTool: (workspace: string, withCache?: boolean) => import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    directory: z.ZodString;
    depth: z.ZodOptional<z.ZodNumber>;
}>, "strip", z.ZodTypeAny, {
    directory: string;
    explanation: string;
    depth?: number | undefined;
}, {
    directory: string;
    explanation: string;
    depth?: number | undefined;
}>, {
    directory: string;
    explanation: string;
    depth?: number | undefined;
}, {
    directory: string;
    explanation: string;
    depth?: number | undefined;
}, string | ToolMessage>;
//# sourceMappingURL=list_workspace_files.d.ts.map