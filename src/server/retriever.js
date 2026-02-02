"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSymbolRetriever = exports.createDiagnosticsRetriever = void 0;
const createDiagnosticsRetriever = (connection) => {
    return {
        getFileDiagnostics: async (filePaths) => {
            const diagnostics = (await connection.sendRequest("wingman/provideFileDiagnostics", filePaths)) || [];
            return diagnostics;
        },
    };
};
exports.createDiagnosticsRetriever = createDiagnosticsRetriever;
const createSymbolRetriever = (connection) => {
    return {
        getSymbols: async (documentUri) => {
            const symbols = (await connection.sendRequest("wingman/provideDocumentSymbols", {
                uri: documentUri,
            })) || [];
            return symbols;
        },
        getDefinition: async (documentUri, position) => {
            const locations = (await connection.sendRequest("wingman/provideDefinition", {
                uri: documentUri,
                position: {
                    line: position.line,
                    character: position.character,
                },
            })) || [];
            return locations;
        },
        getTypeDefinition: async (documentUri, position) => {
            const locations = (await connection.sendRequest("wingman/provideTypeDefiniton", {
                uri: documentUri,
                position: {
                    line: position.line,
                    character: position.character,
                },
            })) || [];
            return locations;
        },
    };
};
exports.createSymbolRetriever = createSymbolRetriever;
//# sourceMappingURL=retriever.js.map