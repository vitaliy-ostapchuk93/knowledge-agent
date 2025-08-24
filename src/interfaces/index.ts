/**
 * Core interfaces implementing the design patterns from the solution strategy
 * These interfaces support the key quality goals: Portability, Performance, Privacy, Usability, Scalability, Extensibility
 */

import {
  ContentItem,
  ContentResult,
  SearchOptions,
  Summary,
  SummaryStrategy,
  FormattedContent,
  ExistingContent,
  PlatformType,
  ProcessingOptions,
  Analysis,
  Event,
  PluginContext,
  PluginInput,
  PluginOutput,
  ProcessingStrategy,
  RelatedLink,
} from '../types';

// Facade Pattern - Simplifying Complex Operations (Usability Goal)
export interface IKnowledgeAgent {
  /**
   * Main entry point for content discovery
   * Implements the facade pattern to provide a simple interface to complex operations
   */
  discoverContent(query: string, options?: SearchOptions): Promise<ContentResult>;

  /**
   * Summarize discovered content using specified strategy
   */
  summarizeContent(content: ContentItem[], strategy?: SummaryStrategy): Promise<Summary>;

  /**
   * Integrate knowledge into target platform
   */
  integrateKnowledge(summary: Summary, targetPlatform: PlatformType): Promise<void>;

  /**
   * Complete workflow: discover, summarize, and integrate
   */
  processQuery(
    query: string,
    targetPlatform: PlatformType,
    options?: SearchOptions
  ): Promise<Summary>;
}

// Adapter Pattern - Cross-Platform Support (Portability Goal)
export interface IPlatformAdapter {
  /**
   * Platform identification
   */
  readonly platformType: PlatformType;

  /**
   * Create new content in the platform
   */
  createContent(content: FormattedContent): Promise<string>;

  /**
   * Link content to existing items
   */
  linkContent(sourceId: string, targetId: string, relationship?: string): Promise<void>;

  /**
   * Search existing content in the platform
   */
  searchExisting(query: string): Promise<ExistingContent[]>;

  /**
   * Update existing content
   */
  updateContent(id: string, content: FormattedContent): Promise<void>;

  /**
   * Get content by ID
   */
  getContent(id: string): Promise<ExistingContent | null>;

  /**
   * Check platform connectivity and permissions
   */
  healthCheck(): Promise<boolean>;
}

// Strategy Pattern - Processing Strategies (Privacy & Performance Goals)
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

// Cache Aside Pattern - Performance Optimization (Efficiency Goal)
export interface ICacheManager {
  /**
   * Get cached value
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set cached value with TTL
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete cached value
   */
  delete(key: string): Promise<void>;

  /**
   * Invalidate cache entries by pattern
   */
  invalidate(pattern: string): Promise<void>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<{
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
  }>;

  /**
   * Clear all cache
   */
  clear(): Promise<void>;
}

// Observer Pattern - Event-Driven Communication (Scalability Goal)
export interface IEventBus {
  /**
   * Publish an event
   */
  publish(event: Event): void;

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T>(eventType: string, handler: (data: T) => void): string;

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): void;

  /**
   * Subscribe to events with pattern matching
   */
  subscribePattern(pattern: RegExp, handler: (event: Event) => void): string;

  /**
   * Get event history for debugging
   */
  getEventHistory(limit?: number): Event[];
}

// Plugin Pattern - Extensible Functionality (Extensibility Goal)
export interface IPlugin {
  /**
   * Plugin metadata
   */
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;

  /**
   * Initialize plugin with context
   */
  initialize(context: PluginContext): Promise<void>;

  /**
   * Execute plugin functionality
   */
  execute(input: PluginInput): Promise<PluginOutput>;

  /**
   * Cleanup plugin resources
   */
  destroy(): Promise<void>;

  /**
   * Get plugin configuration schema
   */
  getConfigSchema(): Record<string, unknown>;

  /**
   * Validate plugin configuration
   */
  validateConfig(config: Record<string, unknown>): boolean;
}

// Content Discovery Interface
export interface IContentDiscovery {
  /**
   * Search for content across multiple sources
   */
  searchContent(options: SearchOptions): Promise<ContentResult>;

  /**
   * Get content from specific URL
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

// AI Service Router Interface
export interface IAIServiceRouter {
  /**
   * Route request to appropriate AI service based on content and requirements
   */
  route(content: string, requirements: ProcessingOptions): Promise<IProcessingStrategy>;

  /**
   * Get available AI services
   */
  getAvailableServices(): Promise<ProcessingStrategy[]>;

  /**
   * Get service health status
   */
  getServiceHealth(): Promise<Record<ProcessingStrategy, boolean>>;

  /**
   * Estimate cost for processing
   */
  estimateCost(content: string, strategy: ProcessingStrategy): Promise<number>;
}

// Knowledge Integration Interface
export interface IKnowledgeIntegrator {
  /**
   * Find connections between new content and existing knowledge
   */
  findConnections(summary: Summary, existingContent: ExistingContent[]): Promise<RelatedLink[]>;

  /**
   * Suggest tags based on content and existing taxonomy
   */
  suggestTags(content: ContentItem[], existingTags: string[]): Promise<string[]>;

  /**
   * Create knowledge graph connections
   */
  createConnections(summary: Summary, platform: IPlatformAdapter): Promise<void>;

  /**
   * Update existing content with new insights
   */
  updateExistingContent(newSummary: Summary, relatedContent: ExistingContent[]): Promise<void>;
}

// Plugin Registry Interface
export interface IPluginRegistry {
  /**
   * Register a plugin
   */
  register(plugin: IPlugin): Promise<void>;

  /**
   * Unregister a plugin
   */
  unregister(pluginName: string): Promise<void>;

  /**
   * Get registered plugin
   */
  getPlugin(name: string): IPlugin | null;

  /**
   * Get all registered plugins
   */
  getAllPlugins(): IPlugin[];

  /**
   * Execute plugin by name
   */
  executePlugin(name: string, input: PluginInput): Promise<PluginOutput>;

  /**
   * Check plugin dependencies
   */
  checkDependencies(pluginName: string): Promise<boolean>;
}

// Configuration Manager Interface
export interface IConfigManager {
  /**
   * Get configuration value
   */
  get<T>(key: string): T | undefined;

  /**
   * Set configuration value
   */
  set<T>(key: string, value: T): void;

  /**
   * Load configuration from file
   */
  loadFromFile(filePath: string): Promise<void>;

  /**
   * Save configuration to file
   */
  saveToFile(filePath: string): Promise<void>;

  /**
   * Validate configuration
   */
  validate(): boolean;

  /**
   * Get configuration schema
   */
  getSchema(): Record<string, unknown>;
}
