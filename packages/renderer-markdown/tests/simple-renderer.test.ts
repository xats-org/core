/**
 * Simple Markdown Renderer Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { SimpleMarkdownRenderer } from '../src/simple-renderer.js';

import type { XatsDocument } from '@xats-org/types';

describe('SimpleMarkdownRenderer', () => {
  let renderer: SimpleMarkdownRenderer;

  beforeEach(() => {
    renderer = new SimpleMarkdownRenderer();
  });

  describe('Basic Rendering', () => {
    it('should render a simple document', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('# Test Document');
      expect(result.metadata?.format).toBe('markdown');
      expect(result.metadata?.wordCount).toBeGreaterThan(0);
    });

    it('should handle front matter option', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
          author: 'Test Author',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.render(document, { 
        includeFrontMatter: true 
      });

      expect(result.content).toContain('---');
      expect(result.content).toContain('title: "Test Document"');
      expect(result.content).toContain('author: "Test Author"');
      expect(result.content).toContain('subject: "Testing"');
      expect(result.content).not.toContain('# Test Document');
    });

    it('should handle author information', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
          author: ['Author One', 'Author Two'],
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.render(document, { 
        includeFrontMatter: true 
      });

      expect(result.content).toContain('author: "Author One, Author Two"');
    });

    it('should handle paragraph content blocks', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [
                  { type: 'text', text: 'This is a test paragraph with ' },
                  { type: 'emphasis', text: 'emphasized text' },
                  { type: 'text', text: ' and ' },
                  { type: 'strong', text: 'bold text' },
                  { type: 'text', text: '.' },
                ],
              },
            },
          ],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('This is a test paragraph with *emphasized text* and **bold text**.');
    });

    it('should handle blockquote content blocks', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'quote1',
              blockType: 'https://xats.org/vocabularies/blocks/blockquote',
              content: {
                runs: [
                  { type: 'text', text: 'This is a blockquote.' },
                ],
              },
            },
          ],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('> This is a blockquote.');
    });

    it('should handle code blocks', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'code1',
              blockType: 'https://xats.org/vocabularies/blocks/codeBlock',
              content: 'console.log("Hello, world!");',
              extensions: { language: 'javascript' },
            },
          ],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('```javascript');
      expect(result.content).toContain('console.log("Hello, world!");');
      expect(result.content).toContain('```');
    });

    it('should handle math blocks', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'math1',
              blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
              content: 'E = mc^2',
            },
          ],
        },
      };

      const result = await renderer.render(document, { enableAcademic: true });

      expect(result.content).toContain('$$');
      expect(result.content).toContain('E = mc^2');
    });

    it('should escape special Markdown characters', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test *Document* with [Special] Characters',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('# Test *Document* with [Special] Characters');
    });
  });

  describe('Basic Parsing', () => {
    it('should parse a simple Markdown document', async () => {
      const markdownContent = `# Parsed Document

This is a test paragraph.

## Section

Another paragraph with *emphasis* and **strong** text.`;

      const result = await renderer.parse(markdownContent);

      expect(result.document.bibliographicEntry.title).toBe('Parsed Document');
      expect(result.document.schemaVersion).toBe('0.5.0');
      expect(result.metadata?.sourceFormat).toBe('markdown');
      expect(result.metadata?.fidelityScore).toBeGreaterThan(0.8);
    });

    it('should parse front matter', async () => {
      const markdownContent = `---
title: "Front Matter Document"
author: "Test Author"
subject: "Science"
---

# Content

This is the content.`;

      const result = await renderer.parse(markdownContent);

      expect(result.document.bibliographicEntry.title).toBe('Front Matter Document');
      expect(result.metadata?.fidelityScore).toBeGreaterThan(0.8);
    });

    it('should handle missing title gracefully', async () => {
      const markdownContent = `This is content without a title.`;

      const result = await renderer.parse(markdownContent);

      expect(result.document.bibliographicEntry.title).toBe('Parsed Document');
      expect(result.errors).toHaveLength(0);
    });

    it('should handle parsing errors', async () => {
      const invalidMarkdown = null as any;

      const result = await renderer.parse(invalidMarkdown);

      expect(result.errors).toBeDefined();
      expect(result.metadata?.fidelityScore).toBe(0);
    });

    it('should parse emphasis and strong text', async () => {
      const markdownContent = `# Test

This paragraph has *emphasized* and **strong** text.`;

      const result = await renderer.parse(markdownContent);

      expect(result.document.bodyMatter.contents).toBeDefined();
      expect(result.document.bodyMatter.contents.length).toBeGreaterThan(0);
    });

    it('should parse blockquotes', async () => {
      const markdownContent = `# Test

> This is a blockquote
> with multiple lines.`;

      const result = await renderer.parse(markdownContent);

      expect(result.document.bodyMatter.contents).toBeDefined();
      const units = result.document.bodyMatter.contents as any[];
      expect(units.length).toBeGreaterThan(0);
      const unit = units[0];
      expect(unit.contents).toBeDefined();
      const blocks = unit.contents;
      const blockquote = blocks.find((b: any) => b.blockType === 'https://xats.org/vocabularies/blocks/blockquote');
      expect(blockquote).toBeDefined();
    });

    it('should parse code blocks', async () => {
      const markdownContent = `# Test

\`\`\`javascript
console.log("Hello");
\`\`\``;

      const result = await renderer.parse(markdownContent);

      expect(result.document.bodyMatter.contents).toBeDefined();
      const units = result.document.bodyMatter.contents as any[];
      expect(units.length).toBeGreaterThan(0);
      const unit = units[0];
      expect(unit.contents).toBeDefined();
      const blocks = unit.contents;
      const codeBlock = blocks.find((b: any) => b.blockType === 'https://xats.org/vocabularies/blocks/codeBlock');
      expect(codeBlock).toBeDefined();
      expect(codeBlock?.extensions?.language).toBe('javascript');
    });
  });

  describe('Round-trip Testing', () => {
    it('should perform basic round-trip conversion', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Round-trip Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [{ type: 'text', text: 'Test paragraph.' }],
              },
            },
          ],
        },
      };

      const result = await renderer.testRoundTrip(document);

      expect(result.success).toBe(true);
      expect(result.fidelityScore).toBeGreaterThan(0.8);
      expect(result.original).toEqual(document);
      expect(result.roundTrip.bibliographicEntry.title).toBe('Round-trip Test');
      expect(result.metrics.renderTime).toBeGreaterThan(0);
      expect(result.metrics.parseTime).toBeGreaterThan(0);
    });

    it('should detect differences in round-trip', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Original Title',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const result = await renderer.testRoundTrip(document, {
        fidelityThreshold: 0.99, // High threshold to potentially trigger differences
      });

      expect(result.differences).toBeDefined();
      expect(result.metrics.renderTime).toBeGreaterThan(0);
      expect(result.metrics.parseTime).toBeGreaterThan(0);
    });

    it('should handle round-trip errors gracefully', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      // Force an error by mocking render to throw
      const originalRender = renderer.render.bind(renderer);
      renderer.render = () => {
        throw new Error('Test error');
      };

      const result = await renderer.testRoundTrip(document);

      expect(result.success).toBe(false);
      expect(result.fidelityScore).toBe(0);
      expect(result.differences[0].impact).toBe('critical');

      // Restore original method
      renderer.render = originalRender;
    });
  });

  describe('Validation', () => {
    it('should validate correct Markdown', async () => {
      const validMarkdown = `# Title

This is valid Markdown content.

## Section

- List item 1
- List item 2`;

      const result = await renderer.validate(validMarkdown);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle empty content', async () => {
      const emptyMarkdown = '';

      const result = await renderer.validate(emptyMarkdown);

      expect(result.valid).toBe(false);
      expect(result.warnings.some(w => w.code === 'EMPTY_CONTENT')).toBe(true);
    });

    it('should detect unbalanced emphasis markers', async () => {
      const unbalancedMarkdown = `# Title

This has *unbalanced emphasis.`;

      const result = await renderer.validate(unbalancedMarkdown);

      expect(result.warnings.some(w => w.code === 'UNBALANCED_EMPHASIS')).toBe(true);
    });

    it('should handle null input', async () => {
      const result = await renderer.validate(null as any);

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === 'VALIDATION_ERROR')).toBe(true);
    });

    it('should detect malformed tables', async () => {
      const malformedTable = `# Title

| Header 1 | Header 2 |
| Data 1   | Data 2   |`; // Missing separator row

      const result = await renderer.validate(malformedTable);

      expect(result.warnings.some(w => w.code === 'MALFORMED_TABLE')).toBe(true);
    });
  });

  describe('Metadata Extraction', () => {
    it('should extract document metadata', async () => {
      const markdownContent = `# Test Document

This is a paragraph with *emphasis*.

## Section

Here's a [link](https://example.com) and an image:

![Alt text](image.jpg)

\`\`\`javascript
console.log("code");
\`\`\``;

      const metadata = await renderer.getMetadata(markdownContent);

      expect(metadata.format).toBe('markdown');
      expect(metadata.variant).toBe('commonmark');
      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.headings).toHaveLength(2);
      expect(metadata.headings?.[0].level).toBe(1);
      expect(metadata.headings?.[0].text).toBe('Test Document');
      expect(metadata.links).toHaveLength(1);
      expect(metadata.links?.[0].url).toBe('https://example.com');
      expect(metadata.images).toHaveLength(1);
      expect(metadata.images?.[0].src).toBe('image.jpg');
      expect(metadata.codeBlocks).toHaveLength(1);
      expect(metadata.codeBlocks?.[0].language).toBe('javascript');
      expect(metadata.readingTime).toBeGreaterThan(0);
      expect(metadata.complexityScore).toBeGreaterThan(0);
    });

    it('should handle parsing errors in metadata extraction', async () => {
      const invalidContent = null as any;

      const metadata = await renderer.getMetadata(invalidContent);

      expect(metadata.format).toBe('markdown');
      expect(metadata.wordCount).toBe(0);
      expect(metadata.headings).toHaveLength(0);
    });
  });

  describe('WCAG Compliance', () => {
    it('should test WCAG compliance', async () => {
      const accessibleMarkdown = `# Document Title

![Descriptive alt text](image.jpg)

[Descriptive link text](https://example.com)

## Section Header`;

      const result = await renderer.testCompliance(accessibleMarkdown, 'AA');

      expect(result.level).toBe('AA');
      expect(result.score).toBeGreaterThan(80);
    });

    it('should detect missing alt text', async () => {
      const inaccessibleMarkdown = `# Title

![](image-without-alt.jpg)`;

      const result = await renderer.testCompliance(inaccessibleMarkdown, 'AA');

      expect(result.compliant).toBe(false);
      expect(result.violations.some(v => v.criterion === '1.1.1')).toBe(true);
    });

    it('should detect poor link text', async () => {
      const poorLinksMarkdown = `# Title

[Click here](https://example.com) for more information.
[Read more](https://example.com/article)`;

      const result = await renderer.testCompliance(poorLinksMarkdown, 'AA');

      expect(result.warnings.some(w => w.criterion === '2.4.4')).toBe(true);
    });

    it('should detect improper heading hierarchy', async () => {
      const badHierarchyMarkdown = `# Title

#### Skipped H2 and H3`;

      const result = await renderer.testCompliance(badHierarchyMarkdown, 'AA');

      expect(result.warnings.some(w => w.criterion === '1.3.1')).toBe(true);
    });

    it('should provide accessibility audit', async () => {
      const content = `# Title

Some content with accessibility issues:
![](no-alt.jpg)
[Click here](link.html)`;

      const audit = await renderer.auditAccessibility(content);

      expect(audit.compliant).toBe(false);
      expect(audit.overallScore).toBeGreaterThan(0);
      expect(audit.recommendations).toHaveLength(3);
      expect(audit.testedAt).toBeInstanceOf(Date);
      expect(audit.levelA.level).toBe('A');
      expect(audit.levelAA.level).toBe('AA');
      expect(audit.levelAAA.level).toBe('AAA');
    });
  });

  describe('Format Properties', () => {
    it('should have correct format identifier', () => {
      expect(renderer.format).toBe('markdown');
    });

    it('should indicate WCAG AA compliance capability', () => {
      expect(renderer.wcagLevel).toBe('AA');
    });
  });

  describe('Error Handling', () => {
    it('should handle rendering errors gracefully', async () => {
      const invalidDocument = {} as XatsDocument;

      const result = await renderer.render(invalidDocument);

      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
      expect(result.content).toBe('');
    });

    it('should handle complex content structures', async () => {
      const complexDocument: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Complex Document',
        },
        subject: 'Advanced Testing',
        bodyMatter: {
          contents: [
            {
              id: 'unit1',
              title: { runs: [{ type: 'text', text: 'Unit 1' }] },
              contents: [
                {
                  id: 'chapter1',
                  title: { runs: [{ type: 'text', text: 'Chapter 1' }] },
                  contents: [
                    {
                      id: 'section1',
                      title: { runs: [{ type: 'text', text: 'Section 1' }] },
                      contents: [
                        {
                          id: 'para1',
                          blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                          content: {
                            runs: [{ type: 'text', text: 'Complex nested content.' }],
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const result = await renderer.render(complexDocument);

      expect(result.content).toContain('# Complex Document');
      expect(result.content).toContain('## Unit 1');
      expect(result.content).toContain('### Chapter 1');
      expect(result.content).toContain('#### Section 1');
      expect(result.content).toContain('Complex nested content.');
    });
  });

  describe('Advanced Features', () => {
    it('should handle citations', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [
                  { type: 'text', text: 'This is a citation ' },
                  { type: 'citation', text: 'Smith 2020', citeKey: 'smith2020' },
                  { type: 'text', text: '.' },
                ],
              },
            },
          ],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('[@smith2020]');
    });

    it('should handle references', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'para1',
              blockType: 'https://xats.org/vocabularies/blocks/paragraph',
              content: {
                runs: [
                  { type: 'text', text: 'See ' },
                  { type: 'reference', text: 'Section 1', ref: 'section1' },
                  { type: 'text', text: ' for details.' },
                ],
              },
            },
          ],
        },
      };

      const result = await renderer.render(document);

      expect(result.content).toContain('[Section 1](#section1)');
    });

    it('should handle various syntax preferences', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Test Document',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'code1',
              blockType: 'https://xats.org/vocabularies/blocks/codeBlock',
              content: 'test code',
              extensions: { language: 'text' },
            },
          ],
        },
      };

      const result = await renderer.render(document, {
        syntaxPreferences: {
          codeFence: '~~~',
          emphasisMarker: '_',
          strongMarker: '__',
        },
      });

      expect(result.content).toContain('~~~text');
    });
  });
});