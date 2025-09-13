/**
 * Content Quality Assessor Tests
 * Tests for comprehensive content quality assessment functionality
 */

import { describe, expect, test, beforeEach } from 'bun:test';
import { ContentQualityAssessor } from '@/core/content-quality-assessor.ts';
import { ContentItem, ContentSource, ContentType } from '@/types';

describe('ContentQualityAssessor', () => {
  let assessor: ContentQualityAssessor;
  let sampleContent: ContentItem;

  beforeEach(() => {
    assessor = new ContentQualityAssessor();

    sampleContent = {
      id: 'test-content-1',
      title: 'Complete Guide to TypeScript Best Practices',
      url: 'https://docs.typescript.org/handbook/best-practices.html',
      content: `# TypeScript Best Practices

This comprehensive guide covers essential TypeScript patterns and practices for modern development.

## Table of Contents
- Type Safety
- Interface Design
- Generic Programming
- Error Handling

## Type Safety
TypeScript provides compile-time type checking that helps prevent runtime errors.

\`\`\`typescript
interface User {
  id: string;
  name: string;
  email: string;
}

function createUser(userData: Partial<User>): User {
  return {
    id: generateId(),
    ...userData
  } as User;
}
\`\`\`

## Interface Design
Design interfaces that are focused and cohesive:

- Keep interfaces small and focused
- Use composition over inheritance
- Leverage union types appropriately

This guide includes practical examples and real-world scenarios to help developers write maintainable TypeScript code.`,
      source: ContentSource.DOCUMENTATION,
      metadata: {
        author: 'TypeScript Team',
        publishDate: new Date(), // Current date for maximum freshness
        tags: ['typescript', 'best-practices', 'programming', 'development'],
        contentType: ContentType.DOCUMENTATION,
        wordCount: 150,
        language: 'en',
      },
      relevanceScore: 0,
      timestamp: new Date(),
    };
  });

  describe('Content Quality Assessment', () => {
    test('should assess high-quality content correctly', async () => {
      const quality = await assessor.assessContentQuality(sampleContent);

      expect(quality.overallScore).toBeGreaterThan(0.6);
      expect(quality.factors).toBeDefined();
      expect(quality.factors.completeness).toBeGreaterThan(0.5);
      expect(quality.factors.credibility).toBeGreaterThan(0.5);
      expect(quality.factors.freshness).toBeGreaterThan(0.7); // Recent content
      expect(quality.breakdown.strengths).toBeDefined();
      expect(quality.breakdown.weaknesses).toBeDefined();
      expect(quality.breakdown.recommendations).toBeDefined();
    });

    test('should assess low-quality content correctly', async () => {
      const lowQualityContent: ContentItem = {
        ...sampleContent,
        title: 'Quick tip',
        content: 'Use types.',
        metadata: {
          ...sampleContent.metadata,
          author: undefined,
          publishDate: new Date('2020-01-01'), // Old content
          tags: [],
          wordCount: 2,
        },
      };

      const quality = await assessor.assessContentQuality(lowQualityContent);

      expect(quality.overallScore).toBeLessThan(0.5);
      expect(quality.factors.completeness).toBeLessThan(0.5);
      expect(quality.factors.freshness).toBeLessThan(0.6); // Old content
      expect(quality.breakdown.weaknesses.length).toBeGreaterThan(0);
      expect(quality.breakdown.recommendations.length).toBeGreaterThan(0);
    });

    test('should handle different domains with custom weights', async () => {
      const programmingAssessment = await assessor.assessContentQuality(sampleContent, {
        domain: 'programming',
        includeContentAnalysis: true,
      });

      const generalAssessment = await assessor.assessContentQuality(sampleContent, {
        domain: 'general',
        includeContentAnalysis: true,
      });

      expect(programmingAssessment.overallScore).toBeDefined();
      expect(generalAssessment.overallScore).toBeDefined();
      // Technical content should score differently in programming vs general domain
      expect(
        Math.abs(programmingAssessment.overallScore - generalAssessment.overallScore)
      ).toBeGreaterThan(0);
    });

    test('should provide detailed quality breakdown', async () => {
      const quality = await assessor.assessContentQuality(sampleContent);

      expect(quality.breakdown.strengths).toBeInstanceOf(Array);
      expect(quality.breakdown.weaknesses).toBeInstanceOf(Array);
      expect(quality.breakdown.recommendations).toBeInstanceOf(Array);

      // Should have some strengths for good content
      expect(quality.breakdown.strengths.length).toBeGreaterThan(0);
    });

    test('should assess content without optional metadata', async () => {
      const minimalContent: ContentItem = {
        ...sampleContent,
        metadata: {
          ...sampleContent.metadata,
          author: undefined,
          publishDate: undefined,
          tags: [],
        },
      };

      const quality = await assessor.assessContentQuality(minimalContent);

      expect(quality.overallScore).toBeGreaterThan(0);
      expect(quality.factors.completeness).toBeGreaterThan(0);
      expect(quality.factors.credibility).toBeLessThan(0.8); // Lower without author
    });
  });

  describe('Source Reliability Assessment', () => {
    test('should assess high-reliability sources correctly', async () => {
      const reliability = await assessor.assessSourceReliability(
        ContentSource.DOCUMENTATION,
        'https://docs.typescript.org/handbook/'
      );

      expect(reliability.reliabilityScore).toBeGreaterThan(0.7);
      expect(reliability.factors.authority).toBeGreaterThan(0.7);
      expect(reliability.factors.consistency).toBeGreaterThan(0.8);
      expect(reliability.classification.type).toBe('official');
      expect(reliability.classification.confidence).toBeGreaterThan(0.8);
    });

    test('should assess community sources correctly', async () => {
      const reliability = await assessor.assessSourceReliability(
        ContentSource.STACKOVERFLOW,
        'https://stackoverflow.com/questions/12345'
      );

      expect(reliability.reliabilityScore).toBeGreaterThan(0.6);
      expect(reliability.factors.validation).toBeGreaterThan(0.8); // High peer validation
      expect(reliability.classification.type).toBe('community');
    });

    test('should cache source reliability assessments', async () => {
      const reliability1 = await assessor.assessSourceReliability(ContentSource.GITHUB);
      const reliability2 = await assessor.assessSourceReliability(ContentSource.GITHUB);

      // Cached results should be identical
      expect(reliability1).toEqual(reliability2);
      expect(reliability1.reliabilityScore).toBeGreaterThan(0.5);
    });

    test('should classify different source types correctly', async () => {
      const docReliability = await assessor.assessSourceReliability(
        ContentSource.DOCUMENTATION,
        'https://docs.python.org/'
      );

      const academicReliability = await assessor.assessSourceReliability(
        ContentSource.ACADEMIC_PAPER,
        'https://research.university.edu/paper.pdf'
      );

      const blogReliability = await assessor.assessSourceReliability(
        ContentSource.TECH_BLOG,
        'https://engineering.company.com/blog/'
      );

      expect(docReliability.classification.type).toBe('official');
      expect(academicReliability.classification.type).toBe('academic');
      expect(blogReliability.classification.type).toBe('commercial');
    });
  });

  describe('Batch Assessment', () => {
    test('should batch assess multiple content items', async () => {
      const contents = [
        sampleContent,
        { ...sampleContent, id: 'test-2', title: 'Another Guide' },
        { ...sampleContent, id: 'test-3', title: 'Third Guide' },
      ];

      const assessments = await assessor.batchAssessQuality(contents);

      expect(assessments).toHaveLength(3);
      assessments.forEach(assessment => {
        expect(assessment.overallScore).toBeGreaterThan(0);
        expect(assessment.factors).toBeDefined();
        expect(assessment.breakdown).toBeDefined();
      });
    });
  });

  describe('Quality Thresholds', () => {
    test('should provide domain-specific quality thresholds', () => {
      const programmingThresholds = assessor.getQualityThresholds('programming');
      const generalThresholds = assessor.getQualityThresholds('general');
      const dataScienceThresholds = assessor.getQualityThresholds('datascience');

      expect(programmingThresholds.minimal).toBeGreaterThan(0);
      expect(programmingThresholds.good).toBeGreaterThan(programmingThresholds.minimal);
      expect(programmingThresholds.excellent).toBeGreaterThan(programmingThresholds.good);

      expect(generalThresholds.minimal).toBeGreaterThan(0);
      expect(dataScienceThresholds.minimal).toBeGreaterThan(0);

      // Data science should have higher standards
      expect(dataScienceThresholds.minimal).toBeGreaterThan(generalThresholds.minimal);
    });

    test('should provide default thresholds for unknown domains', () => {
      const unknownThresholds = assessor.getQualityThresholds('unknown-domain');
      const generalThresholds = assessor.getQualityThresholds('general');

      expect(unknownThresholds).toEqual(generalThresholds);
    });
  });

  describe('Quality Comparison', () => {
    test('should compare content quality accurately', async () => {
      const highQualityContent = sampleContent;

      const lowQualityContent: ContentItem = {
        ...sampleContent,
        id: 'low-quality',
        title: 'tip',
        content: 'Just use it.',
        metadata: {
          ...sampleContent.metadata,
          wordCount: 3,
          tags: [],
          author: undefined,
        },
      };

      const comparison = await assessor.compareQuality(highQualityContent, lowQualityContent);

      expect(comparison.winner).toBe('content1');
      expect(comparison.confidence).toBeGreaterThan(0.3);
      expect(comparison.reasoning.length).toBeGreaterThan(0);
    });

    test('should identify ties in similar quality content', async () => {
      const content1 = sampleContent;
      const content2 = { ...sampleContent, id: 'similar-content' };

      const comparison = await assessor.compareQuality(content1, content2);

      expect(comparison.winner).toBe('tie');
      expect(comparison.reasoning.length).toBeGreaterThan(0);
      expect(comparison.reasoning[0]).toContain('similar quality levels');
    });

    test('should provide detailed comparison reasoning', async () => {
      const technicalContent = sampleContent;

      const simpleContent: ContentItem = {
        ...sampleContent,
        id: 'simple-content',
        content: 'TypeScript is good. Use it for your projects.',
        metadata: {
          ...sampleContent.metadata,
          wordCount: 8,
        },
      };

      const comparison = await assessor.compareQuality(technicalContent, simpleContent);

      expect(comparison.reasoning.length).toBeGreaterThan(0);
      expect(comparison.reasoning.some(reason => reason.includes('Overall quality score'))).toBe(
        true
      );
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle content with missing fields gracefully', async () => {
      const incompleteContent: ContentItem = {
        id: 'incomplete',
        title: '',
        url: '',
        content: '',
        source: ContentSource.WEB,
        metadata: {
          tags: [],
          contentType: ContentType.ARTICLE,
          wordCount: 0,
          language: 'en',
        },
        relevanceScore: 0,
        timestamp: new Date(),
      };

      const quality = await assessor.assessContentQuality(incompleteContent);

      expect(quality.overallScore).toBeGreaterThanOrEqual(0);
      expect(quality.overallScore).toBeLessThanOrEqual(1);
      expect(quality.factors).toBeDefined();
    });

    test('should handle very long content appropriately', async () => {
      const longContent: ContentItem = {
        ...sampleContent,
        content: 'word '.repeat(2000), // 2000 words
        metadata: {
          ...sampleContent.metadata,
          wordCount: 2000,
        },
      };

      const quality = await assessor.assessContentQuality(longContent);

      expect(quality.overallScore).toBeGreaterThan(0);
      expect(quality.factors.depth).toBeGreaterThan(0.2); // Should benefit from length
    });

    test('should handle assessment without content analysis', async () => {
      const quality = await assessor.assessContentQuality(sampleContent, {
        includeContentAnalysis: false,
      });

      expect(quality.overallScore).toBeGreaterThan(0);
      expect(quality.factors.accuracy).toBeGreaterThan(0); // Should use default
      expect(quality.factors.depth).toBeGreaterThan(0); // Should use default
    });
  });
});
