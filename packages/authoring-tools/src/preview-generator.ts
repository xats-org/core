/**
 * Preview generator for xats documents
 */

import type { PreviewOptions, PreviewResult } from './types.js';
import type { XatsDocument } from '@xats-org/types';

/**
 * Options for preview generator
 */
export interface PreviewGeneratorOptions {
  /** HTML renderer instance */
  htmlRenderer?: unknown;

  /** Markdown renderer instance */
  markdownRenderer?: unknown;
}

/**
 * Generates previews of xats documents in various formats
 */
export class PreviewGenerator {
  private htmlRenderer?: unknown;
  private markdownRenderer?: unknown;

  constructor(options: PreviewGeneratorOptions = {}) {
    this.htmlRenderer = options.htmlRenderer;
    this.markdownRenderer = options.markdownRenderer;
  }

  /**
   * Generate a preview of the document
   */
  async generatePreview(document: XatsDocument, options?: PreviewOptions): Promise<PreviewResult> {
    const startTime = performance.now();
    const opts = {
      format: 'html' as const,
      includeStyles: true,
      theme: 'default',
      accessibilityMode: true,
      sectionIds: [],
      ...options,
    };

    try {
      let content: string;
      let assets: Array<{ type: string; content: string; name?: string }> = [];

      switch (opts.format) {
        case 'html':
          const htmlResult = await this.generateHtmlPreview(document, opts);
          content = htmlResult.content;
          assets = htmlResult.assets;
          break;

        case 'markdown':
          const mdResult = await this.generateMarkdownPreview(document, opts);
          content = mdResult.content;
          assets = mdResult.assets;
          break;

        default:
          throw new Error(`Unsupported preview format: ${opts.format}`);
      }

      return {
        content,
        format: opts.format,
        assets,
        generationTime: performance.now() - startTime,
        warnings: [],
      };
    } catch (error) {
      return {
        content: `Error generating preview: ${error instanceof Error ? error.message : String(error)}`,
        format: opts.format,
        assets: [],
        generationTime: performance.now() - startTime,
        warnings: [
          `Preview generation failed: ${error instanceof Error ? error.message : String(error)}`,
        ],
      };
    }
  }

  /**
   * Generate HTML preview
   */
  private async generateHtmlPreview(
    document: XatsDocument,
    options: Required<PreviewOptions>
  ): Promise<{ content: string; assets: Array<{ type: string; content: string; name?: string }> }> {
    if (!this.htmlRenderer) {
      throw new Error('HTML renderer not available');
    }

    const renderResult = await this.htmlRenderer.render(document, {
      wrapInDocument: true,
      includeStyles: options.includeStyles,
      theme: options.theme,
      accessibilityMode: options.accessibilityMode,
      semantic: true,
      includeAria: true,
      sanitize: true,
    });

    if (renderResult.errors && renderResult.errors.length > 0) {
      throw new Error(`HTML rendering failed: ${renderResult.errors[0].message}`);
    }

    const assets = [];

    // Add default styles if requested
    if (options.includeStyles) {
      assets.push({
        type: 'text/css',
        name: 'preview-styles.css',
        content: this.getDefaultStyles(options.theme),
      });
    }

    return {
      content: renderResult.content,
      assets,
    };
  }

  /**
   * Generate Markdown preview
   */
  private async generateMarkdownPreview(
    document: XatsDocument,
    options: Required<PreviewOptions>
  ): Promise<{ content: string; assets: Array<{ type: string; content: string; name?: string }> }> {
    if (!this.markdownRenderer) {
      throw new Error('Markdown renderer not available');
    }

    const renderResult = await this.markdownRenderer.render(document);

    if (renderResult.errors && renderResult.errors.length > 0) {
      throw new Error(`Markdown rendering failed: ${renderResult.errors[0].message}`);
    }

    return {
      content: renderResult.content,
      assets: [], // Markdown typically doesn't need assets
    };
  }

  /**
   * Get default CSS styles for preview
   */
  private getDefaultStyles(theme: string): string {
    const baseStyles = `
/* xats Preview Styles */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #fff;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
  line-height: 1.25;
  color: #1a1a1a;
}

h1 { font-size: 2.5rem; border-bottom: 2px solid #e1e4e8; padding-bottom: 0.5rem; }
h2 { font-size: 2rem; border-bottom: 1px solid #e1e4e8; padding-bottom: 0.3rem; }
h3 { font-size: 1.75rem; }
h4 { font-size: 1.5rem; }
h5 { font-size: 1.25rem; }
h6 { font-size: 1.1rem; }

p {
  margin-bottom: 1rem;
  text-align: justify;
}

ul, ol {
  margin-bottom: 1rem;
  padding-left: 2rem;
}

li {
  margin-bottom: 0.25rem;
}

blockquote {
  margin: 1.5rem 0;
  padding: 0.5rem 1rem;
  border-left: 4px solid #dfe2e5;
  background-color: #f6f8fa;
  color: #6a737d;
  font-style: italic;
}

code {
  background-color: #f6f8fa;
  border-radius: 3px;
  font-size: 0.9em;
  margin: 0;
  padding: 0.2em 0.4em;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}

pre {
  background-color: #f6f8fa;
  border-radius: 6px;
  font-size: 0.9em;
  line-height: 1.45;
  overflow: auto;
  padding: 1rem;
  margin-bottom: 1rem;
}

pre code {
  background-color: transparent;
  border: 0;
  display: inline;
  line-height: inherit;
  margin: 0;
  overflow: visible;
  padding: 0;
  word-wrap: normal;
}

table {
  border-collapse: collapse;
  margin-bottom: 1rem;
  width: 100%;
  border: 1px solid #dfe2e5;
}

th, td {
  border: 1px solid #dfe2e5;
  padding: 0.75rem;
  text-align: left;
}

th {
  background-color: #f6f8fa;
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: #f8f9fa;
}

.figure {
  margin: 2rem 0;
  text-align: center;
}

.figure img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.figure-caption {
  margin-top: 0.5rem;
  font-style: italic;
  color: #6a737d;
  font-size: 0.9em;
}

/* Accessibility enhancements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media print {
  body {
    padding: 0;
    margin: 0;
    max-width: none;
  }
  
  h1, h2, h3, h4, h5, h6 {
    page-break-after: avoid;
  }
  
  blockquote, pre, figure {
    page-break-inside: avoid;
  }
}
`;

    // Theme-specific styles
    switch (theme) {
      case 'dark':
        return `${baseStyles}
/* Dark theme overrides */
body {
  background-color: #1a1a1a;
  color: #e1e4e8;
}

h1, h2, h3, h4, h5, h6 {
  color: #f0f0f0;
  border-color: #444;
}

blockquote {
  background-color: #2a2a2a;
  border-left-color: #555;
  color: #c1c1c1;
}

code, pre {
  background-color: #2a2a2a;
  color: #e1e4e8;
}

table, th, td {
  border-color: #444;
}

th {
  background-color: #2a2a2a;
}

tr:nth-child(even) {
  background-color: #222;
}
        `;

      case 'high-contrast':
        return `${baseStyles}
/* High contrast theme */
body {
  background-color: #ffffff;
  color: #000000;
  font-weight: 600;
}

h1, h2, h3, h4, h5, h6 {
  color: #000000;
  font-weight: 700;
  border-color: #000000;
}

a {
  color: #0000ff;
  text-decoration: underline;
  font-weight: 700;
}

blockquote {
  background-color: #f0f0f0;
  border-left: 4px solid #000000;
  color: #000000;
}

code, pre {
  background-color: #f0f0f0;
  border: 1px solid #000000;
  color: #000000;
}

table, th, td {
  border: 2px solid #000000;
}

th {
  background-color: #f0f0f0;
  color: #000000;
  font-weight: 700;
}
        `;

      case 'academic':
        return `${baseStyles}
/* Academic theme */
body {
  font-family: 'Times New Roman', Times, serif;
  line-height: 1.8;
  font-size: 16px;
}

h1, h2, h3, h4, h5, h6 {
  font-family: 'Times New Roman', Times, serif;
  font-weight: bold;
}

h1 { font-size: 24pt; }
h2 { font-size: 20pt; }
h3 { font-size: 18pt; }
h4 { font-size: 16pt; }
h5 { font-size: 14pt; }
h6 { font-size: 12pt; }

p {
  text-align: justify;
  text-indent: 2em;
  margin-bottom: 1.2rem;
}

blockquote {
  margin: 2rem 4rem;
  padding: 1rem 2rem;
  font-style: italic;
}

.figure {
  margin: 3rem 0;
}

.figure-caption {
  font-size: 0.85em;
  margin-top: 1rem;
}
        `;

      default:
        return baseStyles;
    }
  }

  /**
   * Filter document sections for preview
   */
  private filterDocumentSections(document: XatsDocument, sectionIds: string[]): XatsDocument {
    // TODO: Implement section filtering based on IDs
    // For now, return the full document
    return document;
  }
}
