"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandExecuteOutput = void 0;
const react_1 = require("react");
const ai_1 = require("react-icons/ai");
const bs_1 = require("react-icons/bs");
const fa_1 = require("react-icons/fa");
const vscode_1 = require("../../../utilities/vscode");
const composerContext_1 = require("../../../context/composerContext");
exports.CommandExecuteOutput = (0, react_1.memo)(({ messages, isLightTheme, }) => {
    const { activeThread } = (0, composerContext_1.useComposerContext)();
    const [isResultExpanded, setIsResultExpanded] = (0, react_1.useState)(false);
    if (!messages)
        return null;
    // Memoize the command extraction logic
    const command = (0, react_1.useMemo)(() => {
        let extractedCommand;
        if (messages.length === 1) {
            if (messages[0].content.accepted) {
                extractedCommand = {
                    id: messages[0].id,
                    //@ts-expect-error
                    ...messages[0].content
                };
            }
            else {
                extractedCommand = {
                    id: messages[0].id,
                    command: String(messages[0].content.command)
                };
            }
        }
        else {
            extractedCommand = messages[messages.length - 1].metadata?.command;
        }
        return extractedCommand;
    }, [messages]);
    // Memoize handlers to prevent recreation on each render
    const handleAccept = (0, react_1.useCallback)(() => {
        vscode_1.vscode.postMessage({
            command: "accept-command",
            value: {
                command,
                threadId: activeThread?.id
            }
        });
    }, [command, activeThread?.id]);
    const handleReject = (0, react_1.useCallback)(() => {
        vscode_1.vscode.postMessage({
            command: "reject-command",
            value: {
                command,
                threadId: activeThread?.id
            }
        });
    }, [command, activeThread?.id]);
    const toggleResultExpansion = (0, react_1.useCallback)(() => {
        setIsResultExpanded(prev => !prev);
    }, []);
    // Memoize UI-related values
    const cssClasses = (0, react_1.useMemo)(() => `${isLightTheme
        ? "bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_12px_24px_rgba(0,0,0,0.15)]"
        : "bg-[#1e1e1e] shadow-[0_2px_4px_rgba(0,0,0,0.2),0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.25),0_12px_24px_rgba(0,0,0,0.25)]"}`, [isLightTheme]);
    const buttonStyles = (0, react_1.useMemo)(() => {
        const buttonBaseClasses = "flex items-center gap-1 px-3 py-1 rounded-md text-sm font-medium transition-all";
        return {
            accept: `${buttonBaseClasses} bg-green-600 text-white hover:bg-green-700 active:bg-green-800`,
            reject: `${buttonBaseClasses} bg-red-600 text-white hover:bg-red-700 active:bg-red-800`
        };
    }, []);
    // Memoize derived state
    const { commandLoading, shouldShowButtons, resultSectionClasses, resultContentClasses } = (0, react_1.useMemo)(() => {
        const isLoading = command?.accepted && command.success === undefined && command.result === undefined;
        const showButtons = !command?.accepted && !command?.rejected && !command?.success && !command?.failed;
        const sectionClasses = `px-4 pb-4 pt-0 ${isLightTheme ? 'bg-gray-50' : 'bg-[#252525]'} border-t ${isLightTheme ? 'border-gray-200' : 'border-gray-700'}`;
        const contentClasses = `mt-2 p-3 rounded font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[400px] ${isLightTheme ? 'bg-gray-100 text-gray-800' : 'bg-[#1a1a1a] text-gray-300'}`;
        return {
            commandLoading: isLoading,
            shouldShowButtons: showButtons,
            resultSectionClasses: sectionClasses,
            resultContentClasses: contentClasses
        };
    }, [command, isLightTheme]);
    if (!command)
        return null;
    return (<div className={`rounded-lg overflow-hidden shadow-lg ${cssClasses}`}>
            <div className="text-[var(--vscode-input-foreground)] flex flex-col">
                <div className="flex items-center justify-between relative p-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <bs_1.BsTools className="text-gray-400/50 flex-shrink-0" size={20}/>
                        <div className="overflow-x-auto max-w-full" style={{ scrollbarWidth: 'thin' }}>
                            <h4 className="m-0 text-base whitespace-nowrap text-gray-400/50 flex items-center gap-2">
                                {command.result && (<button type="button" onClick={toggleResultExpansion} className="text-gray-400/70 hover:text-gray-400 transition-colors" aria-label={isResultExpanded ? "Collapse result" : "Expand result"}>
                                        {isResultExpanded ? <fa_1.FaChevronDown size={12}/> : <fa_1.FaChevronRight size={12}/>}
                                    </button>)}
                                <span>
                                    {command?.accepted ? "Executed" : "Execute"}: {command.command}
                                </span>
                            </h4>
                        </div>
                    </div>
                    <div className="flex items-center ml-3">
                        {(command.success || command.failed) && (<span className={`ml-2 mr-1 flex items-center ${command.success ? "text-green-500" : "text-red-500"}`}>
                                {command.success ? (<ai_1.AiOutlineCheckCircle className="text-gray-400/50" size={20}/>) : (<ai_1.AiOutlineCloseCircle className="text-gray-400/50" size={20}/>)}
                            </span>)}
                        {commandLoading ? (<div className="flex justify-center">
                                <ai_1.AiOutlineLoading3Quarters className="animate-spin text-stone-400" size={20}/>
                            </div>) : null}
                    </div>
                </div>

                {/* Collapsible result section */}
                {command.result && isResultExpanded && (<div className={resultSectionClasses}>
                        <div className={resultContentClasses} style={{ scrollbarWidth: 'thin' }}>
                            {command.result}
                        </div>
                    </div>)}

                {/* Action buttons moved underneath */}
                {shouldShowButtons && (<div className={resultSectionClasses}>
                        <div className="py-3 flex justify-end gap-2">
                            <button type="button" className={buttonStyles.reject} onClick={handleReject} disabled={command.accepted || command.rejected}>
                                <fa_1.FaTimes size={12}/>
                                Reject
                            </button>
                            <button type="button" className={buttonStyles.accept} onClick={handleAccept} disabled={command.rejected || command.accepted}>
                                <fa_1.FaPlay size={12}/>
                                Run
                            </button>
                        </div>
                    </div>)}
            </div>
        </div>);
});
// Display name for debugging
exports.CommandExecuteOutput.displayName = 'CommandExecuteOutput';
//# sourceMappingURL=CommandExecuteOutput.js.map