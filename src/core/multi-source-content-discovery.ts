/**
 * Multi-Source Content Discovery Implementation
 *
 * Core business logic for coordinating discovery across multiple sources with quality assessment and aggregation.
 * This domain service orchestrates knowledge discovery from various content sources using configurable strategies.
 */

import {
  ContentItem,
  ContentResult,
  SearchOptions,
  ContentSource,
  DiscoveredContent,
  ContentType,
} from '@/types';
import {
  IMultiSourceDiscovery,
  SourceConfig,
  AggregationStrategy,
  SourcedContentResult,
} from '@/interfaces/multi-source-discovery.ts';
import { IContentDiscovery } from '@/interfaces/content-discovery.ts';
import { ContentRelevanceScorer } from '@/core/content-relevance-scorer.ts';
import { logger } from '@/utils/logger.ts';

/**
 * Multi-source content discovery coordinator
 */
export class MultiSourceContentDiscovery implements IMultiSourceDiscovery {
  private sources: Map<ContentSource, { discovery: IContentDiscovery; config: SourceConfig }> =
    new Map();
  private relevanceScorer: ContentRelevanceScorer;

  constructor() {
    this.relevanceScorer = new ContentRelevanceScorer();
  }

  /**
   * Discover content across multiple configured sources
   */
  async discoverFromMultipleSources(
    query: string,
    options: Partial<SearchOptions> = {},
    strategy: AggregationStrategy = 'weighted_merge'
  ): Promise<SourcedContentResult> {
    const startTime = Date.now();
    logger.debug(`🔍 Multi-source discovery for: "${query}" using ${strategy} strategy`);

    // Get enabled sources
    const enabledSources = Array.from(this.sources.entries()).filter(
      ([_, { config }]) => config.enabled
    );

    if (enabledSources.length === 0) {
      throw new Error('No enabled sources available for discovery');
    }

    // Parallel discovery from all sources
    const discoveryPromises = enabledSources.map(async ([source, { discovery, config }]) => {
      try {
        const sourceStartTime = Date.now();

        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout for source ${source}`)), config.timeout);
        });

        // Race between discovery and timeout
        const result = await Promise.race([
          discovery.discover(query, {
            ...options,
            maxResults: Math.min(config.maxResults, options.maxResults || 10),
          }),
          timeoutPromise,
        ]);

        const sourceTime = Date.now() - sourceStartTime;
        logger.debug(`✅ ${source} completed in ${sourceTime}ms with ${result.items.length} items`);

        return {
          source,
          result,
          timing: sourceTime,
          success: true,
        };
      } catch (error) {
        logger.warn(`❌ ${source} failed:`, error);
        return {
          source,
          result: { items: [], totalFound: 0, searchTime: 0, sources: [] },
          timing: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const sourceResults = await Promise.all(discoveryPromises);

    // Separate successful and failed results
    const successfulResults = sourceResults.filter(r => r.success);

    // Aggregate results using chosen strategy
    const aggregatedItems = await this.aggregateResults(successfulResults, query, strategy);

    // Build source breakdown
    const sourceBreakdown: Record<ContentSource, ContentItem[]> = {} as Record<
      ContentSource,
      ContentItem[]
    >;
    successfulResults.forEach(({ source, result }) => {
      sourceBreakdown[source] = result.items;
    });

    // Calculate quality metrics
    const qualityMetrics = this.calculateQualityMetrics(aggregatedItems, sourceBreakdown);

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(sourceResults);

    const totalTime = Date.now() - startTime;
    logger.info(
      `🎯 Multi-source discovery completed: ${aggregatedItems.length} items from ${successfulResults.length} sources in ${totalTime}ms`
    );

    return {
      items: aggregatedItems,
      totalFound: aggregatedItems.length,
      searchTime: totalTime,
      sources: successfulResults.map(r => r.source),
      sourceBreakdown,
      qualityMetrics,
      performanceMetrics,
    };
  }

  /**
   * Register a content discovery source
   */
  registerSource(source: ContentSource, discovery: IContentDiscovery, config: SourceConfig): void {
    logger.debug(`📝 Registering source: ${source}`);
    this.sources.set(source, { discovery, config });
  }

  /**
   * Unregister a content discovery source
   */
  unregisterSource(source: ContentSource): void {
    logger.debug(`🗑️ Unregistering source: ${source}`);
    this.sources.delete(source);
  }

  /**
   * Get available sources
   */
  getAvailableSources(): ContentSource[] {
    return Array.from(this.sources.keys());
  }

  /**
   * Update source configuration
   */
  updateSourceConfig(source: ContentSource, config: Partial<SourceConfig>): void {
    const existing = this.sources.get(source);
    if (existing) {
      existing.config = { ...existing.config, ...config };
      logger.debug(`⚙️ Updated config for source: ${source}`);
    }
  }

  /**
   * Get source configuration
   */
  getSourceConfig(source: ContentSource): SourceConfig | null {
    const sourceData = this.sources.get(source);
    return sourceData ? sourceData.config : null;
  }

  /**
   * Aggregate results from multiple sources using specified strategy
   */
  private async aggregateResults(
    sourceResults: Array<{
      source: ContentSource;
      result: ContentResult;
      timing: number;
      success: boolean;
    }>,
    query: string,
    strategy: AggregationStrategy
  ): Promise<ContentItem[]> {
    // Collect all items with source attribution and convert to DiscoveredContent for scoring
    interface ItemWithWeight extends ContentItem {
      sourceWeight: number;
    }

    const allItems: ItemWithWeight[] = [];

    for (const { source, result } of sourceResults) {
      const sourceConfig = this.sources.get(source)?.config;
      const weight = sourceConfig?.reliabilityWeight || 0.5;

      for (const item of result.items) {
        allItems.push({
          ...item,
          sourceWeight: weight,
        });
      }
    }

    // Remove duplicates based on URL or content similarity
    const uniqueItems = this.removeDuplicates(allItems);

    // Apply aggregation strategy
    switch (strategy) {
      case 'weighted_merge':
        return this.weightedMerge(uniqueItems, query);
      case 'round_robin':
        return this.roundRobinMerge(uniqueItems);
      case 'quality_first':
        return this.qualityFirstMerge(uniqueItems, query);
      case 'diversity_max':
        return this.diversityMaxMerge(uniqueItems);
      default:
        return this.weightedMerge(uniqueItems, query);
    }
  }

  /**
   * Weighted merge based on source reliability and relevance
   */
  private async weightedMerge(
    items: Array<ContentItem & { sourceWeight: number }>,
    query: string
  ): Promise<ContentItem[]> {
    // Calculate combined scores
    for (const item of items) {
      const discoveredContent = this.convertToDiscoveredContent(item);
      const relevanceScore = await this.relevanceScorer.calculateRelevance(
        discoveredContent,
        query
      );
      item.relevanceScore = relevanceScore * 0.7 + item.sourceWeight * 0.3;
    }

    return items
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(({ sourceWeight: _sourceWeight, ...item }) => item); // Remove sourceWeight from final result
  }

  /**
   * Quality-first merge prioritizing content quality metrics
   */
  private async qualityFirstMerge(
    items: Array<ContentItem & { sourceWeight: number }>,
    query: string
  ): Promise<ContentItem[]> {
    // Score items by quality factors
    for (const item of items) {
      const discoveredContent = this.convertToDiscoveredContent(item);
      const relevanceScore = await this.relevanceScorer.calculateRelevance(
        discoveredContent,
        query
      );
      const qualityScore = this.calculateQualityScore(item);
      item.relevanceScore = relevanceScore * 0.4 + qualityScore * 0.4 + item.sourceWeight * 0.2;
    }

    return items
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(({ sourceWeight: _sourceWeight, ...item }) => item);
  }

  /**
   * Round-robin merge to ensure source diversity
   */
  private roundRobinMerge(
    items: Array<ContentItem & { sourceWeight: number }>
  ): Promise<ContentItem[]> {
    const result: ContentItem[] = [];
    const sourceItems: Map<
      ContentSource,
      Array<ContentItem & { sourceWeight: number }>
    > = new Map();

    // Group items by source
    for (const item of items) {
      const source = item.source;
      if (!sourceItems.has(source)) {
        sourceItems.set(source, []);
      }
      sourceItems.get(source)!.push(item);
    }

    // Round-robin selection
    const maxItems = Math.max(...Array.from(sourceItems.values()).map(arr => arr.length));
    for (let i = 0; i < maxItems; i++) {
      for (const sourceItemList of sourceItems.values()) {
        if (i < sourceItemList.length) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { sourceWeight, ...item } = sourceItemList[i];
          result.push(item);
        }
      }
    }

    return Promise.resolve(result);
  }

  /**
   * Diversity-maximizing merge to get varied content types
   */
  private diversityMaxMerge(
    items: Array<ContentItem & { sourceWeight: number }>
  ): Promise<ContentItem[]> {
    const result: ContentItem[] = [];
    const seenSources = new Set<ContentSource>();
    const seenContentTypes = new Set<string>();

    // Sort by relevance first
    const sortedItems = items.sort((a, b) => b.relevanceScore - a.relevanceScore);

    for (const item of sortedItems) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sourceWeight, ...cleanItem } = item;

      // Prioritize items from new sources or content types
      const isNewSource = !seenSources.has(item.source);
      const isNewContentType = !seenContentTypes.has(item.metadata.contentType || 'unknown');

      if (isNewSource || isNewContentType || result.length < 5) {
        result.push(cleanItem);
        seenSources.add(item.source);
        seenContentTypes.add(item.metadata.contentType || 'unknown');
      }
    }

    return Promise.resolve(result);
  } /**
   * Remove duplicate items based on URL and content similarity
   */
  private removeDuplicates(
    items: Array<ContentItem & { sourceWeight: number }>
  ): Array<ContentItem & { sourceWeight: number }> {
    const seen = new Set<string>();
    const result: Array<ContentItem & { sourceWeight: number }> = [];

    for (const item of items) {
      const key = item.url || `${item.title}-${item.source}`;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }

    return result;
  }

  /**
   * Calculate quality score based on content metrics
   */
  private calculateQualityScore(item: ContentItem): number {
    let score = 0;

    // Word count factor (optimal range: 200-1000 words)
    const wordCount = item.metadata.wordCount || 0;
    if (wordCount >= 200 && wordCount <= 1000) {
      score += 0.3;
    } else if (wordCount > 100) {
      score += 0.1;
    }

    // Author presence
    if (item.metadata.author && item.metadata.author !== 'Unknown') {
      score += 0.2;
    }

    // Recent content
    if (item.metadata.publishDate) {
      const ageInDays = (Date.now() - item.metadata.publishDate.getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays < 30) {
        score += 0.2;
      } else if (ageInDays < 365) {
        score += 0.1;
      }
    }

    // Tags richness
    if (item.metadata.tags && item.metadata.tags.length > 2) {
      score += 0.2;
    }

    // Content type preference (documentation and tutorials score higher)
    const contentType = item.metadata.contentType;
    if (contentType === ContentType.DOCUMENTATION || contentType === ContentType.TUTORIAL) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate quality metrics for aggregated results
   */
  private calculateQualityMetrics(
    items: ContentItem[],
    sourceBreakdown: Record<ContentSource, ContentItem[]>
  ): { averageRelevance: number; sourceDiversity: number; totalSources: number } {
    const averageRelevance =
      items.reduce((sum, item) => sum + (item.relevanceScore || 0), 0) / items.length || 0;
    const totalSources = Object.keys(sourceBreakdown).length;
    const sourceDiversity = totalSources / Math.max(this.sources.size, 1);

    return {
      averageRelevance,
      sourceDiversity,
      totalSources,
    };
  }

  /**
   * Calculate performance metrics for source results
   */
  private calculatePerformanceMetrics(
    sourceResults: Array<{
      source: ContentSource;
      timing: number;
      success: boolean;
      error?: string;
    }>
  ): {
    fastestSource: ContentSource;
    slowestSource: ContentSource;
    failedSources: ContentSource[];
  } {
    const successfulResults = sourceResults.filter(r => r.success);
    const failedSources = sourceResults.filter(r => !r.success).map(r => r.source);

    if (successfulResults.length === 0) {
      return {
        fastestSource: ContentSource.WEB,
        slowestSource: ContentSource.WEB,
        failedSources,
      };
    }

    const sortedByTime = successfulResults.sort((a, b) => a.timing - b.timing);

    return {
      fastestSource: sortedByTime[0].source,
      slowestSource: sortedByTime[sortedByTime.length - 1].source,
      failedSources,
    };
  }

  /**
   * Convert ContentItem to DiscoveredContent for relevance scoring
   */
  private convertToDiscoveredContent(item: ContentItem): DiscoveredContent {
    return {
      id: item.id,
      title: item.title,
      content: item.content,
      source: item.source,
      url: item.url,
      metadata: {
        author: item.metadata.author,
        publishDate: item.metadata.publishDate,
        contentType: item.metadata.contentType,
        wordCount: item.metadata.wordCount,
        language: item.metadata.language,
        difficulty: item.metadata.difficulty,
      },
      relevanceScore: item.relevanceScore,
      tags: item.metadata.tags || [],
    };
  }
}
