/**
 * MVP Demo for Universal Knowledge Agent
 * Demonstrates the core functionality with a practical example - NO API KEYS REQUIRED
 */

import { KnowledgeAgent } from '@/core/knowledge-agent.ts';
import { MarkdownAdapter } from '@/adapters/markdown-adapter.ts';
import { MockAIStrategy } from '@/ai/mock-ai-strategy.ts';
import { MockContentDiscovery } from '@/discovery/mock-content-discovery.ts';
import { RealWebDiscovery } from '@/discovery/real-web-discovery.ts';
import { KnowledgeLinkingEngine } from '@/core/knowledge-linking-engine.ts';
import { MemoryCacheManager } from '@/cache/memory-cache-manager.ts';
import { SimpleEventBus } from '@/events/simple-event-bus.ts';
import { PlatformType, SummaryStrategy } from '@/types/index.ts';
import { logger } from '@/utils/logger.ts';
import path from 'path';
import { promises as fs } from 'fs';

// Demo configuration
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
 * Main demo function
 */
export async function runMVPDemo(): Promise<void> {
  logger.debug('🚀 Starting Universal Knowledge Agent MVP Demo\n');

  try {
    // Step 1: Setup
    await setupDemo();

    // Step 2: Initialize components
    const { agent, eventBus, cacheManager } = await initializeAgent();

    // Step 3: Demo scenarios
    await demoScenario1(agent); // Basic content discovery and summarization
    await demoScenario2(agent); // Multi-query workflow
    await demoScenario3(agent); // Cache performance
    await demoScenario4(); // Knowledge linking engine

    // Step 4: Show results
    await showResults(eventBus, cacheManager);

    // Step 5: Cleanup resources
    logger.debug('\n🧹 Cleaning up resources...');

    // Clear event bus subscriptions
    if (eventBus && typeof eventBus.clearSubscriptions === 'function') {
      eventBus.clearSubscriptions();
      eventBus.clearHistory();
    }

    // Clear cache
    if (cacheManager && typeof cacheManager.clear === 'function') {
      await cacheManager.clear();
    }

    logger.debug('\n✅ MVP Demo completed successfully!');
    logger.debug(`📁 Check the knowledge base at: ${DEMO_CONFIG.baseDirectory}`);
  } catch (error) {
    logger.error('\n❌ Demo failed:', error);
    throw error;
  }
}

/**
 * Setup demo environment
 */
async function setupDemo(): Promise<void> {
  logger.debug('📁 Setting up demo environment...');

  // Create demo directory
  await fs.mkdir(DEMO_CONFIG.baseDirectory, { recursive: true });

  // Create some sample existing content
  await createSampleContent();

  logger.debug('✅ Demo environment ready\n');
}

/**
 * Initialize the Knowledge Agent with all components
 */
async function initializeAgent(): Promise<{
  agent: KnowledgeAgent;
  eventBus: SimpleEventBus;
  cacheManager: MemoryCacheManager;
}> {
  logger.debug('🔧 Initializing Knowledge Agent...');

  // Create event bus
  const eventBus = new SimpleEventBus(50);

  // Create cache manager
  const cacheManager = new MemoryCacheManager(3600, 100);

  // Create platform adapter
  const markdownAdapter = new MarkdownAdapter(DEMO_CONFIG.baseDirectory);

  // Create AI strategy (mock - no API keys required)
  const aiStrategy = new MockAIStrategy();
  logger.debug('🤖 Using mock AI strategy (no API keys required)');

  // Create content discovery (mock)
  const contentDiscovery = new MockContentDiscovery();

  // Create Knowledge Agent
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

  // Subscribe to events for demo
  setupEventLogging(eventBus);

  // Initialize agent
  await agent.initialize([markdownAdapter], [aiStrategy], cacheManager, eventBus, contentDiscovery);

  logger.debug('✅ Knowledge Agent initialized\n');
  return { agent, eventBus, cacheManager };
}

/**
 * Demo Scenario 1: Basic content discovery and summarization
 */
async function demoScenario1(agent: KnowledgeAgent): Promise<void> {
  logger.debug('📖 Demo Scenario 1: Basic Content Discovery');
  logger.debug('='.repeat(50));

  const query = DEMO_CONFIG.testQueries[0];
  logger.debug(`🔍 Query: "${query}"`);

  try {
    // Discover content
    const discoveryResult = await agent.discoverContent(query, {
      query,
      maxResults: 3,
      difficulty: 'intermediate',
    });

    logger.debug(`📊 Found ${discoveryResult.totalFound} items in ${discoveryResult.searchTime}ms`);

    // Summarize content
    const summary = await agent.summarizeContent(discoveryResult.items, SummaryStrategy.DETAILED);

    logger.debug(`📝 Generated summary with ${summary.keyPoints.length} key points`);

    // Integrate into platform
    await agent.integrateKnowledge(summary, PlatformType.OBSIDIAN);

    logger.debug('✅ Scenario 1 completed\n');
  } catch (error) {
    logger.error('❌ Scenario 1 failed:', error);
  }
}

/**
 * Demo Scenario 2: Multi-query workflow
 */
async function demoScenario2(agent: KnowledgeAgent): Promise<void> {
  logger.debug('🔄 Demo Scenario 2: Multi-Query Workflow');
  logger.debug('='.repeat(50));

  const queries = DEMO_CONFIG.testQueries.slice(1);

  for (const query of queries) {
    logger.debug(`🔍 Processing: "${query}"`);

    try {
      const summary = await agent.processQuery(query, PlatformType.OBSIDIAN, {
        query,
        maxResults: 2,
        summaryStrategy: SummaryStrategy.CONCISE,
      });

      logger.debug(
        `📝 Created "${query}" summary with ${summary.actionableItems.length} action items`
      );
    } catch (error) {
      logger.error(`❌ Failed to process "${query}":`, error);
    }
  }

  logger.debug('✅ Scenario 2 completed\n');
}

/**
 * Demo Scenario 3: Cache performance demonstration
 */
async function demoScenario3(agent: KnowledgeAgent): Promise<void> {
  logger.debug('⚡ Demo Scenario 3: Cache Performance');
  logger.debug('='.repeat(50));

  const query = DEMO_CONFIG.testQueries[0]; // Reuse first query

  logger.debug(`🔍 First request: "${query}"`);
  const start1 = Date.now();
  await agent.discoverContent(query);
  const time1 = Date.now() - start1;

  logger.debug(`🔍 Second request (cached): "${query}"`);
  const start2 = Date.now();
  await agent.discoverContent(query);
  const time2 = Date.now() - start2;

  logger.debug(
    `📊 Performance improvement: ${time1}ms → ${time2}ms (${Math.round((1 - time2 / time1) * 100)}% faster)`
  );
  logger.debug('✅ Scenario 3 completed\n');
}

/**
 * Show demo results and statistics
 */
async function showResults(
  eventBus: SimpleEventBus,
  cacheManager: MemoryCacheManager
): Promise<void> {
  logger.debug('📊 Demo Results & Statistics');
  logger.debug('='.repeat(50));

  // Event statistics
  const eventStats = eventBus.getStats();
  logger.debug(`📢 Events: ${eventStats.historySize} total, ${eventStats.eventTypes.length} types`);
  logger.debug(`   Types: ${eventStats.eventTypes.join(', ')}`);

  // Cache statistics
  const cacheStats = await cacheManager.getStats();
  logger.debug(
    `📦 Cache: ${cacheStats.hits} hits, ${cacheStats.misses} misses (${Math.round(cacheStats.hitRate * 100)}% hit rate)`
  );
  logger.debug(
    `   Size: ${cacheStats.size} entries, ~${Math.round(cacheManager.getSizeBytes() / 1024)}KB`
  );

  // Generated files
  try {
    const files = await fs.readdir(DEMO_CONFIG.baseDirectory);
    const markdownFiles = files.filter(f => f.endsWith('.md'));
    logger.debug(`📁 Generated: ${markdownFiles.length} markdown files`);
    logger.debug(`   Files: ${markdownFiles.join(', ')}`);
  } catch {
    logger.debug('📁 Could not read generated files');
  }

  // Recent events
  const recentEvents = eventBus.getEventHistory(5);
  logger.debug('\n📜 Recent Events:');
  recentEvents.forEach(event => {
    logger.debug(`   ${event.timestamp.toISOString()} - ${event.type} (${event.source})`);
  });
}

/**
 * Create sample existing content for the demo
 */
async function createSampleContent(): Promise<void> {
  const sampleContent = `---
tags: [javascript, react, frontend]
difficulty: intermediate
created: ${new Date().toISOString()}
---

# Getting Started with React

React is a popular JavaScript library for building user interfaces. This guide covers the basics.

## Key Concepts

- Components
- Props
- State
- Hooks

## Next Steps

- Build your first component
- Learn about state management
- Explore the React ecosystem

#react #javascript #frontend`;

  const samplePath = path.join(DEMO_CONFIG.baseDirectory, 'getting-started-with-react.md');
  await fs.writeFile(samplePath, sampleContent, 'utf-8');
}

/**
 * Setup event logging for demo
 */
function setupEventLogging(eventBus: SimpleEventBus): void {
  // Log all important events
  eventBus.subscribePattern(/^(agent|discovery|summarization|integration)\./, event => {
    if (event.type.includes('completed') || event.type.includes('failed')) {
      logger.debug(`📢 ${event.type}: ${JSON.stringify(event.data)}`);
    }
  });
}

/**
 * Demo Scenario 4: Knowledge Linking Engine
 */
async function demoScenario4(): Promise<void> {
  logger.debug('\n🔗 Demo Scenario 4: Knowledge Linking Engine');
  logger.debug('='.repeat(50));

  const linkingEngine = new KnowledgeLinkingEngine();
  const realWebDiscovery = new RealWebDiscovery();

  // Create a diverse set of content to demonstrate linking
  logger.debug('📚 Building knowledge base with diverse content...');

  // Get content about React
  const reactContent = await realWebDiscovery.discover('React basics', { maxResults: 2 });
  for (const content of reactContent) {
    await linkingEngine.addContent(content);
  }

  // Get content about TypeScript
  const typescriptContent = await realWebDiscovery.discover('TypeScript fundamentals', {
    maxResults: 2,
  });
  for (const content of typescriptContent) {
    await linkingEngine.addContent(content);
  }

  // Get content about Next.js (should link to React)
  const nextjsContent = await realWebDiscovery.discover('Next.js tutorial', { maxResults: 1 });
  for (const content of nextjsContent) {
    const newLinks = await linkingEngine.addContent(content);

    if (newLinks.length > 0) {
      logger.debug(`\n🔗 Found ${newLinks.length} links for "${content.title}":`);
      newLinks.forEach(link => {
        const targetContent = linkingEngine.exportGraph().nodes.get(link.targetId);
        logger.debug(
          `   → ${link.linkType} (${Math.round(link.strength * 100)}%): ${targetContent?.title}`
        );
        logger.debug(`     Reason: ${link.reason}`);
      });
    }
  }

  // Show knowledge graph statistics
  const stats = linkingEngine.getGraphStats();
  logger.debug('\n📊 Knowledge Graph Statistics:');
  logger.debug(`   Nodes: ${stats.nodeCount}`);
  logger.debug(`   Links: ${stats.linkCount}`);
  logger.debug(`   Average links per node: ${stats.averageLinks.toFixed(1)}`);
  logger.debug(
    `   Link types:`,
    Object.entries(stats.linkTypes)
      .map(([type, count]) => `${type}(${count})`)
      .join(', ')
  );

  // Demonstrate link retrieval for a specific content
  const allNodes = Array.from(linkingEngine.exportGraph().nodes.values());
  if (allNodes.length > 0) {
    const sampleContent = allNodes[0];
    const contentLinks = linkingEngine.getLinksForContent(sampleContent.id);
    logger.debug(`\n🔍 Links for "${sampleContent.title}":`);
    contentLinks.forEach(link => {
      const isSource = link.sourceId === sampleContent.id;
      const relatedId = isSource ? link.targetId : link.sourceId;
      const relatedContent = linkingEngine.exportGraph().nodes.get(relatedId);
      const direction = isSource ? '→' : '←';
      logger.debug(`   ${direction} ${link.linkType}: ${relatedContent?.title}`);
    });
  }

  logger.debug('✅ Scenario 4 completed\n');
}

// Run demo directly
logger.debug('🚀 Starting demo...');
runMVPDemo()
  .then(() => {
    logger.debug('\n🎯 Demo completed! Exiting...');
    // Force exit after a short delay to allow any final logging
    setTimeout(() => {
      logger.debug('🔄 Forcing exit...');
      process.exit(0);
    }, 100);
  })
  .catch(error => {
    logger.error('\n❌ Demo failed:', error);
    setTimeout(() => {
      process.exit(1);
    }, 100);
  });

// Safety timeout to prevent hanging
setTimeout(() => {
  logger.debug('\n⏰ Demo timeout reached, forcing exit...');
  process.exit(0);
}, 60000); // 60 seconds timeout
