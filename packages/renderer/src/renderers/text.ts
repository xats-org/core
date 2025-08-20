import { BaseRenderer, type RendererOptions } from '../base-renderer.js';
import { extractPlainText } from '@xats/utils';
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

export interface TextRendererOptions extends RendererOptions {
  lineWidth?: number;
  indentSize?: number;
  sectionSeparator?: string;
}

/**
 * Plain text renderer for xats documents
 */
export class TextRenderer extends BaseRenderer {
  protected textOptions: TextRendererOptions;
  private currentIndent: number = 0;
  
  constructor(options: TextRendererOptions = {}) {
    super(options);
    this.textOptions = {
      lineWidth: 80,
      indentSize: 2,
      sectionSeparator: '\n' + '='.repeat(60) + '\n',
      ...options,
    };
  }
  
  render(document: XatsDocument): string {
    const parts: string[] = [];
    
    parts.push(this.renderMetadata(document));
    
    if (document.frontMatter) {
      parts.push(this.textOptions.sectionSeparator);
      parts.push(this.renderStructuralContainer(document.frontMatter));
    }
    
    if (document.bodyMatter) {
      parts.push(this.textOptions.sectionSeparator);
      parts.push(this.renderStructuralContainer(document.bodyMatter));
    }
    
    if (document.backMatter) {
      parts.push(this.textOptions.sectionSeparator);
      parts.push(this.renderStructuralContainer(document.backMatter));
    }
    
    return parts.filter(Boolean).join('\n');
  }
  
  renderMetadata(document: XatsDocument): string {
    const parts: string[] = [];
    
    if (document.bibliographicEntry) {
      const bib = document.bibliographicEntry;
      
      if (bib.title) {
        parts.push(this.center(bib.title.toUpperCase()));
        parts.push('');
      }
      
      if (bib.author && bib.author.length > 0) {
        const authors = bib.author.map(a => 
          a.literal || `${a.given || ''} ${a.family || ''}`.trim()
        ).join(', ');
        parts.push(this.center(authors));
        parts.push('');
      }
      
      if (bib.publisher) {
        parts.push(this.center(bib.publisher));
      }
      
      if (bib.issued?.['date-parts']?.[0]) {
        const date = bib.issued['date-parts'][0].join('-');
        parts.push(this.center(date));
      }
    }
    
    return parts.join('\n');
  }
  
  renderStructuralContainer(container: StructuralContainer): string {
    const parts: string[] = [];
    
    if (container.label || container.title) {
      const heading = this.formatHeading(container);
      if (heading) {
        parts.push(heading);
        parts.push('');
      }
    }
    
    if (container.contents) {
      this.currentIndent++;
      const content = this.renderContents(container.contents);
      this.currentIndent--;
      
      if (content) {
        parts.push(this.indent(content));
      }
    }
    
    return parts.filter(Boolean).join('\n');
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
        return this.wrapText(this.renderSemanticText(block.content));
      
      case 'heading':
        const text = this.renderSemanticText(block.content.text);
        return this.formatBlockHeading(text, block.content.level || 1);
      
      case 'list':
        return this.renderList(block.content);
      
      case 'blockquote':
        const quoted = this.renderSemanticText(block.content.text);
        return this.indentBlock(quoted, '  | ');
      
      case 'codeBlock':
        return this.renderCodeBlock(block.content);
      
      case 'mathBlock':
        return this.renderMathBlock(block.content);
      
      case 'table':
        return this.renderTable(block.content);
      
      case 'figure':
        return this.renderFigure(block.content);
      
      case 'horizontalRule':
        return '-'.repeat(this.textOptions.lineWidth);
      
      default:
        return `[${typeName}]`;
    }
  }
  
  renderSemanticText(text: SemanticText): string {
    return extractPlainText(text);
  }
  
  renderSemanticTextRun(run: SemanticTextRun): string {
    switch (run.type) {
      case 'text':
      case 'emphasis':
      case 'strong':
      case 'code':
      case 'subscript':
      case 'superscript':
      case 'strikethrough':
      case 'underline':
        return run.text;
      
      case 'reference':
        return run.label || '[ref]';
      
      case 'citation':
        return `[${run.citationId}]`;
      
      case 'mathInline':
        return run.math;
      
      default:
        return '';
    }
  }
  
  protected escapeText(text: string): string {
    // Plain text doesn't need escaping
    return text;
  }
  
  private center(text: string): string {
    const width = this.textOptions.lineWidth;
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }
  
  private indent(text: string, prefix?: string): string {
    const indentStr = prefix || ' '.repeat(this.currentIndent * this.textOptions.indentSize);
    return text.split('\n').map(line => indentStr + line).join('\n');
  }
  
  private indentBlock(text: string, prefix: string): string {
    return text.split('\n').map(line => prefix + line).join('\n');
  }
  
  private wrapText(text: string): string {
    const width = this.textOptions.lineWidth - (this.currentIndent * this.textOptions.indentSize);
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if (currentLine.length + word.length + 1 <= width) {
        currentLine = currentLine ? `${currentLine} ${word}` : word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    
    if (currentLine) lines.push(currentLine);
    
    return lines.join('\n');
  }
  
  private formatHeading(container: StructuralContainer): string {
    const label = container.label;
    const title = container.title;
    
    if (!label && !title) return '';
    
    const text = label && title ? `${label}: ${title}` : label || title || '';
    
    switch (container.type) {
      case 'unit':
        return `\n${text.toUpperCase()}\n${'='.repeat(text.length)}`;
      case 'chapter':
        return `${text}\n${'-'.repeat(text.length)}`;
      case 'section':
        return `${text}`;
      default:
        return text;
    }
  }
  
  private formatBlockHeading(text: string, level: number): string {
    if (level === 1) {
      return `${text}\n${'='.repeat(text.length)}`;
    } else if (level === 2) {
      return `${text}\n${'-'.repeat(text.length)}`;
    } else {
      return text;
    }
  }
  
  private renderList(content: any): string {
    const items: string[] = [];
    
    content.items.forEach((item: any, index: number) => {
      const text = this.renderSemanticText(item);
      const prefix = content.ordered ? `${index + 1}.` : '•';
      const firstLinePrefix = `${prefix} `;
      const continuationPrefix = ' '.repeat(firstLinePrefix.length);
      
      const wrapped = this.wrapText(text);
      const lines = wrapped.split('\n');
      
      if (lines.length === 1) {
        items.push(firstLinePrefix + lines[0]);
      } else {
        items.push(firstLinePrefix + lines[0]);
        lines.slice(1).forEach(line => {
          items.push(continuationPrefix + line);
        });
      }
    });
    
    return items.join('\n');
  }
  
  private renderTable(content: any): string {
    const parts: string[] = [];
    const rows: string[][] = [];
    
    // Collect all rows
    if (content.headers) {
      rows.push(content.headers.map((h: any) => this.renderSemanticText(h)));
    }
    
    if (content.rows) {
      for (const row of content.rows) {
        rows.push(row.map((c: any) => this.renderSemanticText(c)));
      }
    }
    
    if (rows.length === 0) return '';
    
    // Calculate column widths
    const colWidths: number[] = [];
    for (const row of rows) {
      row.forEach((cell, i) => {
        colWidths[i] = Math.max(colWidths[i] || 0, cell.length);
      });
    }
    
    // Render table
    const separator = '+' + colWidths.map(w => '-'.repeat(w + 2)).join('+') + '+';
    
    parts.push(separator);
    
    // Headers
    if (content.headers) {
      const headerRow = rows[0];
      const cells = headerRow.map((cell, i) => ` ${cell.padEnd(colWidths[i])} `);
      parts.push('|' + cells.join('|') + '|');
      parts.push(separator);
    }
    
    // Data rows
    const dataRows = content.headers ? rows.slice(1) : rows;
    for (const row of dataRows) {
      const cells = row.map((cell, i) => ` ${cell.padEnd(colWidths[i])} `);
      parts.push('|' + cells.join('|') + '|');
    }
    
    parts.push(separator);
    
    if (content.caption) {
      parts.push('');
      parts.push(`Caption: ${this.renderSemanticText(content.caption)}`);
    }
    
    return parts.join('\n');
  }
  
  private renderFigure(content: any): string {
    const parts: string[] = [];
    
    parts.push(`[Figure: ${content.src || 'No source'}]`);
    
    if (content.alt) {
      parts.push(`Alt text: ${content.alt}`);
    }
    
    if (content.caption) {
      parts.push(`Caption: ${this.renderSemanticText(content.caption)}`);
    }
    
    return parts.join('\n');
  }
  
  private renderCodeBlock(content: any): string {
    const parts: string[] = [];
    const lang = content.language || 'code';
    
    parts.push(`--- ${lang} ---`);
    parts.push(content.code);
    parts.push('--- end ---');
    
    return parts.join('\n');
  }
  
  private renderMathBlock(content: any): string {
    const parts: string[] = [];
    
    parts.push('--- math ---');
    parts.push(content.math);
    parts.push('--- end ---');
    
    return parts.join('\n');
  }
}