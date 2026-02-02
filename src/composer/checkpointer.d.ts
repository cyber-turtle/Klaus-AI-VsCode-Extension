import type { RunnableConfig } from "@langchain/core/runnables";
import { BaseCheckpointSaver, type Checkpoint, type CheckpointListOptions, type CheckpointTuple, type SerializerProtocol, type PendingWrite, type CheckpointMetadata } from "@langchain/langgraph-checkpoint";
export declare class PartitionedFileSystemSaver extends BaseCheckpointSaver {
    private baseDir;
    private indexPath;
    private checkpointsDir;
    private writesDir;
    private dataDir;
    private threadMap;
    private writeMap;
    private loadedThreads;
    private dirtyThreads;
    private index;
    private indexLoaded;
    /**
     * Creates a new PartitionedFileSystemSaver instance
     * @param baseDir Directory where checkpoints will be stored
     * @param serde Optional serializer protocol
     */
    constructor(baseDir: string, serde?: SerializerProtocol);
    /**
     * Ensures all required directories exist
     */
    private ensureDirectories;
    /**
     * Helper function to create a hash of a string
     */
    private hashString;
    /**
     * Loads the central index file
     */
    private loadIndex;
    /**
     * Saves the central index file
     */
    private saveIndex;
    /**
     * Gets the path to a thread's checkpoint file
     */
    private getThreadCheckpointsPath;
    /**
     * Gets the path to a thread's writes file
     */
    private getThreadWritesPath;
    /**
     * Gets the path for storing large data
     */
    private getDataPath;
    /**
     * Loads thread data (checkpoints and writes) from disk if not already loaded
     */
    private loadThread;
    /**
     * Saves a thread's data to disk
     */
    private saveThread;
    /**
     * Helper method to serialize data, using files for large data
     */
    private serializeData;
    /**
     * Helper method to deserialize data
     */
    private deserializeData;
    /**
     * Creates a unique key for checkpoints
     */
    private makeCheckpointKey;
    /**
     * Creates a unique key for writes
     */
    private makeWritesKey;
    /**
     * Retrieves a checkpoint tuple by config
     */
    getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined>;
    /**
     * List checkpoints with optional filtering
     */
    list(config: RunnableConfig, options?: CheckpointListOptions): AsyncGenerator<CheckpointTuple>;
    /**
     * Store a checkpoint
     */
    put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig>;
    /**
     * Store pending writes for a checkpoint
     */
    putWrites(config: RunnableConfig, writes: PendingWrite[], taskId: string): Promise<void>;
    /**
     * Clear all stored data
     */
    clear(): void;
    /**
     * Force saving all pending changes
     */
    flush(): void;
    /**
     * Remove specific thread data
     * @param threadId The thread ID to remove
     * @param checkpoint_ns Optional namespace (removes all namespaces if not specified)
     */
    removeThread(threadId: string, checkpoint_ns?: string): void;
    /**
     * Delete a thread or specific checkpoint(s)
     * @param config Configuration specifying what to delete
     * @returns Boolean indicating if deletion was successful
     */
    delete(config: RunnableConfig): Promise<boolean>;
    /**
     * Clean up old checkpoints to manage disk space.
     * If threadId is provided, cleanup is limited to that thread.
     * @param maxAge Maximum age in milliseconds
     * @param maxCheckpointsPerThread Maximum number of checkpoints to keep per thread
     * @param threadId Optional thread ID to limit cleanup scope
     */
    cleanup(maxAge?: number, maxCheckpointsPerThread?: number, threadId?: string): void;
}
//# sourceMappingURL=checkpointer.d.ts.map