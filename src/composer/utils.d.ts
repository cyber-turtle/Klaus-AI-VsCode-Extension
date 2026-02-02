import type { ChatMessage } from "@langchain/core/messages";
export declare function formatMessages(messages: ChatMessage[]): string;
export declare function loadWingmanRules(workspace: string): Promise<string | undefined>;
export interface DirectoryContent {
    type: "file" | "directory";
    name: string;
    path: string;
    depth: number;
}
export declare function scanDirectory(dir: string, maxDepth: number, cwd?: string): Promise<DirectoryContent[]>;
//# sourceMappingURL=utils.d.ts.map