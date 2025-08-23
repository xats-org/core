/**
 * Tests for RMarkdown bidirectional renderer
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { createSemanticText, buildCoreUri } from '@xats-org/utils';

import {
  RMarkdownRenderer,
  createRMarkdownRenderer,
  OUTPUT_FORMAT_CONFIGS,
  ACADEMIC_WORKFLOW_CONFIGS,
} from '../index.js';

import type { XatsDocument } from '@xats-org/types';

describe('RMarkdownRenderer', () => {
  let renderer: RMarkdownRenderer;
  let sampleDocument: XatsDocument;

  beforeEach(() => {
    renderer = new RMarkdownRenderer();

    sampleDocument = {
      schemaVersion: '0.3.0',
      bibliographicEntry: {
        type: 'article-journal',
        title: 'Statistical Analysis with R',
        author: [
          { given: 'Jane', family: 'Smith' },
          { given: 'John', family: 'Doe' },
        ],
        issued: { 'date-parts': [[2024, 1, 15]] },
      },
      subject: buildCoreUri('subjects', 'statistics'),
      bodyMatter: {
        contents: [
          {
            id: 'introduction',
            title: createSemanticText('Introduction'),
            contents: [
              {
                id: 'intro-para',
                blockType: buildCoreUri('blocks', 'paragraph'),
                content: createSemanticText(
                  'This document demonstrates statistical analysis using R.'
                ),
              },
              {
                id: 'r-setup',
                blockType: buildCoreUri('blocks', 'codeBlock'),
                content: {
                  code: 'library(dplyr)\nlibrary(ggplot2)\n\n# Load data\ndata <- mtcars',
                  language: 'r',
                  executable: true,
                  label: 'setup',
                  options: {
                    message: false,
                    warning: false,
                  },
                },
              },
            ],
          },
        ],
      },
    };
  });

  describe('render', () => {
    it('should render xats document to R Markdown', async () => {
      const result = await renderer.render(sampleDocument);

      expect(result.content).toContain('---');
      expect(result.content).toContain('title: "Statistical Analysis with R"');
      expect(result.content).toContain('# Introduction');
      expect(result.content).toContain('```{r setup');
      expect(result.content).toContain('library(dplyr)');
      expect(result.metadata?.format).toBe('rmarkdown');
    });

    it('should include YAML frontmatter when enabled', async () => {
      const result = await renderer.render(sampleDocument, {
        includeFrontmatter: true,
      });

      expect(result.content).toMatch(/^---\n/);
      expect(result.content).toContain('title:');
      expect(result.content).toContain('author:');
      expect(result.content).toContain('date:');
    });

    it('should handle code chunks with options', async () => {
      const result = await renderer.render(sampleDocument, {
        preserveCodeChunks: true,
        defaultChunkOptions: {
          echo: false,
          eval: true,
        },
      });

      expect(result.content).toContain('```{r setup');
      expect(result.content).toContain('message=FALSE');
      expect(result.content).toContain('warning=FALSE');
    });

    it('should support bookdown format', async () => {
      const result = await renderer.render(sampleDocument, {
        useBookdown: true,
        enableCrossReferences: true,
      });

      expect(result.content).toContain('# Introduction {#introduction}');
    });
  });

  describe('parse', () => {
    it('should parse R Markdown content to xats', async () => {
      const rmarkdownContent = `---
title: "Test Document"
author: "Test Author"
date: "2024-01-15"
output: html_document
---

# Introduction

This is a test document with R code.

\`\`\`{r setup, echo=TRUE, message=FALSE}
library(dplyr)
data <- mtcars
\`\`\`

The analysis shows interesting results.
`;

      const result = await renderer.parse(rmarkdownContent);

      expect(result.document.bibliographicEntry.title).toBe('Test Document');
      expect(result.document.bodyMatter.contents).toHaveLength(1);
      expect(result.metadata?.format).toBe('rmarkdown');
    });

    it('should parse code chunks correctly', async () => {
      const rmarkdownContent = `# Analysis

\`\`\`{r data-prep, echo=FALSE, warning=FALSE}
# Prepare data
clean_data <- mtcars %>%
  filter(mpg > 20)
\`\`\`
`;

      const result = await renderer.parse(rmarkdownContent);
      const firstContent = result.document.bodyMatter.contents[0];
      if (firstContent && 'contents' in firstContent && firstContent.contents) {
        const codeBlocks = firstContent.contents.filter((block) =>
          block.blockType?.includes('codeBlock')
        );

        expect(codeBlocks).toHaveLength(1);
        const firstBlock = codeBlocks[0];
        expect(
          firstBlock &&
            typeof firstBlock === 'object' &&
            'content' in firstBlock &&
            typeof firstBlock.content === 'object' &&
            firstBlock.content !== null &&
            'language' in firstBlock.content
            ? firstBlock.content.language
            : undefined
        ).toBe('r');
        expect(
          firstBlock &&
            typeof firstBlock === 'object' &&
            'content' in firstBlock &&
            typeof firstBlock.content === 'object' &&
            firstBlock.content !== null &&
            'code' in firstBlock.content
            ? String(firstBlock.content.code)
            : ''
        ).toContain('clean_data');
      } else {
        throw new Error('Expected first content to have contents property');
      }
    });

    it('should handle bookdown cross-references', async () => {
      const rmarkdownContent = `# Methods {#methods}

See Figure \\@ref(fig:plot1) for details.

\`\`\`{r plot1, fig.cap="Sample Plot"}
plot(mtcars$mpg, mtcars$hp)
\`\`\`
`;

      const result = await renderer.parse(rmarkdownContent, {
        parseBookdownReferences: true,
      });

      const crossRefs = result.metadata?.crossReferences;
      expect(crossRefs).toBeDefined();
      if (crossRefs) {
        expect(crossRefs).toHaveLength(1);
        expect(crossRefs[0]?.type).toBe('fig');
        expect(crossRefs[0]?.label).toBe('plot1');
      }
    });
  });

  describe('testRoundTrip', () => {
    it('should maintain high fidelity in round-trip conversion', async () => {
      const result = await renderer.testRoundTrip(sampleDocument);

      expect(result.success).toBe(true);
      expect(result.fidelityScore).toBeGreaterThan(0.8);
      expect(result.metrics.renderTime).toBeGreaterThan(0);
      expect(result.metrics.parseTime).toBeGreaterThan(0);
    });

    it('should identify differences in round-trip conversion', async () => {
      const complexDocument = {
        ...sampleDocument,
        bodyMatter: {
          contents: [
            ...sampleDocument.bodyMatter.contents,
            {
              id: 'analysis',
              title: createSemanticText('Data Analysis'),
              contents: [
                {
                  id: 'table-block',
                  blockType: buildCoreUri('blocks', 'table'),
                  content: {
                    headers: ['Variable', 'Mean', 'SD'],
                    rows: [
                      ['mpg', '20.09', '6.03'],
                      ['hp', '146.69', '68.56'],
                    ],
                    caption: createSemanticText('Summary Statistics'),
                  },
                },
              ],
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(complexDocument);

      expect(result.differences).toBeDefined();
      expect(result.fidelityScore).toBeGreaterThan(0.7);
    });
  });

  describe('validate', () => {
    it('should validate well-formed R Markdown', async () => {
      const validContent = `---
title: "Valid Document"
---

# Introduction

\`\`\`{r setup, echo=TRUE}
library(ggplot2)
\`\`\`
`;

      const result = await renderer.validate(validContent);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid chunk options', async () => {
      const invalidContent = `# Test

\`\`\`{r test, invalid_option=true}
x <- 1
\`\`\`
`;

      const result = await renderer.validate(invalidContent);

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should detect duplicate chunk labels', async () => {
      const duplicateContent = `\`\`\`{r test}
x <- 1
\`\`\`

\`\`\`{r test}
y <- 2
\`\`\`
`;

      const result = await renderer.validate(duplicateContent);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]?.code).toBe('duplicate-label');
    });
  });

  describe('getMetadata', () => {
    it('should extract document metadata', async () => {
      const content = `---
title: "Research Paper"
author: "Dr. Smith"
bibliography: references.bib
---

# Introduction

\`\`\`{r setup}
library(tidyverse)
\`\`\`

Some analysis here.

\`\`\`{r analysis}
model <- lm(mpg ~ hp, data = mtcars)
\`\`\`
`;

      const metadata = await renderer.getMetadata(content);

      expect(metadata.format).toBe('rmarkdown');
      expect(metadata.codeChunks?.length).toBe(2);
      expect(metadata.features).toContain('code-chunks');
      expect(metadata.features).toContain('yaml-frontmatter');
    });
  });

  describe('factory functions', () => {
    it('should create renderer with default options', () => {
      const renderer = createRMarkdownRenderer();
      expect(renderer).toBeInstanceOf(RMarkdownRenderer);
    });

    it('should create renderer with custom options', () => {
      const renderer = createRMarkdownRenderer({ useBookdown: true }, { parseCodeChunks: false });
      expect(renderer).toBeInstanceOf(RMarkdownRenderer);
    });
  });

  describe('output format configurations', () => {
    it('should render with HTML document configuration', async () => {
      const result = await renderer.render(sampleDocument, OUTPUT_FORMAT_CONFIGS.HTML_DOCUMENT);

      expect(result.content).toContain('output: html_document');
    });

    it('should render with Bookdown configuration', async () => {
      const result = await renderer.render(sampleDocument, OUTPUT_FORMAT_CONFIGS.BOOKDOWN_GITBOOK);

      expect(result.content).toContain('output: bookdown::gitbook');
      expect(result.content).toContain('{#introduction}');
    });
  });

  describe('academic workflows', () => {
    it('should support statistical analysis workflow', async () => {
      const result = await renderer.render(
        sampleDocument,
        ACADEMIC_WORKFLOW_CONFIGS.STATISTICAL_ANALYSIS
      );

      expect(result.content).toContain('warning=FALSE');
      expect(result.content).toContain('message=FALSE');
    });

    it('should support academic paper workflow', async () => {
      const result = await renderer.render(
        sampleDocument,
        ACADEMIC_WORKFLOW_CONFIGS.ACADEMIC_PAPER
      );

      expect(result.content).toContain('bookdown::pdf_book');
      expect(result.content).toContain('echo=FALSE');
    });
  });
});
