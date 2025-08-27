/**
 * OpenAI Processing Strategy - MVP Implementation
 * Handles AI-powered content summarization and analysis using OpenAI's API
 */

import { IProcessingStrategy } from '@/interfaces/index.ts';
import {
  Summary,
  ProcessingStrategy,
  ProcessingOptions,
  Analysis,
  CodeExample,
  RelatedLink,
} from '@/types/index.ts';
import OpenAI from 'openai';
import { logger } from '@/utils/logger.ts';

export class OpenAIStrategy implements IProcessingStrategy {
  readonly strategyType = ProcessingStrategy.CLOUD;
  private openai: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.openai = new OpenAI({ apiKey });
    this.model = model;
  }

  /**
   * Summarize content using OpenAI
   */
  async summarize(content: string, options?: ProcessingOptions): Promise<Summary> {
    try {
      const maxTokens = options?.maxTokens || 1000;
      const temperature = options?.temperature || 0.3;

      const systemPrompt = this.createSummarizationPrompt();

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: this.truncateContent(content, 12000) },
        ],
        max_tokens: maxTokens,
        temperature,
      });

      const summaryText = response.choices[0]?.message?.content || 'Failed to generate summary';

      // Parse the structured response
      const parsedSummary = this.parseSummaryResponse(summaryText);

      const summary: Summary = {
        id: `summary-${Date.now()}`,
        originalContent: [], // Will be populated by the caller
        keyPoints: parsedSummary.keyPoints,
        codeExamples: (parsedSummary.codeExamples as CodeExample[]) || [],
        links: (parsedSummary.links as RelatedLink[]) || [],
        tags: parsedSummary.tags || [],
        difficulty:
          (parsedSummary.difficulty as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
        estimatedReadTime: this.estimateReadTime(summaryText),
        generatedAt: new Date(),
        summary: parsedSummary.summary,
        actionableItems: parsedSummary.actionableItems,
      };

      logger.debug(`🤖 Generated AI summary (${summaryText.length} chars)`);
      return summary;
    } catch (error) {
      logger.error('❌ Action item generation failed:', error);
      throw new Error(`AI summarization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Analyze content characteristics
   */
  async analyze(content: string): Promise<Analysis> {
    try {
      const systemPrompt = `You are an expert content analyzer. Analyze the given content and return a JSON object with the following structure:
{
  "sentiment": "positive" | "neutral" | "negative",
  "complexity": "low" | "medium" | "high",
  "topics": ["topic1", "topic2", ...],
  "keyEntities": ["entity1", "entity2", ...],
  "readingLevel": 1-10
}`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: this.truncateContent(content, 8000) },
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const analysisText = response.choices[0]?.message?.content || '{}';

      try {
        const analysis = JSON.parse(analysisText) as Analysis;
        logger.debug(
          `🔍 Analyzed content: ${analysis.complexity} complexity, ${analysis.topics.length} topics`
        );
        return analysis;
      } catch {
        // Fallback analysis if JSON parsing fails
        return {
          sentiment: 'neutral',
          complexity: 'medium',
          topics: this.extractSimpleTopics(content),
          keyEntities: [],
          readingLevel: 5,
        };
      }
    } catch (error) {
      logger.error('❌ Content analysis failed:', error);
      throw new Error(`Content analysis failed: ${(error as Error).message}`);
    }
  }

  /**
   * Extract key information
   */
  async extractKeyPoints(content: string): Promise<string[]> {
    try {
      const systemPrompt = `Extract the most important key points from the content. Return them as a JSON array of strings, with each key point being concise and actionable.`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: this.truncateContent(content, 8000) },
        ],
        max_tokens: 800,
        temperature: 0.2,
      });

      const keyPointsText = response.choices[0]?.message?.content || '[]';

      try {
        const keyPoints = JSON.parse(keyPointsText) as string[];
        return keyPoints.slice(0, 10); // Limit to 10 key points
      } catch {
        // Fallback to simple extraction
        return this.extractSimpleKeyPoints(content);
      }
    } catch (error) {
      logger.error('❌ Key point extraction failed:', error);
      return this.extractSimpleKeyPoints(content);
    }
  }

  /**
   * Generate actionable items
   */
  async generateActionableItems(content: string): Promise<string[]> {
    try {
      const systemPrompt = `Based on the content, generate specific, actionable next steps that a reader could take. Return them as a JSON array of strings. Each item should be concrete and implementable.`;

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: this.truncateContent(content, 8000) },
        ],
        max_tokens: 600,
        temperature: 0.3,
      });

      const actionItemsText = response.choices[0]?.message?.content || '[]';

      try {
        const actionItems = JSON.parse(actionItemsText) as string[];
        return actionItems.slice(0, 8); // Limit to 8 action items
      } catch {
        // Fallback to generic action items
        return [
          'Review the key concepts mentioned',
          'Practice the techniques discussed',
          'Research related topics for deeper understanding',
        ];
      }
    } catch (error) {
      logger.error('❌ Action item generation failed:', error);
      return [
        'Review the content thoroughly',
        'Take notes on important points',
        'Apply the concepts in practice',
      ];
    }
  }

  /**
   * Check if strategy is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Test with a simple request
      await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });
      return true;
    } catch (error) {
      logger.warn('⚠️ OpenAI strategy not available:', (error as Error).message);
      return false;
    }
  }

  /**
   * Create system prompt for summarization
   */
  private createSummarizationPrompt(): string {
    return `You are an expert knowledge curator specializing in technical content. Your task is to create comprehensive, actionable summaries.

Return your response in the following JSON format:
{
  "summary": "Main summary text (2-3 paragraphs)",
  "keyPoints": ["point1", "point2", ...],
  "actionableItems": ["action1", "action2", ...],
  "tags": ["tag1", "tag2", ...],
  "difficulty": "beginner" | "intermediate" | "advanced",
  "codeExamples": [{"language": "lang", "code": "code", "description": "desc"}],
  "links": [{"title": "title", "url": "url", "description": "desc", "relationship": "related"}]
}

Guidelines:
- Summary should be comprehensive yet concise
- Key points should be specific and memorable
- Action items should be concrete next steps
- Tags should be relevant technical keywords
- Include code examples if present in the content
- Assess difficulty based on technical complexity`;
  }

  /**
   * Parse structured summary response from AI
   */
  private parseSummaryResponse(response: string): {
    summary: string;
    keyPoints: string[];
    actionableItems: string[];
    codeExamples?: unknown[];
    links?: unknown[];
    tags?: string[];
    difficulty?: string;
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        summary: parsed.summary || response,
        keyPoints: parsed.keyPoints || [],
        actionableItems: parsed.actionableItems || [],
        tags: parsed.tags || [],
        difficulty: parsed.difficulty || 'intermediate',
        codeExamples: parsed.codeExamples || [],
        links: parsed.links || [],
      };
    } catch {
      // Fallback parsing if JSON fails
      return {
        summary: response,
        keyPoints: this.extractSimpleKeyPoints(response),
        actionableItems: ['Review the content', 'Apply the concepts'],
        tags: this.extractSimpleTopics(response),
        difficulty: 'intermediate',
        codeExamples: [],
        links: [],
      };
    }
  }

  /**
   * Truncate content to fit within token limits
   */
  private truncateContent(content: string, maxChars: number): string {
    if (content.length <= maxChars) {
      return content;
    }

    // Try to cut at a sentence boundary
    const truncated = content.substring(0, maxChars);
    const lastSentence = truncated.lastIndexOf('.');

    if (lastSentence > maxChars * 0.8) {
      return truncated.substring(0, lastSentence + 1);
    }

    return truncated + '...';
  }

  /**
   * Estimate reading time in minutes
   */
  private estimateReadTime(text: string): number {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  /**
   * Simple topic extraction fallback
   */
  private extractSimpleTopics(content: string): string[] {
    const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const frequency: { [key: string]: number } = {};

    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Simple key point extraction fallback
   */
  private extractSimpleKeyPoints(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }
}
