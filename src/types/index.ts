/**
 * Core types and enums for the Universal Knowledge Agent
 * Based on the solution strategy's design patterns and quality goals
 */

// Core Content Types
export interface ContentItem {
  id: string;
  title: string;
  url: string;
  content: string;
  source: ContentSource;
  metadata: ContentMetadata;
  relevanceScore: number;
  timestamp: Date;
}

export interface ContentMetadata {
  author?: string;
  publishDate?: Date;
  tags: string[];
  contentType: ContentType;
  wordCount: number;
  language: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export enum ContentSource {
  YOUTUBE = 'youtube',
  REDDIT = 'reddit',
  STACKOVERFLOW = 'stackoverflow',
  GITHUB = 'github',
  DOCUMENTATION = 'documentation',
  TECH_BLOG = 'tech_blog',
  ACADEMIC_PAPER = 'academic_paper',
  TUTORIAL = 'tutorial',
}

export enum ContentType {
  VIDEO = 'video',
  ARTICLE = 'article',
  DOCUMENTATION = 'documentation',
  CODE_SNIPPET = 'code_snippet',
  DISCUSSION = 'discussion',
  TUTORIAL = 'tutorial',
  RESEARCH_PAPER = 'paper',
}

// Search and Discovery Types
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

// Summarization Types
export interface Summary {
  id: string;
  originalContent: ContentItem[];
  keyPoints: string[];
  codeExamples: CodeExample[];
  links: RelatedLink[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  generatedAt: Date;
  summary: string;
  actionableItems: string[];
}

export interface CodeExample {
  language: string;
  code: string;
  description: string;
  runnable?: boolean;
}

export interface RelatedLink {
  title: string;
  url: string;
  description: string;
  relationship: 'prerequisite' | 'related' | 'advanced' | 'alternative';
}

// Platform Types
export enum PlatformType {
  LOGSEQ = 'logseq',
  OBSIDIAN = 'obsidian',
  NOTION = 'notion',
  ROAM = 'roam',
}

export interface FormattedContent {
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  links: string[];
  tags: string[];
  format: PlatformType;
}

export interface ExistingContent {
  id: string;
  title: string;
  content: string;
  tags: string[];
  links: string[];
  lastModified: Date;
}

// Plugin System Types
export interface PluginContext {
  config: Record<string, unknown>;
  cacheManager: import('../interfaces').ICacheManager;
  eventBus: import('../interfaces').IEventBus;
  logger: ILogger;
}

export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export interface PluginInput {
  query: string;
  context: Record<string, unknown>;
}

export interface PluginOutput {
  content: ContentItem[];
  metadata: Record<string, unknown>;
}

// Processing Strategy Types
export interface ProcessingOptions {
  strategy: ProcessingStrategy;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  useCache?: boolean;
}

export enum ProcessingStrategy {
  LOCAL = 'local',
  CLOUD = 'cloud',
  HYBRID = 'hybrid',
}

export interface Analysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'low' | 'medium' | 'high';
  topics: string[];
  keyEntities: string[];
  readingLevel: number;
}

// Event System Types
export interface Event {
  type: string;
  data: unknown;
  timestamp: Date;
  source: string;
}

// Configuration Types
export interface AgentConfig {
  platforms: PlatformConfig[];
  ai: AIConfig;
  cache: CacheConfig;
  sources: SourceConfig;
  plugins: PluginConfig[];
}

export interface PlatformConfig {
  type: PlatformType;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface AIConfig {
  primaryProvider: 'openai' | 'anthropic' | 'local';
  fallbackProvider?: 'openai' | 'anthropic' | 'local';
  apiKeys: Record<string, string>;
  models: Record<string, string>;
  defaultStrategy: ProcessingStrategy;
}

export interface CacheConfig {
  enabled: boolean;
  ttl: {
    content: number;
    summaries: number;
    searches: number;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
}

export interface SourceConfig {
  youtube: {
    apiKey: string;
    maxResults: number;
  };
  reddit: {
    clientId: string;
    clientSecret: string;
    userAgent: string;
  };
  github: {
    token: string;
    maxResults: number;
  };
  stackoverflow: {
    key: string;
    maxResults: number;
  };
}

export interface PluginConfig {
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

// Summary Strategy Types
export enum SummaryStrategy {
  CONCISE = 'concise',
  DETAILED = 'detailed',
  CODE_FOCUSED = 'code_focused',
  ACADEMIC = 'academic',
  BEGINNER_FRIENDLY = 'beginner_friendly',
}
