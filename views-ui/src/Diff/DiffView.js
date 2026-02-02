"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
const react_1 = require("react");
const fa_1 = require("react-icons/fa");
const DiffView_1 = __importStar(require("../Common/DiffView"));
const fa6_1 = require("react-icons/fa6");
const vscode_1 = require("./utilities/vscode");
const CodeContainer = (0, react_1.memo)(({ children }) => {
    return (<div className="relative">
			<div className="overflow-x-auto markdown-container">{children}</div>
		</div>);
});
function DiffView({ diff }) {
    const { file, isDarkTheme } = diff;
    const highlightSyntax = (str) => {
        return (<react_syntax_highlighter_1.Prism language={file.language || "typescript"} style={isDarkTheme ? prism_1.vscDarkPlus : prism_1.prism} PreTag={CodeContainer}>
				{str}
			</react_syntax_highlighter_1.Prism>);
    };
    const newStyles = {
        variables: {
            dark: {
                diffViewerBackground: "rgb(30, 30, 30)",
                gutterBackground: "rgb(30, 30, 30)",
                diffViewerTitleBackground: "rgb(30, 30, 30)",
                gitterBackground: "rgb(30, 30, 30)",
                highlightBackground: "rgb(30, 30, 30)",
                highlightGutterBackground: "rgb(30, 30, 30)",
                addedBackground: "#2ea04326",
                addedGutterBackground: "#2ea04326",
                wordAddedBackground: "transparent",
            },
        },
        line: {
            padding: "2px 2px",
        },
    };
    const acceptDiff = () => {
        vscode_1.vscode.postMessage({
            command: "accept-file-changes",
            value: file,
        });
    };
    const rejectDiff = () => {
        vscode_1.vscode.postMessage({
            command: "reject-file-changes",
            value: file,
        });
    };
    return (<div className="inset-0 bg-[var(--vscode-editorWidget-background)] flex flex-col h-full">
			<div className="sticky top-0 bg-[var(--vscode-editorWidget-background)] border-b border-[var(--vscode-widget-shadow)] p-4 flex justify-between items-center z-10">
				<p className="text-white font-semibold truncate">{file.path}</p>
				<div className="flex gap-4">
					{!diff.showRevert && (<button type="button" className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-300 ease-in-out" title="Reject changes" onClick={() => rejectDiff()}>
						<fa6_1.FaXmark className="mr-2"/>
						<span>Reject</span>
					</button>)}
					<button type="button" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center transition duration-300 ease-in-out" title="Accept changes" onClick={() => acceptDiff()}>
						<fa_1.FaCheckCircle className="mr-2"/>
						<span>{diff.showRevert ? 'Revert' : 'Accept'}</span>
					</button>
				</div>
			</div>

			<div className="flex-grow overflow-y-auto">
				<DiffView_1.default oldValue={file.original ?? ""} newValue={file.code} styles={newStyles} compareMethod={DiffView_1.DiffMethod.WORDS} splitView={false} useDarkTheme={isDarkTheme} showDiffOnly={false} renderContent={highlightSyntax}/>
			</div>
		</div>);
}
exports.default = DiffView;
//# sourceMappingURL=DiffView.js.map