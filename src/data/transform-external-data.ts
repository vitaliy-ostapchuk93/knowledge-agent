/**
 * External Data Transformer
 * Converts fetched external data into unified internal format for terms-config.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';
import { logger } from '@/utils/logger.ts';
import type { TransformedTerms } from '@/types/external-data.ts';

class ExternalDataTransformer {
  private assetsDir: string;
  private outputDir: string;

  constructor() {
    this.assetsDir = join(process.cwd(), 'assets', 'external-data');
    this.outputDir = join(process.cwd(), 'assets', 'processed');
  }

  async transformAll(): Promise<TransformedTerms> {
    logger.info('🔄 Transforming external data into internal format...');

    const transformedTerms: TransformedTerms = {
      metadata: {
        source: 'external-data-integration',
        fetchedAt: new Date().toISOString(),
        totalTerms: 0,
        categories: [],
      },
      programming: {
        languages: [],
        frameworks: [],
        tools: [],
        fileExtensions: [],
      },
      dataScience: {
        libraries: [],
        algorithms: [],
        techniques: [],
        platforms: [],
      },
      nlpSentiment: {
        positiveWords: [],
        negativeWords: [],
        nlpTerms: [],
        techniques: [],
      },
      machineLearning: {
        frameworks: [],
        algorithms: [],
        concepts: [],
        tools: [],
      },
      business: {
        analytics: [],
        metrics: [],
        processes: [],
        domains: [],
      },
    };

    // Transform programming languages from GitHub Linguist
    await this.transformProgrammingData(transformedTerms);

    // Transform sentiment analysis data
    await this.transformSentimentData(transformedTerms);

    // Transform ML/Data Science data
    await this.transformMLData(transformedTerms);

    // Calculate totals and metadata
    this.calculateMetadata(transformedTerms);

    // Save transformed data
    const outputPath = join(this.outputDir, 'transformed-terms.json');
    writeFileSync(outputPath, JSON.stringify(transformedTerms, null, 2));
    logger.info(`📊 Transformed data saved to ${outputPath}`);

    return transformedTerms;
  }

  private async transformProgrammingData(transformedTerms: TransformedTerms): Promise<void> {
    try {
      logger.info('🔧 Transforming GitHub Linguist data...');

      // Load languages.yml
      const languagesPath = join(this.assetsDir, 'github-linguist', 'languages.yml');
      const languagesYaml = readFileSync(languagesPath, 'utf8');
      const languagesData = parseYaml(languagesYaml) as Record<string, unknown>;

      // Extract language names
      const languages = Object.keys(languagesData)
        .map(lang => lang.toLowerCase().replace(/[^a-z0-9]/g, ''))
        .filter(lang => lang.length > 1);

      // Extract file extensions
      const extensions = Object.values(languagesData)
        .flatMap(lang => {
          const langData = lang as Record<string, unknown>;
          return (langData.extensions as string[]) || [];
        })
        .map((ext: string) => ext.replace('.', ''))
        .filter((ext: string) => ext.length > 0);

      transformedTerms.programming.languages = [...new Set(languages)];
      transformedTerms.programming.fileExtensions = [...new Set(extensions)];

      // Load popular.yml for framework hints
      const popularPath = join(this.assetsDir, 'github-linguist', 'popular.yml');
      const popularYaml = readFileSync(popularPath, 'utf8');
      const popularData = parseYaml(popularYaml) as string[];

      transformedTerms.programming.frameworks = popularData
        .map(name => name.toLowerCase().replace(/[^a-z0-9]/g, ''))
        .filter(name => name.length > 1);

      logger.info(
        `✅ Programming: ${transformedTerms.programming.languages.length} languages, ${transformedTerms.programming.fileExtensions.length} extensions`
      );
    } catch (error) {
      logger.warn('⚠️ Error transforming programming data:', error);
    }
  }

  private async transformSentimentData(transformedTerms: TransformedTerms): Promise<void> {
    try {
      logger.info('🔧 Transforming sentiment analysis data...');

      // Load VADER lexicon
      const vaderPath = join(this.assetsDir, 'nlp-sentiment', 'vader-lexicon.txt');
      const vaderData = readFileSync(vaderPath, 'utf8');
      const vaderWords = vaderData
        .split('\n')
        .map(line => line.split('\t')[0])
        .filter(word => word && word.length > 2)
        .map(word => word.toLowerCase());

      // Load AFINN lexicon
      const afinnPath = join(this.assetsDir, 'nlp-sentiment', 'afinn-111.txt');
      const afinnData = readFileSync(afinnPath, 'utf8');
      const afinnWords = afinnData
        .split('\n')
        .map(line => line.split('\t')[0])
        .filter(word => word && word.length > 2)
        .map(word => word.toLowerCase());

      // Load positive words
      const positivePath = join(this.assetsDir, 'nlp-sentiment', 'opinion-positive-words.txt');
      const positiveWords = readFileSync(positivePath, 'utf8')
        .split('\n')
        .filter(word => word && word.length > 2 && !word.startsWith(';'))
        .map(word => word.toLowerCase().trim());

      // Load negative words
      const negativePath = join(this.assetsDir, 'nlp-sentiment', 'opinion-negative-words.txt');
      const negativeWords = readFileSync(negativePath, 'utf8')
        .split('\n')
        .filter(word => word && word.length > 2 && !word.startsWith(';'))
        .map(word => word.toLowerCase().trim());

      // Load NLP terms
      const nlpTermsPath = join(this.assetsDir, 'nlp-sentiment', 'nlp-terms.json');
      const nlpTermsData = JSON.parse(readFileSync(nlpTermsPath, 'utf8'));

      transformedTerms.nlpSentiment.positiveWords = [...new Set(positiveWords)];
      transformedTerms.nlpSentiment.negativeWords = [...new Set(negativeWords)];
      transformedTerms.nlpSentiment.nlpTerms = [...new Set([...vaderWords, ...afinnWords])];
      transformedTerms.nlpSentiment.techniques = nlpTermsData.categories?.nlp || [];

      logger.info(
        `✅ NLP/Sentiment: ${transformedTerms.nlpSentiment.positiveWords.length} positive, ${transformedTerms.nlpSentiment.negativeWords.length} negative words`
      );
    } catch (error) {
      logger.warn('⚠️ Error transforming sentiment data:', error);
    }
  }

  private async transformMLData(transformedTerms: TransformedTerms): Promise<void> {
    try {
      logger.info('🔧 Transforming ML/Data Science data...');

      // Load ML frameworks
      const mlFrameworksPath = join(this.assetsDir, 'ml-frameworks', 'ml-frameworks.json');
      const mlData = JSON.parse(readFileSync(mlFrameworksPath, 'utf8'));

      // Extract ML terms
      const mlFrameworks = [
        ...(mlData.frameworks?.deepLearning || []),
        ...(mlData.frameworks?.traditionalML || []),
        ...(mlData.frameworks?.computerVision || []),
        ...(mlData.frameworks?.nlp || []),
      ].map(name => name.toLowerCase().replace(/[^a-z0-9]/g, ''));

      transformedTerms.machineLearning.frameworks = [...new Set(mlFrameworks)];
      transformedTerms.machineLearning.concepts = mlData.terms || [];
      transformedTerms.machineLearning.algorithms = mlData.algorithms || [];

      // Load data science tools
      const dsToolsPath = join(this.assetsDir, 'data-science', 'data-science-tools.json');
      const dsData = JSON.parse(readFileSync(dsToolsPath, 'utf8'));

      transformedTerms.dataScience.libraries = dsData.tools?.dataProcessing || [];
      transformedTerms.dataScience.platforms = dsData.tools?.platforms || [];
      transformedTerms.dataScience.algorithms = dsData.tools?.statistics || [];
      transformedTerms.business.analytics = dsData.businessTerms || [];

      logger.info(
        `✅ ML/DS: ${transformedTerms.machineLearning.frameworks.length} frameworks, ${transformedTerms.dataScience.libraries.length} libraries`
      );
    } catch (error) {
      logger.warn('⚠️ Error transforming ML/DS data:', error);
    }
  }

  private calculateMetadata(transformedTerms: TransformedTerms): void {
    const categories = Object.keys(transformedTerms).filter(key => key !== 'metadata');
    let totalTerms = 0;

    for (const category of categories) {
      const categoryData = transformedTerms[category as keyof typeof transformedTerms] as Record<
        string,
        unknown
      >;
      if (typeof categoryData === 'object') {
        for (const subcategory of Object.keys(categoryData)) {
          const items = categoryData[subcategory];
          if (Array.isArray(items)) {
            totalTerms += items.length;
          }
        }
      }
    }

    transformedTerms.metadata.totalTerms = totalTerms;
    transformedTerms.metadata.categories = categories;

    logger.info(`📊 Total transformed terms: ${totalTerms} across ${categories.length} categories`);
  }
}

// CLI execution
async function main() {
  try {
    const transformer = new ExternalDataTransformer();
    const result = await transformer.transformAll();

    logger.info('\n🎉 External data transformation completed!');
    logger.info(`📈 Total terms available: ${result.metadata.totalTerms}`);
    logger.info(`📂 Categories: ${result.metadata.categories.join(', ')}`);
  } catch (error) {
    logger.error('❌ Transformation failed:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}

export { ExternalDataTransformer, type TransformedTerms };
