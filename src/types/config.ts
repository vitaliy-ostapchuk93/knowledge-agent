/**
 * Configuration Types
 * Types for system configuration and settings
 */

import { PlatformType } from '@/types/platform.ts';
import { ProcessingStrategy } from '@/types/summarization.ts';
import { PluginConfig } from '@/types/plugin.ts';

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
