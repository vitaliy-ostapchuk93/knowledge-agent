/**
 * External Data Types
 * Type definitions for external data integration
 */

export interface TransformedTerms {
  metadata: {
    source: string;
    fetchedAt: string;
    totalTerms: number;
    categories: string[];
  };
  programming: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    fileExtensions: string[];
  };
  dataScience: {
    libraries: string[];
    algorithms: string[];
    techniques: string[];
    platforms: string[];
  };
  nlpSentiment: {
    positiveWords: string[];
    negativeWords: string[];
    nlpTerms: string[];
    techniques: string[];
  };
  machineLearning: {
    frameworks: string[];
    algorithms: string[];
    concepts: string[];
    tools: string[];
  };
  business: {
    analytics: string[];
    metrics: string[];
    processes: string[];
    domains: string[];
  };
}

export interface DataSourceConfig {
  useExternalData: boolean;
  fallbackToHardcoded: boolean;
  cacheEnabled: boolean;
  refreshThresholdMs: number;
}

export interface TermsMetadata {
  source: 'hardcoded' | 'external' | 'hybrid';
  lastUpdated: string;
  totalTerms: number;
  categories: string[];
  externalDataAvailable: boolean;
  fallbackUsed: boolean;
}

export interface UnifiedTermsData {
  metadata: TermsMetadata;
  programming: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    fileExtensions: string[];
  };
  dataScience: {
    libraries: string[];
    algorithms: string[];
    techniques: string[];
    platforms: string[];
  };
  nlpSentiment: {
    positiveWords: string[];
    negativeWords: string[];
    nlpTerms: string[];
    techniques: string[];
  };
  machineLearning: {
    frameworks: string[];
    algorithms: string[];
    concepts: string[];
    tools: string[];
  };
  business: {
    analytics: string[];
    metrics: string[];
    processes: string[];
    domains: string[];
  };
}
