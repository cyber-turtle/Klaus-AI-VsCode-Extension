"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTruncatedPath = exports.openFile = exports.undoFile = exports.showDiffview = exports.rejectFile = exports.acceptFile = void 0;
const vscode_1 = require("./vscode");
const acceptFile = (event) => {
    if (event) {
        vscode_1.vscode.postMessage({
            command: "accept-file",
            value: event,
        });
    }
};
exports.acceptFile = acceptFile;
const rejectFile = (event) => {
    if (event) {
        vscode_1.vscode.postMessage({
            command: "reject-file",
            value: event,
        });
    }
};
exports.rejectFile = rejectFile;
const showDiffview = (event) => {
    if (event) {
        vscode_1.vscode.postMessage({
            command: "diff-view",
            value: event,
        });
    }
};
exports.showDiffview = showDiffview;
const undoFile = (event) => {
    if (event) {
        vscode_1.vscode.postMessage({
            command: "undo-file",
            value: event,
        });
    }
};
exports.undoFile = undoFile;
const openFile = (file) => {
    if (file) {
        vscode_1.vscode.postMessage({
            command: "open-file",
            value: {
                path: file.path,
            },
        });
    }
};
exports.openFile = openFile;
const getTruncatedPath = (path) => {
    if (path.indexOf("/") === -1)
        return path;
    const parts = path.split("/");
    const fileName = parts.pop() ?? "";
    const lastFolder = parts.pop();
    const shortPath = lastFolder ? `${lastFolder}/${fileName}` : fileName;
    return parts.length > 0 ? `.../${shortPath}` : shortPath;
};
exports.getTruncatedPath = getTruncatedPath;
//# sourceMappingURL=files.js.map