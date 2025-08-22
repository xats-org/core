/**
 * LaTeX Converter - xats to LaTeX
 * 
 * Converts xats documents to LaTeX format with high fidelity preservation.
 */

import type {
  XatsDocument,
  Unit,
  Chapter,
  Section,
  ContentBlock,
  SemanticText,
  Run,
  TextRun,
  ReferenceRun,
  CitationRun,
  EmphasisRun,
  StrongRun,
  IndexRun,
  FrontMatter,
  BackMatter,
  Resource,
  LearningObjective,
  Pathway,
} from '@xats-org/types';

import type {
  LaTeXRendererOptions,
  LaTeXContext,
  LaTeXPackage,
  LaTeXCommand,
} from './types.js';

/**
 * Converts xats documents to LaTeX format
 */
export class LaTeXConverter {
  private context: LaTeXContext;
  private options: LaTeXRendererOptions;

  constructor() {
    this.context = this.createEmptyContext();
    this.options = {};
  }

  /**
   * Convert xats document to LaTeX
   */
  async convertToLaTeX(
    document: XatsDocument,
    options: LaTeXRendererOptions = {}
  ): Promise<string> {
    this.options = options;
    this.context = this.createEmptyContext();

    const parts: string[] = [];

    // Document class and options
    parts.push(this.generateDocumentClass());
    
    // Packages
    parts.push(this.generatePackages());
    
    // Custom commands
    if (options.customCommands) {
      parts.push(options.customCommands.join('\n'));
    }
    
    // Preamble additions
    if (options.preamble) {
      parts.push(options.preamble);
    }
    
    // Document metadata
    parts.push(this.generateMetadata(document));
    
    // Before begin document
    if (options.beforeBeginDocument) {
      parts.push(options.beforeBeginDocument);
    }
    
    // Begin document
    parts.push('\\begin{document}');
    
    // After begin document
    if (options.afterBeginDocument) {
      parts.push(options.afterBeginDocument);
    }
    
    // Title information
    parts.push(this.generateTitlePage(document));
    
    // Front matter
    if (document.frontMatter) {
      parts.push(await this.convertFrontMatter(document.frontMatter));
    }
    
    // Body matter
    parts.push(await this.convertBodyMatter(document.bodyMatter));
    
    // Back matter
    if (document.backMatter) {
      parts.push(await this.convertBackMatter(document.backMatter));
    }
    
    // Before end document
    if (options.beforeEndDocument) {
      parts.push(options.beforeEndDocument);
    }
    
    // End document
    parts.push('\\end{document}');

    return parts.filter(part => part.trim()).join('\n\n');
  }

  /**
   * Generate document class declaration
   */
  private generateDocumentClass(): string {
    const documentClass = this.options.documentClass || 'article';
    const options: string[] = [];

    if (this.options.fontSize) {
      options.push(this.options.fontSize);
    }
    
    if (this.options.paperSize) {
      options.push(this.options.paperSize);
    }
    
    if (this.options.documentOptions) {
      options.push(...this.options.documentOptions);
    }

    const optionsStr = options.length > 0 ? `[${options.join(',')}]` : '';
    return `\\documentclass${optionsStr}{${documentClass}}`;
  }

  /**
   * Generate package declarations
   */
  private generatePackages(): string {
    const packages: LaTeXPackage[] = [
      // Default packages
      { name: 'inputenc', options: ['utf8'], required: true },
      { name: 'fontenc', options: ['T1'], required: true },
      { name: 'babel', options: ['english'], required: true },
      { name: 'amsmath', required: true },
      { name: 'amsfonts', required: true },
      { name: 'amssymb', required: true },
      { name: 'graphicx', required: true },
      { name: 'hyperref', required: true },
      { name: 'url', required: true },
      { name: 'xcolor', required: true },
      ...(this.options.packages || []),
    ];

    // Add conditional packages
    if (this.options.useNatbib) {
      packages.push({ name: 'natbib', options: [], required: true });
    }
    
    if (this.options.useBiblatex) {
      const biblatexOptions = [];
      if (this.options.citationStyle) {
        biblatexOptions.push(`style=${this.options.citationStyle}`);
      }
      packages.push({ 
        name: 'biblatex', 
        options: biblatexOptions.length > 0 ? biblatexOptions : [],
        required: true 
      });
    }
    
    if (this.options.lineSpacing && this.options.lineSpacing !== 'singlespacing') {
      packages.push({ name: 'setspace', options: [], required: true });
    }

    // Generate package declarations
    return packages
      .map(pkg => {
        const optionsStr = pkg.options && pkg.options.length > 0 
          ? `[${pkg.options.join(',')}]` 
          : '';
        return `\\usepackage${optionsStr}{${pkg.name}}`;
      })
      .join('\n');
  }

  /**
   * Generate document metadata
   */
  private generateMetadata(document: XatsDocument): string {
    const parts: string[] = [];

    // Title
    if (document.bibliographicEntry?.title) {
      parts.push(`\\title{${this.escapeLatex(document.bibliographicEntry.title)}}`);
    }

    // Author
    if (document.bibliographicEntry?.author) {
      const authors = Array.isArray(document.bibliographicEntry.author)
        ? document.bibliographicEntry.author
        : [document.bibliographicEntry.author];
      
      const authorStr = authors
        .map(author => {
          if (typeof author === 'string') return this.escapeLatex(author);
          if (typeof author === 'object' && author.family) {
            const name = author.given ? `${author.given} ${author.family}` : author.family;
            return this.escapeLatex(name);
          }
          return '';
        })
        .filter(Boolean)
        .join(' \\and ');
      
      if (authorStr) {
        parts.push(`\\author{${authorStr}}`);
      }
    }

    // Date
    if (document.bibliographicEntry?.issued) {
      const date = document.bibliographicEntry.issued;
      if (typeof date === 'object' && date['date-parts']) {
        const dateparts = date['date-parts'][0];
        if (dateparts && dateparts.length > 0) {
          const year = dateparts[0];
          const month = dateparts[1] || 1;
          const day = dateparts[2] || 1;
          parts.push(`\\date{${new Date(year, month - 1, day).toLocaleDateString()}}`);
        }
      }
    }

    return parts.join('\n');
  }

  /**
   * Generate title page
   */
  private generateTitlePage(document: XatsDocument): string {
    if (!document.bibliographicEntry?.title) return '';
    
    return '\\maketitle';
  }

  /**
   * Convert front matter
   */
  private async convertFrontMatter(frontMatter: FrontMatter): Promise<string> {
    const parts: string[] = [];

    if (frontMatter.contents) {
      for (const block of frontMatter.contents) {
        parts.push(await this.convertContentBlock(block));
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Convert body matter
   */
  private async convertBodyMatter(bodyMatter: { contents: (Unit | Chapter)[] }): Promise<string> {
    const parts: string[] = [];

    for (const content of bodyMatter.contents) {
      if ('unitType' in content) {
        // Unit
        parts.push(await this.convertUnit(content));
      } else if ('chapterType' in content) {
        // Chapter
        parts.push(await this.convertChapter(content));
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Convert back matter
   */
  private async convertBackMatter(backMatter: BackMatter): Promise<string> {
    const parts: string[] = [];

    if (backMatter.contents) {
      for (const block of backMatter.contents) {
        parts.push(await this.convertContentBlock(block));
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Convert unit
   */
  private async convertUnit(unit: Unit): string {
    const parts: string[] = [];

    // Unit title as chapter or section depending on context
    if (unit.title) {
      const level = this.options.documentClass === 'book' || this.options.documentClass === 'report' 
        ? 'chapter' 
        : 'section';
      const titleText = await this.convertSemanticText(unit.title);
      parts.push(`\\${level}{${titleText}}`);
      
      if (unit.label) {
        parts.push(`\\label{${this.escapeLatex(unit.label)}}`);
      }
    }

    // Learning outcomes
    if (unit.learningOutcomes && unit.learningOutcomes.length > 0) {
      parts.push(await this.convertLearningOutcomes(unit.learningOutcomes));
    }

    // Contents
    if (unit.contents) {
      for (const content of unit.contents) {
        if ('sectionType' in content) {
          parts.push(await this.convertSection(content));
        } else {
          parts.push(await this.convertContentBlock(content));
        }
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Convert chapter
   */
  private async convertChapter(chapter: Chapter): string {
    const parts: string[] = [];

    // Chapter title
    if (chapter.title) {
      const titleText = await this.convertSemanticText(chapter.title);
      parts.push(`\\chapter{${titleText}}`);
      
      if (chapter.label) {
        parts.push(`\\label{${this.escapeLatex(chapter.label)}}`);
      }
    }

    // Learning outcomes
    if (chapter.learningOutcomes && chapter.learningOutcomes.length > 0) {
      parts.push(await this.convertLearningOutcomes(chapter.learningOutcomes));
    }

    // Contents
    if (chapter.contents) {
      for (const content of chapter.contents) {
        if ('sectionType' in content) {
          parts.push(await this.convertSection(content));
        } else {
          parts.push(await this.convertContentBlock(content));
        }
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Convert section
   */
  private async convertSection(section: Section): string {
    const parts: string[] = [];

    // Section title
    if (section.title) {
      const level = this.getSectionLevel(section.sectionType);
      const titleText = await this.convertSemanticText(section.title);
      parts.push(`\\${level}{${titleText}}`);
      
      if (section.label) {
        parts.push(`\\label{${this.escapeLatex(section.label)}}`);
      }
    }

    // Learning outcomes
    if (section.learningOutcomes && section.learningOutcomes.length > 0) {
      parts.push(await this.convertLearningOutcomes(section.learningOutcomes));
    }

    // Contents
    if (section.contents) {
      for (const content of section.contents) {
        if ('sectionType' in content) {
          parts.push(await this.convertSection(content));
        } else {
          parts.push(await this.convertContentBlock(content));
        }
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Get LaTeX section level command
   */
  private getSectionLevel(sectionType: string): string {
    const isBook = this.options.documentClass === 'book' || this.options.documentClass === 'report';
    
    switch (sectionType) {
      case 'primary':
        return isBook ? 'section' : 'section';
      case 'secondary':
        return 'subsection';
      case 'tertiary':
        return 'subsubsection';
      case 'quaternary':
        return 'paragraph';
      case 'quinary':
        return 'subparagraph';
      default:
        return 'section';
    }
  }

  /**
   * Convert learning outcomes
   */
  private async convertLearningOutcomes(outcomes: any[]): Promise<string> {
    const parts = ['\\begin{quote}', '\\textbf{Learning Outcomes:}', '\\begin{itemize}'];
    
    for (const outcome of outcomes) {
      // Handle both old LearningObjective format and new LearningOutcome format
      const outcomeText = outcome.objective ? 
        await this.convertSemanticText(outcome.objective) :
        await this.convertSemanticText(outcome.outcome || { runs: [{ type: 'text', text: 'Outcome' }] });
      parts.push(`\\item ${outcomeText}`);
    }
    
    parts.push('\\end{itemize}', '\\end{quote}');
    
    return parts.join('\n');
  }

  /**
   * Convert content block
   */
  private async convertContentBlock(block: ContentBlock): string {
    if (!block.content) return '';

    switch (block.blockType) {
      case 'https://xats.org/vocabularies/blocks/paragraph':
        return await this.convertParagraphBlock(block);
      
      case 'https://xats.org/vocabularies/blocks/heading':
        return await this.convertHeadingBlock(block);
      
      case 'https://xats.org/vocabularies/blocks/list':
        return await this.convertListBlock(block);
      
      case 'https://xats.org/vocabularies/blocks/blockquote':
        return await this.convertBlockquoteBlock(block);
      
      case 'https://xats.org/vocabularies/blocks/codeBlock':
        return await this.convertCodeBlock(block);
      
      case 'https://xats.org/vocabularies/blocks/mathBlock':
        return await this.convertMathBlock(block);
      
      case 'https://xats.org/vocabularies/blocks/table':
        return await this.convertTableBlock(block);
      
      case 'https://xats.org/vocabularies/blocks/figure':
        return await this.convertFigureBlock(block);
      
      case 'https://xats.org/vocabularies/placeholders/tableOfContents':
        return '\\tableofcontents';
      
      case 'https://xats.org/vocabularies/placeholders/bibliography':
        return this.generateBibliography();
      
      case 'https://xats.org/vocabularies/placeholders/index':
        return '\\printindex';
      
      default:
        // Unknown block type - convert as paragraph
        return await this.convertParagraphBlock(block);
    }
  }

  /**
   * Convert paragraph block
   */
  private async convertParagraphBlock(block: ContentBlock): string {
    if (typeof block.content === 'object' && 'runs' in block.content) {
      return await this.convertSemanticText(block.content);
    }
    return '';
  }

  /**
   * Convert heading block
   */
  private async convertHeadingBlock(block: ContentBlock): string {
    if (typeof block.content === 'object' && 'runs' in block.content) {
      const level = block.renderingHints?.find(hint => hint.hintType === 'level')?.value as number || 1;
      const command = this.getHeadingCommand(level);
      const text = await this.convertSemanticText(block.content);
      
      let result = `\\${command}{${text}}`;
      
      if (block.id) {
        result += `\n\\label{${this.escapeLatex(block.id)}}`;
      }
      
      return result;
    }
    return '';
  }

  /**
   * Get heading command for level
   */
  private getHeadingCommand(level: number): string {
    const isBook = this.options.documentClass === 'book' || this.options.documentClass === 'report';
    
    if (isBook) {
      switch (level) {
        case 1: return 'chapter';
        case 2: return 'section';
        case 3: return 'subsection';
        case 4: return 'subsubsection';
        case 5: return 'paragraph';
        case 6: return 'subparagraph';
        default: return 'section';
      }
    } else {
      switch (level) {
        case 1: return 'section';
        case 2: return 'subsection';
        case 3: return 'subsubsection';
        case 4: return 'paragraph';
        case 5: return 'subparagraph';
        default: return 'section';
      }
    }
  }

  /**
   * Convert list block
   */
  private async convertListBlock(block: ContentBlock): string {
    if (!block.content || typeof block.content !== 'object' || !('items' in block.content)) {
      return '';
    }

    const listType = block.renderingHints?.find(hint => hint.hintType === 'listType')?.value as string || 'itemize';
    const environment = listType === 'ordered' ? 'enumerate' : 
                       listType === 'description' ? 'description' : 'itemize';
    
    const parts = [`\\begin{${environment}}`];
    
    for (const item of (block.content as any).items) {
      if (typeof item === 'object' && 'runs' in item) {
        const itemText = await this.convertSemanticText(item);
        parts.push(`\\item ${itemText}`);
      }
    }
    
    parts.push(`\\end{${environment}}`);
    
    return parts.join('\n');
  }

  /**
   * Convert blockquote block
   */
  private async convertBlockquoteBlock(block: ContentBlock): string {
    if (typeof block.content === 'object' && 'runs' in block.content) {
      const text = await this.convertSemanticText(block.content);
      return `\\begin{quote}\n${text}\n\\end{quote}`;
    }
    return '';
  }

  /**
   * Convert code block
   */
  private async convertCodeBlock(block: ContentBlock): string {
    if (typeof block.content === 'string') {
      const language = block.renderingHints?.find(hint => hint.hintType === 'language')?.value as string;
      
      if (language) {
        return `\\begin{lstlisting}[language=${language}]\n${block.content}\n\\end{lstlisting}`;
      } else {
        return `\\begin{verbatim}\n${block.content}\n\\end{verbatim}`;
      }
    }
    return '';
  }

  /**
   * Convert math block
   */
  private async convertMathBlock(block: ContentBlock): string {
    if (typeof block.content === 'string') {
      const numbered = block.renderingHints?.find(hint => hint.hintType === 'numbered')?.value as boolean;
      const environment = numbered ? 'equation' : 'equation*';
      
      let result = `\\begin{${environment}}\n${block.content}\n\\end{${environment}}`;
      
      if (block.id) {
        result = result.replace('\\end{equation}', `\\label{${this.escapeLatex(block.id)}}\n\\end{equation}`);
      }
      
      return result;
    }
    return '';
  }

  /**
   * Convert table block
   */
  private async convertTableBlock(block: ContentBlock): string {
    // This is a simplified implementation
    // Real implementation would need to parse table structure
    if (typeof block.content === 'object') {
      return '\\begin{table}[h]\n\\centering\n% Table implementation needed\n\\caption{Table}\n\\end{table}';
    }
    return '';
  }

  /**
   * Convert figure block
   */
  private async convertFigureBlock(block: ContentBlock): string {
    if (typeof block.content === 'object' && 'src' in block.content) {
      const src = (block.content as any).src;
      const alt = (block.content as any).alt || '';
      const caption = (block.content as any).caption || '';
      
      const parts = [
        '\\begin{figure}[h]',
        '\\centering',
        `\\includegraphics[width=0.8\\textwidth]{${this.escapeLatex(src)}}`,
      ];
      
      if (caption) {
        parts.push(`\\caption{${this.escapeLatex(caption)}}`);
      }
      
      if (block.id) {
        parts.push(`\\label{${this.escapeLatex(block.id)}}`);
      }
      
      parts.push('\\end{figure}');
      
      return parts.join('\n');
    }
    return '';
  }

  /**
   * Generate bibliography section
   */
  private generateBibliography(): string {
    if (this.options.useBiblatex) {
      return '\\printbibliography';
    } else {
      const style = this.options.bibliographyStyle || 'plain';
      return `\\bibliographystyle{${style}}\n\\bibliography{references}`;
    }
  }

  /**
   * Convert semantic text to LaTeX
   */
  private async convertSemanticText(text: SemanticText): string {
    if (!text.runs) return '';

    const parts: string[] = [];

    for (const run of text.runs) {
      parts.push(await this.convertRun(run));
    }

    return parts.join('');
  }

  /**
   * Convert individual run to LaTeX
   */
  private async convertRun(run: Run): Promise<string> {
    switch (run.type) {
      case 'text':
        return this.escapeLatex((run as TextRun).text);
      
      case 'reference':
        const refRun = run as ReferenceRun;
        return `\\ref{${this.escapeLatex(refRun.targetId)}}`;
      
      case 'citation':
        const citRun = run as CitationRun;
        const keys = Array.isArray(citRun.citationKey) ? citRun.citationKey : [citRun.citationKey];
        return `\\cite{${keys.map(key => this.escapeLatex(key)).join(',')}}`;
      
      case 'emphasis':
        const emRun = run as EmphasisRun;
        const emText = await this.convertSemanticText({ runs: emRun.runs });
        return `\\emph{${emText}}`;
      
      case 'strong':
        const strongRun = run as StrongRun;
        const strongText = await this.convertSemanticText({ runs: strongRun.runs });
        return `\\textbf{${strongText}}`;
      
      case 'index':
        const indexRun = run as IndexRun;
        return `${this.escapeLatex(indexRun.text)}\\index{${this.escapeLatex(indexRun.entry)}}`;
      
      case 'keyTerm':
        // KeyTerm handling - treat as strong text
        const keyText = (run as any).text || '';
        return `\\textbf{${this.escapeLatex(keyText)}}`;
      
      default:
        // Unknown run type - treat as text
        return this.escapeLatex((run as any).text || '');
    }
  }

  /**
   * Escape LaTeX special characters
   */
  private escapeLatex(text: string): string {
    return text
      .replace(/\\/g, '\\textbackslash{}')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\$/g, '\\$')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/#/g, '\\#')
      .replace(/\^/g, '\\textasciicircum{}')
      .replace(/_/g, '\\_')
      .replace(/~/g, '\\textasciitilde{}');
  }

  /**
   * Create empty context
   */
  private createEmptyContext(): LaTeXContext {
    return {
      sectionDepth: 0,
      equationCounter: 0,
      figureCounter: 0,
      tableCounter: 0,
      listDepth: 0,
      bibliography: new Map(),
      labels: new Set(),
      references: new Set(),
      customCommands: new Map(),
      environmentStack: [],
      inMathMode: false,
    };
  }
}