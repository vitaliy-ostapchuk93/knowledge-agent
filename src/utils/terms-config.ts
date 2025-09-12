/**
 * Centralized Terms Configuration
 * Static base terms with optional integration to Domain-Aware Taxonomy System
 */

import { logger } from '@/utils/logger.ts';
import { DomainTaxonomyManager } from '@/core/domain-taxonomy.ts';
import type { TaxonomyTerm } from '@/types/taxonomy.ts';

// Initialize taxonomy manager (optional for enhanced capabilities)
let taxonomyManager: DomainTaxonomyManager | null = null;

try {
  taxonomyManager = new DomainTaxonomyManager({
    minConfidence: 0.7,
    minFrequency: 2,
    maxLearnedTerms: 500,
    enableExternalValidation: false, // Keep lightweight for terms-config
    focusDomains: ['programming', 'data-science', 'design'],
    excludeTerms: ['the', 'and', 'or', 'but', 'is', 'are'],
  });
} catch (error) {
  logger.warn('Taxonomy manager initialization failed, using static terms only:', error);
}

export const TECHNICAL_TERMS = {
  // Programming languages and frameworks
  languages: [
    'javascript',
    'typescript',
    'python',
    'java',
    'csharp',
    'cpp',
    'rust',
    'go',
    'php',
    'ruby',
    'swift',
    'kotlin',
    'dart',
    'scala',
    'r',
    'matlab',
    'react',
    'vue',
    'angular',
    'svelte',
    'node',
    'express',
    'fastapi',
    'django',
    'flask',
    'spring',
    'laravel',
    'rails',
    'next',
    'nuxt',
  ],

  // Core technical concepts
  coreConcepts: [
    'api',
    'database',
    'framework',
    'library',
    'service',
    'component',
    'algorithm',
    'datastructure',
    'encryption',
    'authentication',
    'authorization',
    'middleware',
    'orm',
    'crud',
    'rest',
    'graphql',
    'websocket',
    'http',
    'tcp',
    'udp',
    'ssl',
    'tls',
    'oauth',
    'jwt',
    'json',
    'xml',
    'yaml',
  ],

  // Architecture and design patterns
  architecture: [
    'microservices',
    'monolith',
    'serverless',
    'container',
    'docker',
    'kubernetes',
    'mvc',
    'mvvm',
    'mvp',
    'solid',
    'clean',
    'hexagonal',
    'event-driven',
    'pub-sub',
    'observer',
    'singleton',
    'factory',
    'strategy',
    'decorator',
    'adapter',
    'facade',
    'proxy',
    'command',
    'repository',
    'unit-of-work',
  ],

  // Development practices
  practices: [
    'testing',
    'debugging',
    'profiling',
    'optimization',
    'refactoring',
    'ci-cd',
    'devops',
    'agile',
    'scrum',
    'kanban',
    'tdd',
    'bdd',
    'code-review',
    'pair-programming',
    'version-control',
    'git',
    'deployment',
    'monitoring',
    'logging',
    'analytics',
  ],

  // Complex/Advanced terms
  complex: [
    'algorithm',
    'optimization',
    'architecture',
    'scalability',
    'concurrency',
    'asynchronous',
    'microservices',
    'distributed',
    'polymorphism',
    'abstraction',
    'dependency-injection',
    'inversion-of-control',
    'aspect-oriented',
    'functional-programming',
    'reactive',
    'event-sourcing',
    'cqrs',
  ],

  // Data and storage
  data: [
    'database',
    'sql',
    'nosql',
    'mongodb',
    'postgresql',
    'mysql',
    'redis',
    'elasticsearch',
    'kafka',
    'rabbitmq',
    'cache',
    'cdn',
    'aws',
    'azure',
    'gcp',
    'blob',
    'queue',
    'stream',
    'etl',
    'data-pipeline',
    'analytics',
  ],

  // Frontend specific
  frontend: [
    'html',
    'css',
    'sass',
    'less',
    'webpack',
    'vite',
    'babel',
    'eslint',
    'prettier',
    'component',
    'state',
    'props',
    'hooks',
    'context',
    'redux',
    'zustand',
    'router',
    'spa',
    'pwa',
    'ssr',
    'ssg',
    'responsive',
    'accessibility',
  ],

  // Backend specific
  backend: [
    'server',
    'endpoint',
    'middleware',
    'controller',
    'model',
    'service',
    'repository',
    'entity',
    'migration',
    'seeder',
    'validation',
    'sanitization',
    'rate-limiting',
    'throttling',
    'circuit-breaker',
    'load-balancer',
  ],
};

export const DIFFICULTY_TERMS = {
  beginner: [
    'beginner',
    'intro',
    'introduction',
    'basics',
    'fundamentals',
    'getting-started',
    'tutorial',
    'guide',
    'learn',
    'first',
    'start',
    'simple',
    'easy',
    'overview',
    'primer',
    'crash-course',
    'hello-world',
  ],

  intermediate: [
    'intermediate',
    'practical',
    'hands-on',
    'building',
    'creating',
    'developing',
    'implementing',
    'working-with',
    'using',
    'applying',
    'component',
    'function',
    'method',
    'technique',
    'approach',
    'pattern',
    'example',
  ],

  advanced: [
    'advanced',
    'expert',
    'deep-dive',
    'best-practices',
    'optimization',
    'performance',
    'scaling',
    'enterprise',
    'production',
    'professional',
    'complex',
    'sophisticated',
    'architecture',
    'design-patterns',
    'mastery',
  ],
};

export const CONTENT_TAGS = {
  common: [
    'tutorial',
    'guide',
    'best-practices',
    'development',
    'programming',
    'documentation',
    'example',
    'demo',
    'sample',
    'reference',
  ],

  contentTypes: [
    'article',
    'blog',
    'documentation',
    'tutorial',
    'guide',
    'reference',
    'example',
    'demo',
    'video',
    'course',
    'book',
    'paper',
    'slides',
  ],

  topics: [
    'web-development',
    'mobile-development',
    'data-science',
    'machine-learning',
    'artificial-intelligence',
    'devops',
    'security',
    'testing',
    'performance',
    'ui-ux',
    'design',
    'database',
    'cloud',
    'backend',
    'frontend',
  ],
};

export const SENTIMENT_WORDS = {
  positive: [
    'good',
    'great',
    'excellent',
    'best',
    'effective',
    'useful',
    'amazing',
    'fantastic',
    'outstanding',
    'perfect',
    'awesome',
    'brilliant',
    'superb',
    'wonderful',
    'impressive',
    'remarkable',
    'exceptional',
    'innovative',
  ],

  negative: [
    'bad',
    'poor',
    'difficult',
    'problem',
    'issue',
    'error',
    'terrible',
    'awful',
    'horrible',
    'worst',
    'useless',
    'broken',
    'failed',
    'wrong',
    'confusing',
    'frustrating',
    'annoying',
    'disappointing',
    'problematic',
  ],

  neutral: [
    'the',
    'this',
    'that',
    'when',
    'where',
    'how',
    'why',
    'what',
    'which',
    'some',
    'any',
    'all',
    'many',
    'few',
    'more',
    'most',
    'other',
    'such',
  ],
};

export const PLATFORM_TERMS = {
  reddit: [
    'discussion',
    'tutorial',
    'question',
    'answer',
    'community',
    'thread',
    'post',
    'comment',
    'subreddit',
    'upvote',
    'karma',
    'ama',
  ],

  youtube: [
    'video',
    'tutorial',
    'demo',
    'walkthrough',
    'explanation',
    'review',
    'channel',
    'playlist',
    'subscribe',
    'like',
    'comment',
    'live',
  ],

  github: [
    'repository',
    'repo',
    'code',
    'source',
    'project',
    'commit',
    'pull-request',
    'issue',
    'fork',
    'star',
    'clone',
    'branch',
    'merge',
    'release',
  ],

  web: [
    'website',
    'blog',
    'article',
    'documentation',
    'reference',
    'manual',
    'wiki',
    'page',
    'site',
    'portal',
    'platform',
    'resource',
  ],
};

export const EVENT_TERMS = {
  importantEvents: [
    'agent.initialized',
    'agent.shutdown',
    'content.discovered',
    'content.processed',
    'error.occurred',
    'cache.hit',
    'cache.miss',
    'discovery.started',
    'discovery.completed',
  ],

  systemEvents: ['startup', 'shutdown', 'error', 'warning', 'info', 'debug', 'trace'],
};

/**
 * Get all technical terms as a flat array
 * Enhanced with taxonomy system when available
 */
export function getAllTechnicalTerms(): string[] {
  const staticTerms = [
    ...TECHNICAL_TERMS.languages,
    ...TECHNICAL_TERMS.coreConcepts,
    ...TECHNICAL_TERMS.architecture,
    ...TECHNICAL_TERMS.practices,
    ...TECHNICAL_TERMS.data,
    ...TECHNICAL_TERMS.frontend,
    ...TECHNICAL_TERMS.backend,
  ];

  // Add learned terms if taxonomy system is available
  if (taxonomyManager) {
    try {
      const learnedTerms = taxonomyManager
        .getTermsForDomain('programming')
        .concat(taxonomyManager.getTermsForDomain('data-science'))
        .map((term: TaxonomyTerm) => term.term);
      return [...new Set([...staticTerms, ...learnedTerms])];
    } catch (error) {
      logger.debug('Failed to get learned terms, using static only:', error);
    }
  }

  return staticTerms;
}

/**
 * Get difficulty-specific terms
 */
export function getDifficultyTerms(difficulty: 'beginner' | 'intermediate' | 'advanced'): string[] {
  switch (difficulty) {
    case 'beginner':
      return DIFFICULTY_TERMS.beginner;
    case 'intermediate':
      return DIFFICULTY_TERMS.intermediate;
    case 'advanced':
      return DIFFICULTY_TERMS.advanced;
    default:
      return DIFFICULTY_TERMS.intermediate;
  }
}

/**
 * Get platform-specific terms
 */
export function getPlatformTerms(platform: 'reddit' | 'youtube' | 'github' | 'web'): string[] {
  switch (platform) {
    case 'reddit':
      return PLATFORM_TERMS.reddit;
    case 'youtube':
      return PLATFORM_TERMS.youtube;
    case 'github':
      return PLATFORM_TERMS.github;
    case 'web':
      return PLATFORM_TERMS.web;
    default:
      return CONTENT_TAGS.common;
  }
}

/**
 * Detect if content contains technical terms
 * Enhanced with taxonomy system when available
 */
export function detectTechnicalTerms(content: string, tokens?: string[]): string[] {
  // Use taxonomy system if available for classification
  if (taxonomyManager) {
    try {
      const classification = taxonomyManager.classifyContent(content);
      const techDomains = classification
        .filter(c => c.domain === 'programming' || c.domain === 'data-science')
        .filter(c => c.confidence > 0.5);

      if (techDomains.length > 0) {
        // Get terms from technical domains
        const technicalTerms: string[] = [];
        techDomains.forEach(domain => {
          const domainTerms = taxonomyManager!
            .getTermsForDomain(domain.domain)
            .map((term: TaxonomyTerm) => term.term);
          technicalTerms.push(...domainTerms);
        });

        if (technicalTerms.length > 0) {
          return [...new Set(technicalTerms)];
        }
      }
    } catch (error) {
      logger.debug('Failed to classify content using taxonomy, falling back to static:', error);
    }
  }

  // Fallback to static term detection
  const contentLower = content.toLowerCase();
  const allTerms = getAllTechnicalTerms();
  const foundTerms: string[] = [];

  // Check for direct matches
  allTerms.forEach(term => {
    if (contentLower.includes(term.toLowerCase())) {
      foundTerms.push(term);
    }
  });

  // Check tokens if provided
  if (tokens) {
    tokens.forEach(token => {
      if (allTerms.some(term => term.toLowerCase() === token.toLowerCase())) {
        foundTerms.push(token);
      }
    });
  }

  return [...new Set(foundTerms)];
}

/**
 * Assess content complexity based on terms
 * Enhanced with taxonomy system when available
 */
export function assessContentComplexity(content: string): 'low' | 'medium' | 'high' {
  // Use taxonomy system if available
  if (taxonomyManager) {
    try {
      const classification = taxonomyManager.classifyContent(content);
      const avgConfidence =
        classification.reduce((sum, c) => sum + c.confidence, 0) / classification.length;

      // Higher confidence in technical domains indicates higher complexity
      if (avgConfidence > 0.8) return 'high';
      if (avgConfidence > 0.5) return 'medium';
      if (avgConfidence > 0.2) return 'low';
    } catch (error) {
      logger.debug('Failed to assess complexity using taxonomy, falling back to static:', error);
    }
  }

  // Fallback to static complexity assessment
  const contentLower = content.toLowerCase();

  const complexTermsFound = TECHNICAL_TERMS.complex.filter(term =>
    contentLower.includes(term.toLowerCase())
  ).length;

  const beginnerTermsFound = DIFFICULTY_TERMS.beginner.filter(term =>
    contentLower.includes(term.toLowerCase())
  ).length;

  const advancedTermsFound = DIFFICULTY_TERMS.advanced.filter(term =>
    contentLower.includes(term.toLowerCase())
  ).length;

  if (complexTermsFound >= 3 || advancedTermsFound >= 2) return 'high';
  if (complexTermsFound >= 1 || beginnerTermsFound === 0) return 'medium';
  return 'low';
}
