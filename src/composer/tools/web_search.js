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
exports.createWebSearchTool = exports.webSearchSchema = void 0;
const tools_1 = require("@langchain/core/tools");
const schemas_1 = require("./schemas");
const messages_1 = require("@langchain/core/messages");
const zod_1 = require("zod");
const turndown_1 = __importDefault(require("turndown"));
const cheerio = __importStar(require("cheerio"));
const chromium_1 = require("../../utils/chromium");
// Simplified schema with focused options
exports.webSearchSchema = schemas_1.baseToolSchema.extend({
    url: zod_1.z.string().describe("The url to retrieve contents for"),
    options: zod_1.z
        .object({
        timeout: zod_1.z
            .number()
            .optional()
            .describe("Timeout in ms for the entire fetch operation (default: 10000)"),
        retries: zod_1.z
            .number()
            .optional()
            .describe("Number of times to retry fetching (default: 2)"),
        delay: zod_1.z
            .number()
            .optional()
            .describe("Delay between retries in ms (default: 2000)"),
    })
        .optional()
        .describe("Options for handling content fetching"),
});
/**
 * Creates a tool that searches a web page and returns its content as markdown
 * Simplified implementation with improved SPA detection
 */
const createWebSearchTool = (storagePath) => {
    return (0, tools_1.tool)(async (input, config) => {
        let browser;
        try {
            const stats = await (0, chromium_1.ensureChromium)(storagePath);
            browser = await stats.puppeteer.launch({
                args: [
                    "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                ],
                executablePath: stats.executablePath,
            });
            // (latest version of puppeteer does not add headless to user agent)
            const page = await browser?.newPage();
            if (!browser || !page) {
                throw new Error("Browser not initialized");
            }
            await page.goto(input.url, {
                timeout: 10000,
                waitUntil: ["domcontentloaded", "networkidle2"],
            });
            const content = await page.content();
            // use cheerio to parse and clean up the HTML
            const $ = cheerio.load(content);
            $("script, style, nav, footer, header").remove();
            // convert cleaned HTML to markdown
            const turndownService = new turndown_1.default();
            const markdown = turndownService.turndown($.html());
            return new messages_1.ToolMessage({
                id: config.callbacks._parentRunId,
                content: JSON.stringify({
                    id: config.toolCall.id,
                    content: markdown,
                    url: input.url,
                    explanation: input.explanation,
                }),
                tool_call_id: config.toolCall.id,
            });
        }
        catch (error) {
            return `Error fetching or processing the URL: ${error.message}`;
        }
        finally {
            if (browser) {
                await browser?.close();
            }
        }
    }, {
        name: "web_search",
        description: "Fetches the contents of a URL, returning them in a markdown format. Use this tool if the user asks you about a URL specifically.",
        schema: exports.webSearchSchema,
    });
};
exports.createWebSearchTool = createWebSearchTool;
//# sourceMappingURL=web_search.js.map