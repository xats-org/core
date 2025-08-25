/**
 * @fileoverview LaTeX document parser - converts LaTeX to xats
 */

import type { BibliographyProcessor } from './bibliography-processor';
import type { MathProcessor } from './math-processor';
import type { PackageManager } from './package-manager';
import type {
  LaTeXParseOptions,
  LaTeXParseResult,
  LaTeXMetadata,
  LaTeXParseMetadata,
} from './types';
import type { XatsDocument, ContentBlock } from '@xats-org/types';

/**
 * Parses LaTeX documents to xats format
 */
export class DocumentParser {
  constructor(
    private readonly mathProcessor: MathProcessor,
    private readonly bibliographyProcessor: BibliographyProcessor,
    private readonly packageManager: PackageManager
  ) {}

  /**
   * Parse LaTeX document to xats format
   */
  async parse(content: string, options: LaTeXParseOptions = {}): Promise<LaTeXParseResult> {
    try {
      // Extract metadata first
      const metadata = await this.extractMetadata(content);

      // Parse document structure
      const xatsDocument = await this.convertToXats(content, options);

      // Extract packages and commands
      const packages = this.extractPackages(content);
      const customCommands = this.extractCustomCommands(content);

      // Extract bibliography if requested
      const result: LaTeXParseResult = {
        document: xatsDocument,
        metadata: metadata as LaTeXParseMetadata, // Cast to parse metadata
        packages,
        customCommands,
      };

      if (options.bibliography?.parseBibFiles) {
        const bibliography = await this.extractBibliography(content);
        if (bibliography) {
          result.bibliography = bibliography;
        }
      }

      return result;
    } catch (error) {
      throw new Error(
        `LaTeX parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Extract metadata from LaTeX document
   */
  async extractMetadata(content: string): Promise<LaTeXMetadata> {
    const metadata: LaTeXParseMetadata = {
      sourceFormat: 'latex',
      packages: this.extractPackageNames(content),
      commands: this.extractCommandNames(content),
      environments: this.extractEnvironmentNames(content),
      mathComplexity: this.assessMathComplexity(content),
      equationCount: this.countEquations(content),
      figureCount: this.countFigures(content),
      tableCount: this.countTables(content),
      crossReferences: this.countCrossReferences(content),
      bibliographyCount: this.countBibliography(content),
      parseTime: Date.now(),
      mappedElements: 0, // Will be updated during parsing
      unmappedElements: 0, // Will be updated during parsing
      fidelityScore: 1.0, // Will be calculated
    };

    // Extract document metadata
    // SECURITY: Fixed ReDoS vulnerability with limited-length patterns
    const documentClass = content.match(
      /\\documentclass(?:\[[^\]]{0,200}\])?\{([^}]{1,100})\}/
    )?.[1];
    if (documentClass) {
      metadata.documentClass = documentClass;
    }

    // SECURITY: Fixed ReDoS vulnerability with length limit
    const title = content.match(/\\title\{([^}]{1,500})\}/)?.[1];
    if (title) {
      metadata.title = this.cleanLaTeX(title);
    }

    // SECURITY: Fixed ReDoS vulnerability with length limit
    const author = content.match(/\\author\{([^}]{1,200})\}/)?.[1];
    if (author) {
      metadata.author = this.cleanLaTeX(author);
    }

    // SECURITY: Fixed ReDoS vulnerability with length limit
    const date = content.match(/\\date\{([^}]{1,100})\}/)?.[1];
    if (date) {
      metadata.date = this.cleanLaTeX(date);
    }

    return metadata;
  }

  /**
   * Convert LaTeX to xats document
   */
  private async convertToXats(content: string, options: LaTeXParseOptions): Promise<XatsDocument> {
    // Extract document body
    let bodyContent = content;

    // Remove preamble if full document
    // SECURITY: Fixed ReDoS vulnerability by using non-greedy match with length limit
    const documentMatch = content.match(/\\begin\{document\}([\s\S]{0,50000}?)\\end\{document\}/);
    if (documentMatch && documentMatch[1] !== undefined) {
      bodyContent = documentMatch[1];
    }

    // Parse content into blocks
    const contents = await this.parseContent(bodyContent, options);

    // Extract title for bibliographic entry
    // SECURITY: Fixed ReDoS vulnerability with length limit
    const title = content.match(/\\title\{([^}]{1,500})\}/)?.[1] || 'Converted from LaTeX';

    const xatsDocument: XatsDocument = {
      schemaVersion: '0.5.0',
      bibliographicEntry: {
        type: 'article',
        title: this.cleanLaTeX(title),
      },
      subject: 'Converted Content',
      bodyMatter: {
        contents,
      },
    };

    return xatsDocument;
  }

  /**
   * Parse content into xats blocks
   */
  private async parseContent(content: string, options: LaTeXParseOptions): Promise<any[]> {
    const blocks: any[] = [];

    // Split content by paragraphs and major constructs
    const segments = this.segmentContent(content);

    for (const segment of segments) {
      const block = await this.parseSegment(segment, options);
      if (block) {
        blocks.push(block);
      }
    }

    return blocks;
  }

  /**
   * Segment LaTeX content into parseable chunks
   */
  private segmentContent(content: string): string[] {
    const segments: string[] = [];
    const lines = content.split('\n');
    let currentSegment = '';

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check for section headings - Fixed ReDoS vulnerability by limiting sub repetitions
      if (/^\\(?:sub){0,3}section\*?\{/.test(trimmedLine)) {
        if (currentSegment.trim()) {
          segments.push(currentSegment.trim());
          currentSegment = '';
        }
        segments.push(trimmedLine);
        continue;
      }

      // Check for environment starts
      if (/^\\begin\{/.test(trimmedLine)) {
        if (currentSegment.trim()) {
          segments.push(currentSegment.trim());
          currentSegment = '';
        }

        // Extract full environment
        // SECURITY: Fixed ReDoS vulnerability with length limit
        const envName = trimmedLine.match(/\\begin\{([^}]{1,50})\}/)?.[1];
        if (envName) {
          const envContent = this.extractEnvironment(content, envName, lines.indexOf(line));
          segments.push(envContent);
        }
        continue;
      }

      // Regular content
      if (trimmedLine) {
        currentSegment += `${line}\n`;
      } else if (currentSegment.trim()) {
        // Empty line - end of paragraph
        segments.push(currentSegment.trim());
        currentSegment = '';
      }
    }

    if (currentSegment.trim()) {
      segments.push(currentSegment.trim());
    }

    return segments;
  }

  /**
   * Parse individual segment
   */
  private async parseSegment(
    segment: string,
    options: LaTeXParseOptions
  ): Promise<ContentBlock | null> {
    const trimmed = segment.trim();
    if (!trimmed) return null;

    // Section headings - Fixed ReDoS vulnerability by limiting sub repetitions
    if (/^\\(?:sub){0,3}section\*?\{/.test(trimmed)) {
      return this.parseHeading(trimmed);
    }

    // Math environments
    if (/^\\begin\{(equation|align|gather|multline)/.test(trimmed)) {
      return await this.parseMathEnvironment(trimmed, options);
    }

    // Display math
    // SECURITY: Fixed ReDoS vulnerability by limiting display math content length
    if (/^\\\[[\s\S]{0,5000}?\\\]$/.test(trimmed)) {
      return await this.parseDisplayMath(trimmed, options);
    }

    // Figures
    if (/^\\begin\{figure\}/.test(trimmed)) {
      return this.parseFigure(trimmed);
    }

    // Tables
    if (/^\\begin\{table\}/.test(trimmed) || /^\\begin\{tabular\}/.test(trimmed)) {
      return this.parseTable(trimmed);
    }

    // Lists
    if (/^\\begin\{(itemize|enumerate)\}/.test(trimmed)) {
      return this.parseList(trimmed);
    }

    // Code blocks
    if (/^\\begin\{verbatim\}/.test(trimmed)) {
      return this.parseCodeBlock(trimmed);
    }

    // Regular paragraph
    return this.parseParagraph(trimmed, options);
  }

  private parseHeading(content: string): ContentBlock {
    const match = content.match(/^\\((?:sub){0,3})section\*?\{([^}]+)\}/);
    if (!match) {
      return this.createParagraphBlock(content);
    }

    const [, subs, title] = match;
    const level = (subs?.length || 0) / 3 + 1; // sub = 3 chars, subsub = 6 chars

    return {
      blockType: 'https://xats.org/vocabularies/blocks/heading',
      content: {
        level,
        text: {
          runs: [{ text: this.cleanLaTeX(title || '') }],
        },
      },
    };
  }

  private async parseMathEnvironment(
    content: string,
    options: LaTeXParseOptions
  ): Promise<ContentBlock> {
    // SECURITY: Fixed ReDoS vulnerability by limiting environment content length
    const envMatch = content.match(/\\begin\{([^}]{1,50})\}([\s\S]{0,10000}?)\\end\{\1\}/);
    if (!envMatch) {
      return this.createParagraphBlock(content);
    }

    const [, , mathContent] = envMatch;
    const cleanMath = (mathContent || '').trim();

    const mathData = await this.mathProcessor.parseMathContent(
      cleanMath,
      options.mathParsing || { renderer: 'mathjax', preserveLaTeX: true }
    );

    return {
      blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
      content: mathData,
    };
  }

  private async parseDisplayMath(
    content: string,
    options: LaTeXParseOptions
  ): Promise<ContentBlock> {
    const mathContent = content.replace(/^\\\[/, '').replace(/\\\]$/, '').trim();

    const mathData = await this.mathProcessor.parseMathContent(
      mathContent,
      options.mathParsing || { renderer: 'mathjax', preserveLaTeX: true }
    );

    return {
      blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
      content: mathData,
    };
  }

  private parseFigure(content: string): ContentBlock {
    // SECURITY: Fixed ReDoS vulnerability with length limit
    const captionMatch = content.match(/\\caption\{([^}]{1,1000})\}/);
    // SECURITY: Fixed ReDoS vulnerability with length limit
    const includeMatch = content.match(/\\includegraphics(?:\[[^\]]{0,200}\])?\{([^}]{1,200})\}/);

    return {
      blockType: 'https://xats.org/vocabularies/blocks/figure',
      content: {
        src: includeMatch?.[1] || '',
        caption: captionMatch ? this.cleanLaTeX(captionMatch[1] || '') : '',
      },
    };
  }

  private parseTable(content: string): ContentBlock {
    // Simple table parsing - would be more sophisticated in practice
    const rows: any[] = [];

    const tableLines = content
      .split('\n')
      .filter((line) => line.includes('&') || line.includes('\\\\'));

    for (const line of tableLines) {
      if (line.includes('&')) {
        const cells = line.split('&').map((cell) => ({
          text: this.cleanLaTeX(cell.replace(/\\\\/g, '').trim()),
        }));
        rows.push({ cells });
      }
    }

    return {
      blockType: 'https://xats.org/vocabularies/blocks/table',
      content: {
        rows,
        hasHeader: rows.length > 0,
      },
    };
  }

  private parseList(content: string): ContentBlock {
    const isOrdered = content.includes('\\begin{enumerate}');
    const items: string[] = [];

    // SECURITY: Fixed ReDoS vulnerability by using a more limited pattern
    const itemMatches = content.match(/\\item\s+([^\n]{0,1000}(?:\n[^\n\\]{0,1000})*)/g) || [];

    for (const match of itemMatches) {
      const itemText = match.replace(/^\\item\s+/, '').trim();
      items.push(this.cleanLaTeX(itemText));
    }

    return {
      blockType: 'https://xats.org/vocabularies/blocks/list',
      content: {
        ordered: isOrdered,
        items,
      },
    };
  }

  private parseCodeBlock(content: string): ContentBlock {
    // SECURITY: Fixed ReDoS vulnerability with length limit
    const codeMatch = content.match(/\\begin\{verbatim\}([\s\S]{0,10000}?)\\end\{verbatim\}/);
    const code = codeMatch ? (codeMatch[1] || '').trim() : content;

    return {
      blockType: 'https://xats.org/vocabularies/blocks/codeBlock',
      content: {
        code,
        language: '',
      },
    };
  }

  private async parseParagraph(content: string, options: LaTeXParseOptions): Promise<ContentBlock> {
    const text = this.parseSemanticText(content, options);

    return {
      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
      content: { text },
    };
  }

  private parseSemanticText(content: string, _options: LaTeXParseOptions): any {
    // Simple semantic text parsing - would be more sophisticated
    const cleanText = this.cleanLaTeX(content);

    return {
      runs: [{ text: cleanText }],
    };
  }

  private createParagraphBlock(content: string): ContentBlock {
    return {
      blockType: 'https://xats.org/vocabularies/blocks/paragraph',
      content: {
        text: {
          runs: [{ text: this.cleanLaTeX(content) }],
        },
      },
    };
  }

  // Helper methods
  private extractEnvironment(content: string, envName: string, startIndex: number): string {
    const lines = content.split('\n');
    const beginPattern = new RegExp(`\\\\begin\\{${envName}\\}`);
    const endPattern = new RegExp(`\\\\end\\{${envName}\\}`);

    let depth = 0;
    let result = '';

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      result += `${line}\n`;

      if (beginPattern.test(line)) depth++;
      if (endPattern.test(line)) {
        depth--;
        if (depth === 0) break;
      }
    }

    return result.trim();
  }

  private extractPackages(content: string): any[] {
    // SECURITY: Fixed potential ReDoS by limiting backtracking with quantifier limits
    const packageMatches =
      content.match(/\\usepackage(?:\[[^\]]{0,200}\])?\{([^}]{1,50})\}/g) || [];
    return packageMatches.map((match) => {
      const nameMatch = match.match(/\{([^}]{1,50})\}/);
      const optionsMatch = match.match(/\[([^\]]{0,200})\]/);

      return {
        name: nameMatch?.[1] || '',
        options: optionsMatch?.[1]?.split(',').map((s) => s.trim()) || [],
      };
    });
  }

  private extractCustomCommands(content: string): Record<string, string> {
    const commands: Record<string, string> = {};
    // SECURITY: Fixed potential ReDoS by limiting backtracking with quantifier limits
    const matches =
      content.match(/\\newcommand\{\\([^}]{1,50})\}(?:\[[\d]\])?\{([^}]{0,500})\}/g) || [];

    for (const match of matches) {
      const cmdMatch = match.match(/\\newcommand\{\\([^}]{1,50})\}(?:\[[\d]\])?\{([^}]{0,500})\}/);
      if (cmdMatch && cmdMatch[1] && cmdMatch[2]) {
        commands[cmdMatch[1]] = cmdMatch[2];
      }
    }

    return commands;
  }

  private async extractBibliography(_content: string): Promise<any[]> {
    // Extract bibliography entries from content
    return [];
  }

  private cleanLaTeX(text: string): string {
    // SECURITY: Fixed potential ReDoS by limiting backtracking with quantifier limits
    return text
      .replace(/\\textbf\{([^}]{0,500})\}/g, '$1')
      .replace(/\\emph\{([^}]{0,500})\}/g, '$1')
      .replace(/\\textit\{([^}]{0,500})\}/g, '$1')
      .replace(/\\texttt\{([^}]{0,500})\}/g, '$1')
      .replace(/\\text\{([^}]{0,500})\}/g, '$1')
      .replace(/\\\\/g, ' ')
      .replace(/\\&/g, '&')
      .replace(/\\%/g, '%')
      .replace(/\\#/g, '#')
      .replace(/\\\$/g, '$')
      .replace(/\\{/g, '{')
      .replace(/\\}/g, '}')
      .trim();
  }

  // Metadata extraction helpers
  private extractPackageNames(content: string): string[] {
    // SECURITY: Fixed potential ReDoS by limiting backtracking with quantifier limits
    const matches = content.match(/\\usepackage(?:\[[^\]]{0,200}\])?\{([^}]{1,50})\}/g) || [];
    return matches.map((match) => match.match(/\{([^}]{1,50})\}/)?.[1] || '');
  }

  private extractCommandNames(content: string): string[] {
    // SECURITY: Fixed potential ReDoS by limiting command name length
    const matches = content.match(/\\[a-zA-Z]{1,30}/g) || [];
    return [...new Set(matches.map((cmd) => cmd.substring(1)))];
  }

  private extractEnvironmentNames(content: string): string[] {
    // SECURITY: Fixed potential ReDoS by limiting environment name length
    const matches = content.match(/\\begin\{([^}]{1,30})\}/g) || [];
    return [...new Set(matches.map((match) => match.match(/\{([^}]{1,30})\}/)?.[1] || ''))];
  }

  private assessMathComplexity(content: string): 'low' | 'medium' | 'high' {
    const mathCount = (content.match(/\$|\\\[|\\\]|\\begin\{equation/g) || []).length;
    if (mathCount > 20) return 'high';
    if (mathCount > 5) return 'medium';
    return 'low';
  }

  private countEquations(content: string): number {
    return (content.match(/\\begin\{equation|\\begin\{align|\\\[/g) || []).length;
  }

  private countFigures(content: string): number {
    return (content.match(/\\begin\{figure\}/g) || []).length;
  }

  private countTables(content: string): number {
    return (content.match(/\\begin\{table\}/g) || []).length;
  }

  private countCrossReferences(content: string): number {
    return (content.match(/\\ref\{|\\eqref\{|\\cite\{/g) || []).length;
  }

  private countBibliography(content: string): number {
    return (content.match(/\\bibliography\{|\\printbibliography/g) || []).length;
  }

  private estimateWordCount(content: string): number {
    // SECURITY: Fixed ReDoS vulnerability by limiting backtracking with quantifier limits
    const text = content
      .replace(/\\[a-zA-Z]{1,20}(?:\[[^\]]{0,200}\])*(?:\{[^}]{0,200}\})*/g, '')
      .replace(/[{}]/g, '');
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  }
}
