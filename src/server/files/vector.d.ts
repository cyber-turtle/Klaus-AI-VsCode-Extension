import type { Settings } from "@shared/types/Settings";
export interface VectorMetadata {
    filePath: string;
    lastModified?: number;
    [key: string]: any;
}
export interface SearchResult {
    file_path: string;
    summary: string;
    similarity: number;
    last_modified?: number;
    metadata: VectorMetadata;
}
export declare const buildSummarizationQuery: (code: string, filePath: string) => string;
export declare class VectorStore {
    private readonly settings;
    private readonly workspace;
    private connection;
    private table;
    private numDimensions;
    private tableName;
    private indexName;
    private storageDirectory;
    private currentFilePaths;
    private embedder;
    private summaryModel;
    private connect?;
    private indexCreated;
    private pendingVectors;
    private initialized;
    /**
     * Creates a new vector store
     * @param settings Application settings
     * @param workspace Current workspace path
     * @param storageDirectory Directory to persist the index (required for LanceDB)
     */
    constructor(settings: Settings, workspace: string, storageDirectory?: string | null);
    /**
     * Initialize LanceDB connection and table
     */
    initialize(): Promise<void>;
    /**
     * Check if the table exists in the database
     */
    private tableExists;
    /**
     * Load existing entries from the table to track current files
     */
    private loadCurrentEntries;
    /**
     * Create the vector index when we have enough vectors
     * This is called after adding vectors to ensure we have enough data
     */
    private createIndexIfNeeded;
    shouldUpdateFile(filePath: string, metadata?: Omit<VectorMetadata, "filePath">): Promise<boolean>;
    /**
     * Add or update a vector in the store
     * @param filePath The path to the file this vector represents
     * @param fileContents The contents of the file
     * @param metadata Additional metadata to store
     * @returns The file path of the inserted/updated vector
     */
    upsert(filePath: string, fileContents: string, metadata?: Omit<VectorMetadata, "filePath">): Promise<string>;
    /**
     * Remove a vector by file path
     * @param filePath The path to the file to remove
     * @returns true if the file was found and removed, false otherwise
     */
    remove(filePath: string): Promise<boolean>;
    /**
     * Handle file renaming/moving
     * @param oldPath Original file path
     * @param newPath New file path
     * @returns true if the file was found and renamed, false otherwise
     */
    moveFile(oldPath: string, newPath: string): Promise<boolean>;
    /**
     * Search for similar vectors
     * @param queryVector The query vector
     * @param k Number of results to return
     * @returns Array of search results sorted by similarity (highest first)
     */
    search(queryVector: number[], k?: number): Promise<SearchResult[]>;
    getIndexedFiles(): Promise<string[]>;
    resync(): Promise<void>;
    /**
     * Ensure the database connection and table are initialized
     */
    private ensureInitialized;
    /**
     * Remove the database
     */
    removeIndex(): Promise<void>;
    /**
     * Get statistics about the vector store
     */
    getStats(): Promise<{
        totalVectors: number;
        dimensions: number;
        indexCreated: boolean;
    }>;
}
//# sourceMappingURL=vector.d.ts.map