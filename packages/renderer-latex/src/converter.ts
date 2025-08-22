/* eslint-disable */
/**
 * LaTeX Converter - xats to LaTeX
 *
 * Converts xats documents to LaTeX format with high fidelity preservation.
 */

import type { LaTeXRendererOptions, LaTeXContext, LaTeXPackage } from './types.js';
import type {
  XatsDocument,
  Unit,
  Chapter,
  Section,
  ContentBlock,
  SemanticText,
  Run,
  ReferenceRun,
  CitationRun,
  EmphasisRun,
  StrongRun,
  CodeRun,
  MathInlineRun,
  SubscriptRun,
  SuperscriptRun,
  StrikethroughRun,
  UnderlineRun,
  FrontMatter,
  BackMatter,
} from '@xats-org/types';

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
  convertToLaTeX(document: XatsDocument, options: LaTeXRendererOptions = {}): string {
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
      parts.push(this.convertFrontMatter(document.frontMatter));
    }

    // Body matter
    parts.push(this.convertBodyMatter(document.bodyMatter));

    // Back matter
    if (document.backMatter) {
      parts.push(this.convertBackMatter(document.backMatter));
    }

    // Before end document
    if (options.beforeEndDocument) {
      parts.push(options.beforeEndDocument);
    }

    // End document
    parts.push('\\end{document}');

    return parts.filter((part) => part.trim()).join('\n\n');
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
        required: true,
      });
    }

    if (this.options.lineSpacing && this.options.lineSpacing !== 'singlespacing') {
      packages.push({ name: 'setspace', options: [], required: true });
    }

    // Generate package declarations
    return packages
      .map((pkg) => {
        const optionsStr =
          pkg.options && pkg.options.length > 0 ? `[${pkg.options.join(',')}]` : '';
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
        .map((author) => {
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
          const year = dateparts[0] ?? new Date().getFullYear();
          const month = dateparts[1] ?? 1;
          const day = dateparts[2] ?? 1;
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
  private convertFrontMatter(frontMatter: FrontMatter): string {
    const parts: string[] = [];

    if (frontMatter.contents) {
      for (const block of frontMatter.contents as unknown[]) {
        parts.push(this.convertContentBlock(block as ContentBlock));
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Convert body matter
   */
  private convertBodyMatter(bodyMatter: { contents: (Unit | Chapter)[] }): string {
    const parts: string[] = [];

    for (const content of bodyMatter.contents) {
      // Check if it's a Unit by checking for Unit-specific structure
      if ('contents' in content && Array.isArray(content.contents)) {
        const firstContent = content.contents[0];
        if (firstContent && ('chapterType' in firstContent || 'blockType' in firstContent)) {
          // It's a Unit containing Chapters or ContentBlocks
          parts.push(this.convertUnit(content as Unit));
        } else {
          // It's a Chapter containing Sections or ContentBlocks
          parts.push(this.convertChapter(content as Chapter));
        }
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Convert back matter
   */
  private convertBackMatter(backMatter: BackMatter): string {
    const parts: string[] = [];

    if (backMatter.contents) {
      for (const block of backMatter.contents as unknown[]) {
        parts.push(this.convertContentBlock(block as ContentBlock));
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Convert unit
   */
  private convertUnit(unit: Unit): string {
    const parts: string[] = [];

    // Unit title as chapter or section depending on context
    if (unit.title) {
      const level =
        this.options.documentClass === 'book' || this.options.documentClass === 'report'
          ? 'chapter'
          : 'section';
      const titleText = this.convertSemanticText(unit.title);
      parts.push(`\\${level}{${titleText}}`);

      if (unit.label) {
        parts.push(`\\label{${this.escapeLatex(unit.label)}}`);
      }
    }

    // Learning outcomes
    if (unit.learningOutcomes && unit.learningOutcomes.length > 0) {
      parts.push(this.convertLearningOutcomes(unit.learningOutcomes));
    }

    // Contents
    if (unit.contents) {
      for (const content of unit.contents) {
        if ('contents' in content && 'title' in content && !('blockType' in content)) {
          // It's a Chapter or Section
          if ('fileReference' in content) {
            parts.push(this.convertChapter(content));
          } else {
            parts.push(this.convertSection(content as Section));
          }
        } else {
          parts.push(this.convertContentBlock(content as ContentBlock));
        }
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Convert chapter
   */
  private convertChapter(chapter: Chapter): string {
    const parts: string[] = [];

    // Chapter title
    if (chapter.title) {
      const titleText = this.convertSemanticText(chapter.title);
      parts.push(`\\chapter{${titleText}}`);

      if (chapter.label) {
        parts.push(`\\label{${this.escapeLatex(chapter.label)}}`);
      }
    }

    // Learning outcomes
    if (chapter.learningOutcomes && chapter.learningOutcomes.length > 0) {
      parts.push(this.convertLearningOutcomes(chapter.learningOutcomes));
    }

    // Contents
    if (chapter.contents) {
      for (const content of chapter.contents) {
        if ('contents' in content && 'title' in content && !('blockType' in content)) {
          // It's a Section
          parts.push(this.convertSection(content));
        } else {
          parts.push(this.convertContentBlock(content as ContentBlock));
        }
      }
    }

    return parts.join('\n\n');
  }

  /**
   * Convert section
   */
  private convertSection(section: Section): string {
    const parts: string[] = [];

    // Section title
    if (section.title) {
      const level = this.getSectionLevel('primary'); // Default to primary section
      const titleText = this.convertSemanticText(section.title);
      parts.push(`\\${level}{${titleText}}`);

      if (section.label) {
        parts.push(`\\label{${this.escapeLatex(section.label)}}`);
      }
    }

    // Learning outcomes
    if (section.learningOutcomes && section.learningOutcomes.length > 0) {
      parts.push(this.convertLearningOutcomes(section.learningOutcomes));
    }

    // Contents
    if (section.contents) {
      for (const content of section.contents) {
        // Section can only contain ContentBlocks, not other Sections
        parts.push(this.convertContentBlock(content));
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
  private convertLearningOutcomes(outcomes: unknown[]): string {
    const parts = ['\\begin{quote}', '\\textbf{Learning Outcomes:}', '\\begin{itemize}'];

    for (const outcome of outcomes) {
      // Handle both old LearningObjective format and new LearningOutcome format
      const outcomeObj = outcome as { objective?: unknown; outcome?: unknown };
      const outcomeText = outcomeObj.objective
        ? this.convertSemanticText(outcomeObj.objective as SemanticText)
        : this.convertSemanticText(
            (outcomeObj.outcome as SemanticText) || { runs: [{ type: 'text', text: 'Outcome' }] }
          );
      parts.push(`\\item ${outcomeText}`);
    }

    parts.push('\\end{itemize}', '\\end{quote}');

    return parts.join('\n');
  }

  /**
   * Convert content block
   */
  private convertContentBlock(block: ContentBlock): string {
    if (!block.content) return '';

    switch (block.blockType) {
      case 'https://xats.org/vocabularies/blocks/paragraph':
        return this.convertParagraphBlock(block);

      case 'https://xats.org/vocabularies/blocks/heading':
        return this.convertHeadingBlock(block);

      case 'https://xats.org/vocabularies/blocks/list':
        return this.convertListBlock(block);

      case 'https://xats.org/vocabularies/blocks/blockquote':
        return this.convertBlockquoteBlock(block);

      case 'https://xats.org/vocabularies/blocks/codeBlock':
        return this.convertCodeBlock(block);

      case 'https://xats.org/vocabularies/blocks/mathBlock':
        return this.convertMathBlock(block);

      case 'https://xats.org/vocabularies/blocks/table':
        return this.convertTableBlock(block);

      case 'https://xats.org/vocabularies/blocks/figure':
        return this.convertFigureBlock(block);

      case 'https://xats.org/vocabularies/placeholders/tableOfContents':
        return '\\tableofcontents';

      case 'https://xats.org/vocabularies/placeholders/bibliography':
        return this.generateBibliography();

      case 'https://xats.org/vocabularies/placeholders/index':
        return '\\printindex';

      default:
        // Unknown block type - convert as paragraph
        return this.convertParagraphBlock(block);
    }
  }

  /**
   * Convert paragraph block
   */
  private convertParagraphBlock(block: ContentBlock): string {
    if (block.content && typeof block.content === 'object' && 'runs' in block.content) {
      return this.convertSemanticText(block.content as SemanticText);
    }
    return '';
  }

  /**
   * Convert heading block
   */
  private convertHeadingBlock(block: ContentBlock): string {
    if (block.content && typeof block.content === 'object' && 'runs' in block.content) {
      const level =
        (block.renderingHints?.find((hint) => hint.hintType === 'level')?.value as number) ?? 1;
      const command = this.getHeadingCommand(level);
      const text = this.convertSemanticText(block.content as SemanticText);

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
        case 1:
          return 'chapter';
        case 2:
          return 'section';
        case 3:
          return 'subsection';
        case 4:
          return 'subsubsection';
        case 5:
          return 'paragraph';
        case 6:
          return 'subparagraph';
        default:
          return 'section';
      }
    } else {
      switch (level) {
        case 1:
          return 'section';
        case 2:
          return 'subsection';
        case 3:
          return 'subsubsection';
        case 4:
          return 'paragraph';
        case 5:
          return 'subparagraph';
        default:
          return 'section';
      }
    }
  }

  /**
   * Convert list block
   */
  private convertListBlock(block: ContentBlock): string {
    if (!block.content || typeof block.content !== 'object' || !('items' in block.content)) {
      return '';
    }

    const listType =
      (block.renderingHints?.find((hint) => hint.hintType === 'listType')?.value as string) ||
      'itemize';
    const environment =
      listType === 'ordered' ? 'enumerate' : listType === 'description' ? 'description' : 'itemize';

    const parts = [`\\begin{${environment}}`];

    const listContent = block.content as { items?: unknown[] };
    if (!listContent.items) return '';

    for (const item of listContent.items) {
      if (item && typeof item === 'object' && 'runs' in item) {
        const itemText = this.convertSemanticText(item as SemanticText);
        parts.push(`\\item ${itemText}`);
      }
    }

    parts.push(`\\end{${environment}}`);

    return parts.join('\n');
  }

  /**
   * Convert blockquote block
   */
  private convertBlockquoteBlock(block: ContentBlock): string {
    if (block.content && typeof block.content === 'object' && 'runs' in block.content) {
      const text = this.convertSemanticText(block.content as SemanticText);
      return `\\begin{quote}\n${text}\n\\end{quote}`;
    }
    return '';
  }

  /**
   * Convert code block
   */
  private convertCodeBlock(block: ContentBlock): string {
    if (typeof block.content === 'string') {
      const language = block.renderingHints?.find((hint) => hint.hintType === 'language')
        ?.value as string;

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
  private convertMathBlock(block: ContentBlock): string {
    if (typeof block.content === 'string') {
      const numbered = block.renderingHints?.find((hint) => hint.hintType === 'numbered')
        ?.value as boolean;
      const environment = numbered ? 'equation' : 'equation*';

      let result = `\\begin{${environment}}\n${block.content}\n\\end{${environment}}`;

      if (block.id) {
        result = result.replace(
          '\\end{equation}',
          `\\label{${this.escapeLatex(block.id)}}\n\\end{equation}`
        );
      }

      return result;
    }
    return '';
  }

  /**
   * Convert table block
   */
  private convertTableBlock(block: ContentBlock): string {
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
  private convertFigureBlock(block: ContentBlock): string {
    if (block.content && typeof block.content === 'object' && 'src' in block.content) {
      const figureContent = block.content as { src?: string; alt?: string; caption?: string };
      const src = figureContent.src ?? '';
      const caption = figureContent.caption ?? '';

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
  private convertSemanticText(text: SemanticText): string {
    if (!text.runs) return '';

    const parts: string[] = [];

    for (const run of text.runs) {
      parts.push(this.convertRun(run));
    }

    return parts.join('');
  }

  /**
   * Convert individual run to LaTeX
   */
  private convertRun(run: Run): string {
    switch (run.type) {
      case 'text': {
        return this.escapeLatex(run.text);
      }

      case 'reference': {
        const refRun = run;
        return `\\ref{${this.escapeLatex(refRun.ref)}}`;
      }

      case 'citation': {
        const citRun = run;
        return `\\cite{${this.escapeLatex(citRun.citeKey)}}`;
      }

      case 'emphasis': {
        const emRun = run;
        return `\\emph{${this.escapeLatex(emRun.text)}}`;
      }

      case 'strong': {
        const strongRun = run;
        return `\\textbf{${this.escapeLatex(strongRun.text)}}`;
      }

      case 'index': {
        const indexRun = run as { text: string; entry: string };
        return `${this.escapeLatex(indexRun.text)}\\index{${this.escapeLatex(indexRun.entry)}}`;
      }

      case 'code': {
        const codeRun = run;
        return `\\texttt{${this.escapeLatex(codeRun.text)}}`;
      }

      case 'mathInline': {
        const mathRun = run;
        return `$${mathRun.math}$`;
      }

      case 'subscript': {
        const subRun = run;
        return `\\textsubscript{${this.escapeLatex(subRun.text)}}`;
      }

      case 'superscript': {
        const supRun = run;
        return `\\textsuperscript{${this.escapeLatex(supRun.text)}}`;
      }

      case 'strikethrough': {
        const strikeRun = run;
        return `\\sout{${this.escapeLatex(strikeRun.text)}}`;
      }

      case 'underline': {
        const underRun = run;
        return `\\underline{${this.escapeLatex(underRun.text)}}`;
      }

      default: {
        // Unknown run type - treat as text
        const unknownRun = run as { text?: string };
        return this.escapeLatex(unknownRun.text || '');
      }
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
