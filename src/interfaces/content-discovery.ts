/**
 * Content Discovery Interface
 * Core interface for all content discovery implementations
 */

import { ContentItem, ContentResult, SearchOptions } from '@/types';

/**
 * Interface for content discovery across any source
 */
export interface IContentDiscovery {
  /**
   * Discover content based on search options
   */
  discover(query: string, options?: Partial<SearchOptions>): Promise<ContentResult>;

  /**
   * Get content from a specific URL
   */
  getContentFromUrl?(url: string): Promise<ContentItem | null>;

  /**
   * Get trending content for a topic
   */
  getTrendingContent?(topic: string, timeframe?: 'day' | 'week' | 'month'): Promise<ContentItem[]>;

  /**
   * Get related content based on existing content
   */
  getRelatedContent?(content: ContentItem): Promise<ContentItem[]>;
}
