"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMessage = exports.AssistantMessage = exports.ToolMessage = exports.BaseMessage = void 0;
class BaseMessage {
}
exports.BaseMessage = BaseMessage;
class ToolMessage extends BaseMessage {
    constructor(id, name, toolCallId, content, type, metadata) {
        super();
        this.id = id;
        this.name = name;
        this.role = "tool";
        this.toolCallId = toolCallId;
        this.content = content;
        this.metadata = metadata;
        this.type = type;
        this.role = "tool";
    }
}
exports.ToolMessage = ToolMessage;
class AssistantMessage extends BaseMessage {
    constructor(id, input, inputTokens, outputTokens) {
        super();
        this.id = id;
        this.content = input;
        this.role = "assistant";
        this.inputTokens = inputTokens;
        this.outputTokens = outputTokens;
    }
}
exports.AssistantMessage = AssistantMessage;
class UserMessage extends BaseMessage {
    constructor(id, input, image) {
        super();
        this.id = id;
        this.content = input;
        this.role = "user";
        this.image = image;
    }
}
exports.UserMessage = UserMessage;
//# sourceMappingURL=Composer.js.map