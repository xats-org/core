/**
 * xats HTML Renderer - Reference Implementation for v0.3.0
 * 
 * This renderer converts xats documents to semantic HTML with proper accessibility support.
 * Supports all v0.3.0 features including IndexRun, Case Study blocks, and Metacognitive Prompts.
 */

// Type definitions based on xats v0.3.0 schema
export interface XatsDocument {
  schemaVersion: string;
  bibliographicEntry: CslDataItem;
  citationStyle?: string;
  subject: string;
  targetAudience?: string;
  learningOutcomes?: LearningOutcome[];
  resources?: Resource[];
  rights?: RightsMetadata;
  frontMatter?: FrontMatter;
  bodyMatter: BodyMatter;
  backMatter?: BackMatter;
  extensions?: Record<string, any>;
}

export interface XatsObject {
  id: string;
  description?: string;
  tags?: string[];
  citationIds?: string[];
  renderingHints?: RenderingHint[];
  language: string;
  textDirection?: 'ltr' | 'rtl' | 'auto';
  accessibilityMetadata?: AccessibilityMetadata;
  rights?: RightsMetadata;
  extensions?: Record<string, any>;
}

export interface SemanticText {
  runs: Run[];
}

export type Run = TextRun | ReferenceRun | CitationRun | EmphasisRun | StrongRun | IndexRun;

export interface TextRun {
  type: 'text';
  text: string;
}

export interface ReferenceRun {
  type: 'reference';
  text: string;
  refId: string;
}

export interface CitationRun {
  type: 'citation';
  refId: string;
}

export interface EmphasisRun {
  type: 'emphasis';
  text: string;
}

export interface StrongRun {
  type: 'strong';
  text: string;
}

export interface IndexRun {
  type: 'index';
  text: string;
  indexTerm?: string;
  subTerm?: string;
  crossReferences?: string[];
  redirectTo?: string;
  indexId?: string;
}

export interface ContentBlock extends XatsObject {
  blockType: string;
  linkedObjectiveIds?: string[];
  content: Record<string, any>;
}

export interface BodyMatter {
  contents: (Unit | Chapter | FileReference)[];
  extensions?: Record<string, any>;
}

export interface Unit extends XatsObject {
  label?: string;
  title: string;
  linkedObjectiveIds?: string[];
  pathways?: Pathway[];
  introduction?: SemanticText;
  contents: (Unit | Chapter | FileReference)[];
}

export interface Chapter extends XatsObject {
  label?: string;
  title: string;
  linkedObjectiveIds?: string[];
  pathways?: Pathway[];
  introduction?: SemanticText;
  learningObjectives?: LearningObjective[];
  sections: (Section | FileReference)[];
  summary?: SemanticText;
  keyTerms?: KeyTerm[];
}

export interface Section extends XatsObject {
  label?: string;
  title: string;
  linkedObjectiveIds?: string[];
  pathways?: Pathway[];
  content: ContentBlock[];
}

// Additional interfaces for completeness
export interface CslDataItem {
  id: string;
  type?: string;
  title?: string;
  author?: any[];
  issued?: any;
  [key: string]: any;
}

export interface RenderingHint {
  hintType: string;
  value: any;
}

export interface AccessibilityMetadata {
  role?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string[];
  landmarkType?: string;
  skipTarget?: boolean;
  headingLevel?: number;
  cognitiveSupport?: any;
}

export interface RightsMetadata {
  license: string;
  [key: string]: any;
}

export interface FrontMatter {
  sections?: Section[];
  extensions?: Record<string, any>;
}

export interface BackMatter {
  sections?: Section[];
  glossary?: KeyTerm[];
  bibliography?: CslDataItem[];
  extensions?: Record<string, any>;
}

export interface LearningOutcome extends XatsObject {
  subItems?: LearningOutcome[];
}

export interface LearningObjective extends XatsObject {
  linkedOutcomeId?: string;
  subItems?: LearningObjective[];
}

export interface Resource extends XatsObject {
  type: string;
  url: string;
  altText: string;
  longDescription?: string;
  transcript?: string;
  captions?: any[];
  audioDescription?: any;
  signLanguage?: any;
  resourceRights?: RightsMetadata;
}

export interface KeyTerm extends XatsObject {
  term: string;
  definition: SemanticText;
}

export interface Pathway {
  trigger: {
    triggerType: string;
    sourceId?: string;
  };
  rules: {
    condition: string;
    destinationId: string;
    pathwayType?: string;
  }[];
}

export interface FileReference {
  $ref: string;
  'xats:refMetadata'?: any;
}

/**
 * Renderer configuration options
 */
export interface RendererOptions {
  /** Include CSS styles inline in the HTML output */
  includeCss?: boolean;
  /** Base URL for resolving resource links */
  baseUrl?: string;
  /** Custom CSS classes for styling */
  cssClasses?: Partial<CssClasses>;
  /** Whether to generate accessibility-compliant HTML */
  accessibility?: boolean;
  /** Language direction for the document */
  direction?: 'ltr' | 'rtl' | 'auto';
  /** Whether to include skip navigation links */
  includeSkipNavigation?: boolean;
}

export interface CssClasses {
  document: string;
  header: string;
  main: string;
  footer: string;
  unit: string;
  chapter: string;
  section: string;
  contentBlock: string;
  paragraph: string;
  heading: string;
  list: string;
  listItem: string;
  blockquote: string;
  codeBlock: string;
  mathBlock: string;
  table: string;
  figure: string;
  emphasis: string;
  strong: string;
  reference: string;
  citation: string;
  index: string;
  caseStudy: string;
  metacognitivePrompt: string;
  skipNavigation: string;
}

/**
 * Main HTML Renderer class for xats documents
 */
export class XatsHtmlRenderer {
  private options: RendererOptions;
  private cssClasses: CssClasses;
  private indexTerms: Map<string, IndexEntry[]> = new Map();
  private citations: Map<string, CslDataItem> = new Map();
  private resources: Map<string, Resource> = new Map();

  constructor(options: RendererOptions = {}) {
    this.options = {
      includeCss: true,
      accessibility: true,
      direction: 'ltr',
      includeSkipNavigation: true,
      ...options
    };

    this.cssClasses = {
      document: 'xats-document',
      header: 'xats-header',
      main: 'xats-main',
      footer: 'xats-footer',
      unit: 'xats-unit',
      chapter: 'xats-chapter',
      section: 'xats-section',
      contentBlock: 'xats-content-block',
      paragraph: 'xats-paragraph',
      heading: 'xats-heading',
      list: 'xats-list',
      listItem: 'xats-list-item',
      blockquote: 'xats-blockquote',
      codeBlock: 'xats-code-block',
      mathBlock: 'xats-math-block',
      table: 'xats-table',
      figure: 'xats-figure',
      emphasis: 'xats-emphasis',
      strong: 'xats-strong',
      reference: 'xats-reference',
      citation: 'xats-citation',
      index: 'xats-index',
      caseStudy: 'xats-case-study',
      metacognitivePrompt: 'xats-metacognitive-prompt',
      skipNavigation: 'xats-skip-navigation',
      ...options.cssClasses
    };
  }

  /**
   * Render a complete xats document to HTML
   */
  public render(document: XatsDocument): string {
    this.initializeDocument(document);
    
    const html = this.generateDocument(document);
    return html;
  }

  private initializeDocument(document: XatsDocument): void {
    // Initialize citations from bibliography
    if (document.backMatter?.bibliography) {
      for (const citation of document.backMatter.bibliography) {
        this.citations.set(citation.id, citation);
      }
    }

    // Initialize resources
    if (document.resources) {
      for (const resource of document.resources) {
        this.resources.set(resource.id, resource);
      }
    }

    // Clear index terms for new document
    this.indexTerms.clear();
  }

  private generateDocument(document: XatsDocument): string {
    const htmlParts: string[] = [];

    // Document declaration and head
    htmlParts.push(this.generateDocumentHead(document));

    // Body start
    htmlParts.push('<body>');

    // Skip navigation (if enabled)
    if (this.options.includeSkipNavigation) {
      htmlParts.push(this.generateSkipNavigation());
    }

    // Document header
    htmlParts.push(this.generateDocumentHeader(document));

    // Main content
    htmlParts.push(this.generateMainContent(document));

    // Document footer
    htmlParts.push(this.generateDocumentFooter(document));

    // Body end
    htmlParts.push('</body>');
    htmlParts.push('</html>');

    return htmlParts.join('\n');
  }

  private generateDocumentHead(document: XatsDocument): string {
    const title = this.escapeHtml(document.bibliographicEntry.title || 'xats Document');
    const firstContent = document.bodyMatter.contents[0];
    const language = (firstContent && 'language' in firstContent) ? firstContent.language : 'en';
    
    const headParts = [
      '<!DOCTYPE html>',
      `<html lang="${language}" dir="${this.options.direction}">`,
      '<head>',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      `<title>${title}</title>`,
      '<meta name="generator" content="xats-html-renderer">',
      `<meta name="schema-version" content="${document.schemaVersion}">`
    ];

    if (this.options.includeCss) {
      headParts.push('<style>');
      headParts.push(this.generateCss());
      headParts.push('</style>');
    }

    headParts.push('</head>');
    return headParts.join('\n');
  }

  private generateSkipNavigation(): string {
    return `
      <nav class="${this.cssClasses.skipNavigation}" aria-label="Skip navigation">
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <a href="#table-of-contents" class="skip-link">Skip to table of contents</a>
        <a href="#bibliography" class="skip-link">Skip to bibliography</a>
      </nav>
    `;
  }

  private generateDocumentHeader(document: XatsDocument): string {
    const title = this.escapeHtml(document.bibliographicEntry.title || 'Untitled Document');
    const authors = this.formatAuthors(document.bibliographicEntry.author);
    
    return `
      <header class="${this.cssClasses.header}">
        <h1>${title}</h1>
        ${authors ? `<div class="authors">${authors}</div>` : ''}
        <div class="document-metadata">
          <span class="subject">${this.escapeHtml(document.subject)}</span>
          ${document.targetAudience ? `<span class="target-audience">${this.escapeHtml(document.targetAudience)}</span>` : ''}
        </div>
      </header>
    `;
  }

  private generateMainContent(document: XatsDocument): string {
    const parts = [`<main id="main-content" class="${this.cssClasses.main}">`];

    // Front matter
    if (document.frontMatter?.sections) {
      parts.push('<div class="front-matter">');
      for (const section of document.frontMatter.sections) {
        parts.push(this.renderSection(section));
      }
      parts.push('</div>');
    }

    // Body matter
    parts.push('<div class="body-matter">');
    for (const item of document.bodyMatter.contents) {
      if ('sections' in item) {
        // Chapter
        parts.push(this.renderChapter(item as Chapter));
      } else if ('contents' in item) {
        // Unit
        parts.push(this.renderUnit(item as Unit));
      }
      // Note: FileReference would need special handling in a full implementation
    }
    parts.push('</div>');

    // Back matter
    if (document.backMatter?.sections) {
      parts.push('<div class="back-matter">');
      for (const section of document.backMatter.sections) {
        parts.push(this.renderSection(section));
      }
      parts.push('</div>');
    }

    parts.push('</main>');
    return parts.join('\n');
  }

  private generateDocumentFooter(document: XatsDocument): string {
    const parts = [`<footer class="${this.cssClasses.footer}">`];

    // Bibliography
    if (document.backMatter?.bibliography) {
      parts.push('<section id="bibliography" class="bibliography">');
      parts.push('<h2>Bibliography</h2>');
      parts.push('<ul>');
      for (const citation of document.backMatter.bibliography) {
        parts.push(`<li id="cite-${citation.id}">${this.formatCitation(citation)}</li>`);
      }
      parts.push('</ul>');
      parts.push('</section>');
    }

    // Index (if any index terms were collected)
    if (this.indexTerms.size > 0) {
      parts.push(this.generateIndex());
    }

    // Rights information
    if (document.rights) {
      parts.push(this.generateRightsInfo(document.rights));
    }

    parts.push('</footer>');
    return parts.join('\n');
  }

  private renderUnit(unit: Unit): string {
    const parts = [`<section class="${this.cssClasses.unit}" id="${unit.id}">`];
    
    // Unit header
    parts.push(`<header>`);
    if (unit.label) {
      parts.push(`<span class="unit-label">${this.escapeHtml(unit.label)}</span>`);
    }
    parts.push(`<h1>${this.escapeHtml(unit.title)}</h1>`);
    parts.push(`</header>`);

    // Introduction
    if (unit.introduction) {
      parts.push(`<div class="introduction">${this.renderSemanticText(unit.introduction)}</div>`);
    }

    // Contents
    parts.push('<div class="unit-contents">');
    for (const item of unit.contents) {
      if ('sections' in item) {
        parts.push(this.renderChapter(item as Chapter));
      } else if ('contents' in item) {
        parts.push(this.renderUnit(item as Unit));
      }
    }
    parts.push('</div>');

    parts.push('</section>');
    return parts.join('\n');
  }

  private renderChapter(chapter: Chapter): string {
    const parts = [`<section class="${this.cssClasses.chapter}" id="${chapter.id}">`];
    
    // Chapter header
    parts.push(`<header>`);
    if (chapter.label) {
      parts.push(`<span class="chapter-label">${this.escapeHtml(chapter.label)}</span>`);
    }
    parts.push(`<h2>${this.escapeHtml(chapter.title)}</h2>`);
    parts.push(`</header>`);

    // Introduction
    if (chapter.introduction) {
      parts.push(`<div class="introduction">${this.renderSemanticText(chapter.introduction)}</div>`);
    }

    // Learning objectives
    if (chapter.learningObjectives && chapter.learningObjectives.length > 0) {
      parts.push('<section class="learning-objectives">');
      parts.push('<h3>Learning Objectives</h3>');
      parts.push('<ul>');
      for (const objective of chapter.learningObjectives) {
        parts.push(`<li id="${objective.id}">${this.escapeHtml(objective.id)}</li>`);
      }
      parts.push('</ul>');
      parts.push('</section>');
    }

    // Sections
    parts.push('<div class="chapter-sections">');
    for (const section of chapter.sections) {
      if ('content' in section) {
        parts.push(this.renderSection(section as Section));
      }
    }
    parts.push('</div>');

    // Summary
    if (chapter.summary) {
      parts.push(`<div class="summary">${this.renderSemanticText(chapter.summary)}</div>`);
    }

    // Key terms
    if (chapter.keyTerms && chapter.keyTerms.length > 0) {
      parts.push('<section class="key-terms">');
      parts.push('<h3>Key Terms</h3>');
      parts.push('<dl>');
      for (const term of chapter.keyTerms) {
        parts.push(`<dt id="${term.id}">${this.escapeHtml(term.term)}</dt>`);
        parts.push(`<dd>${this.renderSemanticText(term.definition)}</dd>`);
      }
      parts.push('</dl>');
      parts.push('</section>');
    }

    parts.push('</section>');
    return parts.join('\n');
  }

  private renderSection(section: Section): string {
    const parts = [`<section class="${this.cssClasses.section}" id="${section.id}">`];
    
    // Section header
    parts.push(`<header>`);
    if (section.label) {
      parts.push(`<span class="section-label">${this.escapeHtml(section.label)}</span>`);
    }
    parts.push(`<h3>${this.escapeHtml(section.title)}</h3>`);
    parts.push(`</header>`);

    // Content blocks
    parts.push('<div class="section-content">');
    for (const block of section.content) {
      parts.push(this.renderContentBlock(block));
    }
    parts.push('</div>');

    parts.push('</section>');
    return parts.join('\n');
  }

  private renderContentBlock(block: ContentBlock): string {
    const blockClass = `${this.cssClasses.contentBlock} ${this.getBlockTypeClass(block.blockType)}`;
    const wrapper = `<div class="${blockClass}" id="${block.id}">`;
    
    let content = '';
    
    switch (block.blockType) {
      case 'https://xats.org/core/blocks/paragraph':
        content = this.renderParagraph(block.content);
        break;
      case 'https://xats.org/core/blocks/heading':
        content = this.renderHeading(block.content);
        break;
      case 'https://xats.org/core/blocks/list':
        content = this.renderList(block.content);
        break;
      case 'https://xats.org/core/blocks/blockquote':
        content = this.renderBlockquote(block.content);
        break;
      case 'https://xats.org/core/blocks/codeBlock':
        content = this.renderCodeBlock(block.content);
        break;
      case 'https://xats.org/core/blocks/mathBlock':
        content = this.renderMathBlock(block.content);
        break;
      case 'https://xats.org/core/blocks/table':
        content = this.renderTable(block.content);
        break;
      case 'https://xats.org/core/blocks/figure':
        content = this.renderFigure(block.content);
        break;
      case 'https://xats.org/core/blocks/caseStudy':
        content = this.renderCaseStudy(block.content);
        break;
      case 'https://xats.org/core/blocks/metacognitivePrompt':
        content = this.renderMetacognitivePrompt(block.content);
        break;
      default:
        // Handle placeholder blocks and unknown blocks
        if (block.blockType.includes('placeholders')) {
          content = this.renderPlaceholder(block.blockType);
        } else {
          content = this.renderUnknownBlock(block);
        }
        break;
    }

    return `${wrapper}${content}</div>`;
  }

  private renderSemanticText(text: SemanticText): string {
    const parts: string[] = [];
    
    for (const run of text.runs) {
      switch (run.type) {
        case 'text':
          parts.push(this.escapeHtml(run.text));
          break;
        case 'emphasis':
          parts.push(`<em class="${this.cssClasses.emphasis}">${this.escapeHtml(run.text)}</em>`);
          break;
        case 'strong':
          parts.push(`<strong class="${this.cssClasses.strong}">${this.escapeHtml(run.text)}</strong>`);
          break;
        case 'reference':
          parts.push(`<a href="#${run.refId}" class="${this.cssClasses.reference}">${this.escapeHtml(run.text)}</a>`);
          break;
        case 'citation': {
          const citation = this.citations.get(run.refId);
          const citationText = citation ? this.formatInlineCitation(citation) : `[${run.refId}]`;
          parts.push(`<a href="#cite-${run.refId}" class="${this.cssClasses.citation}">${citationText}</a>`);
          break;
        }
        case 'index':
          parts.push(this.renderIndexRun(run));
          break;
        default:
          parts.push(this.escapeHtml((run as any).text || ''));
          break;
      }
    }

    return parts.join('');
  }

  private renderIndexRun(run: IndexRun): string {
    const indexTerm = run.indexTerm || run.text;
    const indexId = run.indexId || `idx-${this.generateId(indexTerm)}`;
    
    // Store index entry
    if (!this.indexTerms.has(indexTerm)) {
      this.indexTerms.set(indexTerm, []);
    }
    const entry: IndexEntry = {
      id: indexId,
      text: run.text
    };
    if (run.subTerm) entry.subTerm = run.subTerm;
    if (run.crossReferences) entry.crossReferences = run.crossReferences;
    if (run.redirectTo) entry.redirectTo = run.redirectTo;
    
    this.indexTerms.get(indexTerm)!.push(entry);

    return `<span class="${this.cssClasses.index}" id="${indexId}" data-index-term="${this.escapeHtml(indexTerm)}"${run.subTerm ? ` data-index-subterm="${this.escapeHtml(run.subTerm)}"` : ''}>${this.escapeHtml(run.text)}</span>`;
  }

  // Content block renderers will be implemented next...
  private renderParagraph(content: any): string {
    return `<p class="${this.cssClasses.paragraph}">${this.renderSemanticText(content.text)}</p>`;
  }

  private renderHeading(content: any): string {
    const level = Math.min(6, Math.max(1, content.level || 4)); // Default to h4, clamp to h1-h6
    return `<h${level} class="${this.cssClasses.heading}">${this.renderSemanticText(content.text)}</h${level}>`;
  }

  private renderList(content: any): string {
    const tag = content.listType === 'ordered' ? 'ol' : 'ul';
    const items = content.items.map((item: any) => {
      const itemContent = this.renderSemanticText(item.text);
      const subItems = item.subItems ? item.subItems.map((sub: any) => this.renderContentBlock(sub)).join('') : '';
      return `<li class="${this.cssClasses.listItem}">${itemContent}${subItems}</li>`;
    }).join('');
    
    return `<${tag} class="${this.cssClasses.list}">${items}</${tag}>`;
  }

  private renderBlockquote(content: any): string {
    return `<blockquote class="${this.cssClasses.blockquote}">${this.renderSemanticText(content.text)}</blockquote>`;
  }

  private renderCodeBlock(content: any): string {
    const language = content.language ? ` class="language-${content.language}"` : '';
    const code = this.escapeHtml(content.code);
    return `<pre class="${this.cssClasses.codeBlock}"><code${language}>${code}</code></pre>`;
  }

  private renderMathBlock(content: any): string {
    const altText = content.altText ? ` alt="${this.escapeHtml(content.altText)}"` : '';
    const mathContent = this.escapeHtml(content.expression);
    
    // For a full implementation, you'd integrate with MathJax or KaTeX
    return `<div class="${this.cssClasses.mathBlock}" role="img"${altText}>
      <span class="math-expression" data-notation="${content.notation}">${mathContent}</span>
    </div>`;
  }

  private renderTable(content: any): string {
    const caption = content.caption ? `<caption>${this.renderSemanticText(content.caption)}</caption>` : '';
    const summary = content.summary ? ` aria-describedby="table-summary-${this.generateId()}"` : '';
    
    const headers = content.headers ? content.headers.map((header: any) => 
      `<th scope="${header.scope || 'col'}"${header.abbr ? ` abbr="${this.escapeHtml(header.abbr)}"` : ''}>${this.renderSemanticText(header)}</th>`
    ).join('') : '';

    const rows = content.rows.map((row: any) => {
      const cells = row.cells.map((cell: any) => {
        const tag = cell.isHeader ? 'th' : 'td';
        const scope = cell.isHeader && cell.scope ? ` scope="${cell.scope}"` : '';
        const colspan = cell.colspan && cell.colspan > 1 ? ` colspan="${cell.colspan}"` : '';
        const rowspan = cell.rowspan && cell.rowspan > 1 ? ` rowspan="${cell.rowspan}"` : '';
        return `<${tag}${scope}${colspan}${rowspan}>${this.renderSemanticText(cell)}</${tag}>`;
      }).join('');
      return `<tr>${cells}</tr>`;
    }).join('');

    const tableBody = headers ? `<thead><tr>${headers}</tr></thead><tbody>${rows}</tbody>` : `<tbody>${rows}</tbody>`;
    
    return `<table class="${this.cssClasses.table}"${summary}>${caption}${tableBody}</table>`;
  }

  private renderFigure(content: any): string {
    const resource = this.resources.get(content.resourceId);
    if (!resource) {
      return `<figure class="${this.cssClasses.figure}"><p>Resource not found: ${content.resourceId}</p></figure>`;
    }

    const caption = content.caption ? `<figcaption>${this.renderSemanticText(content.caption)}</figcaption>` : '';
    const longDesc = content.longDescription ? `<div class="long-description">${this.renderSemanticText(content.longDescription)}</div>` : '';
    
    let mediaElement = '';
    if (resource.type.includes('image')) {
      mediaElement = `<img src="${resource.url}" alt="${this.escapeHtml(content.altText)}" />`;
    } else if (resource.type.includes('video')) {
      mediaElement = `<video controls><source src="${resource.url}" /></video>`;
    } else if (resource.type.includes('audio')) {
      mediaElement = `<audio controls><source src="${resource.url}" /></audio>`;
    } else {
      mediaElement = `<a href="${resource.url}">${this.escapeHtml(content.altText)}</a>`;
    }

    return `<figure class="${this.cssClasses.figure}">${mediaElement}${caption}${longDesc}</figure>`;
  }

  private renderCaseStudy(content: any): string {
    const parts = [`<article class="${this.cssClasses.caseStudy}">`];
    
    // Title
    parts.push(`<header><h4>${this.renderSemanticText(content.title)}</h4></header>`);
    
    // Scenario
    parts.push(`<section class="case-scenario">
      <h5>Scenario</h5>
      <div>${this.renderSemanticText(content.scenario)}</div>
    </section>`);

    // Background
    if (content.background) {
      parts.push(`<section class="case-background">
        <h5>Background</h5>
        <div>${this.renderSemanticText(content.background)}</div>
      </section>`);
    }

    // Stakeholders
    if (content.stakeholders && content.stakeholders.length > 0) {
      parts.push('<section class="case-stakeholders">');
      parts.push('<h5>Key Stakeholders</h5>');
      parts.push('<div class="stakeholder-list">');
      for (const stakeholder of content.stakeholders) {
        parts.push(`<div class="stakeholder">
          <h6>${this.escapeHtml(stakeholder.name)} <span class="role">(${this.escapeHtml(stakeholder.role)})</span></h6>
          ${stakeholder.description ? `<p>${this.renderSemanticText(stakeholder.description)}</p>` : ''}
          ${stakeholder.motivations ? `<div class="motivations"><strong>Motivations:</strong> ${stakeholder.motivations.map((m: string) => this.escapeHtml(m)).join(', ')}</div>` : ''}
        </div>`);
      }
      parts.push('</div>');
      parts.push('</section>');
    }

    // Timeline
    if (content.timeline && content.timeline.length > 0) {
      parts.push('<section class="case-timeline">');
      parts.push('<h5>Timeline</h5>');
      parts.push('<div class="timeline">');
      for (const event of content.timeline) {
        parts.push(`<div class="timeline-event">
          <div class="event-date">${this.escapeHtml(event.date || '')}</div>
          <div class="event-content">
            <div class="event-description">${this.renderSemanticText(event.event)}</div>
            ${event.significance ? `<div class="event-significance">${this.escapeHtml(event.significance)}</div>` : ''}
          </div>
        </div>`);
      }
      parts.push('</div>');
      parts.push('</section>');
    }

    // Questions
    if (content.questions && content.questions.length > 0) {
      parts.push('<section class="case-questions">');
      parts.push('<h5>Discussion Questions</h5>');
      parts.push('<ol>');
      for (const question of content.questions) {
        parts.push(`<li class="case-question" data-type="${question.type}" data-cognitive-level="${question.cognitiveLevel || ''}">
          ${this.renderSemanticText(question.question)}
          ${question.hints ? `<div class="question-hints">${question.hints.map((hint: any) => this.renderSemanticText(hint)).join('')}</div>` : ''}
        </li>`);
      }
      parts.push('</ol>');
      parts.push('</section>');
    }

    // Metadata
    const metadata = [];
    if (content.difficultyLevel) metadata.push(`Difficulty: ${content.difficultyLevel}`);
    if (content.estimatedTimeMinutes) metadata.push(`Estimated time: ${content.estimatedTimeMinutes} minutes`);
    if (metadata.length > 0) {
      parts.push(`<footer class="case-metadata">
        <div class="metadata">${metadata.join(' | ')}</div>
      </footer>`);
    }

    parts.push('</article>');
    return parts.join('\n');
  }

  private renderMetacognitivePrompt(content: any): string {
    const parts = [`<aside class="${this.cssClasses.metacognitivePrompt}" data-prompt-type="${content.promptType}" data-timing="${content.timing || ''}">`];
    
    // Header
    parts.push(`<header>
      <h4 class="prompt-type">${this.formatPromptType(content.promptType)} Prompt</h4>
    </header>`);

    // Main prompt
    parts.push(`<div class="main-prompt">
      ${this.renderSemanticText(content.prompt)}
    </div>`);

    // Context
    if (content.context) {
      parts.push(`<div class="prompt-context">
        <strong>Context:</strong> ${this.renderSemanticText(content.context)}
      </div>`);
    }

    // Guiding questions
    if (content.guidingQuestions && content.guidingQuestions.length > 0) {
      parts.push('<div class="guiding-questions">');
      parts.push('<h5>Consider these questions:</h5>');
      parts.push('<ul>');
      for (const gq of content.guidingQuestions) {
        parts.push(`<li data-purpose="${gq.purpose || ''}">
          ${this.renderSemanticText(gq.question)}
        </li>`);
      }
      parts.push('</ul>');
      parts.push('</div>');
    }

    // Scaffolding
    if (content.scaffolding) {
      if (content.scaffolding.sentence_starters && content.scaffolding.sentence_starters.length > 0) {
        parts.push('<div class="sentence-starters">');
        parts.push('<h5>Sentence starters:</h5>');
        parts.push('<ul>');
        for (const starter of content.scaffolding.sentence_starters) {
          parts.push(`<li>"${this.escapeHtml(starter)}"</li>`);
        }
        parts.push('</ul>');
        parts.push('</div>');
      }

      if (content.scaffolding.examples && content.scaffolding.examples.length > 0) {
        parts.push('<div class="example-responses">');
        parts.push('<h5>Example responses:</h5>');
        for (const example of content.scaffolding.examples) {
          parts.push(`<div class="example">${this.renderSemanticText(example)}</div>`);
        }
        parts.push('</div>');
      }
    }

    // Response format and timing metadata
    const metadata = [];
    if (content.responseFormat) metadata.push(`Response format: ${content.responseFormat.replace('-', ' ')}`);
    if (content.estimatedTimeMinutes) metadata.push(`Estimated time: ${content.estimatedTimeMinutes} minutes`);
    if (metadata.length > 0) {
      parts.push(`<footer class="prompt-metadata">
        <div class="metadata">${metadata.join(' | ')}</div>
      </footer>`);
    }

    parts.push('</aside>');
    return parts.join('\n');
  }

  private renderPlaceholder(blockType: string): string {
    if (blockType.includes('tableOfContents')) {
      return '<div class="toc-placeholder">[Table of Contents will be generated here]</div>';
    } else if (blockType.includes('bibliography')) {
      return '<div class="bibliography-placeholder">[Bibliography will be generated here]</div>';
    } else if (blockType.includes('index')) {
      return '<div class="index-placeholder">[Index will be generated here]</div>';
    }
    return '<div class="unknown-placeholder">[Unknown placeholder]</div>';
  }

  private renderUnknownBlock(block: ContentBlock): string {
    // Fallback renderer for unknown block types
    if (block.content.text) {
      // If it has semantic text, render as paragraph
      return `<div class="unknown-block" data-block-type="${block.blockType}">
        <p>${this.renderSemanticText(block.content.text)}</p>
      </div>`;
    } else {
      // Otherwise, show a placeholder
      return `<div class="unknown-block" data-block-type="${block.blockType}">
        <p><em>Unsupported content block type: ${block.blockType}</em></p>
      </div>`;
    }
  }

  // Helper methods
  private escapeHtml(text: string): string {
    // Use Node.js compatible HTML escaping
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private generateId(text?: string): string {
    const base = text ? text.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'item';
    return `${base}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getBlockTypeClass(blockType: string): string {
    const type = blockType.split('/').pop() || 'unknown';
    return `block-type-${type}`;
  }

  private formatAuthors(authors: any[] | undefined): string {
    if (!authors || authors.length === 0) return '';
    
    return authors.map(author => {
      if (typeof author === 'string') return author;
      if (author.given && author.family) {
        return `${author.given} ${author.family}`;
      }
      return author.literal || '';
    }).filter(Boolean).join(', ');
  }

  private formatCitation(citation: CslDataItem): string {
    // Simplified citation formatting - in practice, use a CSL processor
    const title = citation.title || 'Untitled';
    const authors = this.formatAuthors(citation.author || []);
    const year = citation.issued?.['date-parts']?.[0]?.[0] || '';
    
    return `${authors}${authors && year ? ` (${year})` : ''}. ${title}.`;
  }

  private formatInlineCitation(citation: CslDataItem): string {
    // Simplified inline citation - in practice, use a CSL processor
    const authors = citation.author ? citation.author.map((a: any) => a.family || a.literal || '').join(' & ') : '';
    const year = citation.issued?.['date-parts']?.[0]?.[0] || '';
    
    return `(${authors}, ${year})`;
  }

  private formatPromptType(type: string): string {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  private generateIndex(): string {
    const parts = ['<section id="index" class="index">'];
    parts.push('<h2>Index</h2>');
    
    // Sort index terms alphabetically
    const sortedTerms = Array.from(this.indexTerms.keys()).sort();
    
    parts.push('<div class="index-entries">');
    for (const term of sortedTerms) {
      const entries = this.indexTerms.get(term)!;
      parts.push(`<div class="index-term">`);
      parts.push(`<span class="term">${this.escapeHtml(term)}</span>`);
      
      // Group by subterm
      const subTermGroups = new Map<string | undefined, typeof entries>();
      for (const entry of entries) {
        const key = entry.subTerm;
        if (!subTermGroups.has(key)) {
          subTermGroups.set(key, []);
        }
        subTermGroups.get(key)!.push(entry);
      }
      
      parts.push('<div class="index-references">');
      for (const [subTerm, subEntries] of subTermGroups) {
        if (subTerm) {
          parts.push(`<div class="index-subterm">`);
          parts.push(`<span class="subterm">${this.escapeHtml(subTerm)}</span>`);
        }
        
        const references = subEntries.map(entry => 
          `<a href="#${entry.id}">${entry.id.replace(/^idx-/, '')}</a>`
        ).join(', ');
        parts.push(`<span class="references">${references}</span>`);
        
        if (subTerm) {
          parts.push('</div>');
        }
      }
      parts.push('</div>');
      
      // Cross references
      const firstEntry = entries[0];
      if (firstEntry && firstEntry.crossReferences && firstEntry.crossReferences.length > 0) {
        parts.push(`<div class="cross-references">See also: ${firstEntry.crossReferences.map(ref => this.escapeHtml(ref)).join(', ')}</div>`);
      }
      if (firstEntry && firstEntry.redirectTo) {
        parts.push(`<div class="redirect">See: ${this.escapeHtml(firstEntry.redirectTo)}</div>`);
      }
      
      parts.push('</div>');
    }
    parts.push('</div>');
    
    parts.push('</section>');
    return parts.join('\n');
  }

  private generateRightsInfo(rights: RightsMetadata): string {
    const parts = ['<section class="rights-info">'];
    parts.push('<h3>Rights and Licensing</h3>');
    
    if (rights.license) {
      parts.push(`<div class="license">
        <strong>License:</strong> 
        ${rights.licenseUrl ? `<a href="${rights.licenseUrl}">` : ''}
        ${this.escapeHtml(rights.license)}
        ${rights.licenseUrl ? '</a>' : ''}
      </div>`);
    }
    
    if (rights.copyrightHolder) {
      parts.push(`<div class="copyright">
        <strong>Copyright:</strong> 
        © ${rights.copyrightYear || new Date().getFullYear()} ${this.escapeHtml(rights.copyrightHolder)}
      </div>`);
    }
    
    if (rights.rightsStatement) {
      parts.push(`<div class="rights-statement">${this.escapeHtml(rights.rightsStatement)}</div>`);
    }
    
    parts.push('</section>');
    return parts.join('\n');
  }

  private generateCss(): string {
    return `
      /* xats HTML Renderer Default Styles */
      
      /* Reset and base styles */
      .${this.cssClasses.document} {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        font-family: Georgia, 'Times New Roman', serif;
        line-height: 1.6;
        color: #333;
      }
      
      /* Skip navigation */
      .${this.cssClasses.skipNavigation} {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        background: #000;
        z-index: 1000;
      }
      
      .skip-link {
        position: absolute;
        left: -9999px;
        color: white;
        text-decoration: none;
        padding: 8px;
      }
      
      .skip-link:focus {
        position: static;
        left: auto;
      }
      
      /* Document header */
      .${this.cssClasses.header} {
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 2rem;
        margin-bottom: 3rem;
      }
      
      .${this.cssClasses.header} h1 {
        font-size: 2.5rem;
        margin: 0 0 1rem 0;
        color: #2c3e50;
      }
      
      .authors {
        font-size: 1.2rem;
        color: #666;
        margin-bottom: 1rem;
      }
      
      .document-metadata {
        font-size: 0.9rem;
        color: #888;
      }
      
      .subject, .target-audience {
        margin-right: 2rem;
      }
      
      /* Main content structure */
      .${this.cssClasses.main} {
        min-height: 60vh;
      }
      
      /* Structural containers */
      .${this.cssClasses.unit} {
        margin: 3rem 0;
        border-left: 4px solid #3498db;
        padding-left: 2rem;
      }
      
      .${this.cssClasses.chapter} {
        margin: 2.5rem 0;
        border-left: 3px solid #2ecc71;
        padding-left: 1.5rem;
      }
      
      .${this.cssClasses.section} {
        margin: 2rem 0;
        padding-left: 1rem;
      }
      
      /* Labels and titles */
      .unit-label, .chapter-label, .section-label {
        display: inline-block;
        font-weight: bold;
        color: #666;
        margin-right: 0.5rem;
        font-size: 0.9em;
      }
      
      /* Content blocks */
      .${this.cssClasses.contentBlock} {
        margin: 1.5rem 0;
      }
      
      .${this.cssClasses.paragraph} {
        margin: 1rem 0;
        text-align: justify;
      }
      
      .${this.cssClasses.heading} {
        margin: 2rem 0 1rem 0;
        color: #2c3e50;
      }
      
      .${this.cssClasses.list} {
        margin: 1rem 0;
        padding-left: 2rem;
      }
      
      .${this.cssClasses.listItem} {
        margin: 0.5rem 0;
      }
      
      .${this.cssClasses.blockquote} {
        margin: 1.5rem 2rem;
        padding: 1rem 2rem;
        background: #f8f9fa;
        border-left: 4px solid #e9ecef;
        font-style: italic;
      }
      
      .${this.cssClasses.codeBlock} {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        padding: 1rem;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
      }
      
      .${this.cssClasses.mathBlock} {
        text-align: center;
        margin: 1.5rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 4px;
      }
      
      .${this.cssClasses.table} {
        width: 100%;
        border-collapse: collapse;
        margin: 1.5rem 0;
      }
      
      .${this.cssClasses.table} th,
      .${this.cssClasses.table} td {
        padding: 0.75rem;
        text-align: left;
        border: 1px solid #dee2e6;
      }
      
      .${this.cssClasses.table} th {
        background-color: #f8f9fa;
        font-weight: bold;
      }
      
      .${this.cssClasses.table} caption {
        font-weight: bold;
        margin-bottom: 0.5rem;
        text-align: left;
      }
      
      .${this.cssClasses.figure} {
        margin: 2rem 0;
        text-align: center;
      }
      
      .${this.cssClasses.figure} img,
      .${this.cssClasses.figure} video,
      .${this.cssClasses.figure} audio {
        max-width: 100%;
        height: auto;
      }
      
      .${this.cssClasses.figure} figcaption {
        margin-top: 0.5rem;
        font-style: italic;
        color: #666;
      }
      
      /* Semantic text runs */
      .${this.cssClasses.emphasis} {
        font-style: italic;
      }
      
      .${this.cssClasses.strong} {
        font-weight: bold;
      }
      
      .${this.cssClasses.reference} {
        color: #3498db;
        text-decoration: underline;
      }
      
      .${this.cssClasses.reference}:hover {
        color: #2980b9;
      }
      
      .${this.cssClasses.citation} {
        color: #e74c3c;
        text-decoration: none;
        font-weight: 500;
      }
      
      .${this.cssClasses.citation}:hover {
        text-decoration: underline;
      }
      
      .${this.cssClasses.index} {
        background: #fff3cd;
        padding: 0 2px;
        border-radius: 2px;
        cursor: help;
      }
      
      /* v0.3.0 Features */
      
      /* Case Study */
      .${this.cssClasses.caseStudy} {
        border: 2px solid #f39c12;
        border-radius: 8px;
        padding: 2rem;
        margin: 2rem 0;
        background: #fefcf3;
      }
      
      .${this.cssClasses.caseStudy} header h4 {
        color: #d68910;
        margin: 0 0 1.5rem 0;
        font-size: 1.5rem;
      }
      
      .case-scenario,
      .case-background,
      .case-stakeholders,
      .case-timeline,
      .case-questions {
        margin: 1.5rem 0;
      }
      
      .case-scenario h5,
      .case-background h5,
      .case-stakeholders h5,
      .case-timeline h5,
      .case-questions h5 {
        color: #b7950b;
        font-size: 1.1rem;
        margin: 0 0 0.75rem 0;
        border-bottom: 1px solid #f1c40f;
        padding-bottom: 0.25rem;
      }
      
      .stakeholder {
        margin: 1rem 0;
        padding: 1rem;
        background: white;
        border-radius: 4px;
        border-left: 3px solid #f39c12;
      }
      
      .stakeholder h6 {
        margin: 0 0 0.5rem 0;
        color: #d68910;
      }
      
      .stakeholder .role {
        font-weight: normal;
        color: #666;
      }
      
      .motivations {
        font-size: 0.9rem;
        color: #666;
        margin-top: 0.5rem;
      }
      
      .timeline {
        position: relative;
        padding-left: 2rem;
      }
      
      .timeline-event {
        margin: 1rem 0;
        position: relative;
      }
      
      .timeline-event::before {
        content: '';
        position: absolute;
        left: -1.5rem;
        top: 0.5rem;
        width: 10px;
        height: 10px;
        background: #f39c12;
        border-radius: 50%;
      }
      
      .event-date {
        font-weight: bold;
        color: #d68910;
        font-size: 0.9rem;
      }
      
      .event-significance {
        font-size: 0.85rem;
        color: #666;
        font-style: italic;
      }
      
      .case-questions ol {
        counter-reset: question;
      }
      
      .case-question {
        margin: 1rem 0;
        padding: 0.75rem;
        background: white;
        border-radius: 4px;
        position: relative;
      }
      
      .case-question::before {
        counter-increment: question;
        content: counter(question);
        position: absolute;
        left: -2rem;
        top: 0.75rem;
        width: 1.5rem;
        height: 1.5rem;
        background: #f39c12;
        color: white;
        border-radius: 50%;
        text-align: center;
        font-size: 0.8rem;
        line-height: 1.5rem;
        font-weight: bold;
      }
      
      .question-hints {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: #f8f9fa;
        border-radius: 4px;
        font-size: 0.9rem;
        color: #666;
      }
      
      .case-metadata {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #f1c40f;
        font-size: 0.9rem;
        color: #666;
      }
      
      /* Metacognitive Prompt */
      .${this.cssClasses.metacognitivePrompt} {
        border: 2px solid #9b59b6;
        border-radius: 8px;
        padding: 1.5rem;
        margin: 2rem 0;
        background: #f8f5ff;
      }
      
      .${this.cssClasses.metacognitivePrompt} header h4 {
        color: #8e44ad;
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
      }
      
      .main-prompt {
        font-size: 1.1rem;
        margin: 1rem 0;
        padding: 1rem;
        background: white;
        border-radius: 4px;
        border-left: 4px solid #9b59b6;
      }
      
      .prompt-context {
        margin: 1rem 0;
        padding: 0.75rem;
        background: rgba(155, 89, 182, 0.1);
        border-radius: 4px;
        font-size: 0.95rem;
      }
      
      .guiding-questions h5 {
        color: #8e44ad;
        margin: 1rem 0 0.5rem 0;
        font-size: 1rem;
      }
      
      .guiding-questions li {
        margin: 0.5rem 0;
        padding-left: 0.5rem;
      }
      
      .sentence-starters,
      .example-responses {
        margin: 1rem 0;
      }
      
      .sentence-starters h5,
      .example-responses h5 {
        color: #8e44ad;
        margin: 0 0 0.5rem 0;
        font-size: 0.95rem;
      }
      
      .sentence-starters ul {
        margin: 0.5rem 0;
      }
      
      .sentence-starters li {
        font-style: italic;
        color: #666;
      }
      
      .example {
        margin: 0.5rem 0;
        padding: 0.5rem;
        background: white;
        border-radius: 4px;
        font-style: italic;
        color: #666;
      }
      
      .prompt-metadata {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #d1c4e9;
        font-size: 0.85rem;
        color: #666;
      }
      
      /* Footer */
      .${this.cssClasses.footer} {
        margin-top: 4rem;
        padding-top: 2rem;
        border-top: 2px solid #e0e0e0;
      }
      
      /* Bibliography */
      .bibliography h2 {
        color: #2c3e50;
        margin: 2rem 0 1rem 0;
      }
      
      .bibliography ul {
        list-style: none;
        padding: 0;
      }
      
      .bibliography li {
        margin: 1rem 0;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e9ecef;
      }
      
      /* Index */
      .index h2 {
        color: #2c3e50;
        margin: 2rem 0 1rem 0;
      }
      
      .index-entries {
        column-count: 2;
        column-gap: 2rem;
      }
      
      .index-term {
        break-inside: avoid;
        margin: 0.5rem 0;
      }
      
      .index-term .term {
        font-weight: bold;
        display: block;
      }
      
      .index-subterm {
        margin-left: 1rem;
        font-size: 0.9rem;
      }
      
      .index-subterm .subterm {
        font-style: italic;
      }
      
      .cross-references,
      .redirect {
        font-size: 0.85rem;
        color: #666;
        margin-left: 1rem;
      }
      
      /* Learning objectives */
      .learning-objectives {
        background: #e8f4f8;
        border: 1px solid #bee5eb;
        border-radius: 4px;
        padding: 1rem;
        margin: 1.5rem 0;
      }
      
      .learning-objectives h3 {
        color: #0c5460;
        margin: 0 0 0.75rem 0;
        font-size: 1.1rem;
      }
      
      /* Key terms */
      .key-terms {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 4px;
        padding: 1rem;
        margin: 1.5rem 0;
      }
      
      .key-terms h3 {
        color: #856404;
        margin: 0 0 0.75rem 0;
        font-size: 1.1rem;
      }
      
      .key-terms dt {
        font-weight: bold;
        color: #856404;
        margin: 0.75rem 0 0.25rem 0;
      }
      
      .key-terms dd {
        margin: 0 0 0.75rem 1rem;
      }
      
      /* Rights info */
      .rights-info {
        margin: 2rem 0;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 4px;
        font-size: 0.9rem;
      }
      
      .rights-info h3 {
        margin: 0 0 1rem 0;
        font-size: 1rem;
      }
      
      .license,
      .copyright {
        margin: 0.5rem 0;
      }
      
      .rights-statement {
        margin: 1rem 0 0 0;
        font-style: italic;
        color: #666;
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .${this.cssClasses.document} {
          padding: 1rem;
        }
        
        .${this.cssClasses.header} h1 {
          font-size: 2rem;
        }
        
        .${this.cssClasses.unit},
        .${this.cssClasses.chapter} {
          padding-left: 1rem;
        }
        
        .index-entries {
          column-count: 1;
        }
        
        .timeline {
          padding-left: 1rem;
        }
        
        .case-question::before {
          position: static;
          display: inline-block;
          margin-right: 0.5rem;
          margin-bottom: 0.5rem;
        }
      }
      
      /* Print styles */
      @media print {
        .${this.cssClasses.skipNavigation} {
          display: none;
        }
        
        .${this.cssClasses.document} {
          max-width: none;
          padding: 0;
        }
        
        .${this.cssClasses.unit},
        .${this.cssClasses.chapter},
        .${this.cssClasses.section} {
          page-break-inside: avoid;
        }
        
        .${this.cssClasses.caseStudy},
        .${this.cssClasses.metacognitivePrompt} {
          page-break-inside: avoid;
        }
      }
    `;
  }
}

// Additional interface for index entries
interface IndexEntry {
  id: string;
  text: string;
  subTerm?: string;
  crossReferences?: string[];
  redirectTo?: string;
}

// Export utility function for easy use
export function renderXatsToHtml(document: XatsDocument, options?: RendererOptions): string {
  const renderer = new XatsHtmlRenderer(options);
  return renderer.render(document);
}