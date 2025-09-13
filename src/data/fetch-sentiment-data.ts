/**
 * NLP & Sentiment Analysis Data Fetcher
 * Downloads popular sentiment analysis lexicons and NLP datasets
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '@/utils/logger.ts';

interface SentimentDataSource {
  name: string;
  url: string;
  filename: string;
  description: string;
  type: 'lexicon' | 'corpus' | 'model';
}

const SENTIMENT_SOURCES: SentimentDataSource[] = [
  {
    name: 'VADER Sentiment',
    url: 'https://raw.githubusercontent.com/cjhutto/vaderSentiment/master/vaderSentiment/vader_lexicon.txt',
    filename: 'vader-lexicon.txt',
    description: 'VADER sentiment lexicon with intensity scores',
    type: 'lexicon',
  },
  {
    name: 'AFINN Sentiment Lexicon',
    url: 'https://raw.githubusercontent.com/fnielsen/afinn/master/afinn/data/AFINN-111.txt',
    filename: 'afinn-111.txt',
    description: 'AFINN sentiment word list with scores -5 to +5',
    type: 'lexicon',
  },
  {
    name: 'Opinion Lexicon - Positive Words',
    url: 'https://raw.githubusercontent.com/jeffreybreen/twitter-sentiment-analysis-tutorial-201107/master/data/opinion-lexicon-English/positive-words.txt',
    filename: 'opinion-positive-words.txt',
    description: 'Bing Liu positive opinion words',
    type: 'lexicon',
  },
  {
    name: 'Opinion Lexicon - Negative Words',
    url: 'https://raw.githubusercontent.com/jeffreybreen/twitter-sentiment-analysis-tutorial-201107/master/data/opinion-lexicon-English/negative-words.txt',
    filename: 'opinion-negative-words.txt',
    description: 'Bing Liu negative opinion words',
    type: 'lexicon',
  },
];

const OUTPUT_DIR = join(process.cwd(), 'assets', 'external-data', 'nlp-sentiment');

interface FetchResult {
  name: string;
  filename: string;
  success: boolean;
  size: number;
  lineCount?: number;
  error?: string;
}

/**
 * Fetch a single sentiment data source
 */
async function fetchSentimentData(source: SentimentDataSource): Promise<FetchResult> {
  const outputPath = join(OUTPUT_DIR, source.filename);

  try {
    logger.info(`Fetching ${source.name}...`);
    const response = await fetch(source.url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const content = await response.text();

    // Ensure directory exists
    mkdirSync(OUTPUT_DIR, { recursive: true });

    // Write file
    writeFileSync(outputPath, content, 'utf-8');

    // Count lines for lexicon statistics
    const lineCount = content.split('\n').filter(line => line.trim().length > 0).length;

    return {
      name: source.name,
      filename: source.filename,
      success: true,
      size: content.length,
      lineCount,
    };
  } catch (error) {
    return {
      name: source.name,
      filename: source.filename,
      success: false,
      size: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a comprehensive NLP terms list for our taxonomy
 */
function generateNLPTerms(): string[] {
  return [
    // Sentiment Analysis
    'sentiment analysis',
    'opinion mining',
    'emotion detection',
    'polarity classification',
    'subjectivity analysis',
    'aspect-based sentiment',
    'fine-grained sentiment',

    // NLP Techniques
    'tokenization',
    'stemming',
    'lemmatization',
    'pos tagging',
    'named entity recognition',
    'dependency parsing',
    'constituency parsing',
    'coreference resolution',
    'word sense disambiguation',
    'semantic role labeling',

    // Text Processing
    'text preprocessing',
    'text normalization',
    'text cleaning',
    'stopword removal',
    'n-gram analysis',
    'tf-idf',
    'bag of words',
    'word embeddings',
    'word2vec',
    'glove',
    'fasttext',
    'bert',
    'transformer',
    'attention mechanism',

    // ML for NLP
    'text classification',
    'sequence labeling',
    'language modeling',
    'machine translation',
    'text summarization',
    'question answering',
    'dialogue systems',
    'chatbots',
    'information extraction',
    'topic modeling',
    'lda',
    'lsi',

    // Evaluation Metrics
    'precision',
    'recall',
    'f1-score',
    'accuracy',
    'bleu score',
    'rouge score',
    'perplexity',
    'confusion matrix',
    'cross-validation',

    // Libraries & Tools
    'nltk',
    'spacy',
    'textblob',
    'scikit-learn',
    'gensim',
    'huggingface',
    'transformers',
    'pytorch',
    'tensorflow',
    'keras',
    'pandas',
    'numpy',
  ];
}

/**
 * Fetch all sentiment analysis data
 */
export async function fetchSentimentAnalysisData(): Promise<FetchResult[]> {
  logger.info('🔍 Fetching sentiment analysis data...');

  const results: FetchResult[] = [];

  for (const source of SENTIMENT_SOURCES) {
    const result = await fetchSentimentData(source);
    results.push(result);

    if (result.success) {
      logger.info(`✅ ${result.name} (${result.size} bytes, ${result.lineCount} entries)`);
    } else {
      logger.error(`❌ ${result.name}: ${result.error}`);
    }
  }

  // Generate NLP terms
  const nlpTerms = generateNLPTerms();
  const nlpTermsPath = join(OUTPUT_DIR, 'nlp-terms.json');
  writeFileSync(
    nlpTermsPath,
    JSON.stringify(
      {
        terms: nlpTerms,
        categories: {
          sentimentAnalysis: nlpTerms.filter(
            t => t.includes('sentiment') || t.includes('opinion') || t.includes('emotion')
          ),
          textProcessing: nlpTerms.filter(
            t => t.includes('token') || t.includes('preprocess') || t.includes('normal')
          ),
          machineLearning: nlpTerms.filter(
            t => t.includes('classification') || t.includes('model') || t.includes('neural')
          ),
          evaluation: nlpTerms.filter(
            t => t.includes('score') || t.includes('precision') || t.includes('recall')
          ),
          libraries: nlpTerms.filter(t => t.match(/^[a-z-]+$/)), // Simple library names
        },
        totalTerms: nlpTerms.length,
        generatedDate: new Date().toISOString(),
      },
      null,
      2
    ),
    'utf-8'
  );

  // Create metadata file
  const metadata = {
    source: 'Multiple NLP/Sentiment Sources',
    sources: SENTIMENT_SOURCES.map(s => ({
      name: s.name,
      type: s.type,
      description: s.description,
      url: s.url,
    })),
    fetchDate: new Date().toISOString(),
    files: results,
    totalFiles: results.length,
    successfulFiles: results.filter(r => r.success).length,
    totalSize: results.reduce((sum, r) => sum + r.size, 0),
    totalEntries: results.reduce((sum, r) => sum + (r.lineCount || 0), 0),
    nlpTermsGenerated: nlpTerms.length,
  };

  const metadataPath = join(OUTPUT_DIR, 'metadata.json');
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

  logger.info(`📊 Metadata saved to ${metadataPath}`);
  logger.info(`📈 Downloaded ${metadata.successfulFiles}/${metadata.totalFiles} files`);
  logger.info(`📝 Generated ${metadata.nlpTermsGenerated} NLP terms`);

  return results;
}

/**
 * Main execution when run directly
 */
if (import.meta.main) {
  fetchSentimentAnalysisData()
    .then(results => {
      const failed = results.filter(r => !r.success);
      if (failed.length > 0) {
        logger.error(`\n❌ ${failed.length} files failed to download:`);
        failed.forEach(f => logger.error(`  - ${f.name}: ${f.error}`));
        process.exit(1);
      } else {
        logger.info('\n🎉 All sentiment data downloaded successfully!');
        process.exit(0);
      }
    })
    .catch(error => {
      logger.error('💥 Fatal error:', error);
      process.exit(1);
    });
}
