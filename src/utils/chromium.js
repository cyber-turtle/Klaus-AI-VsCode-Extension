"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureChromium = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
// @ts-ignore
const puppeteer_chromium_resolver_1 = __importDefault(require("puppeteer-chromium-resolver"));
const ensureChromium = async (globalStoragePath) => {
    if (!globalStoragePath) {
        throw new Error("Global storage uri is invalid");
    }
    const puppeteerDir = node_path_1.default.join(globalStoragePath, "puppeteer");
    const dirExists = node_fs_1.default.existsSync(puppeteerDir);
    if (!dirExists) {
        await node_fs_1.default.promises.mkdir(puppeteerDir, { recursive: true });
    }
    //@ts-expect-error
    const stats = await (0, puppeteer_chromium_resolver_1.default)({
        downloadPath: puppeteerDir,
    });
    return stats;
};
exports.ensureChromium = ensureChromium;
//# sourceMappingURL=chromium.js.map