"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createImageGenerationTool = exports.generateImageSchema = void 0;
const tools_1 = require("@langchain/core/tools");
const schemas_1 = require("./schemas");
const messages_1 = require("@langchain/core/messages");
const zod_1 = require("zod");
exports.generateImageSchema = schemas_1.baseToolSchema.extend({
    imageDescription: zod_1.z.string().describe("The description of the image"),
});
/**
 * Creates a tool that reads file contents
 */
const createImageGenerationTool = (aiProvider) => {
    return (0, tools_1.tool)(async (input, config) => {
        if (!aiProvider.generateImage) {
            throw new Error("Image generation not supported");
        }
        const result = await aiProvider.generateImage(input.imageDescription);
        return new messages_1.ToolMessage({
            id: config.callbacks._parentRunId,
            content: "Image generated successfully",
            additional_kwargs: {
                image: `data:image/png;base64,${result}`,
            },
            tool_call_id: config.toolCall.id,
        });
    }, {
        name: "generate_image",
        description: "Generates an image based off a description, provide a detailed description of the image you want to create.",
        schema: exports.generateImageSchema,
    });
};
exports.createImageGenerationTool = createImageGenerationTool;
//# sourceMappingURL=generate_image.js.map