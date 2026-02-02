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
exports.ActivityStatusBar = void 0;
const vscode = __importStar(require("vscode"));
const eventEmitter_1 = require("../events/eventEmitter");
class ActivityStatusBar {
    constructor() {
        this.isInErrorState = false;
        this.onFatalError = eventEmitter_1.eventEmitter._onFatalError.event;
        this.onQueryStart = eventEmitter_1.eventEmitter._onQueryStart.event;
        this.onQueryComplete = eventEmitter_1.eventEmitter._onQueryComplete.event;
        this.activityStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.activityStatusBarItem.text = "$(wingman-logo) Wingman";
        this.activityStatusBarItem.show();
        this.onQueryStart(() => {
            this.TogglePending(true);
        });
        this.onQueryComplete(() => {
            this.TogglePending(false);
        });
        this.onFatalError(() => {
            this.ToggleError();
        });
    }
    TogglePending(pending) {
        if (this.isInErrorState) {
            return;
        }
        this.activityStatusBarItem.text = `${pending ? "$(sync~spin)" : "$(wingman-logo)"} Wingman`;
    }
    ToggleError() {
        this.isInErrorState = true;
        this.activityStatusBarItem.text = "$(testing-error-icon) Wingman";
    }
    dispose() {
        this.activityStatusBarItem?.dispose();
    }
}
exports.ActivityStatusBar = ActivityStatusBar;
//# sourceMappingURL=statusBarProvider.js.map