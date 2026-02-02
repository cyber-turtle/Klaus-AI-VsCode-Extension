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
exports.loggingProvider = exports.VSCodeLoggingProvider = void 0;
const vscode = __importStar(require("vscode"));
class VSCodeLoggingProvider {
    constructor() {
        this.dbgChannel = vscode.window.createOutputChannel("Wingman");
    }
    logInfo(message) {
        this.dbgChannel.appendLine(`${new Date().toLocaleString()} - [info] ${message}`);
    }
    logError(messageOrError, showErrorModal) {
        const message = typeof messageOrError === "string"
            ? messageOrError
            : getErrorMessage(messageOrError);
        this.dbgChannel.appendLine(`${new Date().toLocaleString()} - [error] ${message}`);
        // if (showErrorModal) {
        // 	vscode.window.showErrorMessage(message);
        // }
    }
    dispose() {
        this.dbgChannel.dispose();
    }
}
exports.VSCodeLoggingProvider = VSCodeLoggingProvider;
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return "An unknown error occurred";
}
const loggingProvider = new VSCodeLoggingProvider();
exports.loggingProvider = loggingProvider;
//# sourceMappingURL=loggingProvider.js.map