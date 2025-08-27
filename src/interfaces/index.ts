/**
 * Universal Knowledge Agent Interfaces
 * Re-exports all interfaces from focused interface files
 */

// Core Agent Interface
export type { IKnowledgeAgent } from '@/interfaces/knowledge-agent.ts';

// Content Discovery Interfaces
export type { IContentDiscovery } from '@/interfaces/content-discovery.ts';
export type { IGitHubDiscovery } from '@/interfaces/github-discovery.ts';
export type { IStackOverflowDiscovery } from '@/interfaces/stackoverflow-discovery.ts';
export type { IRedditDiscovery } from '@/interfaces/reddit-discovery.ts';

// Content Processing Interfaces
export type { IContentSummarizer } from '@/interfaces/content-summarizer.ts';
export type { IProcessingStrategy } from '@/interfaces/processing-strategy.ts';

// Platform Integration Interfaces
export type {
  IPlatformAdapter,
  PlatformMetadata,
  PlatformCapabilities,
  PlatformLimits,
  ExportOptions,
} from '@/interfaces/platform-adapter.ts';
export type { IKnowledgeIntegrator } from '@/interfaces/knowledge-integrator.ts';

// Knowledge Linking Interfaces
export type { IAdvancedKnowledgeLinking } from '@/interfaces/knowledge-linking.ts';

// Plugin System Interfaces
export type {
  IPlugin,
  IPluginManager,
  IPluginLoader,
  IPluginRegistry,
} from '@/interfaces/plugin-system.ts';

// Cache and Event Interfaces
export type { ICacheManager } from '@/interfaces/cache-manager.ts';
export type { IEventBus } from '@/interfaces/event-bus.ts';
