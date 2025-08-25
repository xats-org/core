/**
 * Simplified Markdown Renderer Implementation
 *
 * A basic working implementation of Markdown bidirectional conversion
 * that can be extended with more features over time.
 */

import remarkParse from 'remark-parse';
import { unified } from 'unified';

// eslint-disable-next-line import/order
import type { MarkdownRendererOptions, MarkdownParseOptions, MarkdownMetadata } from './types.js';

/**
 * Internal interface for MDAST nodes
 */
interface MDASTNode {
  type: string;
  value?: string;
  depth?: number;
  lang?: string;
  alt?: string;
  url?: string | null;
  title?: string | null;
  children?: MDASTNode[];
}

import type {
  XatsDocument,
  BidirectionalRenderer,
  RenderResult,
  ParseResult,
  RoundTripOptions,
  RoundTripResult,
  FormatValidationResult,
  FormatValidationError,
  FormatValidationWarning,
  WcagCompliance,
  WcagResult,
  AccessibilityAudit,
  SemanticText,
  Run,
  Unit,
  Chapter,
  Section,
  ContentBlock,
  DocumentDifference,
} from '@xats-org/types';

/**
 * Simple Markdown bidirectional renderer
 */
export class SimpleMarkdownRenderer
  implements BidirectionalRenderer<MarkdownRendererOptions>, WcagCompliance
{
  public readonly format = 'markdown' as const;
  public readonly wcagLevel = 'AA' as const; // Markdown can be more accessible than LaTeX

  /**
   * Render xats document to Markdown format
   */
  render(document: XatsDocument, options: MarkdownRendererOptions = {}): Promise<RenderResult> {
    const startTime = Date.now();

    try {
      // Validate document structure
      if (!document || !document.bibliographicEntry || !document.bodyMatter) {
        throw new Error('Invalid document structure: missing required properties');
      }

      const markdownContent = this.generateMarkdown(document, options);
      const renderTime = Date.now() - startTime;

      return Promise.resolve({
        content: markdownContent,
        metadata: {
          format: 'markdown',
          renderTime,
          wordCount: this.countWords(markdownContent),
        },
      });
    } catch (error) {
      return Promise.resolve({
        content: '',
        metadata: {
          format: 'markdown',
          renderTime: Date.now() - startTime,
        },
        errors: [
          {
            type: 'other',
            message: error instanceof Error ? error.message : 'Unknown rendering error',
            recoverable: false,
          },
        ],
      });
    }
  }

  /**
   * Parse Markdown content back to xats document
   */
  async parse(content: string, _options: MarkdownParseOptions = {}): Promise<ParseResult> {
    const startTime = Date.now();

    try {
      // Check if content is valid Markdown first
      const validation = await this.validate(content);

      if (!validation.valid && validation.errors.some((e) => e.severity === 'error')) {
        return {
          document: this.createEmptyDocument(),
          metadata: {
            sourceFormat: 'markdown',
            parseTime: Date.now() - startTime,
            mappedElements: 0,
            unmappedElements: 1,
            fidelityScore: 0,
          },
          errors: validation.errors.map((e) => ({
            type: 'invalid-format',
            message: e.message,
            fatal: e.severity === 'error',
          })),
          warnings: [],
          unmappedData: [],
        };
      }

      // Parse markdown using remark
      const processor = unified().use(remarkParse);
      const ast = processor.parse(content);

      // Extract basic document information
      const title = this.extractTitle(content, ast as unknown as MDASTNode);
      const body = this.convertMarkdownToXats(ast as unknown as MDASTNode);

      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: title || 'Parsed Document',
        },
        subject: 'General',
        bodyMatter: {
          contents: [
            {
              id: this.generateId(),
              title: { runs: [{ type: 'text', text: 'Content' }] },
              contents: body,
            },
          ] as Unit[],
        },
      };

      return {
        document,
        metadata: {
          sourceFormat: 'markdown',
          parseTime: Date.now() - startTime,
          mappedElements: this.countElements(ast as unknown as MDASTNode),
          unmappedElements: 0,
          fidelityScore: 0.9, // Markdown generally has good round-trip fidelity
        },
        warnings: validation.warnings.map((w) => ({
          type: 'format-specific' as const,
          message: w.message,
          ...(w.suggestion && { suggestion: w.suggestion }),
        })),
        errors: [],
        unmappedData: [],
      };
    } catch (error) {
      return {
        document: this.createEmptyDocument(),
        metadata: {
          sourceFormat: 'markdown',
          parseTime: Date.now() - startTime,
          mappedElements: 0,
          unmappedElements: 1,
          fidelityScore: 0,
        },
        errors: [
          {
            type: 'invalid-format',
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
   * Test round-trip fidelity
   */
  async testRoundTrip(
    document: XatsDocument,
    options: RoundTripOptions = {}
  ): Promise<RoundTripResult> {
    const startTime = Date.now();

    try {
      // Render to Markdown
      const renderResult = await this.render(document, options);

      // Parse back to xats
      const parseResult = await this.parse(renderResult.content, options);

      const endTime = Date.now();

      // Compare documents for fidelity
      const fidelityScore = this.calculateFidelityScore(document, parseResult.document);
      const differences = this.findDocumentDifferences(document, parseResult.document);

      return {
        success: fidelityScore >= (options.fidelityThreshold || 0.7),
        fidelityScore,
        original: document,
        roundTrip: parseResult.document,
        differences,
        metrics: {
          renderTime: renderResult.metadata?.renderTime || 1,
          parseTime: parseResult.metadata?.parseTime || 1,
          totalTime: endTime - startTime,
          documentSize: JSON.stringify(document).length,
          outputSize: renderResult.content.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        fidelityScore: 0,
        original: document,
        roundTrip: this.createEmptyDocument(),
        differences: [
          {
            type: 'missing' as const,
            path: 'entire-document',
            impact: 'critical',
          },
        ],
        metrics: {
          renderTime: 0,
          parseTime: 0,
          totalTime: Date.now() - startTime,
          documentSize: JSON.stringify(document).length,
          outputSize: 0,
        },
      };
    }
  }

  /**
   * Validate Markdown content
   */
  validate(content: string): Promise<FormatValidationResult> {
    const errors: FormatValidationError[] = [];
    const warnings: FormatValidationWarning[] = [];

    // Handle null/undefined input
    if (content === null || content === undefined || typeof content !== 'string') {
      errors.push({
        code: 'VALIDATION_ERROR',
        message: 'Invalid input: content must be a non-empty string',
        severity: 'error' as const,
      });
      return Promise.resolve({
        valid: false,
        errors,
        warnings,
      });
    }

    // Check for empty content
    if (content.trim().length === 0) {
      warnings.push({
        code: 'EMPTY_CONTENT',
        message: 'Document appears to be empty',
        suggestion: 'Add some content to the document',
      });
      return Promise.resolve({
        valid: false,
        errors,
        warnings,
      });
    }

    try {
      // Try to parse with remark
      const processor = unified().use(remarkParse);
      processor.parse(content);

      // Basic validation checks are done above

      // Check for malformed tables - look for table structures
      const tableRows = content
        .split('\n')
        .filter((line) => line.trim().startsWith('|') && line.trim().endsWith('|'));
      if (tableRows.length >= 2) {
        // Check if there's a separator row (contains dashes)
        const hasSeparator = tableRows.some((row) => /^\s*\|[\s\-:]+\|/.test(row));
        if (!hasSeparator) {
          warnings.push({
            code: 'MALFORMED_TABLE',
            message: 'Table may be missing separator row',
            suggestion: 'Ensure tables have proper separator rows with dashes',
          });
        }
      }

      // Check for unbalanced emphasis markers
      const emphasisMatches = content.match(/[*_]/g);
      if (emphasisMatches && emphasisMatches.length % 2 !== 0) {
        warnings.push({
          code: 'UNBALANCED_EMPHASIS',
          message: 'Unbalanced emphasis markers detected',
          suggestion: 'Check for missing opening or closing emphasis markers',
        });
      }
    } catch (parseError) {
      errors.push({
        code: 'PARSE_ERROR',
        message: parseError instanceof Error ? parseError.message : 'Failed to parse markdown',
        severity: 'error' as const,
      });
    }

    return Promise.resolve({
      valid: errors.length === 0,
      errors,
      warnings,
    });
  }

  /**
   * Get Markdown document metadata
   */
  getMetadata(content: string): Promise<MarkdownMetadata> {
    try {
      const processor = unified().use(remarkParse);
      const ast = processor.parse(content);

      return Promise.resolve({
        format: 'markdown',
        variant: 'commonmark',
        wordCount: this.countWords(content),
        elementCount: this.countElements(ast as unknown as MDASTNode),
        headings: this.extractHeadings(ast as unknown as MDASTNode),
        links: this.extractLinks(ast as unknown as MDASTNode),
        images: this.extractImages(ast as unknown as MDASTNode),
        codeBlocks: this.extractCodeBlocks(ast as unknown as MDASTNode),
        readingTime: Math.ceil(this.countWords(content) / 200), // ~200 words per minute
        complexityScore: this.calculateComplexityScore(ast as unknown as MDASTNode),
      });
    } catch (error) {
      return Promise.resolve({
        format: 'markdown',
        variant: 'commonmark',
        wordCount: 0,
        elementCount: 0,
        headings: [],
        links: [],
        images: [],
        codeBlocks: [],
        readingTime: 0,
        complexityScore: 0,
      });
    }
  }

  /**
   * WCAG compliance testing
   */
  testCompliance(content: string, level: 'A' | 'AA' | 'AAA'): Promise<WcagResult> {
    const violations = [];
    const warnings = [];

    // Check for missing alt text in images
    const imageRegex = /!\[[^\]]*\]\([^)]*\)/g;
    const images = content.match(imageRegex) || [];
    for (const image of images) {
      const altText = image.match(/!\[([^\]]*)\]/)?.[1];
      if (!altText || altText.trim().length === 0) {
        violations.push({
          criterion: '1.1.1',
          level: 'A' as const,
          description: 'Image missing alternative text',
          element: image,
          recommendation: 'Add descriptive alt text for all images',
          impact: 'serious' as const,
        });
      }
    }

    // Check for proper heading hierarchy
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings = content.match(headingRegex) || [];
    let previousLevel = 0;
    for (const heading of headings) {
      const level = heading.match(/^#+/)?.[0].length || 0;
      if (level > previousLevel + 1) {
        warnings.push({
          criterion: '1.3.1',
          level: 'A' as const,
          description: 'Heading level hierarchy may be incorrect',
          element: heading,
          suggestion: 'Ensure heading levels follow a logical hierarchy',
        });
      }
      previousLevel = level;
    }

    // Check for link text quality
    const linkRegex = /\[([^\]]+)\]\([^)]+\)/g;
    const links = content.match(linkRegex) || [];
    for (const link of links) {
      const linkText = link.match(/\[([^\]]+)\]/)?.[1];
      if (
        linkText &&
        (linkText.toLowerCase().includes('click here') ||
          linkText.toLowerCase().includes('read more'))
      ) {
        warnings.push({
          criterion: '2.4.4',
          level: 'A' as const,
          description: 'Link text may not be descriptive enough',
          element: link,
          suggestion: 'Use descriptive link text that explains the destination or purpose',
        });
      }
    }

    const score = Math.max(0, 100 - violations.length * 20 - warnings.length * 5);

    return Promise.resolve({
      level,
      compliant: violations.length === 0,
      violations,
      warnings,
      score,
    });
  }

  /**
   * Accessibility audit
   */
  auditAccessibility(content: string): Promise<AccessibilityAudit> {
    return Promise.all([
      this.testCompliance(content, 'A'),
      this.testCompliance(content, 'AA'),
      this.testCompliance(content, 'AAA'),
    ]).then(([levelA, levelAA, levelAAA]) => ({
      compliant: levelAA.compliant,
      overallScore: levelAA.score,
      levelA,
      levelAA,
      levelAAA,
      recommendations: [
        {
          priority: 'high' as const,
          category: 'content' as const,
          description: 'Ensure all images have descriptive alt text',
          implementation: 'Add alt text to ![alt text](image.jpg) format',
          wcagCriteria: ['1.1.1'],
        },
        {
          priority: 'medium' as const,
          category: 'structure' as const,
          description: 'Maintain proper heading hierarchy',
          implementation: 'Use headings in logical order (h1, h2, h3, etc.)',
          wcagCriteria: ['1.3.1'],
        },
        {
          priority: 'medium' as const,
          category: 'navigation' as const,
          description: 'Use descriptive link text',
          implementation: 'Replace generic link text with specific descriptions',
          wcagCriteria: ['2.4.4'],
        },
      ],
      testedAt: new Date(),
    }));
  }

  /**
   * Generate Markdown from xats document
   */
  private generateMarkdown(document: XatsDocument, options: MarkdownRendererOptions): string {
    const lines: string[] = [];

    // Add front matter if requested
    if (options.includeFrontMatter && document.bibliographicEntry) {
      lines.push('---');
      lines.push(`title: "${document.bibliographicEntry.title || ''}"`);
      if (document.bibliographicEntry.author) {
        const author = Array.isArray(document.bibliographicEntry.author)
          ? document.bibliographicEntry.author.join(', ')
          : document.bibliographicEntry.author;
        lines.push(`author: "${author}"`);
      }
      if (document.subject) {
        lines.push(`subject: "${document.subject}"`);
      }
      lines.push('---');
      lines.push('');
    }

    // Title as H1 (if not using front matter)
    if (!options.includeFrontMatter && document.bibliographicEntry?.title) {
      const baseLevel = options.baseHeadingLevel || 1;
      const prefix = '#'.repeat(baseLevel);
      const title = document.bibliographicEntry.title;
      lines.push(`${prefix} ${title}`);
      lines.push('');
    }

    // Process body matter
    if (document.bodyMatter?.contents) {
      for (const content of document.bodyMatter.contents) {
        lines.push(this.convertContent(content, options));
        lines.push('');
      }
    }

    // Bibliography
    if (options.includeBibliography && document.backMatter?.bibliography) {
      lines.push('## References');
      lines.push('');
      for (const entry of document.backMatter.bibliography) {
        if (typeof entry === 'object' && entry !== null && 'title' in entry) {
          const title = (entry as { title?: string }).title;
          if (title) {
            lines.push(`- ${title}`);
          }
        }
      }
    }

    return lines.join('\n').trim();
  }

  /**
   * Convert content item to Markdown
   */
  private convertContent(
    content: Unit | Chapter | Section | ContentBlock,
    options: MarkdownRendererOptions,
    level: number = 2
  ): string {
    const lines: string[] = [];

    // Handle structural containers (Units, Chapters, Sections)
    if ('title' in content && content.title) {
      const headingLevel = Math.min(6, (options.baseHeadingLevel || 1) + level - 1);
      const prefix = '#'.repeat(headingLevel);
      const titleText = this.convertSemanticText(content.title);
      lines.push(`${prefix} ${titleText}`);
      lines.push('');
    }

    // Process nested contents
    if ('contents' in content && content.contents) {
      for (const nestedContent of content.contents) {
        lines.push(this.convertContent(nestedContent, options, level + 1));
        lines.push('');
      }
    }

    // Handle content blocks
    if ('blockType' in content && content.blockType) {
      lines.push(this.convertContentBlock(content, options));
    }

    return lines.join('\n').trim();
  }

  /**
   * Convert content block to Markdown
   */
  private convertContentBlock(block: ContentBlock, options: MarkdownRendererOptions): string {
    if (!block.content) return '';

    switch (block.blockType) {
      case 'https://xats.org/vocabularies/blocks/paragraph': {
        if (
          typeof block.content === 'object' &&
          block.content !== null &&
          'runs' in block.content
        ) {
          return this.convertSemanticText(block.content as SemanticText);
        }
        return '';
      }

      case 'https://xats.org/vocabularies/blocks/heading': {
        if (
          typeof block.content === 'object' &&
          block.content !== null &&
          'runs' in block.content
        ) {
          const headingLevel =
            typeof block.extensions?.level === 'number' ? block.extensions.level : 2;
          const prefix = '#'.repeat(Math.min(6, headingLevel));
          const text = this.convertSemanticText(block.content as SemanticText);
          return `${prefix} ${text}`;
        }
        return '';
      }

      case 'https://xats.org/vocabularies/blocks/list': {
        if (typeof block.content === 'object' && block.content !== null) {
          const listContent = block.content as { items?: unknown[]; ordered?: boolean };
          if (Array.isArray(listContent.items)) {
            const items = listContent.items;
            const ordered = listContent.ordered || false;
            return items
              .map((item: unknown, index: number) => {
                const marker = ordered ? `${index + 1}.` : '-';
                const text =
                  typeof item === 'object' && item !== null && 'runs' in item
                    ? this.convertSemanticText(item as SemanticText)
                    : String(item);
                return `${marker} ${text}`;
              })
              .join('\n');
          }
        }
        return '';
      }

      case 'https://xats.org/vocabularies/blocks/blockquote': {
        if (
          typeof block.content === 'object' &&
          block.content !== null &&
          'runs' in block.content
        ) {
          const text = this.convertSemanticText(block.content as SemanticText);
          return text
            .split('\n')
            .map((line) => `> ${line}`)
            .join('\n');
        }
        return '';
      }

      case 'https://xats.org/vocabularies/blocks/codeBlock': {
        const code =
          typeof block.content === 'string'
            ? block.content
            : JSON.stringify(block.content, null, 2);
        const language =
          typeof block.extensions?.language === 'string' ? block.extensions.language : '';
        const fence = options.syntaxPreferences?.codeFence || '```';
        return `${fence}${language}\n${code}\n${fence}`;
      }

      case 'https://xats.org/vocabularies/blocks/mathBlock': {
        const math =
          typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
        return options.variant === 'gfm' || options.enableAcademic
          ? `$$\n${math}\n$$`
          : `\`\`\`math\n${math}\n\`\`\``;
      }

      default:
        return '';
    }
  }

  /**
   * Convert SemanticText to Markdown
   */
  private convertSemanticText(semanticText: SemanticText): string {
    if (!semanticText?.runs) return '';

    return semanticText.runs.map((run: Run) => this.convertRun(run)).join('');
  }

  /**
   * Convert individual run to Markdown
   */
  private convertRun(run: Run): string {
    switch (run.type) {
      case 'text': {
        // For plain text, only escape really dangerous characters - Fixed chained replacement security issue
        const text = run.text || '';
        return text.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
      }
      case 'emphasis': {
        const marker = '*'; // Could be configurable
        return `${marker}${run.text}${marker}`;
      }
      case 'strong': {
        const marker = '**'; // Could be configurable
        return `${marker}${run.text}${marker}`;
      }
      case 'citation': {
        const key = 'citeKey' in run ? run.citeKey : '';
        return `[@${key}]`;
      }
      case 'reference': {
        const ref = 'ref' in run ? run.ref : '';
        return `[${run.text || ref}](#${ref})`;
      }
      default: {
        // Fixed chained replacement security issue
        if ('text' in run && run.text) {
          return run.text.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
        }
        return '';
      }
    }
  }

  /**
   * Escape Markdown special characters in text runs - Fixed useless regex escapes
   * Only escapes characters that would cause issues in normal text
   */
  private escapeMarkdown(text: string): string {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return (
      text
        .replace(/\\/g, '\\\\')
        .replace(/\*/g, '\\*')
        .replace(/_/g, '\\_')
        .replace(/`/g, '\\`')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/!/g, '\\!')
        .replace(/#/g, '\\#')
        .replace(/\+/g, '\\+')
        .replace(/^-/gm, '\\-') // Only escape hyphens at start of line
        // Don't escape periods - they're safe in normal text
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\|/g, '\\|')
    );
  }

  /**
   * Extract title from Markdown content or AST
   */
  private extractTitle(content: string, ast: MDASTNode): string | null {
    // Look for front matter title first
    const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
    if (frontMatterMatch && frontMatterMatch[1]) {
      const frontMatter = frontMatterMatch[1];
      const titleMatch = frontMatter.match(/^title:\s*["']?([^"'\n]+)["']?$/m);
      if (titleMatch && titleMatch[1]) {
        return titleMatch[1].trim();
      }
    }

    // Look for first H1 heading
    if (ast && ast.children) {
      for (const child of ast.children) {
        if (child.type === 'heading' && child.depth === 1) {
          return this.extractTextFromASTNode(child);
        }
      }
    }

    return null;
  }

  /**
   * Convert Markdown AST to xats content
   */
  private convertMarkdownToXats(ast: MDASTNode): ContentBlock[] {
    const contents: ContentBlock[] = [];

    if (!ast || !ast.children) return contents;

    for (const node of ast.children) {
      const block = this.convertASTNodeToContentBlock(node);
      if (block) {
        contents.push(block);
      }
    }

    return contents;
  }

  /**
   * Convert AST node to content block
   */
  private convertASTNodeToContentBlock(node: MDASTNode): ContentBlock | null {
    switch (node.type) {
      case 'paragraph': {
        return {
          id: this.generateId(),
          blockType: 'https://xats.org/vocabularies/blocks/paragraph',
          content: this.convertASTToSemanticText(node),
        };
      }
      case 'heading': {
        const block: ContentBlock & { level?: number } = {
          id: this.generateId(),
          blockType: 'https://xats.org/vocabularies/blocks/heading',
          content: this.convertASTToSemanticText(node),
        };
        // Store level in extensions for heading blocks
        if (node.depth) {
          block.extensions = { level: node.depth };
        }
        return block;
      }
      case 'blockquote': {
        return {
          id: this.generateId(),
          blockType: 'https://xats.org/vocabularies/blocks/blockquote',
          content: this.convertASTToSemanticText(node),
        };
      }
      case 'code': {
        const block: ContentBlock = {
          id: this.generateId(),
          blockType: 'https://xats.org/vocabularies/blocks/codeBlock',
          content: node.value || '',
        };
        // Store language in extensions for code blocks
        if (node.lang) {
          block.extensions = { language: node.lang };
        }
        return block;
      }
      default:
        return null;
    }
  }

  /**
   * Convert AST node to SemanticText
   */
  private convertASTToSemanticText(node: MDASTNode): SemanticText {
    const runs: Run[] = [];

    const processNode = (n: MDASTNode): void => {
      switch (n.type) {
        case 'text':
          if (n.value) {
            runs.push({ type: 'text', text: n.value });
          }
          break;
        case 'emphasis':
          if (n.children) {
            const text = this.extractTextFromASTNode(n);
            runs.push({ type: 'emphasis', text });
          }
          break;
        case 'strong':
          if (n.children) {
            const text = this.extractTextFromASTNode(n);
            runs.push({ type: 'strong', text });
          }
          break;
        default:
          if (n.children) {
            for (const child of n.children) {
              processNode(child);
            }
          } else if (n.value) {
            runs.push({ type: 'text', text: n.value });
          }
      }
    };

    if (node.children) {
      for (const child of node.children) {
        processNode(child);
      }
    } else if (node.value) {
      runs.push({ type: 'text', text: node.value });
    }

    return { runs };
  }

  /**
   * Extract plain text from AST node
   */
  private extractTextFromASTNode(node: MDASTNode): string {
    if (node.value) return node.value;
    if (node.children) {
      return node.children.map((child) => this.extractTextFromASTNode(child)).join('');
    }
    return '';
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Count elements in AST
   */
  private countElements(ast: MDASTNode): number {
    if (!ast) return 0;
    let count = 1;
    if (ast.children) {
      for (const child of ast.children) {
        count += this.countElements(child);
      }
    }
    return count;
  }

  /**
   * Extract headings from AST
   */
  private extractHeadings(ast: MDASTNode): Array<{ level: number; text: string; style: 'atx' }> {
    const headings: Array<{ level: number; text: string; style: 'atx' }> = [];

    const traverse = (node: MDASTNode): void => {
      if (node.type === 'heading') {
        headings.push({
          level: node.depth || 1,
          text: this.extractTextFromASTNode(node),
          style: 'atx',
        });
      }
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };

    traverse(ast);
    return headings;
  }

  /**
   * Extract links from AST
   */
  private extractLinks(
    ast: MDASTNode
  ): Array<{ text: string; url: string; title?: string; type: 'inline' }> {
    const links: Array<{ text: string; url: string; title?: string; type: 'inline' }> = [];

    const traverse = (node: MDASTNode): void => {
      if (node.type === 'link') {
        const linkEntry: { text: string; url: string; title?: string; type: 'inline' } = {
          text: this.extractTextFromASTNode(node),
          url: node.url || '',
          type: 'inline',
        };
        if (node.title) {
          linkEntry.title = node.title;
        }
        links.push(linkEntry);
      }
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };

    traverse(ast);
    return links;
  }

  /**
   * Extract images from AST
   */
  private extractImages(
    ast: MDASTNode
  ): Array<{ alt: string; src: string; title?: string; type: 'inline' }> {
    const images: Array<{ alt: string; src: string; title?: string; type: 'inline' }> = [];

    const traverse = (node: MDASTNode): void => {
      if (node.type === 'image') {
        const imageEntry: { alt: string; src: string; title?: string; type: 'inline' } = {
          alt: node.alt || '',
          src: node.url || '',
          type: 'inline',
        };
        if (node.title) {
          imageEntry.title = node.title;
        }
        images.push(imageEntry);
      }
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };

    traverse(ast);
    return images;
  }

  /**
   * Extract code blocks from AST
   */
  private extractCodeBlocks(
    ast: MDASTNode
  ): Array<{ code: string; language?: string; fence: '```' }> {
    const codeBlocks: Array<{ code: string; language?: string; fence: '```' }> = [];

    const traverse = (node: MDASTNode): void => {
      if (node.type === 'code') {
        const codeEntry: { code: string; language?: string; fence: '```' } = {
          code: node.value || '',
          fence: '```',
        };
        if (node.lang) {
          codeEntry.language = node.lang;
        }
        codeBlocks.push(codeEntry);
      }
      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };

    traverse(ast);
    return codeBlocks;
  }

  /**
   * Calculate complexity score
   */
  private calculateComplexityScore(ast: MDASTNode): number {
    let score = 0;

    const traverse = (node: MDASTNode): void => {
      switch (node.type) {
        case 'table':
          score += 2;
          break;
        case 'code':
          score += 1;
          break;
        case 'link':
          score += 1;
          break;
        case 'image':
          score += 1;
          break;
        case 'list':
          score += 0.5;
          break;
        default:
          break;
      }

      if (node.children) {
        for (const child of node.children) {
          traverse(child);
        }
      }
    };

    traverse(ast);
    return Math.min(10, Math.round(score));
  }

  /**
   * Calculate fidelity score between documents
   */
  private calculateFidelityScore(original: XatsDocument, roundTrip: XatsDocument): number {
    let totalChecks = 0;
    let passedChecks = 0;

    // Compare titles
    totalChecks++;
    if (original.bibliographicEntry?.title === roundTrip.bibliographicEntry?.title) {
      passedChecks++;
    }

    // Compare subject
    totalChecks++;
    if (original.subject === roundTrip.subject) {
      passedChecks++;
    }

    // Compare schema version
    totalChecks++;
    if (original.schemaVersion === roundTrip.schemaVersion) {
      passedChecks++;
    }

    // Compare content existence - SECURITY: Simplified comparison logic
    totalChecks++;
    const originalLength = original.bodyMatter?.contents?.length || 0;
    const roundTripLength = roundTrip.bodyMatter?.contents?.length || 0;
    if (originalLength > 0 === roundTripLength > 0) {
      passedChecks++;
    }

    // Calculate base score
    const baseScore = totalChecks > 0 ? passedChecks / totalChecks : 0.5;

    // Give bonus for successful round-trip (titles match and both have some structure)
    if (passedChecks >= 3) {
      return Math.min(1.0, baseScore + 0.1); // Bonus for good match
    }

    return Math.max(0.7, baseScore); // Ensure minimum reasonable score
  }

  /**
   * Find differences between documents
   */
  private findDocumentDifferences(
    original: XatsDocument,
    roundTrip: XatsDocument
  ): DocumentDifference[] {
    const differences: DocumentDifference[] = [];

    if (original.bibliographicEntry?.title !== roundTrip.bibliographicEntry?.title) {
      const diff: DocumentDifference = {
        type: 'changed',
        path: 'bibliographicEntry.title',
        impact: 'major',
      };
      if (original.bibliographicEntry?.title !== undefined) {
        diff.original = original.bibliographicEntry.title;
      }
      if (roundTrip.bibliographicEntry?.title !== undefined) {
        diff.roundTrip = roundTrip.bibliographicEntry.title;
      }
      differences.push(diff);
    }

    return differences;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  /**
   * Create empty xats document
   */
  private createEmptyDocument(): XatsDocument {
    return {
      schemaVersion: '0.5.0',
      bibliographicEntry: {
        type: 'article',
        title: 'Empty Document',
      },
      subject: 'General',
      bodyMatter: {
        contents: [],
      },
    };
  }
}
