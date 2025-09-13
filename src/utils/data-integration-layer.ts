/**
 * External Data Integration Layer
 * Provides unified access to both hardcoded and external data sources
 * with seamless fallback and caching capabilities
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type {
  TransformedTerms,
  DataSourceConfig,
  UnifiedTermsData,
} from '@/types/external-data.ts';

class DataIntegrationLayer {
  private config: DataSourceConfig;
  private cachedData: UnifiedTermsData | null = null;
  private lastCacheTime = 0;
  private externalDataPath: string;

  constructor(config: Partial<DataSourceConfig> = {}) {
    this.config = {
      useExternalData: true,
      fallbackToHardcoded: true,
      cacheEnabled: true,
      refreshThresholdMs: 5 * 60 * 1000, // 5 minutes
      ...config,
    };

    this.externalDataPath = join(process.cwd(), 'assets', 'processed', 'transformed-terms.json');
  }

  /**
   * Get unified terms data with intelligent fallback
   */
  async getTermsData(): Promise<UnifiedTermsData> {
    // Check cache first
    if (this.shouldUseCache()) {
      return this.cachedData!;
    }

    let termsData: UnifiedTermsData;
    let fallbackUsed = false;

    try {
      if (this.config.useExternalData && this.isExternalDataAvailable()) {
        termsData = await this.loadExternalData();
      } else if (this.config.fallbackToHardcoded) {
        termsData = await this.loadHardcodedData();
        fallbackUsed = true;
      } else {
        throw new Error('External data not available and fallback disabled');
      }
    } catch (error) {
      if (this.config.fallbackToHardcoded) {
        // Note: Using fallback to hardcoded data due to external data unavailability
        termsData = await this.loadHardcodedData();
        fallbackUsed = true;
      } else {
        throw error;
      }
    }

    // Update metadata
    termsData.metadata.fallbackUsed = fallbackUsed;
    termsData.metadata.externalDataAvailable = this.isExternalDataAvailable();
    termsData.metadata.lastUpdated = new Date().toISOString();

    // Cache result
    if (this.config.cacheEnabled) {
      this.cachedData = termsData;
      this.lastCacheTime = Date.now();
    }

    return termsData;
  }

  /**
   * Get terms for a specific category
   */
  async getCategoryTerms(
    category: keyof Omit<UnifiedTermsData, 'metadata'>
  ): Promise<Record<string, string[]>> {
    const data = await this.getTermsData();
    return data[category] as Record<string, string[]>;
  }

  /**
   * Get all terms as a flat array
   */
  async getAllTermsFlat(): Promise<string[]> {
    const data = await this.getTermsData();
    const allTerms: string[] = [];

    for (const categoryKey of Object.keys(data)) {
      if (categoryKey === 'metadata') continue;

      const category = data[categoryKey as keyof Omit<UnifiedTermsData, 'metadata'>] as Record<
        string,
        string[]
      >;
      for (const subcategory of Object.keys(category)) {
        allTerms.push(...category[subcategory]);
      }
    }

    return [...new Set(allTerms)];
  }

  /**
   * Check if external data is available
   */
  private isExternalDataAvailable(): boolean {
    return existsSync(this.externalDataPath);
  }

  /**
   * Load external transformed data
   */
  private async loadExternalData(): Promise<UnifiedTermsData> {
    const rawData = readFileSync(this.externalDataPath, 'utf8');
    const transformedData: TransformedTerms = JSON.parse(rawData);

    return {
      metadata: {
        source: 'external',
        lastUpdated: transformedData.metadata.fetchedAt,
        totalTerms: transformedData.metadata.totalTerms,
        categories: transformedData.metadata.categories,
        externalDataAvailable: true,
        fallbackUsed: false,
      },
      programming: transformedData.programming,
      dataScience: transformedData.dataScience,
      nlpSentiment: transformedData.nlpSentiment,
      machineLearning: transformedData.machineLearning,
      business: transformedData.business,
    };
  }

  /**
   * Load hardcoded data as fallback
   */
  private async loadHardcodedData(): Promise<UnifiedTermsData> {
    // Import the original hardcoded terms (we'll need to extract these)
    const hardcodedTerms = await this.extractHardcodedTerms();

    return {
      metadata: {
        source: 'hardcoded',
        lastUpdated: new Date().toISOString(),
        totalTerms: this.countTerms(hardcodedTerms),
        categories: Object.keys(hardcodedTerms),
        externalDataAvailable: this.isExternalDataAvailable(),
        fallbackUsed: true,
      },
      ...hardcodedTerms,
    };
  }

  /**
   * Extract hardcoded terms from existing terms-config.ts
   */
  private async extractHardcodedTerms(): Promise<Omit<UnifiedTermsData, 'metadata'>> {
    // For now, provide minimal hardcoded terms as fallback
    return {
      programming: {
        languages: ['javascript', 'typescript', 'python', 'java', 'rust', 'go'],
        frameworks: ['react', 'angular', 'vue', 'express', 'fastapi', 'django'],
        tools: ['git', 'docker', 'kubernetes', 'webpack', 'vite'],
        fileExtensions: ['js', 'ts', 'py', 'java', 'rs', 'go', 'html', 'css'],
      },
      dataScience: {
        libraries: ['pandas', 'numpy', 'scikit-learn', 'matplotlib'],
        algorithms: ['regression', 'classification', 'clustering'],
        techniques: ['feature-selection', 'cross-validation'],
        platforms: ['jupyter', 'colab', 'kaggle'],
      },
      nlpSentiment: {
        positiveWords: ['good', 'great', 'excellent', 'amazing', 'wonderful'],
        negativeWords: ['bad', 'terrible', 'awful', 'horrible', 'disappointing'],
        nlpTerms: ['tokenization', 'stemming', 'lemmatization'],
        techniques: ['sentiment-analysis', 'named-entity-recognition'],
      },
      machineLearning: {
        frameworks: ['tensorflow', 'pytorch', 'keras', 'scikit-learn'],
        algorithms: ['neural-network', 'svm', 'random-forest'],
        concepts: ['supervised-learning', 'unsupervised-learning'],
        tools: ['tensorboard', 'mlflow', 'wandb'],
      },
      business: {
        analytics: ['kpi', 'roi', 'conversion-rate'],
        metrics: ['revenue', 'churn', 'retention'],
        processes: ['analysis', 'reporting', 'forecasting'],
        domains: ['marketing', 'sales', 'operations'],
      },
    };
  }

  /**
   * Count total terms in data structure
   */
  private countTerms(data: Omit<UnifiedTermsData, 'metadata'>): number {
    let total = 0;
    for (const categoryKey of Object.keys(data)) {
      const category = data[categoryKey as keyof typeof data] as Record<string, string[]>;
      for (const subcategory of Object.keys(category)) {
        total += category[subcategory].length;
      }
    }
    return total;
  }

  /**
   * Check if cached data should be used
   */
  private shouldUseCache(): boolean {
    if (!this.config.cacheEnabled || !this.cachedData) {
      return false;
    }

    const cacheAge = Date.now() - this.lastCacheTime;
    return cacheAge < this.config.refreshThresholdMs;
  }

  /**
   * Force refresh cached data
   */
  async refreshCache(): Promise<void> {
    this.cachedData = null;
    this.lastCacheTime = 0;
    await this.getTermsData();
  }

  /**
   * Get current configuration
   */
  getConfig(): DataSourceConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DataSourceConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Clear cache if configuration changes
    if (!newConfig.cacheEnabled) {
      this.cachedData = null;
      this.lastCacheTime = 0;
    }
  }
}

export { DataIntegrationLayer };
