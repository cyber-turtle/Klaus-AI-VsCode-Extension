import { TextDocument } from "vscode-languageserver-textdocument";
import type { Location } from "vscode-languageserver";
export declare const getWorkspaceFolderForDocument: (documentUri: string, workspaceFolders: string[]) => string | null;
export declare function filePathToUri(filePath: string): string;
export declare function getTextDocumentFromUri(uri: string): Promise<TextDocument | undefined>;
export declare function getTextDocumentFromPath(filePath: string): Promise<TextDocument | undefined>;
export declare function filterSystemLibraries(definitions: Location[]): Location[];
export declare function convertIdToFilePath(id: string, rangeStartLine: string, rangeStartCharacter: string, directory: string): string;
export declare function convertIdToFileUri(id: string, rangeStartLine: string, rangeStartCharacter: string): string;
export declare function clearFilterCache(): void;
/**
 * Checks if a file matches include patterns and doesn't match exclude patterns
 * Updated to use individual patterns for better accuracy
 */
export declare function checkFileMatch(filePath: string, includePatterns: string, excludePatterns?: string, workspace?: string): Promise<boolean>;
/**
 * Gets gitignore patterns as an array of individual patterns
 * This makes it easier to process and filter files
 */
export declare function getGitignorePatterns(workspace: string, exclusionFilter?: string): Promise<string[]>;
/**
 * Helper function to check if a file matches any of the gitignore patterns
 * This allows for more accurate pattern matching than trying to use a single combined pattern
 */
export declare function isFileExcludedByGitignore(filePath: string, workspace: string): Promise<boolean>;
//# sourceMappingURL=utils.d.ts.map