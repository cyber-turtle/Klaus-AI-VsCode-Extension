"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRange = exports.mapSymbol = exports.mapLocation = exports.getPlatformIdentifier = void 0;
const detect_libc_1 = require("detect-libc");
async function getPlatformIdentifier() {
    const parts = [process.platform, process.arch];
    if (process.platform === "linux") {
        try {
            const libcFamily = await (0, detect_libc_1.family)();
            if (libcFamily === detect_libc_1.MUSL) {
                parts.push("musl");
            }
            else if (process.arch === "arm") {
                parts.push("gnueabihf");
            }
            else {
                parts.push("gnu");
            }
        }
        catch (error) {
            // Add debug logging
            console.log("Fallback detection:", {
                versions: process.versions,
                musl: process.versions.musl,
                isMusl: Boolean(process.versions.musl),
            });
            const isMusl = Boolean(process.versions.musl);
            if (isMusl) {
                parts.push("musl");
            }
            else if (process.arch === "arm") {
                parts.push("gnueabihf");
            }
            else {
                parts.push("gnu");
            }
        }
    }
    else if (process.platform === "win32") {
        parts.push("msvc");
    }
    return parts.join("-");
}
exports.getPlatformIdentifier = getPlatformIdentifier;
const mapLocation = (location) => {
    if ("targetUri" in location) {
        // Handle LocationLink
        return {
            uri: location.targetUri.toString(),
            range: {
                start: {
                    line: location.targetRange.start.line,
                    character: location.targetRange.start.character,
                },
                end: {
                    line: location.targetRange.end.line,
                    character: location.targetRange.end.character,
                },
            },
        };
    }
    return {
        uri: location.uri.toString(),
        range: {
            start: {
                line: location.range.start.line,
                character: location.range.start.character,
            },
            end: {
                line: location.range.end.line,
                character: location.range.end.character,
            },
        },
    };
};
exports.mapLocation = mapLocation;
const mapSymbol = (symbol) => ({
    name: symbol.name,
    kind: symbol.kind,
    range: (0, exports.mapRange)(symbol.range),
    selectionRange: (0, exports.mapRange)(symbol.selectionRange),
    children: symbol.children
        ? symbol.children.map((child) => ({
            name: child.name,
            kind: child.kind,
            range: (0, exports.mapRange)(child.range),
            selectionRange: (0, exports.mapRange)(child.selectionRange),
            children: [], // Assuming no nested children for simplicity
        }))
        : [],
});
exports.mapSymbol = mapSymbol;
const mapRange = (range) => ({
    start: {
        line: range.start.line,
        character: range.start.character,
    },
    end: {
        line: range.end.line,
        character: range.end.character,
    },
});
exports.mapRange = mapRange;
//# sourceMappingURL=utils.js.map