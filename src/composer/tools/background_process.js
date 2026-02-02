"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupProcesses = exports.createBackgroundProcessTool = exports.backgroundProcessSchema = exports.waitForPort = void 0;
const tools_1 = require("@langchain/core/tools");
const node_child_process_1 = require("node:child_process");
const zod_1 = require("zod");
const node_net_1 = require("node:net");
const node_util_1 = require("node:util");
const schemas_1 = require("./schemas");
class ProcessManager {
    constructor() {
        this.processes = new Map();
    }
    static getInstance() {
        if (!ProcessManager.instance) {
            ProcessManager.instance = new ProcessManager();
        }
        return ProcessManager.instance;
    }
    async startProcess(name, command, cwd, env, captureOutput = false) {
        // Cleanup existing process if it exists
        if (this.processes.has(name)) {
            await this.killProcess(name);
        }
        // Configure stdio based on whether we want to capture output
        const stdio = captureOutput ? ["ignore", "pipe", "pipe"] : "ignore";
        const options = {
            shell: true,
            cwd,
            env: { ...process.env, ...env },
            detached: true,
            stdio,
        };
        const child = (0, node_child_process_1.spawn)(command, options);
        this.processes.set(name, child);
        // Only unref if we're not capturing output
        if (!captureOutput && child.unref) {
            child.unref();
        }
        // If we're not capturing output, just return the PID
        if (!captureOutput) {
            return { pid: child.pid ?? 0 };
        }
        // If we are capturing output, collect it for a short time
        const stdoutChunks = [];
        const stderrChunks = [];
        if (child.stdout) {
            child.stdout.on("data", (chunk) => {
                stdoutChunks.push(Buffer.from(chunk));
            });
        }
        if (child.stderr) {
            child.stderr.on("data", (chunk) => {
                stderrChunks.push(Buffer.from(chunk));
            });
        }
        // After collecting output, we'll still keep the process running in the background
        if (child.unref) {
            child.unref();
        }
        return { pid: child.pid ?? 0 };
    }
    async captureInitialOutput(name, captureTimeMs = 10000) {
        const process = this.processes.get(name);
        if (!process || !process.stdout || !process.stderr) {
            return "No output available (process may not have stdio pipes attached)";
        }
        const stdoutChunks = [];
        const stderrChunks = [];
        // Set up data collection
        const stdoutHandler = (chunk) => {
            stdoutChunks.push(chunk);
        };
        const stderrHandler = (chunk) => {
            stderrChunks.push(chunk);
        };
        process.stdout.on("data", stdoutHandler);
        process.stderr.on("data", stderrHandler);
        // Wait for the specified time to collect output
        await (0, node_util_1.promisify)(setTimeout)(captureTimeMs);
        // Remove listeners to avoid memory leaks
        process.stdout.removeListener("data", stdoutHandler);
        process.stderr.removeListener("data", stderrHandler);
        // Combine the collected output
        const stdout = Buffer.concat(stdoutChunks).toString().trim();
        const stderr = Buffer.concat(stderrChunks).toString().trim();
        let output = "";
        if (stdout) {
            output += `STDOUT:\n${stdout}\n`;
        }
        if (stderr) {
            output += `${output ? "\n" : ""}STDERR:\n${stderr}`;
        }
        return output || "No output captured during the initial execution period";
    }
    async killProcess(name) {
        const process = this.processes.get(name);
        if (process) {
            try {
                process.kill("SIGTERM");
                // Give it a moment to terminate gracefully
                await (0, node_util_1.promisify)(setTimeout)(1000);
                // Force kill if still running
                if (!process.killed) {
                    process.kill("SIGKILL");
                }
            }
            catch (error) {
                console.error(`Failed to kill process ${name}:`, error);
            }
            this.processes.delete(name);
        }
    }
    async cleanup() {
        const names = Array.from(this.processes.keys());
        await Promise.all(names.map((name) => this.killProcess(name)));
    }
}
const waitForPort = async (port, options = {}) => {
    const { timeout = 30000, retryInterval = 1000, host = "localhost" } = options;
    const startTime = Date.now();
    const tryConnect = () => {
        return new Promise((resolve) => {
            const socket = (0, node_net_1.createConnection)(port, host)
                .on("connect", () => {
                socket.destroy();
                resolve(true);
            })
                .on("error", () => {
                socket.destroy();
                resolve(false);
            });
        });
    };
    while (Date.now() - startTime < timeout) {
        const isAvailable = await tryConnect();
        if (isAvailable) {
            return;
        }
        await (0, node_util_1.promisify)(setTimeout)(retryInterval);
    }
    throw new Error(`Timeout waiting for port ${port} on ${host} after ${timeout}ms`);
};
exports.waitForPort = waitForPort;
exports.backgroundProcessSchema = schemas_1.baseToolSchema.extend({
    command: zod_1.z.string().describe("The command to execute"),
    port: zod_1.z.number().describe("The network port to listen for"),
    name: zod_1.z.string().describe("Unique identifier for the process"),
    captureOutput: zod_1.z.boolean().optional().describe("Whether to capture and return initial command output"),
    captureTimeMs: zod_1.z.number().optional().describe("How long to capture output for (in milliseconds)"),
});
/**
 * Creates a tool that starts a long-running process in the background
 */
const createBackgroundProcessTool = (workspace, env = {}) => {
    const processManager = ProcessManager.getInstance();
    return (0, tools_1.tool)(async (input) => {
        try {
            // Extract optional parameters with defaults
            const captureOutput = input.captureOutput ?? true; // Default to capturing output
            const captureTimeMs = input.captureTimeMs ?? 10000; // Default to 10 seconds
            // Check if port is already available
            try {
                await (0, exports.waitForPort)(input.port, { timeout: 3000 }); // Quick check
                return `Port ${input.port} is already in use, assuming service is running`;
            }
            catch {
                // Port not available, proceed with starting process
                const { pid } = await processManager.startProcess(input.name, input.command, workspace, env, captureOutput);
                // Start capturing output in parallel with waiting for the port
                const outputPromise = captureOutput
                    ? processManager.captureInitialOutput(input.name, captureTimeMs)
                    : Promise.resolve("");
                // Wait for port to become available
                const portPromise = (0, exports.waitForPort)(input.port, { timeout: 60000 });
                // Wait for both operations to complete
                const [output] = await Promise.all([outputPromise, portPromise]);
                // Return both the process info and any captured output
                if (output) {
                    return `Process '${input.name}' started with PID ${pid}\n\nInitial Output (${captureTimeMs / 1000}s):\n${output}`;
                }
                return `Process '${input.name}' started with PID ${pid}`;
            }
        }
        catch (error) {
            // Cleanup on failure
            await processManager.killProcess(input.name);
            if (error instanceof Error) {
                throw new Error(`Failed to start process '${input.name}': ${error.message}`);
            }
            throw error;
        }
    }, {
        name: "background_process",
        description: "Starts a long-running process in the background if port is not already in use. Captures initial output for a short period. Use this tool for dev servers or monitoring a terminal command that may not immediately exit.",
        schema: exports.backgroundProcessSchema,
    });
};
exports.createBackgroundProcessTool = createBackgroundProcessTool;
// Cleanup helper for the extension/application lifecycle
const cleanupProcesses = async () => {
    await ProcessManager.getInstance().cleanup();
};
exports.cleanupProcesses = cleanupProcesses;
//# sourceMappingURL=background_process.js.map