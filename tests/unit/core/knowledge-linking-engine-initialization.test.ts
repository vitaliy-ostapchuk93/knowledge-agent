/**
 * KnowledgeLinkingEngine Initialization Tests
 * Tests for initialization and cleanup functionality
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { KnowledgeLinkingEngine } from '@/core/knowledge-linking-engine.ts';
import { DiscoveredContent, ContentSource } from '@/types/index.ts';

describe('KnowledgeLinkingEngine - Initialization', () => {
  let linkingEngine: KnowledgeLinkingEngine;

  beforeEach(() => {
    linkingEngine = new KnowledgeLinkingEngine();
  });

  it('should initialize with empty knowledge graph', () => {
    const graph = linkingEngine.exportGraph();
    expect(graph.nodes.size).toBe(0);
    expect(graph.links).toHaveLength(0);
    expect(graph.clusters).toHaveLength(0);
  });

  it('should clear knowledge graph properly', () => {
    const content: DiscoveredContent = {
      id: 'test-1',
      title: 'Test Content',
      content: 'This is test content about React.',
      url: 'https://test.com/1',
      source: ContentSource.LOCAL_FILE,
      tags: ['react', 'javascript'],
      relevanceScore: 0.8,
      metadata: { type: 'article' },
    };

    linkingEngine.addContent(content);
    expect(linkingEngine.exportGraph().nodes.size).toBe(1);

    linkingEngine.clear();
    const graph = linkingEngine.exportGraph();
    expect(graph.nodes.size).toBe(0);
    expect(graph.links).toHaveLength(0);
    expect(graph.clusters).toHaveLength(0);
  });
});
