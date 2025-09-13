/**
 * Demo Entry Point
 * Main orchestrator for all demonstration modules
 */

import { logger } from '@/utils/logger.ts';
import { runBasicDiscoveryDemo } from './basic-discovery-demo.ts';
import { runMultiQueryDemo } from './multi-query-demo.ts';
import { runCacheDemo } from './cache-performance-demo.ts';
import { runSimpleKnowledgeLinkingDemo } from './simple-knowledge-linking-demo.ts';
import { runNLPScoringDemo } from './nlp-scoring-demo.ts';

/**
 * Run all demos in sequence
 */
export async function runAllDemos(): Promise<void> {
  logger.debug('🚀 Universal Knowledge Agent - Complete Demo Suite');
  logger.debug('='.repeat(70));
  logger.debug('This demo showcases all major capabilities - NO API KEYS REQUIRED\n');

  const demos = [
    { name: 'Basic Content Discovery', fn: runBasicDiscoveryDemo },
    { name: 'Multi-Query Workflow', fn: runMultiQueryDemo },
    { name: 'Cache Performance', fn: runCacheDemo },
    { name: 'Knowledge Linking', fn: runSimpleKnowledgeLinkingDemo },
    { name: 'NLP Scoring', fn: runNLPScoringDemo },
  ];

  for (let i = 0; i < demos.length; i++) {
    const demo = demos[i];

    try {
      logger.debug(`\n[${i + 1}/${demos.length}] Running ${demo.name} Demo`);
      logger.debug('-'.repeat(50));

      const start = Date.now();
      await demo.fn();
      const duration = Date.now() - start;

      logger.debug(`✅ ${demo.name} completed in ${duration}ms`);

      // Brief pause between demos
      if (i < demos.length - 1) {
        logger.debug('\n⏸️  Pausing briefly before next demo...\n');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      logger.error(`❌ ${demo.name} demo failed:`, error);
      logger.debug('🔄 Continuing with remaining demos...\n');
    }
  }

  logger.debug('\n' + '='.repeat(70));
  logger.debug('🎉 All demos completed!');
  logger.debug('\n💡 Key Features Demonstrated:');
  logger.debug('   • Content discovery from multiple sources');
  logger.debug('   • Intelligent content summarization');
  logger.debug('   • Multi-query processing and aggregation');
  logger.debug('   • High-performance caching system');
  logger.debug('   • Semantic content linking');
  logger.debug('   • Professional NLP-powered relevance scoring');
  logger.debug('\n🚀 Ready for production use!');
}

/**
 * Run a specific demo by name
 */
export async function runSpecificDemo(demoName: string): Promise<void> {
  const demoMap: Record<string, () => Promise<void>> = {
    basic: runBasicDiscoveryDemo,
    discovery: runBasicDiscoveryDemo,
    multi: runMultiQueryDemo,
    query: runMultiQueryDemo,
    cache: runCacheDemo,
    performance: runCacheDemo,
    linking: runSimpleKnowledgeLinkingDemo,
    knowledge: runSimpleKnowledgeLinkingDemo,
    nlp: runNLPScoringDemo,
    scoring: runNLPScoringDemo,
  };

  const demo = demoMap[demoName.toLowerCase()];

  if (!demo) {
    logger.error(`❌ Unknown demo: ${demoName}`);
    logger.debug('Available demos: basic, multi, cache, linking, nlp');
    return;
  }

  logger.debug(`🎯 Running specific demo: ${demoName}`);
  await demo();
}

// CLI interface
if (import.meta.main) {
  const args = process.argv.slice(2);

  if (args.length > 0 && args[0] !== 'all') {
    // Run specific demo
    runSpecificDemo(args[0])
      .then(() => {
        logger.debug('Demo completed successfully');
        process.exit(0);
      })
      .catch(error => {
        logger.error('Demo failed:', error);
        process.exit(1);
      });
  } else {
    // Run all demos
    runAllDemos()
      .then(() => {
        logger.debug('All demos completed successfully');
        process.exit(0);
      })
      .catch(error => {
        logger.error('Demos failed:', error);
        process.exit(1);
      });
  }
}
