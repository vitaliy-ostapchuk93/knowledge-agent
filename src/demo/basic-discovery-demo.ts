/**
 * Basic Content Discovery Demo
 * Demonstrates core content discovery functionality
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
  testQuery: 'React Server Components',
};

/**
 * Run basic discovery demo
 */
export async function runBasicDiscoveryDemo(): Promise<void> {
  logger.debug('📖 Basic Content Discovery Demo');
  logger.debug('='.repeat(50));

  try {
    // Setup demo environment
    await setupDemo();

    // Initialize agent
    const agent = await initializeAgent();

    // Discover content
    const query = DEMO_CONFIG.testQuery;
    logger.debug(`🔍 Searching for: "${query}"`);

    const discoveryResult = await agent.discoverContent(query, {
      maxResults: 3,
      sources: [ContentSource.TECH_BLOG, ContentSource.DOCUMENTATION],
    });

    logger.debug(`📚 Found ${discoveryResult.items.length} relevant items:`);
    discoveryResult.items.forEach((item: ContentItem, index: number) => {
      logger.debug(`${index + 1}. ${item.title} (Score: ${item.relevanceScore.toFixed(2)})`);
      logger.debug(`   Source: ${item.source} | URL: ${item.url}`);
      logger.debug(`   Content preview: ${item.content.substring(0, 100)}...`);
      logger.debug('');
    });

    // Summarize one of the items
    if (discoveryResult.items.length > 0) {
      const firstItem = discoveryResult.items[0];
      logger.debug(`📝 Generating summary for: "${firstItem.title}"`);

      const summary = await agent.summarizeContent([firstItem]);

      logger.debug('Summary:');
      logger.debug(summary.summary);
    }

    logger.debug('✅ Basic discovery demo completed successfully!');
  } catch (error) {
    logger.error('❌ Demo failed:', error);
  }
}

/**
 * Setup demo environment
 */
async function setupDemo(): Promise<void> {
  await fs.mkdir(DEMO_CONFIG.baseDirectory, { recursive: true });

  // Create a sample content file
  const sampleContent = `# React Server Components Guide

React Server Components (RSCs) are a new feature that allows you to write UI that renders on the server.

## Key Benefits

- **Zero Bundle Size Impact**: Server Components don't increase client bundle size
- **Direct Database Access**: Can fetch data directly without API layers  
- **Improved Performance**: Reduced client-side JavaScript and faster initial loads

## Usage Examples

\`\`\`jsx
// Server Component
async function ProductList() {
  const products = await db.products.findMany();
  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
\`\`\`

This represents a paradigm shift in how we think about React applications.`;

  await fs.writeFile(
    path.join(DEMO_CONFIG.baseDirectory, 'react-server-components.md'),
    sampleContent
  );
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
      maxResults: 5,
      sources: ['documentation', 'tech_blog'],
    },
  });

  await agent.initialize([markdownAdapter], [aiStrategy], cacheManager, eventBus, contentDiscovery);

  return agent;
}

// Run demo if called directly
if (import.meta.main) {
  runBasicDiscoveryDemo().catch(console.error);
}
