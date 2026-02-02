"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
const DiffView_1 = __importDefault(require("./DiffView"));
require("./App.css");
function App() {
    const [diff, setDiff] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        window.addEventListener("message", handleResponse);
        return () => {
            window.removeEventListener("message", handleResponse);
        };
    }, []);
    const handleResponse = (event) => {
        const { data } = event;
        const { command, value } = data;
        switch (command) {
            case "diff-file":
                setDiff(value);
                break;
        }
    };
    if (!diff)
        return null;
    return <DiffView_1.default diff={diff}/>;
}
exports.default = App;
//# sourceMappingURL=App.js.map