import { MultiServerMCPClient } from "@langchain/mcp-adapters";
export declare class MCPAdapter {
    private readonly workspacePath;
    client: MultiServerMCPClient | undefined;
    configPath: string;
    constructor(workspacePath: string);
    initialize(): Promise<void>;
    getTools(): Promise<import("@langchain/core/tools").StructuredToolInterface<import("@langchain/core/tools").ToolSchemaBase, any, any>[] | undefined>;
    close(): Promise<void | undefined>;
}
//# sourceMappingURL=mcpAdapter.d.ts.map