"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingProvider = exports.ConsoleLoggingProvider = void 0;
class ConsoleLoggingProvider {
    logInfo(message) {
        console.log(`${new Date().toLocaleString()} - [info] ${message}`);
    }
    logError(messageOrError) {
        const message = typeof messageOrError === "string"
            ? messageOrError
            : getErrorMessage(messageOrError);
        console.error(`${new Date().toLocaleString()} - [error] ${message}`);
    }
    dispose() {
        // No need to dispose anything for console logging
    }
}
exports.ConsoleLoggingProvider = ConsoleLoggingProvider;
function getErrorMessage(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === "string") {
        return error;
    }
    return "An unknown error occurred";
}
const loggingProvider = new ConsoleLoggingProvider();
exports.loggingProvider = loggingProvider;
//# sourceMappingURL=loggingProvider.js.map