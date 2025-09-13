/**
 * Multi-Source Content Discovery Interface
 * Coordinates content discovery across multiple sources with aggregation and quality assessment
 */

import { ContentItem, ContentResult, SearchOptions, ContentSource } from '@/types';
import { IContentDiscovery } from '@/interfaces/content-discovery.ts';

/**
 * Configuration for source-specific discovery
 */
export interface SourceConfig {
  /** The content source type */
  source: ContentSource;
  /** Whether this source is enabled for discovery */
  enabled: boolean;
  /** Weight for source reliability (0-1) */
  reliabilityWeight: number;
  /** Maximum results to fetch from this source */
  maxResults: number;
  /** Timeout in milliseconds for this source */
  timeout: number;
}

/**
 * Aggregation strategy for combining results from multiple sources
 */
export type AggregationStrategy =
  | 'weighted_merge' // Merge based on source reliability weights
  | 'round_robin' // Alternate between sources
  | 'quality_first' // Prioritize by content quality scores
  | 'diversity_max'; // Maximize content diversity

/**
 * Result with source attribution and quality metrics
 */
export interface SourcedContentResult extends ContentResult {
  /** Results grouped by source */
  sourceBreakdown: Record<ContentSource, ContentItem[]>;
  /** Quality metrics for the aggregated results */
  qualityMetrics: {
    averageRelevance: number;
    sourceDiversity: number;
    totalSources: number;
  };
  /** Performance metrics */
  performanceMetrics: {
    fastestSource: ContentSource;
    slowestSource: ContentSource;
    failedSources: ContentSource[];
  };
}

/**
 * Multi-source content discovery interface
 */
export interface IMultiSourceDiscovery {
  /**
   * Discover content across multiple configured sources
   */
  discoverFromMultipleSources(
    query: string,
    options?: Partial<SearchOptions>,
    strategy?: AggregationStrategy
  ): Promise<SourcedContentResult>;

  /**
   * Register a content discovery source
   */
  registerSource(source: ContentSource, discovery: IContentDiscovery, config: SourceConfig): void;

  /**
   * Unregister a content discovery source
   */
  unregisterSource(source: ContentSource): void;

  /**
   * Get available sources
   */
  getAvailableSources(): ContentSource[];

  /**
   * Update source configuration
   */
  updateSourceConfig(source: ContentSource, config: Partial<SourceConfig>): void;

  /**
   * Get source configuration
   */
  getSourceConfig(source: ContentSource): SourceConfig | null;
}
