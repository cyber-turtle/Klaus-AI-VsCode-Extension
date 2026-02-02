"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@rsbuild/core");
const plugin_react_1 = require("@rsbuild/plugin-react");
const node_path_1 = __importDefault(require("node:path"));
exports.default = ({ env, command, envMode }) => {
    const isProd = env === "production";
    console.log("Production Build:", isProd, envMode);
    return (0, core_1.defineConfig)({
        server: {
            open: false,
        },
        mode: isProd ? "production" : "development",
        source: {
            entry: {
                chat: "./src/App/index.tsx",
                config: "./src/Config/index.tsx",
                diff: "./src/Diff/index.tsx",
                threads: "./src/Threads/index.tsx",
                image: "./src/ImageEditor/index.tsx",
            },
        },
        tools: {
            rspack: (config) => {
                if (config.output) {
                    config.output.devtoolModuleFilenameTemplate = (info) => {
                        const { absoluteResourcePath, namespace, resourcePath } = info;
                        if (node_path_1.default.isAbsolute(absoluteResourcePath)) {
                            return node_path_1.default.relative(node_path_1.default.join(__dirname, "out", "views"), absoluteResourcePath);
                        }
                        // Mimic Webpack's default behavior:
                        return `webpack://${namespace}/${resourcePath}`;
                    };
                }
                return config;
            },
        },
        performance: {
            chunkSplit: {
                strategy: "single-vendor",
            },
        },
        dev: {
            writeToDisk: true,
        },
        output: {
            minify: isProd,
            sourceMap: !isProd,
            distPath: {
                root: "../out/views",
                js: "static",
                css: "static",
            },
            filename: {
                js: "[name].js",
                css: "[name].css",
            },
        },
        security: {
            nonce: "CSP_NONCE_PLACEHOLDER",
        },
        html: {
            template: "./index.html",
        },
        plugins: [(0, plugin_react_1.pluginReact)()],
    });
};
//# sourceMappingURL=rsbuild.config.js.map