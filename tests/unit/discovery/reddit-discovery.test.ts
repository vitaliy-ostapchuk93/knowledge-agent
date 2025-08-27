import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { RedditDiscovery } from '@/discovery/reddit-discovery.ts';
import { ContentSource } from '@/types/index.ts';

describe('Reddit Discovery', () => {
  let redditDiscovery: RedditDiscovery;

  beforeEach(() => {
    redditDiscovery = new RedditDiscovery();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  it('should discover Reddit content successfully', async () => {
    const query = 'react'; // This should match React content
    const results = await redditDiscovery.discover(query);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // Verify structure
    const firstResult = results[0];
    expect(firstResult.title).toBeDefined();
    expect(firstResult.content).toBeDefined();
    expect(firstResult.source).toBe(ContentSource.REDDIT);
    expect(firstResult.url).toBeDefined();
    expect(firstResult.metadata).toBeDefined();
  });

  it('should have Reddit-specific metadata', async () => {
    const query = 'programming';
    const results = await redditDiscovery.discover(query);

    expect(results.length).toBeGreaterThan(0);

    const firstResult = results[0];
    expect(firstResult.metadata).toHaveProperty('subreddit');
    expect(firstResult.metadata).toHaveProperty('author');
    expect(firstResult.metadata).toHaveProperty('score');
    expect(firstResult.metadata).toHaveProperty('commentCount');
    expect(firstResult.metadata).toHaveProperty('createdAt');
  });

  it('should filter by subreddit', async () => {
    const query = 'web';
    const subreddits = ['programming'];
    const results = await redditDiscovery.discover(query, { subreddits });

    expect(Array.isArray(results)).toBe(true);

    if (results.length > 0) {
      results.forEach(result => {
        const subreddit = result.metadata.subreddit as string;
        expect(subreddit).toBeDefined();
        expect(subreddits.some(sub => subreddit.toLowerCase().includes(sub.toLowerCase()))).toBe(
          true
        );
      });
    }
  });

  it('should sort by different criteria', async () => {
    const query = 'react';
    const hotResults = await redditDiscovery.discover(query, { sortBy: 'hot' });
    const topResults = await redditDiscovery.discover(query, { sortBy: 'top' });
    const newResults = await redditDiscovery.discover(query, { sortBy: 'new' });

    expect(Array.isArray(hotResults)).toBe(true);
    expect(Array.isArray(topResults)).toBe(true);
    expect(Array.isArray(newResults)).toBe(true);

    if (topResults.length > 1) {
      // Top results should be sorted by score
      const firstScore = (topResults[0].metadata.score as number) || 0;
      const secondScore = (topResults[1].metadata.score as number) || 0;
      expect(firstScore).toBeGreaterThanOrEqual(secondScore);
    }
  });

  it('should get hot posts', async () => {
    const hotPosts = await redditDiscovery.getHotPosts(undefined, { maxResults: 3 });

    expect(Array.isArray(hotPosts)).toBe(true);
    expect(hotPosts.length).toBeLessThanOrEqual(3);

    hotPosts.forEach(post => {
      expect(post.source).toBe(ContentSource.REDDIT);
      expect(post.metadata.score).toBeDefined();
    });
  });

  it('should get top posts', async () => {
    const topPosts = await redditDiscovery.getTopPosts('day', { maxResults: 3 });

    expect(Array.isArray(topPosts)).toBe(true);
    expect(topPosts.length).toBeLessThanOrEqual(3);

    if (topPosts.length > 0) {
      topPosts.forEach(post => {
        expect(post.source).toBe(ContentSource.REDDIT);
        const score = (post.metadata.score as number) || 0;
        expect(score).toBeGreaterThan(50); // Should have high scores
      });
    }
  });

  it('should get subreddit posts', async () => {
    const subreddit = 'javascript';
    const posts = await redditDiscovery.getSubredditPosts(subreddit, { maxResults: 2 });

    expect(Array.isArray(posts)).toBe(true);
    expect(posts.length).toBeLessThanOrEqual(2);

    if (posts.length > 0) {
      posts.forEach(post => {
        const postSubreddit = (post.metadata.subreddit as string) || '';
        expect(postSubreddit.toLowerCase()).toContain(subreddit.toLowerCase());
      });
    }
  });

  it('should handle empty queries gracefully', async () => {
    const results = await redditDiscovery.discover('');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it('should apply max results limit', async () => {
    const query = 'frontend';
    const maxResults = 2;
    const results = await redditDiscovery.discover(query, { maxResults });

    expect(results.length).toBeLessThanOrEqual(maxResults);
  });

  it('should filter by relevance score', async () => {
    const query = 'nodejs';
    const minScore = 0.8;
    const results = await redditDiscovery.discover(query, { minRelevanceScore: minScore });

    results.forEach(result => {
      expect(result.relevanceScore).toBeGreaterThanOrEqual(minScore);
    });
  });

  it('should have valid Reddit URLs', async () => {
    const query = 'typescript';
    const results = await redditDiscovery.discover(query);

    if (results.length > 0) {
      results.forEach(result => {
        expect(result.url).toMatch(/^https:\/\/(www\.)?reddit\.com\/r\//);
      });
    }
  });

  it('should have appropriate Reddit tags', async () => {
    const query = 'backend';
    const results = await redditDiscovery.discover(query);

    if (results.length > 0) {
      const firstResult = results[0];
      expect(Array.isArray(firstResult.tags)).toBe(true);
      expect(firstResult.tags.length).toBeGreaterThan(0);

      // Should have reddit-related tags
      const redditTags = ['reddit', 'discussion', 'community', 'programming', 'development'];
      const hasRedditTag = firstResult.tags.some((tag: string) =>
        redditTags.some(redditTag => tag.toLowerCase().includes(redditTag))
      );
      expect(hasRedditTag).toBe(true);
    }
  });
});
