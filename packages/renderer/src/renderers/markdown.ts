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
      parts.push(this.renderStructuralContainer(document.frontMatter));
    }
    
    if (document.bodyMatter) {
      parts.push(this.renderStructuralContainer(document.bodyMatter));
    }
    
    if (document.backMatter) {
      parts.push(this.renderStructuralContainer(document.backMatter));
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
        const authors = bib.author.map(a => 
          a.literal || `${a.given || ''} ${a.family || ''}`.trim()
        ).join(', ');
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
      const heading = container.label && container.title 
        ? `${container.label}: ${container.title}`
        : container.label || container.title || '';
      
      if (heading) {
        parts.push(this.renderHeading(level, heading));
      }
    }
    
    if (container.contents) {
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
        return this.renderSemanticText(block.content);
      
      case 'heading':
        const level = block.content.level || 1;
        const text = this.renderSemanticText(block.content.text);
        return this.renderHeading(level + this.currentDepth, text);
      
      case 'list':
        return this.renderList(block.content);
      
      case 'blockquote':
        const quoted = this.renderSemanticText(block.content.text);
        return quoted.split('\n').map(line => `> ${line}`).join('\n');
      
      case 'codeBlock':
        const lang = block.content.language || '';
        const code = block.content.code;
        return '```' + lang + '\n' + code + '\n```';
      
      case 'mathBlock':
        return '$$\n' + block.content.math + '\n$$';
      
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
        const label = run.label || 'Reference';
        const target = run.targetId ? `#${run.targetId}` : '';
        return `[${label}](${target})`;
      
      case 'citation':
        return `[^${run.citationId}]`;
      
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
    const adjustedLevel = Math.min(6, Math.max(1, level + this.mdOptions.headingOffset));
    
    if (this.mdOptions.useSetext && adjustedLevel <= 2) {
      return adjustedLevel === 1 
        ? `${text}\n${'='.repeat(text.length)}`
        : `${text}\n${'-'.repeat(text.length)}`;
    }
    
    return '#'.repeat(adjustedLevel) + ' ' + text;
  }
  
  private getHeadingLevel(container: StructuralContainer): number {
    switch (container.type) {
      case 'unit':
        return 2;
      case 'chapter':
        return 3;
      case 'section':
        return 4;
      default:
        return 5;
    }
  }
  
  private renderList(content: any): string {
    const bullet = this.mdOptions.bulletChar;
    const items: string[] = [];
    
    content.items.forEach((item: any, index: number) => {
      const text = this.renderSemanticText(item);
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
}