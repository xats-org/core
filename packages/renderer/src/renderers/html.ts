/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions */
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
} from '@xats-org/types';

export interface HtmlRendererOptions extends RendererOptions {
  wrapInDocument?: boolean;
  includeStyles?: boolean;
  customStyles?: string;
}

/**
 * HTML renderer for xats documents
 */
export class HtmlRenderer extends BaseRenderer {
  protected htmlOptions: HtmlRendererOptions;

  constructor(options: HtmlRendererOptions = {}) {
    super(options);
    this.htmlOptions = {
      wrapInDocument: true,
      includeStyles: true,
      ...options,
    };
  }

  render(document: XatsDocument): string {
    const content = [
      this.renderMetadata(document),
      document.frontMatter ? this.renderDocumentSection('frontmatter', document.frontMatter) : '',
      document.bodyMatter ? this.renderDocumentSection('bodymatter', document.bodyMatter) : '',
      document.backMatter ? this.renderDocumentSection('backmatter', document.backMatter) : '',
    ]
      .filter(Boolean)
      .join('\n');

    if (this.htmlOptions.wrapInDocument) {
      return this.wrapInHtmlDocument(content, document);
    }

    return content;
  }

  renderMetadata(document: XatsDocument): string {
    const parts: string[] = [];

    if (document.bibliographicEntry) {
      const bib = document.bibliographicEntry;
      parts.push('<header class="xats-metadata">');

      if (bib.title) {
        parts.push(`<h1 class="xats-title">${this.escapeText(bib.title)}</h1>`);
      }

      if (bib.author && bib.author.length > 0) {
        const authors = bib.author
          .map((a) => {
            if ('literal' in a && a.literal) {
              return a.literal;
            }
            return `${a.given || ''} ${a.family || ''}`.trim();
          })
          .join(', ');
        parts.push(`<div class="xats-authors">${this.escapeText(authors)}</div>`);
      }

      if (bib.publisher) {
        parts.push(`<div class="xats-publisher">${this.escapeText(bib.publisher)}</div>`);
      }

      parts.push('</header>');
    }

    return parts.join('\n');
  }

  renderStructuralContainer(container: StructuralContainer): string {
    const attrs = this.getAttributes(container);
    const className = this.getContainerClassName(container);

    const parts: string[] = [];
    parts.push(`<div class="${className}"${attrs}>`);

    if (container.label) {
      parts.push(`<div class="xats-label">${this.escapeText(container.label)}</div>`);
    }

    if (container.title) {
      const level = this.getHeadingLevel(container);
      const titleText = this.renderSemanticText(container.title);
      parts.push(`<h${level} class="xats-heading">${titleText}</h${level}>`);
    }

    if ('contents' in container && container.contents && Array.isArray(container.contents)) {
      parts.push(this.renderContents(container.contents));
    }

    parts.push('</div>');

    return parts.join('\n');
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
    const attrs = this.getAttributes(block);

    switch (typeName) {
      case 'paragraph':
        if (this.isSemanticText(block.content)) {
          return `<p class="xats-paragraph"${attrs}>${this.renderSemanticText(block.content)}</p>`;
        }
        return `<p class="xats-paragraph"${attrs}>${this.escapeText(String(block.content))}</p>`;

      case 'heading':
        if (this.isHeadingContent(block.content)) {
          const level = block.content.level || 1;
          return `<h${level} class="xats-heading"${attrs}>${this.renderSemanticText(block.content.text)}</h${level}>`;
        }
        return `<h2 class="xats-heading"${attrs}>${this.escapeText(String(block.content))}</h2>`;

      case 'list':
        if (this.isListContent(block.content)) {
          const tag = block.content.ordered ? 'ol' : 'ul';
          const items = block.content.items
            .map(
              (item) =>
                `<li>${this.isSemanticText(item) ? this.renderSemanticText(item) : this.escapeText(String(item))}</li>`
            )
            .join('\n');
          return `<${tag} class="xats-list"${attrs}>${items}</${tag}>`;
        }
        return `<ul class="xats-list"${attrs}><li>${this.escapeText(String(block.content))}</li></ul>`;

      case 'blockquote':
        if (this.isBlockquoteContent(block.content)) {
          return `<blockquote class="xats-blockquote"${attrs}>${this.renderSemanticText(block.content.text)}</blockquote>`;
        }
        return `<blockquote class="xats-blockquote"${attrs}>${this.escapeText(String(block.content))}</blockquote>`;

      case 'codeBlock':
        if (this.isCodeBlockContent(block.content)) {
          const lang = block.content.language || '';
          return `<pre class="xats-code"${attrs}><code class="language-${lang}">${this.escapeText(block.content.code)}</code></pre>`;
        }
        return `<pre class="xats-code"${attrs}><code>${this.escapeText(String(block.content))}</code></pre>`;

      case 'mathBlock':
        if (this.isMathBlockContent(block.content)) {
          return `<div class="xats-math"${attrs}>${this.escapeText(block.content.math)}</div>`;
        }
        return `<div class="xats-math"${attrs}>${this.escapeText(String(block.content))}</div>`;

      case 'table':
        if (this.isTableContent(block.content)) {
          return this.renderTable(block.content, attrs);
        }
        return `<div class="xats-table"${attrs}>Invalid table content</div>`;

      case 'figure':
        if (this.isFigureContent(block.content)) {
          return this.renderFigure(block.content, attrs);
        }
        return `<div class="xats-figure"${attrs}>Invalid figure content</div>`;

      default:
        return `<div class="xats-block xats-${typeName}"${attrs}>${JSON.stringify(block.content)}</div>`;
    }
  }

  renderSemanticText(text: SemanticText): string {
    return text.runs.map((run) => this.renderSemanticTextRun(run)).join('');
  }

  renderSemanticTextRun(run: SemanticTextRun): string {
    switch (run.type) {
      case 'text':
        return this.escapeText(run.text);

      case 'emphasis':
        return `<em>${this.escapeText(run.text)}</em>`;

      case 'strong':
        return `<strong>${this.escapeText(run.text)}</strong>`;

      case 'code':
        return `<code>${this.escapeText(run.text)}</code>`;

      case 'subscript':
        return `<sub>${this.escapeText(run.text)}</sub>`;

      case 'superscript':
        return `<sup>${this.escapeText(run.text)}</sup>`;

      case 'strikethrough':
        return `<del>${this.escapeText(run.text)}</del>`;

      case 'underline':
        return `<u>${this.escapeText(run.text)}</u>`;

      case 'reference': {
        const href = run.ref ? `#${run.ref}` : '#';
        const label = run.label || run.text || 'Reference';
        return `<a href="${href}" class="xats-reference">${this.escapeText(label)}</a>`;
      }

      case 'citation':
        return `<cite class="xats-citation" data-cite="${run.citeKey}">[${run.citeKey}]</cite>`;

      case 'mathInline':
        return `<span class="xats-math-inline">${this.escapeText(run.math)}</span>`;

      default:
        return '';
    }
  }

  protected escapeText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getAttributes(obj: { id?: string; tags?: string[] }): string {
    const attrs: string[] = [];

    if (this.options.includeIds && obj.id) {
      attrs.push(`id="${obj.id}"`);
    }

    if (this.options.includeTags && obj.tags && obj.tags.length > 0) {
      attrs.push(`data-tags="${obj.tags.join(' ')}"`);
    }

    return attrs.length > 0 ? ` ${attrs.join(' ')}` : '';
  }

  private getHeadingLevel(container: StructuralContainer): number {
    // Determine heading level based on container type
    if ('contents' in container) {
      const firstContent = Array.isArray(container.contents) ? container.contents[0] : null;
      if (firstContent && 'blockType' in firstContent) {
        return 2; // Chapters
      } else if (firstContent && 'contents' in firstContent) {
        const nestedContent = Array.isArray(firstContent.contents)
          ? firstContent.contents[0]
          : null;
        if (nestedContent && 'blockType' in nestedContent) {
          return 3; // Sections
        }
        return 1; // Units
      }
    }
    return 4; // Default for unknown types
  }

  private renderTable(
    content: { caption?: SemanticText; headers?: SemanticText[]; rows: SemanticText[][] },
    attrs: string
  ): string {
    const parts: string[] = [];
    parts.push(`<table class="xats-table"${attrs}>`);

    if (content.caption) {
      parts.push(`<caption>${this.renderSemanticText(content.caption)}</caption>`);
    }

    if (content.headers && content.headers.length > 0) {
      parts.push('<thead><tr>');
      for (const header of content.headers) {
        parts.push(`<th>${this.renderSemanticText(header)}</th>`);
      }
      parts.push('</tr></thead>');
    }

    if (content.rows && content.rows.length > 0) {
      parts.push('<tbody>');
      for (const row of content.rows) {
        parts.push('<tr>');
        for (const cell of row) {
          parts.push(`<td>${this.renderSemanticText(cell)}</td>`);
        }
        parts.push('</tr>');
      }
      parts.push('</tbody>');
    }

    parts.push('</table>');
    return parts.join('\n');
  }

  private renderFigure(
    content: { src: string; alt?: string; caption?: SemanticText },
    attrs: string
  ): string {
    const parts: string[] = [];
    parts.push(`<figure class="xats-figure"${attrs}>`);

    if (content.src) {
      const alt = content.alt ? this.escapeText(content.alt) : '';
      parts.push(`<img src="${content.src}" alt="${alt}" />`);
    }

    if (content.caption) {
      parts.push(`<figcaption>${this.renderSemanticText(content.caption)}</figcaption>`);
    }

    parts.push('</figure>');
    return parts.join('\n');
  }

  private wrapInHtmlDocument(content: string, document: XatsDocument): string {
    const title = document.bibliographicEntry?.title || 'xats Document';
    const lang = document.bibliographicEntry?.language || 'en';

    const parts: string[] = [];
    parts.push('<!DOCTYPE html>');
    parts.push(`<html lang="${lang}">`);
    parts.push('<head>');
    parts.push('<meta charset="UTF-8">');
    parts.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    parts.push(`<title>${this.escapeText(title)}</title>`);

    if (this.htmlOptions.includeStyles) {
      parts.push('<style>');
      parts.push(this.getDefaultStyles());
      if (this.htmlOptions.customStyles) {
        parts.push(this.htmlOptions.customStyles);
      }
      parts.push('</style>');
    }

    parts.push('</head>');
    parts.push('<body>');
    parts.push('<main class="xats-document">');
    parts.push(content);
    parts.push('</main>');
    parts.push('</body>');
    parts.push('</html>');

    return parts.join('\n');
  }

  private getDefaultStyles(): string {
    return `
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }
      
      .xats-metadata {
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e0e0e0;
      }
      
      .xats-title {
        font-size: 2.5rem;
        margin: 0 0 1rem 0;
      }
      
      .xats-authors {
        font-size: 1.2rem;
        color: #666;
      }
      
      .xats-unit, .xats-chapter, .xats-section {
        margin: 2rem 0;
      }
      
      .xats-label {
        font-weight: bold;
        color: #666;
        margin-bottom: 0.5rem;
      }
      
      .xats-heading {
        margin: 1rem 0;
      }
      
      .xats-paragraph {
        margin: 1rem 0;
      }
      
      .xats-code {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        overflow-x: auto;
      }
      
      .xats-blockquote {
        border-left: 4px solid #e0e0e0;
        padding-left: 1rem;
        margin: 1rem 0;
        color: #666;
      }
      
      .xats-table {
        border-collapse: collapse;
        width: 100%;
        margin: 1rem 0;
      }
      
      .xats-table th,
      .xats-table td {
        border: 1px solid #e0e0e0;
        padding: 0.5rem;
        text-align: left;
      }
      
      .xats-table th {
        background: #f5f5f5;
        font-weight: bold;
      }
      
      .xats-figure {
        margin: 1rem 0;
      }
      
      .xats-figure img {
        max-width: 100%;
        height: auto;
      }
      
      .xats-figure figcaption {
        margin-top: 0.5rem;
        font-style: italic;
        color: #666;
      }
    `;
  }

  private renderDocumentSection(
    sectionType: 'frontmatter' | 'bodymatter' | 'backmatter',
    section: FrontMatter | BodyMatter | BackMatter
  ): string {
    const parts: string[] = [];
    const className = `xats-${sectionType}`;

    parts.push(`<section class="${className}">`);

    if (sectionType === 'bodymatter' && 'contents' in section && Array.isArray(section.contents)) {
      parts.push(this.renderContents(section.contents));
    } else {
      // Handle FrontMatter and BackMatter properties
      Object.entries(section).forEach(([key, value]) => {
        if (key !== 'contents' && Array.isArray(value)) {
          parts.push(`<div class="xats-${key}">`);
          parts.push(`<h2 class="xats-section-title">${this.formatSectionTitle(key)}</h2>`);
          parts.push(value.map((block) => this.renderContentBlock(block)).join('\\n'));
          parts.push('</div>');
        }
      });
    }

    parts.push('</section>');

    return parts.join('\\n');
  }

  private formatSectionTitle(key: string): string {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
  }

  private getContainerClassName(container: StructuralContainer): string {
    // Try to determine container type from its contents
    if ('contents' in container) {
      const firstContent = Array.isArray(container.contents) ? container.contents[0] : null;
      if (firstContent && 'blockType' in firstContent) {
        return 'xats-section'; // Contains content blocks directly
      } else if (firstContent && 'contents' in firstContent) {
        const nestedContent = Array.isArray(firstContent.contents)
          ? firstContent.contents[0]
          : null;
        if (nestedContent && 'blockType' in nestedContent) {
          return 'xats-chapter'; // Contains sections
        }
        return 'xats-unit'; // Contains chapters
      }
    }
    return 'xats-container';
  }
}
