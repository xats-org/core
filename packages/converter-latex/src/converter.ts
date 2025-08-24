/**
 * @fileoverview Main LaTeX converter implementation
 */

import { BibliographyProcessor } from './bibliography-processor';
import { FidelityTester } from './fidelity-tester';
import { MathProcessor } from './math-processor';
import { PackageManager } from './package-manager';
import { DocumentParser } from './parser';
import { DocumentRenderer } from './renderer';
import { LaTeXValidator } from './validator';

import type {
  LaTeXConverter as ILaTeXConverter,
  LaTeXRenderOptions,
  LaTeXParseOptions,
  LaTeXRenderResult,
  LaTeXParseResult,
  RoundTripOptions,
  RoundTripResult,
  FormatValidationResult,
  LaTeXRenderMetadata,
  LaTeXConverterOptions,
} from './types';
import type { XatsDocument } from '@xats-org/types';

/**
 * Academic publishing-grade bidirectional converter for LaTeX documents
 */
export class LaTeXConverter implements ILaTeXConverter {
  public readonly format = 'latex' as const;
  public readonly wcagLevel = null; // LaTeX is not directly web-accessible

  private readonly validator: LaTeXValidator;
  private readonly mathProcessor: MathProcessor;
  private readonly bibliographyProcessor: BibliographyProcessor;
  private readonly packageManager: PackageManager;
  private readonly renderer: DocumentRenderer;
  private readonly parser: DocumentParser;
  private readonly fidelityTester: FidelityTester;

  constructor(options: LaTeXConverterOptions = {}) {
    this.validator = new LaTeXValidator();
    this.mathProcessor = new MathProcessor(options.mathRenderer);
    this.bibliographyProcessor = new BibliographyProcessor();
    this.packageManager = new PackageManager(options.defaultPackages);
    this.renderer = new DocumentRenderer(
      this.mathProcessor,
      this.bibliographyProcessor,
      this.packageManager
    );
    this.parser = new DocumentParser(
      this.mathProcessor,
      this.bibliographyProcessor,
      this.packageManager
    );
    this.fidelityTester = new FidelityTester();
  }

  /**
   * Render xats document to LaTeX format
   */
  async render(
    document: XatsDocument,
    options: LaTeXRenderOptions = {}
  ): Promise<LaTeXRenderResult> {
    const startTime = performance.now();

    try {
      // Validate input document
      const validation = this.validator.validateXatsDocument(document);
      if (!validation.isValid) {
        throw new Error(`Invalid xats document: ${validation.errors.join(', ')}`);
      }

      // Render to LaTeX format
      const result = await this.renderer.render(document, options);

      const renderTime = performance.now() - startTime;

      return {
        ...result,
        metadata: {
          ...result.metadata,
          renderTime,
        },
      };
    } catch (error) {
      throw new Error(
        `LaTeX render failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse LaTeX document to xats format
   */
  async parse(content: string, options: LaTeXParseOptions = {}): Promise<LaTeXParseResult> {
    const startTime = performance.now();

    try {
      // Validate input format
      const validation = this.validate(content);
      if (!validation.isValid) {
        throw new Error(`Invalid LaTeX document: ${validation.errors.join(', ')}`);
      }

      // Parse from LaTeX format
      const result = await this.parser.parse(content, options);

      const parseTime = performance.now() - startTime;

      return {
        ...result,
        metadata: {
          ...result.metadata,
          parseTime,
        },
      };
    } catch (error) {
      throw new Error(
        `LaTeX parse failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Test round-trip fidelity
   */
  async testRoundTrip(
    document: XatsDocument,
    options: RoundTripOptions = {}
  ): Promise<RoundTripResult> {
    try {
      // Convert xats -> LaTeX -> xats
      const latexResult = await this.render(document, {
        includeDocumentWrapper: true,
        includeHeaders: true,
      });

      const xatsResult = await this.parse(latexResult.content, {
        mathParsing: {
          renderer: 'mathjax',
          preserveLaTeX: true,
          mathML: true,
        },
        bibliography: {
          parseBibFiles: true,
        },
      });

      // Test fidelity
      return this.fidelityTester.compare(document, xatsResult.document, options);
    } catch (error) {
      return {
        success: false,
        fidelityScore: 0,
        mathFidelity: 0,
        contentFidelity: 0,
        structureFidelity: 0,
        issues: [
          {
            type: 'content',
            severity: 'critical',
            description: `Round-trip test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        originalDocument: document,
        convertedDocument: document, // fallback
        differences: [],
      };
    }
  }

  /**
   * Validate LaTeX document format
   */
  validate(content: string): FormatValidationResult {
    return this.validator.validate(content);
  }

  /**
   * Get LaTeX document metadata
   */
  async getMetadata(content: string): Promise<LaTeXRenderMetadata> {
    try {
      return await this.parser.extractMetadata(content);
    } catch (error) {
      throw new Error(
        `Metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
