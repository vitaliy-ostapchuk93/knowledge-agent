/**
 * Machine Learning & Data Science Data Fetcher
 * Creates comprehensive lists of ML frameworks, data science tools, and terminology
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from '@/utils/logger.ts';

const OUTPUT_DIR_ML = join(process.cwd(), 'assets', 'external-data', 'ml-frameworks');
const OUTPUT_DIR_DS = join(process.cwd(), 'assets', 'external-data', 'data-science');

/**
 * Comprehensive ML frameworks and libraries
 */
function generateMLFrameworks() {
  return {
    deepLearning: [
      'TensorFlow',
      'PyTorch',
      'Keras',
      'JAX',
      'Flax',
      'Haiku',
      'Trax',
      'MXNet',
      'PaddlePaddle',
      'Caffe',
      'Caffe2',
      'Theano',
      'CNTK',
      'Chainer',
      'DyNet',
      'Fast.ai',
      'Lightning',
      'Ignite',
      'Catalyst',
    ],
    traditionalML: [
      'scikit-learn',
      'XGBoost',
      'LightGBM',
      'CatBoost',
      'Weka',
      'H2O',
      'MLlib',
      'Mahout',
      'Orange',
      'KNIME',
      'RapidMiner',
      'AutoML',
      'Auto-sklearn',
      'TPOT',
      'MLBox',
      'Optuna',
      'Hyperopt',
      'Ray Tune',
    ],
    reinforcementLearning: [
      'OpenAI Gym',
      'Stable Baselines',
      'Ray RLlib',
      'TensorForce',
      'Dopamine',
      'ACME',
      'ReAgent',
      'Coach',
      'ChainerRL',
      'Garage',
    ],
    computerVision: [
      'OpenCV',
      'PIL',
      'Pillow',
      'scikit-image',
      'ImageIO',
      'Mahotas',
      'SimpleCV',
      'Detectron2',
      'MMDetection',
      'YOLOv5',
      'Albumentations',
      'imgaug',
      'Kornia',
      'torchvision',
      'tf-image',
    ],
    nlp: [
      'NLTK',
      'spaCy',
      'Gensim',
      'TextBlob',
      'Transformers',
      'AllenNLP',
      'Stanza',
      'CoreNLP',
      'OpenNLP',
      'Flair',
      'FastText',
      'SentencePiece',
      'Tokenizers',
      'datasets',
      'evaluate',
    ],
    audioML: [
      'librosa',
      'PyAudio',
      'SpeechRecognition',
      'pydub',
      'torchaudio',
      'ESPnet',
      'Kaldi',
      'wav2vec2',
      'DeepSpeech',
      'Whisper',
    ],
    mlops: [
      'MLflow',
      'Kubeflow',
      'Airflow',
      'Prefect',
      'DVC',
      'CML',
      'Weights & Biases',
      'Neptune',
      'Comet',
      'TensorBoard',
      'Visdom',
      'Sacred',
      'Hydra',
      'BentoML',
      'Seldon',
      'KServe',
      'TorchServe',
      'TensorFlow Serving',
    ],
    dataProcessing: [
      'pandas',
      'NumPy',
      'Dask',
      'Modin',
      'Polars',
      'Vaex',
      'CuPy',
      'Numba',
      'Apache Spark',
      'PySpark',
      'Koalas',
      'Ray',
      'Distributed',
    ],
  };
}

/**
 * Data science tools and platforms
 */
function generateDataScienceTools() {
  return {
    notebooks: [
      'Jupyter',
      'JupyterLab',
      'Google Colab',
      'Kaggle Notebooks',
      'Azure Notebooks',
      'Databricks',
      'Zeppelin',
      'Observable',
      'Deepnote',
      'Hex',
      'Mode Analytics',
    ],
    visualization: [
      'matplotlib',
      'seaborn',
      'plotly',
      'bokeh',
      'altair',
      'pygal',
      'holoviews',
      'datashader',
      'ggplot',
      'D3.js',
      'Chart.js',
      'Tableau',
      'Power BI',
      'Looker',
      'Grafana',
      'Streamlit',
      'Dash',
    ],
    statistics: [
      'SciPy',
      'statsmodels',
      'PyMC',
      'Stan',
      'R',
      'SPSS',
      'SAS',
      'Stata',
      'JASP',
      'PSPP',
      'Pingouin',
      'Lifelines',
    ],
    databases: [
      'PostgreSQL',
      'MySQL',
      'SQLite',
      'MongoDB',
      'Redis',
      'Elasticsearch',
      'InfluxDB',
      'Cassandra',
      'Neo4j',
      'DuckDB',
      'ClickHouse',
      'Snowflake',
      'BigQuery',
      'Redshift',
      'Databricks',
    ],
    bigData: [
      'Hadoop',
      'Spark',
      'Kafka',
      'Flink',
      'Storm',
      'Hive',
      'Pig',
      'HBase',
      'Impala',
      'Presto',
      'Trino',
      'Drill',
      'Kylin',
    ],
    cloudPlatforms: [
      'AWS SageMaker',
      'Google AI Platform',
      'Azure ML',
      'Databricks',
      'Dataiku',
      'H2O.ai',
      'DataRobot',
      'Alteryx',
      'Palantir',
      'Domino Data Lab',
      'Anaconda Enterprise',
    ],
  };
}

/**
 * ML/DS terminology and concepts
 */
function generateMLTerminology() {
  return {
    algorithms: [
      'linear regression',
      'logistic regression',
      'decision trees',
      'random forest',
      'gradient boosting',
      'svm',
      'k-means',
      'hierarchical clustering',
      'neural networks',
      'cnn',
      'rnn',
      'lstm',
      'gru',
      'transformer',
      'attention',
      'autoencoder',
      'gan',
      'vae',
      'reinforcement learning',
      'q-learning',
      'policy gradient',
      'actor-critic',
    ],
    concepts: [
      'supervised learning',
      'unsupervised learning',
      'semi-supervised',
      'transfer learning',
      'few-shot learning',
      'zero-shot learning',
      'online learning',
      'batch learning',
      'ensemble methods',
      'cross-validation',
      'hyperparameter tuning',
      'regularization',
      'overfitting',
      'underfitting',
      'bias-variance tradeoff',
      'feature engineering',
      'feature selection',
      'dimensionality reduction',
    ],
    metrics: [
      'accuracy',
      'precision',
      'recall',
      'f1-score',
      'auc-roc',
      'confusion matrix',
      'mse',
      'mae',
      'rmse',
      'r-squared',
      'silhouette score',
      'davies-bouldin',
      'calinski-harabasz',
      'adjusted rand index',
      'normalized mutual information',
    ],
    techniques: [
      'data preprocessing',
      'data cleaning',
      'missing value imputation',
      'outlier detection',
      'feature scaling',
      'normalization',
      'standardization',
      'encoding',
      'one-hot encoding',
      'label encoding',
      'target encoding',
      'pca',
      'lda',
      'tsne',
      'umap',
      'ica',
      'nmf',
    ],
  };
}

/**
 * Business intelligence and analytics terms
 */
function generateBusinessAnalyticsTerms() {
  return {
    analytics: [
      'descriptive analytics',
      'diagnostic analytics',
      'predictive analytics',
      'prescriptive analytics',
      'business intelligence',
      'data warehouse',
      'data lake',
      'data mart',
      'etl',
      'elt',
      'olap',
      'oltp',
      'data pipeline',
      'real-time analytics',
      'batch processing',
    ],
    metrics: [
      'kpi',
      'roi',
      'ltv',
      'cac',
      'churn rate',
      'conversion rate',
      'retention rate',
      'engagement rate',
      'click-through rate',
      'bounce rate',
      'session duration',
      'pageviews',
      'dau',
      'mau',
    ],
    processes: [
      'ab testing',
      'cohort analysis',
      'funnel analysis',
      'segmentation',
      'clustering',
      'recommendation systems',
      'personalization',
      'forecasting',
      'demand planning',
      'inventory optimization',
    ],
  };
}

/**
 * Create ML frameworks data file
 */
async function createMLFrameworksData(): Promise<void> {
  mkdirSync(OUTPUT_DIR_ML, { recursive: true });

  const mlData = {
    frameworks: generateMLFrameworks(),
    terminology: generateMLTerminology(),
    totalFrameworks: Object.values(generateMLFrameworks()).flat().length,
    totalTerms: Object.values(generateMLTerminology()).flat().length,
    generatedDate: new Date().toISOString(),
    version: '1.0.0',
  };

  const mlPath = join(OUTPUT_DIR_ML, 'ml-frameworks.json');
  writeFileSync(mlPath, JSON.stringify(mlData, null, 2), 'utf-8');

  logger.info(
    `✅ ML frameworks data (${mlData.totalFrameworks} frameworks, ${mlData.totalTerms} terms)`
  );
}

/**
 * Create data science tools data file
 */
async function createDataScienceData(): Promise<void> {
  mkdirSync(OUTPUT_DIR_DS, { recursive: true });

  const dsData = {
    tools: generateDataScienceTools(),
    business: generateBusinessAnalyticsTerms(),
    totalTools: Object.values(generateDataScienceTools()).flat().length,
    totalBusinessTerms: Object.values(generateBusinessAnalyticsTerms()).flat().length,
    generatedDate: new Date().toISOString(),
    version: '1.0.0',
  };

  const dsPath = join(OUTPUT_DIR_DS, 'data-science-tools.json');
  writeFileSync(dsPath, JSON.stringify(dsData, null, 2), 'utf-8');

  logger.info(
    `✅ Data science tools (${dsData.totalTools} tools, ${dsData.totalBusinessTerms} business terms)`
  );
}

/**
 * Generate comprehensive ML/DS data
 */
export async function generateMLDataScienceData(): Promise<void> {
  logger.info('🧠 Generating ML & Data Science data...');

  await createMLFrameworksData();
  await createDataScienceData();

  // Create combined metadata
  const metadata = {
    sources: [
      'Curated ML frameworks and libraries',
      'Data science tools and platforms',
      'Business analytics terminology',
    ],
    directories: [OUTPUT_DIR_ML, OUTPUT_DIR_DS],
    generatedDate: new Date().toISOString(),
    description: 'Comprehensive machine learning and data science terminology',
  };

  const metadataPath = join(OUTPUT_DIR_ML, '../metadata.json');
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');

  logger.info(`📊 ML/DS metadata saved`);
  logger.info('🎉 ML & Data Science data generation completed!');
}

/**
 * Main execution when run directly
 */
if (import.meta.main) {
  generateMLDataScienceData()
    .then(() => {
      logger.info('\n✨ All ML & Data Science data generated successfully!');
      process.exit(0);
    })
    .catch(error => {
      logger.error('💥 Fatal error:', error);
      process.exit(1);
    });
}
