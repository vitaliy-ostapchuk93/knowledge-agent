/**
 * External Data Setup Script
 * Handles automated and manual fetching of external data sources
 * Used both for postinstall automation and manual 'bun run setup'
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { logger } from '@/utils/logger.ts';

interface SetupOptions {
  isPostinstall?: boolean;
  verbose?: boolean;
  force?: boolean;
}

class ExternalDataSetup {
  private options: SetupOptions;
  private assetsDir: string;
  private processedDir: string;

  constructor(options: SetupOptions = {}) {
    this.options = {
      isPostinstall: false,
      verbose: false,
      force: false,
      ...options,
    };

    this.assetsDir = join(process.cwd(), 'assets');
    this.processedDir = join(this.assetsDir, 'processed');
  }

  /**
   * Main setup entry point
   */
  async setup(): Promise<boolean> {
    try {
      this.log('🚀 Setting up Universal Knowledge Agent...');

      // Check if external data already exists (unless forced)
      if (!this.options.force && this.hasExternalData()) {
        this.log('✅ External data already available (16,500+ terms ready!)');
        if (this.options.isPostinstall) {
          this.log('💡 To refresh data manually, run: bun run setup --force');
        }
        return true;
      }

      // Attempt to fetch external data
      const success = await this.fetchExternalData();

      if (success) {
        this.log('🎉 Setup complete! Universal Knowledge Agent ready with 16,500+ terms');
        this.log('📈 Performance boost: 217x more terms than fallback mode');
        return true;
      } else {
        this.handleFallback();
        return false;
      }
    } catch (error) {
      this.handleError(error);
      return false;
    }
  }

  /**
   * Check if external data already exists
   */
  private hasExternalData(): boolean {
    const transformedDataPath = join(this.processedDir, 'transformed-terms.json');
    return existsSync(transformedDataPath);
  }

  /**
   * Attempt to fetch external data
   */
  private async fetchExternalData(): Promise<boolean> {
    try {
      this.log('📡 Fetching external data sources...');

      // Run the fetch script - now in src/data/
      const fetchScript = join('src', 'data', 'fetch-all-data.ts');
      if (!existsSync(fetchScript)) {
        this.log('⚠️  Fetch script not found, using fallback terms');
        return false;
      }

      this.log('   • Downloading GitHub Linguist data (700+ programming languages)...');
      this.log('   • Fetching sentiment lexicons (VADER, AFINN)...');
      this.log('   • Collecting ML/Data Science frameworks...');

      const command = `bun run ${fetchScript}`;

      if (this.options.verbose) {
        execSync(command, { stdio: 'inherit', cwd: process.cwd() });
      } else {
        execSync(command, { stdio: 'pipe', cwd: process.cwd() });
      }

      // Run the transformation script
      const transformScript = join('assets', 'scripts', 'transform-external-data.ts');
      if (existsSync(transformScript)) {
        this.log('🔄 Processing and transforming data...');

        const transformCommand = `bun run ${transformScript}`;
        if (this.options.verbose) {
          execSync(transformCommand, { stdio: 'inherit', cwd: process.cwd() });
        } else {
          execSync(transformCommand, { stdio: 'pipe', cwd: process.cwd() });
        }
      }

      // Verify the data was created
      if (this.hasExternalData()) {
        this.log('✅ External data successfully downloaded and processed');
        return true;
      } else {
        this.log('⚠️  Data processing incomplete, using fallback terms');
        return false;
      }
    } catch (error) {
      this.log(
        `❌ Failed to fetch external data: ${error instanceof Error ? error.message : error}`
      );
      return false;
    }
  }

  /**
   * Handle fallback when external data fetching fails
   */
  private handleFallback(): void {
    if (this.options.isPostinstall) {
      logger.info('\n📋 POSTINSTALL NOTICE:');
      logger.info('• External data fetch failed, but the app will work fine with built-in terms');
      logger.info('• You have ~75 fallback terms (vs 16,500+ with external data)');
      logger.info('• To retry setup: bun run setup');
      logger.info('• For verbose output: bun run setup --verbose');
      logger.info('• App is ready to use! 🚀\n');
    } else {
      logger.info('\n📋 SETUP INCOMPLETE:');
      logger.info('• External data fetch failed');
      logger.info('• Using minimal fallback terms (~75 terms)');
      logger.info('• Try: bun run setup --verbose for detailed error info');
      logger.info('• Try: bun run setup --force to retry download');
      logger.info('• App will still work with reduced term coverage\n');
    }
  }

  /**
   * Handle setup errors
   */
  private handleError(error: unknown): void {
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (this.options.isPostinstall) {
      logger.warn(`\n⚠️  POSTINSTALL WARNING: Setup failed (${errorMsg})`);
      logger.warn('• App will use fallback terms (~75 terms)');
      logger.warn('• To retry: bun run setup');
      logger.warn('• App is still functional! 🚀\n');
    } else {
      logger.error(`\n❌ SETUP ERROR: ${errorMsg}`);
      logger.error('• Try: bun run setup --verbose for detailed logs');
      logger.error('• App will use fallback terms if setup fails\n');
    }
  }

  /**
   * Log messages with appropriate visibility
   */
  private log(message: string): void {
    if (this.options.verbose || !this.options.isPostinstall) {
      logger.info(message);
    }
  }
}

/**
 * Parse command line arguments
 */
function parseArgs(): SetupOptions {
  const args = process.argv.slice(2);

  return {
    isPostinstall: args.includes('--postinstall'),
    verbose: args.includes('--verbose') || args.includes('-v'),
    force: args.includes('--force') || args.includes('-f'),
  };
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const options = parseArgs();
  const setup = new ExternalDataSetup(options);

  const success = await setup.setup();

  // Exit with appropriate code
  if (!success && !options.isPostinstall) {
    process.exit(1);
  }

  // Always exit 0 for postinstall to not break npm/bun install
  process.exit(0);
}

// Run if called directly
if (import.meta.main) {
  main().catch(error => {
    logger.error('Setup script failed:', error);
    process.exit(1);
  });
}

export { ExternalDataSetup };
