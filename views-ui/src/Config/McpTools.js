"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPConfiguration = void 0;
const vsc_1 = require("react-icons/vsc");
const vscode_1 = require("./utilities/vscode");
const MCPConfiguration = ({ mcpTools = new Map() }) => {
    const fetchMCPTools = () => {
        vscode_1.vscode.postMessage({
            command: "fetch-mcp"
        });
    };
    return (<div className="space-y-6">
            <div className="flex flex-col space-y-4">
                <div className="flex flex-row justify-between items-center">
                    <h3 className="text-md font-medium text-[var(--vscode-foreground)]">
                        MCP Tools Configuration
                    </h3>
                    <div>
                        <button type="button" onClick={() => fetchMCPTools()} className="px-3 py-2 bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] rounded-md hover:bg-[var(--vscode-button-hoverBackground)] focus:outline-none focus:ring-2 focus:ring-[var(--vscode-focusBorder)]" title="Copy Settings">
                            <vsc_1.VscSync size={16}/>
                        </button>
                    </div>
                </div>
                <div className="bg-[var(--vscode-editor-background)] border border-[var(--vscode-editorWidget-border)] rounded-md p-3 my-2">
                    <p className="text-sm text-[var(--vscode-descriptionForeground)] leading-relaxed">
                        Review Model Context Protocol tools that you have configured under{" "}
                        <code className="px-1.5 py-0.5 rounded font-mono text-xs bg-[var(--vscode-textCodeBlock-background)] text-[var(--vscode-foreground)]">
                            .wingman/mcp.json
                        </code>
                    </p>
                </div>
                <p className="text-sm text-[var(--vscode-descriptionForeground)]">
                    You can find servers{" "}
                    <a href=" https://www.pulsemcp.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">
                        here
                    </a>
                    {" "} or <a href=" https://modelcontextprotocol.io/introduction" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">
                        create your own!
                    </a>
                </p>
            </div>

            {mcpTools.size > 0 ? (<div className="space-y-4">
                    {Array.from(mcpTools.entries()).map(([server, tools], index) => (<div 
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            key={index} className="p-4 border border-[var(--vscode-editorWidget-border)] rounded-md bg-[var(--vscode-editor-background)]">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-medium">{server}</h3>
                            </div>

                            <div className="space-y-3">
                                {tools && (<div>
                                        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
                                        <label className="block text-sm mb-1">
                                            Tools:
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {tools.map((t, index) => (<div key={`${t.name}-${index}`} className='p-1 rounded-sm bg-[var(--vscode-input-background)] text-[var(--vscode-input-foreground)] border border-[var(--vscode-input-border)]'>
                                                    {t.name}
                                                </div>))}
                                        </div>
                                    </div>)}
                            </div>
                        </div>))}
                </div>) : (<div className="text-center py-6 border border-dashed border-[var(--vscode-editorWidget-border)] rounded-md">
                    <p className="text-[var(--vscode-descriptionForeground)]">
                        No MCP tools found.
                    </p>
                </div>)}
        </div>);
};
exports.MCPConfiguration = MCPConfiguration;
//# sourceMappingURL=McpTools.js.map