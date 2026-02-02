"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageWithMarkdown = void 0;
const prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
const react_1 = require("react");
const react_markdown_1 = __importDefault(require("react-markdown"));
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const vscode_1 = require("../../../utilities/vscode");
const fa6_1 = require("react-icons/fa6");
const settingsContext_1 = require("../../../context/settingsContext");
const LinkRenderer = (0, react_1.memo)(function LinkRenderer(props) {
    return (<a href={props.href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">
            {props.children}
        </a>);
});
const createMarkdownComponents = (theme) => {
    return {
        a: LinkRenderer,
        code(props) {
            const { children, className, ...rest } = props;
            const languageType = /language-(\w+)/.exec(className || "");
            return languageType ? (<react_syntax_highlighter_1.Prism PreTag={(props) => <CodeContainer {...props} content={children}/>} 
            // biome-ignore lint/correctness/noChildrenProp: <explanation>
            children={String(children).replace(/\n$/, "")} style={theme} language={languageType[1]} wrapLines={true} wrapLongLines={true} useInlineStyles={true}/>) : (<code {...rest} className={`whitespace-pre-wrap ${className} bg-transparent`}>
                    {children}
                </code>);
        },
    };
};
const Toolbox = (0, react_1.memo)(({ copyToClipboard }) => (<div className="flex justify-end absolute -top-5 right-1.5 pr-2.5">
        <div className="flex gap-1.5 list-none p-1 bg-[var(--vscode-input-background)] border border-[var(--vscode-input-border)] rounded-md">
            <button type="button" className="p-1.5 rounded-md transition-all duration-200 cursor-pointer text-[var(--vscode-foreground)] hover:text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-background)] focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)] active:scale-95" title="Copy code to clipboard" onClick={copyToClipboard}>
                <fa6_1.FaCopy size={16}/>
            </button>
        </div>
    </div>));
const CodeContainer = (0, react_1.memo)((props) => {
    const [toolboxVisible, setToolboxVisible] = (0, react_1.useState)(false);
    const { isLightTheme } = (0, settingsContext_1.useSettingsContext)();
    const copyToClipboard = (0, react_1.useCallback)(() => {
        vscode_1.vscode.postMessage({
            command: "clipboard",
            value: props.content,
        });
    }, [props.content]);
    // Memoize the container class to prevent string concatenation on every render
    const containerClass = (0, react_1.useMemo)(() => `overflow-x-auto p-4 markdown-container mt-4 mb-4 ${isLightTheme
        ? 'bg-white shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15),0_12px_24px_rgba(0,0,0,0.15)]'
        : 'bg-[#1e1e1e] shadow-[0_2px_4px_rgba(0,0,0,0.2),0_8px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.25),0_12px_24px_rgba(0,0,0,0.25)]'} transition-shadow duration-300 ease-in-out rounded-xl`, [isLightTheme]);
    return (<div className="relative rounded-md bg-editor-bg" onMouseEnter={() => setToolboxVisible(true)} onMouseLeave={() => setToolboxVisible(false)}>
            {toolboxVisible && <Toolbox copyToClipboard={copyToClipboard}/>}
            <div className={containerClass}>
                {props.children}
            </div>
        </div>);
});
const useRenderMarkdown = (content, theme) => {
    return (0, react_1.useMemo)(() => {
        const components = createMarkdownComponents(theme);
        return (<react_markdown_1.default 
        // biome-ignore lint/correctness/noChildrenProp: <explanation>
        children={content} components={components}/>);
    }, [content, theme]);
};
exports.MessageWithMarkdown = (0, react_1.memo)(({ message, fromUser, isLightTheme }) => {
    const codeTheme = (0, react_1.useMemo)(() => isLightTheme ? prism_1.prism : prism_1.vscDarkPlus, [isLightTheme]);
    const renderedMarkdown = useRenderMarkdown(message, codeTheme);
    return (<div className={fromUser ? 'p-3' : ''}>
            {message !== "" && renderedMarkdown}
        </div>);
});
//# sourceMappingURL=Markdown.js.map