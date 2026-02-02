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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const genDocs_1 = require("./commands/genDocs");
const chatViewProvider_1 = require("./providers/chatViewProvider");
const codeSuggestionProvider_1 = require("./providers/codeSuggestionProvider");
const configViewProvider_1 = require("./providers/configViewProvider");
const hotkeyCodeSuggestionProvider_1 = require("./providers/hotkeyCodeSuggestionProvider");
const refactorProvider_1 = require("./providers/refactorProvider");
const statusBarProvider_1 = require("./providers/statusBarProvider");
const index_1 = __importDefault(require("./client/index"));
const loggingProvider_1 = require("./providers/loggingProvider");
const eventEmitter_1 = require("./events/eventEmitter");
const settings_1 = require("./service/settings");
const diffViewProvider_1 = require("./providers/diffViewProvider");
const telemetryProvider_1 = require("./providers/telemetryProvider");
const workspace_1 = require("./service/workspace");
const bindingDownload_1 = require("./client/bindingDownload");
const threadViewProvider_1 = require("./providers/threadViewProvider");
const recentFileTracker_1 = require("./providers/recentFileTracker");
const chromium_1 = require("./utils/chromium");
let statusBarProvider;
let diffViewProvider;
let chatViewProvider;
let configViewProvider;
let threadViewProvider;
let codeSuggestionDispoable;
async function activate(context) {
    if (!vscode.workspace.workspaceFolders ||
        vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showInformationMessage("Wingman requires an open workspace to function.");
        return;
    }
    try {
        let progressResolveOuter;
        let progressResolveInner;
        let progressObject;
        const PROGRESS_DELAY = 3000;
        let progressShown = false;
        // Create a delayed progress window
        const progressPromise = new Promise((resolve) => {
            const timeout = setTimeout(() => {
                progressShown = true;
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Initializing Wingman",
                    cancellable: false,
                }, async (progress) => {
                    progressObject = progress;
                    progress.report({
                        message: "Verifying dependencies...",
                    });
                    return new Promise((res) => {
                        progressResolveInner = res;
                    });
                });
            }, PROGRESS_DELAY);
            // Store the resolve function to be called later
            progressResolveOuter = () => {
                clearTimeout(timeout);
                resolve();
            };
        });
        // This is required to download WASM bindings
        const bindingDownloader = new bindingDownload_1.BindingDownloader(context, loggingProvider_1.loggingProvider);
        await bindingDownloader.ensureBindings();
        // Update progress message for Chromium check/download
        if (progressObject) {
            progressObject.report({ message: "Setting up Chromium dependencies..." });
        }
        // Now check/download Chromium
        await (0, chromium_1.ensureChromium)(context?.globalStorageUri?.fsPath);
        // Resolve both promises if needed
        if (progressShown && progressResolveInner) {
            progressResolveInner();
        }
        if (progressResolveOuter) {
            progressResolveOuter();
        }
        // Wait for any pending progress to close
        await progressPromise;
    }
    catch (error) {
        loggingProvider_1.loggingProvider.logError(error, true);
        throw error;
    }
    const workspace = new workspace_1.Workspace(context, vscode.workspace.workspaceFolders?.[0].name, vscode.workspace.workspaceFolders?.[0].uri.fsPath);
    configViewProvider = new configViewProvider_1.ConfigViewProvider(context.extensionUri, workspace.workspaceFolder, index_1.default, context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(configViewProvider_1.ConfigViewProvider.viewType, configViewProvider));
    context.subscriptions.push(vscode.commands.registerCommand(configViewProvider_1.ConfigViewProvider.showConfigCommand, async () => {
        configViewProvider.openInPanel();
    }));
    const settings = await settings_1.wingmanSettings.loadSettings();
    if (settings_1.wingmanSettings.isDefault) {
        const result = await vscode.window.showErrorMessage("Wingman has not yet been configured.", "Open Settings");
        if (result === "Open Settings") {
            await vscode.commands.executeCommand(configViewProvider_1.ConfigViewProvider.showConfigCommand);
        }
    }
    try {
        telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_EXTENSION_LOADED, {
            aiProvider: settings.aiProvider,
            chatModel: settings.providerSettings[settings.aiProvider]?.chatModel,
            codeModel: settings.providerSettings[settings.aiProvider]?.codeModel,
        });
    }
    catch { }
    let modelProvider;
    try {
        if (!(await index_1.default.validate())) {
            telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_AI_PROVIDER_VALIDATION_FAILED, {
                aiProvider: settings.aiProvider,
            });
            throw new Error(`AI Provider: ${settings.aiProvider} is not configured correctly. If you're using Ollama, try changing the model and saving your settings.`);
        }
        await index_1.default.activate(context, settings);
    }
    catch (error) {
        if (error instanceof Error) {
            telemetryProvider_1.telemetry.sendEvent(telemetryProvider_1.EVENT_AI_PROVIDER_VALIDATION_FAILED, {
                reason: error.message,
            });
            const result = await vscode.window.showErrorMessage(error.message, "Open Settings");
            if (result === "Open Settings") {
                await vscode.commands.executeCommand(configViewProvider_1.ConfigViewProvider.showConfigCommand);
            }
            loggingProvider_1.loggingProvider.logInfo(error.message);
            eventEmitter_1.eventEmitter._onFatalError.fire();
        }
    }
    diffViewProvider = new diffViewProvider_1.DiffViewProvider(context, index_1.default);
    threadViewProvider = new threadViewProvider_1.ThreadViewProvider(context, index_1.default);
    statusBarProvider = new statusBarProvider_1.ActivityStatusBar();
    context.subscriptions.push(vscode.commands.registerCommand(genDocs_1.GenDocs.command, genDocs_1.GenDocs.generateDocs));
    context.subscriptions.push(vscode.commands.registerCommand(refactorProvider_1.RefactorProvider.command, refactorProvider_1.RefactorProvider.refactorCode));
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(codeSuggestionProvider_1.CodeSuggestionProvider.selector, new genDocs_1.GenDocs(modelProvider)));
    chatViewProvider = new chatViewProvider_1.ChatViewProvider(index_1.default, context, diffViewProvider, threadViewProvider, workspace, configViewProvider);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(chatViewProvider_1.ChatViewProvider.viewType, chatViewProvider, {
        webviewOptions: {
            retainContextWhenHidden: true,
        },
    }));
    if (settings.interactionSettings.codeCompletionEnabled) {
        codeSuggestionDispoable =
            vscode.languages.registerInlineCompletionItemProvider(codeSuggestionProvider_1.CodeSuggestionProvider.selector, new codeSuggestionProvider_1.CodeSuggestionProvider());
        context.subscriptions.push(codeSuggestionDispoable);
    }
    settings_1.wingmanSettings.registerOnChangeHandler((settings) => {
        if (chatViewProvider) {
            chatViewProvider.updateSettingsOnUI();
        }
        if (settings.interactionSettings.codeCompletionEnabled) {
            codeSuggestionDispoable =
                vscode.languages.registerInlineCompletionItemProvider(codeSuggestionProvider_1.CodeSuggestionProvider.selector, new codeSuggestionProvider_1.CodeSuggestionProvider());
            context.subscriptions.push(codeSuggestionDispoable);
        }
        else {
            const index = context.subscriptions.findIndex((subscription) => subscription === codeSuggestionDispoable);
            if (index !== -1) {
                context.subscriptions.splice(index, 1)[0].dispose();
            }
        }
    });
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(refactorProvider_1.RefactorProvider.selector, new refactorProvider_1.RefactorProvider(), {
        providedCodeActionKinds: refactorProvider_1.RefactorProvider.providedCodeActionKinds,
    }));
    await workspace.load();
    hotkeyCodeSuggestionProvider_1.HotKeyCodeSuggestionProvider.provider = new hotkeyCodeSuggestionProvider_1.HotKeyCodeSuggestionProvider();
    context.subscriptions.push(vscode.commands.registerCommand(hotkeyCodeSuggestionProvider_1.HotKeyCodeSuggestionProvider.command, hotkeyCodeSuggestionProvider_1.HotKeyCodeSuggestionProvider.showSuggestion));
    context.subscriptions.push(vscode.commands.registerCommand(chatViewProvider_1.ChatViewProvider.showComposerCommand, async () => {
        chatViewProvider.setLaunchView("composer");
        await vscode.commands.executeCommand(`${chatViewProvider_1.ChatViewProvider.viewType}.focus`);
    }));
}
exports.activate = activate;
function deactivate() {
    if (statusBarProvider) {
        statusBarProvider.dispose();
    }
    (0, recentFileTracker_1.getRecentFileTracker)().dispose();
    index_1.default?.deactivate();
    diffViewProvider?.dispose();
    threadViewProvider?.dispose();
    loggingProvider_1.loggingProvider.dispose();
    telemetryProvider_1.telemetry.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map