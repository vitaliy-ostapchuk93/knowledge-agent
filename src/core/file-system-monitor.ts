/**
 * File System Monitor - Core Building Block
 * Monitors file system changes and processes markdown files
 * Implements the File System Integration MVP feature
 */

import { watch, FSWatcher } from 'fs';
import { promises as fs } from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import { IEventBus } from '../interfaces/index.js';
import { Event } from '../types/index.js';

export interface IFileSystemMonitor {
  /**
   * Start monitoring specified directories
   */
  startWatching(directories: string[]): Promise<void>;

  /**
   * Stop monitoring all directories
   */
  stopWatching(): Promise<void>;

  /**
   * Get currently monitored directories
   */
  getWatchedDirectories(): string[];

  /**
   * Manually scan directories for existing files
   */
  scanDirectories(directories: string[]): Promise<FileInfo[]>;
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  modified: Date;
  isMarkdown: boolean;
  platform?: 'obsidian' | 'logseq' | 'generic';
}

export interface FileChangeEvent {
  type: 'added' | 'changed' | 'removed';
  file: FileInfo;
  timestamp: Date;
}

export class FileSystemMonitor extends EventEmitter implements IFileSystemMonitor {
  private watchers: Map<string, FSWatcher> = new Map();
  private watchedDirectories: Set<string> = new Set();
  private eventBus?: IEventBus;

  constructor(eventBus?: IEventBus) {
    super();
    this.eventBus = eventBus;
  }

  /**
   * Start monitoring specified directories
   */
  async startWatching(directories: string[]): Promise<void> {
    console.log('👁️ Starting file system monitoring...');

    for (const directory of directories) {
      try {
        // Verify directory exists
        const stats = await fs.stat(directory);
        if (!stats.isDirectory()) {
          console.warn(`⚠️ Skipping ${directory}: not a directory`);
          continue;
        }

        // Start watching
        const watcher = watch(directory, { recursive: true }, (eventType, filename) => {
          if (filename) {
            this.handleFileChange(eventType, path.join(directory, filename));
          }
        });

        this.watchers.set(directory, watcher);
        this.watchedDirectories.add(directory);

        console.log(`👁️ Watching directory: ${directory}`);

        // Initial scan
        const files = await this.scanDirectory(directory);
        for (const file of files) {
          this.publishFileEvent('added', file);
        }
      } catch (error) {
        console.error(`❌ Failed to watch directory ${directory}:`, error);
      }
    }

    this.publishEvent({
      type: 'filesystem.monitoring_started',
      timestamp: new Date(),
      source: 'FileSystemMonitor',
      data: {
        directories: Array.from(this.watchedDirectories),
        watcherCount: this.watchers.size,
      },
    });

    console.log(`✅ File system monitoring started for ${this.watchers.size} directories`);
  }

  /**
   * Stop monitoring all directories
   */
  async stopWatching(): Promise<void> {
    console.log('🛑 Stopping file system monitoring...');

    for (const [directory, watcher] of this.watchers) {
      watcher.close();
      console.log(`🛑 Stopped watching: ${directory}`);
    }

    this.watchers.clear();
    this.watchedDirectories.clear();

    this.publishEvent({
      type: 'filesystem.monitoring_stopped',
      timestamp: new Date(),
      source: 'FileSystemMonitor',
      data: { stoppedWatchers: this.watchers.size },
    });

    console.log('✅ File system monitoring stopped');
  }

  /**
   * Get currently monitored directories
   */
  getWatchedDirectories(): string[] {
    return Array.from(this.watchedDirectories);
  }

  /**
   * Manually scan directories for existing files
   */
  async scanDirectories(directories: string[]): Promise<FileInfo[]> {
    const allFiles: FileInfo[] = [];

    for (const directory of directories) {
      const files = await this.scanDirectory(directory);
      allFiles.push(...files);
    }

    return allFiles;
  }

  /**
   * Handle file system change events
   */
  private async handleFileChange(eventType: string, filePath: string): Promise<void> {
    try {
      // Check if file exists and is markdown
      const fileInfo = await this.getFileInfo(filePath);

      if (!fileInfo || !fileInfo.isMarkdown) {
        return; // Skip non-markdown files
      }

      const changeType =
        eventType === 'rename'
          ? await fs
              .access(filePath)
              .then(() => 'added')
              .catch(() => 'removed')
          : 'changed';

      this.publishFileEvent(changeType as 'added' | 'changed' | 'removed', fileInfo);
    } catch {
      // File might have been deleted or moved
      console.log(`📁 File change ignored: ${filePath}`);
    }
  }

  /**
   * Scan a single directory for markdown files
   */
  private async scanDirectory(directory: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];

    try {
      const entries = await fs.readdir(directory, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          // Recursively scan subdirectories
          const subFiles = await this.scanDirectory(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile()) {
          const fileInfo = await this.getFileInfo(fullPath);
          if (fileInfo && fileInfo.isMarkdown) {
            files.push(fileInfo);
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to scan directory ${directory}:`, error);
    }

    return files;
  }

  /**
   * Get file information
   */
  private async getFileInfo(filePath: string): Promise<FileInfo | null> {
    try {
      const stats = await fs.stat(filePath);
      const name = path.basename(filePath);
      const isMarkdown = path.extname(filePath).toLowerCase() === '.md';

      if (!isMarkdown) {
        return null;
      }

      // Detect platform based on file structure
      let platform: 'obsidian' | 'logseq' | 'generic' = 'generic';

      // Obsidian detection (has .obsidian folder in parent directories)
      if (await this.hasObsidianFolder(filePath)) {
        platform = 'obsidian';
      }
      // Logseq detection (has logseq folder or specific file patterns)
      else if ((await this.hasLogseqFolder(filePath)) || name.includes('blocks_')) {
        platform = 'logseq';
      }

      return {
        path: filePath,
        name,
        size: stats.size,
        modified: stats.mtime,
        isMarkdown: true,
        platform,
      };
    } catch {
      return null;
    }
  }

  /**
   * Check if file is in an Obsidian vault
   */
  private async hasObsidianFolder(filePath: string): Promise<boolean> {
    let dir = path.dirname(filePath);
    const root = path.parse(dir).root;

    while (dir !== root) {
      try {
        await fs.access(path.join(dir, '.obsidian'));
        return true;
      } catch {
        dir = path.dirname(dir);
      }
    }

    return false;
  }

  /**
   * Check if file is in a Logseq directory
   */
  private async hasLogseqFolder(filePath: string): Promise<boolean> {
    let dir = path.dirname(filePath);
    const root = path.parse(dir).root;
    let levelsUp = 0;
    const maxLevels = 3; // Only check up to 3 levels up to avoid false positives

    while (dir !== root && levelsUp < maxLevels) {
      try {
        const logseqPath = path.join(dir, 'logseq');
        await fs.access(logseqPath);
        // Ensure it's actually a directory
        const stats = await fs.stat(logseqPath);
        if (stats.isDirectory()) {
          return true;
        }
      } catch {
        try {
          const dotLogseqPath = path.join(dir, '.logseq');
          await fs.access(dotLogseqPath);
          // Ensure it's actually a directory
          const stats = await fs.stat(dotLogseqPath);
          if (stats.isDirectory()) {
            return true;
          }
        } catch {
          // Continue to parent directory
        }
      }
      dir = path.dirname(dir);
      levelsUp++;
    }

    return false;
  }

  /**
   * Publish file change event
   */
  private publishFileEvent(type: 'added' | 'changed' | 'removed', file: FileInfo): void {
    const fileEvent: FileChangeEvent = {
      type,
      file,
      timestamp: new Date(),
    };

    // Emit on EventEmitter
    this.emit('fileChange', fileEvent);

    // Publish to event bus
    this.publishEvent({
      type: `filesystem.file_${type}`,
      timestamp: new Date(),
      source: 'FileSystemMonitor',
      data: {
        filePath: file.path,
        fileName: file.name,
        platform: file.platform,
        size: file.size,
      },
    });

    console.log(`📄 File ${type}: ${file.name} (${file.platform})`);
  }

  /**
   * Publish event to event bus
   */
  private publishEvent(event: Event): void {
    if (this.eventBus) {
      this.eventBus.publish(event);
    }
  }
}
