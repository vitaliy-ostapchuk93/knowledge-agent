/**
 * Content Relevance Scorer Tests
 * Tests for the content relevance scoring algorithm
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { ContentRelevanceScorer } from '@/core/content-relevance-scorer.ts';
import { DiscoveredContent, ContentSource } from '@/types/index.ts';

describe('ContentRelevanceScorer', () => {
  let scorer: ContentRelevanceScorer;
  let mockContent: DiscoveredContent;

  beforeEach(() => {
    scorer = new ContentRelevanceScorer();
    mockContent = {
      id: 'test-1',
      title: 'React Server Components Tutorial',
      content:
        'Learn about React Server Components and how they improve performance. This comprehensive guide covers server-side rendering, data fetching, and component composition.',
      source: ContentSource.TUTORIAL,
      url: 'https://example.com/react-server-components',
      metadata: {
        publishDate: new Date('2024-01-15'),
        viewCount: 1500,
        author: 'John Doe',
      },
      relevanceScore: 0,
      tags: ['react', 'server-components', 'tutorial'],
    };
  });

  describe('calculateRelevance', () => {
    test('should calculate relevance score for exact title match', async () => {
      const score = await scorer.calculateRelevance(mockContent, 'React Server Components');

      expect(score).toBeGreaterThan(0.7);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('should calculate lower score for partial match', async () => {
      const score = await scorer.calculateRelevance(
        mockContent,
        'Python machine learning algorithms'
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(0.7);
    });

    test('should handle empty content gracefully', async () => {
      const emptyContent = {
        ...mockContent,
        content: '',
        title: '',
      };

      const score = await scorer.calculateRelevance(emptyContent, 'React Server Components');

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('should consider source reliability', async () => {
      const docContent = { ...mockContent, source: ContentSource.DOCUMENTATION };
      const redditContent = { ...mockContent, source: ContentSource.REDDIT };

      const docScore = await scorer.calculateRelevance(docContent, 'React');
      const redditScore = await scorer.calculateRelevance(redditContent, 'React');

      expect(docScore).toBeGreaterThan(redditScore);
    });

    test('should consider content recency', async () => {
      const recentContent = {
        ...mockContent,
        metadata: { ...mockContent.metadata, publishDate: new Date() },
      };
      const oldContent = {
        ...mockContent,
        metadata: { ...mockContent.metadata, publishDate: new Date('2020-01-01') },
      };

      const recentScore = await scorer.calculateRelevance(recentContent, 'React');
      const oldScore = await scorer.calculateRelevance(oldContent, 'React');

      expect(recentScore).toBeGreaterThan(oldScore);
    });
  });

  describe('scoreAndSort', () => {
    test('should sort content by relevance score', async () => {
      const contents: DiscoveredContent[] = [
        {
          ...mockContent,
          id: 'test-1',
          title: 'Unrelated Topic',
          content: 'This is about something completely different',
        },
        {
          ...mockContent,
          id: 'test-2',
          title: 'React Server Components Deep Dive',
          content:
            'React Server Components are a new feature in React that allows server-side rendering',
        },
        {
          ...mockContent,
          id: 'test-3',
          title: 'React Components',
          content: 'Basic React components tutorial',
        },
      ];

      const sorted = await scorer.scoreAndSort(contents, 'React Server Components');

      expect(sorted).toHaveLength(3);
      expect(sorted[0].title).toContain('React Server Components Deep Dive');
      expect(sorted[0].relevanceScore).toBeGreaterThan(sorted[1].relevanceScore);
      expect(sorted[1].relevanceScore).toBeGreaterThan(sorted[2].relevanceScore);
    });

    test('should filter by minimum score', async () => {
      const contents: DiscoveredContent[] = [
        {
          ...mockContent,
          id: 'test-1',
          title: 'React Server Components Tutorial',
          content: 'Learn React Server Components',
        },
        {
          ...mockContent,
          id: 'test-2',
          title: 'Unrelated Content',
          content: 'This has nothing to do with the query',
        },
      ];

      const filtered = await scorer.scoreAndSort(contents, 'React Server Components', {
        minScore: 0.5,
      });

      expect(filtered.length).toBeLessThan(contents.length);
      expect(filtered.every(c => c.relevanceScore >= 0.5)).toBe(true);
    });
  });

  describe('getRelevanceBreakdown', () => {
    test('should provide detailed relevance factors', async () => {
      const breakdown = await scorer.getRelevanceBreakdown(mockContent, 'React Server Components');

      expect(breakdown).toHaveProperty('titleMatch');
      expect(breakdown).toHaveProperty('contentMatch');
      expect(breakdown).toHaveProperty('sourceReliability');
      expect(breakdown).toHaveProperty('recency');
      expect(breakdown).toHaveProperty('popularity');
      expect(breakdown).toHaveProperty('contentQuality');

      expect(breakdown.titleMatch).toBeGreaterThan(0);
      expect(breakdown.contentMatch).toBeGreaterThan(0);
      expect(breakdown.sourceReliability).toBeGreaterThan(0);
    });
  });

  describe('custom weights and options', () => {
    test('should respect custom scoring weights', async () => {
      const customWeights = {
        titleMatch: 0.8,
        contentMatch: 0.1,
        sourceReliability: 0.1,
      };

      const defaultScore = await scorer.calculateRelevance(mockContent, 'React Server Components');

      const customScore = await scorer.calculateRelevance(mockContent, 'React Server Components', {
        weights: customWeights,
      });

      // With higher title weight, exact title match should score higher
      expect(customScore).toBeGreaterThan(defaultScore);
    });

    test('should boost preferred sources', async () => {
      const preferredScore = await scorer.calculateRelevance(mockContent, 'React', {
        preferredSources: [ContentSource.TUTORIAL],
      });

      const normalScore = await scorer.calculateRelevance(mockContent, 'React');

      expect(preferredScore).toBeGreaterThan(normalScore);
    });
  });

  describe('edge cases', () => {
    test('should handle malformed metadata', async () => {
      const malformedContent = {
        ...mockContent,
        metadata: {
          publishDate: 'invalid-date',
          viewCount: 'not-a-number',
        },
      };

      const score = await scorer.calculateRelevance(malformedContent, 'React Server Components');

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('should handle very short queries', async () => {
      const score = await scorer.calculateRelevance(mockContent, 'R');

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test('should handle very long queries', async () => {
      const longQuery =
        'React Server Components tutorial guide comprehensive deep dive advanced patterns best practices performance optimization SSR data fetching'.repeat(
          5
        );

      const score = await scorer.calculateRelevance(mockContent, longQuery);

      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });
  });
});
