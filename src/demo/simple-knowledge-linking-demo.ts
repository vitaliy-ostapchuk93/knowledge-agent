/**
 * Simple Knowledge Linking Demo
 * Demonstrates the KnowledgeLinkingEngine's addContent functionality
 */

import { KnowledgeLinkingEngine } from '@/core/knowledge-linking-engine.ts';
import { ContentSource, ContentType } from '@/types/index.ts';
import { logger } from '@/utils/logger.ts';

/**
 * Run simple knowledge linking demo
 */
export async function runSimpleKnowledgeLinkingDemo(): Promise<void> {
  logger.debug('🔗 Simple Knowledge Linking Demo');
  logger.debug('='.repeat(50));

  try {
    // Initialize linking engine
    const linkingEngine = new KnowledgeLinkingEngine();

    // Create sample content items
    const contentItems = createSampleDiscoveredContent();

    // Add content and detect links
    logger.debug('📋 Adding Content and Detecting Links');

    const allLinks = [];

    for (const content of contentItems) {
      logger.debug(`\\nAdding: "${content.title}"`);

      const links = await linkingEngine.addContent(content, {
        minLinkStrength: 0.3,
        maxLinksPerContent: 5,
        enableBidirectional: true,
      });

      allLinks.push(...links);

      if (links.length > 0) {
        logger.debug(`  Found ${links.length} links:`);
        links.forEach(link => {
          logger.debug(
            `    ${link.linkType}: ${link.reason} (strength: ${link.strength.toFixed(2)})`
          );
        });
      } else {
        logger.debug(`  No links found yet`);
      }
    }

    // Summary
    logger.debug('\\n📊 Summary');
    logger.debug(`Total content items: ${contentItems.length}`);
    logger.debug(`Total links detected: ${allLinks.length}`);

    if (allLinks.length > 0) {
      const linksByType = allLinks.reduce((groups: Record<string, number>, link) => {
        groups[link.linkType] = (groups[link.linkType] || 0) + 1;
        return groups;
      }, {});

      logger.debug('\\nLinks by type:');
      Object.entries(linksByType).forEach(([type, count]) => {
        logger.debug(`  ${type}: ${count}`);
      });

      // Strongest relationships
      const strongestLinks = allLinks.sort((a, b) => b.strength - a.strength).slice(0, 3);

      logger.debug('\\n💪 Strongest Relationships:');
      strongestLinks.forEach((link, index) => {
        logger.debug(`${index + 1}. ${link.linkType} (${link.strength.toFixed(2)})`);
        logger.debug(`   ${link.reason}`);
      });
    }

    logger.debug('\\n✅ Knowledge linking demo completed successfully!');
  } catch (error) {
    logger.error('❌ Demo failed:', error);
  }
}

/**
 * Create sample DiscoveredContent items for testing
 */
function createSampleDiscoveredContent() {
  return [
    {
      id: 'react-performance-1',
      title: 'React Performance Optimization Techniques',
      content: `Learn how to optimize React applications for better performance. Covers React.memo, useMemo, useCallback, and component profiling. Essential techniques for building fast, responsive user interfaces.`,
      source: ContentSource.TECH_BLOG,
      url: 'https://example.com/react-performance',
      metadata: {
        author: 'React Expert',
        publishDate: new Date('2024-01-15'),
        tags: ['react', 'performance', 'optimization', 'hooks'],
        contentType: ContentType.ARTICLE,
        wordCount: 1500,
        language: 'en',
        difficulty: 'intermediate',
      },
      relevanceScore: 0.95,
      tags: ['react', 'performance', 'optimization', 'hooks'],
    },
    {
      id: 'typescript-patterns-1',
      title: 'Advanced TypeScript Design Patterns',
      content: `Explore advanced TypeScript patterns including generics, decorators, and utility types. Learn how to build type-safe, maintainable applications with proper typing strategies.`,
      source: ContentSource.DOCUMENTATION,
      url: 'https://example.com/typescript-patterns',
      metadata: {
        author: 'TypeScript Team',
        publishDate: new Date('2024-02-01'),
        tags: ['typescript', 'patterns', 'generics', 'types'],
        contentType: ContentType.DOCUMENTATION,
        wordCount: 2000,
        language: 'en',
        difficulty: 'advanced',
      },
      relevanceScore: 0.88,
      tags: ['typescript', 'patterns', 'generics', 'types'],
    },
    {
      id: 'react-typescript-1',
      title: 'Building React Apps with TypeScript',
      content: `Learn how to combine React and TypeScript for type-safe component development. Covers props typing, hooks with TypeScript, and best practices for React TypeScript projects.`,
      source: ContentSource.TECH_BLOG,
      url: 'https://example.com/react-typescript',
      metadata: {
        author: 'Frontend Developer',
        publishDate: new Date('2024-02-10'),
        tags: ['react', 'typescript', 'components', 'frontend'],
        contentType: ContentType.ARTICLE,
        wordCount: 1200,
        language: 'en',
        difficulty: 'intermediate',
      },
      relevanceScore: 0.91,
      tags: ['react', 'typescript', 'components', 'frontend'],
    },
    {
      id: 'performance-monitoring-1',
      title: 'Application Performance Monitoring Best Practices',
      content: `Essential techniques for monitoring application performance. Covers metrics collection, alerting strategies, and performance optimization workflows for production systems.`,
      source: ContentSource.DOCUMENTATION,
      url: 'https://example.com/performance-monitoring',
      metadata: {
        author: 'DevOps Team',
        publishDate: new Date('2024-01-25'),
        tags: ['monitoring', 'performance', 'metrics', 'production'],
        contentType: ContentType.DOCUMENTATION,
        wordCount: 1600,
        language: 'en',
        difficulty: 'advanced',
      },
      relevanceScore: 0.86,
      tags: ['monitoring', 'performance', 'metrics', 'production'],
    },
  ];
}

// Run demo if called directly
if (import.meta.main) {
  runSimpleKnowledgeLinkingDemo().catch(logger.error);
}
