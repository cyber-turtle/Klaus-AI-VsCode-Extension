"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPAdapter = void 0;
const mcp_adapters_1 = require("@langchain/mcp-adapters");
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
class MCPAdapter {
    constructor(workspacePath) {
        this.workspacePath = workspacePath;
        this.configPath = node_path_1.default.join(workspacePath, ".wingman", "mcp.json");
    }
    async initialize() {
        try {
            if (this.client) {
                this.client.close();
            }
            const mcpFileContents = await node_fs_1.default.promises.readFile(this.configPath, "utf-8");
            if (!mcpFileContents) {
                throw new Error(`MCP config file not found at ${this.configPath}`);
            }
            const mcpConfig = JSON.parse(mcpFileContents);
            if (!mcpConfig) {
                throw new Error(`MCP config file is empty or invalid at ${this.configPath}`);
            }
            this.client = new mcp_adapters_1.MultiServerMCPClient({
                throwOnLoadError: true,
                prefixToolNameWithServerName: true,
                additionalToolNamePrefix: "mcp",
                mcpServers: mcpConfig.mcpServers,
            });
        }
        catch (e) {
            console.error(e);
        }
    }
    async getTools() {
        return this.client?.getTools();
    }
    async close() {
        return this.client?.close();
    }
}
exports.MCPAdapter = MCPAdapter;
//# sourceMappingURL=mcpAdapter.js.map