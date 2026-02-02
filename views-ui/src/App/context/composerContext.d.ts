import { type FileDiagnostic, type FileSearchResult, type ComposerThread, type ComposerState, type ComposerRequest } from "@shared/types/Composer";
import type React from "react";
import { type FC, type PropsWithChildren } from "react";
interface ComposerContextType {
    composerStates: ComposerState[];
    setComposerStates: React.Dispatch<React.SetStateAction<ComposerState[]>>;
    loading: boolean;
    initialized: boolean;
    inputTokens: number;
    outputTokens: number;
    sendComposerRequest: (request: ComposerRequest, thread: ComposerThread) => void;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    clearActiveMessage: () => void;
    setActiveComposerState: React.Dispatch<React.SetStateAction<ComposerState | undefined>>;
    setFileDiagnostics: React.Dispatch<React.SetStateAction<FileDiagnostic[]>>;
    activeComposerState: ComposerState | undefined;
    activeFiles: FileSearchResult[];
    setActiveFiles: React.Dispatch<React.SetStateAction<FileSearchResult[]>>;
    threads: ComposerThread[];
    activeThread: ComposerThread | null;
    fileDiagnostics: FileDiagnostic[];
    createThread: (title: string, fromMessage?: boolean) => ComposerThread;
    switchThread: (threadId: string) => void;
    deleteThread: (threadId: string) => void;
    renameThread: (threadId: string, newTitle: string) => void;
    branchThread: (threadId: string) => void;
}
export declare const useComposerContext: () => ComposerContextType;
export declare const ComposerProvider: FC<PropsWithChildren>;
export {};
//# sourceMappingURL=composerContext.d.ts.map