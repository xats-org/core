/**
 * Parse R Markdown documents into xats format
 */

import { createSemanticText, buildCoreUri, deepClone } from '@xats-org/utils';

import {
  parseYamlFrontmatter,
  extractCodeChunks,
  extractInlineCode,
  parseBookdownReferences,
} from './utils.js';

import type {
  RMarkdownParseOptions,
  RMarkdownFrontmatter,
  BookdownReference,
  RMarkdownContext,
  RMarkdownMetadata,
  RMarkdownParseResult,
  RChunkEngine,
  RMarkdownOutputFormat,
} from './types.js';
import type {
  XatsDocument,
  Unit,
  Chapter,
  Section,
  ContentBlock,
  SemanticText,
  CslDataItem,
} from '@xats-org/types';

/**
 * Parse R Markdown content into xats documents
 */
export class RMarkdownToXatsParser {
  private options: Required<RMarkdownParseOptions>;
  private context: RMarkdownContext;
  private frontmatter: RMarkdownFrontmatter | null = null;

  constructor(options: RMarkdownParseOptions = {}) {
    this.options = this.normalizeOptions(options);
    this.context = this.initializeContext();
  }

  /**
   * Parse R Markdown content to xats document
   */
  public parse(content: string): RMarkdownParseResult {
    const startTime = Date.now();
    this.context = this.initializeContext();

    try {
      // Parse frontmatter
      if (this.options.parseFrontmatter) {
        this.frontmatter = parseYamlFrontmatter(content);
        if (this.frontmatter) {
          content = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');
        }
      }

      // Extract and process code chunks
      const chunks = this.options.parseCodeChunks ? extractCodeChunks(content) : [];
      const inlineCode = this.options.parseInlineCode ? extractInlineCode(content) : [];

      // Extract cross-references
      const crossRefs = this.options.parseBookdownReferences
        ? parseBookdownReferences(content)
        : [];

      // Parse document structure
      const document = this.parseDocumentStructure(content, chunks);

      // Build metadata
      const parseTime = Date.now() - startTime;
      const metadata = this.buildMetadata(chunks, inlineCode, crossRefs);
      if (metadata) {
        metadata.parseTime = parseTime;
        metadata.mappedElements = this.context.chunkNumber + crossRefs.length;
        metadata.unmappedElements = 0;
        metadata.fidelityScore = 0.95;
      }

      return {
        document,
        metadata,
        warnings: [],
        errors: [],
        unmappedData: [],
      };
    } catch (error) {
      return {
        document: this.createEmptyDocument(),
        metadata: {
          format: 'rmarkdown',
          parseTime: Date.now() - startTime,
          mappedElements: 0,
          unmappedElements: 0,
          fidelityScore: 0,
          sourceFormat: 'rmarkdown',
        } as RMarkdownMetadata,
        errors: [
          {
            type: 'malformed-content',
            message: error instanceof Error ? error.message : 'Unknown parsing error',
            fatal: true,
          },
        ],
        warnings: [],
        unmappedData: [],
      };
    }
  }

  /**
   * Parse document structure from cleaned content
   */
  private parseDocumentStructure(
    content: string,
    chunks: ReturnType<typeof extractCodeChunks>
  ): XatsDocument {
    // Remove frontmatter and get clean content for parsing
    let processedContent = content;

    // Replace code chunks with placeholders temporarily
    // Process chunks in reverse order to maintain position validity
    const chunkPlaceholders = new Map<string, ReturnType<typeof extractCodeChunks>[0]>();
    const sortedChunks = chunks.sort((a, b) => b.start - a.start); // Sort by start position descending

    sortedChunks.forEach((chunk, index) => {
      const placeholder = `__CHUNK_${chunks.length - 1 - index}__`; // Maintain original indexing
      chunkPlaceholders.set(placeholder, chunk);
      processedContent =
        processedContent.substring(0, chunk.start) +
        placeholder +
        processedContent.substring(chunk.end);
    });

    // Parse markdown structure with chunk placeholders
    const sections = this.parseMarkdownSections(processedContent, chunkPlaceholders);

    // Build document structure
    const document: XatsDocument = {
      schemaVersion: '0.3.0',
      bibliographicEntry: this.createBibliographicEntry(),
      subject: buildCoreUri('subjects', 'general'),
      bodyMatter: {
        contents: sections,
      },
    };

    // Add language if specified
    if (this.frontmatter?.lang) {
      document.lang = this.frontmatter.lang;
    }

    return document;
  }

  /**
   * Parse markdown into hierarchical sections
   */
  private parseMarkdownSections(
    content: string,
    chunkPlaceholders?: Map<string, ReturnType<typeof extractCodeChunks>[0]>
  ): Array<Unit | Chapter> {
    const lines = content.split('\n');
    const structure: Array<Unit | Chapter> = [];
    let currentChapter: Chapter | null = null;
    let currentSection: Section | null = null;
    let contentBuffer: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const headingMatch = line.match(/^(#{1,6})\s+(.+)(?:\s+\{#([^}]+)\})?$/);

      if (headingMatch) {
        // Process accumulated content
        if (contentBuffer.length > 0) {
          const blocks = this.parseContentBlocks(contentBuffer.join('\n'), chunkPlaceholders);

          if (currentSection) {
            currentSection.contents.push(...blocks);
          } else if (currentChapter) {
            currentChapter.contents.push(...blocks);
          } else {
            // Create a default chapter for orphaned content
            currentChapter = this.createChapter('Introduction');
            currentChapter.contents.push(...blocks);
          }
          contentBuffer = [];
        }

        const level = headingMatch[1]?.length ?? 1;
        const title = headingMatch[2]?.trim() ?? '';
        const id = headingMatch[3] ?? this.generateId(title);

        if (level <= 2) {
          // Chapter level
          if (currentChapter) {
            structure.push(currentChapter);
          }
          currentChapter = this.createChapter(title, id);
          currentSection = null;
        } else {
          // Section level
          if (!currentChapter) {
            currentChapter = this.createChapter('Chapter');
          }

          if (currentSection) {
            currentChapter.contents.push(currentSection);
          }

          currentSection = this.createSection(title, id);
        }
      } else {
        // Accumulate content
        contentBuffer.push(line);
      }
    }

    // Process remaining content
    if (contentBuffer.length > 0) {
      const blocks = this.parseContentBlocks(contentBuffer.join('\n'), chunkPlaceholders);

      if (currentSection) {
        currentSection.contents.push(...blocks);
      } else if (currentChapter) {
        currentChapter.contents.push(...blocks);
      } else {
        // Create default chapter
        currentChapter = this.createChapter('Content');
        currentChapter.contents.push(...blocks);
      }
    }

    // Add current section to chapter
    if (currentSection && currentChapter) {
      currentChapter.contents.push(currentSection);
    }

    // Add current chapter to structure
    if (currentChapter) {
      structure.push(currentChapter);
    }

    return structure;
  }

  /**
   * Parse content blocks from markdown text
   */
  private parseContentBlocks(
    content: string,
    chunkPlaceholders?: Map<string, ReturnType<typeof extractCodeChunks>[0]>
  ): ContentBlock[] {
    if (!content.trim()) return [];

    const blocks: ContentBlock[] = [];
    const lines = content.split('\n');
    let currentBlock: string[] = [];
    let inCodeBlock = false;
    let inTable = false;
    let inList = false;

    for (const line of lines) {
      // Check for chunk placeholders first
      if (chunkPlaceholders) {
        for (const [placeholder, chunk] of chunkPlaceholders) {
          if (line.includes(placeholder)) {
            // Process any accumulated content before the chunk
            if (currentBlock.length > 0) {
              blocks.push(...this.parseTextContent(currentBlock.join('\n')));
              currentBlock = [];
            }

            // Add the chunk block
            blocks.push(this.createChunkBlock(chunk));

            // Continue with any remaining content on the same line
            const remainingText = line.replace(placeholder, '').trim();
            if (remainingText) {
              currentBlock.push(remainingText);
            }
            continue;
          }
        }
      }

      // Code block detection
      if (line.match(/^```/)) {
        if (inCodeBlock) {
          // End of code block
          currentBlock.push(line);
          blocks.push(this.parseCodeBlockContent(currentBlock.join('\n')));
          currentBlock = [];
          inCodeBlock = false;
        } else {
          // Start of code block
          if (currentBlock.length > 0) {
            blocks.push(...this.parseTextContent(currentBlock.join('\n')));
            currentBlock = [];
          }
          currentBlock.push(line);
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        currentBlock.push(line);
        continue;
      }

      // Table detection
      if (line.includes('|') && line.trim().startsWith('|')) {
        if (!inTable) {
          if (currentBlock.length > 0) {
            blocks.push(...this.parseTextContent(currentBlock.join('\n')));
            currentBlock = [];
          }
          inTable = true;
        }
        currentBlock.push(line);
        continue;
      }

      if (inTable && line.trim() === '') {
        blocks.push(this.parseTableContent(currentBlock.join('\n')));
        currentBlock = [];
        inTable = false;
        continue;
      }

      // List detection
      if (line.match(/^\s*[-*+]\s/) || line.match(/^\s*\d+\.\s/)) {
        if (!inList) {
          if (currentBlock.length > 0) {
            blocks.push(...this.parseTextContent(currentBlock.join('\n')));
            currentBlock = [];
          }
          inList = true;
        }
        currentBlock.push(line);
        continue;
      }

      if (inList && line.trim() === '') {
        blocks.push(this.parseListContent(currentBlock.join('\n')));
        currentBlock = [];
        inList = false;
        continue;
      }

      // Blockquote detection
      if (line.startsWith('>')) {
        if (currentBlock.length > 0 && !currentBlock[0]?.startsWith('>')) {
          blocks.push(...this.parseTextContent(currentBlock.join('\n')));
          currentBlock = [];
        }
      }

      currentBlock.push(line);
    }

    // Process remaining content
    if (currentBlock.length > 0) {
      if (inCodeBlock) {
        blocks.push(this.parseCodeBlockContent(currentBlock.join('\n')));
      } else if (inTable) {
        blocks.push(this.parseTableContent(currentBlock.join('\n')));
      } else if (inList) {
        blocks.push(this.parseListContent(currentBlock.join('\n')));
      } else {
        blocks.push(...this.parseTextContent(currentBlock.join('\n')));
      }
    }

    return blocks.filter((block) => block.content !== null);
  }

  /**
   * Parse text content into appropriate blocks
   */
  private parseTextContent(text: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith('>')) {
        blocks.push(this.parseBlockquoteContent(paragraph));
      } else if (trimmed.match(/^\s*\$\$[\s\S]*\$\$\s*$/)) {
        blocks.push(this.parseMathBlockContent(paragraph));
      } else {
        blocks.push(this.parseParagraphContent(paragraph));
      }
    }

    return blocks;
  }

  /**
   * Parse paragraph content
   */
  private parseParagraphContent(text: string): ContentBlock {
    return {
      id: this.generateBlockId(),
      blockType: buildCoreUri('blocks', 'paragraph'),
      content: this.parseSemanticText(text),
    };
  }

  /**
   * Parse blockquote content
   */
  private parseBlockquoteContent(text: string): ContentBlock {
    const cleanText = text.replace(/^\s*>\s?/gm, '');
    return {
      id: this.generateBlockId(),
      blockType: buildCoreUri('blocks', 'blockquote'),
      content: this.parseSemanticText(cleanText),
    };
  }

  /**
   * Parse code block content
   */
  private parseCodeBlockContent(text: string): ContentBlock {
    const lines = text.split('\n');
    const firstLine = lines[0];

    // Extract language from first line
    const languageMatch = firstLine?.match(/^```+\s*(\w+)?/);
    const language = languageMatch?.[1] || '';

    // Extract code (excluding fence lines)
    const code = lines.slice(1, -1).join('\n');

    return {
      id: this.generateBlockId(),
      blockType: buildCoreUri('blocks', 'codeBlock'),
      content: {
        code,
        language,
        // Remove bash from executable languages for security reasons
        // Only allow safe, sandboxed languages
        executable: ['r', 'python', 'sql'].includes(language.toLowerCase()),
      },
    };
  }

  /**
   * Parse math block content
   */
  private parseMathBlockContent(text: string): ContentBlock {
    const math = text.replace(/^\s*\$\$\s*|\s*\$\$\s*$/g, '');
    return {
      id: this.generateBlockId(),
      blockType: buildCoreUri('blocks', 'mathBlock'),
      content: {
        math: math.trim(),
      },
    };
  }

  /**
   * Parse list content
   */
  private parseListContent(text: string): ContentBlock {
    const lines = text.split('\n').filter((line) => line.trim());
    const items: Array<{ text: SemanticText }> = [];
    let isOrdered = false;

    for (const line of lines) {
      const orderedMatch = line.match(/^\s*\d+\.\s+(.+)$/);
      const unorderedMatch = line.match(/^\s*[-*+]\s+(.+)$/);

      if (orderedMatch && orderedMatch[1]) {
        isOrdered = true;
        items.push({
          text: this.parseSemanticText(orderedMatch[1]),
        });
      } else if (unorderedMatch && unorderedMatch[1]) {
        items.push({
          text: this.parseSemanticText(unorderedMatch[1]),
        });
      }
    }

    return {
      id: this.generateBlockId(),
      blockType: buildCoreUri('blocks', 'list'),
      content: {
        listType: isOrdered ? 'ordered' : 'unordered',
        items,
      },
    };
  }

  /**
   * Parse table content
   */
  private parseTableContent(text: string): ContentBlock {
    const lines = text.split('\n').filter((line) => line.includes('|'));

    if (lines.length < 2) {
      return this.parseParagraphContent(text);
    }

    // Extract headers (first line)
    const headerLine = lines[0];
    if (!headerLine) return this.parseParagraphContent(text);
    const headers = headerLine
      .split('|')
      .slice(1, -1) // Remove empty first/last elements
      .map((h) => h.trim());

    // Skip separator line (second line)
    const dataLines = lines.slice(2);

    const rows = dataLines.map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim())
    );

    return {
      id: this.generateBlockId(),
      blockType: buildCoreUri('blocks', 'table'),
      content: {
        headers: headers.map((h) => this.parseSemanticText(h)),
        rows: rows.map((row) => row.map((cell) => this.parseSemanticText(cell))),
      },
    };
  }

  /**
   * Parse semantic text from markdown
   */
  private parseSemanticText(text: string): SemanticText {
    if (!text) {
      return createSemanticText('');
    }

    const runs: Array<{
      runType: string;
      text: string;
      [key: string]: unknown;
    }> = [];

    // Simple parsing - in production, use a proper markdown parser
    let remaining = text;

    while (remaining) {
      // Citation: [@key]
      const citationMatch = remaining.match(/^\[@([^\]]+)\]/);
      if (citationMatch) {
        runs.push({
          runType: 'citation',
          text: citationMatch[0],
          citationKey: citationMatch[1],
        });
        remaining = remaining.substring(citationMatch[0].length);
        continue;
      }

      // Reference: \@ref(type:label)
      const refMatch = remaining.match(/^\\@ref\(([^)]+)\)/);
      if (refMatch) {
        runs.push({
          runType: 'reference',
          text: refMatch[0],
          referenceId: refMatch[1],
        });
        remaining = remaining.substring(refMatch[0].length);
        continue;
      }

      // Strong: **text**
      const strongMatch = remaining.match(/^\*\*([^*]+)\*\*/);
      if (strongMatch && strongMatch[1]) {
        runs.push({
          runType: 'strong',
          text: strongMatch[1],
        });
        remaining = remaining.substring(strongMatch[0].length);
        continue;
      }

      // Emphasis: *text*
      const emphasisMatch = remaining.match(/^\*([^*]+)\*/);
      if (emphasisMatch && emphasisMatch[1]) {
        runs.push({
          runType: 'emphasis',
          text: emphasisMatch[1],
        });
        remaining = remaining.substring(emphasisMatch[0].length);
        continue;
      }

      // Code: `code`
      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch && codeMatch[1]) {
        runs.push({
          runType: 'code',
          text: codeMatch[1],
        });
        remaining = remaining.substring(codeMatch[0].length);
        continue;
      }

      // Regular text - find next special character
      const nextSpecial = remaining.search(/[@\\*`]/);
      if (nextSpecial === -1) {
        // No more special characters
        runs.push({
          runType: 'text',
          text: remaining,
        });
        break;
      } else {
        // Text up to next special character
        runs.push({
          runType: 'text',
          text: remaining.substring(0, nextSpecial),
        });
        remaining = remaining.substring(nextSpecial);
      }
    }

    return { runs: runs as unknown as SemanticText['runs'] };
  }

  /**
   * Restore code chunks in parsed content
   */
  private restoreCodeChunks(
    sections: Array<Unit | Chapter>,
    chunkPlaceholders: Map<string, ReturnType<typeof extractCodeChunks>[0]>
  ): Array<Unit | Chapter> {
    return sections.map((section) => {
      const restored = deepClone(section);
      this.restoreChunksInContents(restored, chunkPlaceholders);
      return restored;
    });
  }

  /**
   * Recursively restore chunks in content structures
   */
  private restoreChunksInContents(
    item: Unit | Chapter | Section,
    chunkPlaceholders: Map<string, ReturnType<typeof extractCodeChunks>[0]>
  ): void {
    if ('contents' in item && Array.isArray(item.contents)) {
      item.contents = item.contents.map((contentItem) => {
        if (
          typeof contentItem === 'object' &&
          contentItem !== null &&
          'content' in contentItem &&
          contentItem.content
        ) {
          // Check if content contains chunk placeholders
          if (
            typeof contentItem.content === 'object' &&
            contentItem.content !== null &&
            'text' in contentItem.content &&
            typeof contentItem.content.text === 'string'
          ) {
            const text = contentItem.content.text;
            for (const [placeholder, chunk] of chunkPlaceholders) {
              if (text.includes(placeholder)) {
                // Replace with actual chunk block
                return this.createChunkBlock(chunk);
              }
            }
          }

          // Recursively check nested content
          // Only restore chunks if contentItem is a structural container
          if ('contents' in contentItem && contentItem.contents) {
            this.restoreChunksInContents(
              contentItem as unknown as Unit | Chapter | Section,
              chunkPlaceholders
            );
          }
        }
        return contentItem;
      });
    }
  }

  /**
   * Create content block for R chunk
   */
  private createChunkBlock(chunk: ReturnType<typeof extractCodeChunks>[0]): ContentBlock {
    this.context.chunkNumber++;

    return {
      id: this.generateBlockId(),
      blockType: buildCoreUri('blocks', 'codeBlock'),
      content: {
        code: chunk.code,
        language: chunk.options.engine,
        executable: true,
        label: chunk.options.label || undefined,
        options: chunk.options.options,
      },
    };
  }

  /**
   * Build metadata from parsed content
   */
  private buildMetadata(
    chunks: ReturnType<typeof extractCodeChunks>,
    inlineCode: ReturnType<typeof extractInlineCode>,
    crossRefs: BookdownReference[]
  ): RMarkdownMetadata {
    const metadata: RMarkdownMetadata = {
      format: 'rmarkdown',
      wordCount: 0, // Would be calculated from cleaned content
      sourceFormat: 'rmarkdown',
      parseTime: 0, // Would be measured during actual parsing
      mappedElements: chunks.length + inlineCode.length,
      unmappedElements: 0,
      fidelityScore: 1.0,
      codeChunks: chunks.map((chunk) => ({
        engine: chunk.options.engine as RChunkEngine,
        code: chunk.code,
        options: chunk.options.options,
        line: Math.floor(chunk.start / 50), // Approximate line number
        inline: false,
        ...(chunk.options.label && { label: chunk.options.label }),
      })),
      inlineCode: inlineCode.map((code) => ({
        engine: code.engine,
        code: code.code,
        line: Math.floor(code.start / 50),
      })),
      crossReferences: crossRefs,
      outputFormat:
        typeof this.frontmatter?.output === 'string'
          ? (this.frontmatter.output as RMarkdownOutputFormat)
          : ('html_document' as RMarkdownOutputFormat),
    };

    if (this.frontmatter) {
      metadata.frontmatter = this.frontmatter;
    }

    return metadata;
  }

  /**
   * Create bibliographic entry from frontmatter
   */
  private createBibliographicEntry(): CslDataItem {
    if (!this.frontmatter) {
      return { type: 'article-journal' };
    }

    const entry: CslDataItem = {
      type: 'article-journal',
    };

    if (this.frontmatter.title) {
      entry.title = this.frontmatter.title;
    }

    if (this.frontmatter.author) {
      if (Array.isArray(this.frontmatter.author)) {
        entry.author = this.frontmatter.author.map((author) => {
          if (typeof author === 'string') {
            const parts = author.split(' ');
            const authorData: { given?: string; family?: string } = {};
            const given = parts.slice(0, -1).join(' ');
            const family = parts[parts.length - 1];

            if (given) authorData.given = given;
            if (family) authorData.family = family;

            return authorData;
          }
          const authorData: { given?: string; family?: string } = {};
          const nameParts = author.name?.split(' ');
          if (nameParts && nameParts.length > 0) {
            const given = nameParts.slice(0, -1).join(' ');
            const family = nameParts[nameParts.length - 1];

            if (given) authorData.given = given;
            if (family) authorData.family = family;
          }

          return authorData;
        });
      } else {
        const parts = this.frontmatter.author.split(' ');
        const authorData: { given?: string; family?: string } = {};
        const given = parts.slice(0, -1).join(' ');
        const family = parts[parts.length - 1];

        if (given) authorData.given = given;
        if (family) authorData.family = family;

        entry.author = [authorData];
      }
    }

    if (this.frontmatter.date) {
      const dateMatch = String(this.frontmatter.date).match(/(\d{4})-?(\d{2})?-?(\d{2})?/);
      if (dateMatch && dateMatch[1]) {
        entry.issued = {
          'date-parts': [
            [
              parseInt(dateMatch[1]),
              dateMatch[2] ? parseInt(dateMatch[2]) : undefined,
              dateMatch[3] ? parseInt(dateMatch[3]) : undefined,
            ].filter((x): x is number => x !== undefined),
          ],
        };
      }
    }

    return entry;
  }

  /**
   * Create empty document
   */
  private createEmptyDocument(): XatsDocument {
    return {
      schemaVersion: '0.3.0',
      bibliographicEntry: { type: 'article-journal' },
      subject: buildCoreUri('subjects', 'general'),
      bodyMatter: { contents: [] },
    };
  }

  /**
   * Create chapter
   */
  private createChapter(title: string, id?: string): Chapter {
    return {
      id: id || this.generateId(title),
      title: createSemanticText(title),
      contents: [],
    };
  }

  /**
   * Create section
   */
  private createSection(title: string, id?: string): Section {
    return {
      id: id || this.generateId(title),
      title: createSemanticText(title),
      contents: [],
    };
  }

  /**
   * Generate ID from title
   */
  private generateId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Generate block ID
   */
  private generateBlockId(): string {
    return `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Normalize options with defaults
   */
  private normalizeOptions(options: RMarkdownParseOptions): Required<RMarkdownParseOptions> {
    return {
      preserveMetadata: options.preserveMetadata ?? true,
      strictMode: options.strictMode ?? false,
      customParsers: options.customParsers || {},
      baseUrl: options.baseUrl || '',
      encoding: options.encoding || 'utf-8',
      parseFrontmatter: options.parseFrontmatter ?? true,
      parseCodeChunks: options.parseCodeChunks ?? true,
      preserveChunkOptions: options.preserveChunkOptions ?? true,
      parseInlineCode: options.parseInlineCode ?? true,
      parseBookdownReferences: options.parseBookdownReferences ?? true,
      parseDistillComponents: options.parseDistillComponents ?? false,
      validateChunks: options.validateChunks ?? true,
      mathParsing: {
        parseLatex: true,
        parseR: true,
        preserveDelimiters: true,
        ...options.mathParsing,
      },
      citationParsing: {
        parsePandoc: true,
        parseR: true,
        validateKeys: false,
        ...options.citationParsing,
      },
      figureParsing: {
        extractCaptions: true,
        parseLabels: true,
        resolveReferences: true,
        ...options.figureParsing,
      },
      tableParsing: {
        parseHeaders: true,
        parseAlignment: true,
        extractCaptions: true,
        ...options.tableParsing,
      },
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
