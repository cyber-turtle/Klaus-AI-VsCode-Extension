import { z } from "zod";
import { ToolMessage } from "@langchain/core/messages";
export declare const writeFileSchema: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    path: z.ZodString;
}>, {
    contents: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    path: string;
    explanation: string;
    contents: string;
}, {
    path: string;
    explanation: string;
    contents: string;
}>;
export declare const generateFileMetadata: (workspace: string, id: string, input: z.infer<typeof writeFileSchema>) => Promise<FileMetadata>;
/**
 * Creates a write file tool with the given workspace
 */
export declare const createWriteFileTool: (workspace: string, autoCommit?: boolean) => import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    path: z.ZodString;
}>, {
    contents: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    path: string;
    explanation: string;
    contents: string;
}, {
    path: string;
    explanation: string;
    contents: string;
}>, {
    path: string;
    explanation: string;
    contents: string;
}, {
    path: string;
    explanation: string;
    contents: string;
}, ToolMessage>;
//# sourceMappingURL=write_file.d.ts.map