/**
 * Universal Knowledge Agent - Main Entry Point
 *
 * This is the main entry point for the Universal Knowledge Agent system.
 * It demonstrates the MVP implementation with a comprehensive demo.
 */

import { runMVPDemo } from './demo/demo.js';

console.log('🚀 Universal Knowledge Agent - MVP Implementation');

// Basic demonstration of the system
async function main() {
  try {
    console.log('📋 System Configuration:');
    console.log(`- Runtime: ${process.versions.bun ? 'Bun' : 'Node.js'}`);
    console.log(`- Version: ${process.versions.bun || process.versions.node}`);
    console.log(`- Platform: ${process.platform}`);
    console.log(`- Architecture: ${process.arch}`);

    // Check for OpenAI API key
    if (process.env.OPENAI_API_KEY) {
      console.log('🤖 OpenAI API key detected - will use real AI processing');
    } else {
      console.log('🎭 No OpenAI API key - will use mock AI processing for demo');
      console.log('   Set OPENAI_API_KEY environment variable for full functionality');
    }

    console.log('\n' + '='.repeat(60));

    // Run the comprehensive MVP demo
    await runMVPDemo();
    
    console.log('\n🎯 System completed successfully! Exiting...');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error running Knowledge Agent:', error);
    process.exit(1);
  }
}

// Execute main function
main();
