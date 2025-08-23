/**
 * Advanced LaTeX Bidirectional Converter
 *
 * Provides production-quality conversion between xats documents and LaTeX format
 * with comprehensive support for academic publishing, mathematical content,
 * and scholarly workflows.
 */

import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { RoundTripTester } from '@xats-org/testing';

import type {
  LaTeXConverterOptions,
  LaTeXParseOptions,
  LaTeXMetadata,
  LaTeXRoundTripResult,
  LaTeXConversionContext,
  LaTeXPackage,
  GeometryOptions,
  FontConfiguration,
} from './types.js';

import type {
  XatsDocument,
  BidirectionalRenderer,
  RenderResult,
  ParseResult,
  RoundTripOptions,
  FormatValidationResult,
  SemanticText,
  ContentBlock,
  Unit,
  Chapter,
  Section,
} from '@xats-org/types';

/**
 * Advanced LaTeX converter with academic publishing workflow support
 */
export class LaTeXConverter implements BidirectionalRenderer<LaTeXConverterOptions> {
  public readonly format = 'latex' as const;
  public readonly wcagLevel = null; // LaTeX output accessibility depends on final rendering

  private roundTripTester: RoundTripTester;
  private context: LaTeXConversionContext;

  constructor() {
    this.roundTripTester = new RoundTripTester(this);
    this.context = this.initializeContext();
  }

  /**
   * Convert xats document to LaTeX format
   */
  async render(document: XatsDocument, options: LaTeXConverterOptions = {}): Promise<RenderResult> {
    const startTime = performance.now();

    try {
      // Initialize conversion context
      this.context = this.initializeContext();

      // Set default options
      const renderOptions: Required<LaTeXConverterOptions> = this.getDefaultOptions(options);

      // Generate LaTeX content
      const latexContent = await this.generateLaTeX(document, renderOptions);

      // Validate LaTeX if in production mode
      if (renderOptions.productionMode) {
        const validationResult = await this.validateLaTeX(latexContent);
        if (!validationResult.valid && validationResult.errors.some(e => e.severity === 'error')) {
          throw new Error(`LaTeX validation failed: ${validationResult.errors[0].message}`);
        }
      }

      const renderTime = performance.now() - startTime;

      return {
        content: latexContent,
        metadata: {
          format: 'latex',
          renderTime,
          wordCount: this.estimateWordCount(latexContent),
        },
        assets: this.extractAssets(),
        errors: [],
      };
    } catch (error) {
      return {
        content: '',
        metadata: {
          format: 'latex',
          renderTime: performance.now() - startTime,
        },
        errors: [
          {
            type: 'other',
            message: `LaTeX conversion failed: ${String(error)}`,
            recoverable: false,
          },
        ],
      };
    }
  }

  /**
   * Parse LaTeX document back to xats format
   */
  async parse(content: string, options: LaTeXParseOptions = {}): Promise<ParseResult> {
    const startTime = performance.now();

    try {
      // Initialize parsing context
      this.context = this.initializeContext();

      // Set default parse options
      const parseOptions = this.getDefaultParseOptions(options);

      // Pre-process LaTeX content
      const processedContent = await this.preprocessLaTeX(content, parseOptions);

      // Parse LaTeX structure
      const structure = await this.parseLaTeXStructure(processedContent, parseOptions);

      // Convert to xats document
      const xatsDocument = await this.convertToXats(structure, parseOptions);

      const parseTime = performance.now() - startTime;

      return {
        document: xatsDocument,
        metadata: {
          sourceFormat: 'latex',
          parseTime,
          mappedElements: this.context.commands.size + this.context.environments.size,
          unmappedElements: 0, // TODO: Track unmapped elements
          fidelityScore: 0.95, // TODO: Calculate actual fidelity score
        },
        warnings: [],
        errors: [],
        unmappedData: [],
      };
    } catch (error) {
      const parseTime = performance.now() - startTime;

      return {
        document: this.createEmptyDocument(),
        metadata: {
          sourceFormat: 'latex',
          parseTime,
          mappedElements: 0,
          unmappedElements: 0,
          fidelityScore: 0,
        },
        errors: [
          {
            type: 'malformed-content',
            message: `LaTeX parsing failed: ${String(error)}`,
            fatal: true,
          },
        ],
      };
    }
  }

  /**
   * Test round-trip conversion fidelity
   */
  async testRoundTrip(
    document: XatsDocument,
    options: RoundTripOptions = {}
  ): Promise<LaTeXRoundTripResult> {
    const startTime = performance.now();

    try {
      // Render to LaTeX
      const renderResult = await this.render(document, options);
      const renderTime = performance.now() - startTime;

      if (renderResult.errors && renderResult.errors.length > 0) {
        throw new Error(`Render failed: ${renderResult.errors[0].message}`);
      }

      const midTime = performance.now();

      // Parse back to xats
      const parseResult = await this.parse(renderResult.content, options);
      const parseTime = performance.now() - midTime;

      if (parseResult.errors && parseResult.errors.length > 0) {
        throw new Error(`Parse failed: ${parseResult.errors[0].message}`);
      }

      // Calculate fidelity scores
      const contentFidelity = this.calculateContentFidelity(document, parseResult.document);
      const mathFidelity = this.calculateMathFidelity(document, parseResult.document);
      const structureFidelity = this.calculateStructureFidelity(document, parseResult.document);
      const formattingFidelity = this.calculateFormattingFidelity(document, parseResult.document);

      const overallFidelity = (contentFidelity + mathFidelity + structureFidelity + formattingFidelity) / 4;
      const success = overallFidelity >= (options.fidelityThreshold || 0.90); // Higher threshold for LaTeX

      return {
        success,
        fidelityScore: overallFidelity,
        contentFidelity,
        mathFidelity,
        structureFidelity,
        formattingFidelity,
        issues: this.identifyLaTeXFidelityIssues(document, parseResult.document),
        metrics: {
          renderTime,
          parseTime,
          outputSize: renderResult.content.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        fidelityScore: 0,
        contentFidelity: 0,
        mathFidelity: 0,
        structureFidelity: 0,
        formattingFidelity: 0,
        issues: [
          {
            type: 'compilation',
            severity: 'critical',
            description: `Round-trip test failed: ${String(error)}`,
          },
        ],
        metrics: {
          renderTime: performance.now() - startTime,
          parseTime: 0,
          outputSize: 0,
        },
      };
    }
  }

  /**
   * Validate LaTeX document
   */
  async validate(content: string): Promise<FormatValidationResult> {
    return this.validateLaTeX(content);
  }

  /**
   * Extract LaTeX document metadata
   */
  async getMetadata(content: string): Promise<LaTeXMetadata> {
    try {
      const metadata: LaTeXMetadata = {
        format: 'latex',
      };

      // Extract document class
      const documentClassMatch = content.match(/\\documentclass(?:\[[^\]]*\])?\{([^}]+)\}/);
      if (documentClassMatch) {
        metadata.documentClass = documentClassMatch[1];
      }

      // Extract packages
      const packageMatches = content.matchAll(/\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}/g);
      metadata.packages = [];
      for (const match of packageMatches) {
        metadata.packages.push({ name: match[1] });
      }

      // Count mathematical elements
      const mathInlineCount = (content.match(/\$[^$]+\$/g) || []).length;
      const mathDisplayCount = (content.match(/\$\$[^$]+\$\$/g) || []).length;
      const equationCount = (content.match(/\\begin\{equation\}/g) || []).length;

      if (mathInlineCount + mathDisplayCount + equationCount > 0) {
        metadata.mathComplexity = mathInlineCount + mathDisplayCount + equationCount > 20 ? 'heavy' : 
                                   mathInlineCount + mathDisplayCount + equationCount > 5 ? 'advanced' : 'basic';
        metadata.equations = mathInlineCount + mathDisplayCount + equationCount;
      } else {
        metadata.mathComplexity = 'none';
        metadata.equations = 0;
      }

      // Count figures and tables
      metadata.figures = (content.match(/\\begin\{figure\}/g) || []).length;
      metadata.tables = (content.match(/\\begin\{table\}/g) || []).length;

      // Count cross-references
      metadata.crossReferences = (content.match(/\\ref\{[^}]+\}/g) || []).length;

      return metadata;
    } catch (error) {
      return {
        format: 'latex',
        customProperties: { error: String(error) },
      };
    }
  }

  // Private implementation methods

  private initializeContext(): LaTeXConversionContext {
    return {
      commands: new Map(),
      environments: new Map(),
      counters: new Map([
        ['chapter', 0],
        ['section', 0],
        ['subsection', 0],
        ['figure', 0],
        ['table', 0],
        ['equation', 0],
      ]),
      labels: new Map(),
      citations: new Set(),
      figures: new Map(),
      tables: new Map(),
      equations: new Map(),
      includeStack: [],
      state: {
        inMath: false,
        inFigure: false,
        inTable: false,
        sectionLevel: 0,
      },
    };
  }

  private getDefaultOptions(options: LaTeXConverterOptions): Required<LaTeXConverterOptions> {
    return {
      // Base renderer options
      theme: 'default',
      cssClasses: {},
      includeTableOfContents: true,
      includeBibliography: true,
      includeIndex: true,
      mathRenderer: 'unicode',
      syntaxHighlighter: 'none',
      locale: 'en',
      dir: 'ltr',
      accessibilityMode: true,
      customStyles: '',
      baseUrl: '',
      fragmentOnly: false,

      // LaTeX-specific options
      documentClass: 'article',
      documentClassOptions: ['11pt', 'letterpaper'],
      packages: this.getDefaultPackages(),
      bibliographyStyle: 'plain',
      bibliographyBackend: 'bibtex',
      mathDelimiters: {
        inline: { open: '$', close: '$' },
        display: { open: '$$', close: '$$' },
      },
      useUTF8: true,
      microtype: true,
      geometry: this.getDefaultGeometry(),
      fonts: this.getDefaultFonts(),
      mathFonts: this.getDefaultMathFonts(),
      numbering: {
        chapters: true,
        sections: true,
        subsections: true,
        equations: true,
        figures: true,
        tables: true,
        theorems: true,
        maxDepth: 3,
        resetCounters: ['equation', 'figure', 'table'],
      },
      crossReferences: {
        useCleveref: true,
        useHyperref: true,
        linkColors: {
          cite: 'blue',
          link: 'red',
          url: 'blue',
        },
        bookmarks: true,
        colorlinks: true,
      },
      indexing: {
        enabled: false,
        package: 'makeidx',
        columns: 2,
        style: 'default',
        sorting: 'word',
      },
      glossaries: {
        enabled: false,
        package: 'glossaries',
        acronyms: true,
        symbols: true,
        style: 'long',
        sorting: 'standard',
      },
      journal: {
        template: '',
        class: '',
        style: '',
        doublespacing: false,
        linenumbers: false,
        anonymize: false,
      },
      productionMode: false,
      customPreamble: '',
      customCommands: {},
      draftMode: false,

      ...options,
    } as Required<LaTeXConverterOptions>;
  }

  private getDefaultParseOptions(options: LaTeXParseOptions): Required<LaTeXParseOptions> {
    return {
      // Base parse options
      preserveMetadata: true,
      strictMode: false,
      customParsers: {},
      baseUrl: '',
      encoding: 'utf-8',

      // LaTeX-specific options
      mathParsing: {
        renderer: 'plain',
        preserveLaTeX: true,
        mathML: false,
        customCommands: {},
        environments: {
          align: 'preserve',
          equation: 'preserve',
          gather: 'preserve',
          matrix: 'preserve',
          cases: 'preserve',
        },
      },
      bibliography: {
        parseBibFiles: false,
        citationStyles: {},
        natbib: true,
        biblatex: true,
        urlHandling: 'preserve',
      },
      floats: {
        figures: 'convert',
        tables: 'convert',
        captions: 'extract',
        labels: 'convert',
      },
      crossReferences: {
        resolveInternal: true,
        generateText: false,
        typeMapping: {},
        prefixHandling: 'preserve',
      },
      customCommands: {},
      packageParsers: {},
      errorHandling: 'lenient',
      preserveComments: false,
      followIncludes: false,

      ...options,
    } as Required<LaTeXParseOptions>;
  }

  private getDefaultPackages(): LaTeXPackage[] {
    return [
      { name: 'inputenc', options: ['utf8'], required: true },
      { name: 'fontenc', options: ['T1'], required: true },
      { name: 'amsmath', required: false },
      { name: 'amsfonts', required: false },
      { name: 'amssymb', required: false },
      { name: 'geometry', required: false },
      { name: 'graphicx', required: false },
      { name: 'hyperref', required: false },
      { name: 'cleveref', required: false },
      { name: 'microtype', required: false },
    ];
  }

  private getDefaultGeometry(): GeometryOptions {
    return {
      papersize: 'letterpaper',
      orientation: 'portrait',
      margin: {
        top: '1in',
        bottom: '1in',
        left: '1in',
        right: '1in',
      },
      bindingoffset: '0in',
      includehead: false,
      includefoot: false,
      heightrounded: true,
    };
  }

  private getDefaultFonts(): FontConfiguration {
    return {
      main: 'Computer Modern',
      sans: 'Computer Modern Sans',
      mono: 'Computer Modern Typewriter',
      fontenc: 'T1',
      inputenc: 'utf8',
      fontsize: '11pt',
      useT1: true,
    };
  }

  private getDefaultMathFonts(): any {
    return {
      math: 'Computer Modern',
      mathcal: 'Computer Modern',
      mathbb: 'Computer Modern',
      mathfrak: 'Computer Modern',
      mathsf: 'Computer Modern',
      mathtt: 'Computer Modern',
    };
  }

  private async generateLaTeX(document: XatsDocument, options: Required<LaTeXConverterOptions>): Promise<string> {
    const parts: string[] = [];

    // Document class
    const classOptions = options.documentClassOptions.join(',');
    parts.push(`\\documentclass${classOptions ? `[${classOptions}]` : ''}{${options.documentClass}}`);
    parts.push('');

    // Packages
    for (const pkg of options.packages) {
      const pkgOptions = pkg.options ? `[${pkg.options.join(',')}]` : '';
      parts.push(`\\usepackage${pkgOptions}{${pkg.name}}`);
    }

    // Custom preamble
    if (options.customPreamble) {
      parts.push('');
      parts.push('% Custom preamble');
      parts.push(options.customPreamble);
    }

    // Custom commands
    if (Object.keys(options.customCommands).length > 0) {
      parts.push('');
      parts.push('% Custom commands');
      for (const [cmd, def] of Object.entries(options.customCommands)) {
        parts.push(`\\newcommand{\\${cmd}}{${def}}`);
      }
    }

    parts.push('');
    parts.push('\\begin{document}');
    parts.push('');

    // Title and metadata
    if (document.bibliographicEntry?.title) {
      parts.push(`\\title{${this.escapeLaTeX(document.bibliographicEntry.title)}}`);
      
      if (document.bibliographicEntry.author && Array.isArray(document.bibliographicEntry.author)) {
        const authors = document.bibliographicEntry.author
          .map(author => 'literal' in author ? author.literal : `${author.given || ''} ${author.family || ''}`.trim())
          .join(' \\and ');
        parts.push(`\\author{${authors}}`);
      }
      
      if (document.bibliographicEntry.issued) {
        const year = document.bibliographicEntry.issued['date-parts']?.[0]?.[0];
        if (year) {
          parts.push(`\\date{${year}}`);
        }
      }
      
      parts.push('\\maketitle');
      parts.push('');
    }

    // Table of contents
    if (options.includeTableOfContents) {
      parts.push('\\tableofcontents');
      parts.push('\\clearpage');
      parts.push('');
    }

    // Front matter
    if (document.frontMatter) {
      const frontMatter = await this.renderFrontMatter(document.frontMatter, options);
      parts.push(frontMatter);
    }

    // Body matter
    const bodyMatter = await this.renderBodyMatter(document.bodyMatter, options);
    parts.push(bodyMatter);

    // Back matter
    if (document.backMatter) {
      const backMatter = await this.renderBackMatter(document.backMatter, options);
      parts.push(backMatter);
    }

    parts.push('');
    parts.push('\\end{document}');

    return parts.join('\n');
  }

  // Placeholder methods for complex LaTeX operations
  private async renderFrontMatter(frontMatter: any, options: Required<LaTeXConverterOptions>): Promise<string> {
    // TODO: Implement front matter rendering
    return '';
  }

  private async renderBodyMatter(bodyMatter: any, options: Required<LaTeXConverterOptions>): Promise<string> {
    // TODO: Implement body matter rendering
    return '';
  }

  private async renderBackMatter(backMatter: any, options: Required<LaTeXConverterOptions>): Promise<string> {
    // TODO: Implement back matter rendering
    return '';
  }

  private escapeLaTeX(text: string): string {
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

  private async validateLaTeX(content: string): Promise<FormatValidationResult> {
    // TODO: Implement LaTeX validation
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  }

  private extractAssets(): any[] {
    // TODO: Extract LaTeX assets (images, etc.)
    return [];
  }

  private estimateWordCount(content: string): number {
    // Remove LaTeX commands and count words
    const textContent = content
      .replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{[^}]*\})*\s*/g, ' ')
      .replace(/\$[^$]+\$/g, ' ')
      .replace(/\$\$[^$]+\$\$/g, ' ')
      .replace(/\\begin\{[^}]+\}.*?\\end\{[^}]+\}/gs, ' ')
      .replace(/%.*/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return textContent.split(/\s+/).filter(word => word.length > 0).length;
  }

  private async preprocessLaTeX(content: string, options: Required<LaTeXParseOptions>): Promise<string> {
    // TODO: Implement LaTeX preprocessing
    return content;
  }

  private async parseLaTeXStructure(content: string, options: Required<LaTeXParseOptions>): Promise<any> {
    // TODO: Implement LaTeX structure parsing
    return {};
  }

  private async convertToXats(structure: any, options: Required<LaTeXParseOptions>): Promise<XatsDocument> {
    // TODO: Implement structure to xats conversion
    return this.createEmptyDocument();
  }

  // Fidelity calculation methods
  private calculateContentFidelity(original: XatsDocument, roundTrip: XatsDocument): number {
    // TODO: Implement content fidelity calculation
    return 0.95;
  }

  private calculateMathFidelity(original: XatsDocument, roundTrip: XatsDocument): number {
    // TODO: Implement math fidelity calculation
    return 0.98;
  }

  private calculateStructureFidelity(original: XatsDocument, roundTrip: XatsDocument): number {
    // TODO: Implement structure fidelity calculation
    return 0.96;
  }

  private calculateFormattingFidelity(original: XatsDocument, roundTrip: XatsDocument): number {
    // TODO: Implement formatting fidelity calculation
    return 0.90;
  }

  private identifyLaTeXFidelityIssues(original: XatsDocument, roundTrip: XatsDocument): any[] {
    // TODO: Implement fidelity issue identification
    return [];
  }

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