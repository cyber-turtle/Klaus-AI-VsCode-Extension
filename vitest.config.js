"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const vite_plugin_node_polyfills_1 = require("vite-plugin-node-polyfills");
const node_path_1 = __importDefault(require("node:path"));
exports.default = (0, config_1.defineConfig)({
    plugins: [
        (0, vite_plugin_node_polyfills_1.nodePolyfills)({
            include: ["path", "fs", "util", "buffer", "process"],
        }),
    ],
    test: {
        globals: true,
        environment: "node",
        setupFiles: ["./vitest.setup.ts"],
        alias: {
            "@shared": node_path_1.default.resolve(__dirname, "./shared/src"),
        },
    },
    resolve: {
        conditions: ["import", "node"],
    },
});
//# sourceMappingURL=vitest.config.js.map