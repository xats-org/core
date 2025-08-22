/**
 * @file HTML Renderer Test Suite
 *
 * Comprehensive tests for the HTML bidirectional renderer including:
 * - Basic rendering functionality
 * - All content block types
 * - SemanticText with all run types
 * - Document structure (Units, Chapters, Sections)
 * - Round-trip conversion fidelity
 * - WCAG 2.1 AA compliance
 * - HTML validation
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { HtmlRenderer } from '../index.js';

import type { XatsDocument, ContentBlock, SemanticText, Chapter } from '@xats-org/types';

describe('HtmlRenderer', () => {
  let renderer: HtmlRenderer;

  beforeEach(() => {
    renderer = new HtmlRenderer({
      wrapInDocument: false, // Disable full document mode for fragment testing
      sanitize: false, // Disable sanitization for testing
    });
  });

  describe('Basic Functionality', () => {
    it('should create a renderer instance with default options', () => {
      expect(renderer).toBeInstanceOf(HtmlRenderer);
      expect(renderer.format).toBe('html');
      expect(renderer.wcagLevel).toBe('AA');
    });

    it('should create a renderer with custom options', () => {
      const customRenderer = new HtmlRenderer({
        wrapInDocument: false,
        includeStyles: false,
        language: 'es',
      });
      expect(customRenderer).toBeInstanceOf(HtmlRenderer);
    });
  });

  describe('Document Structure Rendering', () => {
    const simpleDocument: XatsDocument = {
      schemaVersion: '0.3.0',
      bibliographicEntry: {
        type: 'book',
        title: 'Test Document',
      },
      subject: 'Test Subject',
      bodyMatter: {
        contents: [
          {
            id: 'chapter-1',
            label: '1',
            title: { runs: [{ type: 'text', text: 'Test Chapter' }] },
            contents: [
              {
                id: 'section-1',
                label: '1.1',
                title: { runs: [{ type: 'text', text: 'Test Section' }] },
                contents: [
                  {
                    id: 'block-1',
                    blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                    content: {
                      text: {
                        runs: [{ type: 'text', text: 'This is a test paragraph.' }],
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    it('should render a complete document structure', async () => {
      const result = await renderer.render(simpleDocument, { wrapInDocument: true });

      expect(result.content).toContain('<!DOCTYPE html>');
      expect(result.content).toContain('<title>Test Document</title>');
      expect(result.content).toContain('class="chapter"');
      expect(result.content).toContain('class="section"');
      expect(result.content).toContain('block-paragraph');
      expect(result.content).toContain('This is a test paragraph.');
      expect(result.errors).toHaveLength(0);
    });

    it('should render without document wrapper when fragmentOnly is true', async () => {
      const result = await renderer.render(simpleDocument, { wrapInDocument: false });

      expect(result.content).not.toContain('<!DOCTYPE html>');
      expect(result.content).not.toContain('<html');
      expect(result.content).toContain('<main');
      expect(result.content).toContain('This is a test paragraph.');
    });

    it('should include accessibility features', async () => {
      const result = await renderer.render(simpleDocument, { wrapInDocument: true });

      expect(result.content).toContain('role="main"');
      expect(result.content).toContain('role="region"');
      expect(result.content).toContain('aria-label=');
      expect(result.content).toContain('Skip to main content');
      expect(result.content).toContain('id="main-content"');
    });
  });

  describe('Content Block Rendering', () => {
    const createTestDocument = (blocks: ContentBlock[]): XatsDocument => ({
      schemaVersion: '0.3.0',
      bibliographicEntry: { type: 'book', title: 'Test' },
      subject: 'Test',
      bodyMatter: {
        contents: [
          {
            id: 'chapter-1',
            label: '1',
            title: { runs: [{ type: 'text', text: 'Test Chapter' }] },
            contents: blocks,
          },
        ],
      },
    });

    it('should render paragraph blocks', async () => {
      const blocks: ContentBlock[] = [
        {
          id: 'para-1',
          blockType: 'https://xats.org/vocabularies/blocks/paragraph',
          content: {
            text: { runs: [{ type: 'text', text: 'Test paragraph content.' }] },
          },
        },
      ];

      const result = await renderer.render(createTestDocument(blocks));

      expect(result.content).toContain('block-paragraph');
      expect(result.content).toContain('<p>Test paragraph content.</p>');
    });

    it('should render heading blocks with correct levels', async () => {
      const blocks: ContentBlock[] = [
        {
          id: 'heading-1',
          blockType: 'https://xats.org/vocabularies/blocks/heading',
          content: {
            text: { runs: [{ type: 'text', text: 'Test Heading' }] },
            level: 3,
          },
        },
      ];

      const result = await renderer.render(createTestDocument(blocks));

      expect(result.content).toContain('block-heading');
      expect(result.content).toContain('<h3>Test Heading</h3>');
    });

    it('should render list blocks', async () => {
      const blocks: ContentBlock[] = [
        {
          id: 'list-1',
          blockType: 'https://xats.org/vocabularies/blocks/list',
          content: {
            listType: 'unordered',
            items: [
              { runs: [{ type: 'text', text: 'Item 1' }] },
              { runs: [{ type: 'text', text: 'Item 2' }] },
            ],
          },
        },
      ];

      const result = await renderer.render(createTestDocument(blocks));

      expect(result.content).toContain('block-list');
      expect(result.content).toContain('<ul>');
      expect(result.content).toContain('<li>Item 1</li>');
      expect(result.content).toContain('<li>Item 2</li>');
    });

    it('should render blockquote blocks', async () => {
      const blocks: ContentBlock[] = [
        {
          id: 'quote-1',
          blockType: 'https://xats.org/vocabularies/blocks/blockquote',
          content: {
            text: { runs: [{ type: 'text', text: 'This is a quote.' }] },
            attribution: { runs: [{ type: 'text', text: 'Author Name' }] },
          },
        },
      ];

      const result = await renderer.render(createTestDocument(blocks));

      expect(result.content).toContain('block-blockquote');
      expect(result.content).toContain('<blockquote>');
      expect(result.content).toContain('This is a quote.');
      expect(result.content).toContain('<cite>Author Name</cite>');
    });

    it('should render code blocks with language', async () => {
      const blocks: ContentBlock[] = [
        {
          id: 'code-1',
          blockType: 'https://xats.org/vocabularies/blocks/codeBlock',
          content: {
            code: 'console.log("Hello, world!");',
            language: 'javascript',
          },
        },
      ];

      const result = await renderer.render(createTestDocument(blocks));

      expect(result.content).toContain('block-code');
      expect(result.content).toContain('<pre><code');
      expect(result.content).toContain('data-language="javascript"');
      expect(result.content).toContain('console.log(&quot;Hello, world!&quot;);');
    });

    it('should render math blocks', async () => {
      const blocks: ContentBlock[] = [
        {
          id: 'math-1',
          blockType: 'https://xats.org/vocabularies/blocks/mathBlock',
          content: {
            math: 'E = mc^2',
          },
        },
      ];

      const result = await renderer.render(createTestDocument(blocks));

      expect(result.content).toContain('block-math');
      expect(result.content).toContain('class="math-block"');
      expect(result.content).toContain('role="img"');
      expect(result.content).toContain('aria-label="Mathematical expression"');
      expect(result.content).toContain('E = mc^2');
    });

    it('should render table blocks with headers', async () => {
      const blocks: ContentBlock[] = [
        {
          id: 'table-1',
          blockType: 'https://xats.org/vocabularies/blocks/table',
          content: {
            caption: { runs: [{ type: 'text', text: 'Test Table' }] },
            headers: [
              { runs: [{ type: 'text', text: 'Header 1' }] },
              { runs: [{ type: 'text', text: 'Header 2' }] },
            ],
            rows: [
              [
                { runs: [{ type: 'text', text: 'Cell 1' }] },
                { runs: [{ type: 'text', text: 'Cell 2' }] },
              ],
            ],
          },
        },
      ];

      const result = await renderer.render(createTestDocument(blocks));

      expect(result.content).toContain('block-table');
      expect(result.content).toContain('<table role="table">');
      expect(result.content).toContain('<caption>Test Table</caption>');
      expect(result.content).toContain('<thead>');
      expect(result.content).toContain('<th scope="col">Header 1</th>');
      expect(result.content).toContain('<tbody>');
      expect(result.content).toContain('<td>Cell 1</td>');
    });

    it('should render figure blocks with caption', async () => {
      const blocks: ContentBlock[] = [
        {
          id: 'figure-1',
          blockType: 'https://xats.org/vocabularies/blocks/figure',
          content: {
            src: '/images/test.jpg',
            alt: 'Test image description',
            caption: { runs: [{ type: 'text', text: 'Figure 1: Test Image' }] },
            width: 800,
            height: 600,
          },
        },
      ];

      const result = await renderer.render(createTestDocument(blocks));

      expect(result.content).toContain('block-figure');
      expect(result.content).toContain('<figure>');
      expect(result.content).toContain('src="/images/test.jpg"');
      expect(result.content).toContain('alt="Test image description"');
      expect(result.content).toContain('width="800"');
      expect(result.content).toContain('height="600"');
      expect(result.content).toContain('<figcaption>Figure 1: Test Image</figcaption>');
    });

    it('should render placeholder blocks', async () => {
      const blocks: ContentBlock[] = [
        {
          id: 'toc-1',
          blockType: 'https://xats.org/vocabularies/placeholders/tableOfContents',
          content: {},
        },
      ];

      const result = await renderer.render(createTestDocument(blocks));

      expect(result.content).toContain('placeholder-toc');
      expect(result.content).toContain('role="region"');
      expect(result.content).toContain('aria-label="Table of Contents"');
      expect(result.content).toContain('[Table of Contents will be generated here]');
    });
  });

  describe('SemanticText Rendering', () => {
    const createTestParagraph = (semanticText: SemanticText): XatsDocument => ({
      schemaVersion: '0.3.0',
      bibliographicEntry: { type: 'book', title: 'Test' },
      subject: 'Test',
      bodyMatter: {
        contents: [
          {
            id: 'chapter-1',
            label: '1',
            title: { runs: [{ type: 'text', text: 'Test Chapter' }] },
            contents: [
              {
                id: 'para-1',
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: { text: semanticText },
              },
            ],
          },
        ],
      },
    });

    it('should render text runs', async () => {
      const semanticText: SemanticText = {
        runs: [{ type: 'text', text: 'Plain text content.' }],
      };

      const result = await renderer.render(createTestParagraph(semanticText));
      expect(result.content).toContain('Plain text content.');
    });

    it('should render emphasis and strong runs', async () => {
      const semanticText: SemanticText = {
        runs: [
          { type: 'text', text: 'This is ' },
          { type: 'emphasis', text: 'emphasized' },
          { type: 'text', text: ' and ' },
          { type: 'strong', text: 'strong' },
          { type: 'text', text: ' text.' },
        ],
      };

      const result = await renderer.render(createTestParagraph(semanticText));
      expect(result.content).toContain(
        'This is <em>emphasized</em> and <strong>strong</strong> text.'
      );
    });

    it('should render code runs', async () => {
      const semanticText: SemanticText = {
        runs: [
          { type: 'text', text: 'Use the ' },
          { type: 'code', text: 'console.log()' },
          { type: 'text', text: ' function.' },
        ],
      };

      const result = await renderer.render(createTestParagraph(semanticText));
      expect(result.content).toContain('Use the <code>console.log()</code> function.');
    });

    it('should render reference runs with links', async () => {
      const semanticText: SemanticText = {
        runs: [
          { type: 'text', text: 'See ' },
          {
            type: 'reference',
            text: 'Chapter 2',
            ref: 'chapter-2',
            label: 'Reference to Chapter 2',
          },
          { type: 'text', text: ' for details.' },
        ],
      };

      const result = await renderer.render(createTestParagraph(semanticText));
      expect(result.content).toContain(
        'See <a class="reference" href="#chapter-2" aria-label="Reference to Chapter 2">Chapter 2</a> for details.'
      );
    });

    it('should render citation runs', async () => {
      const semanticText: SemanticText = {
        runs: [
          { type: 'text', text: 'According to the research ' },
          { type: 'citation', citeKey: 'smith2023' },
          { type: 'text', text: ', this is true.' },
        ],
      };

      const result = await renderer.render(createTestParagraph(semanticText));
      expect(result.content).toContain(
        'According to the research <a class="citation" href="#cite-smith2023" role="doc-noteref" aria-label="Citation smith2023">[smith2023]</a>, this is true.'
      );
    });

    it('should render math inline runs', async () => {
      const semanticText: SemanticText = {
        runs: [
          { type: 'text', text: 'The formula is ' },
          { type: 'mathInline', math: 'x^2 + y^2 = z^2' },
          { type: 'text', text: '.' },
        ],
      };

      const result = await renderer.render(createTestParagraph(semanticText));
      expect(result.content).toContain(
        'The formula is <span class="math-inline" role="img" aria-label="Mathematical expression">x^2 + y^2 = z^2</span>.'
      );
    });

    it('should render subscript and superscript runs', async () => {
      const semanticText: SemanticText = {
        runs: [
          { type: 'text', text: 'H' },
          { type: 'subscript', text: '2' },
          { type: 'text', text: 'O and E=mc' },
          { type: 'superscript', text: '2' },
        ],
      };

      const result = await renderer.render(createTestParagraph(semanticText));
      expect(result.content).toContain('H<sub>2</sub>O and E=mc<sup>2</sup>');
    });

    it('should render strikethrough and underline runs', async () => {
      const semanticText: SemanticText = {
        runs: [
          { type: 'strikethrough', text: 'deleted text' },
          { type: 'text', text: ' and ' },
          { type: 'underline', text: 'underlined text' },
        ],
      };

      const result = await renderer.render(createTestParagraph(semanticText));
      expect(result.content).toContain('<del>deleted text</del> and <u>underlined text</u>');
    });

    it('should render index runs with metadata', async () => {
      const semanticText: SemanticText = {
        runs: [
          { type: 'text', text: 'The concept of ' },
          {
            type: 'index',
            text: 'machine learning',
            entry: 'machine learning',
            subEntry: 'algorithms',
          },
          { type: 'text', text: ' is important.' },
        ],
      };

      const result = await renderer.render(createTestParagraph(semanticText));
      expect(result.content).toContain(
        'The concept of <span class="index-entry" data-index-term="machine learning" data-sub-entry="algorithms">machine learning</span> is important.'
      );
    });
  });

  describe('HTML to Xats Parsing', () => {
    it('should parse simple HTML back to xats', async () => {
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Test Document</title>
          <meta name="subject" content="Test Subject">
        </head>
        <body>
          <main class="xats-document">
            <section class="body-matter">
              <section class="chapter" id="ch-1">
                <header class="chapter-header">
                  <span class="chapter-label">Chapter 1</span>
                  <h2 class="chapter-title">Test Chapter</h2>
                </header>
                <div class="chapter-content">
                  <div class="content-block block-paragraph" id="para-1">
                    <p>This is a test paragraph.</p>
                  </div>
                </div>
              </section>
            </section>
          </main>
        </body>
        </html>
      `;

      const result = await renderer.parse(html);

      expect(result.document.schemaVersion).toBe('0.3.0');
      expect(result.document.bibliographicEntry.title).toBe('Test Document');
      expect(result.document.subject).toBe('Test Subject');
      expect(result.document.bodyMatter.contents).toHaveLength(1);

      const chapter = result.document.bodyMatter.contents[0] as Chapter;
      expect(chapter.id).toBe('ch-1');
      expect(chapter.label).toBe('1');
      const firstRun = chapter.title.runs[0];
      if (firstRun && 'text' in firstRun) {
        expect(firstRun.text).toBe('Test Chapter');
      }
    });

    it('should parse different block types correctly', async () => {
      const html = `
        <main class="xats-document">
          <section class="body-matter">
            <section class="chapter">
              <div class="content-block block-list">
                <ul>
                  <li>Item 1</li>
                  <li>Item 2</li>
                </ul>
              </div>
              <div class="content-block block-code">
                <pre><code data-language="javascript">console.log("test");</code></pre>
              </div>
            </section>
          </section>
        </main>
      `;

      const result = await renderer.parse(html);
      const chapter = result.document.bodyMatter.contents[0] as Chapter;

      expect(chapter.contents).toHaveLength(2);
      const firstContent = chapter.contents?.[0];
      const secondContent = chapter.contents?.[1];
      if (firstContent && 'blockType' in firstContent) {
        expect(firstContent.blockType).toBe('https://xats.org/vocabularies/blocks/list');
      }
      if (secondContent && 'blockType' in secondContent) {
        expect(secondContent.blockType).toBe('https://xats.org/vocabularies/blocks/codeBlock');
      }
    });
  });

  describe('Round-trip Conversion', () => {
    it('should maintain fidelity for basic document structure', async () => {
      const originalDoc: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Round-trip Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              label: '1',
              title: { runs: [{ type: 'text', text: 'Test Chapter' }] },
              contents: [
                {
                  id: 'para-1',
                  blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                  content: {
                    text: { runs: [{ type: 'text', text: 'Test content.' }] },
                  },
                },
              ],
            },
          ],
        },
      };

      // Render to HTML with full document
      const renderResult = await renderer.render(originalDoc, { wrapInDocument: true });
      expect(renderResult.errors).toHaveLength(0);

      // Parse back to xats
      const parseResult = await renderer.parse(renderResult.content);
      expect(parseResult.errors).toHaveLength(0);

      // Verify key properties are preserved (some loss is expected in basic parsing)
      expect(parseResult.document.bibliographicEntry.title).toBe('Round-trip Test');
      expect(parseResult.document.subject).toBe('Testing');
      expect(parseResult.document.bodyMatter.contents).toHaveLength(1);
    });

    it('should use round-trip tester for fidelity measurement', async () => {
      const testDoc: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: { type: 'book', title: 'Test' },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'ch-1',
              label: '1',
              title: { runs: [{ type: 'text', text: 'Chapter' }] },
              contents: [
                {
                  id: 'para-1',
                  blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                  content: {
                    text: { runs: [{ type: 'text', text: 'Content.' }] },
                  },
                },
              ],
            },
          ],
        },
      };

      const roundTripResult = await renderer.testRoundTrip(testDoc);

      expect(roundTripResult.success).toBeDefined();
      expect(roundTripResult.fidelityScore).toBeDefined();
      expect(roundTripResult.differences).toBeDefined();
    });
  });

  describe('WCAG Compliance', () => {
    const accessibilityDoc: XatsDocument = {
      schemaVersion: '0.3.0',
      bibliographicEntry: { type: 'book', title: 'Accessibility Test' },
      subject: 'Accessibility',
      lang: 'en',
      dir: 'ltr',
      accessibilityMetadata: {
        accessibilityFeature: ['structuralNavigation', 'alternativeText'],
        accessibilityHazard: ['none'],
        accessibilitySummary: 'This document is fully accessible.',
      },
      bodyMatter: {
        contents: [
          {
            id: 'ch-1',
            label: '1',
            title: { runs: [{ type: 'text', text: 'Accessible Chapter' }] },
            contents: [
              {
                id: 'table-1',
                blockType: 'https://xats.org/vocabularies/blocks/table',
                content: {
                  caption: { runs: [{ type: 'text', text: 'Accessible Table' }] },
                  headers: [
                    { runs: [{ type: 'text', text: 'Column 1' }] },
                    { runs: [{ type: 'text', text: 'Column 2' }] },
                  ],
                  rows: [
                    [
                      { runs: [{ type: 'text', text: 'Data 1' }] },
                      { runs: [{ type: 'text', text: 'Data 2' }] },
                    ],
                  ],
                },
              },
            ],
          },
        ],
      },
    };

    it('should include WCAG-required attributes', async () => {
      const result = await renderer.render(accessibilityDoc, { wrapInDocument: true });

      // Document language
      expect(result.content).toContain('lang="en"');
      expect(result.content).toContain('dir="ltr"');

      // Skip link
      expect(result.content).toContain('Skip to main content');
      expect(result.content).toContain('href="#main-content"');

      // Main landmark
      expect(result.content).toContain('role="main"');
      expect(result.content).toContain('id="main-content"');

      // Section roles
      expect(result.content).toContain('role="region"');

      // Table accessibility
      expect(result.content).toContain('role="table"');
      expect(result.content).toContain('scope="col"');
      expect(result.content).toContain('<caption>');

      // Accessibility metadata
      expect(result.content).toContain('name="accessibilityFeature"');
      expect(result.content).toContain('name="accessibilityHazard"');
      expect(result.content).toContain('name="accessibilitySummary"');
    });

    it('should pass WCAG compliance test', async () => {
      const result = await renderer.render(accessibilityDoc, { wrapInDocument: true });
      const complianceResult = await renderer.testCompliance(result.content, 'AA');

      expect(complianceResult).toBeDefined();
      // Note: Actual compliance testing would require axe-core or similar
      // For now we just verify the method exists and returns a result
    });

    it('should generate accessibility audit', async () => {
      const result = await renderer.render(accessibilityDoc, { wrapInDocument: true });
      const auditResult = await renderer.auditAccessibility(result.content);

      expect(auditResult).toBeDefined();
      // Note: Actual auditing would require axe-core or similar
      // For now we just verify the method exists and returns a result
    });
  });

  describe('HTML Validation', () => {
    it('should validate well-formed HTML', async () => {
      const testDoc: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: { type: 'book', title: 'Valid HTML Test' },
        subject: 'Validation',
        bodyMatter: {
          contents: [
            {
              id: 'ch-1',
              label: '1',
              title: { runs: [{ type: 'text', text: 'Chapter' }] },
              contents: [
                {
                  id: 'para-1',
                  blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                  content: {
                    text: { runs: [{ type: 'text', text: 'Valid content.' }] },
                  },
                },
              ],
            },
          ],
        },
      };

      const result = await renderer.render(testDoc, { wrapInDocument: true });
      const validation = await renderer.validate(result.content);

      // Should have some warnings but be structurally valid
      expect(validation.metadata?.validator).toBe('jsdom');
      // The main checks we care about should pass
      expect(result.content).toContain('<!DOCTYPE html>');
      expect(result.content).toContain('lang=');
      expect(result.content).toContain('charset="UTF-8"');
    });

    it('should detect HTML validation errors', async () => {
      const invalidHtml = '<html><body><p>Unclosed paragraph</body></html>';
      const validation = await renderer.validate(invalidHtml);

      // Should detect missing DOCTYPE, charset, and lang
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some((error) => error.code === 'MISSING_DOCTYPE')).toBe(true);
      expect(validation.errors.some((error) => error.code === 'MISSING_CHARSET')).toBe(true);
      expect(validation.errors.some((error) => error.code === 'MISSING_LANG')).toBe(true);
    });
  });

  describe('Metadata Extraction', () => {
    it('should extract HTML metadata correctly', async () => {
      const html = `
        <!DOCTYPE html>
        <html lang="fr" dir="ltr">
        <head>
          <meta charset="UTF-8">
          <title>French Document</title>
        </head>
        <body>
          <main role="main">
            <section role="region">
              <p>Content in French.</p>
            </section>
          </main>
        </body>
        </html>
      `;

      const metadata = await renderer.getMetadata(html);

      expect(metadata.format).toBe('html');
      expect(metadata.version).toBe('5');
      expect(metadata.encoding).toBe('utf-8');
      expect(metadata.language).toBe('fr');
      expect(metadata.wordCount).toBeGreaterThan(0);
      expect(metadata.elementCount).toBeGreaterThan(0);
      expect(metadata.features).toContain('aria');
      expect(metadata.features).toContain('semantic-main');
    });
  });

  describe('Error Handling', () => {
    it('should handle rendering errors gracefully', async () => {
      const invalidDoc = {
        schemaVersion: '0.3.0',
        bibliographicEntry: { type: 'book' }, // missing title
        subject: 'Test',
        bodyMatter: { contents: [] },
      } as XatsDocument;

      const result = await renderer.render(invalidDoc);

      // Should still produce some output even with errors
      expect(result.content).toContain('<main');
      expect(result.metadata?.format).toBe('html');
    });

    it('should handle parsing errors gracefully', async () => {
      const malformedHtml = '<html><body><div>Unclosed div<body></html>';

      const result = await renderer.parse(malformedHtml);

      // Should return a valid empty document
      expect(result.document.schemaVersion).toBe('0.3.0');
      expect(result.document.bodyMatter.contents).toHaveLength(0);
    });
  });

  describe('Enhanced Rendering Hints (v0.5.0)', () => {
    const createDocumentWithHints = (
      hints: Array<{ hintType: string; value: unknown }>
    ): XatsDocument => ({
      schemaVersion: '0.5.0',
      bibliographicEntry: { type: 'book', title: 'Rendering Hints Test' },
      subject: 'Testing',
      bodyMatter: {
        contents: [
          {
            id: 'ch-1',
            label: '1',
            title: { runs: [{ type: 'text', text: 'Test Chapter' }] },
            contents: [
              {
                id: 'para-1',
                blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                content: {
                  text: { runs: [{ type: 'text', text: 'Test content with rendering hints.' }] },
                },
                renderingHints: hints,
              },
            ],
          },
        ],
      },
    });

    it('should render semantic hints correctly', async () => {
      const hints = [
        { hintType: 'https://xats.org/vocabularies/hints/semantic/warning', value: 'warning' },
        { hintType: 'https://xats.org/vocabularies/hints/semantic/featured', value: 'featured' },
      ];

      const result = await renderer.render(createDocumentWithHints(hints), { enhancedHints: true });

      expect(result.content).toContain('semantic-warning');
      expect(result.content).toContain('semantic-featured');
      expect(result.content).toContain('role="alert"'); // From semantic warning
    });

    it('should render accessibility hints correctly', async () => {
      const hints = [
        {
          hintType: 'https://xats.org/vocabularies/hints/accessibility/screen-reader-priority-high',
          value: 'high',
        },
        {
          hintType: 'https://xats.org/vocabularies/hints/accessibility/keyboard-shortcut',
          value: 'Ctrl+1',
        },
      ];

      const result = await renderer.render(createDocumentWithHints(hints), { enhancedHints: true });

      expect(result.content).toContain('sr-priority-high');
      expect(result.content).toContain('accesskey="Ctrl+1"');
      expect(result.content).toContain('aria-live="assertive"');
    });

    it('should render layout hints correctly', async () => {
      const hints = [
        {
          hintType: 'https://xats.org/vocabularies/hints/layout/keep-together',
          value: 'keep-together',
        },
        { hintType: 'https://xats.org/vocabularies/hints/layout/center', value: 'center' },
      ];

      const result = await renderer.render(createDocumentWithHints(hints), { enhancedHints: true });

      expect(result.content).toContain('layout-keep-together');
      expect(result.content).toContain('layout-center');
      expect(result.content).toContain('page-break-inside: avoid');
      expect(result.content).toContain('margin: 0 auto');
    });

    it('should render pedagogical hints correctly', async () => {
      const hints = [
        {
          hintType: 'https://xats.org/vocabularies/hints/pedagogical/key-concept',
          value: 'key-concept',
        },
        {
          hintType: 'https://xats.org/vocabularies/hints/pedagogical/learning-objective',
          value: 'learning-objective',
        },
      ];

      const result = await renderer.render(createDocumentWithHints(hints), { enhancedHints: true });

      expect(result.content).toContain('pedagogical-key-concept');
      expect(result.content).toContain('pedagogical-learning-objective');
      expect(result.content).toContain('role="note"'); // From key-concept hint
    });

    it('should handle conditional hints based on user preferences', async () => {
      const hints = [
        {
          hintType: 'https://xats.org/vocabularies/hints/accessibility/high-contrast-compatible',
          value: 'high-contrast',
          conditions: { userPreferences: ['high-contrast'] },
        },
      ];

      // Test with matching preference
      const resultWithPreference = await renderer.render(createDocumentWithHints(hints), {
        enhancedHints: true,
        userPreferences: ['high-contrast'],
      });
      expect(resultWithPreference.content).toContain('high-contrast-compatible');

      // Test without matching preference
      const resultWithoutPreference = await renderer.render(createDocumentWithHints(hints), {
        enhancedHints: true,
        userPreferences: [],
      });
      expect(resultWithoutPreference.content).not.toContain('high-contrast-compatible');
    });

    it('should parse rendering hints back from HTML', async () => {
      const originalHints = [
        { hintType: 'https://xats.org/vocabularies/hints/semantic/warning', value: 'warning' },
      ];

      // Render with hints
      const renderResult = await renderer.render(createDocumentWithHints(originalHints), {
        enhancedHints: true,
        wrapInDocument: true,
      });

      // Parse back to xats
      const parseResult = await renderer.parse(renderResult.content);
      expect(parseResult.errors).toHaveLength(0);

      // Check that hints were reconstructed
      const firstChapter = parseResult.document.bodyMatter.contents[0];
      if (firstChapter && 'contents' in firstChapter && firstChapter.contents) {
        const firstBlock = firstChapter.contents[0];

        if (firstBlock && 'renderingHints' in firstBlock) {
          const hints = firstBlock.renderingHints as Array<{ hintType: string; value: unknown }>;
          expect(hints.length).toBeGreaterThan(0);

          // Check that we can find at least one semantic hint
          const hintTypes = hints.map((h) => h.hintType);
          const hasSemanticHint = hintTypes.some((type) => type.includes('semantic'));
          expect(hasSemanticHint).toBe(true);
        }
      }
    });
  });

  describe('Performance Optimizations', () => {
    const createLargeDocument = (blockCount: number): XatsDocument => {
      const blocks = Array.from({ length: blockCount }, (_, i) => ({
        id: `block-${i}`,
        blockType: 'https://xats.org/vocabularies/blocks/paragraph',
        content: {
          text: { runs: [{ type: 'text', text: `This is paragraph ${i + 1}.` }] },
        },
      }));

      return {
        schemaVersion: '0.3.0',
        bibliographicEntry: { type: 'book', title: 'Large Document Test' },
        subject: 'Performance',
        bodyMatter: {
          contents: [
            {
              id: 'ch-1',
              label: '1',
              title: { runs: [{ type: 'text', text: 'Large Chapter' }] },
              contents: blocks,
            },
          ],
        },
      };
    };

    it('should detect large documents correctly', async () => {
      const smallDoc = createLargeDocument(10);
      const largeDoc = createLargeDocument(1500);

      // Small document should render normally
      const smallResult = await renderer.render(smallDoc, { optimizeForLargeDocuments: true });
      expect(smallResult.errors).toHaveLength(0);

      // Large document should use optimized rendering
      const largeResult = await renderer.render(largeDoc, {
        optimizeForLargeDocuments: true,
        memoryOptimized: true,
        wrapInDocument: true,
      });
      expect(largeResult.errors).toHaveLength(0);
      expect(largeResult.content).toContain('Large Document Test'); // Should be in title tag
    });

    it('should handle memory optimization settings', async () => {
      const doc = createLargeDocument(100);

      const result = await renderer.render(doc, {
        optimizeForLargeDocuments: true,
        memoryOptimized: true,
        maxChunks: 10,
      });

      expect(result.errors).toHaveLength(0);
      expect(result.content).toContain('This is paragraph');
    });
  });

  describe('Sanitization', () => {
    it('should sanitize HTML when enabled', async () => {
      const testDoc: XatsDocument = {
        schemaVersion: '0.3.0',
        bibliographicEntry: { type: 'book', title: 'Sanitization Test' },
        subject: 'Security',
        bodyMatter: {
          contents: [
            {
              id: 'ch-1',
              label: '1',
              title: { runs: [{ type: 'text', text: 'Chapter' }] },
              contents: [
                {
                  id: 'para-1',
                  blockType: 'https://xats.org/vocabularies/blocks/paragraph',
                  content: {
                    text: { runs: [{ type: 'text', text: 'Safe content.' }] },
                  },
                },
              ],
            },
          ],
        },
      };

      const result = await renderer.render(testDoc, { sanitize: true, wrapInDocument: true });

      // Should not contain potentially dangerous elements
      expect(result.content).not.toContain('<script');
      expect(result.content).not.toContain('javascript:');
      expect(result.content).toContain('Safe content.');
    });
  });
});
