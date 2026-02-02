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
exports.DiffMethod = exports.LineNumberPrefix = void 0;
//@ts-nocheck
const React = __importStar(require("react"));
const classnames_1 = __importDefault(require("classnames"));
const compute_lines_1 = require("./compute-lines");
Object.defineProperty(exports, "DiffMethod", { enumerable: true, get: function () { return compute_lines_1.DiffMethod; } });
const styles_1 = __importDefault(require("./styles"));
const compute_hidden_blocks_1 = require("./compute-hidden-blocks");
const m = require("memoize-one");
const memoize = m.default || m;
var LineNumberPrefix;
(function (LineNumberPrefix) {
    LineNumberPrefix["LEFT"] = "L";
    LineNumberPrefix["RIGHT"] = "R";
})(LineNumberPrefix = exports.LineNumberPrefix || (exports.LineNumberPrefix = {}));
class DiffViewer extends React.Component {
    constructor(props) {
        super(props);
        /**
         * Resets code block expand to the initial stage. Will be exposed to the parent component via
         * refs.
         */
        this.resetCodeBlocks = () => {
            if (this.state.expandedBlocks.length > 0) {
                this.setState({
                    expandedBlocks: [],
                });
                return true;
            }
            return false;
        };
        /**
         * Pushes the target expanded code block to the state. During the re-render,
         * this value is used to expand/fold unmodified code.
         */
        this.onBlockExpand = (id) => {
            const prevState = this.state.expandedBlocks.slice();
            prevState.push(id);
            this.setState({
                expandedBlocks: prevState,
            });
        };
        /**
         * Computes final styles for the diff viewer. It combines the default styles with the user
         * supplied overrides. The computed styles are cached with performance in mind.
         *
         * @param styles User supplied style overrides.
         */
        this.computeStyles = memoize(styles_1.default);
        /**
         * Returns a function with clicked line number in the closure. Returns an no-op function when no
         * onLineNumberClick handler is supplied.
         *
         * @param id Line id of a line.
         */
        this.onLineNumberClickProxy = (id) => {
            if (this.props.onLineNumberClick) {
                return (e) => this.props.onLineNumberClick(id, e);
            }
            return () => { };
        };
        /**
         * Maps over the word diff and constructs the required React elements to show word diff.
         *
         * @param diffArray Word diff information derived from line information.
         * @param renderer Optional renderer to format diff words. Useful for syntax highlighting.
         */
        this.renderWordDiff = (diffArray, renderer) => {
            return diffArray.map((wordDiff, i) => {
                return (<span key={i} className={(0, classnames_1.default)(this.styles.wordDiff, {
                        [this.styles.wordAdded]: wordDiff.type === compute_lines_1.DiffType.ADDED,
                        [this.styles.wordRemoved]: wordDiff.type === compute_lines_1.DiffType.REMOVED,
                    })}>
					{renderer
                        ? renderer(wordDiff.value)
                        : wordDiff.value}
				</span>);
            });
        };
        /**
         * Maps over the line diff and constructs the required react elements to show line diff. It calls
         * renderWordDiff when encountering word diff. This takes care of both inline and split view line
         * renders.
         *
         * @param lineNumber Line number of the current line.
         * @param type Type of diff of the current line.
         * @param prefix Unique id to prefix with the line numbers.
         * @param value Content of the line. It can be a string or a word diff array.
         * @param additionalLineNumber Additional line number to be shown. Useful for rendering inline
         *  diff view. Right line number will be passed as additionalLineNumber.
         * @param additionalPrefix Similar to prefix but for additional line number.
         */
        this.renderLine = (lineNumber, type, prefix, value, additionalLineNumber, additionalPrefix) => {
            const lineNumberTemplate = `${prefix}-${lineNumber}`;
            const additionalLineNumberTemplate = `${additionalPrefix}-${additionalLineNumber}`;
            const highlightLine = this.props.highlightLines.includes(lineNumberTemplate) ||
                this.props.highlightLines.includes(additionalLineNumberTemplate);
            const added = type === compute_lines_1.DiffType.ADDED;
            const removed = type === compute_lines_1.DiffType.REMOVED;
            const changed = type === compute_lines_1.DiffType.CHANGED;
            let content;
            if (Array.isArray(value)) {
                content = this.renderWordDiff(value, this.props.renderContent);
            }
            else if (this.props.renderContent) {
                content = this.props.renderContent(value);
            }
            else {
                content = value;
            }
            return (<React.Fragment>
				{!this.props.hideLineNumbers && (<td onClick={lineNumber &&
                        this.onLineNumberClickProxy(lineNumberTemplate)} className={(0, classnames_1.default)(this.styles.gutter, {
                        [this.styles.emptyGutter]: !lineNumber,
                        [this.styles.diffAdded]: added,
                        [this.styles.diffRemoved]: removed,
                        [this.styles.diffChanged]: changed,
                        [this.styles.highlightedGutter]: highlightLine,
                    })}>
						<pre className={this.styles.lineNumber}>
							{lineNumber}
						</pre>
					</td>)}
				{!this.props.splitView && !this.props.hideLineNumbers && (<td onClick={additionalLineNumber &&
                        this.onLineNumberClickProxy(additionalLineNumberTemplate)} className={(0, classnames_1.default)(this.styles.gutter, {
                        [this.styles.emptyGutter]: !additionalLineNumber,
                        [this.styles.diffAdded]: added,
                        [this.styles.diffRemoved]: removed,
                        [this.styles.diffChanged]: changed,
                        [this.styles.highlightedGutter]: highlightLine,
                    })}>
						<pre className={this.styles.lineNumber}>
							{additionalLineNumber}
						</pre>
					</td>)}
				{this.props.renderGutter
                    ? this.props.renderGutter({
                        lineNumber,
                        type,
                        prefix,
                        value,
                        additionalLineNumber,
                        additionalPrefix,
                        styles: this.styles,
                    })
                    : null}
				{!this.props.hideMarkers && (<td className={(0, classnames_1.default)(this.styles.marker, {
                        [this.styles.emptyLine]: !content,
                        [this.styles.diffAdded]: added,
                        [this.styles.diffRemoved]: removed,
                        [this.styles.diffChanged]: changed,
                        [this.styles.highlightedLine]: highlightLine,
                    })}>
						<pre>
							{added && "+"}
							{removed && "-"}
						</pre>
					</td>)}
				<td className={(0, classnames_1.default)(this.styles.content, {
                    [this.styles.emptyLine]: !content,
                    [this.styles.diffAdded]: added,
                    [this.styles.diffRemoved]: removed,
                    [this.styles.diffChanged]: changed,
                    [this.styles.highlightedLine]: highlightLine,
                })}>
					<pre className={this.styles.contentText}>{content}</pre>
				</td>
			</React.Fragment>);
        };
        /**
         * Generates lines for split view.
         *
         * @param obj Line diff information.
         * @param obj.left Life diff information for the left pane of the split view.
         * @param obj.right Life diff information for the right pane of the split view.
         * @param index React key for the lines.
         */
        this.renderSplitView = ({ left, right }, index) => {
            return (<tr key={index} className={this.styles.line}>
				{this.renderLine(left.lineNumber, left.type, LineNumberPrefix.LEFT, left.value)}
				{this.renderLine(right.lineNumber, right.type, LineNumberPrefix.RIGHT, right.value)}
			</tr>);
        };
        /**
         * Generates lines for inline view.
         *
         * @param obj Line diff information.
         * @param obj.left Life diff information for the added section of the inline view.
         * @param obj.right Life diff information for the removed section of the inline view.
         * @param index React key for the lines.
         */
        this.renderInlineView = ({ left, right }, index) => {
            let content;
            if (left.type === compute_lines_1.DiffType.REMOVED && right.type === compute_lines_1.DiffType.ADDED) {
                return (<React.Fragment key={index}>
					<tr className={this.styles.line}>
						{this.renderLine(left.lineNumber, left.type, LineNumberPrefix.LEFT, left.value, null)}
					</tr>
					<tr className={this.styles.line}>
						{this.renderLine(right?.lineNumber, right.type, LineNumberPrefix.RIGHT, right.value, right.lineNumber)}
					</tr>
					{!this.props.onLineRender ? null : (<tr key={`${index}-render`} className={this.styles.line}>
							<td colSpan="4" style={{ width: "100%" }}>
								{this.props.onLineRender(right?.lineNumber)}
							</td>
						</tr>)}
				</React.Fragment>);
            }
            if (left.type === compute_lines_1.DiffType.REMOVED) {
                content = this.renderLine(left.lineNumber, left.type, LineNumberPrefix.LEFT, left.value, null);
            }
            if (left.type === compute_lines_1.DiffType.DEFAULT) {
                content = this.renderLine(left.lineNumber, left.type, LineNumberPrefix.LEFT, left.value, right.lineNumber, LineNumberPrefix.RIGHT);
            }
            if (right.type === compute_lines_1.DiffType.ADDED) {
                content = this.renderLine(right?.lineNumber, right.type, LineNumberPrefix.RIGHT, right.value, right.lineNumber);
            }
            return (<>
				<tr key={index} className={this.styles.line}>
					{content}
				</tr>
				{!this.props.onLineRender ? null : (<tr key={`${index}-render`} className={this.styles.line}>
						<td colSpan="4" style={{ width: "100%" }}>
							{this.props.onLineRender(right?.lineNumber)}
						</td>
					</tr>)}
			</>);
        };
        /**
         * Returns a function with clicked block number in the closure.
         *
         * @param id Cold fold block id.
         */
        this.onBlockClickProxy = (id) => () => this.onBlockExpand(id);
        /**
         * Generates cold fold block. It also uses the custom message renderer when available to show
         * cold fold messages.
         *
         * @param num Number of skipped lines between two blocks.
         * @param blockNumber Code fold block id.
         * @param leftBlockLineNumber First left line number after the current code fold block.
         * @param rightBlockLineNumber First right line number after the current code fold block.
         */
        this.renderSkippedLineIndicator = (num, blockNumber, leftBlockLineNumber, rightBlockLineNumber) => {
            const { hideLineNumbers, splitView } = this.props;
            const message = this.props.codeFoldMessageRenderer ? (this.props.codeFoldMessageRenderer(num, leftBlockLineNumber, rightBlockLineNumber)) : (<pre className={this.styles.codeFoldContent}>
				Expand {num} lines ...
			</pre>);
            const content = (<td>
				<a onClick={this.onBlockClickProxy(blockNumber)} tabIndex={0}>
					{message}
				</a>
			</td>);
            const isUnifiedViewWithoutLineNumbers = !splitView && !hideLineNumbers;
            return (<tr key={`${leftBlockLineNumber}-${rightBlockLineNumber}`} className={this.styles.codeFold}>
				{!hideLineNumbers && (<td className={this.styles.codeFoldGutter}/>)}
				{this.props.renderGutter ? (<td className={this.styles.codeFoldGutter}/>) : null}
				<td className={(0, classnames_1.default)({
                    [this.styles.codeFoldGutter]: isUnifiedViewWithoutLineNumbers,
                })}/>

				{/* Swap columns only for unified view without line numbers */}
				{isUnifiedViewWithoutLineNumbers ? (<React.Fragment>
						<td />
						{content}
					</React.Fragment>) : (<React.Fragment>
						{content}
						{this.props.renderGutter ? <td /> : null}
						<td />
					</React.Fragment>)}

				<td />
				<td />
			</tr>);
        };
        /**
         * Generates the entire diff view.
         */
        this.renderDiff = () => {
            const { oldValue, newValue, splitView, disableWordDiff, compareMethod, linesOffset, onLineRender, } = this.props;
            const { lineInformation, diffLines } = (0, compute_lines_1.computeLineInformation)(oldValue, newValue, disableWordDiff, compareMethod, linesOffset, this.props.alwaysShowLines);
            const extraLines = this.props.extraLinesSurroundingDiff < 0
                ? 0
                : Math.round(this.props.extraLinesSurroundingDiff);
            const { lineBlocks, blocks } = (0, compute_hidden_blocks_1.computeHiddenBlocks)(lineInformation, diffLines, extraLines);
            return lineInformation.map((line, lineIndex) => {
                if (this.props.showDiffOnly) {
                    const blockIndex = lineBlocks[lineIndex];
                    if (blockIndex !== undefined) {
                        const lastLineOfBlock = blocks[blockIndex].endLine === lineIndex;
                        if (!this.state.expandedBlocks.includes(blockIndex) &&
                            lastLineOfBlock) {
                            return (<React.Fragment key={lineIndex}>
									{this.renderSkippedLineIndicator(blocks[blockIndex].lines, blockIndex, line.left.lineNumber, line.right.lineNumber)}
								</React.Fragment>);
                        }
                        else if (!this.state.expandedBlocks.includes(blockIndex)) {
                            return null;
                        }
                    }
                }
                const diffNodes = splitView
                    ? this.renderSplitView(line, lineIndex)
                    : this.renderInlineView(line, lineIndex);
                return diffNodes;
            });
        };
        this.render = () => {
            const { oldValue, newValue, useDarkTheme, leftTitle, rightTitle, splitView, hideLineNumbers, hideMarkers, nonce, onLineRender, } = this.props;
            if (this.props.compareMethod !== compute_lines_1.DiffMethod.JSON) {
                if (typeof oldValue !== "string" || typeof newValue !== "string") {
                    throw Error('"oldValue" and "newValue" should be strings');
                }
            }
            this.styles = this.computeStyles(this.props.styles, useDarkTheme, nonce);
            const nodes = this.renderDiff();
            let colSpanOnSplitView = hideLineNumbers ? 2 : 3;
            let colSpanOnInlineView = hideLineNumbers ? 2 : 4;
            if (hideMarkers) {
                colSpanOnSplitView -= 1;
                colSpanOnInlineView -= 1;
            }
            const columnExtension = this.props.renderGutter ? 1 : 0;
            const title = (leftTitle || rightTitle) && (<tr>
				<td colSpan={(splitView ? colSpanOnSplitView : colSpanOnInlineView) +
                    columnExtension} className={this.styles.titleBlock}>
					<pre className={this.styles.contentText}>{leftTitle}</pre>
				</td>
				{splitView && (<td colSpan={colSpanOnSplitView + columnExtension} className={this.styles.titleBlock}>
						<pre className={this.styles.contentText}>
							{rightTitle}
						</pre>
					</td>)}
			</tr>);
            return (<table className={(0, classnames_1.default)(this.styles.diffContainer, {
                    [this.styles.splitView]: splitView,
                })}>
				<tbody>
					{title}
					{nodes}
				</tbody>
			</table>);
        };
        this.state = {
            expandedBlocks: [],
        };
    }
}
DiffViewer.defaultProps = {
    oldValue: "",
    newValue: "",
    splitView: true,
    highlightLines: [],
    disableWordDiff: false,
    compareMethod: compute_lines_1.DiffMethod.CHARS,
    styles: {},
    hideLineNumbers: false,
    hideMarkers: false,
    extraLinesSurroundingDiff: 3,
    showDiffOnly: true,
    useDarkTheme: false,
    linesOffset: 0,
    nonce: "",
};
exports.default = DiffViewer;
//# sourceMappingURL=index.js.map