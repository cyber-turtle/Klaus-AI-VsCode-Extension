"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFileExcludedByGitignore = exports.getGitignorePatterns = exports.checkFileMatch = exports.clearFilterCache = exports.convertIdToFileUri = exports.convertIdToFilePath = exports.filterSystemLibraries = exports.getTextDocumentFromPath = exports.getTextDocumentFromUri = exports.filePathToUri = exports.getWorkspaceFolderForDocument = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_url_1 = require("node:url");
const promises_1 = __importDefault(require("node:fs/promises"));
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const vscode_uri_1 = require("vscode-uri");
const loggingProvider_1 = require("../loggingProvider");
const minimatch_1 = require("minimatch");
const getWorkspaceFolderForDocument = (documentUri, workspaceFolders) => {
    const documentPath = vscode_uri_1.URI.parse(documentUri).fsPath;
    for (const folder of workspaceFolders) {
        if (documentPath.startsWith(folder)) {
            return folder;
        }
    }
    return null;
};
exports.getWorkspaceFolderForDocument = getWorkspaceFolderForDocument;
function filePathToUri(filePath) {
    const resolvedPath = node_path_1.default.isAbsolute(filePath)
        ? filePath
        : node_path_1.default.resolve(filePath);
    return (0, node_url_1.pathToFileURL)(resolvedPath).href;
}
exports.filePathToUri = filePathToUri;
async function getTextDocumentFromUri(uri) {
    const filePath = (0, node_url_1.fileURLToPath)(uri);
    try {
        await promises_1.default.access(filePath);
        const content = await promises_1.default.readFile(filePath, "utf8");
        return vscode_languageserver_textdocument_1.TextDocument.create(uri, "plaintext", 1, content);
    }
    catch (error) {
        console.error(`File does not exist: ${filePath}`);
    }
    return undefined;
}
exports.getTextDocumentFromUri = getTextDocumentFromUri;
async function getTextDocumentFromPath(filePath) {
    try {
        await promises_1.default.access(filePath);
        const content = await promises_1.default.readFile(filePath, "utf8");
        return vscode_languageserver_textdocument_1.TextDocument.create(filePathToUri(filePath), "plaintext", 1, content);
    }
    catch (error) {
        console.error(`File does not exist: ${filePath}`);
    }
    return undefined;
}
exports.getTextDocumentFromPath = getTextDocumentFromPath;
function filterSystemLibraries(definitions) {
    // Extended unwanted paths regex to include a generic Go's module cache path
    const unwantedPathsRegex = /node_modules|\.nuget|Assembly\/Microsoft|rustlib|rustc|rustup|rust-toolchain|rustup-toolchain|go\/pkg\/mod|\/go\/\d+(\.\d+)*\/|lib\/python\d+(\.\d+)*\/|site-packages|dist-packages/;
    return definitions.filter((def) => {
        const filePath = def.uri;
        // Use the regular expression to test for unwanted paths, including a generic Go library path
        return !unwantedPathsRegex.test(filePath);
    });
}
exports.filterSystemLibraries = filterSystemLibraries;
function convertIdToFilePath(id, rangeStartLine, rangeStartCharacter, directory) {
    const startRange = `${rangeStartLine}-${rangeStartCharacter}`;
    return (0, node_url_1.fileURLToPath)(id).replace(directory, "").replace(`-${startRange}`, "");
}
exports.convertIdToFilePath = convertIdToFilePath;
function convertIdToFileUri(id, rangeStartLine, rangeStartCharacter) {
    const startRange = `${rangeStartLine}-${rangeStartCharacter}`;
    return id.replace(`-${startRange}`, "");
}
exports.convertIdToFileUri = convertIdToFileUri;
let cachedGitignorePatterns = null;
function clearFilterCache() {
    cachedGitignorePatterns = null;
}
exports.clearFilterCache = clearFilterCache;
/**
 * Checks if a file matches include patterns and doesn't match exclude patterns
 * Updated to use individual patterns for better accuracy
 */
async function checkFileMatch(filePath, includePatterns, excludePatterns, workspace) {
    // Check if file matches include patterns
    const isIncluded = (0, minimatch_1.minimatch)(filePath, includePatterns, {
        dot: true,
        matchBase: true,
    });
    if (!isIncluded) {
        return false; // File doesn't match inclusion pattern
    }
    // If no exclude patterns and file is included, return true
    if (!excludePatterns) {
        return true;
    }
    // Check if the file matches any exclusion pattern
    const isExcluded = (0, minimatch_1.minimatch)(filePath, excludePatterns, {
        dot: true,
        matchBase: true,
    });
    // If workspace is provided, also check gitignore patterns
    if (workspace) {
        const isExcludedByGitignore = await isFileExcludedByGitignore(filePath, workspace);
        return isIncluded && !isExcluded && !isExcludedByGitignore;
    }
    // Return true if file is included and not excluded
    return isIncluded && !isExcluded;
}
exports.checkFileMatch = checkFileMatch;
/**
 * Gets gitignore patterns as an array of individual patterns
 * This makes it easier to process and filter files
 */
async function getGitignorePatterns(workspace, exclusionFilter) {
    if (cachedGitignorePatterns) {
        return cachedGitignorePatterns;
    }
    if (!workspace) {
        return [];
    }
    const gitignorePath = node_path_1.default.join(workspace, ".gitignore");
    try {
        const gitignoreContent = await promises_1.default.readFile(gitignorePath, "utf8");
        const gitignoreLines = gitignoreContent.toString().split("\n");
        // Process gitignore patterns
        cachedGitignorePatterns = gitignoreLines
            .filter((line) => line && !line.startsWith("#"))
            .map((pattern) => {
            const trimmed = pattern.trim();
            if (!trimmed)
                return null;
            // Return the pattern as is, without additional modifications
            return trimmed;
        })
            .filter(Boolean);
        // Add additional exclusion filters if provided
        if (exclusionFilter) {
            const sanitizedFilters = exclusionFilter
                .split(",")
                .map((filter) => filter.trim())
                .filter(Boolean);
            cachedGitignorePatterns.push(...sanitizedFilters);
        }
        loggingProvider_1.loggingProvider.logInfo(`Loaded ${cachedGitignorePatterns.length} gitignore patterns from ${gitignorePath}`);
        return cachedGitignorePatterns;
    }
    catch (err) {
        if (err instanceof Error) {
            loggingProvider_1.loggingProvider.logError(`Error reading .gitignore file: ${err.message}`);
        }
        return [];
    }
}
exports.getGitignorePatterns = getGitignorePatterns;
/**
 * Helper function to check if a file matches any of the gitignore patterns
 * This allows for more accurate pattern matching than trying to use a single combined pattern
 */
async function isFileExcludedByGitignore(filePath, workspace) {
    const patterns = await getGitignorePatterns(workspace);
    if (patterns.length === 0)
        return false;
    // Get the relative path for proper matching
    const relativePath = node_path_1.default.relative(workspace, filePath);
    // Match against each pattern individually
    for (const pattern of patterns) {
        // Handle negated patterns (those starting with !)
        if (pattern.startsWith("!")) {
            const negatedPattern = pattern.substring(1);
            if (matchPattern(relativePath, negatedPattern)) {
                // Negated patterns override previous matches
                return false;
            }
        }
        else if (matchPattern(relativePath, pattern)) {
            return true;
        }
    }
    return false;
}
exports.isFileExcludedByGitignore = isFileExcludedByGitignore;
/**
 * Enhanced pattern matching helper for gitignore rules
 * Handles directory-specific patterns and path segments correctly
 */
function matchPattern(filePath, pattern) {
    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, "/");
    let normalizedPattern = pattern.replace(/\\/g, "/");
    // Handle trailing slashes in patterns
    const isDirectoryPattern = normalizedPattern.endsWith("/");
    if (isDirectoryPattern) {
        normalizedPattern = normalizedPattern.slice(0, -1);
    }
    // First try exact matching (for both directory and non-directory patterns)
    const exactMatchOptions = {
        dot: true,
        nocase: false,
        matchBase: false,
        noglobstar: false,
    };
    // For patterns like "node_modules", we need to match both files and paths that contain node_modules
    // If it's a directory pattern (node_modules/), the pattern should only match directories
    if (!isDirectoryPattern) {
        // For non-directory patterns:
        // 1. Check if the full path matches the pattern
        const fullPathMatch = (0, minimatch_1.minimatch)(normalizedPath, normalizedPattern, exactMatchOptions);
        if (fullPathMatch)
            return true;
        // 2. Check if any path segment matches the pattern
        const pathSegments = normalizedPath.split("/");
        return pathSegments.some((segment) => segment === normalizedPattern);
    }
    // For directory patterns:
    // 1. Check if full path matches (should be a directory)
    if ((0, minimatch_1.minimatch)(normalizedPath, normalizedPattern, exactMatchOptions)) {
        return true;
    }
    // 2. Check if any directory in the path matches the pattern
    // This handles cases like "node_modules/" matching "path/to/node_modules/something"
    const pathSegments = normalizedPath.split("/");
    for (let i = 0; i < pathSegments.length - 1; i++) {
        // Check if this segment matches the directory pattern
        if (pathSegments[i] === normalizedPattern) {
            return true;
        }
        // Check for multi-segment patterns
        if (normalizedPattern.includes("/")) {
            const patternSegments = normalizedPattern.split("/");
            if (i + patternSegments.length <= pathSegments.length) {
                const segmentMatch = patternSegments.every((segment, j) => segment === pathSegments[i + j]);
                if (segmentMatch)
                    return true;
            }
        }
    }
    // Fall back to standard minimatch with matchBase (to handle globs like "*.log")
    return (0, minimatch_1.minimatch)(normalizedPath, normalizedPattern, {
        dot: true,
        matchBase: true,
        nocase: false,
        noglobstar: false,
        preserveMultipleSlashes: true,
    });
}
//# sourceMappingURL=utils.js.map