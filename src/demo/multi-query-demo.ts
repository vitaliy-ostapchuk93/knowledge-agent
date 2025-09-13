/**
 * Multi-Query Workflow Demo
 * Demonstrates handling multiple search queries and content aggregation
 */

import { KnowledgeAgent } from '@/core/knowledge-agent.ts';
import { MarkdownAdapter } from '@/adapters/markdown-adapter.ts';
import { MockAIStrategy } from '@/ai/mock-ai-strategy.ts';
import { MockContentDiscovery } from '@/discovery/mock-content-discovery.ts';
import { MemoryCacheManager } from '@/cache/memory-cache-manager.ts';
import { SimpleEventBus } from '@/events/simple-event-bus.ts';
import { ContentSource, ContentItem } from '@/types/index.ts';
import { logger } from '@/utils/logger.ts';
import path from 'path';
import { promises as fs } from 'fs';

const DEMO_CONFIG = {
  baseDirectory: path.join(process.cwd(), 'demo-knowledge-base'),
  testQueries: [
    'React Server Components',
    'TypeScript Best Practices',
    'Database Design Patterns',
    'Node.js Performance',
    'JavaScript Async Programming',
  ],
};

/**
 * Run multi-query workflow demo
 */
export async function runMultiQueryDemo(): Promise<void> {
  logger.debug('🔄 Multi-Query Workflow Demo');
  logger.debug('='.repeat(50));

  try {
    // Setup demo environment
    await setupDemo();

    // Initialize agent
    const agent = await initializeAgent();

    // Process multiple queries
    const allResults: ContentItem[] = [];

    for (const query of DEMO_CONFIG.testQueries) {
      logger.debug(`🔍 Processing query: "${query}"`);

      const result = await agent.discoverContent(query, {
        maxResults: 2,
        sources: [ContentSource.TECH_BLOG, ContentSource.DOCUMENTATION, ContentSource.TUTORIAL],
      });

      logger.debug(`   Found ${result.items.length} items`);
      allResults.push(...result.items);

      // Small delay between queries
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Aggregate and analyze results
    logger.debug('\\n📊 Aggregated Results Analysis:');
    logger.debug(`Total items discovered: ${allResults.length}`);

    // Group by source
    const sourceGroups = allResults.reduce((groups: Record<string, ContentItem[]>, item) => {
      const source = item.source;
      if (!groups[source]) groups[source] = [];
      groups[source].push(item);
      return groups;
    }, {});

    logger.debug('\\nItems by source:');
    Object.entries(sourceGroups).forEach(([source, items]) => {
      logger.debug(`  ${source}: ${items.length} items`);
    });

    // Find highest relevance items
    const topItems = allResults.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 3);

    logger.debug('\\n🏆 Top 3 most relevant items:');
    topItems.forEach((item, index) => {
      logger.debug(`${index + 1}. ${item.title} (Score: ${item.relevanceScore.toFixed(2)})`);
      logger.debug(`   Source: ${item.source}`);
    });

    // Generate combined summary
    if (topItems.length > 0) {
      logger.debug('\\n📝 Generating combined summary...');
      const combinedSummary = await agent.summarizeContent(topItems);

      logger.debug('Combined Summary:');
      logger.debug('Key Points:');
      combinedSummary.keyPoints.forEach((point, index) => {
        logger.debug(`${index + 1}. ${point}`);
      });
    }

    logger.debug('\\n✅ Multi-query demo completed successfully!');
  } catch (error) {
    logger.error('❌ Demo failed:', error);
  }
}

/**
 * Setup demo environment
 */
async function setupDemo(): Promise<void> {
  await fs.mkdir(DEMO_CONFIG.baseDirectory, { recursive: true });

  // Create multiple sample content files
  const sampleContents = [
    {
      filename: 'typescript-best-practices.md',
      content: `# TypeScript Best Practices

## Type Safety
- Use strict mode configuration
- Prefer interfaces over types for object shapes
- Use union types for flexible APIs

## Code Organization
- Group related types in separate files
- Use barrel exports for clean imports
- Implement proper error handling with Result types

## Performance Tips
- Enable incremental compilation
- Use path mapping for cleaner imports
- Optimize bundle size with tree shaking`,
    },
    {
      filename: 'database-design-patterns.md',
      content: `# Database Design Patterns

## Normalization vs Denormalization
- Normalize for data integrity
- Denormalize for performance when needed
- Consider read/write patterns

## Indexing Strategies
- Index frequently queried columns
- Composite indexes for multi-column queries
- Monitor and optimize index usage

## Scalability Patterns
- Horizontal partitioning (sharding)
- Read replicas for read-heavy workloads
- Connection pooling for resource management`,
    },
  ];

  for (const { filename, content } of sampleContents) {
    await fs.writeFile(path.join(DEMO_CONFIG.baseDirectory, filename), content);
  }
}

/**
 * Initialize Knowledge Agent
 */
async function initializeAgent(): Promise<KnowledgeAgent> {
  const eventBus = new SimpleEventBus(50);
  const cacheManager = new MemoryCacheManager(3600, 100);
  const markdownAdapter = new MarkdownAdapter(DEMO_CONFIG.baseDirectory);
  const aiStrategy = new MockAIStrategy();
  const contentDiscovery = new MockContentDiscovery();

  const agent = new KnowledgeAgent({
    watchDirectories: [DEMO_CONFIG.baseDirectory],
    outputDirectory: DEMO_CONFIG.baseDirectory,
    cacheEnabled: true,
    aiProvider: {
      type: 'local',
      model: 'mock-ai-v1',
    },
    discovery: {
      maxResults: 10,
      sources: [ContentSource.DOCUMENTATION, ContentSource.TECH_BLOG],
    },
  });

  await agent.initialize([markdownAdapter], [aiStrategy], cacheManager, eventBus, contentDiscovery);

  return agent;
}

// Run demo if called directly
if (import.meta.main) {
  runMultiQueryDemo().catch(logger.error);
}
