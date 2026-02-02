"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeSuggestionProvider = void 0;
const vscode_1 = require("vscode");
const eventEmitter_1 = require("../events/eventEmitter");
const delay_1 = require("../service/delay");
const contentWindow_1 = require("../service/utils/contentWindow");
const utilities_1 = require("./utilities");
const node_cache_1 = __importDefault(require("node-cache"));
const loggingProvider_1 = require("./loggingProvider");
const telemetryProvider_1 = require("./telemetryProvider");
const settings_1 = require("../service/settings");
const models_1 = require("../service/utils/models");
class CodeSuggestionProvider {
    async provideInlineCompletionItems(document, position, context, token) {
        const settings = await settings_1.wingmanSettings.loadSettings();
        if (!settings.interactionSettings.codeCompletionEnabled) {
            return [];
        }
        let timeout;
        const abort = new AbortController();
        const [prefix, suffix] = (0, contentWindow_1.getContentWindow)(document, position, settings.interactionSettings.codeContextWindow);
        const types = await (0, utilities_1.getSymbolsFromOpenFiles)();
        token.onCancellationRequested(() => {
            try {
                if (timeout) {
                    clearTimeout(timeout);
                }
                abort.abort();
            }
            finally {
                eventEmitter_1.eventEmitter._onQueryComplete.fire();
            }
        });
        const delayMs = 350;
        try {
            await (0, delay_1.delay)(delayMs);
            if (abort.signal.aborted) {
                return [new vscode_1.InlineCompletionItem("")];
            }
            return await this.bouncedRequest(document, prefix, abort.signal, suffix, settings, types);
        }
        catch {
            return [new vscode_1.InlineCompletionItem("")];
        }
    }
    async bouncedRequest(document, prefix, signal, suffix, settings, additionalContext) {
        try {
            eventEmitter_1.eventEmitter._onQueryStart.fire();
            // const cachedResult = this.cacheManager.get(
            // 	document,
            // 	prefix,
            // 	suffix
            // );
            // if (cachedResult) {
            // 	if (cachedResult === "") {
            // 		return [];
            // 	}
            // 	loggingProvider.logInfo(
            // 		"Code complete - Serving from query cache"
            // 	);
            // 	telemetry.sendEvent(EVENT_CODE_COMPLETE_CACHE, {
            // 		language: document.languageId,
            // 		aiProvider: this._settings.aiProvider,
            // 		model:
            // 			this._settings.providerSettings[
            // 				this._settings.aiProvider
            // 			]?.codeModel || "Unknown",
            // 	});
            // 	return [new InlineCompletionItem(cachedResult)];
            // }
            const aiProvider = (0, models_1.CreateAIProvider)(settings, loggingProvider_1.loggingProvider);
            let result = await aiProvider.codeComplete(prefix, suffix, signal, additionalContext);
            if (result.startsWith("```")) {
                result = (0, utilities_1.extractCodeBlock)(result);
            }
            // Get the current line from the prefix
            const currentLine = prefix.split("\n").pop()?.trim() || "";
            // Check if result starts with current line content
            if (currentLine && result.trim().startsWith(currentLine)) {
                // Remove the current line content from the result
                result = result.trim().slice(currentLine.length).trimStart();
            }
            if (result === "") {
                return [];
            }
            try {
                telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_CODE_COMPLETE, {
                    language: document.languageId,
                    aiProvider: settings.aiProvider,
                    model: settings.providerSettings[settings.aiProvider]?.codeModel ||
                        "Unknown",
                });
            }
            catch { }
            //this.cacheManager.set(document, prefix, suffix, result);
            return [new vscode_1.InlineCompletionItem(result)];
        }
        catch (error) {
            return [];
        }
        finally {
            eventEmitter_1.eventEmitter._onQueryComplete.fire();
        }
    }
}
exports.CodeSuggestionProvider = CodeSuggestionProvider;
CodeSuggestionProvider.selector = utilities_1.supportedLanguages;
class CacheManager {
    constructor() {
        this.cache = new node_cache_1.default({
            stdTTL: 15,
            maxKeys: 100,
            checkperiod: 5,
        });
        this.documentHashes = new Map();
    }
    generateCacheKey(document, prefix, suffix) {
        return `${document.uri.fsPath}:${prefix.slice(-100)}:${suffix.slice(0, 100)}`;
    }
    generateDocumentHash(document) {
        return Buffer.from(document.getText()).toString("base64").slice(0, 20);
    }
    set(document, prefix, suffix, value) {
        const key = this.generateCacheKey(document, prefix, suffix);
        this.cache.set(key, value);
        this.documentHashes.set(document.uri.fsPath, this.generateDocumentHash(document));
    }
    get(document, prefix, suffix) {
        const key = this.generateCacheKey(document, prefix, suffix);
        const cachedHash = this.documentHashes.get(document.uri.fsPath);
        const currentHash = this.generateDocumentHash(document);
        if (cachedHash !== currentHash) {
            this.invalidateDocument(document.uri.fsPath);
            return undefined;
        }
        return this.cache.get(key);
    }
    invalidateDocument(fsPath) {
        const keysToDelete = this.cache
            .keys()
            .filter((key) => key.startsWith(fsPath));
        // biome-ignore lint/complexity/noForEach: <explanation>
        keysToDelete.forEach((key) => this.cache.del(key));
        this.documentHashes.delete(fsPath);
    }
}
//# sourceMappingURL=codeSuggestionProvider.js.map