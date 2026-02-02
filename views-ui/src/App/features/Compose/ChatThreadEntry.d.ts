/// <reference types="react" />
import type { ComposerState } from "@shared/types/Composer";
export declare function extractCodeBlock(text: string): string;
interface ChatThreadProps {
    state: ComposerState;
    loading: boolean;
}
export declare const ChatThread: ({ state, loading, }: ChatThreadProps) => import("react").JSX.Element;
export {};
//# sourceMappingURL=ChatThreadEntry.d.ts.map