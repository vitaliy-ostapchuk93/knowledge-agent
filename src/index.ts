/**
 * Universal Knowledge Agent - Main Entry Point
 *
 * This is the main entry point for the Universal Knowledge Agent system.
 * It demonstrates the MVP implementation with a comprehensive demo.
 */

import { runMVPDemo } from '@/demo/demo.ts';
import { logger } from '@/utils/logger.ts';

logger.debug('🚀 Universal Knowledge Agent - MVP Implementation');

// Basic demonstration of the system
async function main() {
  try {
    logger.debug('📋 System Configuration:');
    logger.debug(`- Runtime: ${process.versions.bun ? 'Bun' : 'Node.js'}`);
    logger.debug(`- Version: ${process.versions.bun || process.versions.node}`);
    logger.debug(`- Platform: ${process.platform}`);
    logger.debug(`- Architecture: ${process.arch}`);

    // Check for OpenAI API key
    if (process.env.OPENAI_API_KEY) {
      logger.debug('🤖 OpenAI API key detected - will use real AI processing');
    } else {
      logger.debug('🎭 No OpenAI API key - will use mock AI processing for demo');
      logger.debug('   Set OPENAI_API_KEY environment variable for full functionality');
    }

    logger.debug('\n' + '='.repeat(60));

    // Run the comprehensive MVP demo
    await runMVPDemo();

    logger.debug('\n🎯 System completed successfully! Exiting...');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error running Knowledge Agent:', error);
    process.exit(1);
  }
}

// Execute main function
main();
