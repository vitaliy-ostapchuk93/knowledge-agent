/**
 * KnowledgeLinkingEngine Graph Export Tests
 * Tests for knowledge graph export and clustering functionality
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { KnowledgeLinkingEngine } from '@/core/knowledge-linking-engine.ts';
import { DiscoveredContent, ContentSource } from '@/types/index.ts';

describe('KnowledgeLinkingEngine - Graph Export', () => {
  let linkingEngine: KnowledgeLinkingEngine;

  beforeEach(() => {
    linkingEngine = new KnowledgeLinkingEngine();
  });

  it('should export knowledge graph with proper structure', async () => {
    const content1: DiscoveredContent = {
      id: 'test-1',
      title: 'Content 1',
      content: 'This is the first piece of content about programming.',
      url: 'https://example.com/1',
      source: ContentSource.LOCAL_FILE,
      tags: ['programming'],
      relevanceScore: 0.8,
      metadata: {},
    };

    const content2: DiscoveredContent = {
      id: 'test-2',
      title: 'Content 2',
      content: 'This is the second piece of content about programming and algorithms.',
      url: 'https://example.com/2',
      source: ContentSource.LOCAL_FILE,
      tags: ['programming', 'algorithms'],
      relevanceScore: 0.9,
      metadata: {},
    };

    linkingEngine.addContent(content1);
    linkingEngine.addContent(content2);

    const graph = linkingEngine.exportGraph();

    expect(graph).toHaveProperty('nodes');
    expect(graph).toHaveProperty('links');
    expect(graph).toHaveProperty('clusters');

    expect(graph.nodes.size).toBe(2);
    expect(graph.nodes.has('test-1')).toBe(true);
    expect(graph.nodes.has('test-2')).toBe(true);
  });

  it('should handle clustering of related content', async () => {
    const mlContent1: DiscoveredContent = {
      id: 'ml-1',
      title: 'Machine Learning Introduction',
      content: 'Machine learning is a subset of artificial intelligence.',
      url: 'https://example.com/ml-intro',
      source: ContentSource.WEB,
      tags: ['machine-learning', 'ai'],
      relevanceScore: 0.8,
      metadata: {},
    };

    const mlContent2: DiscoveredContent = {
      id: 'ml-2',
      title: 'Deep Learning Basics',
      content: 'Deep learning uses neural networks with multiple layers.',
      url: 'https://example.com/deep-learning',
      source: ContentSource.WEB,
      tags: ['deep-learning', 'neural-networks'],
      relevanceScore: 0.9,
      metadata: {},
    };

    linkingEngine.addContent(mlContent1);
    linkingEngine.addContent(mlContent2);

    const graph = linkingEngine.exportGraph();

    // Should detect clusters of related content
    expect(graph.clusters).toBeDefined();
    expect(Array.isArray(graph.clusters)).toBe(true);
  });
});
