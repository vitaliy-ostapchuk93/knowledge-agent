/**
 * KnowledgeLinkingEngine Edge Cases Tests
 * Tests for error handling and edge cases
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { KnowledgeLinkingEngine } from '@/core/knowledge-linking-engine.ts';
import { DiscoveredContent, ContentSource } from '@/types/index.ts';

describe('KnowledgeLinkingEngine - Edge Cases', () => {
  let linkingEngine: KnowledgeLinkingEngine;

  beforeEach(() => {
    linkingEngine = new KnowledgeLinkingEngine();
  });

  it('should handle content with no tags', async () => {
    const content: DiscoveredContent = {
      id: 'no-tags',
      title: 'Content Without Tags',
      content: 'This content has no tags but should still be processed.',
      url: 'https://example.com/no-tags',
      source: ContentSource.WEB,
      tags: [],
      relevanceScore: 0.5,
      metadata: {},
    };

    expect(() => linkingEngine.addContent(content)).not.toThrow();

    const graph = linkingEngine.exportGraph();
    expect(graph.nodes.size).toBe(1);
    expect(graph.nodes.has('no-tags')).toBe(true);
  });

  it('should handle content with empty content field', async () => {
    const content: DiscoveredContent = {
      id: 'empty-content',
      title: 'Empty Content',
      content: '',
      url: 'https://example.com/empty',
      source: ContentSource.WEB,
      tags: ['test'],
      relevanceScore: 0.1,
      metadata: {},
    };

    expect(() => linkingEngine.addContent(content)).not.toThrow();

    const graph = linkingEngine.exportGraph();
    expect(graph.nodes.size).toBe(1);
  });

  it('should handle duplicate content gracefully', async () => {
    const content: DiscoveredContent = {
      id: 'duplicate-test',
      title: 'Original',
      content: 'This is original content.',
      url: 'https://example.com/original',
      source: ContentSource.WEB,
      tags: ['test'],
      relevanceScore: 0.8,
      metadata: {},
    };

    const updatedContent: DiscoveredContent = {
      id: 'duplicate-test', // Same ID
      title: 'Updated',
      content: 'This is updated content.',
      url: 'https://example.com/updated',
      source: ContentSource.WEB,
      tags: ['test', 'updated'],
      relevanceScore: 0.9,
      metadata: {},
    };

    linkingEngine.addContent(content);
    linkingEngine.addContent(updatedContent);

    const graph = linkingEngine.exportGraph();
    expect(graph.nodes.size).toBe(1); // Should not duplicate
  });

  it('should handle very large content efficiently', async () => {
    const largeContent = 'word '.repeat(10000); // 10k words

    const content: DiscoveredContent = {
      id: 'large-content',
      title: 'Large Document',
      content: largeContent,
      url: 'https://example.com/large',
      source: ContentSource.WEB,
      tags: ['large', 'document'],
      relevanceScore: 0.7,
      metadata: {},
    };

    const startTime = Date.now();
    linkingEngine.addContent(content);
    const processingTime = Date.now() - startTime;

    // Should process within reasonable time (< 1 second)
    expect(processingTime).toBeLessThan(1000);

    const graph = linkingEngine.exportGraph();
    expect(graph.nodes.size).toBe(1);
  });
});
