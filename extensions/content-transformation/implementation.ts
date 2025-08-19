/**
 * Content Transformation Extension Implementation
 * Provides tools for converting between various formats and xats documents
 */

import { marked } from 'marked';
import TurndownService from 'turndown';
import * as yaml from 'js-yaml';

export interface TransformationRule {
  ruleId: string;
  name?: string;
  sourceFormat: string;
  targetBlockType: string;
  pattern: string;
  transformation: {
    extractText?: {
      method: 'regex' | 'css-selector' | 'xpath' | 'custom';
      selector: string;
      flags?: string[];
    };
    parseMetadata?: {
      frontmatter?: boolean;
      attributes?: string[];
      customExtractors?: Record<string, string>;
    };
    preserveFormatting?: {
      emphasis?: boolean;
      strong?: boolean;
      links?: boolean;
      code?: boolean;
      math?: boolean;
      citations?: boolean;
    };
    structureMapping?: {
      headingLevels?: Record<string, 'unit' | 'chapter' | 'section'>;
      listTypes?: {
        unordered?: string;
        ordered?: string;
        definition?: string;
      };
      tableHandling?: {
        detectHeaders?: boolean;
        preserveAlignment?: boolean;
        maxColumns?: number;
      };
    };
  };
  postProcessing?: Array<{
    step: string;
    config?: any;
  }>;
  priority?: number;
  enabled?: boolean;
}

export interface ImportConfiguration {
  importId: string;
  name?: string;
  sourceFormat: string;
  documentStructure?: {
    detectStructure?: boolean;
    defaultContainer?: 'unit' | 'chapter' | 'section';
    titleExtraction?: {
      method: 'heading' | 'filename' | 'first-line' | 'custom';
      pattern?: string;
      fallback?: string;
    };
    chapterDetection?: {
      headingLevel?: number;
      keywords?: string[];
      pageBreaks?: boolean;
    };
  };
  metadataExtraction?: {
    bibliographicData?: {
      title?: string;
      authors?: string;
      date?: string;
      isbn?: string;
      publisher?: string;
    };
    subject?: {
      method: 'manual' | 'keyword-based' | 'ml-classification' | 'metadata';
      keywords?: Array<{
        subject: string;
        terms: string[];
      }>;
      fallback?: string;
    };
  };
  contentProcessing?: {
    imageHandling?: {
      extractImages?: boolean;
      optimizeImages?: boolean;
      maxWidth?: number;
      format?: 'preserve' | 'webp' | 'png' | 'jpg';
      altTextGeneration?: boolean;
    };
    linkProcessing?: {
      resolveRelativeLinks?: boolean;
      convertToReferences?: boolean;
      validateLinks?: boolean;
    };
    textCleaning?: {
      removeExtraWhitespace?: boolean;
      normalizeQuotes?: boolean;
      fixEncoding?: boolean;
      removeComments?: boolean;
    };
  };
  transformationRules?: TransformationRule[];
  validation?: {
    strictMode?: boolean;
    requiredFields?: string[];
    schemaValidation?: boolean;
    warningsAsErrors?: boolean;
  };
}

export interface ExportConfiguration {
  exportId: string;
  name?: string;
  targetFormat: string;
  outputStructure?: {
    singleFile?: boolean;
    preserveHierarchy?: boolean;
    includeMetadata?: boolean;
    fileNaming?: {
      pattern?: string;
      sanitization?: boolean;
      maxLength?: number;
    };
  };
  contentMapping?: {
    blockTypeMapping?: Record<string, {
      element?: string;
      attributes?: Record<string, any>;
      template?: string;
    }>;
    semanticTextMapping?: {
      preserveRunTypes?: boolean;
      fallbackFormatting?: {
        emphasis?: string;
        strong?: string;
        code?: string;
      };
    };
  };
  resourceHandling?: {
    embedResources?: boolean;
    resourceDirectory?: string;
    optimizeImages?: boolean;
    copyResources?: boolean;
  };
  templates?: {
    documentTemplate?: string;
    chapterTemplate?: string;
    sectionTemplate?: string;
    customTemplates?: Record<string, string>;
  };
}

export class ContentTransformer {
  private importRules = new Map<string, TransformationRule[]>();
  private exportConfigs = new Map<string, ExportConfiguration>();

  constructor() {
    this.registerDefaultRules();
  }

  // Import methods
  async importFromMarkdown(content: string, config?: ImportConfiguration): Promise<any> {
    const { frontmatter, body } = this.parseFrontmatter(content);
    
    // Configure marked
    const tokens = marked.lexer(body);
    
    // Build xats document structure
    const document = {
      schemaVersion: '0.3.0',
      bibliographicEntry: this.extractBibliographicData(frontmatter),
      subject: this.inferSubject(frontmatter, body, config),
      bodyMatter: {
        contents: this.buildContentStructure(tokens, config)
      }
    };

    // Apply post-processing
    if (config?.validation?.schemaValidation) {
      await this.validateDocument(document);
    }

    return document;
  }

  async importFromHTML(content: string, config?: ImportConfiguration): Promise<any> {
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM(content);
    const document = dom.window.document;
    
    // Extract metadata from HTML head
    const metadata = this.extractHTMLMetadata(document);
    
    // Convert HTML body to xats structure
    const bodyElements = Array.from(document.body.children);
    const contents = this.buildContentFromHTML(bodyElements, config);
    
    return {
      schemaVersion: '0.3.0',
      bibliographicEntry: this.extractBibliographicData(metadata),
      subject: metadata.subject || 'General',
      bodyMatter: { contents }
    };
  }

  // Export methods
  async exportToMarkdown(document: any, config?: ExportConfiguration): Promise<string> {
    const lines: string[] = [];
    
    // Add frontmatter
    if (config?.outputStructure?.includeMetadata) {
      const frontmatter = this.generateFrontmatter(document);
      lines.push('---');
      lines.push(yaml.dump(frontmatter).trim());
      lines.push('---');
      lines.push('');
    }
    
    // Convert content structure
    for (const container of document.bodyMatter.contents) {
      lines.push(...this.containerToMarkdown(container, 1));
    }
    
    return lines.join('\n');
  }

  async exportToHTML(document: any, config?: ExportConfiguration): Promise<string> {
    const template = config?.templates?.documentTemplate || this.getDefaultHTMLTemplate();
    
    // Generate HTML content
    let htmlContent = '';
    for (const container of document.bodyMatter.contents) {
      htmlContent += this.containerToHTML(container, 1);
    }
    
    // Apply template
    return template
      .replace('{title}', document.bibliographicEntry.title || 'Untitled')
      .replace('{content}', htmlContent);
  }

  // Utility methods
  private parseFrontmatter(content: string): { frontmatter: any; body: string } {
    const frontmatterRegex = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (match) {
      try {
        const frontmatter = yaml.load(match[1]) as any;
        return { frontmatter: frontmatter || {}, body: match[2] };
      } catch (error) {
        console.warn('Failed to parse frontmatter:', error);
      }
    }
    
    return { frontmatter: {}, body: content };
  }

  private extractBibliographicData(metadata: any): any {
    return {
      id: metadata.id || this.generateId('document'),
      type: 'book',
      title: metadata.title || 'Untitled Document',
      author: this.normalizeAuthors(metadata.author || metadata.authors),
      issued: metadata.date ? this.parseDate(metadata.date) : undefined,
      publisher: metadata.publisher,
      ISBN: metadata.isbn,
      abstract: metadata.abstract || metadata.description
    };
  }

  private normalizeAuthors(authors: any): any[] {
    if (!authors) return [];
    
    if (typeof authors === 'string') {
      return authors.split(',').map(name => ({ literal: name.trim() }));
    }
    
    if (Array.isArray(authors)) {
      return authors.map(author => {
        if (typeof author === 'string') {
          return { literal: author };
        }
        return author;
      });
    }
    
    return [{ literal: String(authors) }];
  }

  private parseDate(date: any): any {
    if (!date) return undefined;
    
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      return { literal: String(date) };
    }
    
    return {
      'date-parts': [[
        parsed.getFullYear(),
        parsed.getMonth() + 1,
        parsed.getDate()
      ]]
    };
  }

  private inferSubject(frontmatter: any, content: string, config?: ImportConfiguration): string {
    // Check frontmatter first
    if (frontmatter.subject) return frontmatter.subject;
    
    // Use configuration if provided
    if (config?.metadataExtraction?.subject) {
      const subjectConfig = config.metadataExtraction.subject;
      
      if (subjectConfig.method === 'keyword-based' && subjectConfig.keywords) {
        const scores = subjectConfig.keywords.map(({ subject, terms }) => {
          const count = terms.reduce((total, term) => {
            const regex = new RegExp(term, 'gi');
            return total + (content.match(regex) || []).length;
          }, 0);
          return { subject, count };
        });
        
        const topSubject = scores.reduce((max, current) => 
          current.count > max.count ? current : max
        );
        
        if (topSubject.count > 0) return topSubject.subject;
      }
      
      if (subjectConfig.fallback) return subjectConfig.fallback;
    }
    
    // Default keyword-based inference
    const defaultKeywords = {
      'Mathematics': ['equation', 'theorem', 'proof', 'calculus', 'algebra', 'geometry'],
      'Physics': ['energy', 'momentum', 'force', 'quantum', 'relativity', 'mechanics'],
      'Chemistry': ['molecule', 'atom', 'reaction', 'compound', 'element', 'chemical'],
      'Biology': ['cell', 'gene', 'evolution', 'organism', 'DNA', 'species'],
      'Computer Science': ['algorithm', 'program', 'code', 'software', 'data', 'computer'],
      'History': ['century', 'war', 'empire', 'revolution', 'civilization', 'ancient'],
      'Literature': ['novel', 'poem', 'author', 'character', 'narrative', 'literary']
    };
    
    const scores = Object.entries(defaultKeywords).map(([subject, terms]) => {
      const count = terms.reduce((total, term) => {
        const regex = new RegExp(term, 'gi');
        return total + (content.match(regex) || []).length;
      }, 0);
      return { subject, count };
    });
    
    const topSubject = scores.reduce((max, current) => 
      current.count > max.count ? current : max
    );
    
    return topSubject.count > 0 ? topSubject.subject : 'General';
  }

  private buildContentStructure(tokens: marked.Token[], config?: ImportConfiguration): any[] {
    const containers: any[] = [];
    let currentUnit: any = null;
    let currentChapter: any = null;
    let currentSection: any = null;
    
    const structureConfig = config?.documentStructure;
    const defaultContainer = structureConfig?.defaultContainer || 'section';
    
    for (const token of tokens) {
      if (token.type === 'heading') {
        const heading = token as marked.Tokens.Heading;
        const container = this.createContainerFromHeading(heading, structureConfig);
        
        // Determine hierarchy based on heading level
        if (heading.depth <= 1) {
          // Unit level
          currentUnit = container;
          currentUnit.containerType = 'unit';
          currentChapter = null;
          currentSection = null;
          containers.push(currentUnit);
        } else if (heading.depth <= 2) {
          // Chapter level
          currentChapter = container;
          currentChapter.containerType = 'chapter';
          currentSection = null;
          
          if (currentUnit) {
            currentUnit.contents = currentUnit.contents || [];
            currentUnit.contents.push(currentChapter);
          } else {
            containers.push(currentChapter);
          }
        } else {
          // Section level
          currentSection = container;
          currentSection.containerType = 'section';
          
          const parent = currentChapter || currentUnit;
          if (parent) {
            parent.contents = parent.contents || [];
            parent.contents.push(currentSection);
          } else {
            containers.push(currentSection);
          }
        }
      } else {
        // Content blocks
        const block = this.tokenToContentBlock(token);
        if (block) {
          const target = currentSection || currentChapter || currentUnit;
          
          if (target) {
            target.contents = target.contents || [];
            target.contents.push(block);
          } else {
            // Create default container if none exists
            if (containers.length === 0) {
              const defaultSection = this.createDefaultContainer(defaultContainer);
              containers.push(defaultSection);
              currentSection = defaultSection;
            }
            const lastContainer = containers[containers.length - 1];
            lastContainer.contents = lastContainer.contents || [];
            lastContainer.contents.push(block);
          }
        }
      }
    }
    
    return containers;
  }

  private createContainerFromHeading(heading: marked.Tokens.Heading, config?: any): any {
    const title = this.tokensToSemanticText(heading.tokens);
    
    return {
      id: this.generateId(title.runs[0]?.content || 'container'),
      title,
      contents: []
    };
  }

  private createDefaultContainer(type: 'unit' | 'chapter' | 'section'): any {
    return {
      id: this.generateId(type),
      containerType: type,
      title: {
        runs: [{ type: 'text', content: `Untitled ${type}` }]
      },
      contents: []
    };
  }

  private tokenToContentBlock(token: marked.Token): any | null {
    switch (token.type) {
      case 'paragraph':
        const paragraph = token as marked.Tokens.Paragraph;
        return {
          id: this.generateId('paragraph'),
          blockType: 'https://xats.org/core/blocks/paragraph',
          content: {
            text: this.tokensToSemanticText(paragraph.tokens)
          }
        };
        
      case 'blockquote':
        const blockquote = token as marked.Tokens.Blockquote;
        return {
          id: this.generateId('blockquote'),
          blockType: 'https://xats.org/core/blocks/blockquote',
          content: {
            text: this.parseBlockTokensToSemanticText(blockquote.tokens)
          }
        };
        
      case 'list':
        const list = token as marked.Tokens.List;
        return {
          id: this.generateId('list'),
          blockType: 'https://xats.org/core/blocks/list',
          content: {
            listType: list.ordered ? 'ordered' : 'unordered',
            items: list.items.map(item => ({
              content: this.parseBlockTokensToSemanticText(item.tokens)
            }))
          }
        };
        
      case 'table':
        const table = token as marked.Tokens.Table;
        return {
          id: this.generateId('table'),
          blockType: 'https://xats.org/core/blocks/table',
          content: {
            headers: table.header.map(cell => ({
              content: this.tokensToSemanticText(cell.tokens)
            })),
            rows: table.rows.map(row => ({
              cells: row.map(cell => ({
                content: this.tokensToSemanticText(cell.tokens)
              }))
            }))
          }
        };
        
      case 'code':
        const code = token as marked.Tokens.Code;
        return {
          id: this.generateId('code'),
          blockType: 'https://xats.org/core/blocks/codeBlock',
          content: {
            code: code.text,
            language: code.lang || 'text'
          }
        };
        
      case 'html':
        const html = token as marked.Tokens.HTML;
        // Check if it's a math block
        if (html.text.includes('$$') || html.text.includes('\\[')) {
          return {
            id: this.generateId('math'),
            blockType: 'https://xats.org/core/blocks/mathBlock',
            content: {
              formula: html.text.replace(/\$\$|\\[\[\]]/g, '').trim()
            }
          };
        }
        break;
    }
    
    return null;
  }

  private tokensToSemanticText(tokens: marked.Token[]): any {
    const runs: any[] = [];
    
    for (const token of tokens) {
      switch (token.type) {
        case 'text':
          const text = token as marked.Tokens.Text;
          runs.push({
            type: 'text',
            content: text.text
          });
          break;
          
        case 'em':
          const em = token as marked.Tokens.Em;
          runs.push({
            type: 'emphasis',
            runs: this.tokensToSemanticText(em.tokens).runs
          });
          break;
          
        case 'strong':
          const strong = token as marked.Tokens.Strong;
          runs.push({
            type: 'strong',
            runs: this.tokensToSemanticText(strong.tokens).runs
          });
          break;
          
        case 'code':
          const code = token as marked.Tokens.Codespan;
          runs.push({
            type: 'code',
            content: code.text
          });
          break;
          
        case 'link':
          const link = token as marked.Tokens.Link;
          runs.push({
            type: 'reference',
            referenceId: this.generateId('link'),
            content: link.href,
            runs: this.tokensToSemanticText(link.tokens).runs
          });
          break;
          
        case 'del':
          const del = token as marked.Tokens.Del;
          runs.push({
            type: 'text',
            content: del.text // Could add strikethrough run type
          });
          break;
      }
    }
    
    return { runs };
  }

  private parseBlockTokensToSemanticText(tokens: marked.Token[]): any {
    // Handle mixed block and inline tokens
    const inlineTokens = tokens.filter(token => 
      ['text', 'em', 'strong', 'code', 'link', 'del'].includes(token.type)
    );
    
    if (inlineTokens.length > 0) {
      return this.tokensToSemanticText(inlineTokens);
    }
    
    // Fallback for complex block content
    const textContent = tokens.map(token => {
      if ('text' in token) return token.text;
      if ('raw' in token) return token.raw;
      return '';
    }).join(' ').trim();
    
    return {
      runs: [{ type: 'text', content: textContent }]
    };
  }

  // Export helper methods
  private containerToMarkdown(container: any, depth: number): string[] {
    const lines: string[] = [];
    const headingPrefix = '#'.repeat(depth);
    
    // Add container title
    if (container.title) {
      const titleText = this.semanticTextToMarkdown(container.title);
      lines.push(`${headingPrefix} ${titleText}`);
      lines.push('');
    }
    
    // Add container contents
    if (container.contents) {
      for (const item of container.contents) {
        if (item.containerType) {
          // Nested container
          lines.push(...this.containerToMarkdown(item, depth + 1));
        } else {
          // Content block
          lines.push(...this.blockToMarkdown(item));
          lines.push('');
        }
      }
    }
    
    return lines;
  }

  private blockToMarkdown(block: any): string[] {
    switch (block.blockType) {
      case 'https://xats.org/core/blocks/paragraph':
        return [this.semanticTextToMarkdown(block.content.text)];
        
      case 'https://xats.org/core/blocks/blockquote':
        const quoteText = this.semanticTextToMarkdown(block.content.text);
        return quoteText.split('\n').map(line => `> ${line}`);
        
      case 'https://xats.org/core/blocks/list':
        const lines: string[] = [];
        block.content.items.forEach((item: any, index: number) => {
          const itemText = this.semanticTextToMarkdown(item.content);
          const prefix = block.content.listType === 'ordered' ? `${index + 1}. ` : '- ';
          lines.push(`${prefix}${itemText}`);
        });
        return lines;
        
      case 'https://xats.org/core/blocks/codeBlock':
        const language = block.content.language || '';
        return [
          `\`\`\`${language}`,
          block.content.code,
          '```'
        ];
        
      case 'https://xats.org/core/blocks/mathBlock':
        return [`$$${block.content.formula}$$`];
        
      default:
        return ['<!-- Unknown block type -->'];
    }
  }

  private semanticTextToMarkdown(semanticText: any): string {
    if (!semanticText || !semanticText.runs) return '';
    
    return semanticText.runs.map((run: any) => {
      switch (run.type) {
        case 'text':
          return run.content;
        case 'emphasis':
          return `*${this.semanticTextToMarkdown({ runs: run.runs })}*`;
        case 'strong':
          return `**${this.semanticTextToMarkdown({ runs: run.runs })}**`;
        case 'code':
          return `\`${run.content}\``;
        case 'reference':
          const linkText = run.runs ? 
            this.semanticTextToMarkdown({ runs: run.runs }) : 
            run.content;
          return `[${linkText}](${run.content || '#'})`;
        default:
          return run.content || '';
      }
    }).join('');
  }

  private containerToHTML(container: any, depth: number): string {
    const tagLevel = Math.min(depth, 6);
    let html = '';
    
    // Add container title
    if (container.title) {
      const titleText = this.semanticTextToHTML(container.title);
      html += `<h${tagLevel}>${titleText}</h${tagLevel}>\n`;
    }
    
    // Add container wrapper
    const containerClass = container.containerType || 'container';
    html += `<section class="xats-${containerClass}" id="${container.id}">\n`;
    
    // Add container contents
    if (container.contents) {
      for (const item of container.contents) {
        if (item.containerType) {
          html += this.containerToHTML(item, depth + 1);
        } else {
          html += this.blockToHTML(item);
        }
      }
    }
    
    html += '</section>\n';
    return html;
  }

  private blockToHTML(block: any): string {
    switch (block.blockType) {
      case 'https://xats.org/core/blocks/paragraph':
        return `<p class="xats-paragraph">${this.semanticTextToHTML(block.content.text)}</p>\n`;
        
      case 'https://xats.org/core/blocks/blockquote':
        return `<blockquote class="xats-blockquote">${this.semanticTextToHTML(block.content.text)}</blockquote>\n`;
        
      case 'https://xats.org/core/blocks/list':
        const tag = block.content.listType === 'ordered' ? 'ol' : 'ul';
        const items = block.content.items.map((item: any) => 
          `<li>${this.semanticTextToHTML(item.content)}</li>`
        ).join('\n');
        return `<${tag} class="xats-list">\n${items}\n</${tag}>\n`;
        
      case 'https://xats.org/core/blocks/codeBlock':
        return `<pre class="xats-code"><code class="language-${block.content.language || 'text'}">${block.content.code}</code></pre>\n`;
        
      case 'https://xats.org/core/blocks/mathBlock':
        return `<div class="xats-math">\\[${block.content.formula}\\]</div>\n`;
        
      default:
        return '<!-- Unknown block type -->\n';
    }
  }

  private semanticTextToHTML(semanticText: any): string {
    if (!semanticText || !semanticText.runs) return '';
    
    return semanticText.runs.map((run: any) => {
      switch (run.type) {
        case 'text':
          return this.escapeHtml(run.content);
        case 'emphasis':
          return `<em>${this.semanticTextToHTML({ runs: run.runs })}</em>`;
        case 'strong':
          return `<strong>${this.semanticTextToHTML({ runs: run.runs })}</strong>`;
        case 'code':
          return `<code>${this.escapeHtml(run.content)}</code>`;
        case 'reference':
          const linkText = run.runs ? 
            this.semanticTextToHTML({ runs: run.runs }) : 
            this.escapeHtml(run.content);
          return `<a href="${this.escapeHtml(run.content || '#')}">${linkText}</a>`;
        default:
          return this.escapeHtml(run.content || '');
      }
    }).join('');
  }

  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private generateFrontmatter(document: any): any {
    const frontmatter: any = {
      title: document.bibliographicEntry.title,
      subject: document.subject
    };
    
    if (document.bibliographicEntry.author) {
      frontmatter.author = document.bibliographicEntry.author.map((a: any) => a.literal);
    }
    
    if (document.bibliographicEntry.issued) {
      const dateParts = document.bibliographicEntry.issued['date-parts'][0];
      frontmatter.date = new Date(dateParts[0], (dateParts[1] || 1) - 1, dateParts[2] || 1).toISOString().split('T')[0];
    }
    
    return frontmatter;
  }

  private getDefaultHTMLTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        .xats-unit, .xats-chapter, .xats-section { margin: 2rem 0; }
        .xats-paragraph { margin: 1rem 0; line-height: 1.6; }
        .xats-code { background: #f5f5f5; padding: 1rem; border-radius: 4px; }
        .xats-math { margin: 1rem 0; text-align: center; }
        .xats-blockquote { border-left: 4px solid #ddd; margin: 1rem 0; padding-left: 1rem; }
    </style>
</head>
<body>
    {content}
</body>
</html>`;
  }

  // Utility methods
  private generateId(base: string): string {
    return base.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Math.random().toString(36).substr(2, 9);
  }

  private extractHTMLMetadata(document: Document): any {
    const metadata: any = {};
    
    // Extract title
    const titleEl = document.querySelector('title');
    if (titleEl) metadata.title = titleEl.textContent;
    
    // Extract meta tags
    document.querySelectorAll('meta').forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      
      if (name && content) {
        switch (name) {
          case 'author':
            metadata.author = content;
            break;
          case 'description':
            metadata.description = content;
            break;
          case 'subject':
            metadata.subject = content;
            break;
          case 'date':
            metadata.date = content;
            break;
        }
      }
    });
    
    return metadata;
  }

  private buildContentFromHTML(elements: Element[], config?: ImportConfiguration): any[] {
    const contents: any[] = [];
    
    for (const element of elements) {
      const block = this.htmlElementToBlock(element);
      if (block) {
        contents.push(block);
      }
    }
    
    return contents;
  }

  private htmlElementToBlock(element: Element): any | null {
    const tagName = element.tagName.toLowerCase();
    
    switch (tagName) {
      case 'p':
        return {
          id: this.generateId('paragraph'),
          blockType: 'https://xats.org/core/blocks/paragraph',
          content: {
            text: this.htmlToSemanticText(element)
          }
        };
        
      case 'blockquote':
        return {
          id: this.generateId('blockquote'),
          blockType: 'https://xats.org/core/blocks/blockquote',
          content: {
            text: this.htmlToSemanticText(element)
          }
        };
        
      case 'ul':
      case 'ol':
        const items = Array.from(element.querySelectorAll('li')).map(li => ({
          content: this.htmlToSemanticText(li)
        }));
        
        return {
          id: this.generateId('list'),
          blockType: 'https://xats.org/core/blocks/list',
          content: {
            listType: tagName === 'ol' ? 'ordered' : 'unordered',
            items
          }
        };
        
      case 'pre':
        const code = element.querySelector('code');
        return {
          id: this.generateId('code'),
          blockType: 'https://xats.org/core/blocks/codeBlock',
          content: {
            code: code ? code.textContent || '' : element.textContent || '',
            language: code?.className.match(/language-(\w+)/)?.[1] || 'text'
          }
        };
    }
    
    return null;
  }

  private htmlToSemanticText(element: Element): any {
    const runs: any[] = [];
    
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === 3) { // Text node
        const text = node.textContent || '';
        if (text.trim()) {
          runs.push({ type: 'text', content: text });
        }
      } else if (node.nodeType === 1) { // Element node
        const el = node as Element;
        const tagName = el.tagName.toLowerCase();
        
        switch (tagName) {
          case 'em':
          case 'i':
            runs.push({
              type: 'emphasis',
              runs: this.htmlToSemanticText(el).runs
            });
            break;
            
          case 'strong':
          case 'b':
            runs.push({
              type: 'strong',
              runs: this.htmlToSemanticText(el).runs
            });
            break;
            
          case 'code':
            runs.push({
              type: 'code',
              content: el.textContent || ''
            });
            break;
            
          case 'a':
            runs.push({
              type: 'reference',
              referenceId: this.generateId('link'),
              content: el.getAttribute('href') || '',
              runs: this.htmlToSemanticText(el).runs
            });
            break;
            
          default:
            // For other elements, just extract text content
            const text = el.textContent || '';
            if (text.trim()) {
              runs.push({ type: 'text', content: text });
            }
            break;
        }
      }
    }
    
    return { runs };
  }

  private async validateDocument(document: any): Promise<void> {
    // Basic validation - in a real implementation, this would use JSON Schema
    if (!document.schemaVersion) {
      throw new Error('Document missing required schemaVersion');
    }
    
    if (!document.bibliographicEntry) {
      throw new Error('Document missing required bibliographicEntry');
    }
    
    if (!document.subject) {
      throw new Error('Document missing required subject');
    }
    
    if (!document.bodyMatter) {
      throw new Error('Document missing required bodyMatter');
    }
    
    console.log('Document validation passed');
  }

  private registerDefaultRules(): void {
    // Register common transformation rules
    const markdownRules: TransformationRule[] = [
      {
        ruleId: 'heading-to-container',
        sourceFormat: 'markdown',
        targetBlockType: 'container',
        pattern: '^(#{1,6})\\s+(.+)$',
        transformation: {
          structureMapping: {
            headingLevels: {
              'h1': 'unit',
              'h2': 'chapter',
              'h3': 'section'
            }
          }
        },
        priority: 100
      },
      {
        ruleId: 'paragraph-text',
        sourceFormat: 'markdown',
        targetBlockType: 'https://xats.org/core/blocks/paragraph',
        pattern: '^(?!#|\\*|\\-|\\d+\\.|```|\\$\\$)(.+)$',
        transformation: {
          preserveFormatting: {
            emphasis: true,
            strong: true,
            links: true,
            code: true
          }
        },
        priority: 10
      }
    ];
    
    this.importRules.set('markdown', markdownRules);
  }
}

// Usage examples
export async function convertMarkdownToXats(filePath: string): Promise<any> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');
  
  const transformer = new ContentTransformer();
  return transformer.importFromMarkdown(content);
}

export async function convertXatsToMarkdown(document: any): Promise<string> {
  const transformer = new ContentTransformer();
  return transformer.exportToMarkdown(document);
}

export async function convertXatsToHTML(document: any): Promise<string> {
  const transformer = new ContentTransformer();
  return transformer.exportToHTML(document);
}