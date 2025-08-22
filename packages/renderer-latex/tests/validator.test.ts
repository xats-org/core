/**
 * LaTeX Validator Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LaTeXValidator } from '../src/validator.js';

describe('LaTeXValidator', () => {
  let validator: LaTeXValidator;

  beforeEach(() => {
    validator = new LaTeXValidator();
  });

  describe('Basic Syntax Validation', () => {
    it('should validate a correct LaTeX document', async () => {
      const validLatex = `
\\documentclass{article}
\\usepackage[utf8]{inputenc}

\\begin{document}
\\title{Valid Document}
\\author{Test Author}
\\maketitle

\\section{Introduction}
This is a valid paragraph.

\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(validLatex);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing document class', async () => {
      const invalidLatex = `
\\usepackage[utf8]{inputenc}

\\begin{document}
Content without document class.
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(invalidLatex);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_DOCUMENT_CLASS')).toBe(true);
    });

    it('should detect missing begin/end document', async () => {
      const invalidLatex = `
\\documentclass{article}
\\usepackage[utf8]{inputenc}

Content without document environment.
      `.trim();

      const result = await validator.validateLaTeX(invalidLatex);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_BEGIN_DOCUMENT')).toBe(true);
      expect(result.errors.some(e => e.code === 'MISSING_END_DOCUMENT')).toBe(true);
    });

    it('should detect unbalanced braces', async () => {
      const invalidLatex = `
\\documentclass{article}

\\begin{document}
\\section{Unbalanced {braces
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(invalidLatex);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNBALANCED_BRACES')).toBe(true);
    });

    it('should detect unbalanced environments', async () => {
      const invalidLatex = `
\\documentclass{article}

\\begin{document}
\\begin{itemize}
\\item First item
\\end{enumerate}
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(invalidLatex);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'ENVIRONMENT_MISMATCH')).toBe(true);
    });

    it('should detect unclosed environments', async () => {
      const invalidLatex = `
\\documentclass{article}

\\begin{document}
\\begin{itemize}
\\item First item
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(invalidLatex);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNCLOSED_ENVIRONMENTS')).toBe(true);
    });
  });

  describe('Math Validation', () => {
    it('should detect unbalanced inline math', async () => {
      const invalidLatex = `
\\documentclass{article}

\\begin{document}
This has unbalanced $math delimiters.
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(invalidLatex);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNBALANCED_INLINE_MATH')).toBe(true);
    });

    it('should detect unbalanced display math', async () => {
      const invalidLatex = `
\\documentclass{article}

\\begin{document}
This has unbalanced $$display math.
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(invalidLatex);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNBALANCED_DISPLAY_MATH')).toBe(true);
    });

    it('should detect unbalanced math environments', async () => {
      const invalidLatex = `
\\documentclass{article}

\\begin{document}
\\begin{equation}
E = mc^2
\\end{align}
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(invalidLatex);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'UNBALANCED_MATH_ENVIRONMENT')).toBe(true);
    });
  });

  describe('Citation Validation', () => {
    it('should warn about missing bibliography', async () => {
      const latexWithCitations = `
\\documentclass{article}

\\begin{document}
This cites \\cite{reference1} but has no bibliography.
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(latexWithCitations);

      expect(result.warnings.some(w => w.code === 'MISSING_BIBLIOGRAPHY')).toBe(true);
    });

    it('should validate citation key format', async () => {
      const latexWithBadCitations = `
\\documentclass{article}

\\begin{document}
This has invalid citation \\cite{123invalid-key}.
\\bibliography{refs}
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(latexWithBadCitations);

      expect(result.warnings.some(w => w.code === 'INVALID_CITATION_KEY')).toBe(true);
    });
  });

  describe('Structure Validation', () => {
    it('should warn about skipped section levels', async () => {
      const badStructure = `
\\documentclass{article}

\\begin{document}
\\section{Section 1}
\\subsubsection{Skipped subsection level}
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(badStructure);

      expect(result.warnings.some(w => w.code === 'SKIPPED_SECTION_LEVEL')).toBe(true);
    });

    it('should detect undefined references', async () => {
      const undefinedRef = `
\\documentclass{article}

\\begin{document}
\\section{Introduction}
\\label{sec:intro}

See \\ref{sec:nonexistent}.
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(undefinedRef);

      expect(result.warnings.some(w => w.code === 'UNDEFINED_REFERENCE')).toBe(true);
    });

    it('should detect unused labels', async () => {
      const unusedLabel = `
\\documentclass{article}

\\begin{document}
\\section{Introduction}
\\label{sec:intro}
\\label{sec:unused}

See \\ref{sec:intro}.
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(unusedLabel);

      expect(result.warnings.some(w => w.code === 'UNUSED_LABEL')).toBe(true);
    });
  });

  describe('Package Validation', () => {
    it('should warn about package conflicts', async () => {
      const conflictingPackages = `
\\documentclass{article}
\\usepackage{natbib}
\\usepackage{biblatex}

\\begin{document}
Content
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(conflictingPackages);

      expect(result.warnings.some(w => w.code === 'PACKAGE_CONFLICT')).toBe(true);
    });

    it('should warn about missing required packages', async () => {
      const missingPackage = `
\\documentclass{article}

\\begin{document}
\\includegraphics{image.png}
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(missingPackage);

      expect(result.warnings.some(w => w.code === 'MISSING_REQUIRED_PACKAGE')).toBe(true);
    });
  });

  describe('Common Typos', () => {
    it('should detect common command typos', async () => {
      const typoLatex = `
\\documentclass{article}

\\begind{document}
Content with typo
\\endd{document}
      `.trim();

      const result = await validator.validateLaTeX(typoLatex);

      expect(result.warnings.some(w => w.code === 'POSSIBLE_TYPO')).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should handle validation errors gracefully', async () => {
      const nullInput = null as any;

      const result = await validator.validateLaTeX(nullInput);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Metadata', () => {
    it('should include validation metadata', async () => {
      const validLatex = `
\\documentclass{article}
\\begin{document}
Content
\\end{document}
      `.trim();

      const result = await validator.validateLaTeX(validLatex);

      expect(result.metadata?.validator).toBe('xats-latex-validator');
      expect(result.metadata?.version).toBeTruthy();
      expect(result.metadata?.validatedAt).toBeInstanceOf(Date);
    });
  });
});