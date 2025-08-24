import { describe, it, expect } from 'bun:test';
import { MockDataLoader } from '@/tests/utils/mock-data-loader';
import { ContentSource, DiscoveredContent } from '@/types';

describe('Mock Data Loader', () => {
  it('should load web content successfully', () => {
    const webContent = MockDataLoader.loadWebContent();

    expect(webContent).toHaveLength(5);
    expect(webContent[0].source).toBe(ContentSource.WEB);
    expect(webContent[0].title).toContain('React Hooks');
    expect(webContent[0].metadata.domain).toBe('react.dev');
  });

  it('should load YouTube content successfully', () => {
    const youtubeContent = MockDataLoader.loadYouTubeContent();

    expect(youtubeContent).toHaveLength(5);
    expect(youtubeContent[0].source).toBe(ContentSource.YOUTUBE);
    expect(youtubeContent[0].title).toContain('React Hooks');
    expect(youtubeContent[0].metadata.channel).toBe('React Mastery');
  });

  it('should load Reddit content successfully', () => {
    const redditContent = MockDataLoader.loadRedditContent();

    expect(redditContent).toHaveLength(5);
    expect(redditContent[0].source).toBe(ContentSource.REDDIT);
    expect(redditContent[0].metadata.subreddit).toBe('reactjs');
    expect(redditContent[0].metadata.score).toBeGreaterThan(0);
  });

  it('should load GitHub content successfully', () => {
    const githubContent = MockDataLoader.loadGitHubContent();

    expect(githubContent).toHaveLength(5);
    expect(githubContent[0].source).toBe(ContentSource.GITHUB);
    expect(githubContent[0].metadata.owner).toBe('react-hook-form');
    expect(githubContent[0].metadata.stars).toBeGreaterThan(0);
  });

  it('should load Stack Overflow content successfully', () => {
    const stackoverflowContent = MockDataLoader.loadStackOverflowContent();

    expect(stackoverflowContent).toHaveLength(5);
    expect(stackoverflowContent[0].source).toBe(ContentSource.STACKOVERFLOW);
    expect(stackoverflowContent[0].metadata.questionId).toBeDefined();
    expect(stackoverflowContent[0].metadata.score).toBeGreaterThan(0);
  });
  it('should get content by source type', () => {
    const webContent = MockDataLoader.getContentBySource(ContentSource.WEB);
    const youtubeContent = MockDataLoader.getContentBySource(ContentSource.YOUTUBE);

    expect(webContent).toHaveLength(5);
    expect(youtubeContent).toHaveLength(5);
    expect(webContent.every(item => item.source === ContentSource.WEB)).toBe(true);
    expect(youtubeContent.every(item => item.source === ContentSource.YOUTUBE)).toBe(true);
  });

  it('should search content by query', () => {
    const reactContent = MockDataLoader.searchContent('react');
    const typescriptContent = MockDataLoader.searchContent('typescript');

    expect(reactContent.length).toBeGreaterThan(0);
    expect(typescriptContent.length).toBeGreaterThan(0);

    // Check that results contain the search term
    reactContent.forEach(item => {
      const hasReactInTitle = item.title.toLowerCase().includes('react');
      const hasReactInContent = item.content.toLowerCase().includes('react');
      const hasReactInTags = item.tags.some(tag => tag.includes('react'));

      expect(hasReactInTitle || hasReactInContent || hasReactInTags).toBe(true);
    });
  });

  it('should search content by specific sources', () => {
    const webOnlyResults = MockDataLoader.searchContent('javascript', [ContentSource.WEB]);
    const multiSourceResults = MockDataLoader.searchContent('javascript', [
      ContentSource.WEB,
      ContentSource.YOUTUBE,
    ]);

    expect(webOnlyResults.every(item => item.source === ContentSource.WEB)).toBe(true);
    expect(multiSourceResults.length).toBeGreaterThanOrEqual(webOnlyResults.length);
  });

  it('should get content by tags', () => {
    const reactContent = MockDataLoader.getContentByTags(['react']);
    const typescriptContent = MockDataLoader.getContentByTags(['typescript']);
    const multiTagContent = MockDataLoader.getContentByTags(['react', 'typescript']);

    expect(reactContent.length).toBeGreaterThan(0);
    expect(typescriptContent.length).toBeGreaterThan(0);
    expect(multiTagContent.length).toBeGreaterThanOrEqual(
      Math.max(reactContent.length, typescriptContent.length)
    );
  });

  it('should get trending content', () => {
    const trending = MockDataLoader.getTrendingContent(3);

    expect(trending).toHaveLength(3);

    // Should be sorted by relevance score descending
    for (let i = 0; i < trending.length - 1; i++) {
      expect(trending[i].relevanceScore).toBeGreaterThanOrEqual(trending[i + 1].relevanceScore);
    }
  });

  it('should get random sample', () => {
    const randomSample = MockDataLoader.getRandomSample(5);
    const webSample = MockDataLoader.getRandomSample(3, ContentSource.WEB);

    expect(randomSample).toHaveLength(5);
    expect(webSample).toHaveLength(3);
    expect(webSample.every(item => item.source === ContentSource.WEB)).toBe(true);
  });

  it('should filter by relevance score range', () => {
    const highRelevance = MockDataLoader.filterByRelevanceScore(0.9, 1.0);
    const lowRelevance = MockDataLoader.filterByRelevanceScore(0.0, 0.8);

    expect(highRelevance.every(item => item.relevanceScore >= 0.9)).toBe(true);
    expect(lowRelevance.every(item => item.relevanceScore <= 0.8)).toBe(true);
  });

  it('should provide content statistics', () => {
    const stats = MockDataLoader.getContentStats();

    expect(stats.totalItems).toBe(25); // 5 items per source * 5 sources
    expect(stats.bySource['web']).toBe(5);
    expect(stats.bySource['youtube']).toBe(5);
    expect(stats.bySource['reddit']).toBe(5);
    expect(stats.bySource['github']).toBe(5);
    expect(stats.bySource['stackoverflow']).toBe(5);
    expect(stats.averageRelevanceScore).toBeGreaterThan(0);
    expect(stats.topTags).toHaveLength(10);
    expect(stats.topTags[0].count).toBeGreaterThan(0);
  });

  it('should have consistent data structure across all sources', () => {
    const allSources = [
      ContentSource.WEB,
      ContentSource.YOUTUBE,
      ContentSource.REDDIT,
      ContentSource.GITHUB,
      ContentSource.STACKOVERFLOW,
    ];

    allSources.forEach(source => {
      const content = MockDataLoader.getContentBySource(source);

      content.forEach(item => {
        expect(item.id).toBeDefined();
        expect(item.title).toBeDefined();
        expect(item.content).toBeDefined();
        expect(item.source).toBe(source);
        expect(item.metadata).toBeDefined();
        expect(item.relevanceScore).toBeGreaterThan(0);
        expect(item.relevanceScore).toBeLessThanOrEqual(1);
        expect(Array.isArray(item.tags)).toBe(true);
        expect(item.tags.length).toBeGreaterThan(0);
      });
    });
  });

  it('should have realistic metadata for each source type', () => {
    // Web content metadata
    const webContent = MockDataLoader.loadWebContent();
    expect(webContent[0].metadata.domain).toBeDefined();
    expect(webContent[0].metadata.contentType).toBeDefined();
    expect(webContent[0].metadata.scrapedAt).toBeDefined();

    // YouTube content metadata
    const youtubeContent = MockDataLoader.loadYouTubeContent();
    expect(youtubeContent[0].metadata.channel).toBeDefined();
    expect(youtubeContent[0].metadata.duration).toBeDefined();
    expect(youtubeContent[0].metadata.viewCount).toBeGreaterThan(0);

    // Reddit content metadata
    const redditContent = MockDataLoader.loadRedditContent();
    expect(redditContent[0].metadata.subreddit).toBeDefined();
    expect(redditContent[0].metadata.score).toBeGreaterThan(0);
    expect(redditContent[0].metadata.commentCount).toBeGreaterThan(0);

    // GitHub content metadata
    const githubContent = MockDataLoader.loadGitHubContent();
    expect(githubContent[0].metadata.owner).toBeDefined();
    expect(githubContent[0].metadata.stars).toBeGreaterThan(0);
    expect(githubContent[0].metadata.language).toBeDefined();

    // Stack Overflow content metadata
    const stackoverflowContent = MockDataLoader.loadStackOverflowContent();
    expect(stackoverflowContent[0].metadata.questionId).toBeDefined();
    expect(stackoverflowContent[0].metadata.score).toBeGreaterThan(0);
    expect(stackoverflowContent[0].metadata.answerCount).toBeGreaterThan(0);
  });
});
