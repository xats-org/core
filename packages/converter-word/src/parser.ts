/**
 * @fileoverview Word document parser - converts Word to xats
 */

import { promisify } from 'util';

import JSZip from 'jszip';
import { parseString } from 'xml2js';

import type { AnnotationProcessor } from './annotation-processor';
import type { StyleMapper } from './style-mapper';
import type {
  WordParseOptions,
  WordParseResult,
  WordMetadata,
  ConversionError,
  ConversionWarning,
  Annotation,
  TrackChange,
  Comment,
} from './types';
import type { XatsDocument, ContentBlock } from '@xats-org/types';

const parseXml = promisify(parseString);

/**
 * Parses Word documents to xats format
 */
export class DocumentParser {
  constructor(
    private readonly styleMapper: StyleMapper,
    private readonly annotationProcessor: AnnotationProcessor
  ) {}

  /**
   * Parse Word document to xats format
   */
  async parse(content: string | Buffer, options: WordParseOptions = {}): Promise<WordParseResult> {
    const errors: ConversionError[] = [];
    const warnings: ConversionWarning[] = [];

    try {
      // Convert to buffer if needed
      const buffer = typeof content === 'string' ? Buffer.from(content, 'base64') : content;

      // Extract Word document structure
      const wordDoc = await this.extractWordDocument(buffer);

      // Extract metadata
      const metadata = await this.extractMetadataFromZip(wordDoc.zip);

      // Process annotations if requested
      let annotations: Annotation[] = [];
      let trackChanges: TrackChange[] = [];
      let comments: Comment[] = [];

      if (options.trackChanges?.preserve || options.comments?.preserve) {
        const annotationData = await this.processAnnotations(wordDoc, options);
        annotations = annotationData.annotations;
        trackChanges = annotationData.trackChanges;
        comments = annotationData.comments;
      }

      // Convert to xats document
      const xatsDocument = await this.convertToXats(wordDoc, options, errors, warnings);

      // Add annotations to document if converted
      if (options.trackChanges?.convertToAnnotations && trackChanges.length > 0) {
        const trackChangeAnnotations =
          this.annotationProcessor.convertTrackChangesToAnnotations(trackChanges);
        annotations.push(...trackChangeAnnotations);
      }

      if (options.comments?.convertToAnnotations && comments.length > 0) {
        const commentAnnotations = this.annotationProcessor.convertCommentsToAnnotations(comments);
        annotations.push(...commentAnnotations);
      }

      if (annotations.length > 0) {
        (xatsDocument as any).extensions = {
          ...(xatsDocument as any).extensions,
          annotations,
        };
      }

      return {
        document: xatsDocument,
        metadata,
        errors: errors.length > 0 ? errors : [],
        warnings: warnings.length > 0 ? warnings : [],
        annotations: annotations.length > 0 ? annotations : [],
        trackChanges: trackChanges.length > 0 ? trackChanges : [],
        comments: comments.length > 0 ? comments : [],
      };
    } catch (error) {
      throw new Error(
        `Parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract metadata only from Word document
   */
  async extractMetadata(content: string | Buffer): Promise<WordMetadata> {
    const buffer = typeof content === 'string' ? Buffer.from(content, 'base64') : content;

    const zip = await JSZip.loadAsync(buffer);
    return this.extractMetadataFromZip(zip);
  }

  /**
   * Extract Word document structure with comprehensive error handling
   */
  private async extractWordDocument(buffer: Buffer): Promise<{
    zip: JSZip;
    documentXml: any;
    stylesXml?: any;
    commentsXml?: any;
  }> {
    let zip: JSZip;

    try {
      zip = await JSZip.loadAsync(buffer);
    } catch (error) {
      throw new Error(
        `Failed to load Word document as ZIP: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Extract main document with error handling
    let documentFile = zip.files['word/document.xml'];
    if (!documentFile) {
      // Try alternative locations
      const altDocFile = Object.keys(zip.files).find((name) => name.endsWith('document.xml'));
      if (!altDocFile) {
        throw new Error('Invalid Word document: no document.xml found');
      }
      documentFile = zip.files[altDocFile];
    }

    if (!documentFile) {
      throw new Error('Invalid Word document: could not access document.xml');
    }

    let documentXml: any;
    try {
      const documentXmlString = await documentFile.async('string');
      documentXml = await parseXml(documentXmlString);
    } catch (error) {
      throw new Error(
        `Failed to parse document XML: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // Extract styles if present (with error handling)
    let stylesXml: any;
    const stylesFile = zip.files['word/styles.xml'];
    if (stylesFile) {
      try {
        const stylesXmlString = await stylesFile.async('string');
        stylesXml = await parseXml(stylesXmlString);
      } catch (error) {
        console.warn('Failed to parse styles.xml, continuing without styles:', error);
      }
    }

    // Extract comments if present (with error handling)
    let commentsXml: any;
    const commentsFile = zip.files['word/comments.xml'];
    if (commentsFile) {
      try {
        const commentsXmlString = await commentsFile.async('string');
        commentsXml = await parseXml(commentsXmlString);
      } catch (error) {
        console.warn('Failed to parse comments.xml, continuing without comments:', error);
      }
    }

    return {
      zip,
      documentXml,
      stylesXml,
      commentsXml,
    };
  }

  /**
   * Extract metadata from ZIP
   */
  private async extractMetadataFromZip(zip: JSZip): Promise<WordMetadata> {
    const metadata: WordMetadata = {
      format: 'docx',
      wordCount: 0,
      features: [],
      styles: [],
      images: 0,
      tables: 0,
      equations: 0,
      fileSize: 0,
    };

    try {
      // Extract app properties
      const appPropsFile = zip.files['docProps/app.xml'];
      if (appPropsFile) {
        const appPropsXml = await appPropsFile.async('string');
        const appProps = await parseXml(appPropsXml);

        // Extract word count, page count, etc.
        const properties = (appProps as any)?.Properties;
        if (properties) {
          metadata.wordCount = parseInt(properties.Words?.[0] || '0', 10);
          metadata.pageCount = parseInt(properties.Pages?.[0] || '0', 10);
        }
      }

      // Extract core properties
      const corePropsFile = zip.files['docProps/core.xml'];
      if (corePropsFile) {
        const corePropsXml = await corePropsFile.async('string');
        const coreProps = await parseXml(corePropsXml);

        const properties = (coreProps as any)?.['cp:coreProperties'];
        if (properties) {
          metadata.title = properties['dc:title']?.[0];
          metadata.author = properties['dc:creator']?.[0];
          metadata.subject = properties['dc:subject']?.[0];
          metadata.keywords = properties['cp:keywords']?.[0]
            ?.split(',')
            .map((k: string) => k.trim());
          if (properties['dcterms:created']?.[0]) {
            metadata.created = new Date(properties['dcterms:created'][0]);
          }
          if (properties['dcterms:modified']?.[0]) {
            metadata.modified = new Date(properties['dcterms:modified'][0]);
          }
        }
      }

      // Count images
      const mediaFiles = Object.keys(zip.files).filter((name) => name.startsWith('word/media/'));
      metadata.images = mediaFiles.length;

      // Analyze features and styles from document
      const documentFile = zip.files['word/document.xml'];
      if (documentFile) {
        const documentXmlString = await documentFile.async('string');
        metadata.features = this.extractFeatures(documentXmlString);
        metadata.styles = this.extractStyles(documentXmlString);
        metadata.tables = this.countTables(documentXmlString);
        metadata.equations = this.countEquations(documentXmlString);
        metadata.trackChanges = this.hasTrackChanges(documentXmlString);
      }

      // Count comments
      const commentsFile = zip.files['word/comments.xml'];
      if (commentsFile) {
        const commentsXmlString = await commentsFile.async('string');
        metadata.comments = this.countComments(commentsXmlString);
      }
    } catch (error) {
      // Metadata extraction failed, but we can continue with basic info
      console.warn('Metadata extraction failed:', error);
    }

    return metadata;
  }

  /**
   * Process annotations from Word document
   */
  private async processAnnotations(
    wordDoc: { zip: JSZip; documentXml: any; commentsXml?: any },
    options: WordParseOptions
  ): Promise<{
    annotations: Annotation[];
    trackChanges: TrackChange[];
    comments: Comment[];
  }> {
    let trackChanges: TrackChange[] = [];
    let comments: Comment[] = [];

    const documentXmlString = JSON.stringify(wordDoc.documentXml); // Simplified for demo

    // Extract track changes
    if (options.trackChanges?.preserve && wordDoc.documentXml) {
      trackChanges = await this.annotationProcessor.extractTrackChanges(
        documentXmlString,
        options.trackChanges
      );
    }

    // Extract comments
    if (options.comments?.preserve && wordDoc.commentsXml) {
      const commentsXmlString = JSON.stringify(wordDoc.commentsXml); // Simplified for demo
      comments = await this.annotationProcessor.extractComments(
        commentsXmlString,
        documentXmlString,
        options.comments
      );
    }

    const annotations: Annotation[] = [];
    return { annotations, trackChanges, comments };
  }

  /**
   * Convert Word document to xats format
   */
  private async convertToXats(
    wordDoc: { zip: JSZip; documentXml: any; stylesXml?: any },
    options: WordParseOptions,
    errors: ConversionError[],
    warnings: ConversionWarning[]
  ): Promise<XatsDocument> {
    // Extract basic document structure
    const document = wordDoc.documentXml.document || wordDoc.documentXml;
    const body = document?.body?.[0];

    if (!body) {
      throw new Error('No document body found');
    }

    // Convert paragraphs and other elements
    const contents = await this.convertContents(body, options, errors, warnings);

    // Create xats document
    const xatsDocument: XatsDocument = {
      schemaVersion: '0.5.0',
      bibliographicEntry: {
        type: 'book',
        title: 'Converted from Word Document',
      },
      subject: 'Converted Content',
      bodyMatter: {
        contents,
      },
    };

    return xatsDocument;
  }

  /**
   * Convert Word content to xats contents
   */
  private async convertContents(
    body: any,
    options: WordParseOptions,
    errors: ConversionError[],
    warnings: ConversionWarning[]
  ): Promise<any[]> {
    const contents: any[] = [];
    const elements = body.p || body.tbl || [];

    // Collect all elements in order (paragraphs, tables, etc.)
    const allElements: Array<{ type: string; element: any; index: number }> = [];

    // Add paragraphs
    (body.p || []).forEach((para: any, index: number) => {
      allElements.push({ type: 'paragraph', element: para, index });
    });

    // Add tables
    (body.tbl || []).forEach((table: any, index: number) => {
      allElements.push({ type: 'table', element: table, index });
    });

    // Add drawing elements (images, shapes)
    (body.drawing || []).forEach((drawing: any, index: number) => {
      allElements.push({ type: 'drawing', element: drawing, index });
    });

    // Sort by document order (simplified - in real implementation would use document order)
    allElements.sort((a, b) => a.index - b.index);

    // Group list items together
    const processedElements = await this.groupListItems(allElements, options, errors);

    for (const item of processedElements) {
      try {
        let block: ContentBlock | null = null;

        switch (item.type) {
          case 'paragraph':
            block = await this.convertParagraph(item.element, options);
            break;
          case 'table':
            block = await this.convertTable(item.element, options);
            break;
          case 'list':
            block = this.convertList(item.items, item.listType);
            break;
          case 'drawing':
            block = await this.convertDrawing(item.element, options);
            break;
        }

        if (block) {
          contents.push(block);
        }
      } catch (error) {
        errors.push({
          code: 'PARSE_ERROR',
          message: `Failed to convert ${item.type}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: true,
          suggestion: `${item.type} will be skipped`,
        });
      }
    }

    return contents;
  }

  /**
   * Group consecutive list items together
   */
  private async groupListItems(
    elements: Array<{ type: string; element: any; index: number }>,
    options: WordParseOptions,
    errors: ConversionError[]
  ): Promise<Array<any>> {
    const grouped: Array<any> = [];
    let i = 0;

    while (i < elements.length) {
      const element = elements[i];

      if (!element) {
        i++;
        continue;
      }

      if (element.type === 'paragraph') {
        const para = element.element;
        const pPr = para.pPr?.[0];
        const numPr = pPr?.numPr?.[0];

        if (numPr) {
          // Start of a list - collect all consecutive list items
          const listItems: any[] = [];
          const numId = numPr.numId?.[0]?.$?.val;
          const isOrdered = false; // We'll determine this from the numbering definition

          // Collect consecutive list items with same numId
          while (i < elements.length && elements[i]?.type === 'paragraph') {
            const currentElement = elements[i];
            if (!currentElement) break;
            const currentPara = currentElement.element;
            const currentPPr = currentPara.pPr?.[0];
            const currentNumPr = currentPPr?.numPr?.[0];
            const currentNumId = currentNumPr?.numId?.[0]?.$?.val;

            if (currentNumId === numId) {
              const level = parseInt(currentNumPr.ilvl?.[0]?.$?.val || '0', 10);
              const text = this.createSemanticTextFromRuns(currentPara.r || []);
              listItems.push({
                text,
                level,
              });
              i++;
            } else {
              break;
            }
          }

          // Add the grouped list
          grouped.push({
            type: 'list',
            listType: isOrdered ? 'ordered' : 'unordered',
            items: listItems,
          });
        } else {
          // Regular paragraph
          grouped.push(element);
          i++;
        }
      } else {
        // Non-paragraph element
        grouped.push(element);
        i++;
      }
    }

    return grouped;
  }

  /**
   * Convert Word paragraph to xats block
   */
  private async convertParagraph(
    para: any,
    options: WordParseOptions
  ): Promise<ContentBlock | null> {
    // Extract paragraph properties
    const pPr = para.pPr?.[0];
    const styleName = pPr?.pStyle?.[0]?.$?.val || 'Normal';
    const numPr = pPr?.numPr?.[0]; // Numbering properties

    // Get text content and formatting
    const runs = para.r || [];
    const semanticText = this.createSemanticTextFromRuns(runs);

    if (!semanticText.runs.some((run) => run.text?.trim())) {
      return null; // Skip empty paragraphs
    }

    // Check if this is a list item
    if (numPr) {
      // This paragraph is part of a list - we'll handle list grouping elsewhere
      return {
        blockType: 'https://xats.org/vocabularies/blocks/paragraph',
        content: {
          text: semanticText,
        },
        extensions: {
          wordListInfo: {
            numId: numPr.numId?.[0]?.$?.val,
            ilvl: numPr.ilvl?.[0]?.$?.val || '0',
          },
        },
      };
    }

    // Determine block type from style
    const blockType =
      this.styleMapper.getXatsBlockType(styleName) ||
      'https://xats.org/vocabularies/blocks/paragraph';

    // Handle headings specially
    if (blockType === 'https://xats.org/vocabularies/blocks/heading') {
      const level = this.styleMapper.getHeadingLevel(styleName) || 1;
      return {
        blockType,
        content: {
          level,
          text: semanticText,
        },
      };
    }

    // Handle special block types
    if (blockType === 'https://xats.org/vocabularies/blocks/blockquote') {
      return {
        blockType,
        content: {
          text: semanticText,
          cite: this.extractCitation(para),
        },
      };
    }

    if (blockType === 'https://xats.org/vocabularies/blocks/codeBlock') {
      const plainText = semanticText.runs.map((run) => run.text || '').join('');
      return {
        blockType,
        content: {
          code: plainText,
          language: this.detectCodeLanguage(plainText),
        },
      };
    }

    // Regular content block
    return {
      blockType,
      content: {
        text: semanticText,
      },
    };
  }

  /**
   * Convert Word table to xats table block
   */
  private async convertTable(table: any, options: WordParseOptions): Promise<ContentBlock> {
    const rows: any[] = [];
    const trs = table.tr || [];
    let hasHeader = false;

    for (const tr of trs) {
      const cells: any[] = [];
      const tcs = tr.tc || [];
      const isFirstRow = rows.length === 0;

      for (const tc of tcs) {
        const cellContent = this.extractSemanticTextFromTableCell(tc);
        const tcPr = tc.tcPr?.[0];

        // Check if this is a header cell
        const isHeader = isFirstRow && this.isHeaderCell(tc, tcPr);
        if (isHeader) hasHeader = true;

        cells.push({
          text: cellContent,
          isHeader,
          colspan: this.getCellSpan(tcPr, 'gridSpan'),
          rowspan: this.getCellSpan(tcPr, 'vMerge'),
        });
      }

      if (cells.length > 0) {
        rows.push({ cells });
      }
    }

    // Extract table caption if present
    const caption = this.extractTableCaption(table);

    return {
      blockType: 'https://xats.org/vocabularies/blocks/table',
      content: {
        rows,
        hasHeader,
        caption,
      },
    };
  }

  /**
   * Extract semantic text from table cell
   */
  private extractSemanticTextFromTableCell(tc: any): any {
    const paragraphs = tc.p || [];
    const allRuns: any[] = [];

    for (const p of paragraphs) {
      const runs = p.r || [];
      allRuns.push(...runs);

      // Add paragraph break except for the last paragraph
      if (paragraphs.indexOf(p) < paragraphs.length - 1) {
        allRuns.push({ t: [{ _: '\n' }] });
      }
    }

    return this.createSemanticTextFromRuns(allRuns);
  }

  /**
   * Check if a table cell is a header cell
   */
  private isHeaderCell(tc: any, tcPr: any): boolean {
    // Check for header styling indicators
    if (tcPr?.shd?.[0]?.$?.fill && tcPr.shd[0].$.fill !== 'auto') {
      return true; // Has background shading
    }

    // Check if cell text is bold (common header indicator)
    const paragraphs = tc.p || [];
    for (const p of paragraphs) {
      const runs = p.r || [];
      for (const run of runs) {
        if (run.rPr?.[0]?.b) {
          return true; // Contains bold text
        }
      }
    }

    return false;
  }

  /**
   * Get cell span value
   */
  private getCellSpan(tcPr: any, spanType: string): number | undefined {
    const span = tcPr?.[spanType]?.[0]?.$?.val;
    return span ? parseInt(span, 10) : undefined;
  }

  /**
   * Extract table caption
   */
  private extractTableCaption(table: any): string | undefined {
    // Look for caption in table properties or nearby paragraphs
    // This is a simplified implementation
    return undefined;
  }

  /**
   * Convert list items to xats list block
   */
  private convertList(items: any[], listType: string): ContentBlock {
    return {
      blockType: 'https://xats.org/vocabularies/blocks/list',
      content: {
        ordered: listType === 'ordered',
        items: items.map((item) => ({
          text: item.text,
          level: item.level || 0,
        })),
      },
    };
  }

  /**
   * Convert Word drawing element (images, shapes) to xats figure
   */
  private async convertDrawing(
    drawing: any,
    options: WordParseOptions
  ): Promise<ContentBlock | null> {
    // Extract image information
    const inline = drawing['wp:inline']?.[0] || drawing['wp:anchor']?.[0];
    if (!inline) return null;

    const graphic = inline['a:graphic']?.[0];
    const graphicData = graphic?.['a:graphicData']?.[0];
    const pic = graphicData?.['pic:pic']?.[0];

    if (pic) {
      const blipFill = pic['pic:blipFill']?.[0];
      const blip = blipFill?.['a:blip']?.[0];
      const embed = blip?.$?.embed || blip?.$?.link;

      const nvPicPr = pic['pic:nvPicPr']?.[0];
      const cNvPr = nvPicPr?.['pic:cNvPr']?.[0];
      const name = cNvPr?.$?.name || 'Image';
      const descr = cNvPr?.$?.descr;

      return {
        blockType: 'https://xats.org/vocabularies/blocks/figure',
        content: {
          src: `word/media/${embed}`, // Placeholder - would need to resolve actual path
          alt: descr || name,
          caption: name !== 'Image' ? name : undefined,
        },
      };
    }

    return null;
  }

  /**
   * Extract text from Word runs with error handling
   */
  private extractTextFromRuns(runs: any[]): string {
    try {
      return runs
        .map((run) => {
          try {
            if (!run) return '';
            const texts = run.t || [];
            return texts
              .map((t: any) => {
                try {
                  return t?._ || t || '';
                } catch (textError) {
                  return '';
                }
              })
              .join('');
          } catch (runError) {
            return '';
          }
        })
        .join('');
    } catch (error) {
      return '[text extraction error]';
    }
  }

  /**
   * Extract text from table cell (legacy method)
   */
  private extractTextFromTableCell(tc: any): string {
    const paragraphs = tc.p || [];
    return paragraphs.map((p: any) => this.extractTextFromRuns(p.r || [])).join('\n');
  }

  /**
   * Create semantic text from Word runs with proper formatting
   */
  private createSemanticTextFromRuns(runs: any[]): { runs: any[] } {
    const semanticRuns: any[] = [];

    for (const run of runs) {
      const rPr = run.rPr?.[0]; // Run properties
      const texts = run.t || []; // Text elements
      const tabs = run.tab || []; // Tab elements
      const breaks = run.br || []; // Break elements

      // Process text elements
      for (const textElement of texts) {
        const text = textElement._ || textElement;
        if (!text) continue;

        const runObj: any = { type: 'text', text };

        // Apply formatting based on run properties
        if (rPr) {
          if (rPr.b) runObj.type = 'strong'; // Bold
          if (rPr.i) runObj.type = 'emphasis'; // Italic
          if (rPr.u) runObj.type = 'underline'; // Underline
          if (rPr.strike) runObj.type = 'strikethrough'; // Strikethrough
          if (rPr.vertAlign?.[0]?.$?.val === 'subscript') runObj.type = 'subscript';
          if (rPr.vertAlign?.[0]?.$?.val === 'superscript') runObj.type = 'superscript';

          // Handle code formatting (monospace font)
          const font = rPr.rFonts?.[0]?.$?.ascii;
          if (
            font &&
            (font.includes('Courier') || font.includes('Consolas') || font.includes('Monaco'))
          ) {
            runObj.type = 'code';
          }

          // Handle hyperlinks
          if (run.hyperlink || rPr.color?.[0]?.$?.val === '0066CC') {
            runObj.type = 'reference';
            runObj.ref = run.hyperlink?.[0]?.$?.anchor || '#';
          }
        }

        semanticRuns.push(runObj);
      }

      // Handle tabs as spaces
      for (const tab of tabs) {
        semanticRuns.push({ type: 'text', text: '\t' });
      }

      // Handle line breaks
      for (const br of breaks) {
        semanticRuns.push({ type: 'text', text: '\n' });
      }
    }

    return { runs: semanticRuns.length > 0 ? semanticRuns : [{ type: 'text', text: '' }] };
  }

  /**
   * Extract citation from paragraph (for blockquotes)
   */
  private extractCitation(para: any): string | undefined {
    // Look for citation patterns in the text
    const runs = para.r || [];
    const text = this.extractTextFromRuns(runs);

    // Simple citation detection
    const citeMatch = text.match(/—\s*(.+)$|\((.+)\)$/);
    return citeMatch ? (citeMatch[1] || citeMatch[2] || '').trim() : undefined;
  }

  /**
   * Detect code language from content
   */
  private detectCodeLanguage(code: string): string | undefined {
    // Simple language detection based on common patterns
    if (code.includes('function') && code.includes('return')) return 'javascript';
    if (code.includes('def ') && code.includes(':')) return 'python';
    if (code.includes('#include') || code.includes('int main')) return 'c';
    if (code.includes('public class') || code.includes('System.out')) return 'java';
    if (code.includes('SELECT') || code.includes('FROM')) return 'sql';

    return undefined;
  }

  /**
   * Utility methods for metadata extraction
   */
  private extractFeatures(documentXml: string): string[] {
    const features: string[] = [];

    if (documentXml.includes('<w:p>')) features.push('paragraphs');
    if (documentXml.includes('<w:tbl>')) features.push('tables');
    if (documentXml.includes('<w:drawing>')) features.push('images');
    if (documentXml.includes('<m:oMath>')) features.push('equations');
    if (documentXml.includes('<w:hyperlink>')) features.push('hyperlinks');

    return features;
  }

  private extractStyles(documentXml: string): string[] {
    const styles: string[] = [];
    const styleMatches = documentXml.match(/<w:pStyle w:val="([^"]+)"/g);

    if (styleMatches) {
      styleMatches.forEach((match) => {
        const style = match.match(/w:val="([^"]+)"/)?.[1];
        if (style && !styles.includes(style)) {
          styles.push(style);
        }
      });
    }

    return styles;
  }

  private countTables(documentXml: string): number {
    return (documentXml.match(/<w:tbl>/g) || []).length;
  }

  private countEquations(documentXml: string): number {
    return (documentXml.match(/<m:oMath>/g) || []).length;
  }

  private hasTrackChanges(documentXml: string): boolean {
    return documentXml.includes('<w:ins>') || documentXml.includes('<w:del>');
  }

  private countComments(commentsXml: string): number {
    return (commentsXml.match(/<w:comment/g) || []).length;
  }
}
