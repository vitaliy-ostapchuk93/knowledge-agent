/**
 * Core Knowledge Agent Interface
 * Orchestrates discovery, summarization, and integration workflows
 */

import {
  SearchOptions,
  Summary,
  PlatformType,
  ContentResult,
  ContentItem,
  SummaryStrategy,
} from '@/types';
import { IContentDiscovery } from '@/interfaces/content-discovery.ts';
import { IPlatformAdapter } from '@/interfaces/platform-adapter.ts';
import { IProcessingStrategy } from '@/interfaces/processing-strategy.ts';
import { ICacheManager } from '@/interfaces/cache-manager.ts';
import { IEventBus } from '@/interfaces/event-bus.ts';

/**
 * Main orchestrator that combines discovery, summarization, and integration
 */
export interface IKnowledgeAgent {
  /**
   * Initialize the agent with adapters and strategies
   */
  initialize(
    adapters: IPlatformAdapter[],
    strategies: IProcessingStrategy[],
    cacheManager?: ICacheManager,
    eventBus?: IEventBus,
    contentDiscovery?: IContentDiscovery
  ): Promise<void>;

  /**
   * Complete workflow: discover, summarize, and integrate
   */
  processQuery(
    query: string,
    targetPlatform: PlatformType,
    options?: SearchOptions
  ): Promise<Summary>;

  /**
   * Discover content from various sources
   */
  discoverContent(query: string, options?: SearchOptions): Promise<ContentResult>;

  /**
   * Summarize content using available strategies
   */
  summarizeContent(content: ContentItem[], strategy?: SummaryStrategy): Promise<Summary>;

  /**
   * Integrate knowledge into target platform
   */
  integrateKnowledge(summary: Summary, targetPlatform: PlatformType): Promise<void>;
}
