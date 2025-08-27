/**
 * Plugin System Interfaces
 * Extensible plugin architecture for modular functionality
 */

import { PluginType, PluginInput, PluginOutput, PluginContext } from '@/types';

/**
 * Core Plugin Interface
 * Base interface that all plugins must implement
 */
export interface IPlugin {
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly author: string;
  readonly type: PluginType;

  /**
   * Initialize plugin with context and configuration
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
  getConfigSchema(): PluginConfigSchema;

  /**
   * Validate plugin configuration
   */
  validateConfig(config: Record<string, unknown>): ValidationResult;

  /**
   * Get plugin dependencies
   */
  getDependencies(): PluginDependency[];

  /**
   * Check if plugin is compatible with current system
   */
  isCompatible(): Promise<boolean>;

  /**
   * Get plugin health status
   */
  getHealth(): Promise<PluginHealth>;
}

/**
 * Plugin Manager Interface
 * Manages core plugin lifecycle and execution
 */
export interface IPluginManager {
  /**
   * Register a new plugin
   */
  registerPlugin(plugin: IPlugin): Promise<void>;

  /**
   * Unregister a plugin
   */
  unregisterPlugin(pluginName: string): Promise<void>;

  /**
   * Execute plugins of a specific type
   */
  executePlugins(type: PluginType, input: PluginInput): Promise<PluginOutput[]>;

  /**
   * Get all registered plugins
   */
  getPlugins(): IPlugin[];

  /**
   * Get plugin by name
   */
  getPlugin(name: string): IPlugin | null;

  /**
   * Enable/disable a plugin
   */
  setPluginEnabled(name: string, enabled: boolean): Promise<void>;

  /**
   * Get plugin execution order
   */
  getExecutionOrder(type: PluginType): string[];

  /**
   * Set plugin execution order
   */
  setExecutionOrder(type: PluginType, order: string[]): Promise<void>;
}

/**
 * Plugin Loader Interface
 * Handles plugin loading and marketplace operations
 */
export interface IPluginLoader {
  /**
   * Load plugins from directory
   */
  loadPluginsFromDirectory(directory: string): Promise<void>;

  /**
   * Get plugin marketplace information
   */
  getMarketplacePlugins(): Promise<MarketplacePlugin[]>;

  /**
   * Install plugin from marketplace
   */
  installPlugin(pluginId: string): Promise<void>;
}

/**
 * Plugin Registry Interface
 * Central registry for plugin discovery and management
 */
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
   * Find plugins by type
   */
  findPluginsByType(type: PluginType): IPlugin[];

  /**
   * Find plugins by capability
   */
  findPluginsByCapability(capability: string): IPlugin[];

  /**
   * Execute plugin by name
   */
  executePlugin(name: string, input: PluginInput): Promise<PluginOutput>;

  /**
   * Check plugin dependencies
   */
  checkDependencies(pluginName: string): Promise<DependencyCheckResult>;

  /**
   * Resolve plugin dependencies
   */
  resolveDependencies(pluginName: string): Promise<void>;
}

// Supporting interfaces and types

export interface PluginConfigSchema {
  type: 'object';
  properties: Record<string, PropertySchema>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface PropertySchema {
  type: string;
  description: string;
  default?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  pattern?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  value: unknown;
}

export interface PluginDependency {
  name: string;
  version: string;
  type: DependencyType;
  optional?: boolean;
}

export enum DependencyType {
  PLUGIN = 'plugin',
  SYSTEM = 'system',
  LIBRARY = 'library',
  SERVICE = 'service',
}

export interface PluginHealth {
  status: HealthStatus;
  message: string;
  details: Record<string, unknown>;
  lastCheck: Date;
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  ERROR = 'error',
  UNKNOWN = 'unknown',
}

export interface MarketplacePlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  type: PluginType;
  downloadUrl: string;
  documentation: string;
  rating: number;
  downloads: number;
  tags: string[];
  screenshots: string[];
  dependencies: PluginDependency[];
}

export interface DependencyCheckResult {
  satisfied: boolean;
  missing: PluginDependency[];
  conflicts: DependencyConflict[];
}

export interface DependencyConflict {
  dependency: PluginDependency;
  installedVersion: string;
  requiredVersion: string;
  conflictType: ConflictType;
}

export enum ConflictType {
  VERSION_MISMATCH = 'version_mismatch',
  INCOMPATIBLE = 'incompatible',
  MISSING = 'missing',
}
