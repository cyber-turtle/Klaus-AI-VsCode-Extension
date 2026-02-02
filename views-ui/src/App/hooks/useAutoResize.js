"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAutoResizeTextArea = void 0;
const react_1 = require("react");
// It would be nice if css fit-content worked here :/
function useAutoResizeTextArea(value) {
    const textAreaRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const textArea = textAreaRef.current;
        if (textArea) {
            // Reset height to auto to get the correct scrollHeight
            textArea.style.height = "auto";
            // Set the height to the scrollHeight
            const newHeight = Math.min(textArea.scrollHeight, 200); // Max height of 200px
            textArea.style.height = `${newHeight}px`;
        }
    }, [value]);
    return textAreaRef;
}
exports.useAutoResizeTextArea = useAutoResizeTextArea;
//# sourceMappingURL=useAutoResize.js.map