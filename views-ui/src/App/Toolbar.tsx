import { useSettingsContext, type View } from "./context/settingsContext";
import { useComposerContext } from "./context/composerContext";
import { vscode } from "./utilities/vscode";
import { TbBolt, TbSettings, TbTrash } from "react-icons/tb";

type ViewNames = {
	[key in View]: string;
};

const viewName: ViewNames = {
	composer: "Klaus",
};

export default function Toolbar() {
	const {
		isLightTheme,
		view,
		setView,
	} = useSettingsContext();
	const { activeThread, setComposerStates, setActiveComposerState, setFileDiagnostics } = useComposerContext();

	const toolbarContainerClass = `
		flex items-center justify-between 
		px-2 py-2 mb-2 mx-4 mt-4
		rounded-2xl 
		bg-[var(--vscode-editor-inactiveSelectionBackground)]/30 
		backdrop-blur-sm 
		border border-[var(--vscode-widget-border)]/50
		shadow-sm
	`;

	const toolButtonClass = (isActive: boolean = false) => `
		p-2 rounded-xl transition-all duration-300 relative group
		${isActive 
			? "text-[var(--vscode-textLink-foreground)] bg-[var(--vscode-button-background)]/10" 
			: "text-[var(--vscode-foreground)] opacity-70 hover:opacity-100 hover:bg-[var(--vscode-toolbar-hoverBackground)]"
		}
	`;

	return (
		<div className={toolbarContainerClass}>
			{/* Brand / Mode Switcher */}
			<div className="flex items-center gap-1">
				<button
					type="button"
					className={toolButtonClass(view === "composer")}
					onClick={() => setView("composer")}
					title="Switch to Composer"
				>
					<div className={`transition-transform duration-500 ${view === "composer" ? "scale-110" : "scale-100"}`}>
						<TbBolt size={20} strokeWidth={2} />
					</div>
					{view === "composer" && (
						<span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--vscode-textLink-foreground)]" />
					)}
				</button>
			</div>

			{/* Center - Context/Thread Info (Placeholder or title) - Keeping it empty for now to let ThreadManagement take this space in the parent or separate */}
			<div className="flex-1" />

			{/* Actions */}
			<div className="flex items-center gap-1">
				<button
					type="button"
					className={toolButtonClass()}
					onClick={() => {
						vscode.postMessage({ command: 'openSettings' })
					}}
					title="Configure Settings"
				>
					<TbSettings size={20} strokeWidth={1.5} />
				</button>
				
				<div className="w-px h-6 bg-[var(--vscode-widget-border)] mx-1 opacity-50" />

				<button
					type="button"
					className={`${toolButtonClass()} hover:text-[var(--vscode-errorForeground)] hover:bg-[var(--vscode-errorForeground)]/10`}
					onClick={() => {
						if (!activeThread) return;

						vscode.postMessage({
							command: "clear-chat-history",
						});
						setComposerStates(states => {
							const stateIndex = states.findIndex(s => s.threadId === activeThread.id);

							if (stateIndex === -1) return [...states];

							states[stateIndex].messages = [];
							return [...states];
						});
						setActiveComposerState(state => {
							if (!state) return;

							state.messages = [];
							return { ...state };
						});
						setFileDiagnostics([]);
					}}
					title="Clear Chat History"
				>
					<TbTrash size={20} strokeWidth={1.5} />
				</button>
			</div>
		</div>
	);
}
