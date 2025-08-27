import { DiscoveredContent } from '@/types/index.ts';
import { MockDataLoader } from '@/tests/utils/mock-data-loader.ts';

export interface WebDiscoveryOptions {
  maxResults?: number;
  minRelevanceScore?: number;
  domains?: string[];
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
}

export class WebDiscovery {
  async discover(query: string, options: WebDiscoveryOptions = {}): Promise<DiscoveredContent[]> {
    // Handle empty queries
    if (!query.trim()) {
      return [];
    }

    // In a real implementation, this would call actual web search APIs
    // For now, we'll use our mock data with realistic filtering

    // Load mock web content
    let results = MockDataLoader.loadWebContent();

    // Filter by query relevance (simulate search matching)
    results = this.filterByQuery(results, query);

    // Apply relevance score filter
    if (options.minRelevanceScore !== undefined) {
      results = results.filter(item => item.relevanceScore >= options.minRelevanceScore!);
    }

    // Apply domain filter
    if (options.domains && options.domains.length > 0) {
      results = results.filter(item =>
        options.domains!.some(
          domain =>
            typeof item.metadata.domain === 'string' && item.metadata.domain.includes(domain)
        )
      );
    }

    // Sort by relevance score (highest first)
    results = results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Apply max results limit
    if (options.maxResults !== undefined) {
      results = results.slice(0, options.maxResults);
    }

    return results;
  }

  private filterByQuery(results: DiscoveredContent[], query: string): DiscoveredContent[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    return results
      .filter(item => {
        const searchText = `${item.title} ${item.content} ${item.tags.join(' ')}`.toLowerCase();

        // Check if any query word appears in the content
        return queryWords.some(word => searchText.includes(word));
      })
      .map(item => {
        // Simulate relevance scoring based on query match
        let relevanceBoost = 0;

        // Title matches get higher relevance
        if (item.title.toLowerCase().includes(queryLower)) {
          relevanceBoost += 0.3;
        }

        // Tag matches get medium relevance boost
        const tagMatches = item.tags.filter(tag =>
          queryWords.some(word => tag.toLowerCase().includes(word))
        ).length;
        relevanceBoost += tagMatches * 0.1;

        // Content matches get small boost
        const contentMatches = queryWords.filter(word =>
          item.content.toLowerCase().includes(word)
        ).length;
        relevanceBoost += contentMatches * 0.05;

        return {
          ...item,
          relevanceScore: Math.min(1.0, item.relevanceScore + relevanceBoost),
        };
      });
  }

  async getPopularContent(options: WebDiscoveryOptions = {}): Promise<DiscoveredContent[]> {
    const results = MockDataLoader.loadWebContent();

    // Sort by relevance (simulating popularity)
    const sortedResults = results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    if (options.maxResults !== undefined) {
      return sortedResults.slice(0, options.maxResults);
    }

    return sortedResults;
  }

  async getTrendingContent(
    _timeRange: 'day' | 'week' | 'month' = 'week'
  ): Promise<DiscoveredContent[]> {
    const results = MockDataLoader.loadWebContent();

    // In a real implementation, this would filter by actual time ranges
    // For now, simulate trending by returning high-relevance content
    return results
      .filter(item => item.relevanceScore > 0.7)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}
