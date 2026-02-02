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
exports.getRecentFileTracker = exports.RecentFileTracker = void 0;
const uuid_1 = require("uuid");
const vscode = __importStar(require("vscode"));
/**
 * Tracks the most recently opened files in VSCode
 */
class RecentFileTracker {
    constructor() {
        this.recentFiles = [];
        this.maxFiles = 10;
        this.disposables = [];
        // Initialize with currently open documents
        const openDocuments = vscode.workspace.textDocuments.filter((d) => d.uri.scheme === "file");
        // Add currently open documents to recent files
        // biome-ignore lint/complexity/noForEach: <explanation>
        openDocuments.forEach((doc) => {
            this.addFile({
                path: doc.uri.fsPath,
                id: doc.uri.toString(),
            });
        });
        // Register event listener for document opening
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && editor.document.uri.scheme === "file") {
                this.addFile({
                    path: editor.document.uri.fsPath,
                    id: (0, uuid_1.v4)(),
                });
            }
        }));
    }
    /**
     * Gets the singleton instance of RecentFileTracker
     */
    static getInstance() {
        if (!RecentFileTracker.instance) {
            RecentFileTracker.instance = new RecentFileTracker();
        }
        return RecentFileTracker.instance;
    }
    /**
     * Adds a file to the recent files list
     */
    addFile(file) {
        // Remove the file if it already exists in the list
        this.recentFiles = this.recentFiles.filter((f) => f.id !== file.id);
        // Add the file to the beginning of the list
        this.recentFiles.unshift(file);
        // Trim the list to maxFiles
        if (this.recentFiles.length > this.maxFiles) {
            this.recentFiles = this.recentFiles.slice(0, this.maxFiles);
        }
    }
    /**
     * Gets the list of recent files
     */
    getRecentFiles() {
        return [...this.recentFiles];
    }
    /**
     * Opens a file from the recent files list
     */
    openFile(file) {
        if (file) {
            try {
                vscode.workspace
                    .openTextDocument(file.path)
                    .then((doc) => vscode.window.showTextDocument(doc))
                    .then(() => {
                    // Move the file to the top of the list
                    this.addFile(file);
                });
            }
            catch { }
        }
    }
    /**
     * Disposes of all registered event listeners
     */
    dispose() {
        // biome-ignore lint/complexity/noForEach: <explanation>
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
    }
}
exports.RecentFileTracker = RecentFileTracker;
// Export a convenience function to get the instance
const getRecentFileTracker = () => {
    return RecentFileTracker.getInstance();
};
exports.getRecentFileTracker = getRecentFileTracker;
//# sourceMappingURL=recentFileTracker.js.map