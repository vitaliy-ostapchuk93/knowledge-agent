/**
 * Processing Strategy Interface
 * Defines AI/content processing strategies for summarization and analysis
 */

import { Summary, Analysis, ProcessingOptions, ProcessingStrategy } from '@/types';

export interface IProcessingStrategy {
  /**
   * Strategy identification
   */
  readonly strategyType: ProcessingStrategy;

  /**
   * Summarize content using this strategy
   */
  summarize(content: string, options?: ProcessingOptions): Promise<Summary>;

  /**
   * Analyze content characteristics
   */
  analyze(content: string): Promise<Analysis>;

  /**
   * Extract key information
   */
  extractKeyPoints(content: string): Promise<string[]>;

  /**
   * Generate actionable items
   */
  generateActionableItems(content: string): Promise<string[]>;

  /**
   * Check if strategy is available (e.g., local models, API keys)
   */
  isAvailable(): Promise<boolean>;
}
