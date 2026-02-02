"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatThread = exports.extractCodeBlock = void 0;
const fa_1 = require("react-icons/fa");
const SkeletonLoader_1 = require("../../SkeletonLoader");
const settingsContext_1 = require("../../context/settingsContext");
const Markdown_1 = require("./components/Markdown");
const WriteFileOutput_1 = require("./components/WriteFileOutput");
const ToolOutput_1 = require("./components/ToolOutput");
const fi_1 = require("react-icons/fi");
const CommandExecuteOutput_1 = require("./components/CommandExecuteOutput");
const useTools_1 = require("./hooks/useTools");
function extractCodeBlock(text) {
    const regex = /```.*?\n([\s\S]*?)\n```/g;
    const matches = [];
    let match;
    // biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
    while ((match = regex.exec(text)) !== null) {
        matches.push(match[1]);
    }
    return matches.length > 0 ? matches.join("\n") : text;
}
exports.extractCodeBlock = extractCodeBlock;
const ChatThread = ({ state, loading = false, }) => {
    const { isLightTheme } = (0, settingsContext_1.useSettingsContext)();
    const { toolMap } = (0, useTools_1.useTools)(state);
    const renderedTools = new Set();
    return (<>
		{state.messages.map((message, i) => {
            const fromUser = message.role === "user";
            if (fromUser || message.role === "assistant") {
                return (<ChatEntry key={message.id} fromUser={fromUser} message={message}>
						<Markdown_1.MessageWithMarkdown message={String(message.content)} fromUser={fromUser} isLightTheme={isLightTheme}/>
					</ChatEntry>);
            }
            const toolMessage = message;
            const toolEvents = toolMap.get(toolMessage.toolCallId);
            const isLast = i === state.messages.length - 1;
            if (!toolEvents) {
                console.warn(`No tool events found for toolCallId: ${toolMessage.toolCallId}`);
                return null;
            }
            if (toolMessage.name === "edit_file" && !renderedTools.has(toolMessage.toolCallId)) {
                renderedTools.add(toolMessage.toolCallId);
                return (<ChatEntry key={`tool-${toolMessage.toolCallId}`} fromUser={false}>
						<WriteFileOutput_1.WriteFileOutput isLightTheme={isLightTheme} messages={toolEvents} key={toolMessage.toolCallId}/>
					</ChatEntry>);
            }
            if (toolMessage.name === "command_execute" && !renderedTools.has(toolMessage.toolCallId)) {
                renderedTools.add(toolMessage.toolCallId);
                return <ChatEntry key={`tool-${toolMessage.toolCallId}`} fromUser={false}>
					<CommandExecuteOutput_1.CommandExecuteOutput messages={toolEvents} isLightTheme={isLightTheme}/>
				</ChatEntry>;
            }
            if (!renderedTools.has(toolMessage.toolCallId)) {
                renderedTools.add(toolMessage.toolCallId);
                return <ChatEntry key={`tool-${toolMessage.toolCallId}`} fromUser={false}>
					<ToolOutput_1.ToolOutput isLightTheme={isLightTheme} messages={toolEvents} loading={isLast && loading}/>
				</ChatEntry>;
            }
            return null;
        })}
		{loading && !state.canResume && (<ChatEntry fromUser={false} key="loading">
				<div className="mt-4 flex justify-center items-center">
					<SkeletonLoader_1.SkeletonLoader isDarkTheme={!isLightTheme}/>
				</div>
			</ChatEntry>)}
		{state.canResume && (<div className="mt-4 flex justify-center items-center gap-2 text-gray-400/50">
				<fi_1.FiClock className="border-amber-200 text-amber-700"/> Paused - pending approval
			</div>)}
	</>);
};
exports.ChatThread = ChatThread;
const ChatEntry = ({ fromUser, message, children }) => {
    const bgClasses = fromUser ? "bg-stone-800 rounded-lg overflow-hidden w-full" : "";
    const textColor = fromUser ? "text-gray-200" : "text-[var(--vscode-input-foreground)]";
    return (<li className="tracking-wide leading-relaxed text-md message mt-4 mb-4">
			<div className={`px-[16px] flex items-center ${textColor}`}>
				<div className="relative flex items-center gap-4 flex-grow w-full">
					<div className={`${bgClasses} flex-grow w-full justify-center items-center ${fromUser ? "shadow-lg" : ""}`}>
						{fromUser && (<div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-600 flex items-center justify-center ml-3 mt-3">
								<fa_1.FaUser className="text-stone-200" size={16}/>
							</div>)}
						{children}
						{fromUser && message?.image && (<div className="p-3">
								<img src={message.image?.data} alt="Attached Preview" className="max-w-full h-auto rounded-lg" style={{ maxHeight: "512px" }}/>
							</div>)}
					</div>
				</div>
			</div>
		</li>);
};
//# sourceMappingURL=ChatThreadEntry.js.map