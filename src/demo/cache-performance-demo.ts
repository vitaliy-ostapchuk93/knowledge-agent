/**
 * Cache Performance Demo
 * Demonstrates caching benefits and performance improvements
 */

import { KnowledgeAgent } from '@/core/knowledge-agent.ts';
import { MarkdownAdapter } from '@/adapters/markdown-adapter.ts';
import { MockAIStrategy } from '@/ai/mock-ai-strategy.ts';
import { MockContentDiscovery } from '@/discovery/mock-content-discovery.ts';
import { MemoryCacheManager } from '@/cache/memory-cache-manager.ts';
import { SimpleEventBus } from '@/events/simple-event-bus.ts';
import { ContentSource } from '@/types/index.ts';
import { logger } from '@/utils/logger.ts';
import path from 'path';
import { promises as fs } from 'fs';

const DEMO_CONFIG = {
  baseDirectory: path.join(process.cwd(), 'demo-knowledge-base'),
  testQuery: 'React performance optimization',
};

/**
 * Run cache performance demo
 */
export async function runCacheDemo(): Promise<void> {
  logger.debug('⚡ Cache Performance Demo');
  logger.debug('='.repeat(50));

  try {
    // Setup demo environment
    await setupDemo();

    // Initialize agent with cache
    const { agent, cacheManager } = await initializeAgent();

    const query = DEMO_CONFIG.testQuery;

    // First request (cache miss)
    logger.debug(`🔍 First query: "${query}" (should be slow - cache miss)`);
    const start1 = Date.now();

    const result1 = await agent.discoverContent(query, {
      maxResults: 3,
      sources: [ContentSource.TECH_BLOG, ContentSource.DOCUMENTATION],
    });

    const time1 = Date.now() - start1;
    logger.debug(`   ⏱️  First request took: ${time1}ms`);
    logger.debug(`   📚 Found ${result1.items.length} items`);

    // Check cache stats
    const stats1 = await cacheManager.getStats();
    logger.debug(`   📊 Cache stats - Hits: ${stats1.hits}, Misses: ${stats1.misses}`);

    // Small delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Second request (cache hit)
    logger.debug(`\\n🔍 Second query: "${query}" (should be fast - cache hit)`);
    const start2 = Date.now();

    const result2 = await agent.discoverContent(query, {
      maxResults: 3,
      sources: [ContentSource.TECH_BLOG, ContentSource.DOCUMENTATION],
    });

    const time2 = Date.now() - start2;
    logger.debug(`   ⏱️  Second request took: ${time2}ms`);
    logger.debug(`   📚 Found ${result2.items.length} items`);

    // Check cache stats again
    const stats2 = await cacheManager.getStats();
    logger.debug(`   📊 Cache stats - Hits: ${stats2.hits}, Misses: ${stats2.misses}`);

    // Performance improvement
    const improvement = ((time1 - time2) / time1) * 100;
    logger.debug(`\\n🚀 Performance improvement: ${improvement.toFixed(1)}% faster`);

    // Test with different query (new cache miss)
    const newQuery = 'TypeScript generics patterns';
    logger.debug(`\\n🔍 Third query: "${newQuery}" (new query - cache miss)`);
    const start3 = Date.now();

    const result3 = await agent.discoverContent(newQuery, {
      maxResults: 2,
      sources: [ContentSource.TUTORIAL],
    });

    const time3 = Date.now() - start3;
    logger.debug(`   ⏱️  Third request took: ${time3}ms`);
    logger.debug(`   📚 Found ${result3.items.length} items`);

    // Final cache stats
    const stats3 = await cacheManager.getStats();
    logger.debug(`   📊 Final cache stats - Hits: ${stats3.hits}, Misses: ${stats3.misses}`);

    // Cache hit ratio
    const hitRatio = (stats3.hits / (stats3.hits + stats3.misses)) * 100;
    logger.debug(`   📈 Cache hit ratio: ${hitRatio.toFixed(1)}%`);

    // Test cache expiration (simulate)
    logger.debug('\\n🕐 Testing cache expiration...');
    cacheManager.clear();
    const stats4 = await cacheManager.getStats();
    logger.debug(`   🗑️  Cache cleared - Hits: ${stats4.hits}, Misses: ${stats4.misses}`);

    logger.debug('\\n✅ Cache performance demo completed successfully!');
  } catch (error) {
    logger.error('❌ Demo failed:', error);
  }
}

/**
 * Setup demo environment
 */
async function setupDemo(): Promise<void> {
  await fs.mkdir(DEMO_CONFIG.baseDirectory, { recursive: true });

  // Create sample content file
  const sampleContent = `# React Performance Optimization Guide

## Optimization Strategies

### 1. Component Optimization
- Use React.memo for expensive components
- Implement proper shouldComponentUpdate logic
- Avoid unnecessary re-renders with useMemo and useCallback

### 2. Bundle Optimization
- Code splitting with React.lazy and Suspense
- Tree shaking to eliminate dead code
- Optimize bundle size with proper imports

### 3. Runtime Performance
- Virtualize long lists with react-window
- Debounce expensive operations
- Use web workers for heavy computations

### 4. Memory Management
- Clean up event listeners and subscriptions
- Avoid memory leaks in useEffect
- Profile with React DevTools

## Measuring Performance
- Use React Profiler
- Measure Core Web Vitals
- Set up performance monitoring`;

  await fs.writeFile(path.join(DEMO_CONFIG.baseDirectory, 'react-performance.md'), sampleContent);
}

/**
 * Initialize Knowledge Agent with caching
 */
async function initializeAgent(): Promise<{
  agent: KnowledgeAgent;
  cacheManager: MemoryCacheManager;
}> {
  const eventBus = new SimpleEventBus(50);
  const cacheManager = new MemoryCacheManager(3600, 100); // 1 hour TTL, 100 max items
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
      sources: [ContentSource.DOCUMENTATION, ContentSource.TECH_BLOG],
    },
  });

  await agent.initialize([markdownAdapter], [aiStrategy], cacheManager, eventBus, contentDiscovery);

  return { agent, cacheManager };
}

// Run demo if called directly
if (import.meta.main) {
  runCacheDemo().catch(logger.error);
}
