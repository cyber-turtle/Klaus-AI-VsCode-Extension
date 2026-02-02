"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebCrawler = void 0;
const duck_duck_scrape_1 = require("duck-duck-scrape");
const turndown_1 = __importDefault(require("turndown"));
const cheerio = __importStar(require("cheerio"));
const node_fetch_1 = __importDefault(require("node-fetch"));
class WebCrawler {
    constructor(aiProvider) {
        this.aiProvider = aiProvider;
        this.visitedUrls = new Set();
        this.MAX_DEPTH = 3;
        this.MAX_PAGES = 5;
        this.sourceReferences = new Map(); // Track source references
        this.getBestMatchUrl = async (input, results) => {
            const searchResultsText = results.results
                .map((result, index) => `${index + 1}. Title: ${result.title}
                URL: ${result.url}
                Description: ${result.description}`)
                .join("\n\n");
            const response = await this.aiProvider.getModel().invoke(`You are analyzing search results to find the most relevant URL for a user's query.
    
Query: "${input}"

Search Results:
${searchResultsText}

Task: Analyze these search results and return ONLY the URL of the most relevant result that best matches the query.

Selection criteria:
- Relevance to the original query
- Credibility of the source
- Content freshness and quality
- Avoid sponsored or advertisement links
- Prefer official documentation or reputable sources

Response format:
- Return ONLY the URL, no explanation or additional text
- If no results are relevant, return "none"`);
            const url = response.content.toString().trim();
            if (!url || url === "none") {
                throw new Error("No relevant results found");
            }
            // Validate the URL exists in our results to prevent hallucination
            const matchingResult = results.results.find((r) => r.url === url);
            if (!matchingResult) {
                return results.results[0].url; // Fallback to first result if model hallucinates
            }
            return url;
        };
        /**
         * Extract links from HTML content
         */
        this.extractLinks = ($, baseUrl) => {
            const links = [];
            $("a[href]").each((_, element) => {
                const href = $(element).attr("href");
                if (href && !href.startsWith("#") && !href.startsWith("javascript:")) {
                    try {
                        // Convert relative URLs to absolute
                        const absoluteUrl = new URL(href, baseUrl).toString();
                        // Filter out non-http/https URLs and already visited URLs
                        if ((absoluteUrl.startsWith("http://") ||
                            absoluteUrl.startsWith("https://")) &&
                            !this.visitedUrls.has(absoluteUrl)) {
                            links.push(absoluteUrl);
                        }
                    }
                    catch (e) {
                        // Skip invalid URLs
                    }
                }
            });
            return links;
        };
        /**
         * Legacy generator method - kept for backward compatibility
         * @deprecated Use deepResearch instead
         */
        this.searchWeb = async function* (input) {
            try {
                const searchResults = await (0, duck_duck_scrape_1.search)(input, {
                    safeSearch: duck_duck_scrape_1.SafeSearchType.STRICT,
                });
                if (!searchResults.results.length) {
                    yield "No search results found";
                    return;
                }
                const bestMatch = await this.getBestMatchUrl(input, searchResults);
                const response = await (0, node_fetch_1.default)(bestMatch);
                const html = await response.text();
                // Parse HTML
                const $ = cheerio.load(html);
                $("script, style, nav, footer, iframe, noscript").remove();
                const mainContent = $("main, article, .content, #content, .main").first().html() ||
                    $("body").html();
                if (!mainContent) {
                    yield "Could not extract content from the webpage";
                    return;
                }
                const markdown = this.turndown.turndown(mainContent);
                yield markdown;
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error("Error in web search:", error);
                    yield `Error searching the web: ${error.message}`;
                }
            }
        }.bind(this);
        this.turndown = new turndown_1.default({
            headingStyle: "atx",
            codeBlockStyle: "fenced",
        });
        // Customize link formatting to use numbered references
        this.turndown.addRule("links", {
            filter: "a",
            replacement: (content, node) => {
                //@ts-expect-error
                const href = node.getAttribute("href");
                if (!href)
                    return content;
                try {
                    // We'll handle links differently in the final output
                    // Just preserve the content and href for now
                    return content;
                }
                catch (e) {
                    return content;
                }
            },
        });
    }
    /**
     * Extract domain from URL
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, "");
        }
        catch (e) {
            return "unknown-domain";
        }
    }
    /**
     * Extract potential publish date from HTML
     */
    extractPublishDate($) {
        // Try common date meta tags
        const metaDate = $('meta[property="article:published_time"], meta[name="date"], meta[name="pubdate"], meta[name="publication_date"]').attr("content");
        if (metaDate) {
            try {
                return new Date(metaDate).toISOString().split("T")[0]; // YYYY-MM-DD format
            }
            catch (e) {
                // Invalid date format
            }
        }
        // Try looking for dates in time elements
        const timeEl = $("time[datetime]").first().attr("datetime");
        if (timeEl) {
            try {
                return new Date(timeEl).toISOString().split("T")[0];
            }
            catch (e) {
                // Invalid date format
            }
        }
        return undefined;
    }
    /**
     * Fetch and process a single page
     */
    async fetchPage(url) {
        try {
            this.visitedUrls.add(url);
            const response = await (0, node_fetch_1.default)(url);
            if (!response.ok) {
                return null;
            }
            const html = await response.text();
            const $ = cheerio.load(html);
            // Remove non-content elements
            $("script, style, nav, footer, iframe, noscript, header, aside, .ads, .advertisement, .sidebar").remove();
            // Extract title
            const title = $("title").text().trim() || url;
            // Extract domain
            const domain = this.extractDomain(url);
            // Extract publish date
            const publishDate = this.extractPublishDate($);
            // Extract main content
            const mainContent = $("main, article, .content, #content, .main, .post, .entry, .post-content")
                .first()
                .html() || $("body").html();
            if (!mainContent) {
                return null;
            }
            // Extract links for potential deeper research
            const links = this.extractLinks($, url);
            // Convert HTML to markdown
            const markdown = this.turndown.turndown(mainContent);
            return {
                content: markdown,
                url,
                title,
                links,
                domain,
                publishDate,
            };
        }
        catch (error) {
            console.error(`Error fetching ${url}:`, error);
            return null;
        }
    }
    /**
     * Determine if we should continue researching based on content relevance
     */
    async shouldContinueResearch(originalQuery, currentContent, nextUrl) {
        try {
            const response = await this.aiProvider.getModel().invoke(`You are evaluating whether to continue researching a topic by following a link.

Original search query: "${originalQuery}"

Current information gathered:
${currentContent.substring(0, 1000)}...

Potential next URL to explore: ${nextUrl}

Task: Determine if exploring this link would provide valuable additional information related to the original query.

Response format:
- Return ONLY "yes" if the link should be followed
- Return ONLY "no" if the link is unlikely to provide relevant additional information
- Base your decision on the relevance to the original query and whether more information is needed`);
            const decision = response.content.toString().trim().toLowerCase();
            return decision === "yes";
        }
        catch (error) {
            return false;
        }
    }
    /**
     * Get a source reference number, creating a new one if needed
     */
    getSourceReference(url, results) {
        // If we already have a reference for this URL, return it
        if (this.sourceReferences.has(url)) {
            return this.sourceReferences.get(url);
        }
        // Find the index of the result with this URL
        const index = results.findIndex((result) => result.url === url);
        if (index !== -1) {
            // Use 1-based indexing for references
            const refNumber = index + 1;
            this.sourceReferences.set(url, refNumber);
            return refNumber;
        }
        // If URL not found in results (shouldn't happen), use the size of the map + 1
        const newRef = this.sourceReferences.size + 1;
        this.sourceReferences.set(url, newRef);
        return newRef;
    }
    /**
     * Format sources in markdown with Perplexity-style numbered references
     */
    formatSourcesMarkdown(results) {
        // Reset source references for this research session
        this.sourceReferences.clear();
        // Create source references for all results
        results.forEach((result, index) => {
            this.sourceReferences.set(result.url, index + 1);
        });
        return results
            .map((result, index) => {
            const sourceNumber = index + 1;
            const dateInfo = result.publishDate ? ` (${result.publishDate})` : "";
            const domain = result.domain || "Website";
            // Format as a clickable reference with the number as the link text
            return `[${sourceNumber}] ${result.title} - ${domain}${dateInfo}\n${result.url}\n\n`;
        })
            .join("");
    }
    /**
     * Summarize research findings with Perplexity-style references
     */
    async summarizeResearch(originalQuery, results) {
        if (results.length === 0) {
            return "No relevant information found.";
        }
        // Reset source references for this research session
        this.sourceReferences.clear();
        // Create source references for all results
        results.forEach((result, index) => {
            this.sourceReferences.set(result.url, index + 1);
        });
        // Create content summary for the AI
        const contentSummary = results
            .map((result, index) => `Content from Source ${index + 1} (${result.domain || "Website"}):\n${result.content.substring(0, 2000)}...\n`)
            .join("\n\n");
        try {
            const response = await this.aiProvider.getModel().invoke(`You are a research assistant summarizing information gathered from multiple sources.

Original research query: "${originalQuery}"

Sources:
${results.map((r, i) => `Source ${i + 1}: ${r.title} (${r.domain || "Website"}) - ${r.url}`).join("\n")}

Information gathered:
${contentSummary}

Task: Create a comprehensive, well-structured summary of the research findings that directly addresses the original query.
- Synthesize information from all sources
- Highlight key points and insights
- Organize information logically with clear headings
- Include relevant technical details
- Cite sources using ONLY the format [1], [2], etc. notation (where the number corresponds to the source list)
- Format using markdown for readability
- Include code examples or technical specifications if relevant
- Use proper markdown formatting for any code examples

IMPORTANT: When citing sources or providing links/urls, use ONLY the numbered reference format [1], [2], etc. Do not include URLs or domain names in the citations. The numbers will be clickable links in the final output.

**CRITICAL - ALWAYS USE PROPER LINK FORMATTING FOR MARKDOWN!**

Your summary should be thorough yet concise, focusing on the most relevant information for the query.`);
            // Format the sources section
            const sourcesSection = results
                .map((result, index) => {
                const sourceNumber = index + 1;
                const dateInfo = result.publishDate ? ` (${result.publishDate})` : "";
                const domain = result.domain || "Website";
                return `[${sourceNumber}]: ${result.title} - ${domain}${dateInfo}\n${result.url}`;
            })
                .join("\n\n");
            // Combine AI summary with our formatted sources
            return `${response.content.toString()}\n\n## Sources\n\n${sourcesSection}`;
        }
        catch (error) {
            // Fallback to basic summary if AI summarization fails
            const fallbackSummary = `Research results for "${originalQuery}":\n\n${results
                .map((result, i) => {
                const sourceRef = i + 1;
                return `## Information from Source [${sourceRef}]\n\n${result.content.substring(0, 1000)}...\n\n`;
            })
                .join("\n")}`;
            // Format the sources section
            const sourcesSection = results
                .map((result, index) => {
                const sourceNumber = index + 1;
                const dateInfo = result.publishDate ? ` (${result.publishDate})` : "";
                const domain = result.domain || "Website";
                return `[${sourceNumber}]: ${result.title} - ${domain}${dateInfo}\n${result.url}`;
            })
                .join("\n\n");
            return `${fallbackSummary}\n\n## Sources\n\n${sourcesSection}`;
        }
    }
    /**
     * Perform deep research on a topic
     */
    async deepResearch(query) {
        this.visitedUrls.clear();
        this.sourceReferences.clear();
        const researchResults = [];
        let pagesVisited = 0;
        try {
            // Initial search
            const searchResults = await (0, duck_duck_scrape_1.search)(query, {
                safeSearch: duck_duck_scrape_1.SafeSearchType.STRICT,
            });
            if (!searchResults.results.length) {
                return "No search results found for the query.";
            }
            // Get the best initial URL
            const initialUrl = await this.getBestMatchUrl(query, searchResults);
            const urlsToVisit = [initialUrl];
            // Depth-first research approach
            while (urlsToVisit.length > 0 && pagesVisited < this.MAX_PAGES) {
                const currentUrl = urlsToVisit.shift();
                // Skip if already visited
                if (this.visitedUrls.has(currentUrl)) {
                    continue;
                }
                // Fetch and process the page
                const result = await this.fetchPage(currentUrl);
                if (!result) {
                    continue;
                }
                researchResults.push(result);
                pagesVisited++;
                // Determine if we should explore deeper
                if (pagesVisited < this.MAX_PAGES && result.links.length > 0) {
                    // Get accumulated content so far
                    const accumulatedContent = researchResults
                        .map((r) => r.content)
                        .join("\n\n")
                        .substring(0, 3000);
                    // Evaluate each link to decide if we should follow it
                    for (const link of result.links.slice(0, 3)) {
                        // Limit to top 3 links
                        if (await this.shouldContinueResearch(query, accumulatedContent, link)) {
                            urlsToVisit.unshift(link); // Add to front for depth-first approach
                            break; // Only add one link at a time to control the flow
                        }
                    }
                }
            }
            // Summarize the research findings
            return await this.summarizeResearch(query, researchResults);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error("Error in deep research:", error);
                return `Error performing research: ${error.message}`;
            }
            return "An unknown error occurred during research.";
        }
    }
}
exports.WebCrawler = WebCrawler;
//# sourceMappingURL=web.js.map