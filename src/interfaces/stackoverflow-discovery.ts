/**
 * Stack Overflow Discovery Interface
 * Stack Overflow-specific discovery operations and search capabilities
 */

import { ContentItem, ContentResult } from '@/types';
import { IContentDiscovery } from '@/interfaces/content-discovery.ts';

/**
 * Stack Overflow-specific content discovery interface
 */
export interface IStackOverflowDiscovery extends IContentDiscovery {
  /**
   * Search Stack Overflow questions and answers
   */
  searchQuestions(query: string, options?: StackOverflowSearchOptions): Promise<ContentResult>;

  /**
   * Get question details with accepted answers
   */
  getQuestionDetails(questionId: number): Promise<ContentItem>;

  /**
   * Search by tags
   */
  searchByTags(tags: string[], options?: StackOverflowSearchOptions): Promise<ContentResult>;

  /**
   * Get user's top answers
   */
  getUserAnswers(userId: number, options?: StackOverflowUserOptions): Promise<ContentItem[]>;

  /**
   * Get related questions
   */
  getRelatedQuestions(questionId: number): Promise<ContentItem[]>;
}

/**
 * Stack Overflow search options
 */
export interface StackOverflowSearchOptions {
  tags?: string[];
  sort?: 'activity' | 'votes' | 'creation' | 'relevance';
  order?: 'asc' | 'desc';
  accepted?: boolean;
  answers?: number;
  minScore?: number;
  site?: string;
  limit?: number;
}

/**
 * Stack Overflow user-specific options
 */
export interface StackOverflowUserOptions {
  sort?: 'activity' | 'votes' | 'creation';
  order?: 'asc' | 'desc';
  min?: number;
  max?: number;
}
