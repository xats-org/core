/**
 * Word to xats Converter
 * 
 * Specialized converter for parsing Microsoft Word documents to xats format
 * with support for complex document structures, formatting preservation,
 * and production workflow features.
 */

import mammoth from 'mammoth';
import JSZip from 'jszip';
import { convert as xmlToJs } from 'xml-js';

import type {
  WordParseOptions,
  WordConversionContext,
  DocumentComment,
  Revision,
} from '../types.js';

import type {
  XatsDocument,
  SemanticText,
  ContentBlock,
  Chapter,
  Section,
} from '@xats-org/types';

/**
 * Specialized Word to xats converter
 */
export class WordToXatsConverter {
  private context: WordConversionContext;

  constructor(context: WordConversionContext) {
    this.context = context;
  }

  /**
   * Convert Word document buffer to xats document
   */
  async convert(buffer: Buffer, options: WordParseOptions = {}): Promise<XatsDocument> {
    // Extract Word document structure
    const docxStructure = await this.extractDocxStructure(buffer);
    
    // Parse with mammoth for HTML conversion
    const mammothResult = await mammoth.convertToHtml(
      { buffer },
      {
        styleMap: this.buildStyleMap(options.styleMappings),
        includeDefaultStyleMap: true,
        includeEmbeddedStyleMap: true,
        transformDocument: this.createTransformFunction(options),
      }
    );

    // Extract comments and track changes if requested
    if (options.comments?.preserve || options.trackChanges?.preserve) {
      await this.extractCollaborationFeatures(buffer, options);
    }

    // Convert HTML and structure to xats
    return this.parseToXats(mammothResult.value, docxStructure, options);
  }

  /**
   * Extract detailed Word document structure from DOCX
   */
  private async extractDocxStructure(buffer: Buffer): Promise<any> {
    const zip = await JSZip.loadAsync(buffer);
    
    const structure: any = {
      document: null,
      styles: null,
      numbering: null,
      comments: null,
      footnotes: null,
      endnotes: null,
      settings: null,
    };

    // Extract main document XML
    const documentXml = zip.file('word/document.xml');
    if (documentXml) {
      const content = await documentXml.async('string');
      structure.document = xmlToJs(content, { compact: true });
    }

    // Extract styles XML
    const stylesXml = zip.file('word/styles.xml');
    if (stylesXml) {
      const content = await stylesXml.async('string');
      structure.styles = xmlToJs(content, { compact: true });
    }

    // Extract numbering XML
    const numberingXml = zip.file('word/numbering.xml');
    if (numberingXml) {
      const content = await numberingXml.async('string');
      structure.numbering = xmlToJs(content, { compact: true });
    }

    // Extract comments XML
    const commentsXml = zip.file('word/comments.xml');
    if (commentsXml) {
      const content = await commentsXml.async('string');
      structure.comments = xmlToJs(content, { compact: true });
    }

    // Extract footnotes XML
    const footnotesXml = zip.file('word/footnotes.xml');
    if (footnotesXml) {
      const content = await footnotesXml.async('string');
      structure.footnotes = xmlToJs(content, { compact: true });
    }

    // Extract endnotes XML
    const endnotesXml = zip.file('word/endnotes.xml');
    if (endnotesXml) {
      const content = await endnotesXml.async('string');
      structure.endnotes = xmlToJs(content, { compact: true });
    }

    // Extract document settings
    const settingsXml = zip.file('word/settings.xml');
    if (settingsXml) {
      const content = await settingsXml.async('string');
      structure.settings = xmlToJs(content, { compact: true });
    }

    return structure;
  }

  /**
   * Build mammoth style map from style mappings configuration
   */
  private buildStyleMap(styleMappings?: any): string[] {
    if (!styleMappings) {
      return this.getDefaultStyleMap();
    }

    const styleMap: string[] = [];

    // Paragraph style mappings
    if (styleMappings.paragraphs) {
      for (const [wordStyle, xatsBlockType] of Object.entries(styleMappings.paragraphs)) {
        styleMap.push(`p[style-name='${wordStyle}'] => p.${this.getBlockTypeClass(xatsBlockType as string)}`);
      }
    }

    // Character style mappings
    if (styleMappings.characters) {
      for (const [wordStyle, xatsType] of Object.entries(styleMappings.characters)) {
        styleMap.push(`r[style-name='${wordStyle}'] => span.${xatsType}`);
      }
    }

    return styleMap;
  }

  /**
   * Get default mammoth style mappings
   */
  private getDefaultStyleMap(): string[] {
    return [
      "p[style-name='Heading 1'] => h1",
      "p[style-name='Heading 2'] => h2", 
      "p[style-name='Heading 3'] => h3",
      "p[style-name='Heading 4'] => h4",
      "p[style-name='Heading 5'] => h5",
      "p[style-name='Heading 6'] => h6",
      "p[style-name='Quote'] => blockquote",
      "p[style-name='Code'] => pre",
      "r[style-name='Code Char'] => code",
      "r[style-name='Emphasis'] => em",
      "r[style-name='Strong'] => strong",
      "p[style-name='List Paragraph'] => li",
    ];
  }

  /**
   * Get CSS class name from xats block type
   */
  private getBlockTypeClass(blockType: string): string {
    const typeMap: Record<string, string> = {
      'https://xats.org/vocabularies/blocks/paragraph': 'paragraph',
      'https://xats.org/vocabularies/blocks/heading': 'heading',
      'https://xats.org/vocabularies/blocks/blockquote': 'blockquote',
      'https://xats.org/vocabularies/blocks/list': 'list',
      'https://xats.org/vocabularies/blocks/codeBlock': 'code-block',
    };
    
    return typeMap[blockType] || 'paragraph';
  }

  /**
   * Create document transformation function for mammoth
   */
  private createTransformFunction(options: WordParseOptions): any {
    return (element: any) => {
      // Handle track changes
      if (options.trackChanges?.preserve && this.isTrackChange(element)) {
        return this.transformTrackChange(element);
      }

      // Handle comments
      if (options.comments?.preserve && this.isComment(element)) {
        return this.transformComment(element);
      }

      // Handle page breaks
      if (options.pageBreaks === 'convert' && this.isPageBreak(element)) {
        return this.transformPageBreak(element);
      }

      // Default: no transformation
      return element;
    };
  }

  /**
   * Check if element is a track change
   */
  private isTrackChange(element: any): boolean {
    return element.type === 'run' && (
      element.isInsert || 
      element.isDelete || 
      element.isFormatChange
    );
  }

  /**
   * Transform track change element
   */
  private transformTrackChange(element: any): any {
    if (element.isInsert) {
      return { ...element, attributes: { ...element.attributes, 'data-track-change': 'insert' } };
    } else if (element.isDelete) {
      return { ...element, attributes: { ...element.attributes, 'data-track-change': 'delete' } };
    } else if (element.isFormatChange) {
      return { ...element, attributes: { ...element.attributes, 'data-track-change': 'format' } };
    }
    return element;
  }

  /**
   * Check if element is a comment
   */
  private isComment(element: any): boolean {
    return element.type === 'commentReference';
  }

  /**
   * Transform comment element
   */
  private transformComment(element: any): any {
    return {
      ...element,
      attributes: {
        ...element.attributes,
        'data-comment-id': element.commentId,
      },
    };
  }

  /**
   * Check if element is a page break
   */
  private isPageBreak(element: any): boolean {
    return element.type === 'break' && element.breakType === 'page';
  }

  /**
   * Transform page break element
   */
  private transformPageBreak(element: any): any {
    return {
      type: 'paragraph',
      children: [],
      attributes: { 'data-page-break': 'true' },
    };
  }

  /**
   * Extract collaboration features (comments, track changes)
   */
  private async extractCollaborationFeatures(buffer: Buffer, options: WordParseOptions): Promise<void> {
    const zip = await JSZip.loadAsync(buffer);

    // Extract comments
    if (options.comments?.preserve) {
      await this.extractComments(zip);
    }

    // Extract track changes (revisions)
    if (options.trackChanges?.preserve) {
      await this.extractTrackChanges(zip);
    }
  }

  /**
   * Extract comments from Word document
   */
  private async extractComments(zip: JSZip): Promise<void> {
    const commentsXml = zip.file('word/comments.xml');
    if (!commentsXml) return;

    const content = await commentsXml.async('string');
    const commentsData = xmlToJs(content, { compact: true });

    // Parse comments and store in context
    // TODO: Implement comment parsing
    // This would parse the XML structure and create DocumentComment objects
  }

  /**
   * Extract track changes from Word document
   */
  private async extractTrackChanges(zip: JSZip): Promise<void> {
    // Track changes are embedded in the main document XML
    // They would be extracted during the main document parsing
    // TODO: Implement track changes extraction
  }

  /**
   * Convert HTML and structure to xats document
   */
  private async parseToXats(
    html: string, 
    structure: any, 
    options: WordParseOptions
  ): Promise<XatsDocument> {
    // Create base document structure
    const document: XatsDocument = {
      schemaVersion: '0.5.0',
      bibliographicEntry: {
        type: 'book',
        title: this.extractTitleFromHtml(html) || 'Imported Document',
      },
      subject: 'General',
      bodyMatter: {
        contents: [],
      },
    };

    // Parse HTML to content blocks
    const contentBlocks = this.parseHtmlToContentBlocks(html, options);
    
    // Organize content blocks into chapters/sections
    document.bodyMatter.contents = this.organizeContentIntoStructure(contentBlocks);

    // Add front matter if detected
    const frontMatter = this.extractFrontMatter(html, structure);
    if (frontMatter) {
      document.frontMatter = frontMatter;
    }

    // Add back matter if detected
    const backMatter = this.extractBackMatter(html, structure);
    if (backMatter) {
      document.backMatter = backMatter;
    }

    return document;
  }

  /**
   * Extract document title from HTML
   */
  private extractTitleFromHtml(html: string): string | null {
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match?.[1]) {
      return h1Match[1].replace(/<[^>]*>/g, '').trim();
    }
    return null;
  }

  /**
   * Parse HTML to content blocks
   */
  private parseHtmlToContentBlocks(html: string, options: WordParseOptions): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    let blockId = 1;

    // Simple HTML parsing - in production, use a proper HTML parser
    const paragraphs = html.split(/<\/?p[^>]*>/i).filter(p => p.trim());

    paragraphs.forEach((paragraph) => {
      const cleanText = paragraph.replace(/<[^>]*>/g, '').trim();
      if (cleanText) {
        blocks.push({
          id: `block-${blockId++}`,
          blockType: this.determineBlockType(paragraph),
          content: {
            text: this.parseSemanticText(paragraph),
          },
        });
      }
    });

    return blocks;
  }

  /**
   * Determine block type from HTML element
   */
  private determineBlockType(htmlElement: string): string {
    if (htmlElement.includes('<h1') || htmlElement.includes('<h2') || 
        htmlElement.includes('<h3') || htmlElement.includes('<h4') ||
        htmlElement.includes('<h5') || htmlElement.includes('<h6')) {
      return 'https://xats.org/vocabularies/blocks/heading';
    }
    
    if (htmlElement.includes('<blockquote')) {
      return 'https://xats.org/vocabularies/blocks/blockquote';
    }
    
    if (htmlElement.includes('<pre') || htmlElement.includes('<code')) {
      return 'https://xats.org/vocabularies/blocks/codeBlock';
    }
    
    return 'https://xats.org/vocabularies/blocks/paragraph';
  }

  /**
   * Parse HTML text to SemanticText
   */
  private parseSemanticText(html: string): SemanticText {
    // Simplified semantic text parsing
    // In production, this would handle complex formatting
    const runs = [];
    
    // Remove HTML tags and create basic text run
    const text = html.replace(/<[^>]*>/g, '').trim();
    if (text) {
      runs.push({ type: 'text', text });
    }

    return { runs };
  }

  /**
   * Organize content blocks into structural hierarchy
   */
  private organizeContentIntoStructure(blocks: ContentBlock[]): Chapter[] {
    const chapters: Chapter[] = [];
    let currentChapter: Chapter | null = null;
    let currentSection: Section | null = null;
    let chapterCounter = 1;
    let sectionCounter = 1;

    for (const block of blocks) {
      if (block.blockType === 'https://xats.org/vocabularies/blocks/heading') {
        const headingLevel = this.getHeadingLevel(block);
        
        if (headingLevel === 1 || headingLevel === 2) {
          // New chapter
          if (currentChapter) {
            chapters.push(currentChapter);
          }
          
          currentChapter = {
            id: `chapter-${chapterCounter++}`,
            label: chapterCounter.toString(),
            title: block.content.text as SemanticText,
            contents: [],
          };
          currentSection = null;
          sectionCounter = 1;
        } else if (headingLevel === 3 && currentChapter) {
          // New section
          if (currentSection) {
            currentChapter.contents.push(currentSection);
          }
          
          currentSection = {
            id: `section-${sectionCounter++}`,
            label: `${chapterCounter}.${sectionCounter}`,
            title: block.content.text as SemanticText,
            contents: [],
          };
        } else if (currentSection) {
          currentSection.contents.push(block);
        } else if (currentChapter) {
          currentChapter.contents.push(block);
        }
      } else {
        // Regular content block
        if (currentSection) {
          currentSection.contents.push(block);
        } else if (currentChapter) {
          currentChapter.contents.push(block);
        } else {
          // Create default chapter if none exists
          if (!currentChapter) {
            currentChapter = {
              id: `chapter-${chapterCounter++}`,
              label: chapterCounter.toString(),
              title: { runs: [{ type: 'text', text: 'Chapter 1' }] },
              contents: [],
            };
          }
          currentChapter.contents.push(block);
        }
      }
    }

    // Add final section and chapter
    if (currentSection && currentChapter) {
      currentChapter.contents.push(currentSection);
    }
    if (currentChapter) {
      chapters.push(currentChapter);
    }

    return chapters;
  }

  /**
   * Get heading level from content block
   */
  private getHeadingLevel(block: ContentBlock): number {
    // TODO: Extract heading level from content or styling
    return 1;
  }

  /**
   * Extract front matter from document
   */
  private extractFrontMatter(html: string, structure: any): any {
    // TODO: Implement front matter extraction
    return null;
  }

  /**
   * Extract back matter from document  
   */
  private extractBackMatter(html: string, structure: any): any {
    // TODO: Implement back matter extraction
    return null;
  }
}