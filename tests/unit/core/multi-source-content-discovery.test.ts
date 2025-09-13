/**
 * Multi-Source Content Discovery Tests
 * Tests for the multi-source content discovery coordinator
 */

import { describe, expect, test, beforeEach } from 'bun:test';
import { MultiSourceContentDiscovery } from '@/core/multi-source-content-discovery.ts';
import { MockContentDiscovery } from '@/discovery/mock-content-discovery.ts';
import { ContentSource } from '@/types';

describe('MultiSourceContentDiscovery', () => {
  let multiSourceDiscovery: MultiSourceContentDiscovery;
  let mockDiscovery1: MockContentDiscovery;
  let mockDiscovery2: MockContentDiscovery;

  beforeEach(() => {
    multiSourceDiscovery = new MultiSourceContentDiscovery();
    mockDiscovery1 = new MockContentDiscovery();
    mockDiscovery2 = new MockContentDiscovery();
  });

  test('should register and list sources', () => {
    const config1 = {
      source: ContentSource.WEB,
      enabled: true,
      reliabilityWeight: 0.8,
      maxResults: 5,
      timeout: 5000
    };

    const config2 = {
      source: ContentSource.YOUTUBE,
      enabled: true,
      reliabilityWeight: 0.7,
      maxResults: 3,
      timeout: 3000
    };

    multiSourceDiscovery.registerSource(ContentSource.WEB, mockDiscovery1, config1);
    multiSourceDiscovery.registerSource(ContentSource.YOUTUBE, mockDiscovery2, config2);

    const availableSources = multiSourceDiscovery.getAvailableSources();
    expect(availableSources).toContain(ContentSource.WEB);
    expect(availableSources).toContain(ContentSource.YOUTUBE);
    expect(availableSources).toHaveLength(2);
  });

  test('should discover content from multiple sources', async () => {
    const config1 = {
      source: ContentSource.WEB,
      enabled: true,
      reliabilityWeight: 0.8,
      maxResults: 3,
      timeout: 5000
    };

    const config2 = {
      source: ContentSource.REDDIT,
      enabled: true,
      reliabilityWeight: 0.6,
      maxResults: 2,
      timeout: 3000
    };

    multiSourceDiscovery.registerSource(ContentSource.WEB, mockDiscovery1, config1);
    multiSourceDiscovery.registerSource(ContentSource.REDDIT, mockDiscovery2, config2);

    const result = await multiSourceDiscovery.discoverFromMultipleSources('typescript');

    expect(result.items).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.sources).toContain(ContentSource.WEB);
    expect(result.sources).toContain(ContentSource.REDDIT);
    expect(result.qualityMetrics).toBeDefined();
    expect(result.performanceMetrics).toBeDefined();
    expect(result.sourceBreakdown).toBeDefined();
  });

  test('should handle disabled sources', async () => {
    const config1 = {
      source: ContentSource.WEB,
      enabled: true,
      reliabilityWeight: 0.8,
      maxResults: 5,
      timeout: 5000
    };

    const config2 = {
      source: ContentSource.YOUTUBE,
      enabled: false, // Disabled
      reliabilityWeight: 0.7,
      maxResults: 3,
      timeout: 3000
    };

    multiSourceDiscovery.registerSource(ContentSource.WEB, mockDiscovery1, config1);
    multiSourceDiscovery.registerSource(ContentSource.YOUTUBE, mockDiscovery2, config2);

    const result = await multiSourceDiscovery.discoverFromMultipleSources('react hooks');

    expect(result.sources).toContain(ContentSource.WEB);
    expect(result.sources).not.toContain(ContentSource.YOUTUBE);
  });

  test('should throw error when no enabled sources', async () => {
    const config = {
      source: ContentSource.WEB,
      enabled: false,
      reliabilityWeight: 0.8,
      maxResults: 5,
      timeout: 5000
    };

    multiSourceDiscovery.registerSource(ContentSource.WEB, mockDiscovery1, config);

    await expect(async () => {
      await multiSourceDiscovery.discoverFromMultipleSources('javascript');
    }).toThrow('No enabled sources available for discovery');
  });

  test('should update source configuration', () => {
    const config = {
      source: ContentSource.WEB,
      enabled: true,
      reliabilityWeight: 0.5,
      maxResults: 5,
      timeout: 5000
    };

    multiSourceDiscovery.registerSource(ContentSource.WEB, mockDiscovery1, config);

    multiSourceDiscovery.updateSourceConfig(ContentSource.WEB, {
      reliabilityWeight: 0.9,
      maxResults: 10
    });

    const updatedConfig = multiSourceDiscovery.getSourceConfig(ContentSource.WEB);
    expect(updatedConfig?.reliabilityWeight).toBe(0.9);
    expect(updatedConfig?.maxResults).toBe(10);
    expect(updatedConfig?.enabled).toBe(true); // Should remain unchanged
  });

  test('should unregister sources', () => {
    const config = {
      source: ContentSource.WEB,
      enabled: true,
      reliabilityWeight: 0.8,
      maxResults: 5,
      timeout: 5000
    };

    multiSourceDiscovery.registerSource(ContentSource.WEB, mockDiscovery1, config);
    expect(multiSourceDiscovery.getAvailableSources()).toContain(ContentSource.WEB);

    multiSourceDiscovery.unregisterSource(ContentSource.WEB);
    expect(multiSourceDiscovery.getAvailableSources()).not.toContain(ContentSource.WEB);
  });

  test('should test different aggregation strategies', async () => {
    const config1 = {
      source: ContentSource.WEB,
      enabled: true,
      reliabilityWeight: 0.8,
      maxResults: 5,
      timeout: 5000
    };

    const config2 = {
      source: ContentSource.REDDIT,
      enabled: true,
      reliabilityWeight: 0.6,
      maxResults: 5,
      timeout: 3000
    };

    multiSourceDiscovery.registerSource(ContentSource.WEB, mockDiscovery1, config1);
    multiSourceDiscovery.registerSource(ContentSource.REDDIT, mockDiscovery2, config2);

    // Test weighted merge strategy
    const weightedResult = await multiSourceDiscovery.discoverFromMultipleSources(
      'machine learning', 
      { maxResults: 10 }, 
      'weighted_merge'
    );

    // Test quality first strategy
    const qualityResult = await multiSourceDiscovery.discoverFromMultipleSources(
      'machine learning', 
      { maxResults: 10 }, 
      'quality_first'
    );

    // Test diversity max strategy
    const diversityResult = await multiSourceDiscovery.discoverFromMultipleSources(
      'machine learning', 
      { maxResults: 10 }, 
      'diversity_max'
    );

    // All strategies should return results
    expect(weightedResult.items.length).toBeGreaterThan(0);
    expect(qualityResult.items.length).toBeGreaterThan(0);
    expect(diversityResult.items.length).toBeGreaterThan(0);

    // Results should have proper structure
    expect(weightedResult.qualityMetrics.averageRelevance).toBeGreaterThan(0);
    expect(qualityResult.performanceMetrics.fastestSource).toBeDefined();
    expect(diversityResult.sourceBreakdown).toBeDefined();
  });
});