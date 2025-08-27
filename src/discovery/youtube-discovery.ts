import { DiscoveredContent } from '@/types/index.ts';
import { MockDataLoader } from '@/tests/utils/mock-data-loader.ts';

export interface YouTubeDiscoveryOptions {
  maxResults?: number;
  minRelevanceScore?: number;
  videoLength?: 'short' | 'medium' | 'long' | 'any';
  uploadDate?: 'hour' | 'today' | 'week' | 'month' | 'year' | 'any';
  sortBy?: 'relevance' | 'upload_date' | 'view_count' | 'rating';
}

export class YouTubeDiscovery {
  async discover(
    query: string,
    options: YouTubeDiscoveryOptions = {}
  ): Promise<DiscoveredContent[]> {
    // Handle empty queries
    if (!query.trim()) {
      return [];
    }

    // Load mock YouTube content
    let results = MockDataLoader.loadYouTubeContent();

    // Filter by query relevance
    results = this.filterByQuery(results, query);

    // Apply relevance score filter
    if (options.minRelevanceScore !== undefined) {
      results = results.filter(item => item.relevanceScore >= options.minRelevanceScore!);
    }

    // Apply video length filter
    if (options.videoLength && options.videoLength !== 'any') {
      results = this.filterByVideoLength(results, options.videoLength);
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

  private filterByVideoLength(
    results: DiscoveredContent[],
    length: 'short' | 'medium' | 'long'
  ): DiscoveredContent[] {
    return results.filter(item => {
      const duration = (item.metadata.duration as number) || 0;

      switch (length) {
        case 'short':
          return duration < 240; // Less than 4 minutes
        case 'medium':
          return duration >= 240 && duration < 1200; // 4-20 minutes
        case 'long':
          return duration >= 1200; // More than 20 minutes
        default:
          return true;
      }
    });
  }

  private sortResults(results: DiscoveredContent[], sortBy: string): DiscoveredContent[] {
    switch (sortBy) {
      case 'upload_date':
        return results.sort((a, b) => {
          const dateA = new Date(a.metadata.uploadDate as string).getTime();
          const dateB = new Date(b.metadata.uploadDate as string).getTime();
          return dateB - dateA; // Newest first
        });
      case 'view_count':
        return results.sort((a, b) => {
          const viewsA = (a.metadata.viewCount as number) || 0;
          const viewsB = (b.metadata.viewCount as number) || 0;
          return viewsB - viewsA; // Most views first
        });
      case 'rating':
        return results.sort((a, b) => {
          const ratingA = (a.metadata.likeCount as number) || 0;
          const ratingB = (b.metadata.likeCount as number) || 0;
          return ratingB - ratingA; // Most likes first
        });
      case 'relevance':
      default:
        return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }
  }

  async getTrendingVideos(options: YouTubeDiscoveryOptions = {}): Promise<DiscoveredContent[]> {
    const results = MockDataLoader.loadYouTubeContent();

    // Sort by view count to simulate trending
    const trendingResults = results.sort((a, b) => {
      const viewsA = (a.metadata.viewCount as number) || 0;
      const viewsB = (b.metadata.viewCount as number) || 0;
      return viewsB - viewsA;
    });

    if (options.maxResults !== undefined) {
      return trendingResults.slice(0, options.maxResults);
    }

    return trendingResults;
  }

  async getChannelVideos(
    channelId: string,
    options: YouTubeDiscoveryOptions = {}
  ): Promise<DiscoveredContent[]> {
    const results = MockDataLoader.loadYouTubeContent();

    // Filter by channel (simulate channel matching)
    const channelResults = results.filter(item =>
      ((item.metadata.channel as string) || '').toLowerCase().includes(channelId.toLowerCase())
    );

    // Sort by upload date (newest first)
    const sortedResults = channelResults.sort((a, b) => {
      const dateA = new Date(a.metadata.uploadDate as string).getTime();
      const dateB = new Date(b.metadata.uploadDate as string).getTime();
      return dateB - dateA;
    });

    if (options.maxResults !== undefined) {
      return sortedResults.slice(0, options.maxResults);
    }

    return sortedResults;
  }
}
