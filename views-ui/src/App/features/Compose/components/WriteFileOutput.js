"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteFileOutput = void 0;
const fa_1 = require("react-icons/fa");
const gr_1 = require("react-icons/gr");
const hi2_1 = require("react-icons/hi2");
const pi_1 = require("react-icons/pi");
const fa6_1 = require("react-icons/fa6");
const composerContext_1 = require("../../../context/composerContext");
const files_1 = require("../../../utilities/files");
const react_tooltip_1 = require("react-tooltip");
const react_1 = require("react");
// File actions button component
const FileActionButton = (0, react_1.memo)(({ icon: Icon, title, onClick, className, style }) => (<div className={`flex items-center rounded z-10 transition-colors ${className}`} style={{ ...style ?? {} }}>
        <button type="button" title={title} className="p-2" onClick={onClick}>
            <Icon size={16}/>
        </button>
    </div>));
// Diff stats component
const DiffStats = (0, react_1.memo)(({ diffParts }) => (<div className="flex items-center justify-evenly text-sm gap-2 mr-4">
        <span className="flex items-center text-green-400">
            <span>{diffParts[0]}</span>
        </span>
        <span className="flex items-center text-red-400">
            <span>{diffParts[1]}</span>
        </span>
    </div>));
// File action buttons for pending state
const PendingActions = (0, react_1.memo)(({ file, threadId, toolId }) => {
    const handleReject = (0, react_1.useCallback)(() => {
        (0, files_1.rejectFile)({ files: [file], threadId, toolId });
    }, [file, threadId, toolId]);
    const handleShowDiff = (0, react_1.useCallback)(() => {
        (0, files_1.showDiffview)({ file, threadId, toolId });
    }, [file, threadId, toolId]);
    const handleAccept = (0, react_1.useCallback)(() => {
        (0, files_1.acceptFile)({ files: [file], threadId, toolId });
    }, [file, threadId, toolId]);
    return (<div className="flex flex-nowrap gap-1 ml-auto mr-3">
            <FileActionButton icon={hi2_1.HiOutlineXMark} title="Reject changes" onClick={handleReject} className="text-red-600 hover:bg-red-600/10 hover:shadow-lg focus:ring focus:ring-red-400"/>
            <FileActionButton icon={pi_1.PiGitDiff} title="Show diff" onClick={handleShowDiff} className="hover:bg-yellow-500/10 hover:shadow-lg focus:ring focus:ring-yellow-400" style={{ color: '#ffaf38' }}/>
            <FileActionButton icon={gr_1.GrCheckmark} title="Accept changes" onClick={handleAccept} className="text-green-400 hover:bg-green-400/10 hover:shadow-lg focus:ring focus:ring-green-400"/>
        </div>);
});
// File action buttons for accepted/rejected state
const CompletedActions = (0, react_1.memo)(({ file, threadId, toolId }) => {
    const handleUndo = (0, react_1.useCallback)(() => {
        (0, files_1.undoFile)({ files: [file], threadId, toolId });
    }, [file, threadId, toolId]);
    const handleShowDiff = (0, react_1.useCallback)(() => {
        (0, files_1.showDiffview)({ file, threadId, toolId });
    }, [file, threadId, toolId]);
    return (<div className="flex items-center gap-2 ml-auto mr-4">
            <FileActionButton icon={fa_1.FaUndo} title="Undo changes" onClick={handleUndo} className="text-stone-400 hover:bg-stone-700/50 hover:shadow-lg focus:ring focus:ring-stone-400"/>
            <FileActionButton icon={pi_1.PiGitDiff} title="Show diff" onClick={handleShowDiff} className="hover:bg-yellow-500/10 hover:shadow-lg focus:ring focus:ring-yellow-400" style={{ color: '#ffaf38' }}/>
            {file.rejected && (<span className="flex items-center gap-1 text-sm text-red-400">
                    <span>Rejected</span>
                </span>)}
            {file.accepted && (<span className="flex items-center gap-1 text-sm text-green-400">
                    <span>Accepted</span>
                </span>)}
        </div>);
});
exports.WriteFileOutput = (0, react_1.memo)(({ messages, isLightTheme }) => {
    const { activeThread } = (0, composerContext_1.useComposerContext)();
    const file = (0, react_1.useMemo)(() => {
        if (messages.length === 0)
            return undefined;
        return messages.length === 1
            ? messages[0].metadata?.file
            : messages[1].metadata?.file;
    }, [messages]);
    const toolId = (0, react_1.useMemo)(() => {
        return messages[0]?.toolCallId || '';
    }, [messages]);
    const diffParts = (0, react_1.useMemo)(() => {
        return file?.diff?.split(',');
    }, [file?.diff]);
    const truncatedPath = (0, react_1.useMemo)(() => {
        return file ? (0, files_1.getTruncatedPath)(file.path) : '';
    }, [file]);
    const handleOpenFile = (0, react_1.useCallback)(() => {
        if (file) {
            (0, files_1.openFile)(file);
        }
    }, [file]);
    const handleKeyDown = (0, react_1.useCallback)((e) => {
        if (file && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            (0, files_1.openFile)(file);
        }
    }, [file]);
    if (!file || !activeThread) {
        return null;
    }
    const cssClasses = `${isLightTheme
        ? 'bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_12px_24px_rgba(0,0,0,0.15)]'
        : 'bg-[#1e1e1e] shadow-[0_2px_4px_rgba(0,0,0,0.2),0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.25),0_12px_24px_rgba(0,0,0,0.25)]'}`;
    return (<div className={`rounded-lg overflow-hidden shadow-lg ${cssClasses}`}>
            <div className="text-[var(--vscode-input-foreground)] flex flex-col">
                <div className="flex items-center justify-start relative">
                    <fa6_1.FaRegFileLines size={16} className="ml-3"/>
                    <react_tooltip_1.Tooltip id={`${file.path}-tooltip`} place="top"/>
                    <h4 className="m-0 p-3 font-medium truncate cursor-pointer hover:underline transition-all text-sm group" data-tooltip-id={`${file.path}-tooltip`} data-tooltip-content={file.path} onClick={handleOpenFile} onKeyDown={handleKeyDown} style={{ flex: '0 1 auto', minWidth: '0' }}>
                        {truncatedPath}
                    </h4>

                    {diffParts && <DiffStats diffParts={diffParts}/>}

                    {!file.accepted && !file.rejected && (<PendingActions file={file} threadId={activeThread.id} toolId={toolId}/>)}

                    {(file.rejected || file.accepted) && (<CompletedActions file={file} threadId={activeThread.id} toolId={toolId}/>)}
                </div>
            </div>
        </div>);
});
//# sourceMappingURL=WriteFileOutput.js.map