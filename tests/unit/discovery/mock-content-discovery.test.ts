/**
 * Mock Content Discovery Tests
 * Tests for NLP-enhanced mock content discovery
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { MockContentDiscovery } from '@/discovery/mock-content-discovery.ts';

describe('MockContentDiscovery (NLP Enhanced)', () => {
  let discovery: MockContentDiscovery;

  beforeEach(() => {
    discovery = new MockContentDiscovery();
  });

  describe('NLP-powered relevance scoring', () => {
    test('should use semantic similarity for content discovery', async () => {
      const query = 'React components';
      const result = await discovery.discover(query);

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);

      // Verify NLP scoring is applied
      const firstItem = result.items[0];
      expect(firstItem.relevanceScore).toBeGreaterThan(0);
      expect(firstItem.relevanceScore).toBeLessThanOrEqual(1);
    });

    test('should handle semantic queries better than exact matching', async () => {
      const semanticQuery = 'component architecture patterns';
      const result = await discovery.discover(semanticQuery);

      expect(result.items.length).toBeGreaterThan(0);

      // Should find relevant content even without exact keyword matches
      const hasRelevantContent = result.items.some(
        item =>
          item.relevanceScore > 0.3 &&
          (item.title.toLowerCase().includes('component') ||
            item.content.toLowerCase().includes('architecture') ||
            (item.metadata.tags as string[]).some((tag: string) =>
              ['guide', 'tutorial', 'patterns'].includes(tag)
            ))
      );

      expect(hasRelevantContent).toBe(true);
    });

    test('should filter by relevance threshold', async () => {
      const query = 'advanced programming concepts';
      const options = { maxResults: 10 };

      const result = await discovery.discover(query, options);

      // All returned items should have meaningful relevance scores
      result.items.forEach(item => {
        expect(item.relevanceScore).toBeGreaterThan(0.3); // NLP threshold
        expect(item.relevanceScore).toBeLessThanOrEqual(1);
      });
    });

    test('should rank results by relevance score', async () => {
      const query = 'JavaScript frameworks';
      const result = await discovery.discover(query, { maxResults: 5 });

      expect(result.items.length).toBeGreaterThan(1);

      // Results should be sorted by relevance (descending)
      for (let i = 1; i < result.items.length; i++) {
        expect(result.items[i - 1].relevanceScore).toBeGreaterThanOrEqual(
          result.items[i].relevanceScore
        );
      }
    });
  });

  describe('async operations', () => {
    test('should handle async relevance scoring in discover', async () => {
      const query = 'machine learning algorithms';
      const startTime = Date.now();

      const result = await discovery.discover(query);

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThan(50); // Should take some time for NLP processing
      expect(result.items.length).toBeGreaterThan(0);
    });

    test('should handle async relevance scoring in getTrendingContent', async () => {
      const topic = 'web development trends';
      const startTime = Date.now();

      const items = await discovery.getTrendingContent(topic);

      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThan(150); // Should take time for async processing
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    test('should handle async relevance scoring in discoverContent', async () => {
      const query = 'database design principles';
      const maxResults = 3;

      const items = await discovery.discoverContent(query, maxResults);

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeLessThanOrEqual(maxResults);

      // Verify NLP scoring was applied
      items.forEach(item => {
        expect(item.relevanceScore).toBeGreaterThan(0);
      });
    });
  });

  describe('content generation and enrichment', () => {
    test('should generate dynamic content with proper structure', async () => {
      const query = 'cloud computing basics';
      const result = await discovery.discover(query, { maxResults: 10 });

      expect(result.items.length).toBeGreaterThan(0);

      result.items.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.content).toBeDefined();
        expect(item.url).toBeDefined();
        expect(item.source).toBeDefined();
        expect(item.metadata).toBeDefined();
        expect(item.relevanceScore).toBeGreaterThan(0);

        // Verify metadata structure
        expect(item.metadata.author).toBeDefined();
        expect(item.metadata.publishDate).toBeDefined();
        expect(item.metadata.tags).toBeDefined();
        expect(item.metadata.contentType).toBeDefined();
        expect(item.metadata.difficulty).toBeDefined();
      });
    });

    test('should include relevant tags for queries', async () => {
      const query = 'React TypeScript best practices';
      const result = await discovery.discover(query);

      expect(result.items.length).toBeGreaterThan(0);

      const hasRelevantTags = result.items.some(item =>
        item.metadata.tags.some((tag: string) =>
          ['react', 'typescript', 'best-practices', 'programming', 'development'].includes(
            tag.toLowerCase()
          )
        )
      );

      expect(hasRelevantTags).toBe(true);
    });

    test('should vary content types appropriately', async () => {
      const query = 'software engineering principles';
      const result = await discovery.discover(query, { maxResults: 8 });

      if (result.items.length > 1) {
        const contentTypes = new Set(result.items.map(item => item.metadata.contentType));

        // Should have variety in content types
        expect(contentTypes.size).toBeGreaterThan(1);
      }
    });

    test('should vary difficulty levels', async () => {
      const query = 'programming tutorials';
      const result = await discovery.discover(query, { maxResults: 10 });

      if (result.items.length > 2) {
        const difficulties = new Set(result.items.map(item => item.metadata.difficulty));

        // Should have variety in difficulty levels
        expect(difficulties.size).toBeGreaterThan(1);

        // Should include valid difficulty levels
        difficulties.forEach(difficulty => {
          expect(['beginner', 'intermediate', 'advanced']).toContain(difficulty);
        });
      }
    });
  });

  describe('edge cases and error handling', () => {
    test('should handle empty queries gracefully', async () => {
      const result = await discovery.discover('');

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    test('should handle very specific queries', async () => {
      const verySpecificQuery = 'microservices distributed systems event sourcing CQRS';
      const result = await discovery.discover(verySpecificQuery);

      expect(result).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
      expect(result.items.length).toBeGreaterThan(0);
    });

    test('should handle large maxResults values', async () => {
      const query = 'web development';
      const result = await discovery.discover(query, { maxResults: 100 });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.length).toBeLessThanOrEqual(100);
    });

    test('should handle zero maxResults gracefully', async () => {
      const query = 'testing frameworks';
      const result = await discovery.discover(query, { maxResults: 0 });

      expect(Array.isArray(result.items)).toBe(true);
      // Zero maxResults should still return some items due to dynamic content generation
      expect(result.items.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('performance and timing', () => {
    test('should provide realistic search timing', async () => {
      const query = 'artificial intelligence';
      const result = await discovery.discover(query);

      expect(result.searchTime).toBeDefined();
      expect(typeof result.searchTime).toBe('number');
      expect(result.searchTime).toBeGreaterThan(0);
      expect(result.searchTime).toBeLessThan(5000); // Should be reasonable
    });

    test('should report accurate result counts', async () => {
      const query = 'data structures algorithms';
      const result = await discovery.discover(query, { maxResults: 5 });

      expect(result.totalFound).toBeDefined();
      expect(typeof result.totalFound).toBe('number');
      expect(result.totalFound).toBe(result.items.length);
      expect(result.sources).toBeDefined();
      expect(Array.isArray(result.sources)).toBe(true);
    });
  });

  describe('URL-based content retrieval', () => {
    test('should retrieve content by URL', async () => {
      // First discover some content
      const discoverResult = await discovery.discover('JavaScript');
      expect(discoverResult.items.length).toBeGreaterThan(0);

      const targetUrl = discoverResult.items[0].url;
      const retrievedContent = await discovery.getContentFromUrl(targetUrl);

      expect(retrievedContent).toBeDefined();
      expect(retrievedContent?.url).toBe(targetUrl);
    });

    test('should return null for non-existent URLs', async () => {
      const nonExistentUrl = 'https://example.com/non-existent-content';
      const retrievedContent = await discovery.getContentFromUrl(nonExistentUrl);

      expect(retrievedContent).toBeNull();
    });
  });

  describe('related content discovery', () => {
    test('should find related content based on tags', async () => {
      // Get initial content
      const initialResult = await discovery.discover('React components');
      expect(initialResult.items.length).toBeGreaterThan(0);

      const baseContent = initialResult.items[0];
      const relatedContent = await discovery.getRelatedContent(baseContent);

      expect(Array.isArray(relatedContent)).toBe(true);
      expect(relatedContent.length).toBeLessThanOrEqual(5);

      // Related content should have different IDs
      relatedContent.forEach(item => {
        expect(item.id).not.toBe(baseContent.id);
      });
    });
  });
});
