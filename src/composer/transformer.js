"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformState = void 0;
const Composer_1 = require("@shared/types/Composer");
const messages_1 = require("@langchain/core/messages");
/**
 * Transforms a GraphStateAnnotation into a ComposerState
 */
const transformState = async (state, threadId, workspace, canResume) => {
    const messages = !state.messages ? [] : mapMessages(state.messages);
    return {
        messages,
        threadId,
        canResume,
        title: state.title,
        createdAt: state.createdAt,
        parentThreadId: state.parentThreadId,
    };
};
exports.transformState = transformState;
/**
 * Maps LangChain message types to Composer message types
 */
const mapMessages = (messages) => {
    return messages.flatMap((message) => {
        // Handle HumanMessage
        if (message instanceof messages_1.HumanMessage && !message.additional_kwargs.temp) {
            if (Array.isArray(message.content)) {
                const imageMsg = message.content.find((c) => c.type === "image_url");
                const messageContent = message.content;
                const lastContent = messageContent[messageContent.length - 1];
                return [
                    new Composer_1.UserMessage(message.id, lastContent.text, imageMsg
                        ? {
                            //@ts-expect-error
                            data: imageMsg.image_url.url,
                            ext: "image/jpeg",
                        }
                        : undefined),
                ];
            }
            return [
                new Composer_1.UserMessage(message.id, message.content, undefined),
            ];
        }
        // Handle AIMessageChunk
        if (message instanceof messages_1.AIMessageChunk) {
            const results = [];
            // Handle simple content (string)
            if (!Array.isArray(message.content) && message.content) {
                results.push(new Composer_1.AssistantMessage(message.id, message.content, message.usage_metadata?.input_tokens, message.usage_metadata?.output_tokens));
            }
            else {
                const messageContent = message.content;
                // Add text content
                for (const content of messageContent) {
                    if (content.type === "text" && content.text) {
                        results.push(new Composer_1.AssistantMessage(message.id, content.text, message.usage_metadata?.input_tokens, message.usage_metadata?.output_tokens));
                    }
                }
            }
            // Add tool calls if present
            if (message.tool_calls?.length) {
                for (const toolCall of message.tool_calls) {
                    results.push(new Composer_1.ToolMessage(message.id, toolCall.name, toolCall.id ?? message.id, toolCall.args, "start", message.additional_kwargs));
                }
            }
            return results;
        }
        // Handle LangChainToolMessage
        if (message instanceof messages_1.ToolMessage) {
            let content = message.content;
            if (typeof content === "string") {
                try {
                    content = JSON.parse(content);
                }
                catch { }
            }
            return [
                new Composer_1.ToolMessage(message.id, message.name, message.tool_call_id ?? message.id, content, "end", message.additional_kwargs),
            ];
        }
        // Return empty array for unhandled message types
        return [];
    });
};
//# sourceMappingURL=transformer.js.map