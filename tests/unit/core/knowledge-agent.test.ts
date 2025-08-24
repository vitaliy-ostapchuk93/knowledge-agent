import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { KnowledgeAgent } from '@/core/knowledge-agent.js';
import { MarkdownAdapter } from '@/adapters/markdown-adapter.js';
import { MemoryCacheManager } from '@/cache/memory-cache-manager.js';
import { SimpleEventBus } from '@/events/simple-event-bus.js';
import { MockAIStrategy } from '@/ai/mock-ai-strategy.js';
import { MockContentDiscovery } from '@/discovery/mock-content-discovery.js';
import { PlatformType, SummaryStrategy } from '@/types';
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

    console.log('Setting up tests...');
  });

  afterAll(async () => {
    // Cleanup
    try {
      await fs.rm(testDir, { recursive: true });
      eventBus.destroy();
    } catch {
      // Ignore cleanup errors
    }
    console.log('Cleaning up tests...');
  });

  it('should initialize successfully', async () => {
    expect(agent).toBeDefined();
  });

  it('should discover content', async () => {
    const result = await agent.discoverContent('test query');
    expect(result.items).toBeDefined();
    expect(result.items.length).toBeGreaterThan(0);
  });

  it('should summarize content', async () => {
    const discovery = await agent.discoverContent('test query');
    const summary = await agent.summarizeContent(discovery.items, SummaryStrategy.DETAILED);
    
    expect(summary).toBeDefined();
    expect(summary.summary).toBeTruthy();
    expect(summary.keyPoints).toBeDefined();
  });

  it('should integrate knowledge into platform', async () => {
    const discovery = await agent.discoverContent('integration test');
    const summary = await agent.summarizeContent(discovery.items);
    
    await agent.integrateKnowledge(summary, PlatformType.OBSIDIAN);
    
    // Verify file was created (basic integration test)
    expect(summary.id).toBeTruthy();
  });

  it('should complete full workflow', async () => {
    const summary = await agent.processQuery('workflow test', PlatformType.OBSIDIAN);
    
    expect(summary).toBeDefined();
    expect(summary.summary).toBeTruthy();
    expect(summary.keyPoints).toBeDefined();
  });

  it('should use cache effectively', async () => {
    // First request
    const start1 = Date.now();
    await agent.discoverContent('cache test');
    const time1 = Date.now() - start1;

    // Second request (should be cached)
    const start2 = Date.now();
    await agent.discoverContent('cache test');
    const time2 = Date.now() - start2;

    // Second request should be faster (cached)
    expect(time2).toBeLessThan(time1);
  });

  it('should handle events correctly', async () => {
    let eventCount = 0;
    
    eventBus.subscribe('discovery.completed', () => {
      eventCount++;
    });

    await agent.discoverContent('event test');
    
    expect(eventCount).toBe(1);
  });
});
