/* eslint-disable */
/**
 * LaTeX Bidirectional Renderer
 *
 * Main renderer class implementing the BidirectionalRenderer interface
 * for LaTeX format conversion.
 */

import { RoundTripTester } from '@xats-org/testing';

import { LaTeXConverter } from './converter.js';
import { LaTeXParser } from './parser.js';
import { LaTeXValidator } from './validator.js';

import type { LaTeXRendererOptions, LaTeXParseOptions, LaTeXMetadata } from './types.js';
import type {
  XatsDocument,
  BidirectionalRenderer,
  RenderResult,
  ParseResult,
  RoundTripOptions,
  RoundTripResult,
  FormatValidationResult,
  WcagCompliance,
  WcagResult,
  AccessibilityAudit,
} from '@xats-org/types';

/**
 * LaTeX bidirectional renderer implementing full conversion capabilities
 */
export class LaTeXRenderer implements BidirectionalRenderer<LaTeXRendererOptions>, WcagCompliance {
  public readonly format = 'latex' as const;
  public readonly wcagLevel = null; // LaTeX output is not directly accessible

  private converter: LaTeXConverter;
  private parser: LaTeXParser;
  private validator: LaTeXValidator;
  private roundTripTester: RoundTripTester;

  constructor() {
    this.converter = new LaTeXConverter();
    this.parser = new LaTeXParser();
    this.validator = new LaTeXValidator();
    this.roundTripTester = new RoundTripTester(this);
  }

  /**
   * Render xats document to LaTeX format
   */
  async render(document: XatsDocument, options: LaTeXRendererOptions = {}): Promise<RenderResult> {
    const startTime = Date.now();

    try {
      // Set default options
      const renderOptions: LaTeXRendererOptions = {
        documentClass: 'article',
        useUTF8: true,
        bibliographyStyle: 'plain',
        inlineMathDelimiter: '$',
        ...options,
      };

      // Convert xats document to LaTeX
      const latexContent = await this.converter.convertToLaTeX(document, renderOptions);

      // Calculate metadata
      const renderTime = Date.now() - startTime;
      const wordCount = this.estimateWordCount(latexContent);

      return {
        content: latexContent,
        metadata: {
          format: 'latex',
          renderTime,
          wordCount,
        },
      };
    } catch (error) {
      return {
        content: '',
        metadata: {
          format: 'latex',
          renderTime: Date.now() - startTime,
        },
        errors: [
          {
            type: 'other',
            message: error instanceof Error ? error.message : 'Unknown rendering error',
            recoverable: false,
          },
        ],
      };
    }
  }

  /**
   * Parse LaTeX content back to xats document
   */
  async parse(content: string, options: LaTeXParseOptions = {}): Promise<ParseResult> {
    const startTime = Date.now();

    try {
      // Parse LaTeX content to xats document
      const result = await this.parser.parseToXats(content, options);

      // Calculate metadata
      const parseTime = Date.now() - startTime;

      return {
        document: result.document,
        metadata: {
          sourceFormat: 'latex',
          parseTime,
          mappedElements: result.mappedElements || 0,
          unmappedElements: result.unmappedElements || 0,
          fidelityScore: result.fidelityScore || 0.95,
        },
        warnings: result.warnings || [],
        errors: result.errors || [],
        unmappedData: result.unmappedData || [],
      };
    } catch (error) {
      return {
        document: this.createEmptyDocument(),
        metadata: {
          sourceFormat: 'latex',
          parseTime: Date.now() - startTime,
          mappedElements: 0,
          unmappedElements: 0,
          fidelityScore: 0,
        },
        errors: [
          {
            type: 'invalid-format',
            message: error instanceof Error ? error.message : 'Unknown parsing error',
            fatal: true,
          },
        ],
      };
    }
  }

  /**
   * Test round-trip fidelity
   */
  async testRoundTrip(
    document: XatsDocument,
    options: RoundTripOptions = {}
  ): Promise<RoundTripResult> {
    return this.roundTripTester.testDocument(document);
  }

  /**
   * Validate LaTeX content
   */
  async validate(content: string): Promise<FormatValidationResult> {
    return this.validator.validateLaTeX(content);
  }

  /**
   * Get LaTeX document metadata
   */
  async getMetadata(content: string): Promise<LaTeXMetadata> {
    return this.parser.extractMetadata(content);
  }

  /**
   * WCAG compliance testing (not applicable for LaTeX)
   */
  async testCompliance(content: string, level: 'A' | 'AA' | 'AAA'): Promise<WcagResult> {
    return {
      level,
      compliant: false,
      violations: [
        {
          criterion: 'N/A',
          level,
          description:
            'LaTeX output is not directly accessible - accessibility depends on final rendered format (PDF, HTML, etc.)',
          recommendation:
            'Ensure proper semantic structure in xats document for accessible output formats',
          impact: 'moderate',
        },
      ],
      warnings: [],
      score: 0,
    };
  }

  /**
   * Accessibility audit (not applicable for LaTeX)
   */
  async auditAccessibility(content: string): Promise<AccessibilityAudit> {
    const mockResult: WcagResult = {
      level: 'AA',
      compliant: false,
      violations: [
        {
          criterion: 'N/A',
          level: 'AA',
          description: 'LaTeX output requires compilation to assess accessibility',
          recommendation:
            'Use accessible PDF generation tools or convert to HTML for accessibility testing',
          impact: 'moderate',
        },
      ],
      warnings: [],
      score: 0,
    };

    return {
      compliant: false,
      overallScore: 0,
      levelA: mockResult,
      levelAA: mockResult,
      levelAAA: mockResult,
      recommendations: [
        {
          priority: 'high',
          category: 'structure',
          description: 'Ensure semantic document structure in source xats document',
          implementation:
            'Use proper heading hierarchy, alt text for figures, and meaningful labels',
          wcagCriteria: ['1.3.1', '2.4.6', '4.1.3'],
        },
        {
          priority: 'medium',
          category: 'content',
          description: 'Provide alternative formats for mathematical content',
          implementation: 'Consider MathML or text descriptions for complex equations',
          wcagCriteria: ['1.1.1', '1.3.1'],
        },
      ],
      testedAt: new Date(),
    };
  }

  /**
   * Estimate word count from LaTeX content
   */
  private estimateWordCount(content: string): number {
    // Remove LaTeX commands and count words in text content
    const textContent = content
      .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{[^}]*\})*\s*/g, ' ') // Remove commands
      .replace(/\$[^$]+\$/g, ' ') // Remove inline math
      .replace(/\$\$[^$]+\$\$/g, ' ') // Remove display math
      .replace(/\\begin\{[^}]+\}.*?\\end\{[^}]+\}/gs, ' ') // Remove environments
      .replace(/%.*/g, '') // Remove comments
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return textContent.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Create empty xats document for error cases
   */
  private createEmptyDocument(): XatsDocument {
    return {
      schemaVersion: '0.3.0',
      bibliographicEntry: {
        type: 'article',
        title: 'Untitled',
      },
      subject: 'General',
      bodyMatter: {
        contents: [],
      },
    };
  }
}
