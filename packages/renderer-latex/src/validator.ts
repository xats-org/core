/* eslint-disable */
/**
 * LaTeX Validator
 *
 * Validates LaTeX content for syntax errors and compatibility issues.
 */

import type { LaTeXError } from './types.js';
import type {
  FormatValidationResult,
  FormatValidationError,
  FormatValidationWarning,
} from '@xats-org/types';

/**
 * Validates LaTeX documents for syntax and compatibility
 */
export class LaTeXValidator {
  /**
   * Validate LaTeX content
   */
  async validateLaTeX(content: string): Promise<FormatValidationResult> {
    const errors: FormatValidationError[] = [];
    const warnings: FormatValidationWarning[] = [];

    try {
      // Basic syntax validation
      this.validateBasicSyntax(content, errors, warnings);

      // Document structure validation
      this.validateDocumentStructure(content, errors, warnings);

      // Math validation
      this.validateMath(content, errors, warnings);

      // Citation validation
      this.validateCitations(content, errors, warnings);

      // Package validation
      this.validatePackages(content, errors, warnings);

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          validator: 'xats-latex-validator',
          version: '1.0.0',
          validatedAt: new Date(),
        },
      };
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            code: 'VALIDATION_ERROR',
            message: error instanceof Error ? error.message : 'Unknown validation error',
            severity: 'error',
          },
        ],
        warnings: [],
      };
    }
  }

  /**
   * Validate basic LaTeX syntax
   */
  private validateBasicSyntax(
    content: string,
    errors: FormatValidationError[],
    warnings: FormatValidationWarning[]
  ): void {
    // Check for balanced braces
    const braceBalance = this.checkBraceBalance(content);
    if (braceBalance !== 0) {
      errors.push({
        code: 'UNBALANCED_BRACES',
        message: `Unbalanced braces detected (balance: ${braceBalance})`,
        severity: 'error',
      });
    }

    // Check for proper document class
    if (!content.includes('\\documentclass')) {
      errors.push({
        code: 'MISSING_DOCUMENT_CLASS',
        message: 'Document class declaration is required',
        severity: 'error',
      });
    }

    // Check for begin/end document
    if (!content.includes('\\begin{document}')) {
      errors.push({
        code: 'MISSING_BEGIN_DOCUMENT',
        message: '\\begin{document} is required',
        severity: 'error',
      });
    }

    if (!content.includes('\\end{document}')) {
      errors.push({
        code: 'MISSING_END_DOCUMENT',
        message: '\\end{document} is required',
        severity: 'error',
      });
    }

    // Check for balanced environments
    this.validateEnvironmentBalance(content, errors);

    // Check for common command typos
    this.checkCommonTypos(content, warnings);
  }

  /**
   * Validate document structure
   */
  private validateDocumentStructure(
    content: string,
    errors: FormatValidationError[],
    warnings: FormatValidationWarning[]
  ): void {
    // Check section hierarchy
    this.validateSectionHierarchy(content, warnings);

    // Check for orphaned sections
    this.checkOrphanedSections(content, warnings);

    // Validate labels and references
    this.validateLabelsAndReferences(content, warnings);
  }

  /**
   * Validate math environments
   */
  private validateMath(
    content: string,
    errors: FormatValidationError[],
    warnings: FormatValidationWarning[]
  ): void {
    // Check for balanced math delimiters
    const inlineMathBalance = this.checkInlineMathBalance(content);
    if (inlineMathBalance !== 0) {
      errors.push({
        code: 'UNBALANCED_INLINE_MATH',
        message: 'Unbalanced inline math delimiters ($)',
        severity: 'error',
      });
    }

    // Check display math balance
    const displayMathBalance = this.checkDisplayMathBalance(content);
    if (displayMathBalance !== 0) {
      errors.push({
        code: 'UNBALANCED_DISPLAY_MATH',
        message: 'Unbalanced display math delimiters ($$)',
        severity: 'error',
      });
    }

    // Validate math environments
    this.validateMathEnvironments(content, errors);
  }

  /**
   * Validate citations
   */
  private validateCitations(
    content: string,
    errors: FormatValidationError[],
    warnings: FormatValidationWarning[]
  ): void {
    // Check for bibliography
    const hasCitations = /\\cite/.test(content);
    const hasBibliography = /\\bibliography/.test(content) || /\\printbibliography/.test(content);

    if (hasCitations && !hasBibliography) {
      warnings.push({
        code: 'MISSING_BIBLIOGRAPHY',
        message: 'Citations found but no bibliography declared',
        suggestion: 'Add \\bibliography{} or \\printbibliography command',
      });
    }

    // Check citation keys
    this.validateCitationKeys(content, warnings);
  }

  /**
   * Validate packages
   */
  private validatePackages(
    content: string,
    errors: FormatValidationError[],
    warnings: FormatValidationWarning[]
  ): void {
    // Check for conflicting packages
    this.checkPackageConflicts(content, warnings);

    // Check for missing packages for specific features
    this.checkRequiredPackages(content, warnings);
  }

  /**
   * Check brace balance
   */
  private checkBraceBalance(content: string): number {
    let balance = 0;
    // SECURITY: Removed unused variable

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';

      if (char === '%' && prevChar !== '\\') {
        // Skip to end of line (comment)
        while (i < content.length && content[i] !== '\n') {
          i++;
        }
        continue;
      }

      if (char === '{' && prevChar !== '\\') {
        balance++;
      } else if (char === '}' && prevChar !== '\\') {
        balance--;
      }
    }

    return balance;
  }

  /**
   * Validate environment balance
   */
  private validateEnvironmentBalance(content: string, errors: FormatValidationError[]): void {
    const envStack: string[] = [];
    const envRegex = /\\(begin|end)\s*\{([^}]+)\}/g;

    let match;
    while ((match = envRegex.exec(content)) !== null) {
      const [, command, envName] = match;

      if (command === 'begin' && envName) {
        envStack.push(envName);
      } else if (command === 'end' && envName) {
        const expectedEnv = envStack.pop();
        if (expectedEnv !== envName) {
          errors.push({
            code: 'ENVIRONMENT_MISMATCH',
            message: `Environment mismatch: expected \\end{${expectedEnv}}, found \\end{${envName}}`,
            severity: 'error',
          });
        }
      }
    }

    // Check for unclosed environments
    if (envStack.length > 0) {
      errors.push({
        code: 'UNCLOSED_ENVIRONMENTS',
        message: `Unclosed environments: ${envStack.join(', ')}`,
        severity: 'error',
      });
    }
  }

  /**
   * Check for common command typos
   */
  private checkCommonTypos(content: string, warnings: FormatValidationWarning[]): void {
    const commonTypos = [
      { wrong: '\\begind', correct: '\\begin' },
      { wrong: '\\endd', correct: '\\end' },
      { wrong: '\\documentclas', correct: '\\documentclass' },
      { wrong: '\\usepackag', correct: '\\usepackage' },
      { wrong: '\\sectio ', correct: '\\section' },
      { wrong: '\\subsectio ', correct: '\\subsection' },
    ];

    for (const typo of commonTypos) {
      if (content.includes(typo.wrong)) {
        warnings.push({
          code: 'POSSIBLE_TYPO',
          message: `Possible typo: "${typo.wrong}"`,
          suggestion: `Did you mean "${typo.correct}"?`,
        });
      }
    }
  }

  /**
   * Validate section hierarchy
   */
  private validateSectionHierarchy(content: string, warnings: FormatValidationWarning[]): void {
    const sectionCommands = [
      'chapter',
      'section',
      'subsection',
      'subsubsection',
      'paragraph',
      'subparagraph',
    ];

    const sectionRegex = new RegExp(`\\\\(${sectionCommands.join('|')})(?:\\*)?\\s*\\{`, 'g');
    const sections: { command: string; level: number }[] = [];

    let match;
    while ((match = sectionRegex.exec(content)) !== null) {
      const command = match[1];
      if (command) {
        const level = sectionCommands.indexOf(command);
        sections.push({ command, level });
      }
    }

    // Check for skipped levels
    for (let i = 1; i < sections.length; i++) {
      const prev = sections[i - 1];
      const curr = sections[i];

      if (prev && curr && curr.level > prev.level + 1) {
        warnings.push({
          code: 'SKIPPED_SECTION_LEVEL',
          message: `Section level skipped: ${prev.command} followed by ${curr.command}`,
          suggestion: 'Maintain proper section hierarchy',
        });
      }
    }
  }

  /**
   * Check for orphaned sections
   */
  private checkOrphanedSections(content: string, warnings: FormatValidationWarning[]): void {
    // This is a simplified check
    // Real implementation would be more sophisticated
    const hasChapters = /\\chapter/.test(content);
    const hasSections = /\\section/.test(content);

    if (hasChapters && !hasSections) {
      warnings.push({
        code: 'ORPHANED_CHAPTERS',
        message: 'Chapters found without sections',
        suggestion: 'Consider adding sections to chapters',
      });
    }
  }

  /**
   * Validate labels and references
   */
  private validateLabelsAndReferences(content: string, warnings: FormatValidationWarning[]): void {
    const labels = new Set<string>();
    const references = new Set<string>();

    // Extract labels
    const labelRegex = /\\label\s*\{([^}]+)\}/g;
    let match;
    while ((match = labelRegex.exec(content)) !== null) {
      if (match[1]) {
        labels.add(match[1]);
      }
    }

    // Extract references
    const refRegex = /\\(?:ref|pageref|autoref|eqref)\s*\{([^}]+)\}/g;
    while ((match = refRegex.exec(content)) !== null) {
      if (match[1]) {
        references.add(match[1]);
      }
    }

    // Check for undefined references
    for (const ref of references) {
      if (!labels.has(ref)) {
        warnings.push({
          code: 'UNDEFINED_REFERENCE',
          message: `Reference to undefined label: ${ref}`,
          suggestion: 'Add corresponding \\label{} command',
        });
      }
    }

    // Check for unused labels
    for (const label of labels) {
      if (!references.has(label)) {
        warnings.push({
          code: 'UNUSED_LABEL',
          message: `Unused label: ${label}`,
          suggestion: 'Remove unused label or add reference',
        });
      }
    }
  }

  /**
   * Check inline math balance
   */
  private checkInlineMathBalance(content: string): number {
    let balance = 0;
    let inComment = false;

    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      const prevChar = i > 0 ? content[i - 1] : '';

      if (char === '%' && prevChar !== '\\') {
        inComment = true;
      } else if (char === '\n') {
        inComment = false;
      }

      if (!inComment && char === '$' && prevChar !== '\\') {
        balance = balance === 0 ? 1 : 0;
      }
    }

    return balance;
  }

  /**
   * Check display math balance
   */
  private checkDisplayMathBalance(content: string): number {
    const matches = content.match(/(?<!\\)\$\$/g);
    return matches ? matches.length % 2 : 0;
  }

  /**
   * Validate math environments
   */
  private validateMathEnvironments(content: string, errors: FormatValidationError[]): void {
    const mathEnvs = ['equation', 'align', 'gather', 'multline', 'eqnarray'];

    for (const env of mathEnvs) {
      const beginRegex = new RegExp(`\\\\begin\\s*\\{${env}\\*?\\}`, 'g');
      const endRegex = new RegExp(`\\\\end\\s*\\{${env}\\*?\\}`, 'g');

      const beginMatches = content.match(beginRegex) || [];
      const endMatches = content.match(endRegex) || [];

      if (beginMatches.length !== endMatches.length) {
        errors.push({
          code: 'UNBALANCED_MATH_ENVIRONMENT',
          message: `Unbalanced ${env} environment`,
          severity: 'error',
        });
      }
    }
  }

  /**
   * Validate citation keys
   */
  private validateCitationKeys(content: string, warnings: FormatValidationWarning[]): void {
    const citeRegex = /\\cite(?:p|t|author|year)?\s*(?:\[[^\]]*\])?\s*\{([^}]+)\}/g;

    let match;
    while ((match = citeRegex.exec(content)) !== null) {
      if (match[1]) {
        const keys = match[1].split(',').map((key) => key.trim());

        for (const key of keys) {
          // Check for valid citation key format
          if (!/^[a-zA-Z][a-zA-Z0-9_:-]*$/.test(key)) {
            warnings.push({
              code: 'INVALID_CITATION_KEY',
              message: `Invalid citation key format: ${key}`,
              suggestion:
                'Citation keys should start with a letter and contain only letters, numbers, underscores, colons, and hyphens',
            });
          }
        }
      }
    }
  }

  /**
   * Check for package conflicts
   */
  private checkPackageConflicts(content: string, warnings: FormatValidationWarning[]): void {
    const conflicts = [
      { packages: ['natbib', 'biblatex'], message: 'natbib and biblatex conflict' },
      {
        packages: ['inputenc', 'fontspec'],
        message: 'inputenc conflicts with fontspec (use with XeLaTeX/LuaLaTeX)',
      },
    ];

    for (const conflict of conflicts) {
      const foundPackages = conflict.packages.filter(
        (pkg) => content.includes(`\\usepackage{${pkg}}`) || content.includes(`\\usepackage[`)
      );

      if (foundPackages.length > 1) {
        warnings.push({
          code: 'PACKAGE_CONFLICT',
          message: conflict.message,
          suggestion: `Remove one of: ${foundPackages.join(', ')}`,
        });
      }
    }
  }

  /**
   * Check for required packages
   */
  private checkRequiredPackages(content: string, warnings: FormatValidationWarning[]): void {
    const requirements = [
      {
        feature: /\\includegraphics/,
        package: 'graphicx',
        message: '\\includegraphics requires graphicx package',
      },
      {
        feature: /\\url/,
        package: 'url',
        message: '\\url requires url package',
      },
      {
        feature: /\\href/,
        package: 'hyperref',
        message: '\\href requires hyperref package',
      },
    ];

    for (const req of requirements) {
      if (req.feature.test(content) && !content.includes(`\\usepackage{${req.package}}`)) {
        warnings.push({
          code: 'MISSING_REQUIRED_PACKAGE',
          message: req.message,
          suggestion: `Add \\usepackage{${req.package}}`,
        });
      }
    }
  }
}
