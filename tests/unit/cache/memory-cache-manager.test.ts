import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { MemoryCacheManager } from '@/cache/memory-cache-manager.js';

describe('MemoryCacheManager', () => {
  let cacheManager: MemoryCacheManager;

  beforeEach(() => {
    cacheManager = new MemoryCacheManager();
  });

  afterEach(async () => {
    await cacheManager.clear();
    cacheManager.destroy();
  });

  describe('Basic Cache Operations', () => {
    it('should set and get values correctly', async () => {
      const key = 'test-key';
      const value = { data: 'test-value' };

      await cacheManager.set(key, value);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cacheManager.get('non-existent');
      expect(result).toBeNull();
    });

    it('should delete keys correctly', async () => {
      const key = 'test-key';
      const value = 'test-value';

      await cacheManager.set(key, value);
      const retrievedValue = await cacheManager.get(key);
      expect(retrievedValue).toEqual(value);

      await cacheManager.delete(key);
      expect(await cacheManager.get(key)).toBeNull();
    });

    it('should clear all cache entries', async () => {
      await cacheManager.set('key1', 'value1');
      await cacheManager.set('key2', 'value2');
      await cacheManager.set('key3', 'value3');

      const value1 = await cacheManager.get('key1');
      const value2 = await cacheManager.get('key2');
      const value3 = await cacheManager.get('key3');
      expect(value1).toBe('value1');
      expect(value2).toBe('value2');
      expect(value3).toBe('value3');

      await cacheManager.clear();

      expect(await cacheManager.get('key1')).toBeNull();
      expect(await cacheManager.get('key2')).toBeNull();
      expect(await cacheManager.get('key3')).toBeNull();
    });
  });

  describe('TTL (Time To Live) Support', () => {
    it('should expire entries after TTL', async () => {
      const key = 'ttl-key';
      const value = 'ttl-value';
      const ttlMs = 100; // 100ms

      await cacheManager.set(key, value, ttlMs);
      const retrievedValue = await cacheManager.get(key);
      expect(retrievedValue).toBe(value);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      expect(await cacheManager.get(key)).toBeNull();
    });

    it('should return null for expired entries', async () => {
      const key = 'ttl-key';
      const value = 'ttl-value';
      const ttlMs = 50;

      await cacheManager.set(key, value, ttlMs);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await cacheManager.get(key);
      expect(result).toBeNull();
    });

    it('should not expire entries without TTL', async () => {
      const key = 'no-ttl-key';
      const value = 'no-ttl-value';

      await cacheManager.set(key, value);

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));

      const retrievedValue = await cacheManager.get(key);
      expect(retrievedValue).toBe(value);
    });
  });

  describe('Cache Statistics', () => {
    it('should provide cache statistics', async () => {
      const stats = await cacheManager.getStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hitRate');

      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
    });

    it('should track cache hits and misses', async () => {
      const key = 'stats-key';
      const value = 'stats-value';

      // Initial stats
      let stats = await cacheManager.getStats();
      const initialHits = stats.hits;
      const initialMisses = stats.misses;

      // Cache miss
      await cacheManager.get(key);
      stats = await cacheManager.getStats();
      expect(stats.misses).toBe(initialMisses + 1);

      // Set value
      await cacheManager.set(key, value);

      // Cache hit
      await cacheManager.get(key);
      stats = await cacheManager.getStats();
      expect(stats.hits).toBe(initialHits + 1);
    });

    it('should calculate hit rate correctly', async () => {
      // Ensure clean slate
      await cacheManager.clear();

      const key = 'hit-rate-key';
      const value = 'hit-rate-value';

      await cacheManager.set(key, value);

      // One hit
      await cacheManager.get(key);

      // One miss
      await cacheManager.get('non-existent');

      const stats = await cacheManager.getStats();
      expect(stats.hitRate).toBe(0.5); // 1 hit out of 2 attempts = 50%
    });
  });

  describe('Cache Invalidation', () => {
    it('should invalidate entries by pattern', async () => {
      await cacheManager.set('user:1:profile', { name: 'Alice' });
      await cacheManager.set('user:2:profile', { name: 'Bob' });
      await cacheManager.set('user:1:settings', { theme: 'dark' });
      await cacheManager.set('post:1:content', { title: 'Hello' });

      // Invalidate all user:1 entries
      await cacheManager.invalidate('user:1:.*');

      expect(await cacheManager.get('user:1:profile')).toBeNull();
      expect(await cacheManager.get('user:1:settings')).toBeNull();
      expect(await cacheManager.get('user:2:profile')).not.toBeNull();
      expect(await cacheManager.get('post:1:content')).not.toBeNull();
    });
  });

  describe('Memory Management', () => {
    it('should handle large objects', async () => {
      const key = 'large-object';
      const largeValue = {
        data: new Array(1000).fill('large-data'),
        metadata: {
          created: new Date(),
          size: 1000,
          type: 'test',
        },
      };

      await cacheManager.set(key, largeValue);
      const retrieved = await cacheManager.get(key);

      expect(retrieved).toEqual(largeValue);
      expect(retrieved && typeof retrieved === 'object' && 'data' in retrieved ? (retrieved as { data: string[] }).data : []).toHaveLength(1000);
    });

    it('should handle various data types', async () => {
      const testCases = [
        { key: 'string', value: 'test string' },
        { key: 'number', value: 42 },
        { key: 'boolean', value: true },
        { key: 'array', value: [1, 2, 3, 'test'] },
        { key: 'object', value: { nested: { deep: 'value' } } },
        { key: 'null', value: null },
      ];

      for (const testCase of testCases) {
        await cacheManager.set(testCase.key, testCase.value);
        const retrieved = await cacheManager.get(testCase.key);
        expect(retrieved).toEqual(testCase.value);
      }
    });

    it('should respect max size limits', async () => {
      const smallCache = new MemoryCacheManager(3600, 3); // Max 3 items

      await smallCache.set('key1', 'value1');
      await smallCache.set('key2', 'value2');
      await smallCache.set('key3', 'value3');

      let stats = await smallCache.getStats();
      expect(stats.size).toBe(3);

      // Adding one more should evict the oldest (key1)
      await smallCache.set('key4', 'value4');

      stats = await smallCache.getStats();
      expect(stats.size).toBe(3);

      // key1 should be evicted, key4 should exist
      expect(await smallCache.get('key1')).toBeNull();
      const key4Value = await smallCache.get('key4');
      expect(key4Value).toBe('value4');

      await smallCache.clear();
      smallCache.destroy(); // Clean up properly
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent set operations', async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        promises.push(cacheManager.set(`key-${i}`, `value-${i}`));
      }

      await Promise.all(promises);

      // Verify all values were set
      for (let i = 0; i < 10; i++) {
        const value = await cacheManager.get(`key-${i}`);
        expect(value).toBe(`value-${i}`);
      }
    });

    it('should handle concurrent get operations', async () => {
      const key = 'concurrent-key';
      const value = 'concurrent-value';

      await cacheManager.set(key, value);

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(cacheManager.get(key));
      }

      const results = await Promise.all(promises);

      // All should return the same value
      results.forEach(result => {
        expect(result).toBe(value);
      });
    });
  });
});
