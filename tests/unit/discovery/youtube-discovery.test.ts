import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { YouTubeDiscovery } from '@/discovery/youtube-discovery.ts';
import { ContentSource } from '@/types/index.ts';

describe('YouTube Discovery', () => {
  let youtubeDiscovery: YouTubeDiscovery;

  beforeEach(() => {
    youtubeDiscovery = new YouTubeDiscovery();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  it('should discover YouTube content successfully', async () => {
    const query = 'javascript';
    const results = await youtubeDiscovery.discover(query);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // Verify structure
    const firstResult = results[0];
    expect(firstResult.title).toBeDefined();
    expect(firstResult.content).toBeDefined();
    expect(firstResult.source).toBe(ContentSource.YOUTUBE);
    expect(firstResult.url).toBeDefined();
    expect(firstResult.metadata).toBeDefined();
  });

  it('should have YouTube-specific metadata', async () => {
    const query = 'tutorial';
    const results = await youtubeDiscovery.discover(query);

    expect(results.length).toBeGreaterThan(0);

    const firstResult = results[0];
    expect(firstResult.metadata).toHaveProperty('channel');
    expect(firstResult.metadata).toHaveProperty('duration');
    expect(firstResult.metadata).toHaveProperty('viewCount');
    expect(firstResult.metadata).toHaveProperty('likeCount');
    expect(firstResult.metadata).toHaveProperty('uploadDate');
  });

  it('should filter by video length', async () => {
    const query = 'programming';
    const shortResults = await youtubeDiscovery.discover(query, { videoLength: 'short' });
    const longResults = await youtubeDiscovery.discover(query, { videoLength: 'long' });

    // Should return different results for different length filters
    expect(Array.isArray(shortResults)).toBe(true);
    expect(Array.isArray(longResults)).toBe(true);
  });

  it('should sort by different criteria', async () => {
    const query = 'react';
    const relevanceResults = await youtubeDiscovery.discover(query, { sortBy: 'relevance' });
    const viewResults = await youtubeDiscovery.discover(query, { sortBy: 'view_count' });

    expect(Array.isArray(relevanceResults)).toBe(true);
    expect(Array.isArray(viewResults)).toBe(true);

    if (relevanceResults.length > 0 && viewResults.length > 0) {
      // Results should be sorted differently
      expect(relevanceResults[0].relevanceScore).toBeGreaterThan(0);
      expect(viewResults[0].metadata.viewCount).toBeDefined();
    }
  });

  it('should get trending videos', async () => {
    const trending = await youtubeDiscovery.getTrendingVideos({ maxResults: 5 });

    expect(Array.isArray(trending)).toBe(true);
    expect(trending.length).toBeLessThanOrEqual(5);

    if (trending.length > 1) {
      // Should be sorted by view count
      const firstViews = (trending[0].metadata.viewCount as number) || 0;
      const secondViews = (trending[1].metadata.viewCount as number) || 0;
      expect(firstViews).toBeGreaterThanOrEqual(secondViews);
    }
  });

  it('should handle empty queries gracefully', async () => {
    const results = await youtubeDiscovery.discover('');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it('should apply max results limit', async () => {
    const query = 'web development';
    const maxResults = 2;
    const results = await youtubeDiscovery.discover(query, { maxResults });

    expect(results.length).toBeLessThanOrEqual(maxResults);
  });

  it('should filter by relevance score', async () => {
    const query = 'coding';
    const minScore = 0.8;
    const results = await youtubeDiscovery.discover(query, { minRelevanceScore: minScore });

    results.forEach(result => {
      expect(result.relevanceScore).toBeGreaterThanOrEqual(minScore);
    });
  });

  it('should have valid YouTube URLs', async () => {
    const query = 'node';
    const results = await youtubeDiscovery.discover(query);

    if (results.length > 0) {
      results.forEach(result => {
        expect(result.url).toMatch(/^https:\/\/(www\.)?(youtube\.com\/watch|youtu\.be\/)/);
      });
    }
  });
});
