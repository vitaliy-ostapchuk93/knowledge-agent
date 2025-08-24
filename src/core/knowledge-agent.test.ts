import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { KnowledgeAgent } from '../core/knowledge-agent.js';
import { MarkdownAdapter } from '../adapters/markdown-adapter.js';
import { MemoryCacheManager } from '../cache/memory-cache-manager.js';
import { SimpleEventBus } from '../events/simple-event-bus.js';
import { MockAIStrategy } from '../ai/mock-ai-strategy.js';
import { MockContentDiscovery } from '../discovery/mock-content-discovery.js';
import { PlatformType, SummaryStrategy } from '../types/index.js';
import { promises as fs } from 'fs';
import path from 'path';

describe('Universal Knowledge Agent MVP', () => {
  let testDir: string;
  let agent: KnowledgeAgent;
  let eventBus: SimpleEventBus;
  let cacheManager: MemoryCacheManager;

  beforeAll(async () => {
    // Setup test environment
    testDir = path.join(process.cwd(), 'test-knowledge-base');
    await fs.mkdir(testDir, { recursive: true });

    // Create components
    eventBus = new SimpleEventBus();
    cacheManager = new MemoryCacheManager();
    const markdownAdapter = new MarkdownAdapter(testDir);
    const mockAIStrategy = new MockAIStrategy();
    const mockContentDiscovery = new MockContentDiscovery();

    // Initialize agent
    agent = new KnowledgeAgent({
      watchDirectories: [testDir],
      outputDirectory: testDir,
      cacheEnabled: true,
      aiProvider: {
        type: 'openai',
        apiKey: 'test-key',
      },
      discovery: {
        maxResults: 5,
        sources: ['test'],
      },
    });

    await agent.initialize(
      [markdownAdapter],
      [mockAIStrategy],
      cacheManager,
      eventBus,
      mockContentDiscovery
    );

    // Initialize agent
    agent = new KnowledgeAgent({
      watchDirectories: [testDir],
      outputDirectory: testDir,
      cacheEnabled: true,
      aiProvider: {
        type: 'openai',
        apiKey: 'test-key',
      },
      discovery: {
        maxResults: 5,
        sources: ['test'],
      },
    });

    await agent.initialize([markdownAdapter], [mockAIStrategy], cacheManager, eventBus);
  });

  afterAll(async () => {
    // Cleanup
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Could not clean up test directory:', error);
    }

    cacheManager.destroy();
    eventBus.destroy();
  });

  it('should initialize successfully', () => {
    expect(agent).toBeDefined();
    expect(agent.getAvailablePlatforms()).toContain(PlatformType.OBSIDIAN);
  });

  it('should discover content', async () => {
    const result = await agent.discoverContent('test query', {
      query: 'test query',
      maxResults: 3,
    });

    expect(result).toBeDefined();
    expect(result.items).toBeDefined();
    expect(result.totalFound).toBeGreaterThan(0);
    expect(result.searchTime).toBeGreaterThan(0);
  });

  it('should summarize content', async () => {
    const discoveryResult = await agent.discoverContent('test query', {
      query: 'test query',
    });

    const summary = await agent.summarizeContent(discoveryResult.items, SummaryStrategy.DETAILED);

    expect(summary).toBeDefined();
    expect(summary.id).toBeDefined();
    expect(summary.summary).toBeDefined();
    expect(summary.keyPoints.length).toBeGreaterThan(0);
    expect(summary.actionableItems.length).toBeGreaterThan(0);
  });

  it('should integrate knowledge into platform', async () => {
    const discoveryResult = await agent.discoverContent('integration test', {
      query: 'integration test',
    });

    const summary = await agent.summarizeContent(discoveryResult.items);
    await agent.integrateKnowledge(summary, PlatformType.OBSIDIAN);

    // Check if file was created
    const files = await fs.readdir(testDir);
    const markdownFiles = files.filter(f => f.endsWith('.md'));
    expect(markdownFiles.length).toBeGreaterThan(0);
  });

  it('should complete full workflow', async () => {
    const summary = await agent.processQuery('workflow test', PlatformType.OBSIDIAN, {
      query: 'workflow test',
      maxResults: 2,
      summaryStrategy: SummaryStrategy.CONCISE,
    });

    expect(summary).toBeDefined();
    expect(summary.summary).toBeDefined();
    expect(summary.keyPoints.length).toBeGreaterThan(0);
  });

  it('should use cache effectively', async () => {
    const query = 'cache test';

    // Check initial cache stats
    const initialStats = await cacheManager.getStats();
    const initialHits = initialStats.hits;

    // First request
    await agent.discoverContent(query, { query });

    // Second request (should be cached)
    await agent.discoverContent(query, { query });

    // Check cache stats - should have more hits
    const finalStats = await cacheManager.getStats();
    expect(finalStats.hits).toBeGreaterThan(initialHits);
    expect(finalStats.size).toBeGreaterThan(0);
  });

  it('should handle events correctly', () => {
    const eventStats = eventBus.getStats();
    expect(eventStats.subscriptions).toBeGreaterThanOrEqual(0);
    expect(eventStats.historySize).toBeGreaterThan(0);
    expect(eventStats.eventTypes.length).toBeGreaterThan(0);
  });
});
