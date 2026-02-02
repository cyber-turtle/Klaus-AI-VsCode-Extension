import { type SearchResults } from "duck-duck-scrape";
import type { AIProvider } from "../service/base";
export declare class WebCrawler {
    private readonly aiProvider;
    private turndown;
    private visitedUrls;
    private MAX_DEPTH;
    private MAX_PAGES;
    private sourceReferences;
    constructor(aiProvider: AIProvider);
    getBestMatchUrl: (input: string, results: SearchResults) => Promise<string>;
    /**
     * Extract domain from URL
     */
    private extractDomain;
    /**
     * Extract potential publish date from HTML
     */
    private extractPublishDate;
    /**
     * Extract links from HTML content
     */
    private extractLinks;
    /**
     * Fetch and process a single page
     */
    private fetchPage;
    /**
     * Determine if we should continue researching based on content relevance
     */
    private shouldContinueResearch;
    /**
     * Get a source reference number, creating a new one if needed
     */
    private getSourceReference;
    /**
     * Format sources in markdown with Perplexity-style numbered references
     */
    private formatSourcesMarkdown;
    /**
     * Summarize research findings with Perplexity-style references
     */
    private summarizeResearch;
    /**
     * Perform deep research on a topic
     */
    deepResearch(query: string): Promise<string>;
    /**
     * Legacy generator method - kept for backward compatibility
     * @deprecated Use deepResearch instead
     */
    searchWeb: (input: string) => AsyncGenerator<string, void, unknown>;
}
//# sourceMappingURL=web.d.ts.map