import { z } from "zod";
interface WaitForPortOptions {
    timeout?: number;
    retryInterval?: number;
    host?: string;
}
export declare const waitForPort: (port: number, options?: WaitForPortOptions) => Promise<void>;
export declare const backgroundProcessSchema: z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    command: z.ZodString;
    port: z.ZodNumber;
    name: z.ZodString;
    captureOutput: z.ZodOptional<z.ZodBoolean>;
    captureTimeMs: z.ZodOptional<z.ZodNumber>;
}>, "strip", z.ZodTypeAny, {
    command: string;
    name: string;
    explanation: string;
    port: number;
    captureOutput?: boolean | undefined;
    captureTimeMs?: number | undefined;
}, {
    command: string;
    name: string;
    explanation: string;
    port: number;
    captureOutput?: boolean | undefined;
    captureTimeMs?: number | undefined;
}>;
/**
 * Creates a tool that starts a long-running process in the background
 */
export declare const createBackgroundProcessTool: (workspace: string, env?: Record<string, any>) => import("@langchain/core/tools").DynamicStructuredTool<z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    command: z.ZodString;
    port: z.ZodNumber;
    name: z.ZodString;
    captureOutput: z.ZodOptional<z.ZodBoolean>;
    captureTimeMs: z.ZodOptional<z.ZodNumber>;
}>, "strip", z.ZodTypeAny, {
    command: string;
    name: string;
    explanation: string;
    port: number;
    captureOutput?: boolean | undefined;
    captureTimeMs?: number | undefined;
}, {
    command: string;
    name: string;
    explanation: string;
    port: number;
    captureOutput?: boolean | undefined;
    captureTimeMs?: number | undefined;
}>, {
    command: string;
    name: string;
    explanation: string;
    port: number;
    captureOutput?: boolean | undefined;
    captureTimeMs?: number | undefined;
}, {
    command: string;
    name: string;
    explanation: string;
    port: number;
    captureOutput?: boolean | undefined;
    captureTimeMs?: number | undefined;
}, string>;
export declare const cleanupProcesses: () => Promise<void>;
export {};
//# sourceMappingURL=background_process.d.ts.map