/**
 * xats to Word Converter
 * 
 * Specialized converter for rendering xats documents to Microsoft Word format
 * with comprehensive support for educational content, formatting preservation,
 * and production workflow features.
 */

import * as docx from 'docx';

import type {
  WordConverterOptions,
  WordConversionContext,
} from '../types.js';

import type {
  XatsDocument,
  SemanticText,
  ContentBlock,
  Unit,
  Chapter,
  Section,
  FrontMatter,
  BodyMatter,
  BackMatter,
  Run,
} from '@xats-org/types';

/**
 * Specialized xats to Word converter
 */
export class XatsToWordConverter {
  private context: WordConversionContext;
  private options: Required<WordConverterOptions>;

  constructor(context: WordConversionContext, options: Required<WordConverterOptions>) {
    this.context = context;
    this.options = options;
  }

  /**
   * Convert xats document to Word document
   */
  async convert(document: XatsDocument): Promise<docx.Document> {
    // Initialize conversion context
    this.initializeStyles();
    this.initializeNumbering();

    // Build document sections
    const sections = await this.createDocumentSections(document);

    // Create Word document with comprehensive metadata
    return new docx.Document({
      sections,
      creator: this.options.author,
      title: document.bibliographicEntry?.title || this.options.documentTitle,
      subject: document.subject || this.options.documentSubject,
      company: this.options.company,
      category: this.options.category,
      keywords: this.options.keywords?.join(', '),
      description: `Generated from xats v${document.schemaVersion}`,
      language: this.options.language,
      lastModifiedBy: this.options.author,
      revision: '1',
      styles: this.createWordStyles(),
      numbering: this.createNumberingDefinitions(),
      footnotes: this.createFootnotes(),
      endnotes: this.createEndnotes(),
    });
  }

  /**
   * Create document sections with proper page setup
   */
  private async createDocumentSections(document: XatsDocument): Promise<docx.ISectionOptions[]> {
    const sections: docx.ISectionOptions[] = [];
    const children: docx.Paragraph[] = [];

    // Add front matter
    if (document.frontMatter) {
      const frontMatterElements = await this.renderFrontMatter(document.frontMatter);
      children.push(...frontMatterElements);
      
      if (this.options.pageSetup.sectionBreaks) {
        children.push(this.createSectionBreak());
      }
    }

    // Add body matter
    const bodyMatterElements = await this.renderBodyMatter(document.bodyMatter);
    children.push(...bodyMatterElements);

    // Add back matter
    if (document.backMatter) {
      if (this.options.pageSetup.sectionBreaks) {
        children.push(this.createSectionBreak());
      }
      
      const backMatterElements = await this.renderBackMatter(document.backMatter);
      children.push(...backMatterElements);
    }

    // Create main section with page setup
    sections.push({
      properties: {
        page: {
          size: this.options.pageSetup.size,
          orientation: this.options.pageSetup.orientation === 'landscape' 
            ? docx.PageOrientation.LANDSCAPE 
            : docx.PageOrientation.PORTRAIT,
          margin: {
            top: this.options.pageSetup.margins.top,
            right: this.options.pageSetup.margins.right,
            bottom: this.options.pageSetup.margins.bottom,
            left: this.options.pageSetup.margins.left,
            header: this.options.pageSetup.margins.header || 720,
            footer: this.options.pageSetup.margins.footer || 720,
          },
        },
      },
      headers: this.createHeaders(document),
      footers: this.createFooters(document),
      children,
    });

    return sections;
  }

  /**
   * Render front matter content
   */
  private async renderFrontMatter(frontMatter: FrontMatter): Promise<docx.Paragraph[]> {
    const elements: docx.Paragraph[] = [];

    // Title page
    if (frontMatter.titlePage) {
      elements.push(...await this.renderTitlePage(frontMatter.titlePage));
    }

    // Table of contents
    if (frontMatter.tableOfContents && this.options.includeTableOfContents) {
      elements.push(this.createHeading('Table of Contents', 1));
      elements.push(this.createTableOfContents());
    }

    // Preface
    if (frontMatter.preface) {
      elements.push(this.createHeading('Preface', 1));
      for (const block of frontMatter.preface) {
        elements.push(...await this.renderContentBlock(block));
      }
    }

    // Acknowledgments
    if (frontMatter.acknowledgments) {
      elements.push(this.createHeading('Acknowledgments', 1));
      for (const block of frontMatter.acknowledgments) {
        elements.push(...await this.renderContentBlock(block));
      }
    }

    return elements;
  }

  /**
   * Render body matter content
   */
  private async renderBodyMatter(bodyMatter: BodyMatter): Promise<docx.Paragraph[]> {
    const elements: docx.Paragraph[] = [];

    for (const content of bodyMatter.contents) {
      // Determine content type and render appropriately
      if (this.isUnit(content)) {
        elements.push(...await this.renderUnit(content));
      } else if (this.isChapter(content)) {
        elements.push(...await this.renderChapter(content));
      } else {
        elements.push(...await this.renderContentBlock(content as ContentBlock));
      }
    }

    return elements;
  }

  /**
   * Render back matter content
   */
  private async renderBackMatter(backMatter: BackMatter): Promise<docx.Paragraph[]> {
    const elements: docx.Paragraph[] = [];

    // Appendices
    if (backMatter.appendices) {
      elements.push(this.createHeading('Appendices', 1));
      for (const appendix of backMatter.appendices) {
        elements.push(...await this.renderChapter(appendix));
      }
    }

    // Glossary
    if (backMatter.glossary) {
      elements.push(this.createHeading('Glossary', 1));
      for (const block of backMatter.glossary) {
        elements.push(...await this.renderContentBlock(block));
      }
    }

    // Bibliography
    if (backMatter.bibliography && this.options.includeBibliography) {
      elements.push(this.createHeading('Bibliography', 1));
      for (const block of backMatter.bibliography) {
        elements.push(...await this.renderContentBlock(block));
      }
    }

    // Index
    if (backMatter.index && this.options.includeIndex) {
      elements.push(this.createHeading('Index', 1));
      for (const block of backMatter.index) {
        elements.push(...await this.renderContentBlock(block));
      }
    }

    return elements;
  }

  /**
   * Render title page
   */
  private async renderTitlePage(titlePage: ContentBlock[]): Promise<docx.Paragraph[]> {
    const elements: docx.Paragraph[] = [];

    for (const block of titlePage) {
      elements.push(...await this.renderContentBlock(block));
    }

    // Add page break after title page
    elements.push(new docx.Paragraph({
      children: [new docx.PageBreak()],
    }));

    return elements;
  }

  /**
   * Render a unit
   */
  private async renderUnit(unit: Unit): Promise<docx.Paragraph[]> {
    const elements: docx.Paragraph[] = [];

    // Unit title
    const unitTitle = unit.label
      ? `Unit ${unit.label}: ${this.getSemanticTextString(unit.title)}`
      : this.getSemanticTextString(unit.title);
    
    elements.push(this.createHeading(unitTitle, 1));

    // Unit contents
    for (const content of unit.contents) {
      if (this.isChapter(content)) {
        elements.push(...await this.renderChapter(content));
      } else {
        elements.push(...await this.renderContentBlock(content as ContentBlock));
      }
    }

    return elements;
  }

  /**
   * Render a chapter
   */
  private async renderChapter(chapter: Chapter): Promise<docx.Paragraph[]> {
    const elements: docx.Paragraph[] = [];

    // Chapter title
    const chapterTitle = chapter.label
      ? `Chapter ${chapter.label}: ${this.getSemanticTextString(chapter.title)}`
      : this.getSemanticTextString(chapter.title);
    
    elements.push(this.createHeading(chapterTitle, 2));

    // Learning objectives if present
    if (chapter.learningObjectives) {
      elements.push(this.createHeading('Learning Objectives', 3));
      const objectivesList = chapter.learningObjectives.map(obj =>
        this.getSemanticTextString(obj.description)
      );
      elements.push(this.createBulletList(objectivesList));
    }

    // Chapter contents
    for (const content of chapter.contents) {
      if (this.isSection(content)) {
        elements.push(...await this.renderSection(content));
      } else {
        elements.push(...await this.renderContentBlock(content as ContentBlock));
      }
    }

    return elements;
  }

  /**
   * Render a section
   */
  private async renderSection(section: Section): Promise<docx.Paragraph[]> {
    const elements: docx.Paragraph[] = [];

    // Section title
    const sectionTitle = section.label
      ? `${section.label} ${this.getSemanticTextString(section.title)}`
      : this.getSemanticTextString(section.title);
    
    elements.push(this.createHeading(sectionTitle, 3));

    // Section contents
    for (const block of section.contents) {
      elements.push(...await this.renderContentBlock(block));
    }

    return elements;
  }

  /**
   * Render a content block
   */
  private async renderContentBlock(block: ContentBlock): Promise<docx.Paragraph[]> {
    switch (block.blockType) {
      case 'https://xats.org/vocabularies/blocks/paragraph':
        return this.renderParagraph(block);
      
      case 'https://xats.org/vocabularies/blocks/heading':
        return this.renderHeading(block);
      
      case 'https://xats.org/vocabularies/blocks/list':
        return this.renderList(block);
      
      case 'https://xats.org/vocabularies/blocks/blockquote':
        return this.renderBlockquote(block);
      
      case 'https://xats.org/vocabularies/blocks/codeBlock':
        return this.renderCodeBlock(block);
      
      case 'https://xats.org/vocabularies/blocks/mathBlock':
        return this.renderMathBlock(block);
      
      case 'https://xats.org/vocabularies/blocks/table':
        return this.renderTable(block);
      
      case 'https://xats.org/vocabularies/blocks/figure':
        return this.renderFigure(block);
      
      case 'https://xats.org/vocabularies/placeholders/tableOfContents':
        return [this.createTableOfContents()];
      
      case 'https://xats.org/vocabularies/placeholders/bibliography':
        return [this.createBibliographyPlaceholder()];
      
      case 'https://xats.org/vocabularies/placeholders/index':
        return [this.createIndexPlaceholder()];
      
      default:
        return this.renderGenericBlock(block);
    }
  }

  /**
   * Render paragraph block
   */
  private renderParagraph(block: ContentBlock): docx.Paragraph[] {
    const content = block.content as { text: SemanticText };
    const runs = this.convertSemanticTextToRuns(content.text);

    return [new docx.Paragraph({
      children: runs,
      style: 'Normal',
    })];
  }

  /**
   * Render heading block
   */
  private renderHeading(block: ContentBlock): docx.Paragraph[] {
    const content = block.content as { text: SemanticText; level?: number };
    const level = Math.min(Math.max(content.level || 1, 1), 6);
    const runs = this.convertSemanticTextToRuns(content.text);

    return [new docx.Paragraph({
      children: runs,
      heading: this.getHeadingLevel(level),
      style: `Heading${level}`,
    })];
  }

  /**
   * Render list block
   */
  private renderList(block: ContentBlock): docx.Paragraph[] {
    const content = block.content as { 
      listType: 'ordered' | 'unordered'; 
      items: SemanticText[] 
    };
    
    const elements: docx.Paragraph[] = [];
    
    content.items.forEach((item, index) => {
      const runs = this.convertSemanticTextToRuns(item);
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

  /**
   * Render blockquote block
   */
  private renderBlockquote(block: ContentBlock): docx.Paragraph[] {
    const content = block.content as { 
      text: SemanticText; 
      attribution?: SemanticText;
      cite?: string;
    };
    
    const elements: docx.Paragraph[] = [];
    
    // Quote text
    const textRuns = this.convertSemanticTextToRuns(content.text);
    elements.push(new docx.Paragraph({
      children: textRuns,
      style: 'Quote',
      indent: { left: 720 }, // 0.5 inch indent
    }));

    // Attribution if present
    if (content.attribution) {
      const attributionRuns = [
        new docx.TextRun({ text: '— ', italics: true }),
        ...this.convertSemanticTextToRuns(content.attribution),
      ];
      
      elements.push(new docx.Paragraph({
        children: attributionRuns,
        style: 'Quote',
        indent: { left: 720 },
      }));
    }

    return elements;
  }

  /**
   * Render code block
   */
  private renderCodeBlock(block: ContentBlock): docx.Paragraph[] {
    const content = block.content as { 
      code: string; 
      language?: string;
      caption?: SemanticText;
    };

    const elements: docx.Paragraph[] = [];

    // Caption if present
    if (content.caption) {
      const captionRuns = this.convertSemanticTextToRuns(content.caption);
      elements.push(new docx.Paragraph({
        children: captionRuns,
        style: 'Caption',
        alignment: docx.AlignmentType.CENTER,
      }));
    }

    // Code content
    elements.push(new docx.Paragraph({
      children: [new docx.TextRun({
        text: content.code,
        font: { name: 'Consolas' },
        size: this.options.typography.fontSize - 4,
      })],
      style: 'Code',
      shading: { fill: 'F8F9FA' },
      border: this.createCodeBlockBorder(),
    }));

    return elements;
  }

  /**
   * Render math block
   */
  private renderMathBlock(block: ContentBlock): docx.Paragraph[] {
    const content = block.content as { 
      math: string; 
      displayMode?: boolean;
      caption?: SemanticText;
    };

    const elements: docx.Paragraph[] = [];

    // Caption if present
    if (content.caption) {
      const captionRuns = this.convertSemanticTextToRuns(content.caption);
      elements.push(new docx.Paragraph({
        children: captionRuns,
        style: 'Caption',
        alignment: docx.AlignmentType.CENTER,
      }));
    }

    // Math content (simplified - in production, would use proper math rendering)
    elements.push(new docx.Paragraph({
      children: [new docx.TextRun({
        text: content.math,
        italics: true,
        font: { name: 'Cambria Math' },
      })],
      alignment: content.displayMode ? docx.AlignmentType.CENTER : docx.AlignmentType.LEFT,
    }));

    return elements;
  }

  /**
   * Render table block
   */
  private renderTable(block: ContentBlock): docx.Paragraph[] {
    const content = block.content as {
      headers?: SemanticText[];
      rows: SemanticText[][];
      caption?: SemanticText;
    };

    const elements: docx.Paragraph[] = [];

    // Caption if present
    if (content.caption) {
      const captionRuns = this.convertSemanticTextToRuns(content.caption);
      elements.push(new docx.Paragraph({
        children: captionRuns,
        style: 'Caption',
        alignment: docx.AlignmentType.CENTER,
      }));
    }

    // Table placeholder (docx library table support is complex)
    elements.push(new docx.Paragraph({
      children: [new docx.TextRun({ 
        text: '[Table with ' + content.rows.length + ' rows]',
        italics: true,
        color: '666666',
      })],
    }));

    return elements;
  }

  /**
   * Render figure block
   */
  private renderFigure(block: ContentBlock): docx.Paragraph[] {
    const content = block.content as {
      src: string;
      alt: string;
      caption?: SemanticText;
      width?: number;
      height?: number;
    };

    const elements: docx.Paragraph[] = [];

    // Image placeholder
    elements.push(new docx.Paragraph({
      children: [new docx.TextRun({
        text: `[Image: ${content.alt} (${content.src})]`,
        italics: true,
        color: '666666',
      })],
      alignment: docx.AlignmentType.CENTER,
    }));

    // Caption if present
    if (content.caption) {
      const captionRuns = this.convertSemanticTextToRuns(content.caption);
      elements.push(new docx.Paragraph({
        children: captionRuns,
        style: 'Caption',
        alignment: docx.AlignmentType.CENTER,
      }));
    }

    return elements;
  }

  /**
   * Render generic/unknown block
   */
  private renderGenericBlock(block: ContentBlock): docx.Paragraph[] {
    return [new docx.Paragraph({
      children: [new docx.TextRun({
        text: `[Unknown block type: ${block.blockType}]`,
        italics: true,
        color: 'FF0000',
      })],
    })];
  }

  // Utility methods

  private isUnit(content: any): content is Unit {
    return 'contents' in content && Array.isArray(content.contents) &&
           content.contents.some((item: any) => this.isChapter(item));
  }

  private isChapter(content: any): content is Chapter {
    return 'contents' in content && Array.isArray(content.contents) &&
           'title' in content;
  }

  private isSection(content: any): content is Section {
    return 'contents' in content && Array.isArray(content.contents) &&
           'title' in content && !this.isChapter(content);
  }

  private getSemanticTextString(semanticText: SemanticText): string {
    return semanticText.runs
      .map(run => ('text' in run ? run.text : ''))
      .join('');
  }

  private convertSemanticTextToRuns(semanticText: SemanticText): docx.TextRun[] {
    return semanticText.runs.map(run => this.convertRunToTextRun(run));
  }

  private convertRunToTextRun(run: Run): docx.TextRun {
    const baseProps = {
      font: { name: this.options.typography.defaultFont },
      size: this.options.typography.fontSize,
    };

    switch (run.type) {
      case 'text':
        return new docx.TextRun({ ...baseProps, text: run.text });
      
      case 'emphasis':
        return new docx.TextRun({ ...baseProps, text: run.text, italics: true });
      
      case 'strong':
        return new docx.TextRun({ ...baseProps, text: run.text, bold: true });
      
      case 'code':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
          font: { name: 'Consolas' },
        });
      
      case 'subscript':
        return new docx.TextRun({ ...baseProps, text: run.text, subScript: true });
      
      case 'superscript':
        return new docx.TextRun({ ...baseProps, text: run.text, superScript: true });
      
      case 'strikethrough':
        return new docx.TextRun({ ...baseProps, text: run.text, strike: true });
      
      case 'underline':
        return new docx.TextRun({ ...baseProps, text: run.text, underline: {} });
      
      case 'reference':
        return new docx.TextRun({
          ...baseProps,
          text: run.text,
          color: '0000FF',
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
          text: run.math,
          italics: true,
          font: { name: 'Cambria Math' },
        });
      
      default:
        return new docx.TextRun({
          ...baseProps,
          text: ('text' in run ? (run as any).text : '') || '',
        });
    }
  }

  private createHeading(text: string, level: number): docx.Paragraph {
    const headingStyle = this.options.typography.headingFonts?.[level];
    
    return new docx.Paragraph({
      children: [new docx.TextRun({
        text,
        font: { name: headingStyle?.font || this.options.typography.defaultFont },
        size: headingStyle?.size || (this.options.typography.fontSize + (6 - level) * 4),
        bold: headingStyle?.bold !== false,
        color: headingStyle?.color,
      })],
      heading: this.getHeadingLevel(level),
      style: `Heading${level}`,
    });
  }

  private createBulletList(items: string[]): docx.Paragraph {
    // Simplified list creation
    const listText = items.map(item => `• ${item}`).join('\n');
    return new docx.Paragraph({
      children: [new docx.TextRun({ text: listText })],
    });
  }

  private createTableOfContents(): docx.Paragraph {
    return new docx.Paragraph({
      children: [new docx.TextRun({
        text: '[Table of Contents will be generated here]',
        italics: true,
        color: '666666',
      })],
    });
  }

  private createBibliographyPlaceholder(): docx.Paragraph {
    return new docx.Paragraph({
      children: [new docx.TextRun({
        text: '[Bibliography will be generated here]',
        italics: true,
        color: '666666',
      })],
    });
  }

  private createIndexPlaceholder(): docx.Paragraph {
    return new docx.Paragraph({
      children: [new docx.TextRun({
        text: '[Index will be generated here]',
        italics: true,
        color: '666666',
      })],
    });
  }

  private createSectionBreak(): docx.Paragraph {
    return new docx.Paragraph({
      children: [new docx.PageBreak()],
    });
  }

  private createHeaders(document: XatsDocument): any {
    // TODO: Implement header creation
    return {};
  }

  private createFooters(document: XatsDocument): any {
    // TODO: Implement footer creation
    return {};
  }

  private createWordStyles(): docx.IStylesOptions {
    // TODO: Implement comprehensive style definitions
    return { 
      paragraphStyles: [],
      characterStyles: [],
    };
  }

  private createNumberingDefinitions(): docx.INumberingOptions {
    // TODO: Implement numbering definitions
    return { config: [] };
  }

  private createFootnotes(): any {
    // TODO: Implement footnote handling
    return {};
  }

  private createEndnotes(): any {
    // TODO: Implement endnote handling
    return {};
  }

  private createCodeBlockBorder(): any {
    return {
      top: { style: 'single', size: 1, color: 'CCCCCC' },
      bottom: { style: 'single', size: 1, color: 'CCCCCC' },
      left: { style: 'single', size: 1, color: 'CCCCCC' },
      right: { style: 'single', size: 1, color: 'CCCCCC' },
    };
  }

  private getHeadingLevel(level: number): any {
    const levels = [
      docx.HeadingLevel.HEADING_1,
      docx.HeadingLevel.HEADING_2,
      docx.HeadingLevel.HEADING_3,
      docx.HeadingLevel.HEADING_4,
      docx.HeadingLevel.HEADING_5,
      docx.HeadingLevel.HEADING_6,
    ];
    return levels[Math.min(level - 1, 5)] || docx.HeadingLevel.HEADING_1;
  }

  private initializeStyles(): void {
    // TODO: Initialize style mappings
  }

  private initializeNumbering(): void {
    // TODO: Initialize numbering definitions
  }
}