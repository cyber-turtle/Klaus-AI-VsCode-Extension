"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const vscode_1 = require("./vscode");
const logger = (msg) => {
    vscode_1.vscode.postMessage({
        command: 'log',
        value: { msg }
    });
};
exports.logger = logger;
//# sourceMappingURL=logger.js.map