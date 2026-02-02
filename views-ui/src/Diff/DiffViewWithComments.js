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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DiffView_1 = __importStar(require("../Common/DiffView"));
const react_syntax_highlighter_1 = require("react-syntax-highlighter");
const prism_1 = require("react-syntax-highlighter/dist/esm/styles/prism");
require("./App.css");
const react_1 = require("react");
const react_markdown_1 = __importDefault(require("react-markdown"));
const CodeContainer = (0, react_1.memo)(({ children }) => {
    return (<div className="relative">
			<div className="overflow-x-auto markdown-container">{children}</div>
		</div>);
});
function DiffViewWithComments({ reviewDetails, isDarkTheme, onDiffAccepted, onDiffRejected, }) {
    const { file, original, current, comments } = reviewDetails;
    const codeTheme = !isDarkTheme ? prism_1.prism : prism_1.vscDarkPlus;
    const commentsMap = (0, react_1.useMemo)(() => comments?.reduce((acc, comment) => {
        if (comment) {
            acc.set(comment.startLine, comment);
        }
        return acc;
    }, new Map()), [comments]);
    const highlightSyntax = (str) => {
        return (<react_syntax_highlighter_1.Prism language="typescript" style={isDarkTheme ? prism_1.vscDarkPlus : prism_1.prism} PreTag={CodeContainer}>
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
            padding: "2px",
            minHeight: "27px",
        },
        diffRemoved: {
            padding: "1px",
        },
        wordDiff: {
            padding: "unset",
        },
    };
    return (<div className="bg-gray-600 flex flex-col">
			<div data-file-id={file} className="flex-grow overflow-y-auto relative">
				<DiffView_1.default oldValue={original} newValue={current} styles={newStyles} compareMethod={DiffView_1.DiffMethod.CHARS} splitView={false} useDarkTheme={isDarkTheme} showDiffOnly={true} renderContent={highlightSyntax} onLineRender={(number) => {
            const comment = commentsMap?.get(number);
            if (!comment || comment.rejected || comment.accepted)
                return null;
            return (<div key={number} className="p-2 border-t-2 border-t-gray-600 border-b-2 border-b-gray-600">
								<h3 className="text-xl">Wingman</h3>
								<div className="p-2">
									<p>{comment.body}</p>
									<div className={`${isDarkTheme
                    ? "bg-code-dark"
                    : "bg-code-light"} mt-4`}>
										<react_markdown_1.default components={{
                    code(props) {
                        const { children, className, node, ...rest } = props;
                        const languageType = /language-(\w+)/.exec(className || "");
                        return languageType ? (<react_syntax_highlighter_1.Prism children={String(children).replace(/\n$/, "")} style={codeTheme} language={languageType[1]} wrapLines={true} wrapLongLines={true} PreTag={CodeContainer}/>) : (<code {...rest} className={`whitespace-pre-wrap ${className} bg-transparent`}>
															{children}
														</code>);
                    },
                }}>
											{comment.code}
										</react_markdown_1.default>
									</div>
								</div>
								<div className="flex justify-start gap-4 mt-2">
									{comment?.action && (<button className="bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded" type="button" onClick={() => {
                        onDiffAccepted(reviewDetails, comment);
                    }}>
											Accept
										</button>)}
									{comment?.action && (<button className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded" type="button" onClick={() => {
                        onDiffRejected(reviewDetails, comment);
                    }}>
											Reject
										</button>)}
								</div>
							</div>);
        }}/>
			</div>
		</div>);
}
exports.default = DiffViewWithComments;
//# sourceMappingURL=DiffViewWithComments.js.map