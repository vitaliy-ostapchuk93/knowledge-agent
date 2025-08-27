/**
 * Base Content Discovery Interface
 * Core interface for all content discovery implementations
 */

import { ContentItem, ContentResult, SearchOptions } from '@/types';

/**
 * Base interface for content discovery across any source
 */
export interface IContentDiscovery {
  /**
   * Search for content using query and options
   */
  searchContent(options: SearchOptions): Promise<ContentResult>;

  /**
   * Get content from a specific URL
   */
  getContentFromUrl(url: string): Promise<ContentItem | null>;

  /**
   * Get trending content for a topic
   */
  getTrendingContent(topic: string, timeframe?: 'day' | 'week' | 'month'): Promise<ContentItem[]>;

  /**
   * Get related content based on existing content
   */
  getRelatedContent(content: ContentItem): Promise<ContentItem[]>;
}
