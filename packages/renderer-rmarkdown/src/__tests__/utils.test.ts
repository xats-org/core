/**
 * Tests for R Markdown utility functions
 */

import { describe, it, expect } from 'vitest';

import {
  parseChunkHeader,
  parseChunkOptionValue,
  serializeChunkOptions,
  parseYamlFrontmatter,
  serializeYamlFrontmatter,
  extractCodeChunks,
  extractInlineCode,
  parseBookdownReferences,
  validateRMarkdown,
  normalizeChunkOptions,
  generateChunkLabel,
  extractMathExpressions,
  cleanRMarkdownContent,
} from '../utils.js';

import type { RMarkdownFrontmatter } from '../types.js';

describe('R Markdown Utilities', () => {
  describe('parseChunkHeader', () => {
    it('should parse basic chunk header', () => {
      const result = parseChunkHeader('r setup');

      expect(result.engine).toBe('r');
      expect(result.label).toBe('setup');
      expect(result.options).toEqual({ label: 'setup' });
    });

    it('should parse chunk header with options', () => {
      const result = parseChunkHeader('r analysis, echo=FALSE, warning=TRUE, fig.width=8');

      expect(result.engine).toBe('r');
      expect(result.label).toBe('analysis');
      expect(result.options.echo).toBe(false);
      expect(result.options.warning).toBe(true);
      expect(result.options['fig.width']).toBe(8);
    });

    it('should parse chunk header without label', () => {
      const result = parseChunkHeader('python, eval=FALSE');

      expect(result.engine).toBe('python');
      expect(result.label).toBeUndefined();
      expect(result.options.eval).toBe(false);
    });

    it('should handle quoted values', () => {
      const result = parseChunkHeader('r test, results="asis", comment=""');

      expect(result.options.results).toBe('asis');
      expect(result.options.comment).toBe('');
    });

    it('should handle array values', () => {
      const result = parseChunkHeader('r test, dependson=c("chunk1", "chunk2")');

      expect(result.options.dependson).toEqual(['chunk1', 'chunk2']);
    });
  });

  describe('parseChunkOptionValue', () => {
    it('should parse boolean values', () => {
      expect(parseChunkOptionValue('TRUE')).toBe(true);
      expect(parseChunkOptionValue('FALSE')).toBe(false);
      expect(parseChunkOptionValue('true')).toBe(true);
      expect(parseChunkOptionValue('false')).toBe(false);
    });

    it('should parse numeric values', () => {
      expect(parseChunkOptionValue('123')).toBe(123);
      expect(parseChunkOptionValue('12.5')).toBe(12.5);
      expect(parseChunkOptionValue('-10')).toBe(-10);
    });

    it('should parse string values', () => {
      expect(parseChunkOptionValue('"hello"')).toBe('hello');
      expect(parseChunkOptionValue("'world'")).toBe('world');
      expect(parseChunkOptionValue('test')).toBe('test');
    });

    it('should parse array values', () => {
      expect(parseChunkOptionValue('c("a", "b")')).toEqual(['a', 'b']);
      expect(parseChunkOptionValue('c(1, 2, 3)')).toEqual([1, 2, 3]);
    });
  });

  describe('serializeChunkOptions', () => {
    it('should serialize basic chunk options', () => {
      const result = serializeChunkOptions('r', 'test', {
        echo: false,
        eval: true,
        warning: false,
      });

      expect(result).toBe('{r, test, echo=FALSE, eval=TRUE, warning=FALSE}');
    });

    it('should handle chunk without label', () => {
      const result = serializeChunkOptions('python', undefined, {
        eval: false,
      });

      expect(result).toBe('{python, eval=FALSE}');
    });

    it('should handle complex options', () => {
      const result = serializeChunkOptions('r', 'plot', {
        fig: { width: 8, height: 6 },
        echo: true,
      });

      expect(result).toContain('{r, plot');
      expect(result).toContain('echo=TRUE');
    });
  });

  describe('parseYamlFrontmatter', () => {
    it('should parse basic YAML frontmatter', () => {
      const content = `---
title: "Test Document"
author: "John Doe"
date: "2024-01-15"
output: html_document
---

# Introduction`;

      const result = parseYamlFrontmatter(content);

      expect(result?.title).toBe('Test Document');
      expect(result?.author).toBe('John Doe');
      expect(result?.date).toBe('2024-01-15');
      expect(result?.output).toBe('html_document');
    });

    it('should return null for content without frontmatter', () => {
      const content = '# Introduction\n\nThis is content without frontmatter.';

      const result = parseYamlFrontmatter(content);

      expect(result).toBeNull();
    });

    it('should handle array values', () => {
      const content = `---
title: "Test"
author: ["John Doe", "Jane Smith"]
keywords: ["R", "statistics", "analysis"]
---`;

      const result = parseYamlFrontmatter(content);

      expect(result?.author && Array.isArray(result.author)).toBe(true);
      expect(result?.keywords && Array.isArray(result.keywords)).toBe(true);
    });
  });

  describe('serializeYamlFrontmatter', () => {
    it('should serialize frontmatter to YAML', () => {
      const frontmatter: RMarkdownFrontmatter = {
        title: 'Test Document',
        author: 'John Doe',
        date: '2024-01-15',
        output: 'html_document' as const,
        toc: true,
      };

      const result = serializeYamlFrontmatter(frontmatter);

      expect(result).toContain('---');
      expect(result).toContain('title: Test Document');
      expect(result).toContain('author: John Doe');
      expect(result).toContain('toc: true');
    });

    it('should handle complex values', () => {
      const frontmatter: RMarkdownFrontmatter = {
        author: ['John Doe', 'Jane Smith'],
        output: {
          html_document: {
            toc: true,
            theme: 'united',
          },
        } as any,
      };

      const result = serializeYamlFrontmatter(frontmatter);

      expect(result).toContain('author: [John Doe, Jane Smith]');
    });
  });

  describe('extractCodeChunks', () => {
    it('should extract R code chunks', () => {
      const content = `# Analysis

\`\`\`{r setup, echo=FALSE}
library(ggplot2)
data <- mtcars
\`\`\`

Some text here.

\`\`\`{r plot, fig.width=8}
ggplot(data, aes(x = mpg, y = hp)) +
  geom_point()
\`\`\`
`;

      const chunks = extractCodeChunks(content);

      expect(chunks).toHaveLength(2);
      expect(chunks[0]?.options.engine).toBe('r');
      expect(chunks[0]?.options.label).toBe('setup');
      expect(chunks[0]?.code).toContain('library(ggplot2)');

      expect(chunks[1]?.options.label).toBe('plot');
      expect(chunks[1]?.code).toContain('ggplot');
    });

    it('should handle different engines', () => {
      const content = `\`\`\`{python data-prep}
import pandas as pd
df = pd.read_csv('data.csv')
\`\`\`

\`\`\`{sql query}
SELECT * FROM users WHERE age > 18;
\`\`\`
`;

      const chunks = extractCodeChunks(content);

      expect(chunks).toHaveLength(2);
      expect(chunks[0]?.options.engine).toBe('python');
      expect(chunks[1]?.options.engine).toBe('sql');
    });
  });

  describe('extractInlineCode', () => {
    it('should extract inline R code', () => {
      const content = 'The mean is `r mean(data$mpg)` and the SD is `r sd(data$mpg)`.';

      const inline = extractInlineCode(content);

      expect(inline).toHaveLength(2);
      expect(inline[0]?.engine).toBe('r');
      expect(inline[0]?.code).toBe('mean(data$mpg)');
      expect(inline[1]?.code).toBe('sd(data$mpg)');
    });

    it('should handle different engines inline', () => {
      const content = 'Python: `python len(data)` and R: `r nrow(data)`.';

      const inline = extractInlineCode(content);

      expect(inline).toHaveLength(2);
      expect(inline[0]?.engine).toBe('python');
      expect(inline[1]?.engine).toBe('r');
    });
  });

  describe('parseBookdownReferences', () => {
    it('should parse cross-references', () => {
      const content = `See Figure \\@ref(fig:plot1) and Table \\@ref(tab:summary) for details.
Also refer to Section \\@ref(sec:methods).`;

      const refs = parseBookdownReferences(content);

      expect(refs).toHaveLength(3);
      expect(refs[0]?.type).toBe('fig');
      expect(refs[0]?.label).toBe('plot1');
      expect(refs[1]?.type).toBe('tab');
      expect(refs[1]?.label).toBe('summary');
      expect(refs[2]?.type).toBe('sec');
      expect(refs[2]?.label).toBe('methods');
    });
  });

  describe('validateRMarkdown', () => {
    it('should validate well-formed content', () => {
      const content = `---
title: "Valid Document"
---

# Introduction

\`\`\`{r setup, echo=TRUE}
library(ggplot2)
\`\`\`
`;

      const errors = validateRMarkdown(content);

      expect(errors).toHaveLength(0);
    });

    it('should detect duplicate chunk labels', () => {
      const content = `\`\`\`{r test}
x <- 1
\`\`\`

\`\`\`{r test}
y <- 2
\`\`\`
`;

      const errors = validateRMarkdown(content);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.type).toBe('duplicate-label');
      expect(errors[0]?.severity).toBe('error');
    });

    it('should detect missing references', () => {
      const content = `See Figure \\@ref(fig:nonexistent) for details.`;

      const errors = validateRMarkdown(content);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]?.type).toBe('missing-reference');
    });
  });

  describe('normalizeChunkOptions', () => {
    it('should apply default options', () => {
      const options = normalizeChunkOptions({
        echo: false,
      });

      expect(options.echo).toBe(false);
      expect(options.eval).toBe(true); // default
      expect(options.include).toBe(true); // default
      expect(options.warning).toBe(true); // default
    });

    it('should override with custom defaults', () => {
      const options = normalizeChunkOptions({ echo: false }, { warning: false, message: false });

      expect(options.echo).toBe(false);
      expect(options.warning).toBe(false);
      expect(options.message).toBe(false);
    });
  });

  describe('generateChunkLabel', () => {
    it('should generate unique chunk labels', () => {
      const existing = new Set(['r-chunk-1', 'python-chunk-1']);

      const label1 = generateChunkLabel('r', 1, existing);
      const label2 = generateChunkLabel('python', 1, existing);

      expect(label1).toBe('r-chunk-1-1');
      expect(label2).toBe('python-chunk-1-1');
    });

    it('should generate simple labels when no conflicts', () => {
      const existing = new Set<string>();

      const label = generateChunkLabel('r', 1, existing);

      expect(label).toBe('r-chunk-1');
    });
  });

  describe('extractMathExpressions', () => {
    it('should extract display math', () => {
      const content = 'The formula is $$E = mc^2$$ where E is energy.';

      const expressions = extractMathExpressions(content);

      expect(expressions).toHaveLength(1);
      expect(expressions[0]?.type).toBe('display');
      expect(expressions[0]?.content).toBe('E = mc^2');
    });

    it('should extract inline math', () => {
      const content = 'The value of $x$ is calculated as $x = \\sqrt{y}$.';

      const expressions = extractMathExpressions(content);

      expect(expressions).toHaveLength(2);
      expect(expressions[0]?.type).toBe('inline');
      expect(expressions[0]?.content).toBe('x');
      expect(expressions[1]?.type).toBe('inline');
      expect(expressions[1]?.content).toBe('x = \\sqrt{y}');
    });

    it('should handle mixed math expressions', () => {
      const content = `Inline math $\\alpha$ and display math:

$$\\int_0^\\infty e^{-x} dx = 1$$

More inline: $\\beta = 2$.`;

      const expressions = extractMathExpressions(content);

      expect(expressions).toHaveLength(3);
      expect(expressions[1]?.type).toBe('display');
      expect(expressions[1]?.content).toBe('\\int_0^\\infty e^{-x} dx = 1');
    });
  });

  describe('cleanRMarkdownContent', () => {
    it('should remove frontmatter and code chunks', () => {
      const content = `---
title: "Test"
author: "Author"
---

# Introduction

This is regular text.

\`\`\`{r setup}
library(ggplot2)
\`\`\`

More text here with inline \`r mean(x)\` code.

## Analysis

Final paragraph.
`;

      const cleaned = cleanRMarkdownContent(content);

      expect(cleaned).not.toContain('---');
      expect(cleaned).not.toContain('title:');
      expect(cleaned).not.toContain('```{r');
      expect(cleaned).not.toContain('library(ggplot2)');
      expect(cleaned).not.toContain('\`r mean(x)\`');
      expect(cleaned).toContain('# Introduction');
      expect(cleaned).toContain('This is regular text');
      expect(cleaned).toContain('## Analysis');
    });
  });
});
