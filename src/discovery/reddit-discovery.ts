import { DiscoveredContent } from '@/types/index.js';
import { MockDataLoader } from '@/tests/utils/mock-data-loader.js';

export interface RedditDiscoveryOptions {
  maxResults?: number;
  minRelevanceScore?: number;
  sortBy?: 'hot' | 'new' | 'top' | 'rising' | 'relevance';
  timeRange?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  subreddits?: string[];
}

export class RedditDiscovery {
  async discover(
    query: string,
    options: RedditDiscoveryOptions = {}
  ): Promise<DiscoveredContent[]> {
    // Handle empty queries
    if (!query.trim()) {
      return [];
    }

    // Load mock Reddit content
    let results = MockDataLoader.loadRedditContent();

    // Filter by query relevance
    results = this.filterByQuery(results, query);

    // Apply relevance score filter
    if (options.minRelevanceScore !== undefined) {
      results = results.filter(item => item.relevanceScore >= options.minRelevanceScore!);
    }

    // Filter by subreddits if specified
    if (options.subreddits && options.subreddits.length > 0) {
      results = results.filter(item => {
        const subreddit = (item.metadata.subreddit as string) || '';
        return options.subreddits!.some(sub => subreddit.toLowerCase().includes(sub.toLowerCase()));
      });
    }

    // Apply sorting
    results = this.sortResults(results, options.sortBy || 'relevance');

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

  private sortResults(results: DiscoveredContent[], sortBy: string): DiscoveredContent[] {
    switch (sortBy) {
      case 'new':
        return results.sort((a, b) => {
          const dateA = new Date(a.metadata.createdAt as string).getTime();
          const dateB = new Date(b.metadata.createdAt as string).getTime();
          return dateB - dateA; // Newest first
        });
      case 'top':
        return results.sort((a, b) => {
          const scoreA = (a.metadata.score as number) || 0;
          const scoreB = (b.metadata.score as number) || 0;
          return scoreB - scoreA; // Highest score first
        });
      case 'hot':
        return results.sort((a, b) => {
          // Simulate "hot" algorithm with score and recency
          const scoreA =
            ((a.metadata.score as number) || 0) *
            this.getRecencyMultiplier(a.metadata.createdAt as string);
          const scoreB =
            ((b.metadata.score as number) || 0) *
            this.getRecencyMultiplier(b.metadata.createdAt as string);
          return scoreB - scoreA;
        });
      case 'rising':
        return results.sort((a, b) => {
          // Simulate "rising" with comment activity
          const activityA =
            ((a.metadata.commentCount as number) || 0) /
            Math.max(1, this.getHoursSinceCreation(a.metadata.createdAt as string));
          const activityB =
            ((b.metadata.commentCount as number) || 0) /
            Math.max(1, this.getHoursSinceCreation(b.metadata.createdAt as string));
          return activityB - activityA;
        });
      case 'relevance':
      default:
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }

  private getRecencyMultiplier(createdAt: string): number {
    const hours = this.getHoursSinceCreation(createdAt);
    return Math.max(0.1, 1 / (1 + hours / 24)); // Decay over time
  }

  private getHoursSinceCreation(createdAt: string): number {
    const now = new Date().getTime();
    const created = new Date(createdAt).getTime();
    return (now - created) / (1000 * 60 * 60); // Convert to hours
  }

  async getHotPosts(
    subreddit?: string,
    options: RedditDiscoveryOptions = {}
  ): Promise<DiscoveredContent[]> {
    let results = MockDataLoader.loadRedditContent();

    // Filter by subreddit if specified
    if (subreddit) {
      results = results.filter(item => {
        const itemSubreddit = (item.metadata.subreddit as string) || '';
        return itemSubreddit.toLowerCase().includes(subreddit.toLowerCase());
      });
    }

    // Sort by hot algorithm
    const hotResults = this.sortResults(results, 'hot');

    if (options.maxResults !== undefined) {
      return hotResults.slice(0, options.maxResults);
    }

    return hotResults;
  }

  async getTopPosts(
    _timeRange: 'day' | 'week' | 'month' | 'year' | 'all' = 'day',
    options: RedditDiscoveryOptions = {}
  ): Promise<DiscoveredContent[]> {
    const results = MockDataLoader.loadRedditContent();

    // In a real implementation, this would filter by actual time ranges
    // For now, simulate by returning high-score content
    const topResults = results
      .filter(item => ((item.metadata.score as number) || 0) > 50)
      .sort((a, b) => ((b.metadata.score as number) || 0) - ((a.metadata.score as number) || 0));

    if (options.maxResults !== undefined) {
      return topResults.slice(0, options.maxResults);
    }

    return topResults;
  }

  async getSubredditPosts(
    subreddit: string,
    options: RedditDiscoveryOptions = {}
  ): Promise<DiscoveredContent[]> {
    const results = MockDataLoader.loadRedditContent();

    // Filter by subreddit
    const subredditResults = results.filter(item => {
      const itemSubreddit = (item.metadata.subreddit as string) || '';
      return itemSubreddit.toLowerCase().includes(subreddit.toLowerCase());
    });

    // Apply sorting
    const sortedResults = this.sortResults(subredditResults, options.sortBy || 'hot');

    if (options.maxResults !== undefined) {
      return sortedResults.slice(0, options.maxResults);
    }

    return sortedResults;
  }
}
