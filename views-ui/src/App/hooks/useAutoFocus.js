"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAutoFocus = void 0;
const react_1 = require("react");
function useAutoFocus() {
    const textAreaRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        if (textAreaRef.current) {
            textAreaRef.current.focus();
        }
    }, []);
    return textAreaRef;
}
exports.useAutoFocus = useAutoFocus;
//# sourceMappingURL=useAutoFocus.js.map