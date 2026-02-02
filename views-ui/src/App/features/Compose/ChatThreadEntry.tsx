import { FaUser } from "react-icons/fa";
import type { ToolMessage, UserMessage, ComposerState } from "@shared/types/Composer";
import { SkeletonLoader } from "../../SkeletonLoader";
import { useSettingsContext } from "../../context/settingsContext";
import { MessageWithMarkdown } from "./components/Markdown";
import { WriteFileOutput } from "./components/WriteFileOutput";
import { ToolOutput } from "./components/ToolOutput";
import { FiClock } from 'react-icons/fi';
import { CommandExecuteOutput } from "./components/CommandExecuteOutput";
import { useTools } from "./hooks/useTools";
import type { PropsWithChildren } from "react";

export function extractCodeBlock(text: string) {
	const regex = /```.*?\n([\s\S]*?)\n```/g;
	const matches = [];
	let match: RegExpExecArray | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
	while ((match = regex.exec(text)) !== null) {
		matches.push(match[1]);
	}
	return matches.length > 0 ? matches.join("\n") : text;
}

interface ChatThreadProps {
	state: ComposerState,
	loading: boolean
}

export const ChatThread = ({
	state,
	loading = false,
}: ChatThreadProps) => {
	const { isLightTheme } = useSettingsContext();
	const { toolMap } = useTools(state);

	const renderedTools = new Set<string>();
	return (<>
		{state.messages.map((message, i) => {
			const fromUser = message.role === "user";
			if (fromUser || message.role === "assistant") {
				return (
					<ChatEntry key={message.id} fromUser={fromUser} message={message as UserMessage}>
						<MessageWithMarkdown message={String(message.content)} fromUser={fromUser} isLightTheme={isLightTheme} />
					</ChatEntry>
				);
			}

			const toolMessage = message as ToolMessage;
			const toolEvents = toolMap.get(toolMessage.toolCallId);
			const isLast = i === state.messages.length - 1;

			if (!toolEvents) {
				console.warn(`No tool events found for toolCallId: ${toolMessage.toolCallId}`);
				return null;
			}

			if (toolMessage.name === "edit_file" && !renderedTools.has(toolMessage.toolCallId)) {
				renderedTools.add(toolMessage.toolCallId);
				return (
					<ChatEntry key={`tool-${toolMessage.toolCallId}`} fromUser={false}>
						<WriteFileOutput isLightTheme={isLightTheme} messages={toolEvents} key={toolMessage.toolCallId} />
					</ChatEntry>
				);
			}

			if (toolMessage.name === "command_execute" && !renderedTools.has(toolMessage.toolCallId)) {
				renderedTools.add(toolMessage.toolCallId);
				return <ChatEntry key={`tool-${toolMessage.toolCallId}`} fromUser={false}>
					<CommandExecuteOutput messages={toolEvents} isLightTheme={isLightTheme} />
				</ChatEntry>
			}

			if (!renderedTools.has(toolMessage.toolCallId)) {
				renderedTools.add(toolMessage.toolCallId);
				return <ChatEntry key={`tool-${toolMessage.toolCallId}`} fromUser={false}>
					<ToolOutput isLightTheme={isLightTheme} messages={toolEvents} loading={isLast && loading} />
				</ChatEntry>
			}

			return null;
		})}
		{loading && !state.canResume && (
			<ChatEntry fromUser={false} key="loading">
				<div className="mt-4 flex justify-center items-center">
					<SkeletonLoader isDarkTheme={!isLightTheme} />
				</div>
			</ChatEntry>
		)}
		{state.canResume && (
			<div className="mt-4 flex justify-center items-center gap-2 text-[var(--vscode-descriptionForeground)]">
				<FiClock className="text-[var(--vscode-charts-yellow)]" /> Paused - pending approval
			</div>
		)}
	</>)
};

interface ChatEntryProps {
	message?: UserMessage;
	fromUser: boolean;
}

const ChatEntry = ({ fromUser, message, children }: PropsWithChildren<ChatEntryProps>) => {
	const userBubbleClasses = `
		bg-[var(--vscode-button-background)] 
		text-[var(--vscode-button-foreground)] 
		rounded-2xl rounded-tr-sm 
		px-5 py-3 
		max-w-[85%] 
		shadow-sm
	`;

	const assistantBubbleClasses = `
		w-full 
		pr-4
	`;

	// Align user messages to the right, assistant to the left
	const containerClasses = fromUser 
		? "items-end pl-12" 
		: "items-start pr-4";

	return (
		<li className={`flex flex-col ${containerClasses} mb-6 message w-full`}>
			{/* Avatar / Name Label (Optional - kept simple for now) */}
			{!fromUser && (
				<div className="flex items-center gap-2 mb-2 px-1">
					<div className="w-5 h-5 rounded overflow-hidden flex-shrink-0 bg-transparent">
						{/* Klaus Logo or Icon placeholder if needed, using text for now or existing icon */}
						<div id="klaus-logo" className="w-full h-full bg-contain bg-no-repeat" style={{ backgroundImage: 'url(LOGO_URL)' }} />
					</div>
					<span className="text-xs font-medium text-[var(--vscode-descriptionForeground)] opacity-80">Klaus</span>
				</div>
			)}

			<div className={`relative ${fromUser ? userBubbleClasses : assistantBubbleClasses}`}>
				{children}
				
				{/* Image Attachment for User */}
				{fromUser && message?.image && (
					<div className="mt-3 rounded-lg overflow-hidden border border-[var(--vscode-widget-border)] bg-[var(--vscode-editor-background)]">
						<img
							src={(message as UserMessage).image?.data}
							alt="Attached Preview"
							className="max-w-full h-auto max-h-64 object-contain"
						/>
					</div>
				)}
			</div>
		</li>
	)
}