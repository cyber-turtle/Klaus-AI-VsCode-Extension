import { z } from "zod";
export declare const commandExecuteSchema: z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    command: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    command: string;
    explanation: string;
}, {
    command: string;
    explanation: string;
}>;
/**
 * Creates a tool that executes terminal commands safely
 */
export declare const createCommandExecuteTool: (workspace: string, envVariables?: Record<string, string>, timeoutInMilliseconds?: number) => import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    command: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    command: string;
    explanation: string;
}, {
    command: string;
    explanation: string;
}>, {
    command: string;
    explanation: string;
}, {
    command: string;
    explanation: string;
}, unknown>;
//# sourceMappingURL=cmd_execute.d.ts.map