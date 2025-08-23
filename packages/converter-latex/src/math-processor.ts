/**
 * @fileoverview Mathematical content processing for LaTeX converter
 */

import type {
  MathExpression,
  MathEnvironment,
  MathParsingOptions,
  MathDelimiters
} from './types';

/**
 * Processes mathematical content between xats and LaTeX formats
 */
export class MathProcessor {
  private readonly renderer: 'mathjax' | 'katex' | null;

  constructor(renderer: 'mathjax' | 'katex' = 'mathjax') {
    this.renderer = renderer;
  }

  /**
   * Convert xats math block to LaTeX
   */
  async renderMathBlock(content: any, options: { delimiters?: MathDelimiters } = {}): Promise<string> {
    const delimiters = options.delimiters || {
      inline: { open: '$', close: '$' },
      display: { open: '\\[', close: '\\]' }
    };

    if (!content) return '';

    // Handle different math content types
    if (content.latex) {
      // Direct LaTeX content
      const latex = content.latex.trim();
      const isDisplayMath = content.display === true || latex.includes('\\begin{');
      
      if (isDisplayMath) {
        return this.wrapDisplayMath(latex, delimiters, content);
      } else {
        return this.wrapInlineMath(latex, delimiters);
      }
    }

    if (content.mathml) {
      // Convert MathML to LaTeX (basic implementation)
      return this.convertMathMLToLaTeX(content.mathml, content.display);
    }

    if (content.asciimath) {
      // Convert AsciiMath to LaTeX (basic implementation)
      return this.convertAsciiMathToLaTeX(content.asciimath, content.display);
    }

    // Fallback to text content
    const text = content.text || String(content);
    return content.display ? delimiters.display.open + text + delimiters.display.close 
                           : delimiters.inline.open + text + delimiters.inline.close;
  }

  /**
   * Parse LaTeX math content to xats format
   */
  async parseMathContent(latex: string, options: MathParsingOptions = {}): Promise<MathExpression[]> {
    const expressions: MathExpression[] = [];
    
    // Parse display math environments
    const displayMathRegex = /\\begin\{(equation|align|alignat|gather|multline|split)\*?\}(.*?)\\end\{\1\*?\}/gs;
    let match;
    
    while ((match = displayMathRegex.exec(latex)) !== null) {
      const [fullMatch, environment, content] = match;
      expressions.push({
        type: 'environment',
        latex: content.trim(),
        environment: environment,
        rendered: options.preserveLaTeX ? fullMatch : undefined
      });
    }

    // Parse display math delimiters
    const displayDelimRegex = /\\\[(.*?)\\\]/gs;
    while ((match = displayDelimRegex.exec(latex)) !== null) {
      expressions.push({
        type: 'display',
        latex: match[1].trim(),
        rendered: options.preserveLaTeX ? match[0] : undefined
      });
    }

    // Parse inline math
    const inlineMathRegex = /\$(.*?)\$/g;
    while ((match = inlineMathRegex.exec(latex)) !== null) {
      expressions.push({
        type: 'inline',
        latex: match[1].trim(),
        rendered: options.preserveLaTeX ? match[0] : undefined
      });
    }

    return expressions;
  }

  /**
   * Extract math environments from LaTeX
   */
  extractMathEnvironments(latex: string): MathEnvironment[] {
    const environments: MathEnvironment[] = [];
    const envRegex = /\\begin\{(equation|align|alignat|gather|multline|split)(\*?)\}(.*?)\\end\{\1\2\}/gs;
    let match;

    while ((match = envRegex.exec(latex)) !== null) {
      const [, envName, star, content] = match;
      const numbered = star !== '*';
      
      // Extract label if present
      const labelMatch = content.match(/\\label\{([^}]+)\}/);
      const label = labelMatch ? labelMatch[1] : undefined;

      environments.push({
        name: envName,
        content: content.trim(),
        numbered,
        label
      });
    }

    return environments;
  }

  /**
   * Wrap display math with appropriate delimiters
   */
  private wrapDisplayMath(latex: string, delimiters: MathDelimiters, content: any): string {
    // Check if it's already an environment
    if (latex.startsWith('\\begin{')) {
      return latex;
    }

    // Add label if present
    let result = latex;
    if (content.label) {
      result += `\\label{${content.label}}`;
    }

    // Use equation environment for numbered equations, or delimiters for unnumbered
    if (content.numbered) {
      return `\\begin{equation}\n${result}\n\\end{equation}`;
    } else {
      return delimiters.display.open + result + delimiters.display.close;
    }
  }

  /**
   * Wrap inline math with appropriate delimiters
   */
  private wrapInlineMath(latex: string, delimiters: MathDelimiters): string {
    return delimiters.inline.open + latex + delimiters.inline.close;
  }

  /**
   * Convert MathML to LaTeX (basic implementation)
   */
  private convertMathMLToLaTeX(mathml: string, display = false): string {
    // This is a simplified conversion - a full implementation would use a proper MathML parser
    // For now, we'll just wrap it as a placeholder
    return display ? `\\text{[MathML content]}` : `\\text{[MathML]}`;
  }

  /**
   * Convert AsciiMath to LaTeX (basic implementation)
   */
  private convertAsciiMathToLaTeX(asciimath: string, display = false): string {
    // Basic AsciiMath to LaTeX conversions
    let latex = asciimath
      .replace(/\^([^{])/g, '^{$1}')  // Fix exponents
      .replace(/_([^{])/g, '_{$1}')   // Fix subscripts
      .replace(/sqrt/g, '\\sqrt')
      .replace(/sum/g, '\\sum')
      .replace(/int/g, '\\int')
      .replace(/oo/g, '\\infty')
      .replace(/alpha/g, '\\alpha')
      .replace(/beta/g, '\\beta')
      .replace(/gamma/g, '\\gamma')
      .replace(/delta/g, '\\delta')
      .replace(/pi/g, '\\pi')
      .replace(/theta/g, '\\theta')
      .replace(/phi/g, '\\phi')
      .replace(/<=>/g, '\\Leftrightarrow')
      .replace(/=>/g, '\\Rightarrow')
      .replace(/<=/g, '\\leq')
      .replace(/>=/g, '\\geq')
      .replace(/!=/g, '\\neq');

    return display ? `\\[${latex}\\]` : `$${latex}$`;
  }

  /**
   * Detect math complexity level
   */
  assessComplexity(latex: string): 'low' | 'medium' | 'high' {
    const complexFeatures = [
      /\\begin\{(align|alignat|gather|multline|split)\}/,  // Multi-line equations
      /\\frac/,                                            // Fractions
      /\\int|\\sum|\\prod/,                               // Integrals, sums
      /\\sqrt/,                                           // Square roots
      /\{.*\{.*\}/,                                      // Nested braces
      /\\mathbb|\\mathcal|\\mathfrak/,                   // Special fonts
      /\\matrix|\\pmatrix|\\bmatrix/                     // Matrices
    ];

    const complexCount = complexFeatures.reduce((count, regex) => {
      return count + (regex.test(latex) ? 1 : 0);
    }, 0);

    if (complexCount === 0) return 'low';
    if (complexCount <= 2) return 'medium';
    return 'high';
  }

  /**
   * Clean up LaTeX math content
   */
  cleanupMath(latex: string): string {
    return latex
      .replace(/\s+/g, ' ')        // Normalize whitespace
      .replace(/\{\s*\}/g, '{}')   // Clean empty braces
      .replace(/\s*\\\\\s*/g, '\\\\') // Clean line breaks
      .trim();
  }

  /**
   * Validate mathematical LaTeX syntax
   */
  validateMathSyntax(latex: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check balanced braces
    const openBraces = (latex.match(/{/g) || []).length;
    const closeBraces = (latex.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces in math expression');
    }

    // Check balanced delimiters
    const leftDelims = (latex.match(/\\left/g) || []).length;
    const rightDelims = (latex.match(/\\right/g) || []).length;
    if (leftDelims !== rightDelims) {
      errors.push('Unmatched \\left and \\right delimiters');
    }

    // Check for common errors
    if (latex.includes('$$')) {
      errors.push('Use \\[ \\] instead of $$ for display math');
    }

    if (latex.match(/\\frac\{[^}]*\}\{[^}]*$/)) {
      errors.push('Incomplete \\frac command');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Create numbered equation
   */
  createNumberedEquation(latex: string, label?: string): string {
    let equation = `\\begin{equation}\n${latex}\n`;
    
    if (label) {
      equation += `\\label{${label}}\n`;
    }
    
    equation += '\\end{equation}';
    return equation;
  }

  /**
   * Create aligned equations
   */
  createAlignedEquations(equations: string[], labels?: string[]): string {
    let align = '\\begin{align}\n';
    
    equations.forEach((eq, index) => {
      align += eq;
      if (labels && labels[index]) {
        align += ` \\label{${labels[index]}}`;
      }
      if (index < equations.length - 1) {
        align += ' \\\\\n';
      } else {
        align += '\n';
      }
    });
    
    align += '\\end{align}';
    return align;
  }
}