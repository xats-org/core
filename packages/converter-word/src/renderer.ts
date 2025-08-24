/**
 * @fileoverview Word document renderer - converts xats to Word
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  BorderStyle,
  ShadingType,
  WidthType,
  Packer,
  NumberFormat,
  convertMillimetersToTwip,
  LevelFormat,
  ILevelsOptions,
  Header,
  Footer,
  TextDirection,
  TabStopPosition,
  TabStopType,
  UnderlineType,
} from 'docx';

import type { AnnotationProcessor } from './annotation-processor';
import type { StyleMapper } from './style-mapper';
import type {
  WordRenderOptions,
  WordRenderResult,
  WordMetadata,
  ConversionError,
  ConversionWarning,
} from './types';
import type { XatsDocument, ContentBlock } from '@xats-org/types';
import type { INumberingOptions, IStylesOptions } from 'docx';

/**
 * Renders xats documents to Word format
 */
export class DocumentRenderer {
  constructor(
    private readonly styleMapper: StyleMapper,
    private readonly annotationProcessor: AnnotationProcessor
  ) {}

  /**
   * Render xats document to Word format
   */
  async render(document: XatsDocument, options: WordRenderOptions = {}): Promise<WordRenderResult> {
    const errors: ConversionError[] = [];
    const warnings: ConversionWarning[] = [];

    try {
      // Create Word document with proper configuration
      const wordDoc = new Document({
        creator: options.author || 'xats-converter',
        title: options.documentTitle || document.bibliographicEntry?.title || 'Untitled',
        subject:
          typeof document.subject === 'string' ? document.subject : String(document.subject || ''),
        keywords: Array.isArray(document.bibliographicEntry?.keyword)
          ? document.bibliographicEntry.keyword.join(', ')
          : (document.bibliographicEntry?.keyword as string) || '',
        styles: this.createDocumentStyles(options),
        numbering: this.createNumberingDefinitions(),
        sections: [],
      });

      // Process document content
      const paragraphs = await this.processContent(document, options, errors, warnings);

      // Add content to document
      (wordDoc as any).addSection({
        properties: {},
        children: paragraphs,
      });

      // Generate buffer
      const buffer = await this.generateDocxBuffer(wordDoc);

      // Create metadata
      const metadata: WordMetadata = {
        format: 'docx',
        wordCount: this.estimateWordCount(document),
        features: this.extractFeatures(document),
        styles: this.extractUsedStyles(document),
        images: this.countImages(document),
        tables: this.countTables(document),
        equations: this.countEquations(document),
        fileSize: buffer.length,
      };

      // Add optional fields only if they have values
      if (options.author) metadata.author = options.author;
      if (options.documentTitle) metadata.title = options.documentTitle;

      const result: WordRenderResult = {
        content: buffer,
        metadata,
        styleReport: this.styleMapper.generateStyleReport(
          metadata.styles,
          this.extractBlockTypes(document)
        ),
      };

      // Add optional fields only if they have values
      if (errors.length > 0) result.errors = errors;
      if (warnings.length > 0) result.warnings = warnings;

      return result;
    } catch (error) {
      throw new Error(
        `Rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Process document content recursively
   */
  private async processContent(
    document: XatsDocument,
    options: WordRenderOptions,
    errors: ConversionError[],
    warnings: ConversionWarning[]
  ): Promise<any[]> {
    const elements: any[] = [];

    // Process front matter
    if (document.frontMatter?.contents) {
      const frontElements = await this.processContents(
        document.frontMatter.contents as any[],
        options,
        errors,
        warnings
      );
      elements.push(...frontElements);
    }

    // Add table of contents if requested
    if (options.includeTableOfContents) {
      elements.push(this.createTableOfContents(document));
    }

    // Process body matter
    if (document.bodyMatter?.contents) {
      const bodyElements = await this.processContents(
        document.bodyMatter.contents,
        options,
        errors,
        warnings
      );
      elements.push(...bodyElements);
    }

    // Process back matter
    if (document.backMatter?.contents) {
      const backElements = await this.processContents(
        document.backMatter.contents as any[],
        options,
        errors,
        warnings
      );
      elements.push(...backElements);
    }

    // Add bibliography if requested
    if (options.includeBibliography && document.backMatter?.bibliography) {
      elements.push(...this.createBibliography(document.backMatter.bibliography));
    }

    return elements;
  }

  /**
   * Process array of contents
   */
  private async processContents(
    contents: any[],
    options: WordRenderOptions,
    errors: ConversionError[],
    warnings: ConversionWarning[]
  ): Promise<any[]> {
    const elements: any[] = [];

    for (const item of contents) {
      try {
        if (item.blockType) {
          // Content block
          const blockElements = await this.processContentBlock(item as ContentBlock, options);
          elements.push(...blockElements);
        } else if (item.contents) {
          // Structural container (Unit, Chapter, Section)
          if (item.title) {
            try {
              // Add title as heading
              const level = this.determineHeadingLevel(item);
              const titleRuns = this.createTextRuns(item.title);
              elements.push(
                new Paragraph({
                  heading: this.getWordHeadingLevel(level) || HeadingLevel.HEADING_1,
                  children: titleRuns,
                })
              );
            } catch (error) {
              errors.push({
                code: 'TITLE_RENDER_ERROR',
                message: `Failed to render structural container title: ${error instanceof Error ? error.message : 'Unknown error'}`,
                recoverable: true,
                suggestion: 'Title will be rendered as plain text',
              });

              // Fallback: render as plain text
              elements.push(
                new Paragraph({
                  children: [new TextRun(typeof item.title === 'string' ? item.title : 'Untitled')],
                })
              );
            }
          }

          // Process nested contents with error handling
          try {
            const nestedElements = await this.processContents(
              item.contents,
              options,
              errors,
              warnings
            );
            elements.push(...nestedElements);
          } catch (error) {
            errors.push({
              code: 'NESTED_CONTENT_ERROR',
              message: `Failed to process nested contents: ${error instanceof Error ? error.message : 'Unknown error'}`,
              recoverable: true,
              suggestion: 'Some nested content may be missing',
            });
          }
        }
      } catch (error) {
        errors.push({
          code: 'RENDER_ERROR',
          message: `Failed to render item: ${error instanceof Error ? error.message : 'Unknown error'}`,
          recoverable: true,
          suggestion: 'Item will be skipped',
        });
      }
    }

    return elements;
  }

  /**
   * Process a content block
   */
  private async processContentBlock(
    block: ContentBlock,
    options: WordRenderOptions
  ): Promise<any[]> {
    const elements: any[] = [];

    switch (block.blockType) {
      case 'https://xats.org/vocabularies/blocks/paragraph':
        elements.push(this.createParagraph(block));
        break;

      case 'https://xats.org/vocabularies/blocks/heading':
        elements.push(this.createHeading(block));
        break;

      case 'https://xats.org/vocabularies/blocks/blockquote':
        elements.push(this.createBlockquote(block));
        break;

      case 'https://xats.org/vocabularies/blocks/list':
        elements.push(...this.createList(block));
        break;

      case 'https://xats.org/vocabularies/blocks/table':
        elements.push(this.createTable(block));
        break;

      case 'https://xats.org/vocabularies/blocks/codeBlock':
        elements.push(this.createCodeBlock(block));
        break;

      case 'https://xats.org/vocabularies/blocks/mathBlock':
        elements.push(this.createMathBlock(block));
        break;

      case 'https://xats.org/vocabularies/blocks/figure':
        elements.push(...(await this.createFigure(block)));
        break;

      // Educational content blocks
      case 'https://xats.org/vocabularies/blocks/learningObjective':
        elements.push(this.createEducationalBlock(block, 'Learning Objective'));
        break;

      case 'https://xats.org/vocabularies/blocks/keyTerm':
        elements.push(this.createEducationalBlock(block, 'Key Term'));
        break;

      case 'https://xats.org/vocabularies/blocks/definition':
        elements.push(this.createEducationalBlock(block, 'Definition'));
        break;

      case 'https://xats.org/vocabularies/blocks/example':
        elements.push(this.createEducationalBlock(block, 'Example'));
        break;

      case 'https://xats.org/vocabularies/blocks/exercise':
        elements.push(this.createEducationalBlock(block, 'Exercise'));
        break;

      default:
        // Unknown block type - create as paragraph with note
        elements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[Unsupported block type: ${block.blockType}]`,
                italics: true,
                color: '888888',
              }),
            ],
          })
        );
        break;
    }

    return elements;
  }

  /**
   * Create paragraph element
   */
  private createParagraph(block: ContentBlock): Paragraph {
    try {
      const content = block.content as { text?: any } | any;
      const textContent = content?.text || content || '';
      const runs = this.createTextRuns(textContent);

      if (runs.length === 0) {
        runs.push(new TextRun(''));
      }

      return new Paragraph({ children: runs });
    } catch (error) {
      // Fallback: create simple paragraph with error note
      return new Paragraph({
        children: [
          new TextRun({
            text: '[Error rendering paragraph content]',
            italics: true,
            color: 'FF0000',
          }),
        ],
      });
    }
  }

  /**
   * Create heading element
   */
  private createHeading(block: ContentBlock): Paragraph {
    try {
      const content = block.content as { level?: number; text?: any } | any;
      const level = Math.max(1, Math.min(6, content?.level || 1)); // Ensure level is 1-6
      const textContent = content?.text || '';
      const runs = this.createTextRuns(textContent);

      if (runs.length === 0) {
        runs.push(new TextRun('Untitled Heading'));
      }

      return new Paragraph({
        heading: this.getWordHeadingLevel(level),
        children: runs,
      });
    } catch (error) {
      // Fallback: create as normal paragraph with bold formatting
      return new Paragraph({
        children: [
          new TextRun({
            text: (block.content as { text?: any })?.text || 'Heading',
            bold: true,
            size: 28,
          }),
        ],
      });
    }
  }

  /**
   * Create blockquote element
   */
  private createBlockquote(block: ContentBlock): Paragraph {
    const content = block.content as { text?: any } | any;
    const runs = this.createTextRuns(content?.text || '');

    return new Paragraph({
      style: 'Quote',
      children: runs,
    });
  }

  /**
   * Create list elements
   */
  private createList(block: ContentBlock): Paragraph[] {
    const content = block.content as { items?: any[]; ordered?: boolean; start?: number } | any;
    const items = content?.items || [];
    const isOrdered = content?.ordered === true;
    // const startValue = content?.start || 1; // TODO: Use for numbering

    return items.map((item: any, _index: number) => {
      // Handle nested lists
      const level = item.level || 0;
      const text = typeof item === 'string' ? item : item.text || item.content?.text || '';

      return new Paragraph({
        numbering: {
          reference: isOrdered ? 'ordered-list' : 'bullet-list',
          level: Math.min(level, 8), // Word supports up to 9 levels (0-8)
        },
        children: this.createTextRuns(text),
      });
    });
  }

  /**
   * Create table element
   */
  private createTable(block: ContentBlock): Table {
    try {
      const content = block.content as { rows?: any[] } | any;
      const rows = content?.rows || [];

      if (rows.length === 0) {
        // Create empty table with one cell
        return new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun('[Empty table]')],
                    }),
                  ],
                }),
              ],
            }),
          ],
          width: { size: 100, type: 'pct' },
        });
      }

      const tableRows = rows.map((row: any, rowIndex: number) => {
        try {
          const cells = row.cells || [];

          const tableCells = cells.map((cell: any, cellIndex: number) => {
            try {
              const cellText = cell.text || cell.content?.text || '';
              const runs = this.createTextRuns(cellText);

              const cellOptions: any = {
                children: [new Paragraph({ children: runs })],
              };

              if (cell.width) {
                cellOptions.width = { size: cell.width, type: 'pct' as const };
              }
              if (cell.colspan && cell.colspan > 1) {
                cellOptions.columnSpan = cell.colspan;
              }
              if (cell.rowspan && cell.rowspan > 1) {
                cellOptions.rowSpan = cell.rowspan;
              }

              return new TableCell(cellOptions);
            } catch (error) {
              // Fallback cell with error message
              return new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '[Cell error]',
                        italics: true,
                        color: 'FF0000',
                      }),
                    ],
                  }),
                ],
              });
            }
          });

          // Ensure at least one cell per row
          if (tableCells.length === 0) {
            tableCells.push(
              new TableCell({
                children: [new Paragraph({ children: [new TextRun('')] })],
              })
            );
          }

          return new TableRow({ children: tableCells });
        } catch (error) {
          // Fallback row
          return new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `[Row ${rowIndex + 1} error]`,
                        italics: true,
                        color: 'FF0000',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
      });

      return new Table({
        rows: tableRows,
        width: { size: 100, type: 'pct' },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
          left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
          right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
          insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
          insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
        },
      });
    } catch (error) {
      // Ultimate fallback: create simple table with error message
      return new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: '[Table rendering error]',
                        italics: true,
                        color: 'FF0000',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
        width: { size: 100, type: 'pct' },
      });
    }
  }

  /**
   * Create code block element
   */
  private createCodeBlock(block: ContentBlock): Paragraph {
    const content = block.content as { code?: string; text?: string } | any;
    const code = content?.code || content?.text || '';

    return new Paragraph({
      style: 'Code',
      children: [
        new TextRun({
          text: code,
          font: 'Courier New',
        }),
      ],
    });
  }

  /**
   * Create math block element
   */
  private createMathBlock(block: ContentBlock): Paragraph {
    const content = block.content as { latex?: string } | any;
    const latex = content?.latex || '';

    // For now, render as text with note about math content
    return new Paragraph({
      children: [
        new TextRun({
          text: `[Math: ${latex}]`,
          italics: true,
          color: '0066CC',
        }),
      ],
    });
  }

  /**
   * Create figure elements
   */
  private async createFigure(block: ContentBlock): Promise<Paragraph[]> {
    const elements: Paragraph[] = [];
    const content = block.content as { caption?: string } | any;

    // Placeholder for image
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `[Figure: ${content?.caption || 'Image'}]`,
            italics: true,
            color: '666666',
          }),
        ],
      })
    );

    // Add caption if present
    if (content?.caption) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Figure: ${content.caption}`,
              italics: true,
            }),
          ],
        })
      );
    }

    return elements;
  }

  /**
   * Create educational content block with error handling
   */
  private createEducationalBlock(block: ContentBlock, stylePrefix: string): Paragraph {
    try {
      const content = block.content as { text?: any; statement?: { text?: any } } | any;
      const textContent = content?.text || content?.statement?.text || content || '';
      const runs = this.createTextRuns(textContent);

      // Add prefix with error handling
      try {
        runs.unshift(
          new TextRun({
            text: `${stylePrefix}: `,
            bold: true,
            color: '0066CC',
          })
        );
      } catch (prefixError) {
        // If prefix addition fails, continue without it
      }

      // Ensure we have content
      if (runs.length === 0 || (runs.length === 1 && runs[0] && !(runs[0] as any).text)) {
        runs.push(new TextRun(`[${stylePrefix} content]`));
      }

      return new Paragraph({
        style: stylePrefix.replace(/\s+/g, ''), // Remove spaces for style name
        children: runs,
      });
    } catch (error) {
      // Fallback: create simple paragraph with error indication
      return new Paragraph({
        children: [
          new TextRun({
            text: `${stylePrefix}: [Content error]`,
            bold: true,
            color: 'FF0000',
          }),
        ],
      });
    }
  }

  /**
   * Create text runs from semantic text with comprehensive error handling
   */
  private createTextRuns(content: any): TextRun[] {
    try {
      if (typeof content === 'string') {
        return [new TextRun(content)];
      }

      if (content?.runs && Array.isArray(content.runs)) {
        const textRuns: TextRun[] = [];

        for (let i = 0; i < content.runs.length; i++) {
          try {
            const run = content.runs[i];
            const options: any = { text: run.text || run.math || '' };

            // Handle different run types
            switch (run.type) {
              case 'emphasis':
                options.italics = true;
                break;
              case 'strong':
                options.bold = true;
                break;
              case 'code':
                options.font = 'Courier New';
                options.color = '000080';
                break;
              case 'underline':
                options.underline = { type: UnderlineType.SINGLE };
                break;
              case 'strikethrough':
                options.strike = true;
                break;
              case 'subscript':
                options.subScript = true;
                break;
              case 'superscript':
                options.superScript = true;
                break;
              case 'mathInline':
                options.text = `[Math: ${run.math || run.text}]`;
                options.italics = true;
                options.color = '0066CC';
                break;
              case 'reference':
                options.text = run.text || run.ref || run.label || '[Reference]';
                options.color = '0066CC';
                options.underline = { type: UnderlineType.SINGLE };
                break;
              case 'citation':
                options.text = `[${run.citeKey || 'Citation'}]`;
                options.color = '666666';
                break;
              case 'index':
                // Index runs are normally invisible in output
                options.text = run.text || '';
                options.color = '999999';
                options.size = 18; // 9pt
                break;
              case 'text':
              default:
                // Default case - just use the text
                break;
            }

            textRuns.push(new TextRun(options));
          } catch (runError) {
            // If individual run fails, add error placeholder
            textRuns.push(
              new TextRun({
                text: `[Run error: ${i}]`,
                italics: true,
                color: 'FF0000',
              })
            );
          }
        }

        // Ensure we have at least one run
        if (textRuns.length === 0) {
          textRuns.push(new TextRun(''));
        }

        return textRuns;
      }

      // Fallback for other content types
      return [new TextRun(String(content || ''))];
    } catch (error) {
      // Ultimate fallback
      return [
        new TextRun({
          text: '[Text rendering error]',
          italics: true,
          color: 'FF0000',
        }),
      ];
    }
  }

  /**
   * Generate DOCX buffer from document
   */
  private async generateDocxBuffer(wordDoc: Document): Promise<Buffer> {
    try {
      // Use the docx Packer to create the actual DOCX buffer
      const buffer = await Packer.toBuffer(wordDoc);
      return buffer;
    } catch (error) {
      throw new Error(
        `Failed to generate DOCX buffer: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Utility methods
   */
  private determineHeadingLevel(_item: any): number {
    // Logic to determine heading level based on nesting
    return 1;
  }

  private getWordHeadingLevel(level: number): (typeof HeadingLevel)[keyof typeof HeadingLevel] {
    const levels = [
      HeadingLevel.HEADING_1,
      HeadingLevel.HEADING_2,
      HeadingLevel.HEADING_3,
      HeadingLevel.HEADING_4,
      HeadingLevel.HEADING_5,
      HeadingLevel.HEADING_6,
    ];
    const index = Math.min(level - 1, levels.length - 1);
    const safeIndex = Math.max(0, index); // Ensure index is not negative
    return levels[safeIndex] || HeadingLevel.HEADING_1;
  }

  private createTableOfContents(_document: XatsDocument): Paragraph {
    return new Paragraph({
      children: [
        new TextRun({
          text: '[Table of Contents]',
          italics: true,
          color: '666666',
        }),
      ],
    });
  }

  private createBibliography(_bibliography: any): Paragraph[] {
    return [
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun('Bibliography')],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: '[Bibliography entries would be rendered here]',
            italics: true,
            color: '666666',
          }),
        ],
      }),
    ];
  }

  private estimateWordCount(_document: XatsDocument): number {
    // Rough word count estimation
    return 1000; // Placeholder
  }

  private extractFeatures(_document: XatsDocument): string[] {
    return ['paragraphs', 'headings']; // Placeholder
  }

  private extractUsedStyles(_document: XatsDocument): string[] {
    return ['Normal', 'Heading 1']; // Placeholder
  }

  private extractBlockTypes(_document: XatsDocument): string[] {
    return ['https://xats.org/vocabularies/blocks/paragraph']; // Placeholder
  }

  private countImages(_document: XatsDocument): number {
    return 0; // Placeholder
  }

  private countTables(_document: XatsDocument): number {
    return 0; // Placeholder
  }

  private countEquations(_document: XatsDocument): number {
    return 0; // Placeholder
  }

  /**
   * Create document styles
   */
  private createDocumentStyles(_options: WordRenderOptions): IStylesOptions {
    return {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 32,
            bold: true,
            color: '2F5496',
          },
          paragraph: {
            spacing: {
              before: 480,
              after: 120,
            },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 26,
            bold: true,
            color: '2F5496',
          },
          paragraph: {
            spacing: {
              before: 360,
              after: 120,
            },
          },
        },
        {
          id: 'Heading3',
          name: 'Heading 3',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: 24,
            bold: true,
            color: '1F3864',
          },
          paragraph: {
            spacing: {
              before: 240,
              after: 120,
            },
          },
        },
        {
          id: 'Quote',
          name: 'Quote',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            italics: true,
            color: '666666',
          },
          paragraph: {
            indent: {
              left: convertMillimetersToTwip(12.7),
              right: convertMillimetersToTwip(12.7),
            },
            spacing: {
              before: 120,
              after: 120,
            },
          },
        },
        {
          id: 'Code',
          name: 'Code',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Courier New',
            size: 20,
            color: '000080',
          },
          paragraph: {
            spacing: {
              before: 120,
              after: 120,
            },
          },
        },
        {
          id: 'LearningObjective',
          name: 'Learning Objective',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            bold: true,
            color: '0066CC',
          },
          paragraph: {
            spacing: {
              before: 120,
              after: 120,
            },
            indent: {
              left: convertMillimetersToTwip(6.35),
            },
          },
        },
        {
          id: 'KeyTerm',
          name: 'Key Term',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            bold: true,
            color: '0066CC',
          },
        },
        {
          id: 'Definition',
          name: 'Definition',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            italics: true,
          },
          paragraph: {
            indent: {
              left: convertMillimetersToTwip(6.35),
            },
          },
        },
        {
          id: 'Example',
          name: 'Example',
          basedOn: 'Normal',
          next: 'Normal',
          paragraph: {
            spacing: {
              before: 120,
              after: 120,
            },
            indent: {
              left: convertMillimetersToTwip(6.35),
            },
          },
        },
        {
          id: 'Exercise',
          name: 'Exercise',
          basedOn: 'Normal',
          next: 'Normal',
          paragraph: {
            spacing: {
              before: 120,
              after: 120,
            },
            indent: {
              left: convertMillimetersToTwip(6.35),
            },
          },
        },
      ],
    };
  }

  /**
   * Create numbering definitions for lists
   */
  private createNumberingDefinitions(): INumberingOptions {
    return {
      config: [
        {
          reference: 'bullet-list',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertMillimetersToTwip(9.5),
                    hanging: convertMillimetersToTwip(6.35),
                  },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.BULLET,
              text: '◦',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertMillimetersToTwip(19),
                    hanging: convertMillimetersToTwip(6.35),
                  },
                },
              },
            },
            {
              level: 2,
              format: LevelFormat.BULLET,
              text: '▪',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertMillimetersToTwip(28.5),
                    hanging: convertMillimetersToTwip(6.35),
                  },
                },
              },
            },
          ],
        },
        {
          reference: 'ordered-list',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertMillimetersToTwip(9.5),
                    hanging: convertMillimetersToTwip(6.35),
                  },
                },
              },
            },
            {
              level: 1,
              format: LevelFormat.LOWER_LETTER,
              text: '%2.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertMillimetersToTwip(19),
                    hanging: convertMillimetersToTwip(6.35),
                  },
                },
              },
            },
            {
              level: 2,
              format: LevelFormat.LOWER_ROMAN,
              text: '%3.',
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: {
                    left: convertMillimetersToTwip(28.5),
                    hanging: convertMillimetersToTwip(6.35),
                  },
                },
              },
            },
          ],
        },
      ],
    };
  }
}
