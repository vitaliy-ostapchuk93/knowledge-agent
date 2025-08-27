/**
 * Markdown Platform Adapter - MVP Implementation
 * Handles generic markdown files for local knowledge management
 */

import { IPlatformAdapter, PlatformMetadata, ExportOptions } from '@/interfaces';
import { PlatformType, FormattedContent, ExistingContent } from '@/types';
import { promises as fs } from 'fs';
import path from 'path';
import { logger } from '@/utils/logger.ts';

export class MarkdownAdapter implements IPlatformAdapter {
  readonly platformType = PlatformType.OBSIDIAN; // Using Obsidian as the base markdown format
  private baseDirectory: string;

  constructor(baseDirectory: string) {
    this.baseDirectory = baseDirectory;
  }

  /**
   * Create new content in the platform
   */
  async createContent(content: FormattedContent): Promise<string> {
    try {
      // Ensure base directory exists
      await fs.mkdir(this.baseDirectory, { recursive: true });

      // Generate filename from title
      const filename = this.sanitizeFilename(content.title) + '.md';
      const filePath = path.join(this.baseDirectory, filename);

      // Create markdown content with frontmatter
      const markdownContent = this.formatAsMarkdown(content);

      // Write file
      await fs.writeFile(filePath, markdownContent, 'utf-8');

      logger.debug(`📝 Created markdown file: ${filename}`);
      return filePath;
    } catch (error) {
      logger.error('❌ Failed to create markdown content:', error);
      throw error;
    }
  }

  /**
   * Link content to existing items
   */
  async linkContent(sourceId: string, targetId: string, relationship?: string): Promise<void> {
    try {
      // Read source file
      const sourceContent = await fs.readFile(sourceId, 'utf-8');

      // Extract target filename for linking
      const targetFilename = path.basename(targetId, '.md');

      // Add link at the end of the file
      const linkText = `\n\n## Related Content\n\n- [[${targetFilename}]]${relationship ? ` (${relationship})` : ''}\n`;

      // Check if the link already exists
      if (!sourceContent.includes(`[[${targetFilename}]]`)) {
        await fs.writeFile(sourceId, sourceContent + linkText, 'utf-8');
        logger.debug(`🔗 Added link from ${path.basename(sourceId)} to ${targetFilename}`);
      }
    } catch (error) {
      logger.error('❌ Failed to search existing content:', error);
      throw error;
    }
  }

  /**
   * Search existing content in the platform
   */
  async searchExisting(query: string): Promise<ExistingContent[]> {
    try {
      const results: ExistingContent[] = [];

      // Read all markdown files in directory
      const files = await this.getMarkdownFiles(this.baseDirectory);

      for (const filePath of files) {
        const content = await fs.readFile(filePath, 'utf-8');
        const stats = await fs.stat(filePath);

        // Simple text search (in a real implementation, this would be more sophisticated)
        if (content.toLowerCase().includes(query.toLowerCase())) {
          const { title, tags, links } = this.parseMarkdownContent(content);

          results.push({
            id: filePath,
            title: title || path.basename(filePath, '.md'),
            content,
            tags,
            links,
            lastModified: stats.mtime,
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('❌ Failed to search existing content:', error);
      throw error;
    }
  }

  /**
   * Update existing content
   */
  async updateContent(id: string, content: FormattedContent): Promise<void> {
    try {
      const markdownContent = this.formatAsMarkdown(content);
      await fs.writeFile(id, markdownContent, 'utf-8');
      logger.debug(`📝 Updated markdown file: ${path.basename(id)}`);
    } catch (error) {
      logger.error('❌ Failed to update content:', error);
      throw error;
    }
  }

  /**
   * Get content by ID
   */
  async getContent(id: string): Promise<ExistingContent | null> {
    try {
      const content = await fs.readFile(id, 'utf-8');
      const stats = await fs.stat(id);
      const { title, tags, links } = this.parseMarkdownContent(content);

      return {
        id,
        title: title || path.basename(id, '.md'),
        content,
        tags,
        links,
        lastModified: stats.mtime,
      };
    } catch (error) {
      if ((error as { code?: string }).code === 'ENOENT') {
        return null;
      }
      logger.error('❌ Failed to get content:', error);
      throw error;
    }
  }

  /**
   * Check platform connectivity and permissions
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Check if base directory is accessible
      await fs.access(this.baseDirectory);

      // Try to create a temporary file to check write permissions
      const tempFile = path.join(this.baseDirectory, '.health-check.tmp');
      await fs.writeFile(tempFile, 'health check', 'utf-8');
      await fs.unlink(tempFile);

      return true;
    } catch (error) {
      logger.warn(`⚠️ Markdown adapter health check failed:`, error);
      return false;
    }
  }

  /**
   * Format content as markdown with frontmatter
   */
  private formatAsMarkdown(content: FormattedContent): string {
    const frontmatter = this.createFrontmatter(content);

    let markdown = '';

    // Add frontmatter
    if (frontmatter) {
      markdown += '---\n';
      markdown += frontmatter;
      markdown += '---\n\n';
    }

    // Add title
    markdown += `# ${content.title}\n\n`;

    // Add content
    markdown += content.content;

    // Add tags if any
    if (content.tags && content.tags.length > 0) {
      markdown += '\n\n## Tags\n\n';
      markdown += content.tags.map(tag => `#${tag}`).join(' ');
    }

    // Add links if any
    if (content.links && content.links.length > 0) {
      markdown += '\n\n## Links\n\n';
      content.links.forEach(link => {
        markdown += `- [${link}](${link})\n`;
      });
    }

    return markdown;
  }

  /**
   * Create YAML frontmatter from content metadata
   */
  private createFrontmatter(content: FormattedContent): string {
    const metadata = content.metadata || {};

    let frontmatter = '';

    // Add basic metadata
    if (metadata.tags && Array.isArray(metadata.tags)) {
      frontmatter += `tags: [${metadata.tags.join(', ')}]\n`;
    }

    if (metadata.difficulty) {
      frontmatter += `difficulty: ${metadata.difficulty}\n`;
    }

    if (metadata.generatedAt) {
      const generatedAt = metadata.generatedAt;
      if (generatedAt instanceof Date) {
        frontmatter += `created: ${generatedAt.toISOString()}\n`;
      } else if (typeof generatedAt === 'string') {
        frontmatter += `created: ${new Date(generatedAt).toISOString()}\n`;
      }
    }

    // Add custom metadata
    for (const [key, value] of Object.entries(metadata)) {
      if (!['tags', 'difficulty', 'generatedAt'].includes(key)) {
        frontmatter += `${key}: ${JSON.stringify(value)}\n`;
      }
    }

    return frontmatter;
  }

  /**
   * Parse markdown content to extract metadata
   */
  private parseMarkdownContent(content: string): {
    title: string | null;
    tags: string[];
    links: string[];
  } {
    const lines = content.split('\n');
    let title: string | null = null;
    const tags: string[] = [];
    const links: string[] = [];

    // Extract title (first # heading)
    for (const line of lines) {
      if (line.startsWith('# ')) {
        title = line.substring(2).trim();
        break;
      }
    }

    // Extract tags (simple #tag format)
    const tagMatches = content.match(/#[\w-]+/g);
    if (tagMatches) {
      tags.push(...tagMatches.map(tag => tag.substring(1)));
    }

    // Extract wikilinks [[link]] and regular links [text](url)
    const wikilinkMatches = content.match(/\[\[([^\]]+)\]\]/g);
    if (wikilinkMatches) {
      links.push(...wikilinkMatches.map(link => link.slice(2, -2)));
    }

    const linkMatches = content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
    if (linkMatches) {
      links.push(
        ...linkMatches.map(link => {
          const match = link.match(/\[([^\]]+)\]\(([^)]+)\)/);
          return match ? match[2] : link;
        })
      );
    }

    return { title, tags: [...new Set(tags)], links: [...new Set(links)] };
  }

  /**
   * Sanitize filename for cross-platform compatibility
   */
  private sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }

  /**
   * Recursively get all markdown files in a directory
   */
  private async getMarkdownFiles(dir: string): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subFiles = await this.getMarkdownFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      logger.warn(`⚠️ Could not read directory ${dir}:`, error);
    }

    return files;
  }

  /**
   * Get platform-specific metadata
   */
  async getMetadata(): Promise<PlatformMetadata> {
    return {
      name: 'Markdown Adapter',
      version: '1.0.0',
      capabilities: {
        supportsLinks: true,
        supportsTags: true,
        supportsImages: false,
        supportsMarkdown: true,
        supportsSearch: true,
        supportsBulkOperations: true,
        supportsVersioning: false,
        supportsBacklinks: true,
      },
      limits: {
        maxContentSize: 10 * 1024 * 1024, // 10MB
        maxLinksPerItem: 100,
        maxTagsPerItem: 50,
        rateLimitPerMinute: 1000,
        bulkOperationLimit: 100,
      },
      configuration: {
        baseDirectory: this.baseDirectory,
        format: 'markdown',
      },
    };
  }

  /**
   * Bulk operations for performance
   */
  async bulkCreateContent(contents: FormattedContent[]): Promise<string[]> {
    const results: string[] = [];
    for (const content of contents) {
      try {
        const id = await this.createContent(content);
        results.push(id);
      } catch (error) {
        logger.warn(`⚠️ Failed to create content "${content.title}":`, error);
        results.push(''); // Failed creation
      }
    }
    return results;
  }

  /**
   * Export content from platform
   */
  async exportContent(_options?: ExportOptions): Promise<ExistingContent[]> {
    // For markdown adapter, export is the same as searching all content
    return this.searchExisting(''); // Empty query returns all content
  }

  /**
   * Import content to platform
   */
  async importContent(contents: FormattedContent[]): Promise<string[]> {
    // For markdown adapter, import is the same as bulk create
    return this.bulkCreateContent(contents);
  }
}
