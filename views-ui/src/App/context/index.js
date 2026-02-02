"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootProvider = void 0;
const react_1 = require("react");
const settingsContext_1 = require("./settingsContext");
const composerContext_1 = require("./composerContext");
const vscode_1 = require("../utilities/vscode");
const RootProvider = ({ children }) => {
    (0, react_1.useEffect)(() => {
        vscode_1.vscode.postMessage({ command: "ready" });
    }, []);
    return (<settingsContext_1.SettingsProvider>
			<composerContext_1.ComposerProvider>
				{children}
			</composerContext_1.ComposerProvider>
		</settingsContext_1.SettingsProvider>);
};
exports.RootProvider = RootProvider;
//# sourceMappingURL=index.js.map