/**
 * Simplified syntax parser for converting markdown-like syntax to xats documents
 */

import remarkParse from 'remark-parse';
import { unified } from 'unified';

import type {
  SimplifiedDocument,
  SimplifiedSyntaxOptions,
  AuthoringResult,
  UserFriendlyError,
} from './types.js';
import type { XatsDocument, SemanticText, ContentBlock, Chapter, Section } from '@xats-org/types';
import type { Root, Node, Heading, List, Code, Table, Image } from 'mdast';

/**
 * Parser for converting simplified markdown-like syntax to xats documents
 */
interface MarkdownProcessor {
  parse: (content: string) => Root;
}

export class SimplifiedSyntaxParser {
  private processor: MarkdownProcessor;
  private options: Required<SimplifiedSyntaxOptions>;

  constructor(options: SimplifiedSyntaxOptions = {}) {
    this.options = {
      strict: false,
      allowCustomBlocks: true,
      autoComplete: false,
      includeLineNumbers: true,
      ...options,
    };

    this.processor = unified().use(remarkParse) as MarkdownProcessor;
  }

  /**
   * Parse simplified syntax to xats document
   */
  parse(simplifiedDoc: SimplifiedDocument): AuthoringResult {
    const startTime = performance.now();
    const errors: UserFriendlyError[] = [];

    try {
      // Parse markdown content
      const mdast = this.processor.parse(simplifiedDoc.content);

      // Convert MDAST to xats structure
      const xatsDocument = this.convertMdastToXats(mdast, simplifiedDoc);

      return {
        success: true,
        document: xatsDocument,
        processingTime: performance.now() - startTime,
      };
    } catch (error) {
      errors.push({
        message: `Parsing failed: ${error instanceof Error ? error.message : String(error)}`,
        severity: 'error' as const,
        suggestions: [
          {
            description: 'Check your syntax for common markdown errors',
            action: 'fix',
            fix: 'Review headings, lists, and code blocks for proper formatting',
            confidence: 0.6,
          },
        ],
      });

      return {
        success: false,
        errors,
        processingTime: performance.now() - startTime,
      };
    }
  }

  /**
   * Convert MDAST to xats document structure
   */
  private convertMdastToXats(mdast: Root, simplifiedDoc: SimplifiedDocument): XatsDocument {
    // Extract document metadata
    const title = simplifiedDoc.title || this.extractTitleFromContent(mdast);
    const author = simplifiedDoc.author || 'Unknown Author';
    const subject = simplifiedDoc.subject || 'General';

    // Build the basic xats document structure
    const xatsDocument: XatsDocument = {
      schemaVersion: '0.5.0',
      bibliographicEntry: {
        type: 'book',
        title,
        author: [{ family: author }],
      },
      subject,
      bodyMatter: {
        contents: this.convertContentToChapters(mdast.children),
      },
    };

    return xatsDocument;
  }

  /**
   * Extract title from content (first heading)
   */
  private extractTitleFromContent(mdast: Root): string {
    for (const child of mdast.children) {
      if (child.type === 'heading' && child.depth === 1) {
        return this.extractTextFromNode(child);
      }
    }
    return 'Untitled Document';
  }

  /**
   * Convert markdown content to xats chapters
   */
  private convertContentToChapters(nodes: Node[]): Chapter[] {
    const chapters: Chapter[] = [];
    let currentChapter: Chapter | null = null;
    let currentSections: Section[] = [];
    let currentBlocks: ContentBlock[] = [];

    let blockId = 1;

    for (const node of nodes) {
      if (node.type === 'heading') {
        const heading = node as Heading;

        if (heading.depth === 1) {
          // Save current chapter if exists
          if (currentChapter) {
            if (currentBlocks.length > 0) {
              currentSections.push({
                id: `section-${currentSections.length + 1}`,
                title: { runs: [{ type: 'text', text: 'Content' }] },
                contents: [...currentBlocks],
              });
              currentBlocks = [];
            }
            currentChapter.contents = [...currentSections];
            chapters.push(currentChapter);
            currentSections = [];
          }

          // Start new chapter
          currentChapter = {
            id: `chapter-${chapters.length + 1}`,
            label: `${chapters.length + 1}`,
            title: this.convertTextToSemanticText(this.extractTextFromNode(heading)),
            contents: [],
          };
        } else if (heading.depth === 2) {
          // Save current section if exists
          if (currentBlocks.length > 0) {
            currentSections.push({
              id: `section-${currentSections.length + 1}`,
              title: { runs: [{ type: 'text', text: 'Content' }] },
              contents: [...currentBlocks],
            });
            currentBlocks = [];
          }

          // Start new section
          // const sectionTitle = this.convertTextToSemanticText(this.extractTextFromNode(heading));
          // Section will be created when we have content
        } else {
          // Convert heading to content block
          currentBlocks.push({
            id: `block-${blockId++}`,
            blockType: 'https://xats.org/vocabularies/blocks/heading',
            content: {
              text: this.convertTextToSemanticText(this.extractTextFromNode(heading)),
              level: heading.depth,
            },
          });
        }
      } else {
        // Convert other nodes to content blocks
        const contentBlock = this.convertNodeToContentBlock(node, blockId++);
        if (contentBlock) {
          currentBlocks.push(contentBlock);
        }
      }
    }

    // Handle remaining content
    if (currentBlocks.length > 0) {
      if (currentChapter) {
        currentSections.push({
          id: `section-${currentSections.length + 1}`,
          title: { runs: [{ type: 'text', text: 'Content' }] },
          contents: [...currentBlocks],
        });
      } else {
        // Create a default chapter if we only have content blocks
        currentChapter = {
          id: 'chapter-1',
          label: '1',
          title: { runs: [{ type: 'text', text: 'Chapter 1' }] },
          contents: currentBlocks,
        };
      }
    }

    if (currentChapter) {
      if (currentSections.length > 0) {
        currentChapter.contents = [...currentSections];
      }
      chapters.push(currentChapter);
    }

    // Ensure we have at least one chapter
    if (chapters.length === 0) {
      chapters.push({
        id: 'chapter-1',
        label: '1',
        title: { runs: [{ type: 'text', text: 'Chapter 1' }] },
        contents: [],
      });
    }

    return chapters;
  }

  /**
   * Convert markdown node to xats content block
   */
  private convertNodeToContentBlock(node: Node, blockId: number): ContentBlock | null {
    const baseBlock = {
      id: `block-${blockId}`,
    };

    switch (node.type) {
      case 'paragraph':
        return {
          ...baseBlock,
          blockType: 'https://xats.org/vocabularies/blocks/paragraph',
          content: {
            text: this.convertTextToSemanticText(this.extractTextFromNode(node)),
          },
        };

      case 'list': {
        const listNode = node as List;
        return {
          ...baseBlock,
          blockType: 'https://xats.org/vocabularies/blocks/list',
          content: {
            listType: listNode.ordered ? 'ordered' : 'unordered',
            items: listNode.children.map((item) =>
              this.convertTextToSemanticText(this.extractTextFromNode(item))
            ),
          },
        };
      }

      case 'blockquote':
        return {
          ...baseBlock,
          blockType: 'https://xats.org/vocabularies/blocks/blockquote',
          content: {
            text: this.convertTextToSemanticText(this.extractTextFromNode(node)),
          },
        };

      case 'code': {
        const codeNode = node as Code;
        return {
          ...baseBlock,
          blockType: 'https://xats.org/vocabularies/blocks/codeBlock',
          content: {
            code: codeNode.value || '',
            language: codeNode.lang || undefined,
          },
        };
      }

      case 'table':
        return this.convertTableNode(node as Table, baseBlock);

      case 'image': {
        const imageNode = node as Image;
        return {
          ...baseBlock,
          blockType: 'https://xats.org/vocabularies/blocks/figure',
          content: {
            src: imageNode.url || '',
            alt: imageNode.alt || '',
            caption: imageNode.title ? this.convertTextToSemanticText(imageNode.title) : undefined,
          },
        };
      }

      default: {
        // Skip unknown node types or convert to paragraph if they have text content
        const text = this.extractTextFromNode(node);
        if (text.trim()) {
          return {
            ...baseBlock,
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              text: this.convertTextToSemanticText(text),
            },
          };
        }
        return null;
      }
    }
  }

  /**
   * Convert table node to content block
   */
  private convertTableNode(tableNode: Table, baseBlock: Partial<ContentBlock>): ContentBlock {
    const rows: SemanticText[][] = [];
    let headers: SemanticText[] | undefined;

    if (tableNode.children && tableNode.children.length > 0) {
      tableNode.children.forEach((row, index: number) => {
        if ('children' in row && row.children) {
          const cells = row.children.map((cell) =>
            this.convertTextToSemanticText(this.extractTextFromNode(cell))
          );

          if (index === 0 && tableNode.align) {
            // First row is header if table has alignment info
            headers = cells;
          } else {
            rows.push(cells);
          }
        }
      });
    }

    return {
      ...baseBlock,
      blockType: 'https://xats.org/vocabularies/blocks/table',
      content: {
        headers,
        rows,
      },
    };
  }

  /**
   * Extract plain text from any node
   */
  private extractTextFromNode(node: Node | string): string {
    if (typeof node === 'string') {
      return node;
    }

    if ('value' in node && typeof node.value === 'string') {
      return node.value;
    }

    if ('children' in node && Array.isArray(node.children)) {
      return node.children.map((child: Node | string) => this.extractTextFromNode(child)).join('');
    }

    return '';
  }

  /**
   * Convert plain text to SemanticText with simple run detection
   */
  private convertTextToSemanticText(text: string): SemanticText {
    // For now, create simple text runs
    // TODO: Add parsing for emphasis, strong, code, etc.
    return {
      runs: [{ type: 'text', text: text.trim() }],
    };
  }

  /**
   * Get authoring help and documentation
   */
  getHelp(): Array<{
    title: string;
    description: string;
    examples: string[];
    references: string[];
  }> {
    return [
      {
        title: 'Basic Structure',
        description:
          'Use markdown-style headings to organize your content into chapters and sections',
        examples: ['# Chapter 1: Introduction', '## Section 1.1: Overview', '### Subsection'],
        references: ['https://xats.org/docs/authoring-guide#structure'],
      },
      {
        title: 'Text Formatting',
        description: 'Use standard markdown formatting for emphasis and styling',
        examples: ['*italic text*', '**bold text**', '`inline code`'],
        references: ['https://xats.org/docs/authoring-guide#formatting'],
      },
      {
        title: 'Lists',
        description: 'Create ordered and unordered lists using standard markdown syntax',
        examples: ['- Bullet point', '1. Numbered item', '   - Nested item'],
        references: ['https://xats.org/docs/authoring-guide#lists'],
      },
      {
        title: 'Code Blocks',
        description: 'Include code snippets with syntax highlighting',
        examples: ['```javascript\nconst x = 42;\n```', '```python\nprint("Hello, World!")\n```'],
        references: ['https://xats.org/docs/authoring-guide#code'],
      },
      {
        title: 'Tables',
        description: 'Create tables using markdown table syntax',
        examples: ['| Header 1 | Header 2 |', '|----------|----------|', '| Cell 1   | Cell 2   |'],
        references: ['https://xats.org/docs/authoring-guide#tables'],
      },
      {
        title: 'Images and Figures',
        description: 'Include images with captions',
        examples: ['![Alt text](image.jpg "Caption")'],
        references: ['https://xats.org/docs/authoring-guide#figures'],
      },
    ];
  }

  /**
   * Update parser options
   */
  updateOptions(newOptions: Partial<SimplifiedSyntaxOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }
}
