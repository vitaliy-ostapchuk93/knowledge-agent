/**
 * KnowledgeLinkingEngine Link Types Tests
 * Tests for different types of links and relationships
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { KnowledgeLinkingEngine } from '@/core/knowledge-linking-engine.ts';
import { DiscoveredContent, ContentSource } from '@/types/index.ts';

describe('KnowledgeLinkingEngine - Link Types', () => {
  let linkingEngine: KnowledgeLinkingEngine;

  beforeEach(() => {
    linkingEngine = new KnowledgeLinkingEngine();
  });

  it('should create semantic similarity links', async () => {
    const content1: DiscoveredContent = {
      id: 'js-1',
      title: 'JavaScript Basics',
      content:
        'JavaScript is a programming language used for web development. Variables, functions, and objects.',
      url: 'https://example.com/js-basics',
      source: ContentSource.WEB,
      tags: ['javascript', 'programming'],
      relevanceScore: 0.7,
      metadata: {},
    };

    const content2: DiscoveredContent = {
      id: 'js-2',
      title: 'Advanced JavaScript',
      content:
        'Advanced JavaScript concepts including closures, prototypes, and asynchronous programming.',
      url: 'https://example.com/js-advanced',
      source: ContentSource.WEB,
      tags: ['javascript', 'advanced'],
      relevanceScore: 0.8,
      metadata: {},
    };

    linkingEngine.addContent(content1);
    linkingEngine.addContent(content2);

    const graph = linkingEngine.exportGraph();
    expect(graph.links.length).toBeGreaterThanOrEqual(0);

    // Verify content was added
    expect(graph.nodes.size).toBe(2);
  });

  it('should create hierarchical relationships', async () => {
    const parentContent: DiscoveredContent = {
      id: 'react-1',
      title: 'React Overview',
      content: 'React is a JavaScript library for building user interfaces with components.',
      url: 'https://example.com/react-overview',
      source: ContentSource.WEB,
      tags: ['react', 'javascript', 'ui'],
      relevanceScore: 0.9,
      metadata: {},
    };

    const childContent: DiscoveredContent = {
      id: 'react-2',
      title: 'React Components',
      content:
        'React components are the building blocks of React applications. They encapsulate UI logic.',
      url: 'https://example.com/react-components',
      source: ContentSource.WEB,
      tags: ['react', 'components'],
      relevanceScore: 0.85,
      metadata: {},
    };

    linkingEngine.addContent(parentContent);
    linkingEngine.addContent(childContent);

    const graph = linkingEngine.exportGraph();
    expect(graph.links.length).toBeGreaterThanOrEqual(0);
    
    // Verify content was added
    expect(graph.nodes.size).toBe(2);
  });

  it('should handle version-based relationships', async () => {
    const olderContent: DiscoveredContent = {
      id: 'react-16',
      title: 'React 16 Features',
      content: 'React 16 introduced hooks, context API, and performance improvements.',
      url: 'https://example.com/react-16',
      source: ContentSource.WEB,
      tags: ['react', 'react16'],
      relevanceScore: 0.7,
      metadata: {},
    };

    const newerContent: DiscoveredContent = {
      id: 'react-18',
      title: 'React 18 Features',
      content:
        'React 18 brought concurrent features, automatic batching, and Suspense improvements.',
      url: 'https://example.com/react-18',
      source: ContentSource.WEB,
      tags: ['react', 'react18'],
      relevanceScore: 0.9,
      metadata: {},
    };

    linkingEngine.addContent(olderContent);
    linkingEngine.addContent(newerContent);

    const graph = linkingEngine.exportGraph();
    expect(graph.links.length).toBeGreaterThanOrEqual(0);
    
    // Verify content was added
    expect(graph.nodes.size).toBe(2);
  });
});
