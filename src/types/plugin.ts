/**
 * Plugin System Types
 * Types for the extensible plugin architecture
 */

import { ContentItem } from '@/types/content.ts';
import { PlatformType } from '@/types/platform.ts';

export interface PluginContext {
  config: Record<string, unknown>;
  cacheManager: unknown; // TODO: Replace with ICacheManager import
  eventBus: unknown; // TODO: Replace with IEventBus import
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

export enum PluginType {
  DISCOVERY = 'discovery',
  SUMMARIZATION = 'summarization',
  INTEGRATION = 'integration',
  ANALYTICS = 'analytics',
}

export interface PluginConfig {
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
  settings: Record<string, unknown>;
  apiKeys?: Record<string, string>;
}

export interface PluginExecutionContext {
  query?: string;
  platform?: PlatformType;
  timestamp: Date;
}
