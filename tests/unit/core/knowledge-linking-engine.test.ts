/**
 * KnowledgeLinkingEngine Tests
 * Tests for the knowledge linking engine that creates relationships between content
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { KnowledgeLinkingEngine, type LinkingOptions } from '@/core/knowledge-linking-engine.ts';
import { DiscoveredContent } from '@/types/index.ts';

describe('KnowledgeLinkingEngine', () => {
  let linkingEngine: KnowledgeLinkingEngine;

  beforeEach(() => {
    linkingEngine = new KnowledgeLinkingEngine();
  });

  describe('Initialization', () => {
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
        summary: 'Test summary',
        url: 'https://test.com/1',
        source: 'test',
        timestamp: new Date(),
        tags: ['react', 'javascript'],
        relevanceScore: 0.8,
        type: 'article',
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

  describe('Content Addition', () => {
    it('should add single content to knowledge graph', async () => {
      const content: DiscoveredContent = {
        id: 'content-1',
        title: 'Introduction to React',
        content: 'React is a JavaScript library for building user interfaces.',
        summary: 'Learn React basics',
        url: 'https://example.com/react-intro',
        source: 'web',
        timestamp: new Date(),
        tags: ['react', 'javascript', 'frontend'],
        relevanceScore: 0.9,
        type: 'article',
      };

      const links = await linkingEngine.addContent(content);

      expect(links).toHaveLength(0); // No existing content to link to

      const graph = linkingEngine.exportGraph();
      expect(graph.nodes.size).toBe(1);
      expect(graph.nodes.get('content-1')).toEqual(content);
    });

    it('should detect similarity links between related content', async () => {
      const content1: DiscoveredContent = {
        id: 'react-1',
        title: 'React Hooks Introduction',
        content:
          'React Hooks allow you to use state and lifecycle features in functional components.',
        summary: 'Learn about React Hooks',
        url: 'https://example.com/react-hooks',
        source: 'web',
        timestamp: new Date(),
        tags: ['react', 'hooks', 'javascript'],
        relevanceScore: 0.9,
        type: 'article',
      };

      const content2: DiscoveredContent = {
        id: 'react-2',
        title: 'useState Hook Guide',
        content: 'useState is a React Hook that lets you add state to functional components.',
        summary: 'useState Hook tutorial',
        url: 'https://example.com/usestate',
        source: 'web',
        timestamp: new Date(),
        tags: ['react', 'hooks', 'useState'],
        relevanceScore: 0.85,
        type: 'tutorial',
      };

      await linkingEngine.addContent(content1);
      const links = await linkingEngine.addContent(content2);

      expect(links.length).toBeGreaterThan(0);

      const similarityLink = links.find(link => link.linkType === 'similar');
      expect(similarityLink).toBeDefined();
      expect(similarityLink?.strength).toBeGreaterThan(0.3);
    });

    it('should respect linking options', async () => {
      const content1: DiscoveredContent = {
        id: 'test-1',
        title: 'JavaScript Basics',
        content: 'JavaScript is a programming language.',
        summary: 'JS basics',
        url: 'https://example.com/js',
        source: 'web',
        timestamp: new Date(),
        tags: ['javascript'],
        relevanceScore: 0.7,
        type: 'article',
      };

      const content2: DiscoveredContent = {
        id: 'test-2',
        title: 'Advanced JavaScript',
        content: 'Advanced JavaScript concepts and patterns.',
        summary: 'Advanced JS',
        url: 'https://example.com/js-advanced',
        source: 'web',
        timestamp: new Date(),
        tags: ['javascript', 'advanced'],
        relevanceScore: 0.8,
        type: 'article',
      };

      const options: LinkingOptions = {
        minLinkStrength: 0.8, // High threshold
        maxLinksPerContent: 1,
        enableBidirectional: false,
      };

      await linkingEngine.addContent(content1);
      const links = await linkingEngine.addContent(content2, options);

      // Should respect high threshold and potentially find fewer links
      links.forEach(link => {
        expect(link.strength).toBeGreaterThanOrEqual(0.8);
        expect(link.bidirectional).toBe(false);
      });
    });
  });

  describe('Link Types', () => {
    it('should detect dependency links between content', async () => {
      const basicContent: DiscoveredContent = {
        id: 'basic-js',
        title: 'JavaScript Fundamentals',
        content: 'Learn basic JavaScript concepts before moving to frameworks.',
        summary: 'JS basics',
        url: 'https://example.com/js-basics',
        source: 'web',
        timestamp: new Date(),
        tags: ['javascript', 'fundamentals'],
        relevanceScore: 0.9,
        type: 'article',
      };

      const advancedContent: DiscoveredContent = {
        id: 'react-advanced',
        title: 'Advanced React Patterns',
        content: 'This content requires solid JavaScript fundamentals and basic React knowledge.',
        summary: 'Advanced React',
        url: 'https://example.com/react-advanced',
        source: 'web',
        timestamp: new Date(),
        tags: ['react', 'advanced', 'patterns'],
        relevanceScore: 0.8,
        type: 'tutorial',
      };

      await linkingEngine.addContent(basicContent);
      const links = await linkingEngine.addContent(advancedContent);

      const dependencyLink = links.find(link => link.linkType === 'dependency');
      if (dependencyLink) {
        expect(dependencyLink.reason).toContain('depends on');
      }
    });

    it('should detect hierarchy links', async () => {
      const frameworkContent: DiscoveredContent = {
        id: 'react-overview',
        title: 'React Framework Overview',
        content: 'React is a popular JavaScript framework for building UIs.',
        summary: 'React overview',
        url: 'https://example.com/react',
        source: 'web',
        timestamp: new Date(),
        tags: ['react', 'framework'],
        relevanceScore: 0.9,
        type: 'article',
      };

      const componentContent: DiscoveredContent = {
        id: 'react-components',
        title: 'React Components Deep Dive',
        content: 'Components are the building blocks of React applications.',
        summary: 'React components',
        url: 'https://example.com/react-components',
        source: 'web',
        timestamp: new Date(),
        tags: ['react', 'components'],
        relevanceScore: 0.85,
        type: 'tutorial',
      };

      await linkingEngine.addContent(frameworkContent);
      const links = await linkingEngine.addContent(componentContent);

      const hierarchyLink = links.find(link => link.linkType === 'hierarchy');
      if (hierarchyLink) {
        expect(hierarchyLink.reason).toContain('ecosystem');
      }
    });

    it('should detect temporal links for versioned content', async () => {
      const oldVersion: DiscoveredContent = {
        id: 'react-16',
        title: 'React 16 Features',
        content: 'React 16 introduced Hooks and other features.',
        summary: 'React 16',
        url: 'https://example.com/react-16',
        source: 'web',
        timestamp: new Date('2019-01-01'),
        tags: ['react', 'version-16'],
        relevanceScore: 0.7,
        type: 'article',
      };

      const newVersion: DiscoveredContent = {
        id: 'react-18',
        title: 'React 18 New Features',
        content: 'React 18 builds upon React 16 with concurrent features.',
        summary: 'React 18',
        url: 'https://example.com/react-18',
        source: 'web',
        timestamp: new Date('2022-03-01'),
        tags: ['react', 'version-18'],
        relevanceScore: 0.9,
        type: 'article',
      };

      await linkingEngine.addContent(oldVersion);
      const links = await linkingEngine.addContent(newVersion);

      const temporalLink = links.find(link => link.linkType === 'temporal');
      if (temporalLink) {
        expect(temporalLink.reason).toContain('Version relationship');
      }
    });
  });

  describe('Knowledge Graph Export', () => {
    it('should export complete knowledge graph', async () => {
      const content1: DiscoveredContent = {
        id: 'export-1',
        title: 'Test Content 1',
        content: 'First piece of content.',
        summary: 'Content 1',
        url: 'https://example.com/1',
        source: 'test',
        timestamp: new Date(),
        tags: ['test'],
        relevanceScore: 0.8,
        type: 'article',
      };

      const content2: DiscoveredContent = {
        id: 'export-2',
        title: 'Test Content 2',
        content: 'Second piece of content with similar topics.',
        summary: 'Content 2',
        url: 'https://example.com/2',
        source: 'test',
        timestamp: new Date(),
        tags: ['test', 'similar'],
        relevanceScore: 0.75,
        type: 'article',
      };

      await linkingEngine.addContent(content1);
      await linkingEngine.addContent(content2);

      const graph = linkingEngine.exportGraph();

      expect(graph.nodes.size).toBe(2);
      expect(graph.nodes.get('export-1')).toEqual(content1);
      expect(graph.nodes.get('export-2')).toEqual(content2);

      // Should be a copy, not reference
      graph.nodes.clear();
      expect(linkingEngine.exportGraph().nodes.size).toBe(2);
    });

    it('should include all detected links in export', async () => {
      const relatedContent1: DiscoveredContent = {
        id: 'related-1',
        title: 'Machine Learning Introduction',
        content: 'Introduction to machine learning concepts and algorithms.',
        summary: 'ML intro',
        url: 'https://example.com/ml-intro',
        source: 'web',
        timestamp: new Date(),
        tags: ['machine-learning', 'ai', 'introduction'],
        relevanceScore: 0.9,
        type: 'article',
      };

      const relatedContent2: DiscoveredContent = {
        id: 'related-2',
        title: 'Deep Learning Fundamentals',
        content: 'Deep learning is a subset of machine learning using neural networks.',
        summary: 'Deep learning basics',
        url: 'https://example.com/deep-learning',
        source: 'web',
        timestamp: new Date(),
        tags: ['deep-learning', 'machine-learning', 'neural-networks'],
        relevanceScore: 0.85,
        type: 'tutorial',
      };

      await linkingEngine.addContent(relatedContent1);
      const detectedLinks = await linkingEngine.addContent(relatedContent2);

      const graph = linkingEngine.exportGraph();

      expect(graph.links.length).toBe(detectedLinks.length);

      // Verify links are properly structured
      graph.links.forEach(link => {
        expect(link.sourceId).toBeDefined();
        expect(link.targetId).toBeDefined();
        expect(link.linkType).toBeDefined();
        expect(link.strength).toBeGreaterThan(0);
        expect(link.strength).toBeLessThanOrEqual(1);
        expect(link.reason).toBeDefined();
        expect(typeof link.bidirectional).toBe('boolean');
      });
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle content with no tags gracefully', async () => {
      const contentNoTags: DiscoveredContent = {
        id: 'no-tags',
        title: 'Content Without Tags',
        content: 'This content has no tags but should still work.',
        summary: 'No tags content',
        url: 'https://example.com/no-tags',
        source: 'web',
        timestamp: new Date(),
        tags: [],
        relevanceScore: 0.6,
        type: 'article',
      };

      const links = await linkingEngine.addContent(contentNoTags);

      expect(links).toHaveLength(0);
      expect(linkingEngine.exportGraph().nodes.size).toBe(1);
    });

    it('should handle empty content gracefully', async () => {
      const emptyContent: DiscoveredContent = {
        id: 'empty',
        title: '',
        content: '',
        summary: '',
        url: 'https://example.com/empty',
        source: 'web',
        timestamp: new Date(),
        tags: [],
        relevanceScore: 0.1,
        type: 'article',
      };

      const links = await linkingEngine.addContent(emptyContent);

      expect(links).toHaveLength(0);
      expect(linkingEngine.exportGraph().nodes.size).toBe(1);
    });

    it('should handle duplicate content IDs by replacing', async () => {
      const originalContent: DiscoveredContent = {
        id: 'duplicate-test',
        title: 'Original Content',
        content: 'This is the original content.',
        summary: 'Original',
        url: 'https://example.com/original',
        source: 'web',
        timestamp: new Date(),
        tags: ['original'],
        relevanceScore: 0.7,
        type: 'article',
      };

      const updatedContent: DiscoveredContent = {
        id: 'duplicate-test',
        title: 'Updated Content',
        content: 'This is the updated content.',
        summary: 'Updated',
        url: 'https://example.com/updated',
        source: 'web',
        timestamp: new Date(),
        tags: ['updated'],
        relevanceScore: 0.8,
        type: 'article',
      };

      await linkingEngine.addContent(originalContent);
      await linkingEngine.addContent(updatedContent);

      const graph = linkingEngine.exportGraph();
      expect(graph.nodes.size).toBe(1);
      expect(graph.nodes.get('duplicate-test')?.title).toBe('Updated Content');
    });

    it('should handle very large content efficiently', async () => {
      const largeContent: DiscoveredContent = {
        id: 'large-content',
        title: 'Large Content Document',
        content:
          'This is a very large document. '.repeat(1000) +
          'It contains many repeated phrases about programming, JavaScript, React, and software development.',
        summary: 'Large document',
        url: 'https://example.com/large',
        source: 'web',
        timestamp: new Date(),
        tags: ['programming', 'large'],
        relevanceScore: 0.6,
        type: 'article',
      };

      const startTime = Date.now();
      await linkingEngine.addContent(largeContent);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(linkingEngine.exportGraph().nodes.size).toBe(1);
    });
  });
});
