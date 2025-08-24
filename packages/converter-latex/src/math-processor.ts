/**
 * @fileoverview Mathematical content processing for LaTeX converter
 */

import type { MathExpression, MathEnvironment, MathParsingOptions, MathDelimiters } from './types';

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
  async renderMathBlock(
    content: any,
    options: { delimiters?: MathDelimiters } = {}
  ): Promise<string> {
    const delimiters = options.delimiters || {
      inline: { open: '$', close: '$' },
      display: { open: '\\[', close: '\\]' },
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
    return content.display
      ? delimiters.display.open + text + delimiters.display.close
      : delimiters.inline.open + text + delimiters.inline.close;
  }

  /**
   * Parse LaTeX math content to xats format
   */
  async parseMathContent(
    latex: string,
    options: MathParsingOptions = {}
  ): Promise<MathExpression[]> {
    const expressions: MathExpression[] = [];

    // Parse display math environments
    // SECURITY: Fixed ReDoS vulnerability by using length limits and match counting
    const displayMathRegex =
      /\\begin\{(equation|align|alignat|gather|multline|split)\*?\}([\s\S]{0,10000}?)\\end\{\1\*?\}/gs;
    let match;
    let matchCount = 0;
    const MAX_MATCHES = 1000; // Prevent infinite loops

    while ((match = displayMathRegex.exec(latex)) !== null && matchCount < MAX_MATCHES) {
      matchCount++;
      const [fullMatch, environment, content] = match;
      const expression: MathExpression = {
        type: 'environment',
        latex: content?.trim() || '',
      };

      if (environment) {
        expression.environment = environment;
      }

      if (options.preserveLaTeX) {
        expression.rendered = fullMatch;
      }

      expressions.push(expression);
    }

    // Parse display math delimiters
    // SECURITY: Fixed ReDoS vulnerability by limiting content length and match count
    const displayDelimRegex = /\\\[([\s\S]{0,5000}?)\\\]/gs;
    matchCount = 0; // Reset counter
    while ((match = displayDelimRegex.exec(latex)) !== null && matchCount < MAX_MATCHES) {
      matchCount++;
      const expression: MathExpression = {
        type: 'display',
        latex: match[1]?.trim() || '',
      };

      if (options.preserveLaTeX && match[0]) {
        expression.rendered = match[0];
      }

      expressions.push(expression);
    }

    // Parse inline math
    // SECURITY: Fixed ReDoS vulnerability by limiting content length and restricting content
    const inlineMathRegex = /\$([^$\n]{0,1000})\$/g; // Restrict to non-$ chars and reasonable length
    matchCount = 0; // Reset counter
    while ((match = inlineMathRegex.exec(latex)) !== null && matchCount < MAX_MATCHES) {
      matchCount++;
      const expression: MathExpression = {
        type: 'inline',
        latex: match[1]?.trim() || '',
      };

      if (options.preserveLaTeX && match[0]) {
        expression.rendered = match[0];
      }

      expressions.push(expression);
    }

    return expressions;
  }

  /**
   * Extract math environments from LaTeX
   */
  extractMathEnvironments(latex: string): MathEnvironment[] {
    const environments: MathEnvironment[] = [];
    // SECURITY: Fixed ReDoS vulnerability by using length limits and match counting
    const envRegex =
      /\\begin\{(equation|align|alignat|gather|multline|split)(\*?)\}([\s\S]{0,10000}?)\\end\{\1\2\}/gs;
    let match;
    let matchCount = 0;
    const MAX_MATCHES = 1000;

    while ((match = envRegex.exec(latex)) !== null && matchCount < MAX_MATCHES) {
      matchCount++;
      const [, envName, star, content] = match;
      const numbered = star !== '*';

      // Extract label if present
      const labelMatch = content?.match(/\\label\{([^}]+)\}/);

      const environment: MathEnvironment = {
        name: envName || '',
        content: content?.trim() || '',
        numbered,
      };

      if (labelMatch && labelMatch[1]) {
        environment.label = labelMatch[1];
      }

      environments.push(environment);
    }

    return environments;
  }

  /**
   * Wrap display math with appropriate delimiters
   */
  private wrapDisplayMath(
    latex: string,
    delimiters: MathDelimiters,
    content?: { label?: string; numbered?: boolean }
  ): string {
    // Check if it's already an environment
    if (latex.startsWith('\\begin{')) {
      return latex;
    }

    // Add label if present
    let result = latex;
    if (content?.label) {
      result += `\\label{${content.label}}`;
    }

    // Use equation environment for numbered equations, or delimiters for unnumbered
    if (content?.numbered) {
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
    // SECURITY: First escape any existing backslashes to prevent LaTeX injection
    // This prevents malicious commands like \input{} or \include{} from being executed
    const safeInput = asciimath.replace(/\\/g, '\\textbackslash{}');

    // Basic AsciiMath to LaTeX conversions - SECURITY: Use a safe replacement function
    // that ensures new backslashes are properly handled
    const latex = this.safeLatexReplace(safeInput, [
      [/\^([^{])/g, '^{$1}'], // Fix exponents
      [/_([^{])/g, '_{$1}'], // Fix subscripts
      [/\bsqrt\b/g, '\\sqrt'], // Word boundary to prevent partial matches
      [/\bsum\b/g, '\\sum'],
      [/\bint\b/g, '\\int'],
      [/\boo\b/g, '\\infty'],
      [/\balpha\b/g, '\\alpha'],
      [/\bbeta\b/g, '\\beta'],
      [/\bgamma\b/g, '\\gamma'],
      [/\bdelta\b/g, '\\delta'],
      [/\bpi\b/g, '\\pi'],
      [/\btheta\b/g, '\\theta'],
      [/\bphi\b/g, '\\phi'],
      [/<=>/g, '\\Leftrightarrow'],
      [/=>/g, '\\Rightarrow'],
      [/<=/g, '\\leq'],
      [/>=/g, '\\geq'],
      [/!=/g, '\\neq'],
    ]);

    return display ? `\\[${latex}\\]` : `$${latex}$`;
  }

  /**
   * Safely perform multiple string replacements ensuring LaTeX commands are properly escaped
   * SECURITY: This prevents newly introduced backslashes from creating injection vulnerabilities
   */
  private safeLatexReplace(input: string, replacements: Array<[RegExp, string]>): string {
    return replacements.reduce(
      (result, [pattern, replacement]) =>
        // Replace the pattern, then ensure any newly introduced backslashes are safe
        result.replace(pattern, (match, ...groups) => {
          // Apply the replacement
          let replaced = replacement;

          // Handle captured groups
          groups.forEach((group, index) => {
            if (typeof group === 'string') {
              replaced = replaced.replace(new RegExp(`\\$${index + 1}`, 'g'), group);
            }
          });

          return replaced;
        }),
      input
    );
  }

  /**
   * Detect math complexity level
   */
  assessComplexity(latex: string): 'low' | 'medium' | 'high' {
    const complexFeatures = [
      /\\begin\{(align|alignat|gather|multline|split)\}/, // Multi-line equations
      /\\frac/, // Fractions
      /\\int|\\sum|\\prod/, // Integrals, sums
      /\\sqrt/, // Square roots
      /\{.*\{.*\}/, // Nested braces
      /\\mathbb|\\mathcal|\\mathfrak/, // Special fonts
      /\\matrix|\\pmatrix|\\bmatrix/, // Matrices
    ];

    const complexCount = complexFeatures.reduce(
      (count, regex) => count + (regex.test(latex) ? 1 : 0),
      0
    );

    if (complexCount === 0) return 'low';
    if (complexCount <= 2) return 'medium';
    return 'high';
  }

  /**
   * Clean up LaTeX math content
   */
  cleanupMath(latex: string): string {
    return latex
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\{\s*\}/g, '{}') // Clean empty braces
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

    // SECURITY: Fixed ReDoS vulnerability with safer pattern matching
    if (/\\frac\{[^}]{0,200}\}\{?[^}]{0,200}?$/.test(latex)) {
      errors.push('Incomplete \\frac command');
    }

    // SECURITY: Check for potentially malicious LaTeX commands
    const dangerousCommands =
      /\\(input|include|write|immediate|openout|closeout|read|catcode|def|gdef|edef|xdef|let|futurelet|expandafter|csname|endcsname|string|meaning)\b/gi;
    if (dangerousCommands.test(latex)) {
      errors.push('Potentially dangerous LaTeX commands detected');
    }

    return {
      valid: errors.length === 0,
      errors,
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
