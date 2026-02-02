"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOnScreen = void 0;
const react_1 = require("react");
const useOnScreen = (rootMargin = "0px") => {
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const ref = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, { rootMargin });
        if (ref.current) {
            observer.observe(ref.current);
        }
        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [rootMargin]);
    return [ref, isVisible];
};
exports.useOnScreen = useOnScreen;
//# sourceMappingURL=useOnScreen.js.map