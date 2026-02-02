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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BindingDownloader = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs"));
const tar = __importStar(require("tar"));
const telemetryProvider_1 = require("../providers/telemetryProvider");
const utils_1 = require("./utils");
class BindingDownloader {
    constructor(context, logger) {
        this.logger = logger;
        this.maxRetries = 3;
        this.retryDelay = 1000;
        this.bindings = [
            {
                name: "ast-grep-napi",
                version: "0.36.1",
                packagePrefix: "@ast-grep/napi",
                usePackagePrefixInFilename: false,
            },
            {
                name: "lancedb",
                version: "0.18.2",
                packagePrefix: "@lancedb/lancedb",
            },
        ];
        this.extensionDir = context.extensionPath;
        this.storageDir = path.join(context.globalStorageUri.fsPath, "native-bindings");
        if (!fs.existsSync(this.storageDir)) {
            fs.mkdirSync(this.storageDir, { recursive: true });
        }
    }
    getBindingStorageDir(binding) {
        const dir = path.join(this.storageDir, binding.name, binding.version);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        return dir;
    }
    async getNapiPackageName(binding) {
        const platformId = await (0, utils_1.getPlatformIdentifier)();
        const packageName = `${binding.packagePrefix}-${platformId}`;
        this.logger.logInfo(`Using native binding package for ${binding.name}: ${packageName}`);
        return packageName;
    }
    async getStoredBindingPath(binding) {
        const pkg = await this.getNapiPackageName(binding);
        return path.join(this.getBindingStorageDir(binding), `${pkg.split("/").pop()}.node`);
    }
    getTempExtractPath(binding) {
        return path.join(this.getBindingStorageDir(binding), "extract");
    }
    async getTargetBindingPath(binding) {
        const platformId = await (0, utils_1.getPlatformIdentifier)();
        let filename;
        if (binding.usePackagePrefixInFilename) {
            // Use the package prefix in the filename (e.g., ast-grep-napi.darwin-arm64.node)
            const prefix = binding.packagePrefix.split("/").pop();
            filename = `${prefix}.${platformId}.node`;
        }
        else {
            // Use the original naming convention (e.g., ast-grep.darwin-arm64.node)
            filename = `${binding.name}.${platformId}.node`;
        }
        this.logger.logInfo(`Generated target filename for ${binding.name}: ${filename}`);
        return path.join(this.extensionDir, "out", filename);
    }
    async retryOperation(operation, errorMessage) {
        let lastError;
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt === this.maxRetries) {
                    break;
                }
                this.logger.logInfo(`${errorMessage} - Attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
            }
        }
        throw lastError;
    }
    async downloadBinding(binding) {
        const pkg = await this.getNapiPackageName(binding);
        const url = `https://registry.npmjs.org/${pkg}/-/${pkg
            .split("/")
            .pop()}-${binding.version}.tgz`;
        this.logger.logInfo(`Downloading ${binding.name} binding for ${process.platform}-${process.arch}`);
        this.logger.logInfo(`URL: ${url}`);
        try {
            const response = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Downloading ${binding.name} bindings...`,
                cancellable: false,
            }, async () => {
                const { default: fetch } = await Promise.resolve().then(() => __importStar(require("node-fetch")));
                return await this.retryOperation(async () => {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`Failed to download binding: ${response.statusText}`);
                    }
                    return response;
                }, "Download failed");
            });
            const buffer = await response.arrayBuffer();
            const extractDir = this.getTempExtractPath(binding);
            // Ensure extract directory exists and is empty
            if (fs.existsSync(extractDir)) {
                fs.rmSync(extractDir, { recursive: true, force: true });
            }
            fs.mkdirSync(extractDir, { recursive: true });
            // Extract tarball
            const tarballPath = path.join(extractDir, `${pkg.split("/").pop()}.tgz`);
            fs.writeFileSync(tarballPath, Buffer.from(buffer));
            await this.retryOperation(async () => {
                await tar.x({
                    file: tarballPath,
                    cwd: extractDir,
                });
            }, "Extraction failed");
            // Move binding to storage
            const packageDir = path.join(extractDir, "package");
            const files = fs.readdirSync(packageDir);
            for (const file of files) {
                if (file.endsWith(".node")) {
                    const srcPath = path.join(packageDir, file);
                    const destPath = await this.getStoredBindingPath(binding);
                    await this.retryOperation(async () => {
                        fs.copyFileSync(srcPath, destPath);
                    }, "File copy failed");
                    this.logger.logInfo(`Cached ${binding.name} binding to ${destPath}`);
                }
            }
            // Keep the extracted files for future use
            this.logger.logInfo(`Preserving extracted ${binding.name} files for future use`);
        }
        catch (error) {
            this.logger.logError(error, true);
            vscode.window.showErrorMessage(`Failed to download ${binding.name} bindings`);
            throw error;
        }
    }
    async ensureBindings() {
        const results = await Promise.allSettled(this.bindings.map((binding) => this.ensureBinding(binding)));
        // Check for failures
        const failures = results
            .map((result, index) => ({ result, binding: this.bindings[index] }))
            .filter((item) => item.result.status === "rejected");
        if (failures.length > 0) {
            const bindingNames = failures.map((item) => item.binding.name).join(", ");
            throw new Error(`Failed to ensure bindings for: ${bindingNames}`);
        }
    }
    async ensureBinding(binding) {
        const pkg = await this.getNapiPackageName(binding);
        const storedPath = await this.getStoredBindingPath(binding);
        const targetPath = await this.getTargetBindingPath(binding);
        try {
            // Check if binding exists in storage
            if (!fs.existsSync(storedPath)) {
                this.logger.logInfo(`${binding.name} binding not found in cache, downloading...`);
                await this.downloadBinding(binding);
            }
            // Ensure target directory exists
            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            // Copy from storage to out directory if needed
            if (!fs.existsSync(targetPath) ||
                fs.statSync(storedPath).size !== fs.statSync(targetPath).size) {
                await this.retryOperation(async () => {
                    fs.copyFileSync(storedPath, targetPath);
                }, "Installation copy failed");
                this.logger.logInfo(`Installed ${binding.name} binding to ${targetPath}`);
            }
            else {
                this.logger.logInfo(`${binding.name} binding already installed.`);
            }
        }
        catch (error) {
            telemetryProvider_1.telemetry.sendError(telemetryProvider_1.EVENT_BINDINGS_FAILED, {
                pkg,
                binding: binding.name,
            });
            this.logger.logError(error, true);
            throw error;
        }
    }
}
exports.BindingDownloader = BindingDownloader;
//# sourceMappingURL=bindingDownload.js.map