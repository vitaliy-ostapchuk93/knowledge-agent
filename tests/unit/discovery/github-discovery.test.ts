/**
 * GitHub Discovery Service Tests
 * Test-driven development for GitHub content discovery
 */

import { describe, test, expect, beforeEach } from 'bun:test';
import { IContentDiscovery } from '@/interfaces/content-discovery.ts';
import { ContentSource, SearchOptions, ContentItem, ContentType, ContentResult } from '@/types';

// Mock implementation for testing
class MockGitHubDiscovery implements IContentDiscovery {
  async discover(query: string, _options?: Partial<SearchOptions>): Promise<ContentResult> {
    // Mock GitHub API response
    const mockItems: ContentItem[] = [
      {
        id: 'github-1',
        title: `${query} - GitHub Repository`,
        url: `https://github.com/example/${query.toLowerCase().replace(/\s+/g, '-')}`,
        content: `Mock GitHub repository for ${query}`,
        source: ContentSource.GITHUB,
        relevanceScore: 0.85,
        timestamp: new Date(),
        metadata: {
          author: 'example-user',
          tags: ['repository', 'github', ...query.toLowerCase().split(' ')],
          contentType: ContentType.CODE_SNIPPET,
          wordCount: 100,
          language: 'typescript',
          difficulty: 'intermediate' as const,
          publishDate: new Date('2024-01-01')
        }
      }
    ];

    return {
      items: mockItems,
      totalFound: mockItems.length,
      searchTime: 120,
      sources: [ContentSource.GITHUB]
    };
  }
}

describe('GitHub Discovery Service', () => {
  let githubDiscovery: IContentDiscovery;

  beforeEach(() => {
    githubDiscovery = new MockGitHubDiscovery();
  });

  test('should implement IContentDiscovery interface', () => {
    expect(githubDiscovery).toHaveProperty('discover');
    expect(typeof githubDiscovery.discover).toBe('function');
  });

  test('should discover GitHub repositories for query', async () => {
    const query = 'React components';
    const result = await githubDiscovery.discover(query);

    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('totalFound');
    expect(result).toHaveProperty('searchTime');
    expect(result).toHaveProperty('sources');
    expect(result.sources).toContain(ContentSource.GITHUB);
    expect(result.items.length).toBeGreaterThan(0);
  });

  test('should return GitHub-specific content metadata', async () => {
    const result = await githubDiscovery.discover('TypeScript utils');
    const item = result.items[0];

    expect(item.source).toBe(ContentSource.GITHUB);
    expect(item.metadata).toHaveProperty('author');
    expect(item.metadata).toHaveProperty('language');
    expect(item.metadata).toHaveProperty('tags');
    expect(Array.isArray(item.metadata.tags)).toBe(true);
  });

  test('should format GitHub URLs correctly', async () => {
    const result = await githubDiscovery.discover('React Server Components');
    const item = result.items[0];

    expect(item.url).toMatch(/^https:\/\/github\.com\//);
    expect(item.url).toContain('react-server-components');
  });

  test('should include relevant GitHub metadata', async () => {
    const query = 'machine learning';
    const result = await githubDiscovery.discover(query);
    const item = result.items[0];

    expect(typeof item.metadata.language).toBe('string');
    expect(Array.isArray(item.metadata.tags)).toBe(true);
    expect(item.metadata.tags).toContain('machine');
    expect(item.metadata.tags).toContain('learning');
  });

  test('should handle empty queries gracefully', async () => {
    const result = await githubDiscovery.discover('');
    expect(result.items).toBeDefined();
    expect(Array.isArray(result.items)).toBe(true);
  });

  test('should return proper ContentResult structure', async () => {
    const result = await githubDiscovery.discover('test query');
    
    expect(result).toHaveProperty('items');
    expect(result).toHaveProperty('totalFound');
    expect(result).toHaveProperty('searchTime');
    expect(result).toHaveProperty('sources');
    
    expect(Array.isArray(result.items)).toBe(true);
    expect(typeof result.totalFound).toBe('number');
    expect(typeof result.searchTime).toBe('number');
    expect(Array.isArray(result.sources)).toBe(true);
  });
});
