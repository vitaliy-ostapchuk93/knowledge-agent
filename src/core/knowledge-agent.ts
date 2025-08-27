/**
 * Core Knowledge Agent implementation
 * MVP implementation of the Hybrid Local-First approach
 */

import {
  IKnowledgeAgent,
  IPlatformAdapter,
  IProcessingStrategy,
  ICacheManager,
  IEventBus,
  IContentDiscovery,
} from '@/interfaces/index.ts';
import {
  ContentItem,
  ContentResult,
  SearchOptions,
  Summary,
  SummaryStrategy,
  PlatformType,
  ProcessingStrategy,
  Event,
  ContentSource,
  ContentType,
} from '@/types/index.ts';
import { logger } from '@/utils/logger.ts';

export interface IKnowledgeAgentConfig {
  watchDirectories: string[];
  outputDirectory: string;
  cacheEnabled: boolean;
  aiProvider: {
    type: 'openai' | 'local';
    apiKey?: string;
    model?: string;
  };
  discovery: {
    maxResults: number;
    sources: string[];
  };
}

export class KnowledgeAgent implements IKnowledgeAgent {
  private platformAdapters: Map<PlatformType, IPlatformAdapter> = new Map();
  private processingStrategies: Map<ProcessingStrategy, IProcessingStrategy> = new Map();
  private cacheManager?: ICacheManager;
  private eventBus?: IEventBus;
  private config: IKnowledgeAgentConfig;
  private initialized = false;
  private contentDiscovery?: IContentDiscovery; // Mock content discovery

  constructor(config: IKnowledgeAgentConfig) {
    this.config = config;
  }

  /**
   * Initialize the Knowledge Agent with dependencies
   */
  async initialize(
    platformAdapters: IPlatformAdapter[],
    processingStrategies: IProcessingStrategy[],
    cacheManager?: ICacheManager,
    eventBus?: IEventBus,
    contentDiscovery?: IContentDiscovery
  ): Promise<void> {
    try {
      // Register platform adapters
      for (const adapter of platformAdapters) {
        this.platformAdapters.set(adapter.platformType, adapter);

        // Verify adapter health
        const isHealthy = await adapter.healthCheck();
        if (!isHealthy) {
          logger.warn(`Platform adapter ${adapter.platformType} failed health check`);
        }
      }

      // Register processing strategies
      for (const strategy of processingStrategies) {
        this.processingStrategies.set(strategy.strategyType, strategy);

        // Check strategy availability
        const isAvailable = await strategy.isAvailable();
        if (!isAvailable) {
          logger.warn(`Processing strategy ${strategy.strategyType} is not available`);
        }
      }

      this.cacheManager = cacheManager;
      this.eventBus = eventBus;
      this.contentDiscovery = contentDiscovery;

      this.initialized = true;
      this.publishEvent({
        type: 'agent.initialized',
        timestamp: new Date(),
        source: 'KnowledgeAgent',
        data: {
          adapters: platformAdapters.length,
          strategies: processingStrategies.length,
          cacheEnabled: !!cacheManager,
        },
      });

      logger.debug('✅ Knowledge Agent initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Knowledge Agent:', error);
      throw error;
    }
  }

  /**
   * Main entry point for content discovery
   */
  async discoverContent(
    query: string,
    options: Partial<SearchOptions> = {}
  ): Promise<ContentResult> {
    this.ensureInitialized();

    const startTime = Date.now();
    const searchOptions: SearchOptions = {
      query,
      maxResults: options.maxResults || 10,
      sources: options.sources,
      dateRange: options.dateRange,
      difficulty: options.difficulty,
      includeCode: options.includeCode,
      language: options.language || 'en',
    };

    const cacheKey = `discovery:${query}:${JSON.stringify(searchOptions)}`;

    try {
      // Check cache first
      if (this.cacheManager) {
        const cached = await this.cacheManager.get<ContentResult>(cacheKey);
        if (cached) {
          logger.debug(`📦 Cache hit for query: ${query}`);
          return cached;
        }
      }

      this.publishEvent({
        type: 'discovery.started',
        timestamp: new Date(),
        source: 'KnowledgeAgent',
        data: { query, options: searchOptions },
      });

      // Content discovery for MVP
      let mockContent: ContentItem[] = [];
      let discoverySearchTime = 0;

      if (this.contentDiscovery) {
        // Use injected mock content discovery
        const result = await this.contentDiscovery.discover(query, {
          maxResults: options?.maxResults,
          sources: options?.sources,
          difficulty: options?.difficulty,
          includeCode: options?.includeCode,
          language: options?.language,
        });
        mockContent = result.items;
        discoverySearchTime = result.searchTime;
      } else {
        // Fallback to inline mock data
        mockContent = [
          {
            id: `content-${Date.now()}-1`,
            title: `Understanding ${query} - Complete Guide`,
            url: `https://example.com/guide-${query.toLowerCase().replace(/\s+/g, '-')}`,
            content: `This is a comprehensive guide about ${query}. It covers the fundamental concepts, best practices, and common pitfalls to avoid.`,
            source: ContentSource.DOCUMENTATION,
            metadata: {
              author: 'Tech Expert',
              publishDate: new Date(),
              tags: [query.toLowerCase(), 'guide', 'tutorial'],
              contentType: ContentType.ARTICLE,
              wordCount: 2500,
              language: 'en',
              difficulty: 'intermediate',
            },
            relevanceScore: 0.95,
            timestamp: new Date(),
          },
        ];
        discoverySearchTime = Date.now() - startTime;
      }

      const totalSearchTime = Math.max(Date.now() - startTime, discoverySearchTime);

      const result: ContentResult = {
        items: mockContent,
        totalFound: mockContent.length,
        searchTime: totalSearchTime,
        sources: [ContentSource.DOCUMENTATION, ContentSource.TECH_BLOG],
      };

      // Cache the result
      if (this.cacheManager) {
        await this.cacheManager.set(cacheKey, result, 3600); // Cache for 1 hour
      }

      this.publishEvent({
        type: 'discovery.completed',
        timestamp: new Date(),
        source: 'KnowledgeAgent',
        data: {
          query,
          resultsCount: result.totalFound,
          searchTime: result.searchTime,
        },
      });

      logger.debug(
        `🔍 Discovered ${result.totalFound} items for "${query}" in ${result.searchTime}ms`
      );
      return result;
    } catch (error) {
      this.publishEvent({
        type: 'discovery.failed',
        timestamp: new Date(),
        source: 'KnowledgeAgent',
        data: { query, error: (error as Error).message },
      });

      logger.error(`❌ Content discovery failed for "${query}":`, error);
      throw error;
    }
  }

  /**
   * Summarize discovered content using specified strategy
   */
  async summarizeContent(
    content: ContentItem[],
    strategy: SummaryStrategy = SummaryStrategy.DETAILED
  ): Promise<Summary> {
    this.ensureInitialized();

    // Try to find an available processing strategy in order of preference
    const preferredStrategies = [
      ProcessingStrategy.LOCAL,
      ProcessingStrategy.CLOUD,
      ProcessingStrategy.HYBRID,
    ];
    let processingStrategy = null;

    for (const strategyType of preferredStrategies) {
      processingStrategy = this.processingStrategies.get(strategyType);
      if (processingStrategy) {
        break;
      }
    }

    if (!processingStrategy) {
      throw new Error(`No processing strategy available`);
    }

    const combinedContent = content
      .map(item => `# ${item.title}\n\n${item.content}`)
      .join('\n\n---\n\n');

    try {
      this.publishEvent({
        type: 'summarization.started',
        timestamp: new Date(),
        source: 'KnowledgeAgent',
        data: { strategy, contentCount: content.length },
      });

      const summary = await processingStrategy.summarize(combinedContent, {
        strategy: ProcessingStrategy.CLOUD,
        maxTokens: 1000,
        useCache: true,
      });

      this.publishEvent({
        type: 'summarization.completed',
        timestamp: new Date(),
        source: 'KnowledgeAgent',
        data: { strategy, summaryLength: summary.summary.length },
      });

      logger.debug(
        `📝 Generated ${strategy.toLowerCase()} summary (${summary.summary.length} chars)`
      );
      return summary;
    } catch (error) {
      this.publishEvent({
        type: 'summarization.failed',
        timestamp: new Date(),
        source: 'KnowledgeAgent',
        data: { strategy, error: (error as Error).message },
      });

      logger.error(`❌ Summarization failed with ${strategy} strategy:`, error);
      throw error;
    }
  }

  /**
   * Integrate knowledge into target platform
   */
  async integrateKnowledge(summary: Summary, targetPlatform: PlatformType): Promise<void> {
    this.ensureInitialized();

    const adapter = this.platformAdapters.get(targetPlatform);
    if (!adapter) {
      throw new Error(`Platform adapter for ${targetPlatform} not available`);
    }

    try {
      this.publishEvent({
        type: 'integration.started',
        timestamp: new Date(),
        source: 'KnowledgeAgent',
        data: { targetPlatform, summaryId: summary.id },
      });

      const contentId = await adapter.createContent({
        title: `Summary: ${summary.originalContent[0]?.title || 'Knowledge Summary'}`,
        content: summary.summary,
        format: targetPlatform,
        metadata: {
          tags: summary.tags,
          difficulty: summary.difficulty,
          generatedAt: summary.generatedAt,
        },
        links: summary.links.map(link => link.url),
        tags: summary.tags,
      });

      // Link to related content if available
      if (summary.links && summary.links.length > 0) {
        for (const link of summary.links) {
          // In a real implementation, we would resolve the link to an internal ID
          // For now, we'll skip the actual linking
          logger.debug(`Would link to: ${link.title} (${link.url})`);
        }
      }

      this.publishEvent({
        type: 'integration.completed',
        timestamp: new Date(),
        source: 'KnowledgeAgent',
        data: { targetPlatform, contentId, summaryId: summary.id },
      });

      logger.debug(`✅ Integrated summary into ${targetPlatform} with ID: ${contentId}`);
    } catch (error) {
      this.publishEvent({
        type: 'integration.failed',
        timestamp: new Date(),
        source: 'KnowledgeAgent',
        data: { targetPlatform, error: (error as Error).message },
      });

      logger.error(`❌ Integration failed for ${targetPlatform}:`, error);
      throw error;
    }
  }

  /**
   * Complete workflow: discover, summarize, and integrate
   */
  async processQuery(
    query: string,
    targetPlatform: PlatformType,
    options: Partial<SearchOptions> = {}
  ): Promise<Summary> {
    this.ensureInitialized();

    logger.debug(`🚀 Processing query: "${query}" for ${targetPlatform}`);

    try {
      // Step 1: Discover content
      const discoveryResult = await this.discoverContent(query, options);

      // Step 2: Summarize content
      const summaryStrategy = options.summaryStrategy || SummaryStrategy.DETAILED;
      const summary = await this.summarizeContent(discoveryResult.items, summaryStrategy);

      // Step 3: Integrate into platform
      await this.integrateKnowledge(summary, targetPlatform);

      logger.debug(`✅ Complete workflow finished for "${query}"`);
      return summary;
    } catch (error) {
      logger.error(`❌ Workflow failed for "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get available platform adapters
   */
  getAvailablePlatforms(): PlatformType[] {
    return Array.from(this.platformAdapters.keys());
  }

  /**
   * Get available processing strategies
   */
  getAvailableStrategies(): ProcessingStrategy[] {
    return Array.from(this.processingStrategies.keys());
  }

  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Knowledge Agent not initialized. Call initialize() first.');
    }
  }

  private publishEvent(event: Event): void {
    if (this.eventBus) {
      this.eventBus.publish(event);
    }
  }
}
