/**
 * @fileoverview LaTeX document renderer - converts xats to LaTeX
 */

import type { XatsDocument, ContentBlock } from '@xats-org/types';
import type { LaTeXRenderOptions, LaTeXRenderResult, LaTeXMetadata } from './types';
import { MathProcessor } from './math-processor';
import { BibliographyProcessor } from './bibliography-processor';
import { PackageManager } from './package-manager';

/**
 * Renders xats documents to LaTeX format
 */
export class DocumentRenderer {
  
  constructor(
    private readonly mathProcessor: MathProcessor,
    private readonly bibliographyProcessor: BibliographyProcessor,
    private readonly packageManager: PackageManager
  ) {}

  /**
   * Render xats document to LaTeX format
   */
  async render(document: XatsDocument, options: LaTeXRenderOptions = {}): Promise<LaTeXRenderResult> {
    const documentClass = options.documentClass || 'article';
    const includeWrapper = options.includeDocumentWrapper !== false;
    
    let latex = '';
    
    if (includeWrapper) {
      // Document class and packages
      latex += `\\documentclass{${documentClass}}\n\n`;
      
      // Add packages
      const packages = this.packageManager.getRequiredPackages('', options.packages || []);
      latex += this.packageManager.generatePackageImports(packages) + '\n\n';
      
      // Custom commands
      if (options.customCommands) {
        for (const [cmd, def] of Object.entries(options.customCommands)) {
          latex += `\\newcommand{\\${cmd}}{${def}}\n`;
        }
        latex += '\n';
      }
      
      // Document metadata
      if (document.bibliographicEntry?.title) {
        latex += `\\title{${this.escapeLaTeX(document.bibliographicEntry.title)}}\n`;
      }
      if (document.bibliographicEntry?.author) {
        const authors = Array.isArray(document.bibliographicEntry.author) 
          ? document.bibliographicEntry.author.map((a: any) => a.family || a).join(' \\and ')
          : document.bibliographicEntry.author;
        latex += `\\author{${this.escapeLaTeX(String(authors))}}\n`;
      }
      latex += '\\date{\\today}\n\n';
      
      latex += '\\begin{document}\n\n';
      
      if (options.includeHeaders !== false) {
        latex += '\\maketitle\n\n';
      }
    }
    
    // Process content
    const contentLatex = await this.processContent(document, options);
    latex += contentLatex;
    
    // Bibliography
    if (document.bibliography && options.bibliography) {
      const bibLatex = await this.bibliographyProcessor.renderBibliography(
        document.bibliography,
        options.bibliography
      );
      latex += '\n' + bibLatex + '\n';
    }
    
    if (includeWrapper) {
      latex += '\n\\end{document}\n';
    }
    
    // Generate metadata
    const metadata: LaTeXMetadata = {
      format: 'latex',
      documentClass,
      packages: (options.packages || []).map(p => p.name),
      commands: Object.keys(options.customCommands || {}),
      environments: this.extractUsedEnvironments(latex),
      mathComplexity: this.assessMathComplexity(document),
      equationCount: this.countEquations(latex),
      figureCount: this.countFigures(latex),
      tableCount: this.countTables(latex),
      crossReferences: this.countCrossReferences(latex),
      bibliographyCount: document.bibliography ? 1 : 0,
      wordCount: this.estimateWordCount(latex)
    };
    
    return {
      content: latex,
      metadata,
      packages: options.packages || [],
      customCommands: options.customCommands || {}
    };
  }

  /**
   * Process document content recursively
   */
  private async processContent(document: XatsDocument, options: LaTeXRenderOptions): Promise<string> {
    let latex = '';

    // Front matter
    if (document.frontMatter?.contents) {
      const frontLatex = await this.processContents(document.frontMatter.contents, options);
      if (frontLatex.trim()) {
        latex += frontLatex + '\n';
      }
    }

    // Body matter
    if (document.bodyMatter?.contents) {
      const bodyLatex = await this.processContents(document.bodyMatter.contents, options);
      latex += bodyLatex;
    }

    // Back matter
    if (document.backMatter?.contents) {
      const backLatex = await this.processContents(document.backMatter.contents, options);
      if (backLatex.trim()) {
        latex += '\n' + backLatex;
      }
    }

    return latex;
  }

  /**
   * Process array of contents
   */
  private async processContents(contents: any[], options: LaTeXRenderOptions): Promise<string> {
    let latex = '';

    for (const item of contents) {
      if (item.blockType) {
        // Content block
        const blockLatex = await this.processContentBlock(item as ContentBlock, options);
        latex += blockLatex + '\n\n';
      } else if (item.contents) {
        // Structural container
        if (item.title) {
          const level = this.determineStructuralLevel(item);
          latex += this.createSectionHeading(item.title, level) + '\n\n';
        }
        
        const nestedLatex = await this.processContents(item.contents, options);
        latex += nestedLatex;
      }
    }

    return latex;
  }

  /**
   * Process a content block
   */
  private async processContentBlock(block: ContentBlock, options: LaTeXRenderOptions): Promise<string> {
    switch (block.blockType) {
      case 'https://xats.org/vocabularies/blocks/paragraph':
        return this.renderParagraph(block);
      
      case 'https://xats.org/vocabularies/blocks/heading':
        return this.renderHeading(block);
      
      case 'https://xats.org/vocabularies/blocks/mathBlock':
        return await this.renderMathBlock(block, options);
      
      case 'https://xats.org/vocabularies/blocks/codeBlock':
        return this.renderCodeBlock(block);
      
      case 'https://xats.org/vocabularies/blocks/blockquote':
        return this.renderBlockquote(block);
      
      case 'https://xats.org/vocabularies/blocks/list':
        return this.renderList(block);
      
      case 'https://xats.org/vocabularies/blocks/table':
        return this.renderTable(block);
      
      case 'https://xats.org/vocabularies/blocks/figure':
        return this.renderFigure(block);
      
      // Educational blocks
      case 'https://xats.org/vocabularies/blocks/learningObjective':
        return this.renderEducationalBlock(block, 'Learning Objective');
      
      case 'https://xats.org/vocabularies/blocks/definition':
        return this.renderEducationalBlock(block, 'Definition');
      
      default:
        return `% Unknown block type: ${block.blockType}\n${this.renderParagraph(block)}`;
    }
  }

  private renderParagraph(block: ContentBlock): string {
    const text = this.extractText(block.content?.text || '');
    return text;
  }

  private renderHeading(block: ContentBlock): string {
    const level = block.content?.level || 1;
    const text = this.extractText(block.content?.text || '');
    return this.createSectionHeading(text, level);
  }

  private async renderMathBlock(block: ContentBlock, options: LaTeXRenderOptions): Promise<string> {
    return await this.mathProcessor.renderMathBlock(block.content, {
      delimiters: options.mathDelimiters
    });
  }

  private renderCodeBlock(block: ContentBlock): string {
    const code = block.content?.code || block.content?.text || '';
    const language = block.content?.language || '';
    
    return `\\begin{verbatim}\n${code}\n\\end{verbatim}`;
  }

  private renderBlockquote(block: ContentBlock): string {
    const text = this.extractText(block.content?.text || '');
    return `\\begin{quote}\n${text}\n\\end{quote}`;
  }

  private renderList(block: ContentBlock): string {
    const items = block.content?.items || [];
    const ordered = block.content?.ordered === true;
    const env = ordered ? 'enumerate' : 'itemize';
    
    let latex = `\\begin{${env}}\n`;
    for (const item of items) {
      const itemText = typeof item === 'string' ? item : this.extractText(item.text || '');
      latex += `\\item ${itemText}\n`;
    }
    latex += `\\end{${env}}`;
    
    return latex;
  }

  private renderTable(block: ContentBlock): string {
    const rows = block.content?.rows || [];
    if (rows.length === 0) return '';
    
    const colCount = rows[0]?.cells?.length || 1;
    const colSpec = 'c'.repeat(colCount);
    
    let latex = `\\begin{tabular}{${colSpec}}\n`;
    
    for (const row of rows) {
      const cells = row.cells || [];
      const cellTexts = cells.map((cell: any) => this.extractText(cell.text || ''));
      latex += cellTexts.join(' & ') + ' \\\\\n';
    }
    
    latex += '\\end{tabular}';
    return latex;
  }

  private renderFigure(block: ContentBlock): string {
    const caption = block.content?.caption || '';
    const src = block.content?.src || '';
    
    let latex = '\\begin{figure}[h]\n\\centering\n';
    
    if (src) {
      latex += `\\includegraphics[width=0.8\\textwidth]{${src}}\n`;
    } else {
      latex += '% Figure source not specified\n';
    }
    
    if (caption) {
      latex += `\\caption{${this.escapeLaTeX(caption)}}\n`;
    }
    
    latex += '\\end{figure}';
    return latex;
  }

  private renderEducationalBlock(block: ContentBlock, type: string): string {
    const text = this.extractText(block.content?.text || '');
    
    return `\\begin{tcolorbox}[title=${type}]\n${text}\n\\end{tcolorbox}`;
  }

  private createSectionHeading(title: string, level: number): string {
    const commands = ['\\section', '\\subsection', '\\subsubsection', '\\paragraph', '\\subparagraph'];
    const command = commands[Math.min(level - 1, commands.length - 1)] || '\\paragraph';
    return `${command}{${this.escapeLaTeX(title)}}`;
  }

  private determineStructuralLevel(item: any): number {
    // Simple level determination - would be more sophisticated in practice
    return 1;
  }

  private extractText(content: any): string {
    if (typeof content === 'string') {
      return this.escapeLaTeX(content);
    }
    
    if (content?.runs) {
      return content.runs.map((run: any) => {
        let text = this.escapeLaTeX(run.text || '');
        
        if (run.type === 'emphasis') text = `\\emph{${text}}`;
        if (run.type === 'strong') text = `\\textbf{${text}}`;
        if (run.type === 'code') text = `\\texttt{${text}}`;
        
        return text;
      }).join('');
    }
    
    return this.escapeLaTeX(String(content));
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

  // Utility methods for metadata
  private extractUsedEnvironments(latex: string): string[] {
    const envs = latex.match(/\\begin\{([^}]+)\}/g) || [];
    return [...new Set(envs.map(env => env.match(/\{([^}]+)\}/)?.[1] || ''))];
  }

  private assessMathComplexity(document: XatsDocument): 'low' | 'medium' | 'high' {
    // Simple heuristic - would be more sophisticated
    return 'low';
  }

  private countEquations(latex: string): number {
    return (latex.match(/\\begin\{equation|\\begin\{align|\\\[/g) || []).length;
  }

  private countFigures(latex: string): number {
    return (latex.match(/\\begin\{figure\}/g) || []).length;
  }

  private countTables(latex: string): number {
    return (latex.match(/\\begin\{table\}/g) || []).length;
  }

  private countCrossReferences(latex: string): number {
    return (latex.match(/\\ref\{|\\eqref\{|\\cite\{/g) || []).length;
  }

  private estimateWordCount(latex: string): number {
    // Remove LaTeX commands and count words
    const text = latex.replace(/\\[a-zA-Z]+(\[[^\]]*\])*(\{[^}]*\})*/g, '').replace(/[{}]/g, '');
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }
}