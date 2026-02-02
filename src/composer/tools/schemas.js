"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseFileSchema = exports.baseToolSchema = void 0;
const zod_1 = require("zod");
exports.baseToolSchema = zod_1.z.object({
    explanation: zod_1.z
        .string()
        .describe("One sentence explanation of why you chose this tool"),
});
exports.baseFileSchema = exports.baseToolSchema.extend({
    path: zod_1.z.string().describe("The path of the file relative to the workspace"),
});
//# sourceMappingURL=schemas.js.map