/**
 * Convert xats documents to R Markdown format
 */

import {
  // extractPlainText,
  // createSemanticText,
  // buildCoreUri,
  // isValidUri,
  normalizeUri,
} from '@xats-org/utils';

import {
  serializeYamlFrontmatter,
  serializeChunkOptions,
  normalizeChunkOptions,
  generateChunkLabel,
} from './utils.js';

import type {
  RMarkdownRendererOptions,
  RMarkdownFrontmatter,
  RChunkOptions,
  RChunkEngine,
  RMarkdownContext,
  // BookdownRefType,
} from './types.js';
import type {
  XatsDocument,
  Unit,
  Chapter,
  Section,
  ContentBlock,
  SemanticText,
  // RendererOptions,
  RenderResult,
  // BidirectionalRenderer,
} from '@xats-org/types';

/**
 * Convert xats documents to R Markdown format with full fidelity
 */
export class XatsToRMarkdownConverter {
  private options: Required<RMarkdownRendererOptions>;
  private context: RMarkdownContext;

  constructor(options: RMarkdownRendererOptions = {}) {
    this.options = this.normalizeOptions(options);
    this.context = this.initializeContext();
  }

  /**
   * Convert xats document to R Markdown
   */
  public convert(document: XatsDocument): RenderResult {
    const startTime = Date.now();
    this.context = this.initializeContext();

    try {
      let content = '';

      // Generate frontmatter
      if (this.options.includeFrontmatter) {
        const frontmatter = this.generateFrontmatter(document);
        content += `${serializeYamlFrontmatter(frontmatter)}\n\n`;
      }

      // Process front matter
      if (document.frontMatter) {
        content += `${this.processFrontMatter(document.frontMatter)}\n\n`;
      }

      // Process body matter
      content += `${this.processBodyMatter(document.bodyMatter)}\n`;

      // Process back matter
      if (document.backMatter) {
        content += `\n${this.processBackMatter(document.backMatter)}`;
      }

      // Post-process content
      content = this.postProcessContent(content);

      const renderTime = Date.now() - startTime;
      const wordCount = this.countWords(content);

      return {
        content,
        metadata: {
          format: 'rmarkdown',
          renderTime,
          wordCount,
          tocGenerated: !!this.options.includeTableOfContents,
          bibliographyGenerated: !!this.options.includeBibliography,
        },
        errors: [],
      };
    } catch (error) {
      return {
        content: '',
        metadata: {
          format: 'rmarkdown',
          renderTime: Date.now() - startTime,
        },
        errors: [
          {
            type: 'other',
            message: error instanceof Error ? error.message : 'Unknown error',
            recoverable: false,
          },
        ],
      };
    }
  }

  /**
   * Generate R Markdown frontmatter from xats document
   */
  private generateFrontmatter(document: XatsDocument): RMarkdownFrontmatter {
    const frontmatter: RMarkdownFrontmatter = {};
    const bib = document.bibliographicEntry;

    // Basic metadata
    if (bib.title) {
      frontmatter.title = bib.title;
    }

    if (bib.author) {
      if (Array.isArray(bib.author)) {
        frontmatter.author = bib.author.map((author) =>
          typeof author === 'string'
            ? author
            : `${author.given || ''} ${author.family || ''}`.trim()
        );
      } else {
        frontmatter.author = String(bib.author);
      }
    }

    if (bib.issued?.['date-parts']?.[0]) {
      const dateParts = bib.issued['date-parts'][0];
      if (dateParts.length >= 3) {
        frontmatter.date = `${dateParts[0]}-${String(dateParts[1]).padStart(2, '0')}-${String(dateParts[2]).padStart(2, '0')}`;
      } else if (dateParts.length >= 1) {
        frontmatter.date = String(dateParts[0]);
      }
    }

    // Language
    if (document.lang) {
      frontmatter.lang = document.lang;
    }

    // Output format
    if (this.options.outputFormat) {
      frontmatter.output = this.options.outputFormat;
    }

    // Bibliography
    if (this.options.includeBibliography) {
      frontmatter.bibliography = 'references.bib';
      frontmatter.link_citations = true;

      if (this.options.citationStyle) {
        frontmatter.citation_style = this.options.citationStyle;
      }
    }

    // Table of contents
    if (this.options.includeTableOfContents) {
      frontmatter.toc = true;
      frontmatter.toc_depth = 3;
    }

    // Bookdown configuration
    if (this.options.useBookdown && this.options.bookdownConfig) {
      Object.assign(frontmatter, this.options.bookdownConfig);
    }

    // Figure options
    if (this.options.figureOptions) {
      frontmatter.fig_caption = true;
      if (this.options.figureOptions.width) {
        frontmatter.fig_width = this.options.figureOptions.width;
      }
      if (this.options.figureOptions.height) {
        frontmatter.fig_height = this.options.figureOptions.height;
      }
    }

    return frontmatter;
  }

  /**
   * Process front matter
   */
  private processFrontMatter(frontMatter: any): string {
    let content = '';

    if (frontMatter.preface) {
      content += '# Preface\n\n';
      content += `${frontMatter.preface
        .map((block: ContentBlock) => this.processContentBlock(block))
        .join('\n\n')}\n\n`;
    }

    if (frontMatter.acknowledgments) {
      content += '# Acknowledgments\n\n';
      content += `${frontMatter.acknowledgments
        .map((block: ContentBlock) => this.processContentBlock(block))
        .join('\n\n')}\n\n`;
    }

    return content.trim();
  }

  /**
   * Process body matter
   */
  private processBodyMatter(bodyMatter: any): string {
    return bodyMatter.contents
      .map((item: Unit | Chapter) => {
        if ('contents' in item && Array.isArray(item.contents)) {
          // Check if first item is Chapter or ContentBlock to determine type
          const firstContent = item.contents[0];
          if (firstContent && 'contents' in firstContent) {
            // This is a Unit containing Chapters
            return this.processUnit(item as Unit);
          } else {
            // This is a Chapter containing ContentBlocks or Sections
            return this.processChapter(item as Chapter);
          }
        }
        return '';
      })
      .join('\n\n');
  }

  /**
   * Process back matter
   */
  private processBackMatter(backMatter: any): string {
    let content = '';

    if (backMatter.appendices) {
      content += '# Appendices\n\n';
      content += `${backMatter.appendices
        .map((chapter: Chapter) => this.processChapter(chapter, true))
        .join('\n\n')}\n\n`;
    }

    if (backMatter.glossary) {
      content += '# Glossary\n\n';
      content += `${backMatter.glossary
        .map((block: ContentBlock) => this.processContentBlock(block))
        .join('\n\n')}\n\n`;
    }

    if (backMatter.bibliography) {
      content += '# References\n\n';
      // Add placeholder for bibliography generation
      content += '<!-- Bibliography will be generated here -->\n\n';
    }

    if (backMatter.index) {
      content += '# Index\n\n';
      content += `${backMatter.index
        .map((block: ContentBlock) => this.processContentBlock(block))
        .join('\n\n')}\n\n`;
    }

    return content.trim();
  }

  /**
   * Process a Unit
   */
  private processUnit(unit: Unit): string {
    let content = '';

    // Unit header
    const level = this.context.headingLevel + 1;
    this.context.headingLevel = level;

    const title = this.processSemanticText(unit.title);
    content += `${'#'.repeat(level)} ${title}\n\n`;

    // Unit contents (Chapters or ContentBlocks)
    content += unit.contents
      .map((item) => {
        if ('contents' in item) {
          return this.processChapter(item);
        } else {
          return this.processContentBlock(item);
        }
      })
      .join('\n\n');

    this.context.headingLevel = level - 1;
    return content;
  }

  /**
   * Process a Chapter
   */
  private processChapter(chapter: Chapter, isAppendix = false): string {
    let content = '';

    // Chapter header
    const level = this.context.headingLevel + 1;
    this.context.headingLevel = level;

    const title = this.processSemanticText(chapter.title);
    const prefix = isAppendix ? 'Appendix' : 'Chapter';

    // Add bookdown reference if enabled
    let header = `${'#'.repeat(level)} ${title}`;
    if (this.options.useBookdown && chapter.id) {
      header += ` {#${chapter.id}}`;
    }
    content += `${header}\n\n`;

    // Chapter contents (Sections or ContentBlocks)
    content += chapter.contents
      .map((item) => {
        if ('contents' in item) {
          return this.processSection(item);
        } else {
          return this.processContentBlock(item);
        }
      })
      .join('\n\n');

    this.context.headingLevel = level - 1;
    return content;
  }

  /**
   * Process a Section
   */
  private processSection(section: Section): string {
    let content = '';

    // Section header
    const level = this.context.headingLevel + 1;
    this.context.headingLevel = level;

    const title = this.processSemanticText(section.title);

    let header = `${'#'.repeat(level)} ${title}`;
    if (this.options.useBookdown && section.id) {
      header += ` {#${section.id}}`;
    }
    content += `${header}\n\n`;

    // Section contents (ContentBlocks)
    content += section.contents.map((block) => this.processContentBlock(block)).join('\n\n');

    this.context.headingLevel = level - 1;
    return content;
  }

  /**
   * Process a content block
   */
  private processContentBlock(block: ContentBlock): string {
    if (!block.blockType) return '';

    const uri = normalizeUri(block.blockType);

    // Handle core block types
    if (uri.startsWith('https://xats.org/vocabularies/blocks/')) {
      const blockTypeName = uri.split('/').pop();

      switch (blockTypeName) {
        case 'paragraph':
          return this.processParagraphBlock(block);
        case 'heading':
          return this.processHeadingBlock(block);
        case 'list':
          return this.processListBlock(block);
        case 'blockquote':
          return this.processBlockquoteBlock(block);
        case 'codeBlock':
          return this.processCodeBlock(block);
        case 'mathBlock':
          return this.processMathBlock(block);
        case 'table':
          return this.processTableBlock(block);
        case 'figure':
          return this.processFigureBlock(block);
        default:
          return this.processGenericBlock(block);
      }
    }

    // Handle placeholder blocks
    if (uri.startsWith('https://xats.org/vocabularies/placeholders/')) {
      const placeholderType = uri.split('/').pop();

      switch (placeholderType) {
        case 'tableOfContents':
          return '<!-- Table of Contents -->\n';
        case 'bibliography':
          return '<!-- References -->\n';
        case 'index':
          return '<!-- Index -->\n';
        default:
          return `<!-- ${placeholderType} -->\n`;
      }
    }

    return this.processGenericBlock(block);
  }

  /**
   * Process paragraph block
   */
  private processParagraphBlock(block: ContentBlock): string {
    if (!block.content || typeof block.content !== 'object') {
      return '';
    }

    // Type guard to check if content has the structure of SemanticText
    const content = block.content as any;
    if (content.runs && Array.isArray(content.runs)) {
      const semanticText: SemanticText = {
        runs: content.runs,
      };
      return this.processSemanticText(semanticText);
    }

    // Fallback for text property
    if ('text' in content && typeof content.text === 'string') {
      return content.text;
    }

    return '';
  }

  /**
   * Process heading block
   */
  private processHeadingBlock(block: ContentBlock): string {
    if (!block.content || typeof block.content !== 'object') {
      return '';
    }

    const content = block.content as any;
    const level = content.level || 1;

    let text = '';
    if (content.text && typeof content.text === 'object' && content.text.runs) {
      // Text is a SemanticText object
      text = this.processSemanticText(content.text as SemanticText);
    } else if (typeof content.text === 'string') {
      // Text is a plain string
      text = content.text;
    } else if (content.runs && Array.isArray(content.runs)) {
      // Content itself is SemanticText
      const semanticText: SemanticText = { runs: content.runs };
      text = this.processSemanticText(semanticText);
    }

    let header = `${'#'.repeat(level)} ${text}`;
    if (this.options.useBookdown && block.id) {
      header += ` {#${block.id}}`;
    }

    return header;
  }

  /**
   * Process list block
   */
  private processListBlock(block: ContentBlock): string {
    if (!block.content || typeof block.content !== 'object' || !('items' in block.content)) {
      return '';
    }

    const content = block.content as any;
    const ordered = content.listType === 'ordered';
    const items = content.items || [];

    return items
      .map((item: any, index: number) => {
        const marker = ordered ? `${index + 1}.` : '-';
        const text = this.processSemanticText(item.text || item);
        return `${marker} ${text}`;
      })
      .join('\n');
  }

  /**
   * Process blockquote block
   */
  private processBlockquoteBlock(block: ContentBlock): string {
    if (!block.content || typeof block.content !== 'object') {
      return '';
    }

    const content = block.content as any;
    let text = '';

    if (content.runs && Array.isArray(content.runs)) {
      const semanticText: SemanticText = { runs: content.runs };
      text = this.processSemanticText(semanticText);
    } else if ('text' in content) {
      if (typeof content.text === 'object' && content.text.runs) {
        text = this.processSemanticText(content.text as SemanticText);
      } else if (typeof content.text === 'string') {
        text = content.text;
      }
    }

    return text
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');
  }

  /**
   * Process code block
   */
  private processCodeBlock(block: ContentBlock): string {
    if (!block.content || typeof block.content !== 'object') {
      return '';
    }

    const content = block.content as any;
    const code = content.code || content.text || '';
    const language = content.language || '';

    // Check if this should be an R chunk
    const isRChunk = this.shouldCreateRChunk(language, content);

    if (isRChunk) {
      return this.createRChunk(code, language, content, block);
    }

    // Regular code block
    return `\`\`\`${language}\n${code}\n\`\`\``;
  }

  /**
   * Process math block
   */
  private processMathBlock(block: ContentBlock): string {
    if (!block.content || typeof block.content !== 'object' || !('math' in block.content)) {
      return '';
    }

    const content = block.content as any;
    const math = content.math || content.text || '';

    // Display math
    return `$$${math}$$`;
  }

  /**
   * Process table block
   */
  private processTableBlock(block: ContentBlock): string {
    if (!block.content || typeof block.content !== 'object' || !('rows' in block.content)) {
      return '';
    }

    const content = block.content as any;
    const caption = content.caption ? this.processSemanticText(content.caption) : '';
    const headers = content.headers || [];
    const rows = content.rows || [];

    let table = '';

    // Caption
    if (caption) {
      table += `Table: ${caption}\n\n`;
    }

    // Headers
    if (headers.length > 0) {
      const headerRow = headers
        .map((h: any) => (typeof h === 'string' ? h : this.processSemanticText(h)))
        .join(' | ');
      const separator = headers.map(() => '---').join(' | ');

      table += `| ${headerRow} |\n`;
      table += `| ${separator} |\n`;
    }

    // Rows
    rows.forEach((row: any[]) => {
      const rowText = row
        .map((cell) => (typeof cell === 'string' ? cell : this.processSemanticText(cell)))
        .join(' | ');
      table += `| ${rowText} |\n`;
    });

    return table;
  }

  /**
   * Process figure block
   */
  private processFigureBlock(block: ContentBlock): string {
    if (!block.content || typeof block.content !== 'object') {
      return '';
    }

    const content = block.content as any;
    const src = content.src || content.url || '';
    const alt = content.alt || '';
    const caption = content.caption ? this.processSemanticText(content.caption) : '';

    let figure = `![${alt}](${src})`;

    if (this.options.useBookdown && block.id) {
      figure += ` {#fig:${block.id}}`;
    }

    if (caption) {
      figure += `\n\n*Figure: ${caption}*`;
    }

    return figure;
  }

  /**
   * Process generic block
   */
  private processGenericBlock(block: ContentBlock): string {
    if (!block.content) return '';

    if (typeof block.content === 'string') {
      return block.content;
    }

    if (typeof block.content === 'object' && 'text' in block.content) {
      const content = block.content as any;
      if (content.runs && Array.isArray(content.runs)) {
        const semanticText: SemanticText = { runs: content.runs };
        return this.processSemanticText(semanticText);
      }
      return String(content.text || '');
    }

    // Fallback: JSON representation
    return `<!-- Generic block: ${JSON.stringify(block.content)} -->`;
  }

  /**
   * Process semantic text
   */
  private processSemanticText(text: SemanticText): string {
    if (!text.runs || !Array.isArray(text.runs)) {
      return '';
    }

    return text.runs
      .map((run: any) => {
        switch (run.runType) {
          case 'text':
            return run.text || '';

          case 'emphasis':
            const emphText = run.text || '';
            return `*${emphText}*`;

          case 'strong':
            const strongText = run.text || '';
            return `**${strongText}**`;

          case 'code':
            const codeText = run.text || '';
            return `\`${codeText}\``;

          case 'reference':
            const refRun = run;
            const refText = refRun.text || refRun.referenceId || '';
            if (this.options.useBookdown && refRun.referenceId) {
              return `\\@ref(${refRun.referenceId})`;
            }
            return `[${refText}](#${refRun.referenceId || ''})`;

          case 'citation':
            const citRun = run;
            const citText = citRun.text || citRun.citationKey || '';
            return `[@${citRun.citationKey || citText}]`;

          default:
            return run.text || '';
        }
      })
      .join('');
  }

  /**
   * Determine if code block should be an R chunk
   */
  private shouldCreateRChunk(language: string, content: any): boolean {
    if (!this.options.preserveCodeChunks) return false;

    const rLanguages = ['r', 'R', 'python', 'sql', 'bash', 'js'];
    return rLanguages.includes(language) || content.executable === true;
  }

  /**
   * Create R code chunk
   */
  private createRChunk(code: string, language: string, content: any, block: ContentBlock): string {
    this.context.chunkNumber++;

    const engine = (language.toLowerCase() || 'r') as RChunkEngine;
    const label =
      content.label ||
      block.id ||
      generateChunkLabel(engine, this.context.chunkNumber, this.context.chunkLabels);

    // Build chunk options
    const options: RChunkOptions = normalizeChunkOptions(
      content.options || {},
      this.options.defaultChunkOptions
    );

    // Add label to registry
    this.context.chunkLabels.add(label);

    // Serialize chunk header
    const header = serializeChunkOptions(engine, label, options);

    return `\`\`\`${header}\n${code}\n\`\`\``;
  }

  /**
   * Post-process content
   */
  private postProcessContent(content: string): string {
    // Normalize line endings
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Remove excessive blank lines
    content = content.replace(/\n{3,}/g, '\n\n');

    // Ensure file ends with single newline
    return `${content.trim()}\n`;
  }

  /**
   * Count words in content
   */
  private countWords(content: string): number {
    // Remove code blocks and chunks
    const cleaned = content
      .replace(/^```[\s\S]*?```$/gm, '')
      .replace(/`[^`]+`/g, '')
      .replace(/^\s*[>#-]\s*/gm, '');

    const words = cleaned.split(/\s+/).filter((word) => word.length > 0 && !/^[^\w]*$/.test(word));

    return words.length;
  }

  /**
   * Normalize options with defaults
   */
  private normalizeOptions(options: RMarkdownRendererOptions): Required<RMarkdownRendererOptions> {
    return {
      theme: options.theme || 'default',
      cssClasses: options.cssClasses || {},
      includeTableOfContents: options.includeTableOfContents ?? false,
      includeBibliography: options.includeBibliography ?? false,
      includeIndex: options.includeIndex ?? false,
      mathRenderer: options.mathRenderer || 'mathjax',
      syntaxHighlighter: options.syntaxHighlighter || 'prism',
      locale: options.locale || 'en-US',
      dir: options.dir || 'ltr',
      accessibilityMode: options.accessibilityMode ?? false,
      customStyles: options.customStyles || '',
      baseUrl: options.baseUrl || '',
      fragmentOnly: options.fragmentOnly ?? false,
      outputFormat: options.outputFormat || 'html_document',
      includeFrontmatter: options.includeFrontmatter ?? true,
      preserveCodeChunks: options.preserveCodeChunks ?? true,
      defaultChunkOptions: options.defaultChunkOptions || {},
      useBookdown: options.useBookdown ?? false,
      useDistill: options.useDistill ?? false,
      citationStyle: options.citationStyle || 'authoryear',
      enableCrossReferences: options.enableCrossReferences ?? true,
      chunkEngineMapping: options.chunkEngineMapping || {},
      figureOptions: options.figureOptions || {},
      tableOptions: options.tableOptions || {},
      mathOptions: options.mathOptions || {},
      outputDir: options.outputDir || '',
      knitrOptions: options.knitrOptions || {},
      bookdownConfig: options.bookdownConfig || {},
    };
  }

  /**
   * Initialize context
   */
  private initializeContext(): RMarkdownContext {
    return {
      chunkNumber: 0,
      headingLevel: 0,
      inCodeChunk: false,
      chunkLabels: new Set(),
      crossRefs: new Map(),
      citationKeys: new Set(),
      figureCounter: 0,
      tableCounter: 0,
      equationCounter: 0,
    };
  }
}
