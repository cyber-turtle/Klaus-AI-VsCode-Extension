"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolOutput = void 0;
const react_1 = require("react");
const ai_1 = require("react-icons/ai");
const bs_1 = require("react-icons/bs");
const files_1 = require("../../../utilities/files");
const ai_2 = require("react-icons/ai");
const vscode_1 = require("../../../utilities/vscode");
const hi_1 = require("react-icons/hi");
const ToolNames = {
    list_directory: "Searched: ",
    find_file_dependencies: "Checked Dependencies",
    read_file: "Analyzed: ",
    research: "Researching...",
    semantic_search: "Semantic search...",
    think: "Thinking...",
    web_search: "Webpage search: ",
    generate_image: "Generating image...",
    file_inspector: "Inspecting file..."
};
const ImageContextMenu = (0, react_1.memo)(({ position, onClose, onSave, isLightTheme }) => {
    const menuRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);
    // Apply a small offset to position the menu exactly at the cursor
    const menuStyle = {
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-5px, -5px)' // Adjust the menu position to align with cursor
    };
    const menuClasses = (0, react_1.useMemo)(() => {
        return isLightTheme
            ? "bg-white text-gray-800 border border-gray-200"
            : "bg-[#252526] text-gray-200 border border-gray-700";
    }, [isLightTheme]);
    return (<div ref={menuRef} className={`fixed z-50 rounded shadow-lg ${menuClasses}`} // Changed from absolute to fixed
     style={menuStyle}>
            <ul className="py-1">
                <li className="px-4 py-2 hover:bg-[var(--vscode-list-hoverBackground)] flex items-center gap-2 cursor-pointer" onClick={() => {
            onSave();
            onClose();
        }} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSave();
                onClose();
            }
        }}>
                    <hi_1.HiOutlineSave size={16}/>
                    <span>Save As...</span>
                </li>
            </ul>
        </div>);
});
ImageContextMenu.displayName = 'ImageContextMenu';
const ComplexTool = (0, react_1.memo)(({ messages, isLightTheme }) => {
    const [collapsed, setCollapsed] = (0, react_1.useState)(false);
    const [contextMenu, setContextMenu] = (0, react_1.useState)({
        visible: false,
        position: { x: 0, y: 0 },
        imageUrl: ''
    });
    const toggleCollapsed = (0, react_1.useCallback)(() => {
        setCollapsed(prev => !prev);
    }, []);
    const lastMessage = messages[messages.length - 1];
    const toolContent = (0, react_1.useMemo)(() => {
        if (!Array.isArray(lastMessage.content)) {
            if (lastMessage.metadata?.image) {
                return [{
                        type: "image_url",
                        image_url: {
                            url: lastMessage.metadata?.image.toString()
                        }
                    }];
            }
            return undefined;
        }
        if (lastMessage.content?.length > 0 && !lastMessage.content[0].type) {
            return undefined;
        }
        return lastMessage.content;
    }, [lastMessage.content, lastMessage]);
    const saveImage = (0, react_1.useCallback)((imageBase64) => {
        vscode_1.vscode.postMessage({
            command: 'save-image',
            value: imageBase64
        });
    }, []);
    const handleContextMenu = (0, react_1.useCallback)((e, imageUrl) => {
        e.preventDefault();
        // Use pageX and pageY for more accurate positioning
        setContextMenu({
            visible: true,
            position: { x: e.pageX, y: e.pageY },
            imageUrl
        });
    }, []);
    const closeContextMenu = (0, react_1.useCallback)(() => {
        setContextMenu(prev => ({ ...prev, visible: false }));
    }, []);
    if (!toolContent || !Array.isArray(toolContent))
        return null;
    return (<div className="relative p-3">
            <div className="flex items-center justify-between mb-2">
                <h4 className="m-0 text-base whitespace-nowrap text-gray-400/50">
                    Tool Output:
                </h4>
                <button type="button" className="flex pr-0 items-center justify-center p-1 text-gray-400/70 hover:text-gray-400 rounded hover:bg-[var(--vscode-list-hoverBackground)] focus:outline-none focus:ring-1 focus:ring-[var(--vscode-focusBorder)] transition-colors" onClick={toggleCollapsed} aria-label={collapsed ? "Expand tool output" : "Collapse tool output"} aria-expanded={!collapsed}>
                    {collapsed ? (<ai_2.AiOutlineDown size={20} aria-hidden="true"/>) : (<ai_2.AiOutlineUp size={20} aria-hidden="true"/>)}
                </button>
            </div>
            {!collapsed && (<div className="flex flex-col gap-2">
                    {toolContent.map((content, index) => {
                if (content.type === "image_url") {
                    return (<div key={`image-${ // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        index}`} className="relative">
                                    {content.image_url.url && (<img src={content.image_url.url} alt="Tool generated" className="max-w-full h-auto cursor-pointer" onContextMenu={(e) => handleContextMenu(e, content.image_url.url)}/>)}
                                </div>);
                }
                return null;
            })}
                </div>)}

            {contextMenu.visible && (<ImageContextMenu position={contextMenu.position} onClose={closeContextMenu} onSave={() => saveImage(contextMenu.imageUrl)} isLightTheme={isLightTheme}/>)}
        </div>);
});
ComplexTool.displayName = 'ComplexTool';
exports.ToolOutput = (0, react_1.memo)(({ messages, isLightTheme, loading }) => {
    // @ts-expect-error
    const knownToolName = (0, react_1.useMemo)(() => ToolNames[messages[0].name], [messages]);
    const displayName = (0, react_1.useMemo)(() => knownToolName ?? messages[0].name, [knownToolName, messages]);
    const toolIsLoading = (0, react_1.useMemo)(() => messages.length === 1, [messages]);
    const ToolDetails = (0, react_1.useMemo)(() => {
        if (!messages)
            return null;
        try {
            const toolName = messages[0].name;
            if (toolName === "list_directory") {
                let content = messages[0].content;
                content = typeof (content) === "string" ? JSON.parse(content) : content;
                //@ts-expect-error
                return content.directory;
            }
            if (toolName === "web_search") {
                let content = messages[0].content;
                content = typeof (content) === "string" ? JSON.parse(content) : content;
                //@ts-expect-error
                return <a href={content.url} target="_blank" rel="noopener noreferrer" style={{ cursor: 'pointer', textDecoration: 'underline' }}>{content.url}</a>;
            }
            if (toolName === "read_file") {
                const content = toolIsLoading ? messages[0].content : messages[1].content;
                let fileContent;
                if (typeof (content) === "string") {
                    try {
                        if (content.startsWith('{')) {
                            fileContent = JSON.parse(content);
                        }
                        else {
                            fileContent = messages[0].content;
                        }
                    }
                    catch (e) {
                        fileContent = JSON.parse(String(messages[0].content));
                    }
                }
                else {
                    fileContent = content;
                }
                if (!fileContent)
                    return null;
                const handleClick = () => (0, files_1.openFile)({ path: fileContent.path });
                const handleKeyDown = (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        (0, files_1.openFile)({ path: fileContent.path });
                    }
                };
                return (<span className="cursor-pointer hover:underline transition-all" onClick={handleClick} onKeyDown={handleKeyDown}>
                        {fileContent?.path ? (0, files_1.getTruncatedPath)(fileContent.path) : ""}
                    </span>);
            }
        }
        catch (error) {
            console.error("Failed to parse tool content:", error);
        }
        return null;
    }, [messages, toolIsLoading]);
    const cssClasses = (0, react_1.useMemo)(() => {
        return isLightTheme
            ? "bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_12px_24px_rgba(0,0,0,0.15)]"
            : "bg-[#1e1e1e] shadow-[0_2px_4px_rgba(0,0,0,0.2),0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.25),0_12px_24px_rgba(0,0,0,0.25)]";
    }, [isLightTheme]);
    return (<div className={`rounded-lg overflow-hidden shadow-lg ${cssClasses}`}>
            <div className="text-[var(--vscode-input-foreground)] flex flex-col">
                <div className="flex items-center justify-between relative p-3">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <bs_1.BsTools className="text-gray-400/50 flex-shrink-0" size={20}/>
                        <div className="overflow-x-auto max-w-full" style={{ scrollbarWidth: 'thin' }}>
                            <h4 className="m-0 text-base whitespace-nowrap text-gray-400/50">
                                {displayName} {ToolDetails}
                            </h4>
                        </div>
                    </div>

                    <div className="flex items-center ml-3 flex-shrink-0">
                        {toolIsLoading && loading && (<div className="flex justify-center">
                                <ai_1.AiOutlineLoading3Quarters className="animate-spin text-stone-400" size={20}/>
                            </div>)}
                        {toolIsLoading && !loading && (<div className="flex justify-center">
                                <ai_1.AiOutlineCloseCircle className="text-gray-400/50" size={20}/>
                            </div>)}
                        {!toolIsLoading && (<div className="flex justify-center">
                                <ai_1.AiOutlineCheckCircle className="text-gray-400/50" size={20}/>
                            </div>)}
                    </div>
                </div>
                {!toolIsLoading && (<ComplexTool messages={messages} isLightTheme={isLightTheme}/>)}
            </div>
        </div>);
});
exports.ToolOutput.displayName = 'ToolOutput';
//# sourceMappingURL=ToolOutput.js.map