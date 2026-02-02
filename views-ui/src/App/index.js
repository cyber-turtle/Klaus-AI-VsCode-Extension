"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("react-dom/client");
const App_1 = __importDefault(require("./App"));
const context_1 = require("./context");
require("react-tooltip/dist/react-tooltip.css");
const domNode = document.getElementById("root");
if (domNode) {
    const root = (0, client_1.createRoot)(domNode);
    root.render(<context_1.RootProvider>
			<App_1.default />
		</context_1.RootProvider>);
}
else {
    console.error("Failed to find the root element");
}
//# sourceMappingURL=index.js.map