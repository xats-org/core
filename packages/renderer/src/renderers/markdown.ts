import { BaseRenderer, type RendererOptions } from '../base-renderer.js';
import type {
  XatsDocument,
  Unit,
  Chapter,
  Section,
  ContentBlock,
  SemanticText,
  SemanticTextRun,
  StructuralContainer,
  FrontMatter,
  BodyMatter,
  BackMatter,
} from '@xats/types';

export interface MarkdownRendererOptions extends RendererOptions {
  headingOffset?: number;
  useSetext?: boolean;
  bulletChar?: '-' | '*' | '+';
}

/**
 * Markdown renderer for xats documents
 */
export class MarkdownRenderer extends BaseRenderer {
  protected mdOptions: MarkdownRendererOptions;
  private currentDepth: number = 0;
  
  constructor(options: MarkdownRendererOptions = {}) {
    super(options);
    this.mdOptions = {
      headingOffset: 0,
      useSetext: false,
      bulletChar: '-',
      ...options,
    };
  }
  
  render(document: XatsDocument): string {
    const parts: string[] = [];
    
    parts.push(this.renderMetadata(document));
    
    if (document.frontMatter) {
      parts.push(this.renderDocumentSection('frontmatter', document.frontMatter));
    }
    
    if (document.bodyMatter) {
      parts.push(this.renderDocumentSection('bodymatter', document.bodyMatter));
    }
    
    if (document.backMatter) {
      parts.push(this.renderDocumentSection('backmatter', document.backMatter));
    }
    
    return parts.filter(Boolean).join('\n\n');
  }
  
  renderMetadata(document: XatsDocument): string {
    const parts: string[] = [];
    
    if (document.bibliographicEntry) {
      const bib = document.bibliographicEntry;
      
      if (bib.title) {
        parts.push(this.renderHeading(1, bib.title));
      }
      
      if (bib.author && bib.author.length > 0) {
        const authors = bib.author.map(a => {
          if ('literal' in a && a.literal) {
            return a.literal;
          }
          return `${a.given || ''} ${a.family || ''}`.trim();
        }).join(', ');
        parts.push(`**Authors:** ${authors}`);
      }
      
      if (bib.publisher) {
        parts.push(`**Publisher:** ${bib.publisher}`);
      }
      
      if (bib.issued?.['date-parts']?.[0]) {
        const date = bib.issued['date-parts'][0].join('-');
        parts.push(`**Published:** ${date}`);
      }
      
      if (parts.length > 1) {
        parts.push('---');
      }
    }
    
    return parts.join('\n\n');
  }
  
  renderStructuralContainer(container: StructuralContainer): string {
    const parts: string[] = [];
    
    if (container.label || container.title) {
      const level = this.getHeadingLevel(container);
      const labelText = container.label || '';
      const titleText = container.title ? this.renderSemanticText(container.title) : '';
      const heading = labelText && titleText 
        ? `${labelText}: ${titleText}`
        : labelText || titleText || '';
      
      if (heading) {
        parts.push(this.renderHeading(level, heading));
      }
    }
    
    if ('contents' in container && container.contents && Array.isArray(container.contents)) {
      this.currentDepth++;
      parts.push(this.renderContents(container.contents));
      this.currentDepth--;
    }
    
    return parts.filter(Boolean).join('\n\n');
  }
  
  renderUnit(unit: Unit): string {
    return this.renderStructuralContainer(unit);
  }
  
  renderChapter(chapter: Chapter): string {
    return this.renderStructuralContainer(chapter);
  }
  
  renderSection(section: Section): string {
    return this.renderStructuralContainer(section);
  }
  
  renderContentBlock(block: ContentBlock): string {
    // Check for custom renderer
    const custom = this.applyCustomRenderer(block);
    if (custom) return custom;
    
    const typeName = this.getBlockTypeName(block.blockType);
    
    switch (typeName) {
      case 'paragraph':
        if (this.isSemanticText(block.content)) {
          return this.renderSemanticText(block.content);
        }
        return this.escapeText(String(block.content));
      
      case 'heading':
        if (this.isHeadingContent(block.content)) {
          const level = block.content.level || 1;
          const text = this.renderSemanticText(block.content.text);
          return this.renderHeading(level + this.currentDepth, text);
        }
        return this.renderHeading(2, this.escapeText(String(block.content)));
      
      case 'list':
        return this.renderList(block.content);
      
      case 'blockquote':
        if (this.isBlockquoteContent(block.content)) {
          const quoted = this.renderSemanticText(block.content.text);
          return quoted.split('\n').map(line => `> ${line}`).join('\n');
        }
        return `> ${this.escapeText(String(block.content))}`;
      
      case 'codeBlock':
        if (this.isCodeBlockContent(block.content)) {
          const lang = block.content.language || '';
          const code = block.content.code;
          return '```' + lang + '\n' + code + '\n```';
        }
        return '```\n' + String(block.content) + '\n```';
      
      case 'mathBlock':
        if (this.isMathBlockContent(block.content)) {
          return '$$\n' + block.content.math + '\n$$';
        }
        return '$$\n' + String(block.content) + '\n$$';
      
      case 'table':
        return this.renderTable(block.content);
      
      case 'figure':
        return this.renderFigure(block.content);
      
      case 'horizontalRule':
        return '---';
      
      default:
        // For unknown block types, render as code block with metadata
        return '```json\n' + JSON.stringify(block.content, null, 2) + '\n```';
    }
  }
  
  renderSemanticText(text: SemanticText): string {
    return text.runs.map(run => this.renderSemanticTextRun(run)).join('');
  }
  
  renderSemanticTextRun(run: SemanticTextRun): string {
    switch (run.type) {
      case 'text':
        return this.escapeText(run.text);
      
      case 'emphasis':
        return `*${this.escapeText(run.text)}*`;
      
      case 'strong':
        return `**${this.escapeText(run.text)}**`;
      
      case 'code':
        return `\`${run.text}\``;
      
      case 'subscript':
        return `~${this.escapeText(run.text)}~`;
      
      case 'superscript':
        return `^${this.escapeText(run.text)}^`;
      
      case 'strikethrough':
        return `~~${this.escapeText(run.text)}~~`;
      
      case 'underline':
        // Markdown doesn't have native underline, use HTML
        return `<u>${this.escapeText(run.text)}</u>`;
      
      case 'reference':
        const label = run.label || run.text || 'Reference';
        const target = run.ref ? `#${run.ref}` : '';
        return `[${label}](${target})`;
      
      case 'citation':
        return `[^${run.citeKey}]`;
      
      case 'mathInline':
        return `$${run.math}$`;
      
      default:
        return '';
    }
  }
  
  protected escapeText(text: string): string {
    // Escape markdown special characters
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\*/g, '\\*')
      .replace(/_/g, '\\_')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/\#/g, '\\#')
      .replace(/\+/g, '\\+')
      .replace(/\-/g, '\\-')
      .replace(/\./g, '\\.')
      .replace(/\!/g, '\\!');
  }
  
  private renderHeading(level: number, text: string): string {
    const adjustedLevel = Math.min(6, Math.max(1, level + (this.mdOptions.headingOffset ?? 0)));
    
    if (this.mdOptions.useSetext && adjustedLevel <= 2) {
      return adjustedLevel === 1 
        ? `${text}\n${'='.repeat(text.length)}`
        : `${text}\n${'-'.repeat(text.length)}`;
    }
    
    return '#'.repeat(adjustedLevel) + ' ' + text;
  }
  
  private getHeadingLevel(container: StructuralContainer): number {
    // Determine heading level based on container type
    if ('contents' in container) {
      const firstContent = Array.isArray(container.contents) ? container.contents[0] : null;
      if (firstContent && 'blockType' in firstContent) {
        return 4; // Sections
      } else if (firstContent && 'contents' in firstContent) {
        const nestedContent = Array.isArray(firstContent.contents) ? firstContent.contents[0] : null;
        if (nestedContent && 'blockType' in nestedContent) {
          return 3; // Chapters
        }
        return 2; // Units
      }
    }
    return 5; // Default for unknown types
  }
  
  private renderList(content: any): string {
    if (!content || !content.items || !Array.isArray(content.items)) {
      return String(content);
    }
    
    const bullet = this.mdOptions.bulletChar ?? '-';
    const items: string[] = [];
    
    content.items.forEach((item: any, index: number) => {
      const text = this.isSemanticText(item) ? this.renderSemanticText(item) : String(item);
      const prefix = content.ordered ? `${index + 1}.` : bullet;
      
      // Handle multi-line items
      const lines = text.split('\n');
      if (lines.length === 1) {
        items.push(`${prefix} ${lines[0]}`);
      } else {
        items.push(`${prefix} ${lines[0]}`);
        lines.slice(1).forEach(line => {
          items.push(`   ${line}`);
        });
      }
    });
    
    return items.join('\n');
  }
  
  private renderTable(content: any): string {
    const parts: string[] = [];
    
    if (content.caption) {
      parts.push(`_${this.renderSemanticText(content.caption)}_`);
      parts.push('');
    }
    
    // Headers
    if (content.headers && content.headers.length > 0) {
      const headers = content.headers.map((h: any) => this.renderSemanticText(h));
      parts.push('| ' + headers.join(' | ') + ' |');
      parts.push('|' + headers.map(() => ' --- ').join('|') + '|');
    }
    
    // Rows
    if (content.rows && content.rows.length > 0) {
      for (const row of content.rows) {
        const cells = row.map((c: any) => this.renderSemanticText(c));
        parts.push('| ' + cells.join(' | ') + ' |');
      }
    }
    
    return parts.join('\n');
  }
  
  private renderFigure(content: any): string {
    const parts: string[] = [];
    
    if (content.src) {
      const alt = content.alt || 'Figure';
      parts.push(`![${alt}](${content.src})`);
    }
    
    if (content.caption) {
      parts.push(`_${this.renderSemanticText(content.caption)}_`);
    }
    
    return parts.join('\n\n');
  }

  private renderDocumentSection(
    sectionType: 'frontmatter' | 'bodymatter' | 'backmatter',
    section: FrontMatter | BodyMatter | BackMatter
  ): string {
    const parts: string[] = [];
    
    if (sectionType === 'bodymatter' && 'contents' in section && Array.isArray(section.contents)) {
      return this.renderContents(section.contents);
    } else {
      // Handle FrontMatter and BackMatter properties
      Object.entries(section).forEach(([key, value]) => {
        if (key !== 'contents' && Array.isArray(value)) {
          parts.push(this.renderHeading(2, this.formatSectionTitle(key)));
          parts.push(value.map(block => this.renderContentBlock(block)).join('\n\n'));
        }
      });
    }
    
    return parts.filter(Boolean).join('\n\n');
  }

  private formatSectionTitle(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  }

  // Type guard methods
  private isSemanticText(content: unknown): content is SemanticText {
    return (
      typeof content === 'object' &&
      content !== null &&
      'runs' in content &&
      Array.isArray((content as any).runs)
    );
  }

  private isHeadingContent(content: unknown): content is { level?: number; text: SemanticText } {
    return (
      typeof content === 'object' &&
      content !== null &&
      'text' in content &&
      this.isSemanticText((content as any).text)
    );
  }

  private isBlockquoteContent(content: unknown): content is { text: SemanticText } {
    return (
      typeof content === 'object' &&
      content !== null &&
      'text' in content &&
      this.isSemanticText((content as any).text)
    );
  }

  private isCodeBlockContent(content: unknown): content is { code: string; language?: string } {
    return (
      typeof content === 'object' &&
      content !== null &&
      'code' in content &&
      typeof (content as any).code === 'string'
    );
  }

  private isMathBlockContent(content: unknown): content is { math: string } {
    return (
      typeof content === 'object' &&
      content !== null &&
      'math' in content &&
      typeof (content as any).math === 'string'
    );
  }
}