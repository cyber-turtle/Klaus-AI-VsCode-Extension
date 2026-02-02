import { z } from "zod";
export declare const baseToolSchema: z.ZodObject<{
    explanation: z.ZodString;
}, "strip", z.ZodTypeAny, {
    explanation: string;
}, {
    explanation: string;
}>;
export declare const baseFileSchema: z.ZodObject<z.objectUtil.extendShape<{
    explanation: z.ZodString;
}, {
    path: z.ZodString;
}>, "strip", z.ZodTypeAny, {
    path: string;
    explanation: string;
}, {
    path: string;
    explanation: string;
}>;
//# sourceMappingURL=schemas.d.ts.map