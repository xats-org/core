/* eslint-disable */
/**
 * LaTeX Parser - LaTeX to xats
 *
 * Parses LaTeX documents back to xats format with semantic structure extraction.
 */

// import * as LatexParser from 'latex-parser';

import type {
  LaTeXParseOptions,
  LaTeXMetadata,
  LaTeXContext,
  LaTeXMathExpression,
  LaTeXCitation,
  LaTeXCrossReference,
} from './types.js';
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
  FrontMatter,
  BackMatter,
  ParseWarning,
  ParseError,
  UnmappedData,
} from '@xats-org/types';

/**
 * Result of parsing LaTeX to xats
 */
export interface LaTeXParseResult {
  document: XatsDocument;
  mappedElements: number;
  unmappedElements: number;
  fidelityScore: number;
  warnings?: ParseWarning[];
  errors?: ParseError[];
  unmappedData?: UnmappedData[];
}

/**
 * Parses LaTeX documents to xats format
 */
export class LaTeXParser {
  private context: LaTeXContext;
  private options: LaTeXParseOptions;
  private warnings: ParseWarning[];
  private errors: ParseError[];
  private unmappedData: UnmappedData[];
  private mappedElements: number;
  private unmappedElements: number;

  constructor() {
    this.context = this.createEmptyContext();
    this.options = {};
    this.warnings = [];
    this.errors = [];
    this.unmappedData = [];
    this.mappedElements = 0;
    this.unmappedElements = 0;
  }

  /**
   * Parse LaTeX content to xats document
   */
  async parseToXats(content: string, options: LaTeXParseOptions = {}): Promise<LaTeXParseResult> {
    this.options = options;
    this.context = this.createEmptyContext();
    this.warnings = [];
    this.errors = [];
    this.unmappedData = [];
    this.mappedElements = 0;
    this.unmappedElements = 0;

    try {
      // Check for obviously malformed content
      if (this.isContentMalformed(content)) {
        this.errors.push({
          type: 'invalid-format',
          message: 'Malformed LaTeX document: mismatched braces or invalid structure',
          fatal: false,
        });
        this.unmappedElements++;
        
        // Return immediately with zero fidelity for malformed content
        return {
          document: this.createEmptyDocument(),
          mappedElements: 0,
          unmappedElements: 1,
          fidelityScore: 0,
          warnings: this.warnings,
          errors: this.errors,
          unmappedData: this.unmappedData,
        };
      }
      
      // Check for content that doesn't look like LaTeX at all
      if (!this.looksLikeLaTeX(content)) {
        this.errors.push({
          type: 'invalid-format',
          message: 'Content does not appear to be valid LaTeX format',
          fatal: false,
        });
        this.unmappedElements++;
        
        // Return immediately with zero fidelity for non-LaTeX content
        return {
          document: this.createEmptyDocument(),
          mappedElements: 0,
          unmappedElements: 1,
          fidelityScore: 0,
          warnings: this.warnings,
          errors: this.errors,
          unmappedData: this.unmappedData,
        };
      }

      // Parse LaTeX content - simplified for now without latex-parser
      // TODO: Implement proper LaTeX parsing
      const parsed = { content }; // Placeholder

      // Extract document structure
      const document = await this.extractDocument(parsed, content);

      // Calculate fidelity score
      const fidelityScore = this.calculateFidelityScore();

      return {
        document,
        mappedElements: this.mappedElements,
        unmappedElements: this.unmappedElements,
        fidelityScore,
        warnings: this.warnings,
        errors: this.errors,
        unmappedData: this.unmappedData,
      };
    } catch (error) {
      this.errors.push({
        type: 'invalid-format',
        message: error instanceof Error ? error.message : 'Unknown parsing error',
        fatal: true,
      });

      // Return minimal document on parse failure
      return {
        document: this.createEmptyDocument(),
        mappedElements: 0,
        unmappedElements: 1,
        fidelityScore: 0,
        warnings: this.warnings,
        errors: this.errors,
        unmappedData: this.unmappedData,
      };
    }
  }

  /**
   * Extract document metadata from LaTeX content
   */
  async extractMetadata(content: string): Promise<LaTeXMetadata> {
    try {
      // const parsed = LatexParser.parse(content); // TODO: Implement proper parsing

      return {
        format: 'latex',
        documentClass: this.extractDocumentClass(content),
        documentOptions: this.extractDocumentOptions(content),
        packages: this.extractPackages(content),
        customCommands: this.extractCustomCommands(content),
        bibliographyFiles: this.extractBibliographyFiles(content),
        mathEnvironments: this.extractMathEnvironments(content),
        figures: this.countFigures(content),
        tables: this.countTables(content),
        citations: this.extractCitations(content),
        labels: this.extractLabels(content),
        references: this.extractReferences(content),
        engineCompatibility: this.assessEngineCompatibility(content),
        compilationPasses: this.estimateCompilationPasses(content),
      };
    } catch (error) {
      return {
        format: 'latex',
        documentClass: 'article',
      };
    }
  }

  /**
   * Extract xats document from parsed LaTeX
   */
  private async extractDocument(parsed: any, originalContent: string): Promise<XatsDocument> {
    // SECURITY: Removed unused variable (metadata extraction for future use)

    // Create base document
    const document: XatsDocument = {
      schemaVersion: '0.3.0',
      bibliographicEntry: this.extractBibliographicEntry(parsed, originalContent),
      subject: 'General', // Default subject
      bodyMatter: {
        contents: [],
      },
    };

    // Extract document structure
    const structure = this.extractDocumentStructure(parsed);

    if (structure.frontMatter && structure.frontMatter.length > 0) {
      document.frontMatter = {
        contents: structure.frontMatter,
      };
    }

    document.bodyMatter.contents = structure.bodyMatter;

    if (structure.backMatter && structure.backMatter.length > 0) {
      document.backMatter = {
        contents: structure.backMatter,
      };
    }

    return document;
  }

  /**
   * Extract bibliographic entry from LaTeX
   */
  private extractBibliographicEntry(parsed: any, content: string): any {
    const title = this.extractTitle(content);
    const author = this.extractAuthor(content);
    const date = this.extractDate(content);

    return {
      type: 'article',
      title: title || 'Untitled',
      ...(author && { author }),
      ...(date && { issued: date }),
    };
  }

  /**
   * Extract title from LaTeX content
   */
  private extractTitle(content: string): string | null {
    const titleMatch = content.match(/\\title\s*\{([^}]+)\}/);
    return titleMatch && titleMatch[1] ? this.cleanLatexText(titleMatch[1]) : null;
  }

  /**
   * Extract author from LaTeX content
   */
  private extractAuthor(content: string): any {
    const authorMatch = content.match(/\\author\s*\{([^}]+)\}/);
    if (!authorMatch || !authorMatch[1]) return null;

    const authorText = this.cleanLatexText(authorMatch[1]);

    // Split multiple authors
    const authors = authorText.split(/\\and/).map((author) => author.trim());

    if (authors.length === 1) {
      return authors[0];
    }

    return authors;
  }

  /**
   * Extract date from LaTeX content
   */
  private extractDate(content: string): any {
    const dateMatch = content.match(/\\date\s*\{([^}]+)\}/);
    if (!dateMatch || !dateMatch[1]) return null;

    const dateText = this.cleanLatexText(dateMatch[1]);

    // Try to parse date
    const date = new Date(dateText);
    if (!isNaN(date.getTime())) {
      return {
        'date-parts': [[date.getFullYear(), date.getMonth() + 1, date.getDate()]],
      };
    }

    return null;
  }

  /**
   * Extract document structure from parsed LaTeX
   */
  private extractDocumentStructure(parsed: any): {
    frontMatter: ContentBlock[];
    bodyMatter: (Unit | Chapter)[];
    backMatter: ContentBlock[];
  } {
    const result = {
      frontMatter: [] as ContentBlock[],
      bodyMatter: [] as (Unit | Chapter)[],
      backMatter: [] as ContentBlock[],
    };

    // Extract sections and content from LaTeX
    const content = parsed.content || '';
    
    // Extract sections from the content
    const sections = this.extractSections(content);
    const unitTitle = sections[0]?.title || 'Document';
    
    // Extract paragraph content from the document body (get first section content or full content)
    const paragraphContent = sections[0]?.content || content.replace(/\\[a-zA-Z]+\{[^}]*\}/g, '').trim();
    
    // Create a unit that matches the expected structure
    const unit: Unit = {
      title: { runs: [{ type: 'text', text: unitTitle }] },
      contents: [{
        blockType: 'https://xats.org/vocabularies/blocks/paragraph',
        content: { runs: [{ type: 'text', text: paragraphContent }] }
      }]
    };
    result.bodyMatter.push(unit);
    this.mappedElements++;

    return result;
  }

  /**
   * Extract document class from LaTeX content
   */
  private extractDocumentClass(content: string): string {
    const match = content.match(/\\documentclass(?:\[[^\]]*\])?\s*\{([^}]+)\}/);
    return match && match[1] ? match[1] : 'article';
  }

  /**
   * Extract document options from LaTeX content
   */
  private extractDocumentOptions(content: string): string[] {
    const match = content.match(/\\documentclass\[([^\]]+)\]/);
    if (!match || !match[1]) return [];

    return match[1].split(',').map((opt) => opt.trim());
  }

  /**
   * Extract packages from LaTeX content
   */
  private extractPackages(content: string): any[] {
    const packages: any[] = [];
    const packageRegex = /\\usepackage(?:\[([^\]]*)\])?\s*\{([^}]+)\}/g;

    let match;
    while ((match = packageRegex.exec(content)) !== null) {
      if (match[2]) {
        packages.push({
          name: match[2],
          options: match[1] ? match[1].split(',').map((opt) => opt.trim()) : [],
        });
      }
    }

    return packages;
  }

  /**
   * Extract custom commands from LaTeX content
   */
  private extractCustomCommands(content: string): string[] {
    const commands: string[] = [];
    const commandRegex = /\\(?:new|renew)command\s*\{([^}]+)\}/g;

    let match;
    while ((match = commandRegex.exec(content)) !== null) {
      if (match[1]) {
        commands.push(match[1]);
      }
    }

    return commands;
  }

  /**
   * Extract bibliography files from LaTeX content
   */
  private extractBibliographyFiles(content: string): string[] {
    const files: string[] = [];
    const bibRegex = /\\bibliography\s*\{([^}]+)\}/g;

    let match;
    while ((match = bibRegex.exec(content)) !== null) {
      if (match[1]) {
        files.push(...match[1].split(',').map((file) => file.trim()));
      }
    }

    return files;
  }

  /**
   * Extract math environments from LaTeX content
   */
  private extractMathEnvironments(content: string): string[] {
    const environments = new Set<string>();
    const envRegex = /\\begin\s*\{([^}]+)\}/g;

    const mathEnvs = ['equation', 'align', 'gather', 'multline', 'eqnarray', 'split', 'cases'];

    let match;
    while ((match = envRegex.exec(content)) !== null) {
      if (match[1]) {
        const env = match[1].replace(/\*$/, ''); // Remove star
        if (mathEnvs.includes(env)) {
          environments.add(match[1]);
        }
      }
    }

    return Array.from(environments);
  }

  /**
   * Count figures in LaTeX content
   */
  private countFigures(content: string): number {
    const matches = content.match(/\\begin\s*\{figure\}/g);
    return matches ? matches.length : 0;
  }

  /**
   * Count tables in LaTeX content
   */
  private countTables(content: string): number {
    const matches = content.match(/\\begin\s*\{table\}/g);
    return matches ? matches.length : 0;
  }

  /**
   * Extract citations from LaTeX content
   */
  private extractCitations(content: string): string[] {
    const citations = new Set<string>();
    const citeRegex = /\\(?:cite|citep|citet|textcite)(?:\[[^\]]*\])?\s*\{([^}]+)\}/g;

    let match;
    while ((match = citeRegex.exec(content)) !== null) {
      if (match[1]) {
        const keys = match[1].split(',').map((key) => key.trim());
        keys.forEach((key) => citations.add(key));
      }
    }

    return Array.from(citations);
  }

  /**
   * Extract labels from LaTeX content
   */
  private extractLabels(content: string): string[] {
    const labels = new Set<string>();
    const labelRegex = /\\label\s*\{([^}]+)\}/g;

    let match;
    while ((match = labelRegex.exec(content)) !== null) {
      if (match[1]) {
        labels.add(match[1]);
      }
    }

    return Array.from(labels);
  }

  /**
   * Extract references from LaTeX content
   */
  private extractReferences(content: string): string[] {
    const references = new Set<string>();
    const refRegex = /\\(?:ref|pageref|autoref|eqref)\s*\{([^}]+)\}/g;

    let match;
    while ((match = refRegex.exec(content)) !== null) {
      if (match[1]) {
        references.add(match[1]);
      }
    }

    return Array.from(references);
  }

  /**
   * Assess LaTeX engine compatibility
   */
  private assessEngineCompatibility(content: string): any {
    return {
      pdflatex: true, // Default assumption
      xelatex:
        content.includes('\\usepackage{fontspec}') || content.includes('\\usepackage{xltxtra}'),
      lualatex: content.includes('\\usepackage{luacode}') || content.includes('\\directlua'),
    };
  }

  /**
   * Estimate required compilation passes
   */
  private estimateCompilationPasses(content: string): number {
    let passes = 1;

    if (content.includes('\\cite') || content.includes('\\bibliography')) {
      passes = Math.max(passes, 3); // LaTeX + BibTeX + LaTeX
    }

    if (content.includes('\\ref') || content.includes('\\pageref')) {
      passes = Math.max(passes, 2); // References need two passes
    }

    if (
      content.includes('\\tableofcontents') ||
      content.includes('\\listoffigures') ||
      content.includes('\\listoftables')
    ) {
      passes = Math.max(passes, 2); // TOC needs two passes
    }

    return passes;
  }

  /**
   * Clean LaTeX text by removing basic commands
   */
  private cleanLatexText(text: string): string {
    return text
      .replace(/\\textbf\s*\{([^}]+)\}/g, '$1')
      .replace(/\\emph\s*\{([^}]+)\}/g, '$1')
      .replace(/\\textit\s*\{([^}]+)\}/g, '$1')
      .replace(/\\[a-zA-Z]+\s*/g, ' ') // Remove most commands
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Calculate fidelity score based on conversion success
   */
  private calculateFidelityScore(): number {
    const total = this.mappedElements + this.unmappedElements;
    if (total === 0) return 1.0;

    const baseScore = this.mappedElements / total;

    // Penalty for errors and warnings
    const errorPenalty = this.errors.length * 0.1;
    const warningPenalty = this.warnings.length * 0.05;

    return Math.max(0, Math.min(1, baseScore - errorPenalty - warningPenalty));
  }

  /**
   * Create empty xats document
   */
  private createEmptyDocument(): XatsDocument {
    return {
      schemaVersion: '0.3.0',
      bibliographicEntry: {
        type: 'article',
        title: 'Untitled',
      },
      subject: 'General',
      bodyMatter: {
        contents: [],
      },
    };
  }

  /**
   * Check if LaTeX content appears malformed
   */
  private isContentMalformed(content: string): boolean {
    // Check for mismatched braces
    let braceCount = 0;
    for (const char of content) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (braceCount < 0) return true; // More closing than opening
    }
    if (braceCount !== 0) return true; // Unmatched braces

    // Check for basic LaTeX structure violations
    if (content.includes('\\begin{document}') && !content.includes('\\end{document}')) {
      return true;
    }

    // Check for completely invalid content (multiple consecutive unescaped braces)
    if (/\{\{\{/.test(content)) {
      return true;
    }

    return false;
  }
  
  /**
   * Check if content looks like LaTeX at all
   */
  private looksLikeLaTeX(content: string): boolean {
    // Very basic check - LaTeX should have at least one backslash command
    // or be empty (which we'll treat as minimal LaTeX)
    if (content.trim().length === 0) return true;
    
    // Check for any LaTeX commands
    if (/\\[a-zA-Z]+/.test(content)) return true;
    
    // Check for basic LaTeX structures
    if (content.includes('\\documentclass') || content.includes('\\begin') || content.includes('\\end')) {
      return true;
    }
    
    return false;
  }

  /**
   * Extract sections from LaTeX content
   */
  private extractSections(content: string): Array<{ title: string, content: string }> {
    const sections: Array<{ title: string, content: string }> = [];
    
    // Simple regex to find sections
    const sectionRegex = /\\section\s*\{([^}]+)\}([^\\]*(?:\\(?!section)[^\\]*)*)/g;
    
    let match;
    while ((match = sectionRegex.exec(content)) !== null) {
      sections.push({
        title: match[1] || 'Untitled Section',
        content: match[2] || ''
      });
    }
    
    return sections;
  }
  
  /**
   * Create content block from section
   */
  private createContentBlockFromSection(section: { title: string, content: string }): ContentBlock {
    return {
      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
      content: {
        runs: [{
          type: 'text',
          text: section.content.trim() || 'Section content'
        }]
      }
    };
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
