/**
 * File System Monitor Tests
 * Tests the file system monitoring functionality
 */

import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import { FileSystemMonitor } from '@/core/file-system-monitor.ts';
import { SimpleEventBus } from '@/events/simple-event-bus.ts';
import { logger } from '@/utils/logger.ts';
import { promises as fs } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

describe('File System Monitor', () => {
  let monitor: FileSystemMonitor;
  let eventBus: SimpleEventBus;
  let testDir: string;

  beforeEach(async () => {
    eventBus = new SimpleEventBus(50);
    monitor = new FileSystemMonitor(eventBus);

    // Create temporary test directory
    testDir = path.join(tmpdir(), `knowledge-agent-test-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await monitor.stopWatching();

    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  it('should initialize without errors', () => {
    expect(monitor).toBeDefined();
    expect(monitor.getWatchedDirectories()).toEqual([]);
  });

  it('should start and stop watching directories', async () => {
    await monitor.startWatching([testDir]);
    expect(monitor.getWatchedDirectories()).toContain(testDir);

    await monitor.stopWatching();
    expect(monitor.getWatchedDirectories()).toEqual([]);
  });

  it('should scan directories for markdown files', async () => {
    // Create a more isolated test directory to avoid platform false positives
    const isolatedTestDir = path.join(testDir, 'isolated-test');
    await fs.mkdir(isolatedTestDir, { recursive: true });

    // Create test markdown file
    const testFile = path.join(isolatedTestDir, 'test.md');
    await fs.writeFile(testFile, '# Test File\n\nThis is a test markdown file.');

    // Create non-markdown file (should be ignored)
    const txtFile = path.join(isolatedTestDir, 'test.txt');
    await fs.writeFile(txtFile, 'This is not markdown.');

    const files = await monitor.scanDirectories([isolatedTestDir]);

    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('test.md');
    expect(files[0].isMarkdown).toBe(true);
    expect(files[0].platform).toBe('generic');
  });

  it('should detect Obsidian vault structure', async () => {
    // Create .obsidian directory
    const obsidianDir = path.join(testDir, '.obsidian');
    await fs.mkdir(obsidianDir, { recursive: true });

    // Create markdown file in vault
    const testFile = path.join(testDir, 'obsidian-note.md');
    await fs.writeFile(testFile, '# Obsidian Note\n\n[[Link to another note]]');

    const files = await monitor.scanDirectories([testDir]);

    expect(files).toHaveLength(1);
    expect(files[0].platform).toBe('obsidian');
  });

  it('should detect Logseq directory structure', async () => {
    // Create logseq directory
    const logseqDir = path.join(testDir, 'logseq');
    await fs.mkdir(logseqDir, { recursive: true });

    // Create markdown file in Logseq format
    const testFile = path.join(testDir, 'logseq-note.md');
    await fs.writeFile(testFile, '- This is a Logseq note\n  - With nested content');

    const files = await monitor.scanDirectories([testDir]);

    expect(files).toHaveLength(1);
    expect(files[0].platform).toBe('logseq');
  });

  it('should emit file change events', async () => {
    const fileChangeEvents: unknown[] = [];

    monitor.on('fileChange', event => {
      fileChangeEvents.push(event);
    });

    await monitor.startWatching([testDir]);

    // Create a new markdown file
    const testFile = path.join(testDir, 'new-file.md');
    await fs.writeFile(testFile, '# New File\n\nContent');

    // Give the file watcher some time to detect the change
    await new Promise(resolve => setTimeout(resolve, 100));

    // We should have at least one file event
    expect(fileChangeEvents.length).toBeGreaterThan(0);
  });

  it('should publish events to event bus', async () => {
    const events: unknown[] = [];

    // Use pattern subscription for wildcard matching
    eventBus.subscribePattern(/^filesystem\./, event => {
      events.push(event);
    });

    // Small delay to ensure subscription is registered
    await new Promise(resolve => setTimeout(resolve, 10));

    await monitor.startWatching([testDir]);

    // Small delay to allow event to be published
    await new Promise(resolve => setTimeout(resolve, 50));

    // Should have published monitoring started event
    expect(events.length).toBeGreaterThan(0);
    const hasStartedEvent = events.some(
      (e: unknown) =>
        typeof e === 'object' &&
        e !== null &&
        'type' in e &&
        (e as { type: string }).type === 'filesystem.monitoring_started'
    );
    expect(hasStartedEvent).toBe(true);
  });

  it('should handle non-existent directories gracefully', async () => {
    const nonExistentDir = path.join(testDir, 'does-not-exist');

    // Mock the logger to suppress warning output during this test
    const warnSpy = spyOn(logger, 'warn').mockImplementation(() => {});
    
    try {
      // Should not throw error
      await expect(monitor.startWatching([nonExistentDir])).resolves.toBeUndefined();

      // Should not add non-existent directory to watched list
      expect(monitor.getWatchedDirectories()).not.toContain(nonExistentDir);
      
      // Verify that a warning was logged (but suppressed)
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Directory not found'));
    } finally {
      // Restore the original logger function
      warnSpy.mockRestore();
    }
  });

  it('should scan nested directories recursively', async () => {
    // Create nested directory structure
    const subDir = path.join(testDir, 'subfolder');
    await fs.mkdir(subDir, { recursive: true });

    const nestedSubDir = path.join(subDir, 'nested');
    await fs.mkdir(nestedSubDir, { recursive: true });

    // Create markdown files at different levels
    await fs.writeFile(path.join(testDir, 'root.md'), '# Root file');
    await fs.writeFile(path.join(subDir, 'sub.md'), '# Sub file');
    await fs.writeFile(path.join(nestedSubDir, 'nested.md'), '# Nested file');

    const files = await monitor.scanDirectories([testDir]);

    expect(files).toHaveLength(3);

    const fileNames = files.map(f => f.name).sort();
    expect(fileNames).toEqual(['nested.md', 'root.md', 'sub.md']);
  });

  it('should provide accurate file information', async () => {
    const testFile = path.join(testDir, 'info-test.md');
    const content = '# File Info Test\n\nThis file is for testing file information extraction.';
    await fs.writeFile(testFile, content);

    const files = await monitor.scanDirectories([testDir]);

    expect(files).toHaveLength(1);

    const file = files[0];
    expect(file.name).toBe('info-test.md');
    expect(file.path).toBe(testFile);
    expect(file.isMarkdown).toBe(true);
    expect(file.size).toBe(content.length);
    expect(file.modified).toBeInstanceOf(Date);
  });
});
