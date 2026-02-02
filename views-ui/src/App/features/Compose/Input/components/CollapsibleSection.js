"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapsibleSection = void 0;
const react_1 = require("react");
const fa_1 = require("react-icons/fa");
const bs_1 = require("react-icons/bs");
const fa6_1 = require("react-icons/fa6");
const files_1 = require("../../../../utilities/files");
const md_1 = require("react-icons/md");
const settingsContext_1 = require("../../../../context/settingsContext");
const vscode_1 = require("../../../../utilities/vscode");
const composerContext_1 = require("../../../../context/composerContext");
const CollapsibleSection = ({ items, title = "Suggestions", isLightTheme, }) => {
    const [isExpanded, setIsExpanded] = (0, react_1.useState)(false);
    const { activeThread } = (0, composerContext_1.useComposerContext)();
    const { settings } = (0, settingsContext_1.useSettingsContext)();
    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };
    const headerClass = `
    flex justify-between items-center p-3 cursor-pointer
    ${isLightTheme
        ? 'bg-gray-100 hover:bg-gray-200'
        : 'bg-[#252526] hover:bg-[#2d2d2d]'}
    transition-colors duration-200 rounded-t-lg
    ${items.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
  `;
    const containerClass = `
    w-full overflow-hidden
    ${isLightTheme
        ? 'bg-white border border-gray-200'
        : 'bg-[#1e1e1e] border border-[#3e3e3e]'}
    rounded-lg mb-2 shadow-sm
  `;
    const itemClass = `
    p-3 border-t flex items-center gap-4 text-sm m-0
    ${isLightTheme
        ? 'border-gray-100 hover:bg-gray-50'
        : 'border-[#3e3e3e] hover:bg-[#252526]'}
    transition-colors duration-200
  `;
    const contentClass = `
    max-h-0 overflow-hidden transition-all duration-300 ease-in-out
    ${isExpanded ? 'max-h-[300px] overflow-y-auto' : ''}
  `;
    const displayItems = (0, react_1.useMemo)(() => {
        const results = [];
        for (const item of items) {
            for (const error of item.importErrors) {
                results.push({
                    file: item.path,
                    message: `Import: ${error.message}`
                });
            }
            for (const error of item.lintErrors) {
                results.push({
                    file: item.path,
                    message: `Lint - ${error.message}`
                });
            }
        }
        return results;
    }, [items]);
    const fixDiagnostics = () => {
        if (!activeThread?.id)
            return;
        toggleExpand();
        vscode_1.vscode.postMessage({
            command: "fix-diagnostics",
            value: {
                diagnostics: items,
                threadId: activeThread?.id
            }
        });
    };
    const autoFixComponent = settings?.agentSettings?.automaticallyFixDiagnostics ?
        (<div className="flex items-center justify-end gap-2 mr-4 text-sm p-4">
            <md_1.MdOutlineAutoFixNormal size={16} className="text-green-600/50"/>
            <p className="text-green-600/50">Auto Fix - Enabled</p>
        </div>) : (<div className="flex items-center justify-end gap-2 mr-4 text-sm p-4">
                <button type="button" onClick={fixDiagnostics} className="px-3 py-2 text-sm rounded-md bg-green-600 hover:bg-green-700 transition-colors flex items-center gap-2">
                    <md_1.MdOutlineAutoFixNormal size={16}/>
                    Fix
                </button>
            </div>);
    return (<div className={containerClass}>
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
            <div className={headerClass} onClick={toggleExpand} aria-expanded={isExpanded}>
                <div className="font-medium flex items-center gap-4">
                    <bs_1.BsExclamationTriangle size={16} className="text-yellow-500"/>
                    {title} {displayItems.length > 0 && `(${displayItems.length})`}
                </div>
                <div>
                    {isExpanded ? (<fa_1.FaChevronUp size={14} className={isLightTheme ? 'text-gray-600' : 'text-gray-400'}/>) : (<fa_1.FaChevronDown size={14} className={isLightTheme ? 'text-gray-600' : 'text-gray-400'}/>)}
                </div>
            </div>
            <div className={contentClass}>
                {displayItems.length > 0 ? (<>
                        <ul>
                            {displayItems.map((item, index) => (<li key={item.file} className={itemClass}>
                                    <fa6_1.FaRegFileLines size={16}/>
                                    {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                                    <span className="cursor-pointer hover:underline transition-all" onClick={() => (0, files_1.openFile)({
                    path: item.file
                })}>{(0, files_1.getTruncatedPath)(item.file)}</span>
                                    <span className="text-gray-400/50">{item.message}</span>
                                </li>))}
                        </ul>
                        {autoFixComponent}
                    </>) : (<div className={`${itemClass} text-center italic opacity-70`}>
                        No items to display
                    </div>)}
            </div>
        </div>);
};
exports.CollapsibleSection = CollapsibleSection;
//# sourceMappingURL=CollapsibleSection.js.map