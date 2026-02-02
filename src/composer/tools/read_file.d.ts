import type { CodeParser } from "../../server/files/parser";
import { ToolMessage } from "@langchain/core/messages";
export declare const readFileSchema: import("zod").ZodObject<import("zod").objectUtil.extendShape<import("zod").objectUtil.extendShape<{
    explanation: import("zod").ZodString;
}, {
    path: import("zod").ZodString;
}>, {}>, "strip", import("zod").ZodTypeAny, {
    path: string;
    explanation: string;
}, {
    path: string;
    explanation: string;
}>;
/**
 * Creates a tool that reads file contents
 */
export declare const createReadFileTool: (workspace: string, codeParser: CodeParser) => import("@langchain/core/tools").DynamicStructuredTool<import("zod").ZodObject<import("zod").objectUtil.extendShape<import("zod").objectUtil.extendShape<{
    explanation: import("zod").ZodString;
}, {
    path: import("zod").ZodString;
}>, {}>, "strip", import("zod").ZodTypeAny, {
    path: string;
    explanation: string;
}, {
    path: string;
    explanation: string;
}>, {
    path: string;
    explanation: string;
}, {
    path: string;
    explanation: string;
}, ToolMessage | "File does not exist (create if required)." | "Unable to read file contents. Text document could not be created.">;
//# sourceMappingURL=read_file.d.ts.map