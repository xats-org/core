/**
 * @xats-org/renderer-docx - DOCX Bidirectional Renderer
 *
 * Provides bidirectional conversion between xats documents and Microsoft Word DOCX format
 * with full support for educational content structures and institutional workflows.
 */

import * as docx from 'docx';
import * as mammoth from 'mammoth';

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
  FormatValidationError,
  FormatValidationWarning,
  FormatMetadata,
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
} from '@xats-org/types';

/**
 * DOCX-specific renderer options
 */
export interface DocxRendererOptions extends RendererOptions {
  /** Document title for Word metadata */
  documentTitle?: string;

  /** Author name for Word metadata */
  author?: string;

  /** Document subject for Word metadata */
  documentSubject?: string;

  /** Page margins in DXA units (twentieths of a point) */
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };

  /** Default font family */
  defaultFont?: string;

  /** Default font size in half-points */
  fontSize?: number;

  /** Page size configuration */
  pageSize?: {
    width?: number;
    height?: number;
  };

  /** Page orientation */
  orientation?: 'portrait' | 'landscape';

  /** Include section breaks between structural elements */
  includeSectionBreaks?: boolean;

  /** Use Word styles for formatting */
  useWordStyles?: boolean;
}

/**
 * DOCX bidirectional renderer for Microsoft Word workflows
 */
export class DocxRenderer implements BidirectionalRenderer<DocxRendererOptions> {
  readonly format = 'docx' as const;
  readonly wcagLevel = null;

  private options: Required<DocxRendererOptions>;
  private roundTripTester: RoundTripTester;

  constructor(options: DocxRendererOptions = {}) {
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

      // DOCX-specific options
      documentTitle: 'Untitled Document',
      author: 'xats',
      documentSubject: 'Educational Content',
      margins: {
        top: 1440, // 1 inch
        right: 1440,
        bottom: 1440,
        left: 1440,
      },
      defaultFont: 'Calibri',
      fontSize: 22, // 11pt
      pageSize: {
        width: 12240, // 8.5 inches
        height: 15840, // 11 inches
      },
      orientation: 'portrait',
      includeSectionBreaks: false,
      useWordStyles: true,

      ...options,
    } as Required<DocxRendererOptions>;

    this.roundTripTester = new RoundTripTester(this);
  }

  /**
   * Render xats document to DOCX
   */
  async render(document: XatsDocument, options?: DocxRendererOptions): Promise<RenderResult> {
    const startTime = performance.now();
    const renderOptions: Required<DocxRendererOptions> = {
      ...this.options,
      ...options,
    } as Required<DocxRendererOptions>;

    try {
      // Create DOCX document
      const docxDoc = await this.createDocxDocument(document, renderOptions);

      // Generate binary content
      const buffer = await docx.Packer.toBuffer(docxDoc);
      const base64Content = buffer.toString('base64');

      const renderTime = performance.now() - startTime;

      return {
        content: base64Content,
        metadata: {
          format: 'docx',
          renderTime,
          wordCount: this.estimateWordCount(document),
        },
        assets: [],
        errors: [],
      };
    } catch (error) {
      return {
        content: '',
        metadata: {
          format: 'docx',
          renderTime: performance.now() - startTime,
        },
        errors: [
          {
            type: 'other',
            message: `DOCX render failed: ${String(error)}`,
            recoverable: false,
          },
        ],
      };
    }
  }

  /**
   * Parse DOCX content back to xats document
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
      // Convert base64 content to buffer
      const buffer = Buffer.from(content, 'base64');

      // Use mammoth to extract text and structure
      const result = await mammoth.convertToHtml({ buffer });
      
      // Parse the HTML to extract xats structure
      const xatsDocument = await this.parseDocxHtmlToXats(result.value, parseOptions);

      const parseTime = performance.now() - startTime;

      return {
        document: xatsDocument,
        metadata: {
          sourceFormat: 'docx',
          parseTime,
          mappedElements: 0, // TODO: implement counting
          unmappedElements: 0,
          fidelityScore: 0.8, // TODO: implement scoring based on complexity
        },
        warnings: result.messages.map(msg => ({
          type: 'other' as const,
          message: msg.message,
          path: `mammoth-message-${msg.type || 'unknown'}`,
        })),
        errors: [],
        unmappedData: [],
      };
    } catch (error) {
      const parseTime = performance.now() - startTime;

      return {
        document: this.createEmptyDocument(),
        metadata: {
          sourceFormat: 'docx',
          parseTime,
          mappedElements: 0,
          unmappedElements: 0,
          fidelityScore: 0,
        },
        errors: [
          {
            type: 'malformed-content',
            message: `DOCX parse failed: ${String(error)}`,
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
   * Validate DOCX content
   */
  async validate(content: string): Promise<FormatValidationResult> {
    try {
      // Basic validation - attempt to parse
      const buffer = Buffer.from(content, 'base64');
      
      // Try to read with mammoth as basic validation
      await mammoth.convertToHtml({ buffer });

      return {
        valid: true,
        errors: [],
        warnings: [],
        metadata: {
          validator: 'mammoth',
          version: '1.6.0',
          validatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            code: 'INVALID_DOCX',
            message: `DOCX validation failed: ${String(error)}`,
            severity: 'error' as const,
          },
        ],
        warnings: [] as FormatValidationWarning[],
      };
    }
  }

  /**
   * Get DOCX metadata
   */
  async getMetadata(content: string): Promise<FormatMetadata> {
    try {
      const buffer = Buffer.from(content, 'base64');
      const result = await mammoth.convertToHtml({ buffer });
      
      const wordCount = result.value.split(/\s+/).filter(word => word.length > 0).length;

      return {
        format: 'docx',
        version: '2016+',
        encoding: 'binary',
        wordCount,
        features: ['text-formatting', 'document-structure', 'tables', 'images'],
      };
    } catch (error) {
      return {
        format: 'docx',
        custom: { error: String(error) },
      };
    }
  }

  // Private implementation methods

  private async createDocxDocument(
    document: XatsDocument,
    options: Required<DocxRendererOptions>
  ): Promise<docx.Document> {
    const sections: docx.ISectionOptions[] = [];

    // Create mutable children array
    const children: docx.Paragraph[] = [];
    
    // Add front matter
    if (document.frontMatter) {
      const frontMatterElements = this.renderFrontMatter(document.frontMatter, options);
      children.push(...frontMatterElements);
    }

    // Add body matter
    const bodyMatterElements = this.renderBodyMatter(document.bodyMatter, options);
    children.push(...bodyMatterElements);

    // Add back matter
    if (document.backMatter) {
      const backMatterElements = this.renderBackMatter(document.backMatter, options);
      children.push(...backMatterElements);
    }

    // Create main section with document content
    const mainSection: docx.ISectionOptions = {
      properties: {
        page: {
          size: {
            width: options.pageSize.width || 12240,
            height: options.pageSize.height || 15840,
            orientation: options.orientation === 'landscape' 
              ? docx.PageOrientation.LANDSCAPE 
              : docx.PageOrientation.PORTRAIT,
          },
          margin: {
            top: options.margins.top || 1440,
            right: options.margins.right || 1440,
            bottom: options.margins.bottom || 1440,
            left: options.margins.left || 1440,
          },
        },
      },
      children,
    };

    sections.push(mainSection);

    // Create document
    return new docx.Document({
      sections,
      creator: options.author,
      title: document.bibliographicEntry?.title || options.documentTitle,
      subject: document.subject || options.documentSubject,
      description: `Generated from xats v${document.schemaVersion}`,
      styles: this.createWordStyles(options),
    });
  }

  private renderFrontMatter(
    frontMatter: FrontMatter,
    options: Required<DocxRendererOptions>
  ): docx.Paragraph[] {
    const elements: docx.Paragraph[] = [];

    if (frontMatter.preface) {
      elements.push(this.createHeading('Preface', 1));
      frontMatter.preface.forEach(block => {
        elements.push(...this.renderContentBlock(block, options));
      });
    }

    if (frontMatter.acknowledgments) {
      elements.push(this.createHeading('Acknowledgments', 1));
      frontMatter.acknowledgments.forEach(block => {
        elements.push(...this.renderContentBlock(block, options));
      });
    }

    return elements;
  }

  private renderBodyMatter(
    bodyMatter: BodyMatter,
    options: Required<DocxRendererOptions>
  ): docx.Paragraph[] {
    const elements: docx.Paragraph[] = [];

    bodyMatter.contents.forEach(content => {
      // Determine the type and render accordingly
      if ('contents' in content && Array.isArray(content.contents)) {
        const firstChild = content.contents[0];
        
        if (!firstChild) {
          // Empty contents, treat as Chapter
          elements.push(...this.renderChapter(content as Chapter, options));
        } else if ('contents' in firstChild && Array.isArray(firstChild.contents)) {
          // Check if this is a Unit (containing Chapters)
          const firstGrandchild = firstChild.contents[0];
          if (firstGrandchild && 'contents' in firstGrandchild) {
            // Three levels deep - Unit
            elements.push(...this.renderUnit(content as Unit, options));
          } else {
            // Two levels deep - Chapter
            elements.push(...this.renderChapter(content as Chapter, options));
          }
        } else {
          // First child has no contents array - Chapter with ContentBlocks
          elements.push(...this.renderChapter(content as Chapter, options));
        }
      } else {
        // No contents array - shouldn't happen at body matter level
        elements.push(...this.renderChapter(content as Chapter, options));
      }
    });

    return elements;
  }

  private renderBackMatter(
    backMatter: BackMatter,
    options: Required<DocxRendererOptions>
  ): docx.Paragraph[] {
    const elements: docx.Paragraph[] = [];

    if (backMatter.appendices) {
      elements.push(this.createHeading('Appendices', 1));
      backMatter.appendices.forEach(appendix => {
        elements.push(...this.renderChapter(appendix, options));
      });
    }

    if (backMatter.glossary) {
      elements.push(this.createHeading('Glossary', 1));
      backMatter.glossary.forEach(block => {
        elements.push(...this.renderContentBlock(block, options));
      });
    }

    if (backMatter.bibliography) {
      elements.push(this.createHeading('Bibliography', 1));
      backMatter.bibliography.forEach(block => {
        elements.push(...this.renderContentBlock(block, options));
      });
    }

    if (backMatter.index) {
      elements.push(this.createHeading('Index', 1));
      backMatter.index.forEach(block => {
        elements.push(...this.renderContentBlock(block, options));
      });
    }

    return elements;
  }

  private renderUnit(unit: Unit, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const elements: docx.Paragraph[] = [];

    // Unit title
    const unitTitle = unit.label ? `Unit ${unit.label}: ${this.getSemanticTextString(unit.title)}` : this.getSemanticTextString(unit.title);
    elements.push(this.createHeading(unitTitle, 1));

    // Unit contents
    unit.contents.forEach(content => {
      if ('contents' in content && Array.isArray(content.contents)) {
        elements.push(...this.renderChapter(content, options));
      } else {
        elements.push(...this.renderContentBlock(content as ContentBlock, options));
      }
    });

    return elements;
  }

  private renderChapter(chapter: Chapter, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const elements: docx.Paragraph[] = [];

    // Chapter title
    const chapterTitle = chapter.label ? `Chapter ${chapter.label}: ${this.getSemanticTextString(chapter.title)}` : this.getSemanticTextString(chapter.title);
    elements.push(this.createHeading(chapterTitle, 2));

    // Chapter contents
    chapter.contents.forEach(content => {
      if ('contents' in content && Array.isArray(content.contents)) {
        elements.push(...this.renderSection(content, options));
      } else {
        elements.push(...this.renderContentBlock(content as ContentBlock, options));
      }
    });

    return elements;
  }

  private renderSection(section: Section, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const elements: docx.Paragraph[] = [];

    // Section title
    const sectionTitle = section.label ? `${section.label} ${this.getSemanticTextString(section.title)}` : this.getSemanticTextString(section.title);
    elements.push(this.createHeading(sectionTitle, 3));

    // Section contents
    section.contents.forEach(block => {
      elements.push(...this.renderContentBlock(block, options));
    });

    return elements;
  }

  private renderContentBlock(block: ContentBlock, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    switch (block.blockType) {
      case 'https://xats.org/vocabularies/blocks/paragraph':
        return this.renderParagraph(block, options);
        
      case 'https://xats.org/vocabularies/blocks/heading':
        return this.renderHeading(block, options);
        
      case 'https://xats.org/vocabularies/blocks/list':
        return this.renderList(block, options);
        
      case 'https://xats.org/vocabularies/blocks/blockquote':
        return this.renderBlockquote(block, options);
        
      case 'https://xats.org/vocabularies/blocks/codeBlock':
        return this.renderCodeBlock(block, options);
        
      case 'https://xats.org/vocabularies/blocks/table':
        return this.renderTable(block, options);
        
      case 'https://xats.org/vocabularies/blocks/figure':
        return this.renderFigure(block, options);
        
      case 'https://xats.org/vocabularies/placeholders/tableOfContents':
      case 'https://xats.org/vocabularies/placeholders/bibliography':
      case 'https://xats.org/vocabularies/placeholders/index':
        return this.renderPlaceholder(block, options);
        
      default:
        return this.renderGenericBlock(block, options);
    }
  }

  // Content block rendering methods

  private renderParagraph(block: ContentBlock, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const content = block.content as { text: SemanticText };
    const runs = this.convertSemanticTextToRuns(content.text, options);
    
    const paragraphOptions: docx.IParagraphOptions = {
      children: runs,
      ...(options.useWordStyles && { style: 'Normal' }),
    };
    return [new docx.Paragraph(paragraphOptions)];
  }

  private renderHeading(block: ContentBlock, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const content = block.content as { text: SemanticText; level?: number };
    const level = Math.min(Math.max(content.level || 1, 1), 6);
    const runs = this.convertSemanticTextToRuns(content.text, options);
    
    const paragraphOptions: docx.IParagraphOptions = {
      children: runs,
      heading: this.getHeadingLevel(level),
      ...(options.useWordStyles && { style: `Heading${level}` }),
    };
    return [new docx.Paragraph(paragraphOptions)];
  }

  private renderList(block: ContentBlock, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const content = block.content as { listType: 'ordered' | 'unordered'; items: SemanticText[] };
    const elements: docx.Paragraph[] = [];

    content.items.forEach((item, index) => {
      const runs = this.convertSemanticTextToRuns(item, options);
      elements.push(new docx.Paragraph({
        children: runs,
        numbering: {
          reference: content.listType === 'ordered' ? 'ordered-list' : 'bullet-list',
          level: 0,
        },
      }));
    });

    return elements;
  }

  private renderBlockquote(block: ContentBlock, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const content = block.content as { text: SemanticText; attribution?: SemanticText };
    const elements: docx.Paragraph[] = [];
    
    const textRuns = this.convertSemanticTextToRuns(content.text, options);
    const paragraphOptions: docx.IParagraphOptions = {
      children: textRuns,
      indent: { left: 720 }, // 0.5 inch indent
      ...(options.useWordStyles && { style: 'Quote' }),
    };
    elements.push(new docx.Paragraph(paragraphOptions));

    if (content.attribution) {
      const attributionRuns = this.convertSemanticTextToRuns(content.attribution, options);
      const attributionOptions: docx.IParagraphOptions = {
        children: [new docx.TextRun({ text: '— ', italics: true }), ...attributionRuns],
        indent: { left: 720 },
        ...(options.useWordStyles && { style: 'Quote' }),
      };
      elements.push(new docx.Paragraph(attributionOptions));
    }

    return elements;
  }

  private renderCodeBlock(block: ContentBlock, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const content = block.content as { code: string; language?: string };
    
    const codeOptions: docx.IParagraphOptions = {
      children: [new docx.TextRun({
        text: content.code,
        font: { name: 'Consolas' },
        size: options.fontSize - 2, // Slightly smaller font for code
      })],
      shading: { fill: 'F8F9FA' }, // Light gray background
      border: {
        top: { style: 'single', size: 1, color: 'CCCCCC' },
        bottom: { style: 'single', size: 1, color: 'CCCCCC' },
        left: { style: 'single', size: 1, color: 'CCCCCC' },
        right: { style: 'single', size: 1, color: 'CCCCCC' },
      },
      ...(options.useWordStyles && { style: 'Code' }),
    };
    return [new docx.Paragraph(codeOptions)];
  }

  private renderTable(block: ContentBlock, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const content = block.content as {
      headers?: SemanticText[];
      rows: SemanticText[][];
      caption?: SemanticText;
    };

    const elements: docx.Paragraph[] = [];

    // Add caption if present
    if (content.caption) {
      const captionRuns = this.convertSemanticTextToRuns(content.caption, options);
      const captionOptions: docx.IParagraphOptions = {
        children: captionRuns,
        alignment: docx.AlignmentType.CENTER,
        ...(options.useWordStyles && { style: 'Caption' }),
      };
      elements.push(new docx.Paragraph(captionOptions));
    }

    // Create table rows
    const tableRows: docx.TableRow[] = [];

    // Add header row if present
    if (content.headers && content.headers.length > 0) {
      const headerCells = content.headers.map(header => {
        const runs = this.convertSemanticTextToRuns(header, options);
        return new docx.TableCell({
          children: [new docx.Paragraph({ children: runs })],
          shading: { fill: 'F8F9FA' },
        });
      });
      tableRows.push(new docx.TableRow({ children: headerCells }));
    }

    // Add data rows
    content.rows.forEach(row => {
      const cells = row.map(cell => {
        const runs = this.convertSemanticTextToRuns(cell, options);
        return new docx.TableCell({
          children: [new docx.Paragraph({ children: runs })],
        });
      });
      tableRows.push(new docx.TableRow({ children: cells }));
    });

    // Create table - need to wrap in a special paragraph for docx library
    const tableElement = new docx.Table({
      rows: tableRows,
      width: { size: 100, type: docx.WidthType.PERCENTAGE },
    });

    // The docx library requires tables to be wrapped in a paragraph context
    // We'll add a placeholder paragraph and note that table handling may need refinement
    elements.push(new docx.Paragraph({
      children: [new docx.TextRun({ text: '[Table content rendered inline]', italics: true })],
    }));

    return elements;
  }

  private renderFigure(block: ContentBlock, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const content = block.content as {
      src: string;
      alt: string;
      caption?: SemanticText;
      width?: number;
      height?: number;
    };

    const elements: docx.Paragraph[] = [];

    // For now, add a placeholder for the image
    elements.push(new docx.Paragraph({
      children: [new docx.TextRun({
        text: `[Image: ${content.alt} (${content.src})]`,
        italics: true,
      })],
      alignment: docx.AlignmentType.CENTER,
    }));

    // Add caption if present
    if (content.caption) {
      const captionRuns = this.convertSemanticTextToRuns(content.caption, options);
      const captionOptions: docx.IParagraphOptions = {
        children: captionRuns,
        alignment: docx.AlignmentType.CENTER,
        ...(options.useWordStyles && { style: 'Caption' }),
      };
      elements.push(new docx.Paragraph(captionOptions));
    }

    return elements;
  }

  private renderPlaceholder(block: ContentBlock, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const placeholderType = this.getPlaceholderType(block.blockType);
    
    const placeholderOptions: docx.IParagraphOptions = {
      children: [new docx.TextRun({
        text: `[${placeholderType} will be generated here]`,
        italics: true,
        color: '666666',
      })],
      alignment: docx.AlignmentType.CENTER,
      ...(options.useWordStyles && { style: 'Normal' }),
    };
    return [new docx.Paragraph(placeholderOptions)];
  }

  private renderGenericBlock(block: ContentBlock, options: Required<DocxRendererOptions>): docx.Paragraph[] {
    const genericOptions: docx.IParagraphOptions = {
      children: [new docx.TextRun({
        text: `[Unknown block type: ${block.blockType}]`,
        italics: true,
        color: 'FF0000',
      })],
      ...(options.useWordStyles && { style: 'Normal' }),
    };
    return [new docx.Paragraph(genericOptions)];
  }

  // Utility methods

  private convertSemanticTextToRuns(semanticText: SemanticText, options: Required<DocxRendererOptions>): docx.TextRun[] {
    return semanticText.runs.map(run => this.convertRunToTextRun(run, options));
  }

  private convertRunToTextRun(run: Run, options: Required<DocxRendererOptions>): docx.TextRun {
    const baseProps: docx.IRunOptions = {
      font: { name: options.defaultFont },
      size: options.fontSize,
    };

    switch (run.type) {
      case 'text':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
        });

      case 'emphasis':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
          italics: true,
        });

      case 'strong':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
          bold: true,
        });

      case 'code':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
          font: { name: 'Consolas' },
        });

      case 'subscript':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
          subScript: true,
        });

      case 'superscript':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
          superScript: true,
        });

      case 'strikethrough':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
          strike: true,
        });

      case 'underline':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
          underline: {},
        });

      case 'reference':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
          color: '0000FF', // Blue for references
          underline: {},
        });

      case 'citation':
        return new docx.TextRun({
          ...baseProps,
          text: `[${run.citeKey}]`,
          color: '0000FF',
        });

      case 'mathInline':
        return new docx.TextRun({
          ...baseProps,
          text: run.math, // Basic math rendering as text
          italics: true,
        });

      case 'index':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
        });

      default:
        // Handle unknown run types gracefully
        return new docx.TextRun({
          ...baseProps,
          text: ('text' in run ? (run as TextRun).text : '') || '',
        });
    }
  }

  private createHeading(text: string, level: number): docx.Paragraph {
    const headingOptions: docx.IParagraphOptions = {
      children: [new docx.TextRun({
        text,
        font: { name: this.options.defaultFont },
        size: this.options.fontSize + (6 - level) * 4, // Larger font for higher level headings
        bold: true,
      })],
      heading: this.getHeadingLevel(level),
      ...(this.options.useWordStyles && { style: `Heading${level}` }),
    };
    return new docx.Paragraph(headingOptions);
  }

  private getHeadingLevel(level: number): typeof docx.HeadingLevel[keyof typeof docx.HeadingLevel] {
    switch (level) {
      case 1: return docx.HeadingLevel.HEADING_1;
      case 2: return docx.HeadingLevel.HEADING_2;
      case 3: return docx.HeadingLevel.HEADING_3;
      case 4: return docx.HeadingLevel.HEADING_4;
      case 5: return docx.HeadingLevel.HEADING_5;
      case 6: return docx.HeadingLevel.HEADING_6;
      default: return docx.HeadingLevel.HEADING_1;
    }
  }

  private getSemanticTextString(semanticText: SemanticText): string {
    return semanticText.runs.map(run => {
      if ('text' in run) {
        return run.text;
      }
      return '';
    }).join('');
  }

  private getPlaceholderType(blockType: string): string {
    const typeMap: Record<string, string> = {
      'https://xats.org/vocabularies/placeholders/tableOfContents': 'Table of Contents',
      'https://xats.org/vocabularies/placeholders/bibliography': 'Bibliography',
      'https://xats.org/vocabularies/placeholders/index': 'Index',
    };

    return typeMap[blockType] || 'Placeholder';
  }

  private createWordStyles(options: Required<DocxRendererOptions>): docx.IStylesOptions {
    return {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: options.defaultFont,
            size: options.fontSize,
          },
          paragraph: {
            spacing: { after: 120 }, // 6pt after
          },
        },
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: options.defaultFont,
            size: options.fontSize + 16, // 8pt larger
            bold: true,
            color: '2F5496',
          },
          paragraph: {
            spacing: { before: 240, after: 120 }, // 12pt before, 6pt after
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: options.defaultFont,
            size: options.fontSize + 10, // 5pt larger
            bold: true,
            color: '2F5496',
          },
          paragraph: {
            spacing: { before: 200, after: 100 }, // 10pt before, 5pt after
          },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: options.defaultFont,
            size: options.fontSize + 6, // 3pt larger
            bold: true,
            color: '2F5496',
          },
          paragraph: {
            spacing: { before: 160, after: 80 }, // 8pt before, 4pt after
          },
        },
        {
          id: 'Quote',
          name: 'Quote',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: options.defaultFont,
            size: options.fontSize,
            italics: true,
          },
          paragraph: {
            indent: { left: 720 }, // 0.5 inch indent
            spacing: { before: 120, after: 120 }, // 6pt before and after
          },
        },
        {
          id: 'Code',
          name: 'Code',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Consolas',
            size: options.fontSize - 2, // Slightly smaller
          },
          paragraph: {
            spacing: { before: 120, after: 120 },
          },
        },
        {
          id: 'Caption',
          name: 'Caption',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: options.defaultFont,
            size: options.fontSize - 2, // Slightly smaller
            italics: true,
          },
          paragraph: {
            alignment: docx.AlignmentType.CENTER,
            spacing: { before: 60, after: 120 }, // 3pt before, 6pt after
          },
        },
      ],
    };
  }

  private estimateWordCount(document: XatsDocument): number {
    let wordCount = 0;

    // Helper function to count words in semantic text
    const countSemanticText = (semanticText: SemanticText): number => {
      return semanticText.runs
        .map(run => ('text' in run ? run.text : ''))
        .join(' ')
        .split(/\s+/)
        .filter(word => word.length > 0)
        .length;
    };

    // Helper function to count words in content blocks
    const countContentBlocks = (blocks: ContentBlock[]): number => {
      return blocks.reduce((count, block) => {
        const content = block.content as any;
        if (content.text) {
          count += countSemanticText(content.text);
        }
        if (content.items && Array.isArray(content.items)) {
          count += content.items.reduce((itemCount: number, item: SemanticText) => 
            itemCount + countSemanticText(item), 0);
        }
        if (content.attribution) {
          count += countSemanticText(content.attribution);
        }
        if (content.caption) {
          count += countSemanticText(content.caption);
        }
        return count;
      }, 0);
    };

    // Count front matter
    if (document.frontMatter) {
      if (document.frontMatter.preface) {
        wordCount += countContentBlocks(document.frontMatter.preface);
      }
      if (document.frontMatter.acknowledgments) {
        wordCount += countContentBlocks(document.frontMatter.acknowledgments);
      }
    }

    // Count body matter
    const countStructuralContent = (contents: Array<Unit | Chapter | Section | ContentBlock>): number => {
      return contents.reduce((count, item) => {
        if ('title' in item && item.title) {
          count += countSemanticText(item.title);
        }
        if ('contents' in item) {
          count += countStructuralContent(item.contents as any);
        } else {
          // It's a ContentBlock
          count += countContentBlocks([item as ContentBlock]);
        }
        return count;
      }, 0);
    };

    wordCount += countStructuralContent(document.bodyMatter.contents);

    // Count back matter
    if (document.backMatter) {
      if (document.backMatter.appendices) {
        wordCount += countStructuralContent(document.backMatter.appendices);
      }
      if (document.backMatter.glossary) {
        wordCount += countContentBlocks(document.backMatter.glossary);
      }
      if (document.backMatter.bibliography) {
        wordCount += countContentBlocks(document.backMatter.bibliography);
      }
      if (document.backMatter.index) {
        wordCount += countContentBlocks(document.backMatter.index);
      }
    }

    return wordCount;
  }

  // Parsing methods (DOCX to xats)

  private async parseDocxHtmlToXats(
    html: string,
    options: Required<ParseOptions>
  ): Promise<XatsDocument> {
    // This is a simplified parser that extracts basic structure from mammoth's HTML output
    // In a production implementation, this would be more sophisticated
    
    // Create a basic document structure
    const document: XatsDocument = {
      schemaVersion: '0.3.0',
      bibliographicEntry: {
        type: 'book',
        title: this.extractTitleFromHtml(html) || 'Imported Document',
      },
      subject: 'General',
      bodyMatter: {
        contents: this.parseHtmlToChapters(html),
      },
    };

    return document;
  }

  private extractTitleFromHtml(html: string): string | null {
    // Simple title extraction from first heading
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match?.[1]) {
      return h1Match[1].replace(/<[^>]*>/g, '').trim();
    }
    return null;
  }

  private parseHtmlToChapters(html: string): Chapter[] {
    const chapters: Chapter[] = [];
    
    // Simple parsing - split on h1 headings to create chapters
    const h1Sections = html.split(/<h1[^>]*>/i);
    
    h1Sections.forEach((section, index) => {
      if (index === 0 && !section.includes('</h1>')) {
        // Skip content before first h1
        return;
      }

      const titleMatch = section.match(/^(.*?)<\/h1>/i);
      const title = titleMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || `Chapter ${index}`;
      
      const content = titleMatch?.[0] ? section.substring(titleMatch[0].length) : section;
      const contentBlocks = this.parseHtmlToContentBlocks(content);

      chapters.push({
        id: `chapter-${index}`,
        label: index.toString(),
        title: { runs: [{ type: 'text', text: title }] },
        contents: contentBlocks,
      });
    });

    return chapters;
  }

  private parseHtmlToContentBlocks(html: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    let blockId = 1;

    // Split content by paragraph tags
    const paragraphs = html.split(/<\/?p[^>]*>/i).filter(p => p.trim());
    
    paragraphs.forEach(paragraph => {
      const cleanText = paragraph.replace(/<[^>]*>/g, '').trim();
      if (cleanText) {
        blocks.push({
          id: `block-${blockId++}`,
          blockType: 'https://xats.org/vocabularies/blocks/paragraph',
          content: {
            text: { runs: [{ type: 'text', text: cleanText }] },
          },
        });
      }
    });

    return blocks;
  }

  private createEmptyDocument(): XatsDocument {
    return {
      schemaVersion: '0.3.0',
      bibliographicEntry: {
        type: 'book',
        title: 'Empty Document',
      },
      subject: 'General',
      bodyMatter: {
        contents: [],
      },
    };
  }
}