"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTools = void 0;
const react_1 = require("react");
const useTools = (state) => {
    const toolMap = (0, react_1.useMemo)(() => {
        const map = new Map();
        for (const msg of state.messages) {
            if (msg.role === "tool") {
                const message = msg;
                if (map.has(message.toolCallId)) {
                    const existingMessages = map.get(message.toolCallId);
                    existingMessages.push(message);
                }
                else {
                    map.set(message.toolCallId, [message]);
                }
            }
        }
        return map;
    }, [state]);
    return {
        toolMap,
    };
};
exports.useTools = useTools;
//# sourceMappingURL=useTools.js.map