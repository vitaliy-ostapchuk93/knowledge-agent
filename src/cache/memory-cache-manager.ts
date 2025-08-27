/**
 * Simple In-Memory Cache Manager - MVP Implementation
 * Provides basic caching functionality with TTL support
 */

import { ICacheManager } from '@/interfaces/index.ts';
import { logger } from '@/utils/logger.ts';

interface ICacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

interface ICacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
}

export class MemoryCacheManager implements ICacheManager {
  private cache = new Map<string, ICacheEntry<unknown>>();
  private stats = {
    hits: 0,
    misses: 0,
  };
  private defaultTTL: number;
  private maxSize: number;
  private cleanupInterval: NodeJS.Timeout;

  constructor(defaultTTL: number = 3600, maxSize: number = 1000) {
    this.defaultTTL = defaultTTL; // Default TTL in seconds
    this.maxSize = maxSize;

    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value as T;
  }

  /**
   * Set cached value with TTL
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const entry: ICacheEntry<T> = {
      value,
      expiresAt: ttl ? Date.now() + ttl : Number.MAX_SAFE_INTEGER,
      createdAt: Date.now(),
    };

    // If cache is at max size and we're adding a new key, remove oldest entry
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    this.cache.set(key, entry);
  }

  /**
   * Delete cached value
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    logger.debug(
      `🗑️ Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`
    );
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<ICacheStats> {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
    };
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
    logger.debug('🗑️ Cache cleared');
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      logger.debug(`🧹 Cleaned up ${removedCount} expired cache entries`);
    }
  }

  /**
   * Evict oldest entry when cache is full
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Number.MAX_SAFE_INTEGER;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.createdAt < oldestTime) {
        oldestTime = entry.createdAt;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      logger.debug(`♻️ Evicted oldest cache entry: ${oldestKey}`);
    }
  }

  /**
   * Get cache size in bytes (approximate)
   */
  getSizeBytes(): number {
    let size = 0;
    for (const [key, entry] of this.cache.entries()) {
      size += key.length * 2; // Rough estimate for string keys
      size += JSON.stringify(entry.value).length * 2; // Rough estimate for values
    }
    return size;
  }

  /**
   * Destroy the cache manager and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}
