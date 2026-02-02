import type {
	ComposerRequest,
} from "@shared/types/Composer";
import { ChatInput } from "./Input/ChatInput";
import { ErrorBoundary } from 'react-error-boundary';
import ChatThreadList from "./ChatThreadList";
import { useComposerContext } from "../../context/composerContext";
import ThreadManagement from "./ThreadManagement";
import { useSettingsContext } from "../../context/settingsContext";
import { VscArrowDown, VscArrowUp } from "react-icons/vsc";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaRegQuestionCircle } from "react-icons/fa";
import { Tooltip } from "react-tooltip";

const getFileExtension = (fileName: string): string => {
	return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
};

const getBase64FromFile = (file: File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});
};

export default function Compose() {
	const {
		createThread,
		loading,
		inputTokens,
		outputTokens,
		sendComposerRequest,
		clearActiveMessage,
		activeComposerState,
		activeThread,
		fileDiagnostics,
		initialized
	} = useComposerContext();
	const { isLightTheme } = useSettingsContext();

	const cancelAIResponse = () => {
		clearActiveMessage();
	};

	const handleChatSubmitted = async (
		input: string,
		contextFiles: string[],
		image?: File
	) => {
		const thread = activeThread ?? createThread(input, true);

		const payload: ComposerRequest = {
			input,
			threadId: thread.id,
			contextFiles,
		};

		if (image) {
			payload.image = {
				data: await getBase64FromFile(image),
				ext: getFileExtension(image.name),
			};
		}

		sendComposerRequest(payload, thread);
	};

	const cssClasses = `${isLightTheme
		? "bg-white border border-gray-200"
		: "bg-[#1e1e1e] border border-[var(--vscode-editorWidget-border)]"
		}`;

	const displayTokens = inputTokens > 0 && outputTokens > 0;
	const showWelcomeScreen = !initialized || !activeComposerState?.messages.length;

	if (showWelcomeScreen) {
		return (
			<main className="flex-1 min-h-0 flex flex-col text-base bg-[var(--vscode-editor-background)]">
				<div className="flex-1 flex flex-col items-center justify-center h-full p-8 min-h-0 animate-fade-in">
					<div className="text-center max-w-xl mx-auto">
						<div
							id="klaus-logo"
							role="img"
							aria-label="Klaus Logo"
							className="h-24 w-24 sm:h-32 sm:w-32 bg-no-repeat bg-contain bg-center mb-8 mx-auto opacity-100 drop-shadow-sm"
						/>
						<h1 className="text-4xl font-bold mb-4 text-[var(--vscode-foreground)] tracking-tight">
							Welcome to Klaus
						</h1>
						
						{!initialized && (
							<div className="py-8">
								<div className="flex flex-col items-center justify-center space-y-4">
									<div className="h-10 w-10 flex items-center justify-center relative">
										<div className="absolute inset-0 rounded-full border-4 border-[var(--vscode-button-background)] opacity-20"></div>
										<AiOutlineLoading3Quarters
											size={24}
											className="text-[var(--vscode-button-background)] animate-spin relative z-10"
										/>
									</div>
									<p className="text-[var(--vscode-descriptionForeground)] font-medium bg-[var(--vscode-editor-inactiveSelectionBackground)] px-4 py-1.5 rounded-full text-sm">
										Initializing AI engine...
									</p>
								</div>
							</div>
						)}

						{initialized && (
							<div className="flex flex-col items-center gap-6">
								<p className="text-lg text-[var(--vscode-descriptionForeground)] leading-relaxed max-w-md mx-auto">
									Your advanced AI coding companion. Ready to help you build, debug, and explain code.
								</p>
								
								<div className="flex flex-col sm:flex-row gap-4 text-sm text-[var(--vscode-descriptionForeground)] mt-4">
									<div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--vscode-editor-inactiveSelectionBackground)]/50">
										<kbd className="font-mono bg-[var(--vscode-editor-background)] border border-[var(--vscode-widget-border)] rounded px-1.5 py-0.5 text-xs shadow-sm">@</kbd> 
										<span>Reference files</span>
									</div>
									<div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--vscode-editor-inactiveSelectionBackground)]/50">
										<kbd className="font-mono bg-[var(--vscode-editor-background)] border border-[var(--vscode-widget-border)] rounded px-1.5 py-0.5 text-xs shadow-sm">/</kbd> 
										<span>Use commands</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="flex-shrink-0 mb-6 max-w-4xl mx-auto w-full px-4">
					<ChatInput
						loading={loading}
						threadId={activeThread?.id}
						onChatSubmitted={handleChatSubmitted}
						onChatCancelled={cancelAIResponse}
						suggestionItems={fileDiagnostics}
					/>
				</div>
			</main>)
	}

	return (
		<>
			<div className="flex-shrink-0 flex items-center justify-between p-2 pt-0 border-b border-[var(--vscode-panel-border)]">
				<ThreadManagement loading={loading} />
				<div>
					<Tooltip
						id="question-tooltip"
						content="If you switch AI providers or abruptly stop mid-chat. It can cause compatibility issues, simply clear the chat to continue."
						place="right"
						className="max-w-xs z-50"
						style={{
							backgroundColor: isLightTheme ? '#333' : '#f5f5f5',
							color: isLightTheme ? '#fff' : '#333',
							borderRadius: '6px',
							padding: '8px 12px',
							boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
						}}
					/>
					<FaRegQuestionCircle size={16} data-tooltip-id="question-tooltip" />
				</div>
			</div>
			<main className="flex-1 min-h-0 flex flex-col text-base">
				<ErrorBoundary resetKeys={[activeComposerState ?? 0]} fallback={
					<div className="flex items-center justify-center h-full p-4 bg-[var(--vscode-input-background)] rounded-md">
						<div className="text-center max-w-lg p-6">
							<h2 className="text-xl font-semibold mb-3">Oops, something went wrong!</h2>
							<p className="mb-4">
								We couldn't load your messages. Please try clearing your chat history.
							</p>
						</div>
					</div>}>
					< ChatThreadList loading={loading} key={activeThread?.id} />
					<div className="flex-shrink-0 mb-2">
						{displayTokens && (
							<div className="mt-4 flex justify-center items-center text-sm">
								<div className={`flex items-center gap-3 px-4 py-2 rounded-md ${cssClasses}`}>
									<span className="font-medium text-xs uppercase tracking-wider text-[var(--vscode-descriptionForeground)]">Usage</span>
									<span className="flex items-center text-[var(--vscode-textLink-foreground)]">
										<VscArrowUp className="mr-1" size={12} /> {inputTokens.toLocaleString()}
									</span>
									<span className="flex items-center text-[var(--vscode-charts-green)]">
										<VscArrowDown className="mr-1" size={12} /> {outputTokens.toLocaleString()}
									</span>
									<span className="text-[var(--vscode-foreground)] font-medium">
										Total: {(inputTokens + outputTokens).toLocaleString()}
									</span>
								</div>
							</div>
						)}
						<ChatInput
							loading={loading}
							threadId={activeThread?.id}
							onChatSubmitted={handleChatSubmitted}
							onChatCancelled={cancelAIResponse}
							suggestionItems={fileDiagnostics}
						/>
					</div>
				</ErrorBoundary>
			</main>
		</>
	);
}
