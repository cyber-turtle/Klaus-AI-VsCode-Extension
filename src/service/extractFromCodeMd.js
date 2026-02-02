"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractCsharpDocs = exports.extractJsDocs = exports.extractStringDocs = exports.extractFromCodeMd = void 0;
const extractFromCodeMd = (text) => {
    if (!text || !text.trim())
        return '';
    const regex = /```(\w*\n)?([\s\S]*?)```/;
    const match = text.match(regex);
    let codeBlockContent = '';
    if (match) {
        const startIndex = match.index + match[0].indexOf(match[2]);
        const endIndex = match.index + match[0].lastIndexOf(match[2]) + match[2].length;
        codeBlockContent = text.substring(startIndex, endIndex).trim();
        return codeBlockContent;
    }
    else {
        return '';
    }
};
exports.extractFromCodeMd = extractFromCodeMd;
// fot a give python code, extract the string documentation
const extractStringDocs = (pythonCode) => {
    // Should the reg ex use """ instead of "''"?
    const regex = /"""([\s\S]*?)"""/;
    const match = pythonCode.match(regex);
    if (match) {
        return `"""${match[1]}"""`;
    }
    else {
        return '';
    }
};
exports.extractStringDocs = extractStringDocs;
// for a given js / ts code, extract the jsdoc
const extractJsDocs = (jsCode) => {
    const regex = /\/\*\*([\s\S]*?)\*\//;
    const match = jsCode.match(regex);
    if (match) {
        return `/**${match[1]}*/`;
    }
    else {
        return '';
    }
};
exports.extractJsDocs = extractJsDocs;
const extractCsharpDocs = (csharpCode) => {
    // csharp doc comments use xml tags starting with /// <summary> and ending with /// </summary>
    const regex = /\/\/\/\s?<summary>([\s\S]*?)\/\/\/\s?<\/summary>/;
    const match = csharpCode.match(regex);
    if (match) {
        return match[0];
    }
    else {
        return '';
    }
};
exports.extractCsharpDocs = extractCsharpDocs;
//# sourceMappingURL=extractFromCodeMd.js.map