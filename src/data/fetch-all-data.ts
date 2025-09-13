/**
 * Master Data Fetcher
 * Orchestrates downloading and processing of all external data sources
 */

import { fetchGitHubLinguistData } from '@/data/fetch-github-linguist.ts';
import { fetchSentimentAnalysisData } from '@/data/fetch-sentiment-data.ts';
import { generateMLDataScienceData } from '@/data/generate-ml-data.ts';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '@/utils/logger.ts';

interface DataSource {
  name: string;
  type: 'fetch' | 'generate';
  handler: () => Promise<unknown>;
  enabled: boolean;
}

const DATA_SOURCES: DataSource[] = [
  {
    name: 'GitHub Linguist (Programming Languages)',
    type: 'fetch',
    handler: fetchGitHubLinguistData,
    enabled: true,
  },
  {
    name: 'Sentiment Analysis Lexicons',
    type: 'fetch',
    handler: fetchSentimentAnalysisData,
    enabled: true,
  },
  {
    name: 'ML/Data Science Frameworks',
    type: 'generate',
    handler: generateMLDataScienceData,
    enabled: true,
  },
];

interface FetchSession {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  sources: Array<{
    name: string;
    type: string;
    success: boolean;
    error?: string;
    executionTime: number;
  }>;
  totalSources: number;
  successfulSources: number;
  failedSources: number;
}

/**
 * Execute a single data source with error handling and timing
 */
async function executeDataSource(source: DataSource): Promise<{
  name: string;
  type: string;
  success: boolean;
  error?: string;
  executionTime: number;
}> {
  const startTime = Date.now();

  try {
    logger.info(`\n🚀 Processing: ${source.name}`);
    logger.info(`   Type: ${source.type}`);

    await source.handler();

    const executionTime = Date.now() - startTime;
    logger.info(`✅ ${source.name} completed in ${executionTime}ms`);

    return {
      name: source.name,
      type: source.type,
      success: true,
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error(`❌ ${source.name} failed: ${errorMessage}`);

    return {
      name: source.name,
      type: source.type,
      success: false,
      error: errorMessage,
      executionTime,
    };
  }
}

/**
 * Generate comprehensive domain taxonomy from all sources
 */
async function generateComprehensiveTaxonomy(session: FetchSession): Promise<void> {
  logger.info('\n🔧 Generating comprehensive taxonomy...');

  const outputDir = join(process.cwd(), 'assets', 'processed');
  mkdirSync(outputDir, { recursive: true });

  // This would be expanded to actually read and process all the downloaded/generated files
  // For now, we create a structure that shows what will be available
  const taxonomy = {
    metadata: {
      generatedDate: new Date().toISOString(),
      version: '1.0.0',
      sources: session.sources.filter(s => s.success).map(s => s.name),
      totalSources: session.sources.length,
      successfulSources: session.successfulSources,
    },

    domains: {
      programming: {
        description: 'Programming languages, frameworks, and development tools',
        sourceFiles: ['github-linguist/languages.yml', 'github-linguist/popular.yml'],
        estimatedTerms: 2000, // Will be calculated from actual data
      },

      dataScience: {
        description: 'Data science tools, libraries, and methodologies',
        sourceFiles: ['data-science/data-science-tools.json', 'ml-frameworks/ml-frameworks.json'],
        estimatedTerms: 500,
      },

      nlpSentiment: {
        description: 'Natural language processing and sentiment analysis',
        sourceFiles: [
          'nlp-sentiment/vader-lexicon.txt',
          'nlp-sentiment/afinn-111.txt',
          'nlp-sentiment/nlp-terms.json',
        ],
        estimatedTerms: 15000, // VADER + AFINN + custom terms
      },

      machineLearning: {
        description: 'Machine learning frameworks, algorithms, and concepts',
        sourceFiles: ['ml-frameworks/ml-frameworks.json'],
        estimatedTerms: 300,
      },

      business: {
        description: 'Business terminology, analytics, and industry terms',
        sourceFiles: ['data-science/data-science-tools.json'],
        estimatedTerms: 200,
      },

      design: {
        description: 'Design tools, methodologies, and creative terminology',
        sourceFiles: [], // To be implemented
        estimatedTerms: 0,
      },
    },

    processing: {
      nextSteps: [
        'Parse GitHub Linguist YAML files',
        'Process sentiment lexicons into structured format',
        'Create unified term lookup indices',
        'Generate domain-specific term lists',
        'Create performance-optimized search structures',
        'Implement conflict resolution for overlapping terms',
      ],
    },
  };

  const taxonomyPath = join(outputDir, 'taxonomy-structure.json');
  writeFileSync(taxonomyPath, JSON.stringify(taxonomy, null, 2), 'utf-8');

  logger.info(`📊 Taxonomy structure saved to ${taxonomyPath}`);

  // Estimate total coverage improvement
  const estimatedTerms = Object.values(taxonomy.domains).reduce(
    (sum, domain) => sum + domain.estimatedTerms,
    0
  );

  logger.info(`📈 Estimated total terms: ${estimatedTerms.toLocaleString()} (vs ~50 hardcoded)`);
  logger.info(`🚀 Coverage improvement: ${Math.round(estimatedTerms / 50)}x increase`);
}

/**
 * Fetch all external data sources
 */
export async function fetchAllExternalData(): Promise<FetchSession> {
  logger.info('🌍 Knowledge Agent - External Data Fetcher');
  logger.info('==========================================');

  const session: FetchSession = {
    startTime: new Date(),
    sources: [],
    totalSources: DATA_SOURCES.filter(s => s.enabled).length,
    successfulSources: 0,
    failedSources: 0,
  };

  logger.info(`📋 Processing ${session.totalSources} data sources...\n`);

  // Process each enabled data source
  for (const source of DATA_SOURCES.filter(s => s.enabled)) {
    const result = await executeDataSource(source);
    session.sources.push(result);

    if (result.success) {
      session.successfulSources++;
    } else {
      session.failedSources++;
    }
  }

  // Finalize session
  session.endTime = new Date();
  session.duration = session.endTime.getTime() - session.startTime.getTime();

  // Generate comprehensive taxonomy
  if (session.successfulSources > 0) {
    await generateComprehensiveTaxonomy(session);
  }

  // Save session report
  const reportsDir = join(process.cwd(), 'assets', 'reports');
  mkdirSync(reportsDir, { recursive: true });

  const reportPath = join(
    reportsDir,
    `fetch-session-${new Date().toISOString().split('T')[0]}.json`
  );
  writeFileSync(reportPath, JSON.stringify(session, null, 2), 'utf-8');

  // Print summary
  logger.info('\n📊 FETCH SESSION SUMMARY');
  logger.info('========================');
  logger.info(`⏱️  Duration: ${session.duration}ms`);
  logger.info(`✅ Successful: ${session.successfulSources}/${session.totalSources}`);
  logger.info(`❌ Failed: ${session.failedSources}/${session.totalSources}`);
  logger.info(`📄 Report saved: ${reportPath}`);

  if (session.failedSources > 0) {
    logger.info('\n❌ Failed sources:');
    session.sources.filter(s => !s.success).forEach(s => logger.info(`   - ${s.name}: ${s.error}`));
  }

  return session;
}

/**
 * Main execution when run directly
 */
if (import.meta.main) {
  fetchAllExternalData()
    .then(session => {
      if (session.failedSources > 0) {
        logger.info(`\n⚠️  Completed with ${session.failedSources} failures`);
        process.exit(1);
      } else {
        logger.info('\n🎉 All external data fetched successfully!');
        logger.info('\n🔄 Next steps:');
        logger.info('   1. Run data transformation scripts');
        logger.info('   2. Update terms-config.ts with external data');
        logger.info('   3. Test integration with existing systems');
        process.exit(0);
      }
    })
    .catch(error => {
      logger.error('💥 Fatal error in master fetch process:', error);
      process.exit(1);
    });
}
