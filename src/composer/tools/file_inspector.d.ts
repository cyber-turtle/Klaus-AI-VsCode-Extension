import { ToolMessage } from "@langchain/core/messages";
import type { DiagnosticRetriever } from "../../server/retriever";
export declare const fileInspectorSchema: import("zod").ZodObject<import("zod").objectUtil.extendShape<import("zod").objectUtil.extendShape<{
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
 * Inspects a file for linting issues, syntax errors, and other diagnostics.
 */
export declare const createFileInspectorTool: (retriever: DiagnosticRetriever, workspace: string) => import("@langchain/core/tools").DynamicStructuredTool<import("zod").ZodObject<import("zod").objectUtil.extendShape<import("zod").objectUtil.extendShape<{
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
}, ToolMessage>;
//# sourceMappingURL=file_inspector.d.ts.map