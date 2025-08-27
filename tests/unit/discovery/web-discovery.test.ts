import { describe, expect, it, beforeEach, afterEach } from 'bun:test';
import { WebDiscovery } from '@/discovery/web-discovery.ts';
import { ContentSource } from '@/types/index.ts';

describe('Web Discovery', () => {
  let webDiscovery: WebDiscovery;

  beforeEach(() => {
    webDiscovery = new WebDiscovery();
  });

  afterEach(() => {
    // Cleanup if needed
  });

  it('should discover web content successfully', async () => {
    const query = 'TypeScript';
    const results = await webDiscovery.discover(query);

    expect(results).toBeDefined();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);

    // Verify structure matches our mock data
    const firstResult = results[0];
    expect(firstResult.title).toBeDefined();
    expect(firstResult.content).toBeDefined();
    expect([
      ContentSource.DOCUMENTATION,
      ContentSource.TUTORIAL,
      ContentSource.STACKOVERFLOW,
      ContentSource.GITHUB,
    ]).toContain(firstResult.source);
    expect(firstResult.url).toBeDefined();
    expect(firstResult.metadata).toBeDefined();
  });

  it('should return realistic web content structure', async () => {
    const query = 'JavaScript';
    const results = await webDiscovery.discover(query);

    const discoveredItem = results[0];

    // Verify same structure as mock data
    expect(discoveredItem).toHaveProperty('title');
    expect(discoveredItem).toHaveProperty('content');
    expect(discoveredItem).toHaveProperty('source');
    expect(discoveredItem).toHaveProperty('url');
    expect(discoveredItem).toHaveProperty('metadata');
    expect(discoveredItem).toHaveProperty('relevanceScore');
    expect(discoveredItem).toHaveProperty('tags');

    // Verify metadata structure matches
    expect(discoveredItem.metadata).toHaveProperty('domain');
    expect(discoveredItem.metadata).toHaveProperty('timestamp');
    expect(discoveredItem.metadata).toHaveProperty('source');
    expect(discoveredItem.metadata).toHaveProperty('type');
    expect(discoveredItem.metadata).toHaveProperty('url');
  });

  it('should filter content by relevance when requested', async () => {
    const query = 'React';
    const results = await webDiscovery.discover(query, { minRelevanceScore: 0.7 });

    expect(results.every(item => item.relevanceScore >= 0.7)).toBe(true);
  });

  it('should limit results when maxResults is specified', async () => {
    const query = 'Node.js';
    const maxResults = 3;
    const results = await webDiscovery.discover(query, { maxResults });

    expect(results.length).toBeLessThanOrEqual(maxResults);
  });

  it('should handle empty queries gracefully', async () => {
    const results = await webDiscovery.discover('');

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it('should include appropriate tags for web content', async () => {
    const query = 'javascript'; // This should match multiple items
    const results = await webDiscovery.discover(query);

    expect(results.length).toBeGreaterThan(0);

    const firstResult = results[0];
    expect(Array.isArray(firstResult.tags)).toBe(true);
    expect(firstResult.tags.length).toBeGreaterThan(0);

    // Web content should have web-related tags
    const webTags = ['web', 'frontend', 'javascript', 'development', 'tutorial', 'documentation'];
    const hasWebTag = firstResult.tags.some((tag: string) =>
      webTags.some(webTag => tag.toLowerCase().includes(webTag))
    );
    expect(hasWebTag).toBe(true);
  });

  it('should have realistic content length', async () => {
    const query = 'react'; // This should match React content
    const results = await webDiscovery.discover(query);

    expect(results.length).toBeGreaterThan(0);

    results.forEach(result => {
      expect(result.content.length).toBeGreaterThan(50); // Minimum content length
      expect(result.content.length).toBeLessThan(5000); // Maximum reasonable length
      expect(result.title.length).toBeGreaterThan(5);
      expect(result.title.length).toBeLessThan(200);
    });
  });

  it('should provide valid URLs', async () => {
    const query = 'typescript'; // This should match TypeScript content
    const results = await webDiscovery.discover(query);

    expect(results.length).toBeGreaterThan(0);

    results.forEach(result => {
      expect(result.url).toMatch(/^https?:\/\/.+/);
    });
  });

  it('should support different content domains', async () => {
    const query = 'api'; // This should match API content
    const results = await webDiscovery.discover(query);

    expect(results.length).toBeGreaterThan(0);

    // Should have content from various domains
    const domains = results.map(result => result.metadata.domain as string);
    const uniqueDomains = new Set(domains);

    expect(uniqueDomains.size).toBeGreaterThan(0); // At least some domains

    // Common web domains should be present
    const commonDomains = [
      'stackoverflow.blog',
      'medium.com',
      'dev.to',
      'react.dev',
      'docs.docker.com',
    ];
    const hasCommonDomain = domains.some(domain =>
      commonDomains.some(common => domain && domain.includes(common))
    );
    expect(hasCommonDomain).toBe(true);
  });
});
