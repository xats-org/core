/**
 * @xats-org/renderer-html - HTML5 Bidirectional Renderer
 *
 * Provides bidirectional conversion between xats documents and HTML5
 * with full WCAG 2.1 AA accessibility compliance.
 */

import * as DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { RoundTripTester, WcagTester } from '@xats-org/testing';

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
  FormatValidationError,
  FormatValidationWarning,
  FormatMetadata,
  WcagCompliance,
  RenderAsset,
  Unit,
  Chapter,
  Section,
  ContentBlock,
  SemanticText,
  Run,
  TextRun,
  FrontMatter,
  BodyMatter,
  BackMatter,
  AccessibilityMetadata,
  RenderingHint,
} from '@xats-org/types';

/**
 * Enhanced rendering hint for v0.5.0 compatibility
 */
export interface EnhancedRenderingHint {
  hintType: string;
  value: string | number | boolean | object | unknown[];
  priority?: number;
  fallback?: {
    hintType: string;
    value: string | number | boolean | object | unknown[];
  };
  conditions?: {
    outputFormats?: string[];
    mediaQuery?: string;
    userPreferences?: Array<'high-contrast' | 'large-text' | 'reduced-motion' | 'screen-reader' | 'keyboard-only'>;
  };
  inheritance?: 'inherit' | 'no-inherit' | 'cascade';
}

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

  /** User accessibility preferences for conditional rendering hints */
  userPreferences?: Array<'high-contrast' | 'large-text' | 'reduced-motion' | 'screen-reader' | 'keyboard-only'>;

  /** Media query context for conditional rendering */
  mediaContext?: string;

  /** Enable v0.5.0 enhanced rendering hints processing */
  enhancedHints?: boolean;
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
      userPreferences: [],
      mediaContext: 'screen',
      enhancedHints: true,

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
    const renderOptions: Required<HtmlRendererOptions> = {
      ...this.options,
      ...options,
    } as Required<HtmlRendererOptions>;

    try {
      // Generate HTML content
      const content = await this.renderDocumentAsync(document, renderOptions);

      // Sanitize if requested
      let finalContent = content;
      if (renderOptions.sanitize) {
        // Check if we have a DOCTYPE to preserve
        const hasDoctype = content.startsWith('<!DOCTYPE');
        const sanitized = await this.sanitizeHtmlAsync(content);

        // DOMPurify removes DOCTYPE, so add it back if needed
        if (hasDoctype && !sanitized.startsWith('<!DOCTYPE')) {
          finalContent = `<!DOCTYPE html>\n${sanitized}`;
        } else {
          finalContent = sanitized;
        }
      }

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
            message: `HTML render failed: ${String(error)}`,
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
      const xatsDocument = await this.parseHtmlToXatsAsync(document, parseOptions);

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
            message: `HTML parse failed: ${String(error)}`,
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
    _options?: RoundTripOptions
  ): Promise<RoundTripResult> {
    return this.roundTripTester.testDocument(document);
  }

  /**
   * Validate HTML content
   */
  async validate(content: string): Promise<FormatValidationResult> {
    try {
      // Basic HTML validation using JSDOM
      const dom = new JSDOM(content);
      const document = dom.window.document;

      const errors = await this.validateHtmlStructureAsync(document);

      return {
        valid: errors.length === 0,
        errors,
        warnings: [] as FormatValidationWarning[],
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
            message: `HTML validation failed: ${String(error)}`,
            severity: 'error' as const,
          },
        ],
        warnings: [] as FormatValidationWarning[],
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

      const features = await this.detectFeaturesAsync(document);

      return {
        format: 'html',
        version: '5',
        encoding: 'utf-8',
        language: document.documentElement.lang || 'en',
        wordCount: this.countWords(content),
        elementCount: document.querySelectorAll('*').length,
        features,
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

  private async renderDocumentAsync(
    document: XatsDocument,
    options: Required<HtmlRendererOptions>
  ): Promise<string> {
    // Use Promise.resolve to make this truly async
    return await Promise.resolve(this.renderDocument(document, options));
  }

  private renderDocument(document: XatsDocument, options: Required<HtmlRendererOptions>): string {
    const parts: string[] = [];

    if (options.wrapInDocument) {
      parts.push('<!DOCTYPE html>');
      parts.push(
        `<html lang="${document.lang || options.language}" dir="${document.dir || options.dir}">`
      );
      parts.push('<head>');
      parts.push('<meta charset="UTF-8">');
      parts.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');

      if (document.bibliographicEntry?.title) {
        parts.push(`<title>${this.escapeHtml(document.bibliographicEntry.title)}</title>`);
      }

      // Add subject as meta tag for round-trip conversion
      if (document.subject) {
        parts.push(`<meta name="subject" content="${this.escapeHtml(document.subject)}">`);
      }

      // Add accessibility metadata
      if (document.accessibilityMetadata) {
        if (document.accessibilityMetadata.accessibilityFeature) {
          parts.push(
            `<meta name="accessibilityFeature" content="${document.accessibilityMetadata.accessibilityFeature.join(', ')}">`
          );
        }
        if (document.accessibilityMetadata.accessibilityHazard) {
          parts.push(
            `<meta name="accessibilityHazard" content="${document.accessibilityMetadata.accessibilityHazard.join(', ')}">`
          );
        }
        if (document.accessibilityMetadata.accessibilitySummary) {
          parts.push(
            `<meta name="accessibilitySummary" content="${this.escapeHtml(document.accessibilityMetadata.accessibilitySummary)}">`
          );
        }
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

      // Add skip link for accessibility
      parts.push('<a href="#main-content" class="skip-link">Skip to main content</a>');
    }

    parts.push('<main id="main-content" class="xats-document" role="main">');

    // Render front matter
    if (document.frontMatter) {
      parts.push('<section class="front-matter" role="region" aria-label="Front matter">');
      parts.push(this.renderFrontMatter(document.frontMatter, options));
      parts.push('</section>');
    }

    // Render body matter
    parts.push('<section class="body-matter" role="region" aria-label="Main content">');
    parts.push(this.renderBodyMatter(document.bodyMatter, options));
    parts.push('</section>');

    // Render back matter
    if (document.backMatter) {
      parts.push('<section class="back-matter" role="region" aria-label="Back matter">');
      parts.push(this.renderBackMatter(document.backMatter, options));
      parts.push('</section>');
    }

    parts.push('</main>');

    if (options.wrapInDocument) {
      parts.push('</body>');
      parts.push('</html>');
    }

    return parts.join('\n');
  }

  private renderFrontMatter(
    frontMatter: FrontMatter,
    options: Required<HtmlRendererOptions>
  ): string {
    const parts: string[] = [];

    if (frontMatter.preface) {
      parts.push('<section class="preface" role="region" aria-label="Preface">');
      parts.push('<h1>Preface</h1>');
      frontMatter.preface.forEach((block) => {
        parts.push(this.renderContentBlock(block, options));
      });
      parts.push('</section>');
    }

    if (frontMatter.acknowledgments) {
      parts.push('<section class="acknowledgments" role="region" aria-label="Acknowledgments">');
      parts.push('<h1>Acknowledgments</h1>');
      frontMatter.acknowledgments.forEach((block) => {
        parts.push(this.renderContentBlock(block, options));
      });
      parts.push('</section>');
    }

    return parts.join('\n');
  }

  private renderBodyMatter(bodyMatter: BodyMatter, options: Required<HtmlRendererOptions>): string {
    const parts: string[] = [];

    bodyMatter.contents.forEach((content) => {
      // Determine the type based on structure depth
      // A Unit contains Chapters which contain Sections
      // A Chapter can contain Sections or ContentBlocks
      // A Section contains only ContentBlocks

      if ('contents' in content && Array.isArray(content.contents)) {
        // Check the nested structure to determine type
        const firstChild = content.contents[0];

        if (!firstChild) {
          // Empty contents, treat as Chapter
          parts.push(this.renderChapter(content as Chapter, options));
        } else if ('contents' in firstChild && Array.isArray(firstChild.contents)) {
          // Has nested containers - check depth
          const firstGrandchild = firstChild.contents[0];

          if (
            firstGrandchild &&
            'contents' in firstGrandchild &&
            Array.isArray(firstGrandchild.contents)
          ) {
            // Three levels deep - this is a Unit containing Chapters containing Sections
            parts.push(this.renderUnit(content as Unit, options));
          } else {
            // Two levels deep - this is a Chapter containing Sections
            parts.push(this.renderChapter(content as Chapter, options));
          }
        } else {
          // First child has no contents array - this is a Chapter with ContentBlocks
          parts.push(this.renderChapter(content as Chapter, options));
        }
      } else {
        // No contents array - shouldn't happen at body matter level but handle gracefully
        parts.push(this.renderChapter(content as Chapter, options));
      }
    });

    return parts.join('\n');
  }

  private renderBackMatter(backMatter: BackMatter, options: Required<HtmlRendererOptions>): string {
    const parts: string[] = [];

    if (backMatter.appendices) {
      parts.push('<section class="appendices" role="region" aria-label="Appendices">');
      parts.push('<h1>Appendices</h1>');
      backMatter.appendices.forEach((appendix) => {
        parts.push(this.renderChapter(appendix, options));
      });
      parts.push('</section>');
    }

    if (backMatter.glossary) {
      parts.push('<section class="glossary" role="region" aria-label="Glossary">');
      parts.push('<h1>Glossary</h1>');
      backMatter.glossary.forEach((block) => {
        parts.push(this.renderContentBlock(block, options));
      });
      parts.push('</section>');
    }

    if (backMatter.bibliography) {
      parts.push('<section class="bibliography" role="region" aria-label="Bibliography">');
      parts.push('<h1>Bibliography</h1>');
      backMatter.bibliography.forEach((block) => {
        parts.push(this.renderContentBlock(block, options));
      });
      parts.push('</section>');
    }

    if (backMatter.index) {
      parts.push('<section class="index" role="region" aria-label="Index">');
      parts.push('<h1>Index</h1>');
      backMatter.index.forEach((block) => {
        parts.push(this.renderContentBlock(block, options));
      });
      parts.push('</section>');
    }

    return parts.join('\n');
  }

  private renderUnit(unit: Unit, options: Required<HtmlRendererOptions>): string {
    const parts: string[] = [];
    const unitId = unit.id ? ` id="${this.escapeHtml(unit.id)}"` : '';
    const lang = '';

    parts.push(
      `<section class="unit"${unitId}${lang} role="region" aria-label="Unit ${unit.label || ''}">`
    );

    // Render unit title
    parts.push(`<header class="unit-header">`);
    if (unit.label) {
      parts.push(`<span class="unit-label">Unit ${this.escapeHtml(unit.label)}</span>`);
    }
    parts.push(`<h1 class="unit-title">${this.renderSemanticText(unit.title)}</h1>`);
    parts.push(`</header>`);

    // Render unit contents
    parts.push('<div class="unit-content">');
    unit.contents.forEach((content) => {
      if ('contents' in content && Array.isArray(content.contents)) {
        // This is a Chapter
        parts.push(this.renderChapter(content, options));
      } else {
        // This is a ContentBlock
        parts.push(this.renderContentBlock(content as ContentBlock, options));
      }
    });
    parts.push('</div>');

    parts.push('</section>');
    return parts.join('\n');
  }

  private renderChapter(chapter: Chapter, options: Required<HtmlRendererOptions>): string {
    const parts: string[] = [];
    const chapterId = chapter.id ? ` id="${this.escapeHtml(chapter.id)}"` : '';
    const lang = '';

    parts.push(
      `<section class="chapter"${chapterId}${lang} role="region" aria-label="Chapter ${chapter.label || ''}">`
    );

    // Render chapter title
    parts.push(`<header class="chapter-header">`);
    if (chapter.label) {
      parts.push(`<span class="chapter-label">Chapter ${this.escapeHtml(chapter.label)}</span>`);
    }
    parts.push(`<h2 class="chapter-title">${this.renderSemanticText(chapter.title)}</h2>`);
    parts.push(`</header>`);

    // Render chapter contents
    parts.push('<div class="chapter-content">');
    chapter.contents.forEach((content) => {
      if ('contents' in content && Array.isArray(content.contents)) {
        // This is a Section
        parts.push(this.renderSection(content, options));
      } else {
        // This is a ContentBlock
        parts.push(this.renderContentBlock(content as ContentBlock, options));
      }
    });
    parts.push('</div>');

    parts.push('</section>');
    return parts.join('\n');
  }

  private renderSection(section: Section, options: Required<HtmlRendererOptions>): string {
    const parts: string[] = [];
    const sectionId = section.id ? ` id="${this.escapeHtml(section.id)}"` : '';
    const lang = '';

    parts.push(
      `<section class="section"${sectionId}${lang} role="region" aria-label="Section ${section.label || ''}">`
    );

    // Render section title
    parts.push(`<header class="section-header">`);
    if (section.label) {
      parts.push(`<span class="section-label">${this.escapeHtml(section.label)}</span>`);
    }
    parts.push(`<h3 class="section-title">${this.renderSemanticText(section.title)}</h3>`);
    parts.push(`</header>`);

    // Render section contents
    parts.push('<div class="section-content">');
    section.contents.forEach((block) => {
      parts.push(this.renderContentBlock(block, options));
    });
    parts.push('</div>');

    parts.push('</section>');
    return parts.join('\n');
  }

  private renderContentBlock(block: ContentBlock, options: Required<HtmlRendererOptions>): string {
    const blockId = block.id ? ` id="${this.escapeHtml(block.id)}"` : '';
    const lang = block.language ? ` lang="${block.language}"` : '';
    const dir = block.textDirection && block.textDirection !== 'ltr' ? ` dir="${block.textDirection}"` : '';
    const blockTypeClass = this.getBlockTypeClass(block.blockType);

    // Process rendering hints for this block
    const hintResult = this.processRenderingHints(block.renderingHints, 'div', options);
    const allClasses = ['content-block', blockTypeClass, ...hintResult.cssClasses].join(' ');
    const style = hintResult.styles ? ` style="${hintResult.styles}"` : '';
    
    // Build attribute string from rendering hints
    const attributeEntries = Object.entries(hintResult.attributes);
    const attributeString = attributeEntries.length > 0 
      ? ' ' + attributeEntries.map(([key, value]) => `${key}="${this.escapeHtml(value)}"`).join(' ')
      : '';

    switch (block.blockType) {
      case 'https://xats.org/vocabularies/blocks/paragraph':
        return this.renderParagraph(block, allClasses, blockId, lang, dir, style, attributeString);

      case 'https://xats.org/vocabularies/blocks/heading':
        return this.renderHeading(block, allClasses, blockId, lang, dir, style, attributeString);

      case 'https://xats.org/vocabularies/blocks/list':
        return this.renderList(block, allClasses, blockId, lang, dir, style, attributeString);

      case 'https://xats.org/vocabularies/blocks/blockquote':
        return this.renderBlockquote(block, allClasses, blockId, lang, dir, style, attributeString);

      case 'https://xats.org/vocabularies/blocks/codeBlock':
        return this.renderCodeBlock(block, allClasses, blockId, lang, dir, style, attributeString);

      case 'https://xats.org/vocabularies/blocks/mathBlock':
        return this.renderMathBlock(block, allClasses, blockId, lang, dir, style, attributeString);

      case 'https://xats.org/vocabularies/blocks/table':
        return this.renderTable(block, allClasses, blockId, lang, dir, style, attributeString);

      case 'https://xats.org/vocabularies/blocks/figure':
        return this.renderFigure(block, allClasses, blockId, lang, dir, style, attributeString);

      case 'https://xats.org/vocabularies/placeholders/tableOfContents':
      case 'https://xats.org/vocabularies/placeholders/bibliography':
      case 'https://xats.org/vocabularies/placeholders/index':
        return this.renderPlaceholder(block, allClasses, blockId, lang, dir, style, attributeString);

      default:
        return this.renderGenericBlock(block, allClasses, blockId, lang, dir, style, attributeString);
    }
  }

  private renderParagraph(
    block: ContentBlock,
    allClasses: string,
    blockId: string,
    lang: string,
    dir: string,
    style: string,
    attributeString: string
  ): string {
    const content = block.content as { text: SemanticText };
    return `<div class="${allClasses}"${blockId}${lang}${dir}${style}${attributeString}>
      <p>${this.renderSemanticText(content.text)}</p>
    </div>`;
  }

  private renderHeading(
    block: ContentBlock,
    allClasses: string,
    blockId: string,
    lang: string,
    dir: string,
    style: string,
    attributeString: string
  ): string {
    const content = block.content as { text: SemanticText; level?: number };
    const level = Math.min(Math.max(content.level || 1, 1), 6);
    return `<div class="${allClasses}"${blockId}${lang}${dir}${style}${attributeString}>
      <h${level}>${this.renderSemanticText(content.text)}</h${level}>
    </div>`;
  }

  private renderList(
    block: ContentBlock,
    allClasses: string,
    blockId: string,
    lang: string,
    dir: string,
    style: string,
    attributeString: string
  ): string {
    const content = block.content as { listType: 'ordered' | 'unordered'; items: SemanticText[] };
    const tag = content.listType === 'ordered' ? 'ol' : 'ul';
    const items = content.items
      .map((item) => `<li>${this.renderSemanticText(item)}</li>`)
      .join('\n');

    return `<div class="${allClasses}"${blockId}${lang}${dir}${style}${attributeString}>
      <${tag}>
        ${items}
      </${tag}>
    </div>`;
  }

  private renderBlockquote(
    block: ContentBlock,
    allClasses: string,
    blockId: string,
    lang: string,
    dir: string,
    style: string,
    attributeString: string
  ): string {
    const content = block.content as { text: SemanticText; attribution?: SemanticText };
    let html = `<div class="${allClasses}"${blockId}${lang}${dir}${style}${attributeString}>
      <blockquote>
        ${this.renderSemanticText(content.text)}`;

    if (content.attribution) {
      html += `<cite>${this.renderSemanticText(content.attribution)}</cite>`;
    }

    html += `</blockquote>
    </div>`;

    return html;
  }

  private renderCodeBlock(
    block: ContentBlock,
    allClasses: string,
    blockId: string,
    lang: string,
    dir: string,
    style: string,
    attributeString: string
  ): string {
    const content = block.content as { code: string; language?: string };
    const codeLang = content.language
      ? ` data-language="${this.escapeHtml(content.language)}"`
      : '';

    return `<div class="${allClasses}"${blockId}${lang}${dir}${style}${attributeString}>
      <pre><code${codeLang}>${this.escapeHtml(content.code)}</code></pre>
    </div>`;
  }

  private renderMathBlock(
    block: ContentBlock,
    allClasses: string,
    blockId: string,
    lang: string,
    dir: string,
    style: string,
    attributeString: string
  ): string {
    const content = block.content as { math: string };
    return `<div class="${allClasses}"${blockId}${lang}${dir}${style}${attributeString}>
      <div class="math-block" role="img" aria-label="Mathematical expression">
        ${this.escapeHtml(content.math)}
      </div>
    </div>`;
  }

  private renderTable(
    block: ContentBlock,
    allClasses: string,
    blockId: string,
    lang: string,
    dir: string,
    style: string,
    attributeString: string
  ): string {
    const content = block.content as {
      headers?: SemanticText[];
      rows: SemanticText[][];
      caption?: SemanticText;
    };

    let html = `<div class="${allClasses}"${blockId}${lang}${dir}${style}${attributeString}>
      <table role="table">`;

    if (content.caption) {
      html += `<caption>${this.renderSemanticText(content.caption)}</caption>`;
    }

    if (content.headers && content.headers.length > 0) {
      html += '<thead><tr>';
      content.headers.forEach((header) => {
        html += `<th scope="col">${this.renderSemanticText(header)}</th>`;
      });
      html += '</tr></thead>';
    }

    html += '<tbody>';
    content.rows.forEach((row) => {
      html += '<tr>';
      row.forEach((cell) => {
        html += `<td>${this.renderSemanticText(cell)}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';

    html += `</table>
    </div>`;

    return html;
  }

  private renderFigure(
    block: ContentBlock,
    allClasses: string,
    blockId: string,
    lang: string,
    dir: string,
    style: string,
    attributeString: string
  ): string {
    const content = block.content as {
      src: string;
      alt: string;
      caption?: SemanticText;
      width?: number;
      height?: number;
    };

    let html = `<div class="${allClasses}"${blockId}${lang}${dir}${style}${attributeString}>
      <figure>
        <img src="${this.escapeHtml(content.src)}" alt="${this.escapeHtml(content.alt)}"`;

    if (content.width) {
      html += ` width="${content.width}"`;
    }
    if (content.height) {
      html += ` height="${content.height}"`;
    }

    html += ' />';

    if (content.caption) {
      html += `<figcaption>${this.renderSemanticText(content.caption)}</figcaption>`;
    }

    html += `</figure>
    </div>`;

    return html;
  }

  private renderPlaceholder(
    block: ContentBlock,
    allClasses: string,
    blockId: string,
    lang: string,
    dir: string,
    style: string,
    attributeString: string
  ): string {
    const placeholderType = this.getPlaceholderType(block.blockType);
    const placeholderClasses = `${allClasses} placeholder`;
    return `<div class="${placeholderClasses}"${blockId}${lang}${dir}${style}${attributeString} role="region" aria-label="${placeholderType}">
      <p>[${placeholderType} will be generated here]</p>
    </div>`;
  }

  private renderGenericBlock(
    block: ContentBlock,
    allClasses: string,
    blockId: string,
    lang: string,
    dir: string,
    style: string,
    attributeString: string
  ): string {
    return `<div class="${allClasses}"${blockId}${lang}${dir}${style}${attributeString}>
      <div class="unknown-block" data-block-type="${this.escapeHtml(block.blockType)}">
        <!-- Unknown block type: ${this.escapeHtml(block.blockType)} -->
        ${JSON.stringify(block.content)}
      </div>
    </div>`;
  }

  private renderSemanticText(semanticText: SemanticText): string {
    return semanticText.runs.map((run) => this.renderRun(run)).join('');
  }

  private renderRun(run: Run): string {
    switch (run.type) {
      case 'text':
        return this.escapeHtml(run.text);

      case 'emphasis':
        return `<em>${this.escapeHtml(run.text)}</em>`;

      case 'strong':
        return `<strong>${this.escapeHtml(run.text)}</strong>`;

      case 'code':
        return `<code>${this.escapeHtml(run.text)}</code>`;

      case 'reference': {
        const refHref = run.ref ? ` href="#${this.escapeHtml(run.ref)}"` : '';
        const refLabel = run.label ? ` aria-label="${this.escapeHtml(run.label)}"` : '';
        return `<a class="reference"${refHref}${refLabel}>${this.escapeHtml(run.text)}</a>`;
      }

      case 'citation':
        return `<a class="citation" href="#cite-${this.escapeHtml(run.citeKey)}" role="doc-noteref" aria-label="Citation ${run.citeKey}">[${this.escapeHtml(run.citeKey)}]</a>`;

      case 'mathInline':
        return `<span class="math-inline" role="img" aria-label="Mathematical expression">${this.escapeHtml(run.math)}</span>`;

      case 'subscript':
        return `<sub>${this.escapeHtml(run.text)}</sub>`;

      case 'superscript':
        return `<sup>${this.escapeHtml(run.text)}</sup>`;

      case 'strikethrough':
        return `<del>${this.escapeHtml(run.text)}</del>`;

      case 'underline':
        return `<u>${this.escapeHtml(run.text)}</u>`;

      case 'index':
        return `<span class="index-entry" data-index-term="${this.escapeHtml(run.entry)}"${run.subEntry ? ` data-sub-entry="${this.escapeHtml(run.subEntry)}"` : ''}>${this.escapeHtml(run.text)}</span>`;

      default:
        // Handle unknown run types gracefully
        return this.escapeHtml(('text' in run ? (run as TextRun).text : '') || '');
    }
  }

  private getBlockTypeClass(blockType: string): string {
    const typeMap: Record<string, string> = {
      'https://xats.org/vocabularies/blocks/paragraph': 'block-paragraph',
      'https://xats.org/vocabularies/blocks/heading': 'block-heading',
      'https://xats.org/vocabularies/blocks/list': 'block-list',
      'https://xats.org/vocabularies/blocks/blockquote': 'block-blockquote',
      'https://xats.org/vocabularies/blocks/codeBlock': 'block-code',
      'https://xats.org/vocabularies/blocks/mathBlock': 'block-math',
      'https://xats.org/vocabularies/blocks/table': 'block-table',
      'https://xats.org/vocabularies/blocks/figure': 'block-figure',
      'https://xats.org/vocabularies/placeholders/tableOfContents': 'placeholder-toc',
      'https://xats.org/vocabularies/placeholders/bibliography': 'placeholder-bibliography',
      'https://xats.org/vocabularies/placeholders/index': 'placeholder-index',
    };

    return typeMap[blockType] || 'block-unknown';
  }

  private getPlaceholderType(blockType: string): string {
    const typeMap: Record<string, string> = {
      'https://xats.org/vocabularies/placeholders/tableOfContents': 'Table of Contents',
      'https://xats.org/vocabularies/placeholders/bibliography': 'Bibliography',
      'https://xats.org/vocabularies/placeholders/index': 'Index',
    };

    return typeMap[blockType] || 'Placeholder';
  }

  // HTML to xats parsing methods

  private async parseHtmlToXatsAsync(
    document: Document,
    options: Required<ParseOptions>
  ): Promise<XatsDocument> {
    // Use Promise.resolve to make this truly async
    return await Promise.resolve(this.parseHtmlToXats(document, options));
  }

  private parseHtmlToXats(document: Document, options: Required<ParseOptions>): XatsDocument {
    // Extract basic document metadata
    const schemaVersion = this.extractSchemaVersion(document) || '0.3.0';
    const title = document.title || 'Untitled Document';
    const lang = document.documentElement.lang || 'en';
    const dir = (document.documentElement.dir as 'ltr' | 'rtl' | 'auto') || 'ltr';

    // Create bibliographic entry from HTML metadata
    const bibliographicEntry = this.extractBibliographicEntry(document, title);

    // Extract subject from meta tags or default
    const subject = this.extractMetaContent(document, 'subject') || 'General';

    // Parse document structure
    const frontMatter = this.parseFrontMatter(document, options);
    const bodyMatter = this.parseBodyMatter(document, options);
    const backMatter = this.parseBackMatter(document, options);

    // Extract accessibility metadata
    const accessibilityMetadata = this.parseAccessibilityMetadata(document);

    const xatsDocument: XatsDocument = {
      schemaVersion,
      bibliographicEntry,
      subject,
      lang,
      dir,
      bodyMatter,
    };

    if (frontMatter && Object.keys(frontMatter).length > 0) {
      xatsDocument.frontMatter = frontMatter;
    }

    if (backMatter && Object.keys(backMatter).length > 0) {
      xatsDocument.backMatter = backMatter;
    }

    if (accessibilityMetadata && Object.keys(accessibilityMetadata).length > 0) {
      xatsDocument.accessibilityMetadata = accessibilityMetadata;
    }

    return xatsDocument;
  }

  private extractSchemaVersion(document: Document): string | null {
    const metaElement = document.querySelector('meta[name="xats-schema-version"]');
    return metaElement ? metaElement.getAttribute('content') : null;
  }

  private extractBibliographicEntry(document: Document, title: string) {
    return {
      type: 'book',
      title,
      author: this.extractAuthors(document),
      issued: this.extractPublicationDate(document),
    };
  }

  private extractAuthors(document: Document) {
    const authorMeta = document.querySelector('meta[name="author"]');
    if (authorMeta) {
      const authorName = authorMeta.getAttribute('content') || '';
      const nameParts = authorName.split(' ');
      if (nameParts.length >= 2) {
        const family = nameParts[nameParts.length - 1];
        if (family) {
          return [
            {
              given: nameParts.slice(0, -1).join(' '),
              family,
            },
          ];
        }
      }
    }
    return [];
  }

  private extractPublicationDate(document: Document) {
    const dateMeta = document.querySelector('meta[name="date"]');
    if (dateMeta) {
      const dateStr = dateMeta.getAttribute('content');
      if (dateStr) {
        const date = new Date(dateStr);
        return {
          'date-parts': [[date.getFullYear(), date.getMonth() + 1, date.getDate()]],
        };
      }
    }
    return { 'date-parts': [[new Date().getFullYear()]] };
  }

  private extractMetaContent(document: Document, name: string): string | null {
    const metaElement = document.querySelector(`meta[name="${name}"]`);
    return metaElement ? metaElement.getAttribute('content') : null;
  }

  private parseFrontMatter(
    document: Document,
    options: Required<ParseOptions>
  ): FrontMatter | undefined {
    const frontMatterSection = document.querySelector('.front-matter');
    if (!frontMatterSection) return undefined;

    const frontMatter: FrontMatter = {};

    const prefaceSection = frontMatterSection.querySelector('.preface');
    if (prefaceSection) {
      frontMatter.preface = this.parseContentBlocks(prefaceSection, options);
    }

    const acknowledgmentsSection = frontMatterSection.querySelector('.acknowledgments');
    if (acknowledgmentsSection) {
      frontMatter.acknowledgments = this.parseContentBlocks(acknowledgmentsSection, options);
    }

    return Object.keys(frontMatter).length > 0 ? frontMatter : undefined;
  }

  private parseBodyMatter(document: Document, options: Required<ParseOptions>): BodyMatter {
    const bodyMatterSection = document.querySelector('.body-matter');
    if (!bodyMatterSection) {
      return { contents: [] };
    }

    const contents: Array<Unit | Chapter> = [];

    // Look for units first
    const units = bodyMatterSection.querySelectorAll('.unit');
    if (units.length > 0) {
      units.forEach((unitElement) => {
        contents.push(this.parseUnit(unitElement, options));
      });
    } else {
      // No units, look for chapters directly
      const chapters = bodyMatterSection.querySelectorAll('.chapter');
      chapters.forEach((chapterElement) => {
        contents.push(this.parseChapter(chapterElement, options));
      });
    }

    return { contents };
  }

  private parseBackMatter(
    document: Document,
    options: Required<ParseOptions>
  ): BackMatter | undefined {
    const backMatterSection = document.querySelector('.back-matter');
    if (!backMatterSection) return undefined;

    const backMatter: BackMatter = {};

    const appendicesSection = backMatterSection.querySelector('.appendices');
    if (appendicesSection) {
      const appendixElements = appendicesSection.querySelectorAll('.chapter');
      backMatter.appendices = Array.from(appendixElements).map((el) =>
        this.parseChapter(el, options)
      );
    }

    const glossarySection = backMatterSection.querySelector('.glossary');
    if (glossarySection) {
      backMatter.glossary = this.parseContentBlocks(glossarySection, options);
    }

    const bibliographySection = backMatterSection.querySelector('.bibliography');
    if (bibliographySection) {
      backMatter.bibliography = this.parseContentBlocks(bibliographySection, options);
    }

    const indexSection = backMatterSection.querySelector('.index');
    if (indexSection) {
      backMatter.index = this.parseContentBlocks(indexSection, options);
    }

    return Object.keys(backMatter).length > 0 ? backMatter : undefined;
  }

  private parseAccessibilityMetadata(document: Document): AccessibilityMetadata | undefined {
    const metadata: AccessibilityMetadata = {};

    const featureMeta = document.querySelector('meta[name="accessibilityFeature"]');
    if (featureMeta) {
      metadata.accessibilityFeature = featureMeta.getAttribute('content')?.split(', ') || [];
    }

    const hazardMeta = document.querySelector('meta[name="accessibilityHazard"]');
    if (hazardMeta) {
      metadata.accessibilityHazard = hazardMeta.getAttribute('content')?.split(', ') || [];
    }

    const summaryMeta = document.querySelector('meta[name="accessibilitySummary"]');
    if (summaryMeta) {
      metadata.accessibilitySummary = summaryMeta.getAttribute('content') || '';
    }

    return Object.keys(metadata).length > 0 ? metadata : undefined;
  }

  private parseUnit(unitElement: Element, options: Required<ParseOptions>): Unit {
    const id = unitElement.getAttribute('id') || '';
    const labelElement = unitElement.querySelector('.unit-label');
    const titleElement = unitElement.querySelector('.unit-title');

    const label = labelElement ? labelElement.textContent?.replace('Unit ', '') || '' : '';
    const title = titleElement
      ? this.parseTextToSemanticText(titleElement.textContent || '')
      : { runs: [{ type: 'text' as const, text: 'Untitled Unit' }] };

    const contents: Array<Chapter | ContentBlock> = [];

    // Parse chapters within the unit
    const chapters = unitElement.querySelectorAll('.chapter');
    chapters.forEach((chapterElement) => {
      contents.push(this.parseChapter(chapterElement, options));
    });

    // Parse content blocks directly in the unit
    const contentBlocks = unitElement.querySelectorAll('.content-block');
    contentBlocks.forEach((blockElement) => {
      contents.push(this.parseContentBlock(blockElement, options));
    });

    return { id, label, title, contents };
  }

  private parseChapter(chapterElement: Element, options: Required<ParseOptions>): Chapter {
    const id = chapterElement.getAttribute('id') || '';
    const labelElement = chapterElement.querySelector('.chapter-label');
    const titleElement = chapterElement.querySelector('.chapter-title');

    const label = labelElement ? labelElement.textContent?.replace('Chapter ', '') || '' : '';
    const title = titleElement
      ? this.parseTextToSemanticText(titleElement.textContent || '')
      : { runs: [{ type: 'text' as const, text: 'Untitled Chapter' }] };

    const contents: Array<Section | ContentBlock> = [];

    // Parse sections within the chapter
    const sections = chapterElement.querySelectorAll('.section');
    sections.forEach((sectionElement) => {
      contents.push(this.parseSection(sectionElement, options));
    });

    // Parse content blocks directly in the chapter
    const contentBlocks = chapterElement.querySelectorAll('.content-block');
    contentBlocks.forEach((blockElement) => {
      contents.push(this.parseContentBlock(blockElement, options));
    });

    return { id, label, title, contents };
  }

  private parseSection(sectionElement: Element, options: Required<ParseOptions>): Section {
    const id = sectionElement.getAttribute('id') || '';
    const labelElement = sectionElement.querySelector('.section-label');
    const titleElement = sectionElement.querySelector('.section-title');

    const label = labelElement ? labelElement.textContent || '' : '';
    const title = titleElement
      ? this.parseTextToSemanticText(titleElement.textContent || '')
      : { runs: [{ type: 'text' as const, text: 'Untitled Section' }] };

    const contents = this.parseContentBlocks(sectionElement, options);

    return { id, label, title, contents };
  }

  private parseContentBlocks(container: Element, options: Required<ParseOptions>): ContentBlock[] {
    const contentBlocks = container.querySelectorAll('.content-block');
    return Array.from(contentBlocks).map((blockElement) =>
      this.parseContentBlock(blockElement, options)
    );
  }

  private parseContentBlock(blockElement: Element, _options: Required<ParseOptions>): ContentBlock {
    const id = blockElement.getAttribute('id') || '';

    // Determine block type from class
    const blockType = this.determineBlockType(blockElement);
    const content = this.parseBlockContent(blockElement, blockType);

    const block: ContentBlock = { id, blockType, content };

    return block;
  }

  private determineBlockType(blockElement: Element): string {
    const classMap: Record<string, string> = {
      'block-paragraph': 'https://xats.org/vocabularies/blocks/paragraph',
      'block-heading': 'https://xats.org/vocabularies/blocks/heading',
      'block-list': 'https://xats.org/vocabularies/blocks/list',
      'block-blockquote': 'https://xats.org/vocabularies/blocks/blockquote',
      'block-code': 'https://xats.org/vocabularies/blocks/codeBlock',
      'block-math': 'https://xats.org/vocabularies/blocks/mathBlock',
      'block-table': 'https://xats.org/vocabularies/blocks/table',
      'block-figure': 'https://xats.org/vocabularies/blocks/figure',
      'placeholder-toc': 'https://xats.org/vocabularies/placeholders/tableOfContents',
      'placeholder-bibliography': 'https://xats.org/vocabularies/placeholders/bibliography',
      'placeholder-index': 'https://xats.org/vocabularies/placeholders/index',
    };

    for (const [className, blockType] of Object.entries(classMap)) {
      if (blockElement.classList.contains(className)) {
        return blockType;
      }
    }

    // Check data attribute
    const dataBlockType = blockElement.getAttribute('data-block-type');
    if (dataBlockType) {
      return dataBlockType;
    }

    return 'https://xats.org/vocabularies/blocks/paragraph'; // default
  }

  private parseBlockContent(blockElement: Element, blockType: string): Record<string, unknown> {
    switch (blockType) {
      case 'https://xats.org/vocabularies/blocks/paragraph': {
        const p = blockElement.querySelector('p');
        return { text: this.parseTextToSemanticText(p?.textContent || '') };
      }

      case 'https://xats.org/vocabularies/blocks/heading': {
        const heading = blockElement.querySelector('h1, h2, h3, h4, h5, h6');
        const level = heading ? parseInt(heading.tagName.charAt(1)) : 1;
        return {
          text: this.parseTextToSemanticText(heading?.textContent || ''),
          level,
        };
      }

      case 'https://xats.org/vocabularies/blocks/list': {
        const list = blockElement.querySelector('ol, ul');
        const listType = list?.tagName.toLowerCase() === 'ol' ? 'ordered' : 'unordered';
        const items = Array.from(list?.querySelectorAll('li') || []).map((li) =>
          this.parseTextToSemanticText(li.textContent || '')
        );
        return { listType, items };
      }

      case 'https://xats.org/vocabularies/blocks/blockquote': {
        const blockquote = blockElement.querySelector('blockquote');
        const cite = blockquote?.querySelector('cite');
        const content: Record<string, unknown> = {
          text: this.parseTextToSemanticText(blockquote?.textContent || ''),
        };
        if (cite) {
          content.attribution = this.parseTextToSemanticText(cite.textContent || '');
        }
        return content;
      }

      case 'https://xats.org/vocabularies/blocks/codeBlock': {
        const code = blockElement.querySelector('code');
        const language = code?.getAttribute('data-language') || undefined;
        return {
          code: code?.textContent || '',
          language,
        };
      }

      case 'https://xats.org/vocabularies/blocks/mathBlock': {
        const math = blockElement.querySelector('.math-block');
        return { math: math?.textContent || '' };
      }

      case 'https://xats.org/vocabularies/blocks/table':
        return this.parseTableContent(blockElement);

      case 'https://xats.org/vocabularies/blocks/figure':
        return this.parseFigureContent(blockElement);

      default:
        return { text: this.parseTextToSemanticText(blockElement.textContent || '') };
    }
  }

  private parseTableContent(blockElement: Element): Record<string, unknown> {
    const table = blockElement.querySelector('table');
    if (!table) return { rows: [] };

    const caption = table.querySelector('caption');
    const headers = Array.from(table.querySelectorAll('thead th')).map((th) =>
      this.parseTextToSemanticText(th.textContent || '')
    );
    const rows = Array.from(table.querySelectorAll('tbody tr')).map((tr) =>
      Array.from(tr.querySelectorAll('td')).map((td) =>
        this.parseTextToSemanticText(td.textContent || '')
      )
    );

    const content: Record<string, unknown> = { rows };
    if (headers.length > 0) content.headers = headers;
    if (caption) content.caption = this.parseTextToSemanticText(caption.textContent || '');

    return content;
  }

  private parseFigureContent(blockElement: Element): Record<string, unknown> {
    const figure = blockElement.querySelector('figure');
    const img = figure?.querySelector('img');
    const caption = figure?.querySelector('figcaption');

    return {
      src: img?.getAttribute('src') || '',
      alt: img?.getAttribute('alt') || '',
      caption: caption ? this.parseTextToSemanticText(caption.textContent || '') : undefined,
      width: img?.getAttribute('width') ? parseInt(img.getAttribute('width') || '0') : undefined,
      height: img?.getAttribute('height') ? parseInt(img.getAttribute('height') || '0') : undefined,
    };
  }

  private parseTextToSemanticText(text: string): SemanticText {
    // Simple implementation - just return text run
    // In a complete implementation, this would parse HTML formatting
    return {
      runs: [{ type: 'text', text }],
    };
  }

  private createEmptyDocument(): XatsDocument {
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

  private async validateHtmlStructureAsync(document: Document): Promise<FormatValidationError[]> {
    // Use Promise.resolve to make this truly async
    return await Promise.resolve(this.validateHtmlStructure(document));
  }

  private validateHtmlStructure(document: Document): FormatValidationError[] {
    const errors: FormatValidationError[] = [];

    // Check for basic HTML5 structure
    if (!document.doctype) {
      errors.push({
        code: 'MISSING_DOCTYPE',
        message: 'HTML document missing DOCTYPE declaration',
        severity: 'warning' as const,
      });
    }

    // Check for required meta tags
    const charsetMeta = document.querySelector('meta[charset]');
    if (!charsetMeta) {
      errors.push({
        code: 'MISSING_CHARSET',
        message: 'HTML document missing charset declaration',
        severity: 'warning' as const,
      });
    }

    // Check for accessibility requirements
    const lang = document.documentElement.lang;
    if (!lang) {
      errors.push({
        code: 'MISSING_LANG',
        message: 'HTML document missing lang attribute on html element (WCAG 3.1.1)',
        severity: 'error' as const,
      });
    }

    // Check for main landmark
    const main = document.querySelector('main');
    if (!main) {
      errors.push({
        code: 'MISSING_MAIN',
        message: 'HTML document missing main landmark for accessibility',
        severity: 'warning' as const,
      });
    }

    return errors;
  }

  private async sanitizeHtmlAsync(content: string): Promise<string> {
    // Use Promise.resolve to make this truly async
    return await Promise.resolve(this.sanitizeHtml(content));
  }

  private sanitizeHtml(content: string): string {
    const dom = new JSDOM(content);
    const purify = DOMPurify.default(dom.window);

    return purify.sanitize(content, {
      ALLOW_ARIA_ATTR: true,
      KEEP_CONTENT: true,
      ALLOWED_TAGS: [
        'html',
        'head',
        'body',
        'title',
        'meta',
        'style',
        'link',
        'main',
        'section',
        'article',
        'aside',
        'nav',
        'header',
        'footer',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'div',
        'span',
        'br',
        'hr',
        'a',
        'em',
        'strong',
        'code',
        'pre',
        'sub',
        'sup',
        'del',
        'u',
        'ul',
        'ol',
        'li',
        'dl',
        'dt',
        'dd',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'caption',
        'figure',
        'figcaption',
        'img',
        'blockquote',
        'cite',
      ],
      ALLOWED_ATTR: [
        'id',
        'class',
        'lang',
        'dir',
        'href',
        'src',
        'alt',
        'title',
        'width',
        'height',
        'role',
        'aria-label',
        'aria-labelledby',
        'aria-describedby',
        'scope',
        'data-*',
      ],
    });
  }

  private extractAssets(content: string): RenderAsset[] {
    const assets: RenderAsset[] = [];
    const dom = new JSDOM(content);
    const document = dom.window.document;

    // Extract stylesheets
    document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      assets.push({
        type: 'stylesheet',
        url: (link as HTMLLinkElement).href,
      });
    });

    // Extract scripts
    document.querySelectorAll('script[src]').forEach((script) => {
      assets.push({
        type: 'script',
        url: (script as HTMLScriptElement).src,
      });
    });

    return assets;
  }

  private async detectFeaturesAsync(document: Document): Promise<string[]> {
    // Use Promise.resolve to make this truly async
    return await Promise.resolve(this.detectFeatures(document));
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

    if (document.querySelector('table')) {
      features.push('tables');
    }

    if (document.querySelector('code, pre')) {
      features.push('code-blocks');
    }

    if (document.querySelector('.math-block, .math-inline')) {
      features.push('mathematics');
    }

    return features;
  }

  private countWords(content: string): number {
    // Remove HTML tags and count words
    const text = content.replace(/<[^>]*>/g, ' ');
    return text.split(/\s+/).filter((word) => word.length > 0).length;
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
      /* xats HTML Renderer Default Styles - WCAG 2.1 AA Compliant */
      
      /* Base typography and layout */
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: #212529; /* 4.5:1 contrast ratio */
        background-color: #ffffff;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        font-size: 1rem;
      }
      
      /* Skip link for accessibility */
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000000;
        color: #ffffff;
        padding: 8px 16px;
        z-index: 1000;
        text-decoration: none;
        border-radius: 0 0 4px 4px;
        font-weight: bold;
      }
      
      .skip-link:focus {
        top: 6px;
        outline: 2px solid #ffffff;
        outline-offset: 2px;
      }
      
      /* Document structure */
      .xats-document {
        padding: 0;
      }
      
      .front-matter,
      .body-matter,
      .back-matter {
        margin-bottom: 2rem;
      }
      
      /* Headings with proper hierarchy */
      h1, h2, h3, h4, h5, h6 {
        color: #212529;
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.2;
      }
      
      h1 { font-size: 2.5rem; }
      h2 { font-size: 2rem; }
      h3 { font-size: 1.75rem; }
      h4 { font-size: 1.5rem; }
      h5 { font-size: 1.25rem; }
      h6 { font-size: 1.1rem; }
      
      /* Structural containers */
      .unit {
        margin-bottom: 3rem;
        border-left: 4px solid #007bff;
        padding-left: 1rem;
      }
      
      .chapter {
        margin-bottom: 2rem;
        border-left: 2px solid #6c757d;
        padding-left: 1rem;
      }
      
      .section {
        margin-bottom: 1.5rem;
      }
      
      /* Content blocks */
      .content-block {
        margin-bottom: 1rem;
      }
      
      /* Paragraphs */
      .block-paragraph {
        margin-bottom: 1rem;
        text-align: justify;
      }
      
      /* Lists */
      .block-list ul,
      .block-list ol {
        padding-left: 2rem;
        margin-bottom: 1rem;
      }
      
      .block-list li {
        margin-bottom: 0.25rem;
      }
      
      /* Blockquotes */
      .block-blockquote {
        border-left: 4px solid #dee2e6;
        padding-left: 1rem;
        margin: 1rem 0;
        font-style: italic;
        color: #6c757d;
      }
      
      /* Code blocks */
      .block-code {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 1rem;
        margin: 1rem 0;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 0.875rem;
      }
      
      /* Math blocks */
      .block-math {
        text-align: center;
        margin: 1.5rem 0;
        padding: 1rem;
        background-color: #f8f9fa;
        border-radius: 4px;
      }
      
      /* Tables */
      .block-table table {
        width: 100%;
        border-collapse: collapse;
        margin: 1rem 0;
      }
      
      .block-table th,
      .block-table td {
        border: 1px solid #dee2e6;
        padding: 0.75rem;
        text-align: left;
      }
      
      .block-table th {
        background-color: #f8f9fa;
        font-weight: 600;
      }
      
      /* Figures */
      .block-figure {
        margin: 1.5rem 0;
        text-align: center;
      }
      
      .block-figure img {
        max-width: 100%;
        height: auto;
      }
      
      .block-figure figcaption {
        margin-top: 0.5rem;
        font-style: italic;
        color: #6c757d;
      }
      
      /* Links with proper contrast */
      a {
        color: #0056b3; /* 4.5:1 contrast ratio */
        text-decoration: underline;
      }
      
      a:hover {
        color: #004085;
        text-decoration: underline;
      }
      
      a:focus {
        outline: 2px solid #0056b3;
        outline-offset: 2px;
        border-radius: 2px;
      }
      
      /* Semantic text formatting */
      em, .emphasis {
        font-style: italic;
      }
      
      strong, .strong {
        font-weight: 700;
      }
      
      code, .inline-code {
        background-color: #f8f9fa;
        padding: 0.125rem 0.25rem;
        border-radius: 2px;
        font-family: 'Courier New', monospace;
        font-size: 0.875em;
      }
      
      .citation {
        color: #0056b3;
        text-decoration: none;
        border-bottom: 1px dotted #0056b3;
      }
      
      .reference {
        color: #0056b3;
        text-decoration: underline;
      }
      
      sub, .subscript {
        vertical-align: sub;
        font-size: 0.75em;
      }
      
      sup, .superscript {
        vertical-align: super;
        font-size: 0.75em;
      }
      
      .strikethrough {
        text-decoration: line-through;
      }
      
      .underline {
        text-decoration: underline;
      }
      
      /* Placeholder blocks */
      .placeholder {
        background-color: #e9ecef;
        border: 2px dashed #adb5bd;
        padding: 1rem;
        text-align: center;
        margin: 1rem 0;
        color: #6c757d;
        font-style: italic;
      }
      
      /* Print styles */
      @media print {
        body {
          font-size: 12pt;
          line-height: 1.4;
          color: #000;
          background: #fff;
        }
        
        .skip-link {
          display: none;
        }
        
        a {
          color: #000;
        }
        
        .block-figure {
          page-break-inside: avoid;
        }
      }
      
      /* Focus indicators for accessibility */
      *:focus {
        outline: 2px solid #0056b3;
        outline-offset: 2px;
      }
      
      /* Ensure proper spacing for screen readers */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
      
      /* Enhanced Rendering Hints Styles (v0.5.0) */
      
      /* Semantic hint styles */
      .semantic-emphasis {
        font-style: italic;
        color: #495057;
      }
      
      .semantic-strong-emphasis {
        font-weight: 700;
        color: #343a40;
      }
      
      .semantic-highlight {
        background-color: #fff3cd;
        padding: 0.125rem 0.25rem;
        border-radius: 3px;
      }
      
      .semantic-warning {
        background-color: #fff3cd;
        border: 1px solid #ffeaa7;
        border-left: 4px solid #e17055;
        padding: 0.75rem 1rem;
        margin: 1rem 0;
        border-radius: 4px;
      }
      
      .semantic-warning::before {
        content: "⚠️ ";
        font-weight: bold;
        margin-right: 0.5rem;
      }
      
      .semantic-info {
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
        border-left: 4px solid #17a2b8;
        padding: 0.75rem 1rem;
        margin: 1rem 0;
        border-radius: 4px;
      }
      
      .semantic-info::before {
        content: "ℹ️ ";
        font-weight: bold;
        margin-right: 0.5rem;
      }
      
      .semantic-success {
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        border-left: 4px solid #28a745;
        padding: 0.75rem 1rem;
        margin: 1rem 0;
        border-radius: 4px;
      }
      
      .semantic-success::before {
        content: "✅ ";
        font-weight: bold;
        margin-right: 0.5rem;
      }
      
      .semantic-error {
        background-color: #f8d7da;
        border: 1px solid #f5c6cb;
        border-left: 4px solid #dc3545;
        padding: 0.75rem 1rem;
        margin: 1rem 0;
        border-radius: 4px;
      }
      
      .semantic-error::before {
        content: "❌ ";
        font-weight: bold;
        margin-right: 0.5rem;
      }
      
      .semantic-aside {
        background-color: #f8f9fa;
        border-left: 4px solid #6c757d;
        padding: 1rem;
        margin: 1rem 0;
        font-size: 0.9em;
        color: #6c757d;
      }
      
      .semantic-featured {
        background-color: #fff;
        border: 2px solid #007bff;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 1.5rem 0;
        box-shadow: 0 2px 4px rgba(0,123,255,0.1);
      }
      
      .semantic-secondary {
        color: #6c757d;
        font-size: 0.875em;
      }
      
      .semantic-decorative {
        opacity: 0.7;
      }
      
      .semantic-call-to-action {
        background: linear-gradient(135deg, #007bff, #0056b3);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        margin: 1rem 0;
        text-align: center;
        font-weight: 600;
        box-shadow: 0 3px 6px rgba(0,123,255,0.3);
      }
      
      .semantic-call-to-action:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 10px rgba(0,123,255,0.4);
      }
      
      .semantic-definition {
        background-color: #e9ecef;
        border-left: 4px solid #6610f2;
        padding: 0.75rem 1rem;
        margin: 1rem 0;
        font-style: italic;
      }
      
      .semantic-example {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 1rem;
        margin: 1rem 0;
        position: relative;
      }
      
      .semantic-example::before {
        content: "Example";
        position: absolute;
        top: -0.5rem;
        left: 1rem;
        background-color: #fff;
        padding: 0 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: #6c757d;
        text-transform: uppercase;
      }
      
      .semantic-quote {
        font-style: italic;
        border-left: 4px solid #6c757d;
        padding-left: 1rem;
        margin: 1rem 0;
      }
      
      .semantic-citation {
        font-size: 0.875em;
        color: #6c757d;
      }
      
      .semantic-footnote {
        font-size: 0.8em;
        color: #6c757d;
        border-top: 1px solid #dee2e6;
        padding-top: 0.5rem;
        margin-top: 1rem;
      }
      
      .semantic-annotation {
        background-color: #fff9c4;
        border-left: 4px solid #ffc107;
        padding: 0.5rem 1rem;
        margin: 0.5rem 0;
        font-size: 0.9em;
      }
      
      /* Accessibility hint styles */
      .sr-priority-high {
        /* Screen reader priority styles handled via ARIA */
      }
      
      .sr-priority-low {
        /* Screen reader priority styles handled via ARIA */
      }
      
      .focus-trap {
        outline: 2px solid #007bff;
        outline-offset: 2px;
      }
      
      .high-contrast-compatible {
        border: 1px solid currentColor;
        background-color: transparent;
      }
      
      .motion-safe * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
      
      .cognitive-high {
        font-size: 1.1em;
        line-height: 1.8;
        max-width: 60ch;
      }
      
      .cognitive-low {
        font-size: 1em;
        line-height: 1.6;
      }
      
      /* Layout hint styles */
      .layout-keep-together {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .layout-new-page {
        page-break-before: always;
        break-before: page;
      }
      
      .layout-float-left {
        float: left;
        margin: 0 1rem 1rem 0;
      }
      
      .layout-float-right {
        float: right;
        margin: 0 0 1rem 1rem;
      }
      
      .layout-center {
        margin: 0 auto;
        text-align: center;
      }
      
      .layout-full-width {
        width: 100%;
      }
      
      .layout-responsive {
        max-width: 100%;
        height: auto;
      }
      
      /* Pedagogical hint styles */
      .pedagogical-key-concept {
        background-color: #fff3e0;
        border: 1px solid #ffcc02;
        border-left: 4px solid #ff9800;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 4px;
      }
      
      .pedagogical-key-concept::before {
        content: "🔑 Key Concept";
        display: block;
        font-weight: 700;
        color: #e65100;
        margin-bottom: 0.5rem;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .pedagogical-learning-objective {
        background-color: #e8f5e8;
        border: 1px solid #c3e6cb;
        border-left: 4px solid #28a745;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 4px;
      }
      
      .pedagogical-learning-objective::before {
        content: "🎯 Learning Objective";
        display: block;
        font-weight: 700;
        color: #155724;
        margin-bottom: 0.5rem;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .pedagogical-assessment {
        background-color: #f3e8ff;
        border: 1px solid #d6ccf5;
        border-left: 4px solid #6f42c1;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 4px;
      }
      
      .pedagogical-assessment::before {
        content: "📝 Assessment";
        display: block;
        font-weight: 700;
        color: #4c2a85;
        margin-bottom: 0.5rem;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .pedagogical-practice {
        background-color: #e6f7ff;
        border: 1px solid #b3e0ff;
        border-left: 4px solid #007bff;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 4px;
      }
      
      .pedagogical-practice::before {
        content: "💪 Practice";
        display: block;
        font-weight: 700;
        color: #0056b3;
        margin-bottom: 0.5rem;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      .pedagogical-reflection {
        background-color: #fff5f5;
        border: 1px solid #fed7d7;
        border-left: 4px solid #e53e3e;
        padding: 1rem;
        margin: 1rem 0;
        border-radius: 4px;
      }
      
      .pedagogical-reflection::before {
        content: "🤔 Reflection";
        display: block;
        font-weight: 700;
        color: #c53030;
        margin-bottom: 0.5rem;
        font-size: 0.9em;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      
      /* Responsive design for accessibility */
      @media (max-width: 768px) {
        .semantic-call-to-action {
          padding: 0.75rem 1rem;
          margin: 0.75rem 0;
        }
        
        .pedagogical-key-concept,
        .pedagogical-learning-objective,
        .pedagogical-assessment,
        .pedagogical-practice,
        .pedagogical-reflection {
          padding: 0.75rem;
          margin: 0.75rem 0;
        }
        
        .layout-float-left,
        .layout-float-right {
          float: none;
          margin: 1rem 0;
        }
      }
      
      /* High contrast mode support */
      @media (prefers-contrast: high) {
        .semantic-highlight {
          background-color: yellow;
          color: black;
        }
        
        .semantic-call-to-action {
          background: black;
          color: white;
          border: 2px solid white;
        }
      }
      
      /* Reduced motion support */
      @media (prefers-reduced-motion: reduce) {
        .semantic-call-to-action {
          transition: none;
        }
        
        .semantic-call-to-action:hover {
          transform: none;
        }
        
        .motion-safe * {
          animation: none !important;
          transition: none !important;
        }
      }
    `;
  }

  // Enhanced Rendering Hints Processing (v0.5.0)

  /**
   * Process rendering hints and apply them to HTML elements
   */
  private processRenderingHints(
    hints: RenderingHint[] | EnhancedRenderingHint[] | undefined,
    element: string,
    options: Required<HtmlRendererOptions>
  ): { element: string; cssClasses: string[]; styles: string; attributes: Record<string, string> } {
    if (!hints || hints.length === 0 || !options.enhancedHints) {
      return { element, cssClasses: [], styles: '', attributes: {} };
    }

    const cssClasses: string[] = [];
    const styles: string[] = [];
    const attributes: Record<string, string> = {};

    // Sort hints by priority (highest first)
    const sortedHints = [...hints].sort((a, b) => {
      const priorityA = ('priority' in a ? a.priority : 3) || 3;
      const priorityB = ('priority' in b ? b.priority : 3) || 3;
      return priorityB - priorityA;
    });

    for (const hint of sortedHints) {
      if (!this.shouldApplyHint(hint as EnhancedRenderingHint, options)) {
        continue;
      }

      const processed = this.processIndividualHint(hint as EnhancedRenderingHint);
      
      if (processed.cssClasses) cssClasses.push(...processed.cssClasses);
      if (processed.styles) styles.push(processed.styles);
      if (processed.attributes) Object.assign(attributes, processed.attributes);
    }

    return {
      element,
      cssClasses,
      styles: styles.join('; '),
      attributes
    };
  }

  /**
   * Check if a rendering hint should be applied based on conditions
   */
  private shouldApplyHint(hint: EnhancedRenderingHint, options: Required<HtmlRendererOptions>): boolean {
    if (!hint.conditions) return true;

    const { conditions } = hint;

    // Check output format condition
    if (conditions.outputFormats && !conditions.outputFormats.includes('html')) {
      return false;
    }

    // Check media query condition
    if (conditions.mediaQuery && !this.matchesMediaQuery(conditions.mediaQuery, options.mediaContext)) {
      return false;
    }

    // Check user preferences condition
    if (conditions.userPreferences && conditions.userPreferences.length > 0) {
      const hasMatchingPreference = conditions.userPreferences.some(pref => 
        options.userPreferences?.includes(pref)
      );
      if (!hasMatchingPreference) return false;
    }

    return true;
  }

  /**
   * Simple media query matching for conditional hints
   */
  private matchesMediaQuery(mediaQuery: string, context: string): boolean {
    // Simple implementation - in a full implementation, this would use proper CSS media query parsing
    if (mediaQuery.includes('screen') && context === 'screen') return true;
    if (mediaQuery.includes('print') && context === 'print') return true;
    if (mediaQuery.includes('speech') && context === 'speech') return true;
    
    // Default to true for unsupported queries to avoid breaking content
    return true;
  }

  /**
   * Process an individual rendering hint
   */
  private processIndividualHint(hint: EnhancedRenderingHint): {
    cssClasses?: string[];
    styles?: string;
    attributes?: Record<string, string>;
  } {
    const hintType = hint.hintType;

    // Semantic hints
    if (hintType.startsWith('https://xats.org/vocabularies/hints/semantic/')) {
      return this.processSemanticHint(hintType, hint.value);
    }

    // Accessibility hints
    if (hintType.startsWith('https://xats.org/vocabularies/hints/accessibility/')) {
      return this.processAccessibilityHint(hintType, hint.value);
    }

    // Layout hints
    if (hintType.startsWith('https://xats.org/vocabularies/hints/layout/')) {
      return this.processLayoutHint(hintType, hint.value);
    }

    // Pedagogical hints
    if (hintType.startsWith('https://xats.org/vocabularies/hints/pedagogical/')) {
      return this.processPedagogicalHint(hintType, hint.value);
    }

    return {};
  }

  /**
   * Process semantic rendering hints
   */
  private processSemanticHint(hintType: string, value: unknown): {
    cssClasses?: string[];
    styles?: string;
    attributes?: Record<string, string>;
  } {
    const semanticType = hintType.split('/').pop();
    const cssClasses: string[] = [];
    const attributes: Record<string, string> = {};

    switch (semanticType) {
      case 'emphasis':
        cssClasses.push('semantic-emphasis');
        break;
      case 'strong-emphasis':
        cssClasses.push('semantic-strong-emphasis');
        break;
      case 'highlight':
        cssClasses.push('semantic-highlight');
        break;
      case 'warning':
        cssClasses.push('semantic-warning');
        attributes.role = 'alert';
        break;
      case 'info':
        cssClasses.push('semantic-info');
        attributes.role = 'note';
        break;
      case 'success':
        cssClasses.push('semantic-success');
        attributes.role = 'status';
        break;
      case 'error':
        cssClasses.push('semantic-error');
        attributes.role = 'alert';
        attributes['aria-live'] = 'assertive';
        break;
      case 'aside':
        cssClasses.push('semantic-aside');
        attributes.role = 'complementary';
        break;
      case 'featured':
        cssClasses.push('semantic-featured');
        break;
      case 'secondary':
        cssClasses.push('semantic-secondary');
        break;
      case 'decorative':
        cssClasses.push('semantic-decorative');
        attributes['aria-hidden'] = 'true';
        break;
      case 'call-to-action':
        cssClasses.push('semantic-call-to-action');
        break;
      case 'definition':
        cssClasses.push('semantic-definition');
        break;
      case 'example':
        cssClasses.push('semantic-example');
        break;
      case 'quote':
        cssClasses.push('semantic-quote');
        break;
      case 'citation':
        cssClasses.push('semantic-citation');
        break;
      case 'footnote':
        cssClasses.push('semantic-footnote');
        attributes.role = 'doc-footnote';
        break;
      case 'annotation':
        cssClasses.push('semantic-annotation');
        attributes.role = 'doc-pullquote';
        break;
      default:
        cssClasses.push(`semantic-${semanticType}`);
    }

    return { cssClasses, attributes };
  }

  /**
   * Process accessibility rendering hints
   */
  private processAccessibilityHint(hintType: string, value: unknown): {
    cssClasses?: string[];
    styles?: string;
    attributes?: Record<string, string>;
  } {
    const accessibilityType = hintType.split('/').pop();
    const cssClasses: string[] = [];
    const attributes: Record<string, string> = {};

    switch (accessibilityType) {
      case 'screen-reader-priority-high':
        attributes['aria-live'] = 'assertive';
        cssClasses.push('sr-priority-high');
        break;
      case 'screen-reader-priority-low':
        cssClasses.push('sr-priority-low');
        break;
      case 'skip-screen-reader':
        attributes['aria-hidden'] = 'true';
        break;
      case 'keyboard-shortcut':
        if (typeof value === 'string') {
          attributes.accesskey = value;
        }
        break;
      case 'focus-trap':
        cssClasses.push('focus-trap');
        break;
      case 'aria-live-polite':
        attributes['aria-live'] = 'polite';
        break;
      case 'aria-live-assertive':
        attributes['aria-live'] = 'assertive';
        break;
      case 'high-contrast-compatible':
        cssClasses.push('high-contrast-compatible');
        break;
      case 'motion-safe':
        cssClasses.push('motion-safe');
        break;
      case 'cognitive-load-high':
        cssClasses.push('cognitive-high');
        break;
      case 'cognitive-load-low':
        cssClasses.push('cognitive-low');
        break;
    }

    // Handle object-style accessibility hints
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      
      if (obj.ariaLabel) attributes['aria-label'] = String(obj.ariaLabel);
      if (obj.ariaDescription) attributes['aria-describedby'] = String(obj.ariaDescription);
      if (typeof obj.tabIndex === 'number') attributes.tabindex = String(obj.tabIndex);
      if (obj.keyboardShortcut) attributes.accesskey = String(obj.keyboardShortcut);
    }

    return { cssClasses, attributes };
  }

  /**
   * Process layout rendering hints
   */
  private processLayoutHint(hintType: string, value: unknown): {
    cssClasses?: string[];
    styles?: string;
    attributes?: Record<string, string>;
  } {
    const layoutType = hintType.split('/').pop();
    const cssClasses: string[] = [];
    let styles = '';

    switch (layoutType) {
      case 'keep-together':
        cssClasses.push('layout-keep-together');
        styles += 'page-break-inside: avoid; break-inside: avoid;';
        break;
      case 'allow-break':
        cssClasses.push('layout-allow-break');
        break;
      case 'force-new-page':
        cssClasses.push('layout-new-page');
        styles += 'page-break-before: always; break-before: page;';
        break;
      case 'float-left':
        cssClasses.push('layout-float-left');
        styles += 'float: left;';
        break;
      case 'float-right':
        cssClasses.push('layout-float-right');
        styles += 'float: right;';
        break;
      case 'center':
        cssClasses.push('layout-center');
        styles += 'margin: 0 auto; text-align: center;';
        break;
      case 'full-width':
        cssClasses.push('layout-full-width');
        styles += 'width: 100%;';
        break;
      case 'responsive':
        cssClasses.push('layout-responsive');
        break;
      default:
        cssClasses.push(`layout-${layoutType}`);
    }

    // Handle object-style layout hints
    if (typeof value === 'object' && value !== null) {
      const obj = value as Record<string, unknown>;
      
      if (obj.width) styles += `width: ${obj.width}; `;
      if (obj.margin) styles += `margin: ${obj.margin}; `;
      if (obj.padding) styles += `padding: ${obj.padding}; `;
    }

    return { cssClasses, styles };
  }

  /**
   * Process pedagogical rendering hints
   */
  private processPedagogicalHint(hintType: string, value: unknown): {
    cssClasses?: string[];
    styles?: string;
    attributes?: Record<string, string>;
  } {
    const pedagogicalType = hintType.split('/').pop();
    const cssClasses: string[] = [];
    const attributes: Record<string, string> = {};

    switch (pedagogicalType) {
      case 'key-concept':
        cssClasses.push('pedagogical-key-concept');
        attributes.role = 'note';
        break;
      case 'learning-objective':
        cssClasses.push('pedagogical-learning-objective');
        break;
      case 'assessment':
        cssClasses.push('pedagogical-assessment');
        break;
      case 'practice':
        cssClasses.push('pedagogical-practice');
        break;
      case 'reflection':
        cssClasses.push('pedagogical-reflection');
        break;
      default:
        cssClasses.push(`pedagogical-${pedagogicalType}`);
    }

    return { cssClasses, attributes };
  }
}
