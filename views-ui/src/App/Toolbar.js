"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vsc_1 = require("react-icons/vsc");
const hi_1 = require("react-icons/hi");
const settingsContext_1 = require("./context/settingsContext");
const composerContext_1 = require("./context/composerContext");
const md_1 = require("react-icons/md");
const vscode_1 = require("./utilities/vscode");
const viewName = {
    composer: "Wingman",
};
function Toolbar() {
    const { isLightTheme, view, setView, } = (0, settingsContext_1.useSettingsContext)();
    const { activeThread, setComposerStates, setActiveComposerState, setFileDiagnostics } = (0, composerContext_1.useComposerContext)();
    const buttonBaseClasses = "rounded transition-colors duration-300 p-2";
    const buttonActiveClasses = isLightTheme
        ? "bg-gray-300 text-black"
        : "bg-gray-700 text-white";
    const buttonInactiveClasses = isLightTheme
        ? "text-black hover:bg-gray-200"
        : "text-white hover:bg-gray-800";
    return (<div className="flex justify-between items-center gap-4">
			<h2 className="text-lg font-bold flex-auto">{viewName[view]}</h2>
			<button type="button" className={`${buttonBaseClasses} ${view === "composer"
            ? buttonActiveClasses
            : buttonInactiveClasses}`} onClick={() => setView("composer")} title="Composer">
				<hi_1.HiLightningBolt size={24}/>
			</button>
			<button type="button" className={`${buttonBaseClasses} ${buttonInactiveClasses}`} onClick={() => {
            vscode_1.vscode.postMessage({ command: 'openSettings' });
        }} title="Settings">
				<md_1.MdSettings size={24}/>
			</button>
			<button type="button" className={`${buttonBaseClasses} ${buttonInactiveClasses}`} onClick={() => {
            if (!activeThread)
                return;
            vscode_1.vscode.postMessage({
                command: "clear-chat-history",
            });
            setComposerStates(states => {
                const stateIndex = states.findIndex(s => s.threadId === activeThread.id);
                if (stateIndex === -1)
                    return [...states];
                states[stateIndex].messages = [];
                return [...states];
            });
            setActiveComposerState(state => {
                if (!state)
                    return;
                state.messages = [];
                return { ...state };
            });
            setFileDiagnostics([]);
        }} title="Clear chat history">
				<vsc_1.VscClearAll size={24} role="presentation"/>
			</button>
		</div>);
}
exports.default = Toolbar;
//# sourceMappingURL=Toolbar.js.map