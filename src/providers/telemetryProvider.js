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
exports.telemetry = exports.Telemetry = exports.EVENT_BINDINGS_FAILED = exports.EVENT_COMMIT_MSG = exports.EVENT_REVIEW_FILE_BY_FILE = exports.EVENT_REVIEW_STARTED = exports.EVENT_REFACTOR = exports.EVENT_DOC_GEN = exports.EVENT_CODE_COMPLETE_HOTKEY = exports.EVENT_CODE_COMPLETE = exports.EVENT_CODE_COMPLETE_CACHE = exports.EVENT_CHAT_SENT = exports.EVENT_VALIDATE_FAILED = exports.EVENT_VALIDATE_SUCCEEDED = exports.EVENT_FULL_INDEX_BUILD = exports.EVENT_COMPOSE_PHASE = exports.EVENT_COMPOSE_STARTED = exports.EVENT_VECTOR_STORE_LOAD_FAILED = exports.EVENT_AI_PROVIDER_VALIDATION_FAILED = exports.EVENT_EXTENSION_LOADED = void 0;
const vscode = __importStar(require("vscode"));
const extension_telemetry_1 = __importDefault(require("@vscode/extension-telemetry"));
exports.EVENT_EXTENSION_LOADED = "EXTENSION_LOADED";
exports.EVENT_AI_PROVIDER_VALIDATION_FAILED = "AI_PROVIDER_VALIDATION_FAILED";
exports.EVENT_VECTOR_STORE_LOAD_FAILED = "VECTOR_STORE_LOAD_FAILED";
exports.EVENT_COMPOSE_STARTED = "COMPOSE_STARTED";
exports.EVENT_COMPOSE_PHASE = "COMPOSE_PHASE";
exports.EVENT_FULL_INDEX_BUILD = "INDEX_BUILD_STARTED";
exports.EVENT_VALIDATE_SUCCEEDED = "VALIDATE_SUCCEEDED";
exports.EVENT_VALIDATE_FAILED = "VALIDATE_FAILED";
exports.EVENT_CHAT_SENT = "CHAT_SENT";
exports.EVENT_CODE_COMPLETE_CACHE = "CODE_COMPLETE_CACHE";
exports.EVENT_CODE_COMPLETE = "CODE_COMPLETE_SENT";
exports.EVENT_CODE_COMPLETE_HOTKEY = "CODE_COMPLETE_HOTKEY";
exports.EVENT_DOC_GEN = "DOC_GEN";
exports.EVENT_REFACTOR = "REFACTOR";
exports.EVENT_REVIEW_STARTED = "CODE_REVIEW";
exports.EVENT_REVIEW_FILE_BY_FILE = "CODE_REVIEW_FILES";
exports.EVENT_COMMIT_MSG = "COMMIT_MSG";
exports.EVENT_BINDINGS_FAILED = "BINDINGS_FAILED";
class Telemetry {
    constructor() {
        this.enabled = false;
        this.disposables = [];
        this.enabled = vscode.env.isTelemetryEnabled;
        const connectionString = process.env.PUBLIC_TELEMETRY_CONNECTIONSTRING;
        if (connectionString) {
            this.reporter = new extension_telemetry_1.default(connectionString);
            this.disposables.push(this.reporter);
        }
        this.disposables.push(vscode.env.onDidChangeTelemetryEnabled((e) => {
            this.enabled = e.valueOf();
        }));
    }
    dispose() {
        if (!this.disposables)
            return;
        for (const dispoable of this.disposables) {
            dispoable.dispose();
        }
    }
    sendEvent(eventName, eventPropeties) {
        if (!this.enabled)
            return;
        this.reporter?.sendTelemetryEvent(eventName, eventPropeties);
    }
    sendError(eventName, eventPropeties) {
        if (!this.enabled)
            return;
        this.reporter?.sendTelemetryErrorEvent(eventName, eventPropeties);
    }
}
exports.Telemetry = Telemetry;
const telemetry = new Telemetry();
exports.telemetry = telemetry;
//# sourceMappingURL=telemetryProvider.js.map