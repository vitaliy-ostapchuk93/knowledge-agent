/**
 * Cache Management Interface
 * Provides caching capabilities for performance optimization
 */

export interface ICacheManager {
  /**
   * Get cached value by key
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set cached value with optional TTL
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
   * Clear all cache entries
   */
  clear(): Promise<void>;
}
