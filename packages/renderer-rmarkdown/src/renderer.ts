/**
 * Main R Markdown bidirectional renderer
 */

import { RMarkdownToXatsParser } from './rmarkdown-to-xats.js';
import { validateRMarkdown, cleanRMarkdownContent, extractCodeChunks } from './utils.js';
import { XatsToRMarkdownConverter } from './xats-to-rmarkdown.js';

import type {
  RMarkdownRendererOptions,
  RMarkdownParseOptions,
  RMarkdownMetadata,
  RMarkdownParseResult,
  RChunkEngine,
} from './types.js';
import type {
  XatsDocument,
  BidirectionalRenderer,
  RenderResult,
  RoundTripResult,
  FormatValidationResult,
  RoundTripOptions,
  WcagCompliance,
  WcagResult,
  AccessibilityAudit,
} from '@xats-org/types';

/**
 * Complete bidirectional R Markdown renderer for xats
 * Supports conversion to/from R Markdown with high fidelity
 */
export class RMarkdownRenderer
  implements BidirectionalRenderer<RMarkdownRendererOptions>, WcagCompliance
{
  public readonly format = 'rmarkdown' as const;
  public readonly wcagLevel = null; // R Markdown is a source format, not a rendered format

  private converter: XatsToRMarkdownConverter;
  private parser: RMarkdownToXatsParser;

  constructor(
    private rendererOptions: RMarkdownRendererOptions = {},
    private parseOptions: RMarkdownParseOptions = {}
  ) {
    this.converter = new XatsToRMarkdownConverter(rendererOptions);
    this.parser = new RMarkdownToXatsParser(parseOptions);
  }

  /**
   * Render xats document to R Markdown format
   */
  public async render(
    document: XatsDocument,
    options: RMarkdownRendererOptions = {}
  ): Promise<RenderResult> {
    const mergedOptions = { ...this.rendererOptions, ...options };
    const converter = new XatsToRMarkdownConverter(mergedOptions);
    return converter.convert(document);
  }

  /**
   * Parse R Markdown content back to xats format
   */
  public async parse(
    content: string,
    options: RMarkdownParseOptions = {}
  ): Promise<RMarkdownParseResult> {
    const mergedOptions = { ...this.parseOptions, ...options };
    const parser = new RMarkdownToXatsParser(mergedOptions);
    return parser.parse(content);
  }

  /**
   * Test round-trip fidelity between render and parse
   */
  public async testRoundTrip(
    document: XatsDocument,
    options: RoundTripOptions = {}
  ): Promise<RoundTripResult> {
    const startTime = Date.now();

    try {
      // Render to R Markdown
      const renderResult = await this.render(document, options);
      if (renderResult.errors?.length) {
        return {
          success: false,
          fidelityScore: 0,
          original: document,
          roundTrip: this.createEmptyDocument(),
          differences: [],
          metrics: {
            renderTime: Date.now() - startTime,
            parseTime: 0,
            totalTime: Date.now() - startTime,
            documentSize: JSON.stringify(document).length,
            outputSize: 0,
          },
        };
      }

      const renderTime = Date.now();

      // Parse back to xats
      const parseResult = await this.parse(renderResult.content, options);
      if (parseResult.errors?.length) {
        return {
          success: false,
          fidelityScore: 0.5,
          original: document,
          roundTrip: parseResult.document,
          differences: [],
          metrics: {
            renderTime: renderTime - startTime,
            parseTime: Date.now() - renderTime,
            totalTime: Date.now() - startTime,
            documentSize: JSON.stringify(document).length,
            outputSize: renderResult.content.length,
          },
        };
      }

      const totalTime = Date.now() - startTime;

      // Compare documents
      const differences = this.compareDocuments(document, parseResult.document);
      const fidelityScore = this.calculateFidelityScore(differences);
      const success = fidelityScore >= (options.fidelityThreshold || 0.8);

      return {
        success,
        fidelityScore,
        original: document,
        roundTrip: parseResult.document,
        differences,
        metrics: {
          renderTime: renderTime - startTime,
          parseTime: totalTime - (renderTime - startTime),
          totalTime,
          documentSize: JSON.stringify(document).length,
          outputSize: renderResult.content.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        fidelityScore: 0,
        original: document,
        roundTrip: this.createEmptyDocument(),
        differences: [
          {
            type: 'missing',
            path: '/',
            original: document,
            roundTrip: null,
            impact: 'critical',
          },
        ],
        metrics: {
          renderTime: 0,
          parseTime: 0,
          totalTime: Date.now() - startTime,
          documentSize: JSON.stringify(document).length,
          outputSize: 0,
        },
      };
    }
  }

  /**
   * Validate R Markdown content
   */
  public async validate(content: string): Promise<FormatValidationResult> {
    const errors = validateRMarkdown(content);

    return {
      valid: errors.filter((e) => e.severity === 'error').length === 0,
      errors: errors
        .filter((e) => e.severity === 'error')
        .map((error) => ({
          code: error.type,
          message: error.message,
          line: error.line || 0,
          severity: error.severity as 'error',
        })),
      warnings: errors
        .filter((e) => e.severity === 'warning')
        .map((warning) => ({
          code: warning.type,
          message: warning.message,
          line: warning.line || 0,
          suggestion: warning.suggestion || '',
        })),
      metadata: {
        validator: 'xats-rmarkdown-renderer',
        version: '1.0.0',
        validatedAt: new Date(),
      },
    };
  }

  /**
   * Get R Markdown document metadata
   */
  public async getMetadata(content: string): Promise<RMarkdownMetadata> {
    const chunks = extractCodeChunks(content);
    const cleanContent = cleanRMarkdownContent(content);
    const wordCount = this.countWords(cleanContent);

    const metadata: RMarkdownMetadata = {
      format: 'rmarkdown',
      version: '1.0.0',
      encoding: 'utf-8',
      wordCount,
      elementCount: chunks.length,
      features: ['code-chunks', 'markdown', 'yaml-frontmatter'],
      sourceFormat: 'rmarkdown',
      parseTime: 0,
      mappedElements: chunks.length,
      unmappedElements: 0,
      fidelityScore: 1.0,
      codeChunks: chunks.map((chunk) => ({
        ...chunk,
        engine: chunk.options.engine as RChunkEngine,
        inline: false,
      })),
    };

    return metadata;
  }

  /**
   * Test WCAG compliance (not applicable for source format)
   */
  public async testCompliance(content: string, level: 'A' | 'AA' | 'AAA'): Promise<WcagResult> {
    return {
      level,
      compliant: false,
      violations: [
        {
          criterion: 'N/A',
          level: 'A',
          description: 'WCAG compliance testing not applicable to R Markdown source format',
          recommendation: 'Test the rendered output format (HTML, PDF, etc.) for accessibility',
          impact: 'minor',
        },
      ],
      warnings: [],
      score: 0,
    };
  }

  /**
   * Get accessibility audit (not applicable for source format)
   */
  public async auditAccessibility(content: string): Promise<AccessibilityAudit> {
    const result = await this.testCompliance(content, 'AA');

    return {
      compliant: false,
      overallScore: 0,
      levelA: result,
      levelAA: result,
      levelAAA: result,
      recommendations: [
        {
          priority: 'low',
          category: 'content',
          description:
            'R Markdown is a source format - accessibility should be evaluated on rendered output',
          implementation: 'Render to HTML/PDF and test the output with accessibility tools',
          wcagCriteria: [],
        },
      ],
      testedAt: new Date(),
    };
  }

  /**
   * Compare two xats documents for differences
   */
  private compareDocuments(
    original: XatsDocument,
    roundTrip: XatsDocument
  ): Array<{
    type: 'missing' | 'added' | 'changed' | 'moved';
    path: string;
    original?: unknown;
    roundTrip?: unknown;
    impact: 'critical' | 'major' | 'minor' | 'cosmetic';
  }> {
    const differences: Array<{
      type: 'missing' | 'added' | 'changed' | 'moved';
      path: string;
      original?: unknown;
      roundTrip?: unknown;
      impact: 'critical' | 'major' | 'minor' | 'cosmetic';
    }> = [];

    // Compare schema versions
    if (original.schemaVersion !== roundTrip.schemaVersion) {
      differences.push({
        type: 'changed',
        path: '/schemaVersion',
        original: original.schemaVersion,
        roundTrip: roundTrip.schemaVersion,
        impact: 'minor',
      });
    }

    // Compare bibliographic entries
    const originalTitle = original.bibliographicEntry.title;
    const roundTripTitle = roundTrip.bibliographicEntry.title;
    if (originalTitle !== roundTripTitle) {
      differences.push({
        type: 'changed',
        path: '/bibliographicEntry/title',
        original: originalTitle,
        roundTrip: roundTripTitle,
        impact: 'major',
      });
    }

    // Compare body matter structure (simplified)
    const originalContentCount = original.bodyMatter.contents.length;
    const roundTripContentCount = roundTrip.bodyMatter.contents.length;

    if (originalContentCount !== roundTripContentCount) {
      differences.push({
        type: originalContentCount > roundTripContentCount ? 'missing' : 'added',
        path: '/bodyMatter/contents',
        original: originalContentCount,
        roundTrip: roundTripContentCount,
        impact: 'major',
      });
    }

    return differences;
  }

  /**
   * Calculate fidelity score from differences
   */
  private calculateFidelityScore(
    differences: Array<{
      impact: 'critical' | 'major' | 'minor' | 'cosmetic';
    }>
  ): number {
    if (differences.length === 0) return 1.0;

    let penalty = 0;
    for (const diff of differences) {
      switch (diff.impact) {
        case 'critical':
          penalty += 0.5;
          break;
        case 'major':
          penalty += 0.2;
          break;
        case 'minor':
          penalty += 0.1;
          break;
        case 'cosmetic':
          penalty += 0.05;
          break;
      }
    }

    return Math.max(0, 1.0 - penalty);
  }

  /**
   * Count words in text content
   */
  private countWords(content: string): number {
    return content
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }

  /**
   * Create empty xats document
   */
  private createEmptyDocument(): XatsDocument {
    return {
      schemaVersion: '0.3.0',
      bibliographicEntry: { type: 'article-journal' },
      subject: 'https://xats.org/vocabularies/subjects/general',
      bodyMatter: { contents: [] },
    };
  }
}
