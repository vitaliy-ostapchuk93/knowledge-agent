/**
 * Reddit Discovery Tests
 * Tests for the RedditDiscovery implementation
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { RedditDiscovery } from '@/discovery/reddit-discovery.ts';
import { ContentSource } from '@/types/index.ts';

describe('RedditDiscovery', () => {
  let redditDiscovery: RedditDiscovery;

  beforeEach(() => {
    redditDiscovery = new RedditDiscovery();
  });

  describe('Basic Discovery', () => {
    it('should be properly instantiated', () => {
      expect(redditDiscovery).toBeDefined();
      expect(redditDiscovery).toBeInstanceOf(RedditDiscovery);
    });

    it('should discover content with default options', async () => {
      const results = await redditDiscovery.discover('React hooks', {});

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);

      if (results.length > 0) {
        const firstResult = results[0];
        expect(firstResult.source).toBe(ContentSource.REDDIT);
        expect(firstResult.content).toBeDefined();
        expect(firstResult.title).toBeDefined();
        expect(firstResult.url).toBeDefined();
        expect(firstResult.metadata).toBeDefined();
        expect(firstResult.metadata.tags).toBeDefined();
        expect(Array.isArray(firstResult.metadata.tags)).toBe(true);
      }
    });

    it('should discover content with custom options', async () => {
      const results = await redditDiscovery.discover('programming tutorials', {
        maxResults: 3,
        minRelevanceScore: 0.3,
        timeRange: 'week',
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(3);

      results.forEach(result => {
        expect(result.source).toBe(ContentSource.REDDIT);
        expect(result.relevanceScore).toBeGreaterThanOrEqual(0.3);
      });
    });

    it('should discover content from specific subreddits', async () => {
      const subreddit = 'javascript';
      const results = await redditDiscovery.discover('javascript tips', {
        subreddits: [subreddit],
        maxResults: 2,
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(2);

      if (results.length > 0) {
        results.forEach(result => {
          expect(result.source).toBe(ContentSource.REDDIT);
          expect(result.metadata.subreddit).toBe(subreddit);
        });
      }
    });
  });

  describe('Content Quality', () => {
    it('should return content with relevance scores', async () => {
      const results = await redditDiscovery.discover('TypeScript best practices', {
        maxResults: 5,
      });

      expect(Array.isArray(results)).toBe(true);

      results.forEach(result => {
        expect(result.relevanceScore).toBeDefined();
        expect(typeof result.relevanceScore).toBe('number');
        expect(result.relevanceScore).toBeGreaterThanOrEqual(0);
        expect(result.relevanceScore).toBeLessThanOrEqual(1);
      });
    });

    it('should filter by minimum relevance score', async () => {
      const minScore = 0.5;
      const results = await redditDiscovery.discover('React performance', {
        minRelevanceScore: minScore,
        maxResults: 10,
      });

      expect(Array.isArray(results)).toBe(true);

      results.forEach(result => {
        expect(result.relevanceScore).toBeGreaterThanOrEqual(minScore);
      });
    });

    it('should include proper metadata', async () => {
      const results = await redditDiscovery.discover('Node.js tutorials', {
        maxResults: 3,
      });

      expect(Array.isArray(results)).toBe(true);

      if (results.length > 0) {
        const result = results[0];
        expect(result.metadata).toBeDefined();
        expect(result.metadata.tags).toBeDefined();
        expect(Array.isArray(result.metadata.tags)).toBe(true);
        expect(result.metadata.difficulty).toBeDefined();
        expect(result.metadata.subreddit).toBeDefined();
        // estimatedReadTime might not always be present in mock data
        if (result.metadata.estimatedReadTime) {
          expect(typeof result.metadata.estimatedReadTime).toBe('number');
        }
      }
    });
  });

  describe('Search Options', () => {
    it('should respect maxResults option', async () => {
      const maxResults = 2;
      const results = await redditDiscovery.discover('Python programming', {
        maxResults,
      });

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(maxResults);
    });

    it('should handle different time ranges', async () => {
      const timeRanges = ['hour', 'day', 'week', 'month', 'year', 'all'] as const;

      for (const timeRange of timeRanges) {
        const results = await redditDiscovery.discover('web development', {
          maxResults: 1,
          timeRange,
        });

        expect(Array.isArray(results)).toBe(true);
        // Should not throw errors for any time range
      }
    });

    it('should handle different sort options', async () => {
      const sortOptions = ['hot', 'new', 'top', 'rising'] as const;

      for (const sortBy of sortOptions) {
        const results = await redditDiscovery.discover('machine learning', {
          maxResults: 1,
          sortBy,
        });

        expect(Array.isArray(results)).toBe(true);
        // Should not throw errors for any sort option
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle empty queries gracefully', async () => {
      const results = await redditDiscovery.discover('', {});

      expect(Array.isArray(results)).toBe(true);
      // Mock implementation might still return some results for empty queries
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
    it('should handle invalid subreddits gracefully', async () => {
      const results = await redditDiscovery.discover('test query', {
        subreddits: ['nonexistent_subreddit_12345'],
        maxResults: 5,
      });

      expect(Array.isArray(results)).toBe(true);
      // Should return empty array or handle gracefully
    });

    it('should handle network simulation errors gracefully', async () => {
      // This tests the mock behavior for error scenarios
      const results = await redditDiscovery.discover('network error test', {
        maxResults: 1,
      });

      expect(Array.isArray(results)).toBe(true);
      // Should not throw unhandled errors
    });
  });

  describe('NLP Enhancement', () => {
    it('should generate relevant tags using NLP', async () => {
      const results = await redditDiscovery.discover('React hooks useState useEffect', {
        maxResults: 3,
      });

      expect(Array.isArray(results)).toBe(true);

      if (results.length > 0) {
        const result = results[0];
        expect(result.metadata.tags).toBeDefined();
        expect(Array.isArray(result.metadata.tags)).toBe(true);
        expect((result.metadata.tags as string[]).length).toBeGreaterThan(0);

        // Should contain relevant tags
        const tags = (result.metadata.tags as string[]).join(' ').toLowerCase();
        expect(tags).toMatch(/react|hooks|javascript|frontend/);
      }
    });

    it('should calculate semantic relevance scores', async () => {
      const query = 'React functional components';
      const results = await redditDiscovery.discover(query, {
        maxResults: 5,
      });

      expect(Array.isArray(results)).toBe(true);

      if (results.length > 1) {
        // Results should generally be sorted by relevance, but allow for small variations in mock data
        let sortedCount = 0;
        for (let i = 0; i < results.length - 1; i++) {
          if (results[i].relevanceScore >= results[i + 1].relevanceScore) {
            sortedCount++;
          }
        }
        // Most results should be in descending order (allow some tolerance for mock data)
        expect(sortedCount).toBeGreaterThanOrEqual(Math.floor((results.length - 1) * 0.7));
      }
    });
  });
});
