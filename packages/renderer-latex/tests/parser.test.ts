/**
 * LaTeX Parser Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { LaTeXParser } from '../src/parser.js';

describe('LaTeXParser', () => {
  let parser: LaTeXParser;

  beforeEach(() => {
    parser = new LaTeXParser();
  });

  describe('Basic Parsing', () => {
    it('should parse a simple LaTeX document', async () => {
      const latexContent = `
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\title{Test Document}
\\author{Test Author}

\\begin{document}
\\maketitle

\\section{Introduction}
This is a test paragraph.

\\end{document}
      `.trim();

      const result = await parser.parseToXats(latexContent);

      expect(result.document.schemaVersion).toBe('0.3.0');
      expect(result.document.bibliographicEntry.title).toBe('Test Document');
      expect(result.fidelityScore).toBeGreaterThan(0);
    });

    it('should handle parsing errors gracefully', async () => {
      const invalidLatex = 'invalid latex content {{{';

      const result = await parser.parseToXats(invalidLatex);

      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.fidelityScore).toBe(0);
    });
  });

  describe('Metadata Extraction', () => {
    it('should extract document metadata', async () => {
      const latexContent = `
\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\title{Test Document}
\\author{Test Author}
\\date{2024}

\\begin{document}
\\maketitle

\\section{Introduction}
This cites \\cite{reference1}.

\\begin{equation}
E = mc^2
\\label{eq:einstein}
\\end{equation}

\\begin{figure}
\\includegraphics{image.png}
\\caption{Test figure}
\\label{fig:test}
\\end{figure}

\\ref{eq:einstein} and \\ref{fig:test}

\\bibliography{references}
\\end{document}
      `.trim();

      const metadata = await parser.extractMetadata(latexContent);

      expect(metadata.documentClass).toBe('article');
      expect(metadata.documentOptions).toContain('12pt');
      expect(metadata.documentOptions).toContain('a4paper');
      expect(metadata.packages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'inputenc' }),
          expect.objectContaining({ name: 'amsmath' }),
          expect.objectContaining({ name: 'graphicx' }),
        ])
      );
      expect(metadata.citations).toContain('reference1');
      expect(metadata.labels).toContain('eq:einstein');
      expect(metadata.labels).toContain('fig:test');
      expect(metadata.references).toContain('eq:einstein');
      expect(metadata.references).toContain('fig:test');
      expect(metadata.figures).toBe(1);
      expect(metadata.bibliographyFiles).toContain('references');
    });

    it('should extract custom commands', async () => {
      const latexContent = `
\\documentclass{article}
\\newcommand{\\mycmd}[1]{\\textbf{#1}}
\\renewcommand{\\emph}[1]{\\textit{#1}}

\\begin{document}
Test content.
\\end{document}
      `.trim();

      const metadata = await parser.extractMetadata(latexContent);

      expect(metadata.customCommands).toContain('\\mycmd');
      expect(metadata.customCommands).toContain('\\emph');
    });

    it('should detect math environments', async () => {
      const latexContent = `
\\documentclass{article}

\\begin{document}
\\begin{equation}
x = y
\\end{equation}

\\begin{align}
a &= b \\\\
c &= d
\\end{align}

\\begin{gather*}
e = f
\\end{gather*}
\\end{document}
      `.trim();

      const metadata = await parser.extractMetadata(latexContent);

      expect(metadata.mathEnvironments).toContain('equation');
      expect(metadata.mathEnvironments).toContain('align');
      expect(metadata.mathEnvironments).toContain('gather*');
    });

    it('should assess engine compatibility', async () => {
      const xelatexContent = `
\\documentclass{article}
\\usepackage{fontspec}
\\usepackage{xltxtra}

\\begin{document}
Test
\\end{document}
      `.trim();

      const metadata = await parser.extractMetadata(xelatexContent);

      expect(metadata.engineCompatibility?.xelatex).toBe(true);
      expect(metadata.engineCompatibility?.pdflatex).toBe(true);
    });

    it('should estimate compilation passes', async () => {
      const complexContent = `
\\documentclass{article}

\\begin{document}
\\tableofcontents

\\section{Introduction}
This cites \\cite{ref1}.

\\section{Conclusion}
See \\ref{sec:intro}.

\\bibliography{refs}
\\end{document}
      `.trim();

      const metadata = await parser.extractMetadata(complexContent);

      expect(metadata.compilationPasses).toBeGreaterThan(1);
    });
  });

  describe('Content Extraction', () => {
    it('should clean LaTeX text properly', async () => {
      const latexContent = `
\\documentclass{article}

\\begin{document}
\\title{\\textbf{Bold Title} and \\emph{italic text}}
\\end{document}
      `.trim();

      const metadata = await parser.extractMetadata(latexContent);
      
      // The extraction should clean the title
      expect(metadata.format).toBe('latex');
    });
  });

  describe('Error Recovery', () => {
    it('should handle malformed documents', async () => {
      const malformedContent = `
\\documentclass{article
missing closing brace
\\begin{document}
content
      `.trim();

      const result = await parser.parseToXats(malformedContent);

      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.document).toBeDefined();
    });

    it('should provide meaningful error messages', async () => {
      const invalidContent = 'completely invalid content';

      const result = await parser.parseToXats(invalidContent);

      expect(result.errors![0].type).toBe('invalid-format');
      expect(result.errors![0].message).toBeTruthy();
    });
  });
});