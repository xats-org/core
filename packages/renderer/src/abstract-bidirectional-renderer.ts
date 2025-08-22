/**
 * Abstract base class for bidirectional renderers
 * 
 * This class provides common functionality and utilities that all bidirectional
 * renderers can inherit from, reducing code duplication and ensuring consistent
 * behavior across different format implementations.
 */

import { RoundTripTester } from '@xats-org/testing';

import type {
  XatsDocument,
  BidirectionalRenderer,
  RendererOptions,
  RenderResult,
  ParseResult,
  ParseOptions,
  RoundTripOptions,
  RoundTripResult,
  FormatValidationResult,
  FormatMetadata,
  RenderFormat,
  Unit,
  Chapter,
  Section,
  ContentBlock,
  SemanticText,
  Run,
} from '@xats-org/types';

/**
 * Configuration options for bidirectional renderer base class
 */
export interface BidirectionalRendererConfig extends RendererOptions {
  /** Enable automatic round-trip testing during render operations */
  autoTestRoundTrip?: boolean;
  
  /** Enable format validation during parse operations */
  autoValidate?: boolean;
  
  /** Enable performance metrics collection */
  collectMetrics?: boolean;
  
  /** Custom error handler for render/parse operations */
  errorHandler?: (error: Error, operation: 'render' | 'parse') => void;
}

/**
 * Abstract base class for implementing bidirectional renderers
 */
export abstract class AbstractBidirectionalRenderer<TOptions extends BidirectionalRendererConfig = BidirectionalRendererConfig> 
  implements BidirectionalRenderer<TOptions> {
  
  /** Format identifier - must be implemented by subclasses */
  abstract readonly format: RenderFormat;
  
  /** WCAG compliance level - can be overridden by subclasses */
  readonly wcagLevel: 'A' | 'AA' | 'AAA' | null = null;

  protected options: Required<TOptions>;
  private roundTripTester?: RoundTripTester;

  constructor(options: TOptions = {} as TOptions) {
    this.options = {
      // Default renderer options
      theme: 'default',
      cssClasses: {},
      includeTableOfContents: true,
      includeBibliography: true,
      includeIndex: true,
      mathRenderer: 'unicode',
      syntaxHighlighter: 'none',
      locale: 'en',
      dir: 'ltr',
      accessibilityMode: true,
      customStyles: '',
      baseUrl: '',
      fragmentOnly: false,
      
      // Default bidirectional renderer config
      autoTestRoundTrip: false,
      autoValidate: true,
      collectMetrics: true,
      
      ...options,
    } as Required<TOptions>;

    // Initialize round-trip tester if needed
    if (this.options.autoTestRoundTrip) {
      this.roundTripTester = new RoundTripTester(this);
    }
  }

  /**
   * Render xats document to target format - must be implemented by subclasses
   */
  abstract render(document: XatsDocument, options?: TOptions): Promise<RenderResult>;

  /**
   * Parse document from target format back to xats - must be implemented by subclasses
   */
  abstract parse(content: string, options?: ParseOptions): Promise<ParseResult>;

  /**
   * Validate format-specific content - must be implemented by subclasses
   */
  abstract validate(content: string): Promise<FormatValidationResult>;

  /**
   * Test round-trip fidelity between render and parse
   */
  async testRoundTrip(document: XatsDocument, options?: RoundTripOptions): Promise<RoundTripResult> {
    if (!this.roundTripTester) {
      this.roundTripTester = new RoundTripTester(this, options);
    }
    
    return this.roundTripTester.testDocument(document);
  }

  /**
   * Get format-specific metadata - can be overridden by subclasses
   */
  async getMetadata?(content: string): Promise<FormatMetadata> {
    return {
      format: this.format,
      custom: {
        contentLength: content.length,
        analyzedAt: new Date().toISOString(),
      },
    };
  }

  // ============================================================================
  // PROTECTED UTILITY METHODS FOR SUBCLASSES
  // ============================================================================

  /**
   * Create an empty xats document for error cases
   */
  protected createEmptyDocument(): XatsDocument {
    return {
      schemaVersion: '0.3.0',
      bibliographicEntry: {
        type: 'book',
        title: 'Untitled Document',
      },
      subject: 'General',
      bodyMatter: {
        contents: [],
      },
    };
  }

  /**
   * Estimate word count from a xats document
   */
  protected estimateWordCount(document: XatsDocument): number {
    let wordCount = 0;

    // Count words in bibliographic entry
    if (document.bibliographicEntry?.title) {
      wordCount += this.countWordsInText(document.bibliographicEntry.title);
    }

    // Count words in front matter
    if (document.frontMatter) {
      wordCount += this.countWordsInContentBlocks(document.frontMatter.preface || []);
      wordCount += this.countWordsInContentBlocks(document.frontMatter.acknowledgments || []);
    }

    // Count words in body matter
    wordCount += this.countWordsInStructuralContainers(document.bodyMatter.contents);

    // Count words in back matter
    if (document.backMatter) {
      wordCount += this.countWordsInStructuralContainers(document.backMatter.appendices || []);
      wordCount += this.countWordsInContentBlocks(document.backMatter.glossary || []);
      wordCount += this.countWordsInContentBlocks(document.backMatter.bibliography || []);
      wordCount += this.countWordsInContentBlocks(document.backMatter.index || []);
    }

    return wordCount;
  }

  /**
   * Convert SemanticText to plain text string
   */
  protected getSemanticTextString(semanticText: SemanticText): string {
    return semanticText.runs
      .map(run => {
        if ('text' in run) {
          return run.text;
        }
        return '';
      })
      .join('');
  }

  /**
   * Handle errors consistently across render and parse operations
   */
  protected handleError(error: Error, operation: 'render' | 'parse'): void {
    if (this.options.errorHandler) {
      this.options.errorHandler(error, operation);
    } else {
      // Default error handling - log to console
      // eslint-disable-next-line no-console
      console.error(`${this.format} ${operation} error:`, error);
    }
  }

  /**
   * Create performance metrics object
   */
  protected createMetrics(startTime: number, additionalMetrics: Record<string, unknown> = {}): Record<string, unknown> {
    const endTime = performance.now();
    
    return {
      format: this.format,
      renderTime: endTime - startTime,
      timestamp: new Date().toISOString(),
      ...additionalMetrics,
    };
  }

  /**
   * Validate document structure before processing
   */
  protected validateDocument(document: XatsDocument): void {
    if (!document.schemaVersion) {
      throw new Error('Document missing required schemaVersion');
    }
    
    if (!document.bibliographicEntry) {
      throw new Error('Document missing required bibliographicEntry');
    }
    
    if (!document.subject) {
      throw new Error('Document missing required subject');
    }
    
    if (!document.bodyMatter) {
      throw new Error('Document missing required bodyMatter');
    }
  }

  /**
   * Extract configuration from options with defaults
   */
  protected extractConfig<T>(options: T | undefined, defaults: T): T {
    return {
      ...defaults,
      ...options,
    };
  }

  // ============================================================================
  // PRIVATE UTILITY METHODS
  // ============================================================================

  /**
   * Count words in structural containers (Units, Chapters, Sections)
   */
  private countWordsInStructuralContainers(containers: Array<Unit | Chapter | Section>): number {
    let wordCount = 0;

    for (const container of containers) {
      // Count words in container title
      wordCount += this.countWordsInSemanticText(container.title);

      // Count words in container contents
      if ('contents' in container && Array.isArray(container.contents)) {
        for (const content of container.contents) {
          if ('blockType' in content) {
            // This is a ContentBlock
            wordCount += this.countWordsInContentBlock(content);
          } else {
            // This is a nested structural container
            wordCount += this.countWordsInStructuralContainers([content as Unit | Chapter | Section]);
          }
        }
      }
    }

    return wordCount;
  }

  /**
   * Count words in an array of content blocks
   */
  private countWordsInContentBlocks(blocks: ContentBlock[]): number {
    return blocks.reduce((count, block) => count + this.countWordsInContentBlock(block), 0);
  }

  /**
   * Count words in a single content block
   */
  private countWordsInContentBlock(block: ContentBlock): number {
    let wordCount = 0;

    // Count based on block type
    switch (block.blockType) {
      case 'https://xats.org/vocabularies/blocks/paragraph':
      case 'https://xats.org/vocabularies/blocks/heading': {
        const content = block.content as { text: SemanticText };
        wordCount += this.countWordsInSemanticText(content.text);
        break;
      }
      
      case 'https://xats.org/vocabularies/blocks/list': {
        const content = block.content as { items: SemanticText[] };
        for (const item of content.items) {
          wordCount += this.countWordsInSemanticText(item);
        }
        break;
      }
      
      case 'https://xats.org/vocabularies/blocks/blockquote': {
        const content = block.content as { text: SemanticText; attribution?: SemanticText };
        wordCount += this.countWordsInSemanticText(content.text);
        if (content.attribution) {
          wordCount += this.countWordsInSemanticText(content.attribution);
        }
        break;
      }
      
      case 'https://xats.org/vocabularies/blocks/table': {
        const content = block.content as {
          headers?: SemanticText[];
          rows: SemanticText[][];
          caption?: SemanticText;
        };
        if (content.headers) {
          for (const header of content.headers) {
            wordCount += this.countWordsInSemanticText(header);
          }
        }
        for (const row of content.rows) {
          for (const cell of row) {
            wordCount += this.countWordsInSemanticText(cell);
          }
        }
        if (content.caption) {
          wordCount += this.countWordsInSemanticText(content.caption);
        }
        break;
      }
      
      default:
        // For other block types, try to extract text content
        if (typeof block.content === 'object' && block.content !== null) {
          const contentObj = block.content as Record<string, unknown>;
          if ('text' in contentObj && this.isSemanticText(contentObj.text)) {
            wordCount += this.countWordsInSemanticText(contentObj.text);
          }
        }
    }

    return wordCount;
  }

  /**
   * Count words in semantic text
   */
  private countWordsInSemanticText(semanticText: SemanticText): number {
    const text = this.getSemanticTextString(semanticText);
    return this.countWordsInText(text);
  }

  /**
   * Count words in plain text
   */
  private countWordsInText(text: string): number {
    if (!text || typeof text !== 'string') {
      return 0;
    }
    
    // Split on whitespace and filter out empty strings
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Type guard for SemanticText
   */
  private isSemanticText(value: unknown): value is SemanticText {
    return (
      typeof value === 'object' &&
      value !== null &&
      'runs' in value &&
      Array.isArray((value as SemanticText).runs)
    );
  }
}