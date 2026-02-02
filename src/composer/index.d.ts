import { Command } from "@langchain/langgraph";
import { HumanMessage, type BaseMessage } from "@langchain/core/messages";
import type { ComposerThread, ComposerRequest, ComposerResponse } from "@shared/types/Composer";
import type { CommandMetadata, FileMetadata } from "@shared/types/Message";
import type { RunnableConfig } from "@langchain/core/runnables";
import type { PartitionedFileSystemSaver } from "./checkpointer";
import type { CodeParser } from "../server/files/parser";
import type { VectorStore } from "../server/files/vector";
import type { DiagnosticRetriever } from "../server/retriever";
export type GraphStateAnnotation = typeof GraphAnnotation.State;
declare const GraphAnnotation: import("@langchain/langgraph").AnnotationRoot<{
    title: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
    createdAt: import("@langchain/langgraph").BinaryOperatorAggregate<number, number>;
    parentThreadId: import("@langchain/langgraph").BinaryOperatorAggregate<string | undefined, string | undefined>;
    messages: import("@langchain/langgraph").BinaryOperatorAggregate<BaseMessage[], BaseMessage[]>;
    workspace: import("@langchain/langgraph").BinaryOperatorAggregate<string, string>;
    commands: import("@langchain/langgraph").BinaryOperatorAggregate<CommandMetadata[], CommandMetadata[]>;
    files: import("@langchain/langgraph").BinaryOperatorAggregate<FileMetadata[], FileMetadata[]>;
}>;
/**
 * WingmanAgent - Autonomous coding assistant
 */
export declare class WingmanAgent {
    private readonly workspace;
    private readonly checkpointer;
    private readonly codeParser;
    private readonly storagePath;
    private readonly vectorStore?;
    private readonly diagnosticRetriever?;
    private tools;
    private settings;
    private aiProvider;
    private workflow;
    private messages;
    private mcpAdapter;
    private lastToolCallId;
    private gitAvailable;
    initialized: boolean;
    constructor(workspace: string, checkpointer: PartitionedFileSystemSaver, codeParser: CodeParser, storagePath: string, vectorStore?: VectorStore | undefined, diagnosticRetriever?: DiagnosticRetriever | undefined);
    initialize(): Promise<void>;
    cancel(threadId: string): Promise<void>;
    /**
     * Creates a new thread branch from an existing thread's state
     * @param sourceThreadId The source thread ID to branch from
     * @param sourceCheckpointId Optional specific checkpoint ID to branch from (uses latest if not provided)
     * @param targetThreadId Optional new thread ID (generates one if not provided)
     * @returns The new thread ID and checkpoint configuration
     */
    branchThread(sourceThreadId: string, sourceCheckpointId?: string, targetThreadId?: string): Promise<{
        threadId: string;
        config: RunnableConfig;
    }>;
    updateThread({ thread, messages, }: {
        thread: Partial<ComposerThread>;
        messages?: GraphStateAnnotation["messages"];
    }): Promise<void>;
    createThread(thread: ComposerThread): Promise<void>;
    /**
     * Deletes a thread and all its associated checkpoints
     * @param threadId The ID of the thread to delete
     * @param options Optional configuration for deletion behavior
     * @returns A boolean indicating whether the deletion was successful
     */
    deleteThread(threadId: string, options?: {
        /**
         * Whether to also delete any branches created from this thread
         * Default: false
         */
        deleteBranches?: boolean;
        /**
         * Whether to perform a soft delete (mark as deleted but retain data)
         * Default: false
         */
        softDelete?: boolean;
    }): Promise<boolean>;
    updateFile: (event: UpdateComposerFileEvent) => Promise<GraphStateAnnotation | undefined>;
    loadContextFiles(files: string[]): Promise<FileMetadata[]>;
    trimMessages: (allMessages: GraphStateAnnotation["messages"]) => BaseMessage[];
    routerAfterLLM: (state: GraphStateAnnotation, config: RunnableConfig) => Promise<"tools" | "review" | "__end__">;
    getState: (threadId: string) => Promise<ComposerState>;
    callModel: (state: GraphStateAnnotation) => Promise<{
        messages: any[];
    }>;
    humanReviewNode: (state: GraphStateAnnotation, config: RunnableConfig) => Promise<"agent" | Command<unknown>>;
    /**
     * Execute a message in a conversation thread
     */
    execute(request: ComposerRequest, resumedFromFiles?: FileMetadata[], resumedFromCommand?: CommandMetadata, temp?: boolean): AsyncIterable<ComposerResponse>;
    buildUserMessages: (request: ComposerRequest, temp?: boolean) => Promise<HumanMessage[]>;
    /**
     * Handles streaming events from LangChain and dispatches custom events
     * @param stream The LangChain event stream
     * @param eventName The name of the custom event to dispatch
     */
    handleStreamEvents(stream: AsyncIterable<any>, threadId: string, isOllama?: boolean): AsyncIterableIterator<ComposerResponse>;
}
export {};
//# sourceMappingURL=index.d.ts.map