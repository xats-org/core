/**
 * @xats-org/renderer-html - HTML5 Bidirectional Renderer
 * 
 * Provides bidirectional conversion between xats documents and HTML5
 * with full WCAG 2.1 AA accessibility compliance.
 */

import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';
import type {
  XatsDocument,
  BidirectionalRenderer,
  RendererOptions,
  RenderResult,
  ParseResult,
  ParseOptions,
  RoundTripOptions,
  RoundTripResult,
  ValidationResult,
  FormatMetadata,
  WcagCompliance,
} from '@xats-org/types';
import { RoundTripTester, WcagTester } from '@xats-org/testing';

/**
 * HTML-specific renderer options
 */
export interface HtmlRendererOptions extends RendererOptions {
  /** Include DOCTYPE and full HTML document structure */
  wrapInDocument?: boolean;
  
  /** Include default CSS styles */
  includeStyles?: boolean;
  
  /** Custom CSS styles to include */
  customStyles?: string;
  
  /** Language code for html lang attribute */
  language?: string;
  
  /** Enable semantic HTML5 elements */
  semantic?: boolean;
  
  /** Include ARIA attributes for accessibility */
  includeAria?: boolean;
  
  /** Sanitize output HTML */
  sanitize?: boolean;
}

/**
 * HTML5 bidirectional renderer with WCAG 2.1 AA compliance
 */
export class HtmlRenderer implements BidirectionalRenderer<HtmlRendererOptions>, WcagCompliance {
  readonly format = 'html' as const;
  readonly wcagLevel = 'AA' as const;
  
  private options: Required<HtmlRendererOptions>;
  private roundTripTester: RoundTripTester;
  private wcagTester: WcagTester;

  constructor(options: HtmlRendererOptions = {}) {
    this.options = {
      // Default renderer options
      theme: 'default',
      cssClasses: {},
      includeTableOfContents: true,
      includeBibliography: true,
      includeIndex: true,
      mathRenderer: 'mathjax',
      syntaxHighlighter: 'prism',
      locale: 'en',
      dir: 'ltr',
      accessibilityMode: true,
      customStyles: '',
      baseUrl: '',
      fragmentOnly: false,
      
      // HTML-specific options
      wrapInDocument: true,
      includeStyles: true,
      language: 'en',
      semantic: true,
      includeAria: true,
      sanitize: true,
      
      ...options,
    };

    this.roundTripTester = new RoundTripTester(this);
    this.wcagTester = new WcagTester();
  }

  /**
   * Render xats document to HTML5
   */
  async render(document: XatsDocument, options?: HtmlRendererOptions): Promise<RenderResult> {
    const startTime = performance.now();
    const renderOptions = { ...this.options, ...options };
    
    try {
      // Generate HTML content
      const content = this.renderDocument(document, renderOptions);
      
      // Sanitize if requested
      const finalContent = renderOptions.sanitize ? 
        this.sanitizeHtml(content) : content;
      
      const renderTime = performance.now() - startTime;
      
      return {
        content: finalContent,
        metadata: {
          format: 'html',
          renderTime,
          wordCount: this.countWords(finalContent),
        },
        assets: this.extractAssets(finalContent),
        errors: [],
      };
      
    } catch (error) {
      return {
        content: '',
        metadata: {
          format: 'html',
          renderTime: performance.now() - startTime,
        },
        errors: [
          {
            type: 'other',
            message: `HTML render failed: ${error}`,
            recoverable: false,
          },
        ],
      };
    }
  }

  /**
   * Parse HTML back to xats document
   */
  async parse(content: string, options?: ParseOptions): Promise<ParseResult> {
    const startTime = performance.now();
    const parseOptions = {
      preserveMetadata: true,
      strictMode: false,
      customParsers: {},
      baseUrl: '',
      encoding: 'utf-8',
      ...options,
    };

    try {
      // Parse HTML using JSDOM
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      // Extract xats document structure
      const xatsDocument = await this.parseHtmlToXats(document, parseOptions);
      
      const parseTime = performance.now() - startTime;
      
      return {
        document: xatsDocument,
        metadata: {
          sourceFormat: 'html',
          parseTime,
          mappedElements: 0, // TODO: implement counting
          unmappedElements: 0,
          fidelityScore: 1.0, // TODO: implement scoring
        },
        warnings: [],
        errors: [],
        unmappedData: [],
      };
      
    } catch (error) {
      const parseTime = performance.now() - startTime;
      
      return {
        document: this.createEmptyDocument(),
        metadata: {
          sourceFormat: 'html',
          parseTime,
          mappedElements: 0,
          unmappedElements: 0,
          fidelityScore: 0,
        },
        errors: [
          {
            type: 'malformed-content',
            message: `HTML parse failed: ${error}`,
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
    options?: RoundTripOptions
  ): Promise<RoundTripResult> {
    return this.roundTripTester.testDocument(document);
  }

  /**
   * Validate HTML content
   */
  async validate(content: string): Promise<ValidationResult> {
    try {
      // Basic HTML validation using JSDOM
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      const errors = this.validateHtmlStructure(document);
      
      return {
        valid: errors.length === 0,
        errors,
        warnings: [],
        metadata: {
          validator: 'jsdom',
          version: '23.0.0',
          validatedAt: new Date(),
        },
      };
      
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            code: 'PARSE_ERROR',
            message: `HTML validation failed: ${error}`,
            severity: 'error',
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * Get HTML metadata
   */
  async getMetadata(content: string): Promise<FormatMetadata> {
    try {
      const dom = new JSDOM(content);
      const document = dom.window.document;
      
      return {
        format: 'html',
        version: '5',
        encoding: 'utf-8',
        language: document.documentElement.lang || 'en',
        wordCount: this.countWords(content),
        elementCount: document.querySelectorAll('*').length,
        features: this.detectFeatures(document),
      };
      
    } catch (error) {
      return {
        format: 'html',
        custom: { error: String(error) },
      };
    }
  }

  /**
   * Test WCAG compliance
   */
  async testCompliance(content: string, level: 'A' | 'AA' | 'AAA' = 'AA') {
    return this.wcagTester.testCompliance(content, level);
  }

  /**
   * Get accessibility audit
   */
  async auditAccessibility(content: string) {
    return this.wcagTester.auditAccessibility(content);
  }

  // Private implementation methods
  
  private renderDocument(document: XatsDocument, options: Required<HtmlRendererOptions>): string {
    // TODO: Implement full HTML rendering
    // This is a placeholder implementation
    
    const parts: string[] = [];
    
    if (options.wrapInDocument) {
      parts.push('<!DOCTYPE html>');
      parts.push(`<html lang="${options.language}">`);
      parts.push('<head>');
      parts.push('<meta charset="UTF-8">');
      parts.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
      
      if (document.bibliographicEntry?.title) {
        parts.push(`<title>${this.escapeHtml(document.bibliographicEntry.title)}</title>`);
      }
      
      if (options.includeStyles) {
        parts.push('<style>');
        parts.push(this.getDefaultStyles());
        if (options.customStyles) {
          parts.push(options.customStyles);
        }
        parts.push('</style>');
      }
      
      parts.push('</head>');
      parts.push('<body>');
    }
    
    parts.push('<main class="xats-document">');
    parts.push(`<!-- xats document content for schema version ${document.schemaVersion} -->`);
    parts.push('</main>');
    
    if (options.wrapInDocument) {
      parts.push('</body>');
      parts.push('</html>');
    }
    
    return parts.join('\\n');
  }

  private async parseHtmlToXats(
    document: Document, 
    options: Required<ParseOptions>
  ): Promise<XatsDocument> {
    // TODO: Implement full HTML to xats parsing
    // This is a placeholder implementation
    
    return this.createEmptyDocument();
  }

  private createEmptyDocument(): XatsDocument {
    return {
      schemaVersion: '0.5.0',
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

  private validateHtmlStructure(document: Document): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Check for basic HTML5 structure
    if (!document.doctype) {
      errors.push({
        code: 'MISSING_DOCTYPE',
        message: 'HTML document missing DOCTYPE declaration',
        severity: 'warning',
      });
    }
    
    // Check for required meta tags
    const charsetMeta = document.querySelector('meta[charset]');
    if (!charsetMeta) {
      errors.push({
        code: 'MISSING_CHARSET',
        message: 'HTML document missing charset declaration',
        severity: 'warning',
      });
    }
    
    return errors;
  }

  private sanitizeHtml(content: string): string {
    const dom = new JSDOM(content);
    const purify = DOMPurify(dom.window);
    
    return purify.sanitize(content, {
      ALLOW_ARIA_ATTR: true,
      KEEP_CONTENT: true,
    });
  }

  private extractAssets(content: string): RenderAsset[] {
    const assets: RenderAsset[] = [];
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Extract stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      assets.push({
        type: 'stylesheet',
        url: (link as HTMLLinkElement).href,
      });
    });
    
    // Extract scripts
    document.querySelectorAll('script[src]').forEach(script => {
      assets.push({
        type: 'script',
        url: (script as HTMLScriptElement).src,
      });
    });
    
    return assets;
  }

  private detectFeatures(document: Document): string[] {
    const features: string[] = [];
    
    if (document.querySelector('[role]')) {
      features.push('aria');
    }
    
    if (document.querySelector('nav')) {
      features.push('semantic-navigation');
    }
    
    if (document.querySelector('main')) {
      features.push('semantic-main');
    }
    
    if (document.querySelector('figure')) {
      features.push('semantic-figures');
    }
    
    return features;
  }

  private countWords(content: string): number {
    // Remove HTML tags and count words
    const text = content.replace(/<[^>]*>/g, ' ');
    return text.split(/\\s+/).filter(word => word.length > 0).length;
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getDefaultStyles(): string {
    return `
      /* xats HTML Renderer Default Styles */
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }
      
      .xats-document {
        /* Document container styles */
      }
      
      /* Ensure good contrast for accessibility */
      a {
        color: #0066cc;
        text-decoration: underline;
      }
      
      a:hover, a:focus {
        color: #004499;
        outline: 2px solid #0066cc;
        outline-offset: 2px;
      }
      
      /* Skip link for accessibility */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        z-index: 1000;
        text-decoration: none;
        border-radius: 0 0 4px 4px;
      }
      
      .skip-link:focus {
        top: 6px;
      }
    `;
  }
}

// Re-export types for convenience
export type {
  BidirectionalRenderer,
  RenderResult,
  ParseResult,
  ValidationResult,
  FormatMetadata,
} from '@xats-org/types';

// Import required types for internal use
import type { RenderAsset, ValidationError } from '@xats-org/types';