/**
 * Search and Discovery Types
 * Types related to content discovery and search operations
 */

import { ContentItem, ContentSource } from '@/types/content.ts';

export interface SearchOptions {
  query: string;
  sources?: ContentSource[];
  maxResults?: number;
  dateRange?: DateRange;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  includeCode?: boolean;
  language?: string;
  summaryStrategy?: SummaryStrategy;
}

export interface DiscoveryOptions {
  sources?: ContentSource[];
  maxResults?: number;
  minRelevanceScore?: number;
  strategy?: 'comprehensive' | 'fast' | 'deep';
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface ContentResult {
  items: ContentItem[];
  totalFound: number;
  searchTime: number;
  sources: ContentSource[];
}

export enum SummaryStrategy {
  CONCISE = 'concise',
  DETAILED = 'detailed',
  CODE_FOCUSED = 'code_focused',
  ACADEMIC = 'academic',
  BEGINNER_FRIENDLY = 'beginner_friendly',
}
