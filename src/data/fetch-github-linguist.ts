/**
 * GitHub Linguist Data Fetcher
 * Downloads and processes GitHub's language detection data
 */

import { writeFileSync, mkdirSync } from 'fs';
import { logger } from '@/utils/logger.ts';
import { join } from 'path';

interface LinguistDataConfig {
  baseUrl: string;
  files: string[];
  outputDir: string;
}

const LINGUIST_CONFIG: LinguistDataConfig = {
  baseUrl: 'https://raw.githubusercontent.com/github/linguist/main/lib/linguist/',
  files: ['languages.yml', 'popular.yml', 'documentation.yml', 'vendor.yml', 'heuristics.yml'],
  outputDir: join(process.cwd(), 'assets', 'external-data', 'github-linguist'),
};

interface FetchResult {
  file: string;
  success: boolean;
  size: number;
  error?: string;
}

/**
 * Fetch a single file from GitHub Linguist repository
 */
async function fetchLinguistFile(filename: string): Promise<FetchResult> {
  const url = `${LINGUIST_CONFIG.baseUrl}${filename}`;
  const outputPath = join(LINGUIST_CONFIG.outputDir, filename);

  try {
    logger.info(`Fetching ${filename}...`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();

    // Ensure directory exists
    mkdirSync(LINGUIST_CONFIG.outputDir, { recursive: true });

    // Write file
    writeFileSync(outputPath, content, 'utf-8');

    return {
      file: filename,
      success: true,
      size: content.length,
    };
  } catch (error) {
    return {
      file: filename,
      success: false,
      size: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch all GitHub Linguist data files
 */
export async function fetchGitHubLinguistData(): Promise<FetchResult[]> {
  logger.info('🚀 Fetching GitHub Linguist data...');

  const results: FetchResult[] = [];

  for (const file of LINGUIST_CONFIG.files) {
    const result = await fetchLinguistFile(file);
    results.push(result);

    if (result.success) {
      logger.info(`✅ ${file} (${result.size} bytes)`);
    } else {
      logger.error(`❌ ${file}: ${result.error}`);
    }
  }

  // Create metadata file
  const metadata = {
    source: 'GitHub Linguist',
    url: 'https://github.com/github/linguist',
    fetchDate: new Date().toISOString(),
    files: results,
    totalFiles: results.length,
    successfulFiles: results.filter(r => r.success).length,
    totalSize: results.reduce((sum, r) => sum + r.size, 0),
  };

  const metadataPath = join(LINGUIST_CONFIG.outputDir, 'metadata.json');
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

  logger.info(`📊 Metadata saved to ${metadataPath}`);
  logger.info(
    `📈 Downloaded ${metadata.successfulFiles}/${metadata.totalFiles} files (${metadata.totalSize} bytes)`
  );

  return results;
}

/**
 * Main execution when run directly
 */
if (import.meta.main) {
  fetchGitHubLinguistData()
    .then(results => {
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        logger.error(`\n❌ ${failed.length} files failed to download:`);
        failed.forEach(f => logger.error(`  - ${f.file}: ${f.error}`));
        process.exit(1);
      } else {
        logger.info('\n🎉 All files downloaded successfully!');
        process.exit(0);
      }
    })
    .catch(error => {
      logger.error('💥 Fatal error:', error);
      process.exit(1);
    });
}
