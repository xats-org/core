/**
 * @fileoverview Main Word converter implementation
 */

import { AnnotationProcessor } from './annotation-processor';
import { FidelityTester } from './fidelity-tester';
import { DocumentParser } from './parser';
import { DocumentRenderer } from './renderer';
import { StyleMapper } from './style-mapper';
import { WordValidator } from './validator';

import type {
  WordConverter as IWordConverter,
  WordRenderOptions,
  WordParseOptions,
  WordRenderResult,
  WordParseResult,
  RoundTripOptions,
  RoundTripResult,
  FormatValidationResult,
  WordMetadata,
  WordConverterOptions,
} from './types';
import type { XatsDocument } from '@xats-org/types';

/**
 * High-fidelity bidirectional converter for Microsoft Word documents
 */
export class WordConverter implements IWordConverter {
  public readonly format = 'docx' as const;
  public readonly wcagLevel = 'AA' as const;

  private readonly validator: WordValidator;
  private readonly styleMapper: StyleMapper;
  private readonly annotationProcessor: AnnotationProcessor;
  private readonly renderer: DocumentRenderer;
  private readonly parser: DocumentParser;
  private readonly fidelityTester: FidelityTester;

  constructor(
    styleMapper?: StyleMapper,
    annotationProcessor?: AnnotationProcessor,
    options: WordConverterOptions = {}
  ) {
    this.validator = new WordValidator();
    this.styleMapper = styleMapper || new StyleMapper(options.defaultStyleMappings);
    this.annotationProcessor = annotationProcessor || new AnnotationProcessor();
    this.renderer = new DocumentRenderer(this.styleMapper, this.annotationProcessor);
    this.parser = new DocumentParser(this.styleMapper, this.annotationProcessor);
    this.fidelityTester = new FidelityTester();
  }

  /**
   * Render xats document to Word format
   */
  async render(document: XatsDocument, options: WordRenderOptions = {}): Promise<WordRenderResult> {
    const startTime = performance.now();

    try {
      // Validate input document
      const validation = this.validator.validateXatsDocument(document);
      if (!validation.valid) {
        throw new Error(`Invalid xats document: ${validation.errors.join(', ')}`);
      }

      // Render to Word format
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
        `Word render failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse Word document to xats format
   */
  async parse(content: string | Buffer, options: WordParseOptions = {}): Promise<WordParseResult> {
    const startTime = performance.now();

    try {
      // Validate input format
      const validation = await this.validate(content);
      if (!validation.valid) {
        throw new Error(`Invalid Word document: ${validation.errors.join(', ')}`);
      }

      // Parse from Word format
      const result = await this.parser.parse(content, options);

      const parseTime = performance.now() - startTime;

      return {
        ...result,
        metadata: {
          ...result.metadata,
          renderTime: parseTime,
        },
      };
    } catch (error) {
      throw new Error(
        `Word parse failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      // Convert xats -> Word -> xats
      const wordResult = await this.render(document, {
        productionMode: true,
      });

      const xatsResult = await this.parse(wordResult.content, {
        preserveMetadata: true,
        productionMode: true,
      });

      // Test fidelity
      return this.fidelityTester.compare(document, xatsResult.document, options);
    } catch (error) {
      return {
        success: false,
        fidelityScore: 0,
        contentFidelity: 0,
        formattingFidelity: 0,
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
   * Validate Word document format
   */
  async validate(content: string | Buffer): Promise<FormatValidationResult> {
    return this.validator.validate(content);
  }

  /**
   * Get Word document metadata
   */
  async getMetadata(content: string | Buffer): Promise<WordMetadata> {
    try {
      return await this.parser.extractMetadata(content);
    } catch (error) {
      throw new Error(
        `Metadata extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
