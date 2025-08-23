/**
 * Main authoring tool class that coordinates all authoring functionality
 */

import { XatsValidator } from '@xats-org/validator';
import { MarkdownRenderer } from '@xats-org/renderer-markdown';
import { DocxRenderer } from '@xats-org/renderer-docx';
import { HtmlRenderer } from '@xats-org/renderer-html';

import { SimplifiedSyntaxParser } from './syntax-parser.js';
import { ErrorMessagesService } from './error-messages.js';
import { PreviewGenerator } from './preview-generator.js';

import type {
  AuthoringToolOptions,
  AuthoringResult,
  ImportResult,
  ExportResult,
  ValidationFeedback,
  PreviewOptions,
  PreviewResult,
  SimplifiedDocument,
} from './types.js';
import type { XatsDocument } from '@xats-org/types';

/**
 * Enhanced authoring tool for creating xats documents
 */
export class XatsAuthoringTool {
  private validator: XatsValidator;
  private syntaxParser: SimplifiedSyntaxParser;
  private errorMessagesService: ErrorMessagesService;
  private previewGenerator: PreviewGenerator;
  private markdownRenderer: MarkdownRenderer;
  private docxRenderer: DocxRenderer;
  private htmlRenderer: HtmlRenderer;
  private options: Required<AuthoringToolOptions>;

  constructor(options: AuthoringToolOptions = {}) {
    this.options = {
      realTimeValidation: true,
      enablePreview: true,
      previewFormat: 'html',
      autoSaveInterval: 5000,
      maxValidationErrors: 10,
      includeSuggestions: true,
      userLevel: 'intermediate',
      language: 'en',
      ...options,
    };

    // Initialize services
    this.validator = new XatsValidator();
    this.syntaxParser = new SimplifiedSyntaxParser();
    this.errorMessagesService = new ErrorMessagesService({
      userLevel: this.options.userLevel,
      language: this.options.language,
      includeSuggestions: this.options.includeSuggestions,
    });

    // Initialize renderers
    this.markdownRenderer = new MarkdownRenderer();
    this.docxRenderer = new DocxRenderer();
    this.htmlRenderer = new HtmlRenderer();

    // Initialize preview generator
    this.previewGenerator = new PreviewGenerator({
      htmlRenderer: this.htmlRenderer,
      markdownRenderer: this.markdownRenderer,
    });
  }

  /**
   * Create a new xats document from simplified syntax
   */
  async createDocument(simplifiedDoc: SimplifiedDocument): Promise<AuthoringResult> {
    const startTime = performance.now();

    try {
      // Parse simplified syntax to xats document
      const parseResult = await this.syntaxParser.parse(simplifiedDoc);
      
      if (!parseResult.success || !parseResult.document) {
        return {
          success: false,
          errors: parseResult.errors || [],
          processingTime: performance.now() - startTime,
        };
      }

      const document = parseResult.document;

      // Validate the document if real-time validation is enabled
      let validation: ValidationFeedback | undefined;
      if (this.options.realTimeValidation) {
        validation = await this.validateDocument(document);
      }

      const processingTime = performance.now() - startTime;

      const result: AuthoringResult = {
        success: true,
        document,
        processingTime,
      };
      
      if (validation) {
        result.validation = validation;
      }
      
      return result;
    } catch (error) {
      return {
        success: false,
        errors: [{
          message: `Failed to create document: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error' as const,
          suggestions: [{
            description: 'Check your syntax and try again',
            action: 'fix',
            fix: 'Verify that your content follows the expected format',
            confidence: 0.7,
          }],
        }],
        processingTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Import a document from DOCX format
   */
  async importFromDocx(docxContent: string): Promise<ImportResult> {
    const startTime = performance.now();

    try {
      const parseResult = await this.docxRenderer.parse(docxContent);
      
      const result: ImportResult = {
        success: !parseResult.errors || parseResult.errors.length === 0,
        document: parseResult.document,
        sourceFormat: 'docx',
        warnings: parseResult.warnings?.map((w: any) => w.message) || [],
        unmappedElements: parseResult.unmappedData?.map((d: any) => String(d)) || [],
        processingTime: performance.now() - startTime,
      };
      
      if (parseResult.metadata?.fidelityScore !== undefined) {
        result.fidelityScore = parseResult.metadata.fidelityScore;
      }

      // Add validation if enabled
      if (this.options.realTimeValidation && parseResult.document) {
        result.validation = await this.validateDocument(parseResult.document);
      }

      // Convert parse errors to user-friendly format
      if (parseResult.errors && parseResult.errors.length > 0) {
        result.errors = await this.errorMessagesService.convertValidationErrors(
          parseResult.errors.map((e: any) => ({
            path: 'import',
            message: e.message,
            keyword: e.type,
          }))
        );
      }

      return result;
    } catch (error) {
      return {
        success: false,
        sourceFormat: 'docx',
        errors: [{
          message: `Import failed: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error' as const,
          suggestions: [{
            description: 'Verify that the file is a valid DOCX document',
            action: 'fix',
            fix: 'Check file format and try again',
            confidence: 0.8,
          }],
        }],
        processingTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Import a document from Markdown format
   */
  async importFromMarkdown(markdownContent: string): Promise<ImportResult> {
    const startTime = performance.now();

    try {
      const parseResult = await this.markdownRenderer.parse(markdownContent);
      
      const result: ImportResult = {
        success: !parseResult.errors || parseResult.errors.length === 0,
        document: parseResult.document,
        sourceFormat: 'markdown',
        warnings: parseResult.warnings?.map((w: any) => w.message) || [],
        unmappedElements: parseResult.unmappedData?.map((d: any) => String(d)) || [],
        processingTime: performance.now() - startTime,
      };
      
      if (parseResult.metadata?.fidelityScore !== undefined) {
        result.fidelityScore = parseResult.metadata.fidelityScore;
      }

      // Add validation if enabled
      if (this.options.realTimeValidation && parseResult.document) {
        result.validation = await this.validateDocument(parseResult.document);
      }

      // Convert parse errors to user-friendly format
      if (parseResult.errors && parseResult.errors.length > 0) {
        result.errors = await this.errorMessagesService.convertValidationErrors(
          parseResult.errors.map((e: any) => ({
            path: 'import',
            message: e.message,
            keyword: e.type,
          }))
        );
      }

      return result;
    } catch (error) {
      return {
        success: false,
        sourceFormat: 'markdown',
        errors: [{
          message: `Import failed: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error' as const,
          suggestions: [{
            description: 'Verify that the content is valid Markdown',
            action: 'fix',
            fix: 'Check Markdown syntax and try again',
            confidence: 0.8,
          }],
        }],
        processingTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Export a document to the specified format
   */
  async exportDocument(document: XatsDocument, format: 'docx' | 'markdown' | 'html'): Promise<ExportResult> {
    const startTime = performance.now();

    try {
      let renderResult;
      let renderer;

      switch (format) {
        case 'docx':
          renderer = this.docxRenderer;
          renderResult = await renderer.render(document);
          break;
        case 'markdown':
          renderer = this.markdownRenderer;
          renderResult = await renderer.render(document);
          break;
        case 'html':
          renderer = this.htmlRenderer;
          renderResult = await renderer.render(document);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      const result: ExportResult = {
        success: !renderResult.errors || renderResult.errors.length === 0,
        content: renderResult.content,
        format,
        warnings: renderResult.errors?.filter((e: any) => !e.fatal).map((e: any) => e.message) || [],
        processingTime: performance.now() - startTime,
      };

      // Convert render errors to user-friendly format
      const fatalErrors = renderResult.errors?.filter((e: any) => e.fatal) || [];
      if (fatalErrors.length > 0) {
        result.errors = await this.errorMessagesService.convertValidationErrors(
          fatalErrors.map((e: any) => ({
            path: 'export',
            message: e.message,
            keyword: e.type,
          }))
        );
      }

      return result;
    } catch (error) {
      return {
        success: false,
        format,
        errors: [{
          message: `Export failed: ${error instanceof Error ? error.message : String(error)}`,
          severity: 'error' as const,
          suggestions: [{
            description: 'Check document structure and try again',
            action: 'fix',
            fix: 'Verify that the document is valid before exporting',
            confidence: 0.7,
          }],
        }],
        processingTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Generate a preview of the document
   */
  async generatePreview(document: XatsDocument, options?: PreviewOptions): Promise<PreviewResult> {
    return this.previewGenerator.generatePreview(document, options);
  }

  /**
   * Validate a document and provide user-friendly feedback
   */
  async validateDocument(document: XatsDocument): Promise<ValidationFeedback> {
    const validationResult = await this.validator.validate(document);
    
    const feedback: ValidationFeedback = {
      isValid: validationResult.isValid,
      errors: await this.errorMessagesService.convertValidationErrors(
        validationResult.errors.slice(0, this.options.maxValidationErrors)
      ),
      suggestions: await this.errorMessagesService.generateSuggestions(validationResult.errors),
      qualityScore: this.calculateQualityScore(validationResult),
    };
    
    if (validationResult.schemaVersion) {
      feedback.schemaVersion = validationResult.schemaVersion;
    }
    
    return feedback;
  }

  /**
   * Get help and documentation for authoring
   */
  getAuthoringHelp(): Array<{
    title: string;
    description: string;
    examples: string[];
    references: string[];
  }> {
    return this.syntaxParser.getHelp();
  }

  /**
   * Update authoring tool options
   */
  updateOptions(newOptions: Partial<AuthoringToolOptions>): void {
    this.options = { ...this.options, ...newOptions };
    
    // Update error messages service if relevant options changed
    if (newOptions.userLevel || newOptions.language || newOptions.includeSuggestions !== undefined) {
      this.errorMessagesService.updateOptions({
        userLevel: this.options.userLevel,
        language: this.options.language,
        includeSuggestions: this.options.includeSuggestions,
      });
    }
  }

  /**
   * Calculate quality score based on validation results
   */
  private calculateQualityScore(validationResult: any): number {
    if (validationResult.isValid) {
      return 100;
    }

    const errorCount = validationResult.errors.length;
    const severityWeights = {
      required: 10,
      type: 8,
      format: 6,
      pattern: 5,
      enum: 4,
    };

    let totalDeduction = 0;
    validationResult.errors.forEach((error: any) => {
      const weight = severityWeights[error.keyword as keyof typeof severityWeights] || 3;
      totalDeduction += weight;
    });

    // Cap at 0 minimum
    const score = Math.max(0, 100 - totalDeduction);
    return Math.round(score);
  }
}