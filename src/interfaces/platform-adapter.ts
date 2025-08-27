/**
 * Platform Adapter Interface
 * Adapter pattern implementation for cross-platform support
 */

import { FormattedContent, ExistingContent, PlatformType } from '@/types';

/**
 * Adapter Pattern - Cross-Platform Support (Portability Goal)
 * Standardized interface for different knowledge management platforms
 */
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

  /**
   * Get platform-specific metadata
   */
  getMetadata(): Promise<PlatformMetadata>;

  /**
   * Bulk operations for performance
   */
  bulkCreateContent(contents: FormattedContent[]): Promise<string[]>;

  /**
   * Export content from platform
   */
  exportContent(options?: ExportOptions): Promise<ExistingContent[]>;

  /**
   * Import content to platform
   */
  importContent(contents: FormattedContent[]): Promise<string[]>;
}

export interface PlatformMetadata {
  name: string;
  version: string;
  capabilities: PlatformCapabilities;
  limits: PlatformLimits;
  configuration: Record<string, unknown>;
}

export interface PlatformCapabilities {
  supportsLinks: boolean;
  supportsTags: boolean;
  supportsImages: boolean;
  supportsMarkdown: boolean;
  supportsSearch: boolean;
  supportsBulkOperations: boolean;
  supportsVersioning: boolean;
  supportsBacklinks: boolean;
}

export interface PlatformLimits {
  maxContentSize: number;
  maxLinksPerItem: number;
  maxTagsPerItem: number;
  rateLimitPerMinute: number;
  bulkOperationLimit: number;
}

export interface ExportOptions {
  format?: 'markdown' | 'json' | 'html';
  includeMetadata?: boolean;
  includeLinks?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tags?: string[];
}
