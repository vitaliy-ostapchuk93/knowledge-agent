/**
 * Tests for terms configuration with optional taxonomy integration
 */

import { describe, it, expect } from 'bun:test';
import {
  getAllTechnicalTerms,
  getDifficultyTerms,
  getPlatformTerms,
  detectTechnicalTerms,
  assessContentComplexity,
} from '@/utils/terms-config.ts';

describe('Terms Configuration', () => {
  describe('Static Terms Functionality', () => {
    it('should return technical terms', () => {
      const terms = getAllTechnicalTerms();
      expect(terms).toBeInstanceOf(Array);
      expect(terms.length).toBeGreaterThan(0);
      expect(terms).toContain('javascript');
      expect(terms).toContain('python');
      expect(terms).toContain('react');
    });

    it('should return difficulty-specific terms', () => {
      const beginnerTerms = getDifficultyTerms('beginner');
      const intermediateTerms = getDifficultyTerms('intermediate');
      const advancedTerms = getDifficultyTerms('advanced');

      expect(beginnerTerms).toContain('beginner');
      expect(beginnerTerms).toContain('tutorial');
      expect(intermediateTerms).toContain('intermediate');
      expect(advancedTerms).toContain('advanced');
    });

    it('should return platform-specific terms', () => {
      const redditTerms = getPlatformTerms('reddit');
      const youtubeTerms = getPlatformTerms('youtube');
      const githubTerms = getPlatformTerms('github');

      expect(redditTerms).toContain('subreddit');
      expect(youtubeTerms).toContain('video');
      expect(githubTerms).toContain('repository');
    });
  });

  describe('Content Analysis', () => {
    it('should detect technical terms in content', () => {
      const content = 'This is a JavaScript React tutorial for beginners';
      const detected = detectTechnicalTerms(content);

      expect(detected).toBeInstanceOf(Array);
      expect(detected.length).toBeGreaterThan(0);
    });

    it('should assess content complexity', () => {
      const simpleContent = 'This is a beginner tutorial';
      const complexContent = 'Advanced microservices architecture with distributed systems';

      const simpleComplexity = assessContentComplexity(simpleContent);
      const complexComplexity = assessContentComplexity(complexContent);

      expect(['low', 'medium', 'high']).toContain(simpleComplexity);
      expect(['low', 'medium', 'high']).toContain(complexComplexity);
    });

    it('should handle empty content gracefully', () => {
      const detected = detectTechnicalTerms('');
      const complexity = assessContentComplexity('');

      expect(detected).toBeInstanceOf(Array);
      expect(detected.length).toBe(0);
      expect(['low', 'medium', 'high']).toContain(complexity);
    });
  });

  describe('Backwards Compatibility', () => {
    it('should maintain the same API as before', () => {
      // These should not throw errors
      expect(getAllTechnicalTerms).toBeInstanceOf(Function);
      expect(getDifficultyTerms).toBeInstanceOf(Function);
      expect(getPlatformTerms).toBeInstanceOf(Function);
      expect(detectTechnicalTerms).toBeInstanceOf(Function);
      expect(assessContentComplexity).toBeInstanceOf(Function);
    });

    it('should handle all difficulty levels', () => {
      expect(() => getDifficultyTerms('beginner')).not.toThrow();
      expect(() => getDifficultyTerms('intermediate')).not.toThrow();
      expect(() => getDifficultyTerms('advanced')).not.toThrow();
    });

    it('should handle all platform types', () => {
      expect(() => getPlatformTerms('reddit')).not.toThrow();
      expect(() => getPlatformTerms('youtube')).not.toThrow();
      expect(() => getPlatformTerms('github')).not.toThrow();
      expect(() => getPlatformTerms('web')).not.toThrow();
    });
  });
});
