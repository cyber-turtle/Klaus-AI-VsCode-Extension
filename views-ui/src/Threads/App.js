"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("react");
require("./App.css");
const ThreadVisualization_1 = __importDefault(require("./ThreadVisualization"));
const vscode_1 = require("./utilities/vscode");
function App() {
    const [threads, setThreads] = (0, react_1.useState)();
    const [activeThreadId, setActiveThreadId] = (0, react_1.useState)();
    (0, react_1.useEffect)(() => {
        window.addEventListener("message", handleResponse);
        // Request thread data when component mounts
        vscode_1.vscode.postMessage({
            command: "get-threads"
        });
        return () => {
            window.removeEventListener("message", handleResponse);
        };
    }, []);
    const handleResponse = (event) => {
        const { data } = event;
        const { command, value } = data;
        switch (command) {
            case "thread-data": {
                const { states, activeThreadId } = value;
                const threads = states.map(s => ({
                    id: s.threadId,
                    title: s.title,
                    createdAt: s.createdAt,
                    parentThreadId: s.parentThreadId
                }));
                setThreads(threads);
                setActiveThreadId(activeThreadId);
                break;
            }
        }
    };
    const handleThreadSelect = (threadId) => {
        vscode_1.vscode.postMessage({
            command: "switch-thread",
            value: threadId
        });
        setActiveThreadId(threadId);
    };
    if (!threads) {
        return null;
    }
    return (<div className="app-container">
			<ThreadVisualization_1.default threads={threads} activeThreadId={activeThreadId} onThreadSelect={handleThreadSelect}/>
		</div>);
}
exports.default = App;
//# sourceMappingURL=App.js.map