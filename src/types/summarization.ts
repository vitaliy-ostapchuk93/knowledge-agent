/**
 * Summarization Types
 * Types related to content summarization and AI processing
 */

import { ContentItem, CodeExample, RelatedLink } from '@/types/content.ts';

export interface Summary {
  id: string;
  originalContent: ContentItem[];
  keyPoints: string[];
  codeExamples: CodeExample[];
  links: RelatedLink[];
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  generatedAt: Date;
  summary: string;
  actionableItems: string[];
}

export interface AIProcessingResult {
  summary: Summary;
  analysis: Analysis;
  recommendations: string[];
  confidence: number;
  processingTime: number;
}

export interface Analysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'low' | 'medium' | 'high';
  topics: string[];
  keyEntities: string[];
  readingLevel: number;
}

export interface ProcessingOptions {
  strategy: ProcessingStrategy;
  maxTokens?: number;
  temperature?: number;
  model?: string;
  useCache?: boolean;
}

export interface ProcessingConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  maxTokens: number;
  temperature: number;
  apiKey?: string;
}

export enum ProcessingStrategy {
  LOCAL = 'local',
  CLOUD = 'cloud',
  HYBRID = 'hybrid',
}
