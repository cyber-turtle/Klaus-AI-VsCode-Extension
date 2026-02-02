"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTextSplitter = exports.trimMessages = exports.mergeMessageRuns = exports.filterMessages = void 0;
const messages_1 = require("@langchain/core/messages");
const runnables_1 = require("@langchain/core/runnables");
const messageClassTypeCache = new Map();
const _isMessageType = (msg, types) => {
    const typesAsStrings = [
        ...new Set(types?.map((t) => {
            if (typeof t === "string") {
                return t;
            }
            // Check if we already have this class in our cache
            if (messageClassTypeCache.has(t)) {
                return messageClassTypeCache.get(t);
            }
            // If not, instantiate and cache it
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const instantiatedMsgClass = new t({});
            if (!("getType" in instantiatedMsgClass) ||
                typeof instantiatedMsgClass.getType !== "function") {
                throw new Error("Invalid type provided.");
            }
            const typeString = instantiatedMsgClass.getType();
            messageClassTypeCache.set(t, typeString);
            return typeString;
        })),
    ];
    const msgType = msg.getType();
    return typesAsStrings.some((t) => t === msgType);
};
function filterMessages(messagesOrOptions, options) {
    if (Array.isArray(messagesOrOptions)) {
        const filtered = _filterMessages(messagesOrOptions, options);
        // Add integrity check for tool_use blocks
        return ensureToolUseResultIntegrity(filtered);
    }
    return runnables_1.RunnableLambda.from((input) => {
        const filtered = _filterMessages(input, messagesOrOptions);
        // Add integrity check here too
        return ensureToolUseResultIntegrity(filtered);
    });
}
exports.filterMessages = filterMessages;
// In the _mergeMessageRuns function or any function that deals with message filtering:
function ensureToolUseResultIntegrity(messages) {
    // Create a working copy so we can modify safely
    const workingMessages = [...messages];
    let modified = false;
    // Process messages from start to end
    for (let i = 0; i < workingMessages.length; i++) {
        const msg = workingMessages[i];
        // Skip non-AI messages or those without array content
        if (msg.getType() !== "ai" || !Array.isArray(msg.content)) {
            continue;
        }
        // Track tool_use blocks in this message
        const toolUseIds = [];
        for (const block of msg.content) {
            if (block.type === "tool_use" && block.id) {
                toolUseIds.push(block.id);
            }
        }
        // If we found tool_use blocks, ensure the next message has matching tool_result blocks
        if (toolUseIds.length > 0) {
            // Check if there's a next message
            const nextIndex = i + 1;
            if (nextIndex >= workingMessages.length) {
                // No next message exists, so we need to remove the tool_use blocks
                const filteredContent = msg.content.filter((block) => block.type !== "tool_use");
                if (filteredContent.length > 0) {
                    msg.content = filteredContent;
                    modified = true;
                }
                else {
                    // If no content remains, remove this message
                    workingMessages.splice(i, 1);
                    i--; // Adjust index since we removed an item
                    modified = true;
                }
                continue;
            }
            // Get the next message
            const nextMsg = workingMessages[nextIndex];
            // Check if it's an AI message with array content
            if (nextMsg.getType() !== "ai" || !Array.isArray(nextMsg.content)) {
                // Next message doesn't have the right structure, so remove tool_use blocks
                const filteredContent = msg.content.filter((block) => block.type !== "tool_use");
                if (filteredContent.length > 0) {
                    msg.content = filteredContent;
                    modified = true;
                }
                else {
                    // If no content remains, remove this message
                    workingMessages.splice(i, 1);
                    i--; // Adjust index since we removed an item
                    modified = true;
                }
                continue;
            }
            // Check if next message begins with matching tool_result blocks
            const matchingToolResults = {};
            let allToolResultsFound = true;
            // Count tool_result blocks at the beginning
            let resultIndex = 0;
            for (const block of nextMsg.content) {
                if (block.type === "tool_result" && block.tool_use_id) {
                    matchingToolResults[block.tool_use_id] = true;
                    resultIndex++;
                }
                else {
                    // We've reached a non-tool_result block
                    break;
                }
            }
            // Check if all tool_use IDs have matching tool_results
            for (const id of toolUseIds) {
                if (!matchingToolResults[id]) {
                    allToolResultsFound = false;
                    break;
                }
            }
            // If not all tool_results were found, remove the corresponding tool_use blocks
            if (!allToolResultsFound) {
                // Only keep tool_use blocks that have matching tool_results
                const filteredContent = msg.content.filter((block) => block.type !== "tool_use" ||
                    (block.id && matchingToolResults[block.id]));
                if (filteredContent.length > 0) {
                    msg.content = filteredContent;
                    modified = true;
                }
                else {
                    // If no content remains, remove this message
                    workingMessages.splice(i, 1);
                    i--; // Adjust index since we removed an item
                    modified = true;
                }
            }
        }
    }
    return modified ? workingMessages : messages;
}
function _filterMessages(messages, options = {}) {
    const { includeNames, excludeNames, includeTypes, excludeTypes, includeIds, excludeIds, } = options;
    const filtered = [];
    for (const msg of messages) {
        if (excludeNames && msg.name && excludeNames.includes(msg.name)) {
            continue;
        }
        if (excludeTypes && _isMessageType(msg, excludeTypes)) {
            continue;
        }
        if (excludeIds && msg.id && excludeIds.includes(msg.id)) {
            continue;
        }
        // default to inclusion when no inclusion criteria given.
        if (!(includeTypes || includeIds || includeNames)) {
            filtered.push(msg);
        }
        else if (includeNames &&
            msg.name &&
            includeNames.some((iName) => iName === msg.name)) {
            filtered.push(msg);
        }
        else if (includeTypes && _isMessageType(msg, includeTypes)) {
            filtered.push(msg);
        }
        else if (includeIds && msg.id && includeIds.some((id) => id === msg.id)) {
            filtered.push(msg);
        }
    }
    return filtered;
}
function mergeMessageRuns(messages) {
    if (Array.isArray(messages)) {
        return _mergeMessageRuns(messages);
    }
    return runnables_1.RunnableLambda.from(_mergeMessageRuns);
}
exports.mergeMessageRuns = mergeMessageRuns;
function _mergeMessageRuns(messages) {
    if (!messages.length) {
        return [];
    }
    const merged = [];
    for (const msg of messages) {
        const curr = msg;
        const last = merged.pop();
        if (!last) {
            merged.push(curr);
        }
        else if (curr.getType() === "tool" ||
            !(curr.getType() === last.getType())) {
            merged.push(last, curr);
        }
        else {
            const lastChunk = (0, messages_1.convertToChunk)(last);
            const currChunk = (0, messages_1.convertToChunk)(curr);
            const mergedChunks = lastChunk.concat(currChunk);
            if (typeof lastChunk.content === "string" &&
                typeof currChunk.content === "string") {
                mergedChunks.content = `${lastChunk.content}\n${currChunk.content}`;
            }
            merged.push(_chunkToMsg(mergedChunks));
        }
    }
    return merged;
}
function trimMessages(messagesOrOptions, options) {
    if (Array.isArray(messagesOrOptions)) {
        const messages = messagesOrOptions;
        if (!options) {
            throw new Error("Options parameter is required when providing messages.");
        }
        return _trimMessagesHelper(messages, options);
    }
    const trimmerOptions = messagesOrOptions;
    return runnables_1.RunnableLambda.from((input) => _trimMessagesHelper(input, trimmerOptions)).withConfig({
        runName: "trim_messages",
    });
}
exports.trimMessages = trimMessages;
async function _trimMessagesHelper(messages, options) {
    const { maxTokens, tokenCounter, strategy = "last", allowPartial = false, endOn, startOn, includeSystem = false, textSplitter, } = options;
    if (startOn && strategy === "first") {
        throw new Error("`startOn` should only be specified if `strategy` is 'last'.");
    }
    if (includeSystem && strategy === "first") {
        throw new Error("`includeSystem` should only be specified if `strategy` is 'last'.");
    }
    let listTokenCounter;
    if ("getNumTokens" in tokenCounter) {
        listTokenCounter = async (msgs) => {
            const tokenCounts = await Promise.all(msgs.map((msg) => tokenCounter.getNumTokens(msg.content)));
            return tokenCounts.reduce((sum, count) => sum + count, 0);
        };
    }
    else {
        listTokenCounter = async (msgs) => tokenCounter(msgs);
    }
    let textSplitterFunc = defaultTextSplitter;
    if (textSplitter) {
        if ("splitText" in textSplitter) {
            textSplitterFunc = textSplitter.splitText;
        }
        else {
            textSplitterFunc = async (text) => textSplitter(text);
        }
    }
    if (strategy === "first") {
        return _firstMaxTokens(messages, {
            maxTokens,
            tokenCounter: listTokenCounter,
            textSplitter: textSplitterFunc,
            partialStrategy: allowPartial ? "first" : undefined,
            endOn,
        });
    }
    if (strategy === "last") {
        return _lastMaxTokens(messages, {
            maxTokens,
            tokenCounter: listTokenCounter,
            textSplitter: textSplitterFunc,
            allowPartial,
            includeSystem,
            startOn,
            endOn,
        });
    }
    throw new Error(`Unrecognized strategy: '${strategy}'. Must be one of 'first' or 'last'.`);
}
async function _firstMaxTokens(messages, options) {
    const { maxTokens, tokenCounter, textSplitter, partialStrategy, endOn } = options;
    let messagesCopy = [...messages];
    let idx = 0;
    for (let i = 0; i < messagesCopy.length; i += 1) {
        const remainingMessages = i > 0 ? messagesCopy.slice(0, -i) : messagesCopy;
        if ((await tokenCounter(remainingMessages)) <= maxTokens) {
            idx = messagesCopy.length - i;
            break;
        }
    }
    if (idx < messagesCopy.length - 1 && partialStrategy) {
        let includedPartial = false;
        if (Array.isArray(messagesCopy[idx].content)) {
            const excluded = messagesCopy[idx];
            if (typeof excluded.content === "string") {
                throw new Error("Expected content to be an array.");
            }
            const numBlock = excluded.content.length;
            const reversedContent = partialStrategy === "last"
                ? [...excluded.content].reverse()
                : excluded.content;
            for (let i = 1; i <= numBlock; i += 1) {
                const partialContent = partialStrategy === "first"
                    ? reversedContent.slice(0, i)
                    : reversedContent.slice(-i);
                const fields = Object.fromEntries(Object.entries(excluded).filter(([k]) => k !== "type" && !k.startsWith("lc_")));
                const updatedMessage = _switchTypeToMessage(excluded.getType(), {
                    ...fields,
                    content: partialContent,
                });
                const slicedMessages = [...messagesCopy.slice(0, idx), updatedMessage];
                if ((await tokenCounter(slicedMessages)) <= maxTokens) {
                    messagesCopy = slicedMessages;
                    idx += 1;
                    includedPartial = true;
                }
                else {
                    break;
                }
            }
            if (includedPartial && partialStrategy === "last") {
                excluded.content = [...reversedContent].reverse();
            }
        }
        if (!includedPartial) {
            const excluded = messagesCopy[idx];
            let text;
            if (Array.isArray(excluded.content) &&
                excluded.content.some((block) => typeof block === "string" || block.type === "text")) {
                const textBlock = excluded.content.find((block) => block.type === "text" && block.text);
                text = textBlock?.text;
            }
            else if (typeof excluded.content === "string") {
                text = excluded.content;
            }
            if (text) {
                const splitTexts = await textSplitter(text);
                const numSplits = splitTexts.length;
                if (partialStrategy === "last") {
                    splitTexts.reverse();
                }
                for (let _ = 0; _ < numSplits - 1; _ += 1) {
                    splitTexts.pop();
                    excluded.content = splitTexts.join("");
                    if ((await tokenCounter([...messagesCopy.slice(0, idx), excluded])) <=
                        maxTokens) {
                        if (partialStrategy === "last") {
                            excluded.content = [...splitTexts].reverse().join("");
                        }
                        messagesCopy = [...messagesCopy.slice(0, idx), excluded];
                        idx += 1;
                        break;
                    }
                }
            }
        }
    }
    if (endOn) {
        const endOnArr = Array.isArray(endOn) ? endOn : [endOn];
        while (idx > 0 && !_isMessageType(messagesCopy[idx - 1], endOnArr)) {
            idx -= 1;
        }
    }
    return messagesCopy.slice(0, idx);
}
async function _lastMaxTokens(messages, options) {
    const { allowPartial = false, includeSystem = false, endOn, startOn, ...rest } = options;
    // Create a copy of messages to avoid mutation
    let messagesCopy = messages.map((message) => {
        const fields = Object.fromEntries(Object.entries(message).filter(([k]) => k !== "type" && !k.startsWith("lc_")));
        const msgType = "getType" in message ? message.getType() : "tool";
        return _switchTypeToMessage(msgType, fields, (0, messages_1.isBaseMessageChunk)(message));
    });
    if (endOn) {
        const endOnArr = Array.isArray(endOn) ? endOn : [endOn];
        while (messagesCopy.length > 0 &&
            !_isMessageType(messagesCopy[messagesCopy.length - 1], endOnArr)) {
            messagesCopy = messagesCopy.slice(0, -1);
        }
    }
    const swappedSystem = includeSystem && messagesCopy[0]?.getType() === "system";
    let reversed_ = swappedSystem
        ? messagesCopy.slice(0, 1).concat(messagesCopy.slice(1).reverse())
        : messagesCopy.reverse();
    reversed_ = await _firstMaxTokens(reversed_, {
        ...rest,
        partialStrategy: allowPartial ? "last" : undefined,
        endOn: startOn,
    });
    if (swappedSystem) {
        return [reversed_[0], ...reversed_.slice(1).reverse()];
    }
    return reversed_.reverse();
}
const _MSG_CHUNK_MAP = {
    human: {
        message: messages_1.HumanMessage,
        messageChunk: messages_1.HumanMessageChunk,
    },
    ai: {
        message: messages_1.AIMessage,
        messageChunk: messages_1.AIMessageChunk,
    },
    system: {
        message: messages_1.SystemMessage,
        messageChunk: messages_1.SystemMessageChunk,
    },
    developer: {
        message: messages_1.SystemMessage,
        messageChunk: messages_1.SystemMessageChunk,
    },
    tool: {
        message: messages_1.ToolMessage,
        messageChunk: messages_1.ToolMessageChunk,
    },
    function: {
        message: messages_1.FunctionMessage,
        messageChunk: messages_1.FunctionMessageChunk,
    },
    generic: {
        message: messages_1.ChatMessage,
        messageChunk: messages_1.ChatMessageChunk,
    },
    remove: {
        message: messages_1.RemoveMessage,
        messageChunk: messages_1.RemoveMessage, // RemoveMessage does not have a chunk class.
    },
};
function _switchTypeToMessage(messageType, fields, returnChunk) {
    let chunk;
    let msg;
    switch (messageType) {
        case "human":
            if (returnChunk) {
                chunk = new messages_1.HumanMessageChunk(fields);
            }
            else {
                msg = new messages_1.HumanMessage(fields);
            }
            break;
        case "ai":
            if (returnChunk) {
                let aiChunkFields = {
                    ...fields,
                };
                if ("tool_calls" in aiChunkFields) {
                    aiChunkFields = {
                        ...aiChunkFields,
                        tool_call_chunks: aiChunkFields.tool_calls?.map((tc) => ({
                            ...tc,
                            type: "tool_call_chunk",
                            index: undefined,
                            args: JSON.stringify(tc.args),
                        })),
                    };
                }
                chunk = new messages_1.AIMessageChunk(aiChunkFields);
            }
            else {
                msg = new messages_1.AIMessage(fields);
            }
            break;
        case "system":
            if (returnChunk) {
                chunk = new messages_1.SystemMessageChunk(fields);
            }
            else {
                msg = new messages_1.SystemMessage(fields);
            }
            break;
        case "developer":
            if (returnChunk) {
                chunk = new messages_1.SystemMessageChunk({
                    ...fields,
                    additional_kwargs: {
                        ...fields.additional_kwargs,
                        __openai_role__: "developer",
                    },
                });
            }
            else {
                msg = new messages_1.SystemMessage({
                    ...fields,
                    additional_kwargs: {
                        ...fields.additional_kwargs,
                        __openai_role__: "developer",
                    },
                });
            }
            break;
        case "tool":
            if ("tool_call_id" in fields) {
                if (returnChunk) {
                    chunk = new messages_1.ToolMessageChunk(fields);
                }
                else {
                    msg = new messages_1.ToolMessage(fields);
                }
            }
            else {
                throw new Error("Can not convert ToolMessage to ToolMessageChunk if 'tool_call_id' field is not defined.");
            }
            break;
        case "function":
            if (returnChunk) {
                chunk = new messages_1.FunctionMessageChunk(fields);
            }
            else {
                if (!fields.name) {
                    throw new Error("FunctionMessage must have a 'name' field");
                }
                msg = new messages_1.FunctionMessage(fields);
            }
            break;
        case "generic":
            if ("role" in fields) {
                if (returnChunk) {
                    chunk = new messages_1.ChatMessageChunk(fields);
                }
                else {
                    msg = new messages_1.ChatMessage(fields);
                }
            }
            else {
                throw new Error("Can not convert ChatMessage to ChatMessageChunk if 'role' field is not defined.");
            }
            break;
        default:
            throw new Error(`Unrecognized message type ${messageType}`);
    }
    if (returnChunk && chunk) {
        return chunk;
    }
    if (msg) {
        return msg;
    }
    throw new Error(`Unrecognized message type ${messageType}`);
}
function _chunkToMsg(chunk) {
    const chunkType = chunk.getType();
    let msg;
    const fields = Object.fromEntries(Object.entries(chunk).filter(([k]) => !["type", "tool_call_chunks"].includes(k) && !k.startsWith("lc_")));
    if (chunkType in _MSG_CHUNK_MAP) {
        msg = _switchTypeToMessage(chunkType, fields);
    }
    if (!msg) {
        throw new Error(`Unrecognized message chunk class ${chunkType}. Supported classes are ${Object.keys(_MSG_CHUNK_MAP)}`);
    }
    return msg;
}
/**
 * The default text splitter function that splits text by newlines.
 *
 * @param {string} text
 * @returns A promise that resolves to an array of strings split by newlines.
 */
function defaultTextSplitter(text) {
    const splits = text.split("\n");
    return Promise.resolve([
        ...splits.slice(0, -1).map((s) => `${s}\n`),
        splits[splits.length - 1],
    ]);
}
exports.defaultTextSplitter = defaultTextSplitter;
//# sourceMappingURL=tokens.js.map