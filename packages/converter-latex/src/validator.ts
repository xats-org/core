/**
 * @fileoverview LaTeX document validation
 */

import type { XatsDocument } from '@xats-org/types';
import type { FormatValidationResult, LaTeXValidationIssue } from './types';

/**
 * Validates LaTeX documents and xats documents for conversion compatibility
 */
export class LaTeXValidator {
  
  /**
   * Validate LaTeX document format and structure
   */
  async validate(content: string): Promise<FormatValidationResult> {
    const issues: LaTeXValidationIssue[] = [];
    let structureValid = true;
    let mathValid = true;
    let bibliographyValid = true;

    try {
      // Check basic LaTeX structure
      if (!this.hasDocumentClass(content)) {
        structureValid = false;
        issues.push({
          type: 'syntax',
          severity: 'warning',
          message: 'No \\documentclass found - assuming fragment',
          suggestion: 'Add \\documentclass for complete document'
        });
      }

      // Validate math syntax
      const mathIssues = this.validateMathSyntax(content);
      if (mathIssues.length > 0) {
        mathValid = false;
        issues.push(...mathIssues);
      }

      // Check for common LaTeX errors
      const syntaxIssues = this.validateSyntax(content);
      issues.push(...syntaxIssues);

      // Validate package usage
      const packageIssues = this.validatePackages(content);
      issues.push(...packageIssues);

      // Validate bibliography
      const bibIssues = this.validateBibliography(content);
      if (bibIssues.length > 0) {
        bibliographyValid = false;
        issues.push(...bibIssues);
      }

    } catch (error) {
      structureValid = false;
      issues.push({
        type: 'syntax',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        suggestion: 'Check LaTeX syntax and structure'
      });
    }

    return {
      valid: structureValid && !issues.some(i => i.severity === 'error'),
      format: 'latex',
      structureValid,
      mathValid,
      bibliographyValid,
      errors: issues.filter(i => i.severity === 'error').map(i => i.message),
      warnings: issues.filter(i => i.severity === 'warning').map(i => i.message),
      latexSpecificIssues: issues
    };
  }

  /**
   * Validate xats document for LaTeX conversion compatibility
   */
  async validateXatsDocument(document: XatsDocument): Promise<FormatValidationResult> {
    const issues: LaTeXValidationIssue[] = [];
    let structureValid = true;
    let mathValid = true;

    try {
      // Check basic document structure
      if (!document.schemaVersion) {
        structureValid = false;
        issues.push({
          type: 'syntax',
          severity: 'error',
          message: 'Missing schema version',
          suggestion: 'Add schemaVersion property to document'
        });
      }

      if (!document.bodyMatter) {
        structureValid = false;
        issues.push({
          type: 'syntax',
          severity: 'error',
          message: 'Missing body matter',
          suggestion: 'Document must have bodyMatter content'
        });
      }

      // Check for LaTeX-incompatible features
      const incompatibleFeatures = this.checkIncompatibleFeatures(document);
      issues.push(...incompatibleFeatures);

      // Validate mathematical content
      const mathIssues = this.validateXatsMathContent(document);
      if (mathIssues.length > 0) {
        mathValid = mathIssues.some(i => i.severity === 'error');
        issues.push(...mathIssues);
      }

    } catch (error) {
      structureValid = false;
      issues.push({
        type: 'syntax',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Document validation failed',
        suggestion: 'Ensure document follows xats schema'
      });
    }

    return {
      valid: structureValid && mathValid,
      format: 'latex',
      structureValid,
      mathValid,
      bibliographyValid: true,
      errors: issues.filter(i => i.severity === 'error').map(i => i.message),
      warnings: issues.filter(i => i.severity === 'warning').map(i => i.message),
      latexSpecificIssues: issues
    };
  }

  /**
   * Check if document has document class
   */
  private hasDocumentClass(content: string): boolean {
    return /\\documentclass/.test(content);
  }

  /**
   * Validate mathematical syntax
   */
  private validateMathSyntax(content: string): LaTeXValidationIssue[] {
    const issues: LaTeXValidationIssue[] = [];
    const lines = content.split('\n');

    // Check for unmatched math delimiters
    let inlineMathCount = 0;
    let displayMathCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Count inline math delimiters
      const inlineDollarSigns = (line.match(/(?<!\\)\$/g) || []).length;
      inlineMathCount += inlineDollarSigns;

      // Count display math delimiters
      const displayMathOpen = (line.match(/\\\[/g) || []).length;
      const displayMathClose = (line.match(/\\\]/g) || []).length;
      displayMathCount += displayMathOpen - displayMathClose;

      // Check for common math errors
      if (line.includes('$$')) {
        issues.push({
          type: 'math',
          severity: 'warning',
          message: 'Use \\[ \\] instead of $$ for display math',
          line: lineNum,
          suggestion: 'Replace $$ with \\[ and \\]'
        });
      }

      // Check for undefined math commands
      const mathCommands = line.match(/\\[a-zA-Z]+/g) || [];
      for (const cmd of mathCommands) {
        if (this.isUnknownMathCommand(cmd)) {
          issues.push({
            type: 'math',
            severity: 'warning',
            message: `Unknown math command: ${cmd}`,
            line: lineNum,
            suggestion: 'Ensure command is defined or package is loaded'
          });
        }
      }
    }

    // Check for unmatched delimiters
    if (inlineMathCount % 2 !== 0) {
      issues.push({
        type: 'math',
        severity: 'error',
        message: 'Unmatched inline math delimiters ($)',
        suggestion: 'Ensure all $ signs are properly paired'
      });
    }

    if (displayMathCount !== 0) {
      issues.push({
        type: 'math',
        severity: 'error',
        message: 'Unmatched display math delimiters (\\[ \\])',
        suggestion: 'Ensure all \\[ have matching \\]'
      });
    }

    return issues;
  }

  /**
   * Validate general LaTeX syntax
   */
  private validateSyntax(content: string): LaTeXValidationIssue[] {
    const issues: LaTeXValidationIssue[] = [];
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Check for unescaped special characters
      const unescapedChars = line.match(/(?<!\\)[&%#_{}]/g);
      if (unescapedChars) {
        issues.push({
          type: 'syntax',
          severity: 'warning',
          message: `Unescaped special characters: ${unescapedChars.join(', ')}`,
          line: lineNum,
          suggestion: 'Escape special characters with backslash'
        });
      }

      // Check for missing braces
      const openBraces = (line.match(/{/g) || []).length;
      const closeBraces = (line.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push({
          type: 'syntax',
          severity: 'warning',
          message: 'Unmatched braces on this line',
          line: lineNum,
          suggestion: 'Check brace matching'
        });
      }
    }

    return issues;
  }

  /**
   * Validate package usage
   */
  private validatePackages(content: string): LaTeXValidationIssue[] {
    const issues: LaTeXValidationIssue[] = [];

    // Extract package names
    const packageMatches = content.match(/\\usepackage(?:\[[^\]]*\])?\{([^}]+)\}/g) || [];
    const packages = packageMatches.map(match => {
      const nameMatch = match.match(/\{([^}]+)\}/);
      return nameMatch ? nameMatch[1] : '';
    });

    // Check for common package conflicts
    const conflicts = this.checkPackageConflicts(packages);
    issues.push(...conflicts);

    // Check for missing packages based on usage
    const missingPackages = this.checkMissingPackages(content, packages);
    issues.push(...missingPackages);

    return issues;
  }

  /**
   * Validate bibliography
   */
  private validateBibliography(content: string): LaTeXValidationIssue[] {
    const issues: LaTeXValidationIssue[] = [];

    // Check for bibliography commands
    const hasBibliography = /\\bibliography\{/.test(content);
    const hasBiblatex = /\\printbibliography/.test(content);
    const hasCitations = /\\cite/.test(content);

    if (hasCitations && !hasBibliography && !hasBiblatex) {
      issues.push({
        type: 'bibliography',
        severity: 'warning',
        message: 'Citations found but no bibliography command',
        suggestion: 'Add \\bibliography{} or \\printbibliography'
      });
    }

    // Check citation format
    const citationMatches = content.match(/\\cite[^{]*\{([^}]+)\}/g) || [];
    for (const citation of citationMatches) {
      const key = citation.match(/\{([^}]+)\}/)?.[1];
      if (key && !this.isValidBibKey(key)) {
        issues.push({
          type: 'bibliography',
          severity: 'warning',
          message: `Invalid bibliography key format: ${key}`,
          suggestion: 'Use alphanumeric characters and underscores only'
        });
      }
    }

    return issues;
  }

  /**
   * Check for LaTeX-incompatible xats features
   */
  private checkIncompatibleFeatures(document: XatsDocument): LaTeXValidationIssue[] {
    const issues: LaTeXValidationIssue[] = [];

    // Features that don't translate well to LaTeX
    const incompatibleTypes = [
      'https://xats.org/vocabularies/blocks/interactive',
      'https://xats.org/vocabularies/blocks/video',
      'https://xats.org/vocabularies/blocks/audio',
      'https://xats.org/vocabularies/blocks/3dModel'
    ];

    this.checkBlockTypesRecursive(
      document.bodyMatter?.contents || [],
      incompatibleTypes,
      issues
    );

    return issues;
  }

  /**
   * Validate mathematical content in xats document
   */
  private validateXatsMathContent(document: XatsDocument): LaTeXValidationIssue[] {
    const issues: LaTeXValidationIssue[] = [];

    // Check math blocks recursively
    this.validateMathBlocksRecursive(document.bodyMatter?.contents || [], issues);

    return issues;
  }

  /**
   * Helper methods
   */
  private isUnknownMathCommand(cmd: string): boolean {
    // List of common math commands - this would be expanded
    const knownCommands = [
      '\\alpha', '\\beta', '\\gamma', '\\delta', '\\epsilon', '\\theta',
      '\\sum', '\\int', '\\frac', '\\sqrt', '\\sin', '\\cos', '\\tan',
      '\\begin', '\\end', '\\left', '\\right', '\\text'
    ];
    return !knownCommands.includes(cmd);
  }

  private checkPackageConflicts(packages: string[]): LaTeXValidationIssue[] {
    const issues: LaTeXValidationIssue[] = [];
    
    // Example conflicts
    if (packages.includes('amsmath') && packages.includes('amstex')) {
      issues.push({
        type: 'package',
        severity: 'warning',
        message: 'amsmath and amstex packages may conflict',
        suggestion: 'Use amsmath instead of amstex'
      });
    }

    return issues;
  }

  private checkMissingPackages(content: string, packages: string[]): LaTeXValidationIssue[] {
    const issues: LaTeXValidationIssue[] = [];

    // Check for math content without amsmath
    if (/\\begin\{align|\\begin\{equation/.test(content) && !packages.includes('amsmath')) {
      issues.push({
        type: 'package',
        severity: 'warning',
        message: 'Math environments found but amsmath not loaded',
        suggestion: 'Add \\usepackage{amsmath}'
      });
    }

    // Check for graphics without graphicx
    if (/\\includegraphics/.test(content) && !packages.includes('graphicx')) {
      issues.push({
        type: 'package',
        severity: 'error',
        message: 'Graphics commands found but graphicx not loaded',
        suggestion: 'Add \\usepackage{graphicx}'
      });
    }

    return issues;
  }

  private isValidBibKey(key: string): boolean {
    return /^[a-zA-Z0-9_:-]+$/.test(key);
  }

  private checkBlockTypesRecursive(
    contents: any[],
    incompatibleTypes: string[],
    issues: LaTeXValidationIssue[]
  ): void {
    for (const item of contents) {
      if (item.blockType && incompatibleTypes.includes(item.blockType)) {
        issues.push({
          type: 'syntax',
          severity: 'warning',
          message: `Block type not well-supported in LaTeX: ${item.blockType}`,
          suggestion: 'Consider alternative representation or skip this block'
        });
      }

      if (item.contents) {
        this.checkBlockTypesRecursive(item.contents, incompatibleTypes, issues);
      }
    }
  }

  private validateMathBlocksRecursive(contents: any[], issues: LaTeXValidationIssue[]): void {
    for (const item of contents) {
      if (item.blockType === 'https://xats.org/vocabularies/blocks/mathBlock') {
        const latex = item.content?.latex;
        if (latex) {
          // Simple validation - check for balanced braces
          const openBraces = (latex.match(/{/g) || []).length;
          const closeBraces = (latex.match(/}/g) || []).length;
          
          if (openBraces !== closeBraces) {
            issues.push({
              type: 'math',
              severity: 'error',
              message: 'Unbalanced braces in math block',
              suggestion: 'Check LaTeX syntax in math content'
            });
          }
        }
      }

      if (item.contents) {
        this.validateMathBlocksRecursive(item.contents, issues);
      }
    }
  }
}