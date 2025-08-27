/**
 * Content Summarization Interface
 * Handles processing and summarizing discovered content
 */

import { ContentItem, Summary, SummaryStrategy } from '@/types';

/**
 * Interface for summarizing content using various strategies
 */
export interface IContentSummarizer {
  /**
   * Generate summary from content items using specified strategy
   */
  summarize(content: ContentItem[], strategy?: SummaryStrategy): Promise<Summary>;

  /**
   * Get available summarization strategies
   */
  getAvailableStrategies(): SummaryStrategy[];
}
