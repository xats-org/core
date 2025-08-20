/**
 * End-to-End Workflow Tests
 * Tests complete workflows from document creation to rendering
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import {
  createTestContext,
  createTestDocument,
  getComplexDocument,
  runCommand,
  TestContext,
  waitFor
} from '../integration/setup';

describe('End-to-End Workflows', () => {
  let ctx: TestContext;

  beforeEach(async () => {
    ctx = await createTestContext();
  });

  afterEach(async () => {
    await ctx.cleanup();
  });

  describe('Complete Textbook Creation Workflow', () => {
    it('should create, validate, and render a complete textbook', async () => {
      // Step 1: Create a multi-chapter textbook structure
      const bookDir = join(ctx.tempDir, 'textbook');
      await mkdir(bookDir, { recursive: true });
      await mkdir(join(bookDir, 'chapters'), { recursive: true });
      await mkdir(join(bookDir, 'sections'), { recursive: true });
      await mkdir(join(bookDir, 'rendered'), { recursive: true });

      // Create main index
      const mainDoc = {
        schemaVersion: "0.3.0",
        bibliographicEntry: {
          id: "physics-101",
          title: "Introduction to Physics",
          author: [{ given: "John", family: "Doe" }],
          type: "book",
          issued: { "date-parts": [[2025, 1]] }
        },
        subject: {
          name: "Physics",
          description: "An introductory physics textbook"
        },
        bodyMatter: {
          contents: [
            { $ref: "chapters/chapter1.json" },
            { $ref: "chapters/chapter2.json" }
          ]
        }
      };

      await writeFile(
        join(bookDir, 'index.json'),
        JSON.stringify(mainDoc, null, 2)
      );

      // Create Chapter 1
      const chapter1 = {
        id: "ch1",
        label: "Chapter 1",
        title: { runs: [{ text: "Mechanics" }] },
        contents: [
          { $ref: "../sections/ch1-sec1.json" },
          { $ref: "../sections/ch1-sec2.json" }
        ]
      };

      await writeFile(
        join(bookDir, 'chapters/chapter1.json'),
        JSON.stringify(chapter1, null, 2)
      );

      // Create Chapter 2
      const chapter2 = {
        id: "ch2",
        label: "Chapter 2",
        title: { runs: [{ text: "Thermodynamics" }] },
        contents: [
          {
            blockType: "https://xats.org/core/blocks/paragraph",
            content: {
              runs: [{ text: "Introduction to thermodynamics..." }]
            }
          }
        ]
      };

      await writeFile(
        join(bookDir, 'chapters/chapter2.json'),
        JSON.stringify(chapter2, null, 2)
      );

      // Create Sections
      const section1 = {
        id: "ch1-sec1",
        label: "Section 1.1",
        title: { runs: [{ text: "Newton's Laws" }] },
        contents: [
          {
            blockType: "https://xats.org/core/blocks/paragraph",
            content: {
              runs: [{ text: "Newton's first law states..." }]
            }
          }
        ]
      };

      await writeFile(
        join(bookDir, 'sections/ch1-sec1.json'),
        JSON.stringify(section1, null, 2)
      );

      const section2 = {
        id: "ch1-sec2",
        label: "Section 1.2",
        title: { runs: [{ text: "Forces and Motion" }] },
        contents: [
          {
            blockType: "https://xats.org/core/blocks/paragraph",
            content: {
              runs: [{ text: "Forces cause acceleration..." }]
            }
          }
        ]
      };

      await writeFile(
        join(bookDir, 'sections/ch1-sec2.json'),
        JSON.stringify(section2, null, 2)
      );

      // Step 2: Validate the modular textbook
      const { exitCode: validateCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'validate', join(bookDir, 'index.json')],
        { cwd: process.cwd() }
      );

      expect(validateCode).toBe(0);

      // Step 3: Get statistics about the textbook
      const { stdout: statsOutput, exitCode: statsCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'stats', join(bookDir, 'index.json')],
        { cwd: process.cwd() }
      );

      expect(statsCode).toBe(0);
      expect(statsOutput).toContain('chapters');
      expect(statsOutput).toContain('sections');

      // Step 4: Render to multiple formats
      const formats = ['html', 'markdown', 'text'];
      
      for (const format of formats) {
        const outputPath = join(bookDir, 'rendered', `textbook.${format === 'markdown' ? 'md' : format}`);
        
        const { exitCode: renderCode } = await runCommand(
          'pnpm',
          ['--filter', '@xats/cli', 'run', 'cli', 'render', 
           join(bookDir, 'index.json'),
           '--output', outputPath,
           '--format', format],
          { cwd: process.cwd() }
        );

        expect(renderCode).toBe(0);
        
        const content = await readFile(outputPath, 'utf-8');
        expect(content).toBeTruthy();
        expect(content).toContain('Mechanics');
        expect(content).toContain('Thermodynamics');
      }
    });
  });

  describe('Assessment Workflow', () => {
    it('should create and validate an assessment with multiple question types', async () => {
      const assessmentDoc = {
        schemaVersion: "0.3.0",
        bibliographicEntry: {
          id: "midterm-exam",
          title: "Midterm Examination",
          type: "assessment"
        },
        subject: {
          name: "Assessment",
          description: "Midterm exam for Physics 101"
        },
        bodyMatter: {
          contents: [
            {
              id: "q1",
              label: "Question 1",
              title: { runs: [{ text: "Multiple Choice" }] },
              contents: [
                {
                  blockType: "https://xats.org/assessments/multipleChoice",
                  content: {
                    prompt: { runs: [{ text: "What is Newton's first law?" }] },
                    options: [
                      {
                        id: "a",
                        text: { runs: [{ text: "F = ma" }] },
                        isCorrect: false
                      },
                      {
                        id: "b",
                        text: { runs: [{ text: "An object at rest stays at rest" }] },
                        isCorrect: true
                      }
                    ]
                  }
                }
              ]
            },
            {
              id: "q2",
              label: "Question 2",
              title: { runs: [{ text: "Short Answer" }] },
              contents: [
                {
                  blockType: "https://xats.org/assessments/shortAnswer",
                  content: {
                    prompt: { runs: [{ text: "Explain the concept of inertia." }] },
                    expectedLength: 100
                  }
                }
              ]
            },
            {
              id: "q3",
              label: "Question 3",
              title: { runs: [{ text: "Essay" }] },
              contents: [
                {
                  blockType: "https://xats.org/assessments/essay",
                  content: {
                    prompt: { 
                      runs: [{ text: "Discuss the applications of Newton's laws in everyday life." }] 
                    },
                    rubric: {
                      criteria: [
                        {
                          id: "understanding",
                          description: "Demonstrates understanding of Newton's laws",
                          points: 10
                        },
                        {
                          id: "examples",
                          description: "Provides relevant examples",
                          points: 10
                        }
                      ]
                    }
                  }
                }
              ]
            }
          ]
        }
      };

      const assessmentPath = join(ctx.tempDir, 'assessment.json');
      await createTestDocument(assessmentPath, assessmentDoc);

      // Validate the assessment
      const { exitCode, stdout } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'validate', assessmentPath],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);
      expect(stdout).toContain('valid');
    });
  });

  describe('Extension Workflow', () => {
    it('should create and use custom extensions', async () => {
      const docWithExtension = {
        schemaVersion: "0.3.0",
        bibliographicEntry: {
          id: "extended-doc",
          title: "Document with Extensions",
          type: "book"
        },
        subject: {
          name: "Extended Content",
          description: "Testing custom extensions"
        },
        extensions: {
          "https://xats.org/extensions/analytics": {
            trackingId: "UA-12345",
            events: ["pageView", "sectionComplete"]
          },
          "https://xats.org/extensions/interactive": {
            enableSimulations: true,
            simulationTypes: ["physics", "chemistry"]
          }
        },
        bodyMatter: {
          contents: [
            {
              id: "ch1",
              label: "Chapter 1",
              title: { runs: [{ text: "Interactive Content" }] },
              extensions: {
                "https://xats.org/extensions/interactive/simulation": {
                  type: "physics",
                  url: "https://example.com/sim/pendulum"
                }
              },
              contents: [
                {
                  blockType: "https://xats.org/extensions/interactive/widget",
                  content: {
                    widgetType: "simulation",
                    config: {
                      subject: "pendulum",
                      interactive: true
                    }
                  },
                  extensions: {
                    "https://xats.org/extensions/analytics/event": {
                      category: "interaction",
                      action: "start_simulation"
                    }
                  }
                }
              ]
            }
          ]
        }
      };

      const docPath = join(ctx.tempDir, 'extended.json');
      await createTestDocument(docPath, docWithExtension);

      // Validate document with extensions
      const { exitCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'validate', docPath],
        { cwd: process.cwd() }
      );

      expect(exitCode).toBe(0);

      // Render with extension support
      const outputPath = join(ctx.tempDir, 'extended.html');
      const { exitCode: renderCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'render', docPath, '--output', outputPath],
        { cwd: process.cwd() }
      );

      expect(renderCode).toBe(0);

      const html = await readFile(outputPath, 'utf-8');
      expect(html).toContain('Interactive Content');
    });
  });

  describe('Performance Workflow', () => {
    it('should handle large documents efficiently', async () => {
      // Create a large document with many chapters and sections
      const largeDoc: any = {
        schemaVersion: "0.3.0",
        bibliographicEntry: {
          id: "large-doc",
          title: "Large Document",
          type: "book"
        },
        subject: {
          name: "Performance Test",
          description: "Testing performance with large documents"
        },
        bodyMatter: {
          contents: []
        }
      };

      // Add 50 chapters, each with 10 sections
      for (let i = 1; i <= 50; i++) {
        const chapter: any = {
          id: `ch${i}`,
          label: `Chapter ${i}`,
          title: { runs: [{ text: `Chapter ${i}: Topic ${i}` }] },
          contents: []
        };

        for (let j = 1; j <= 10; j++) {
          const section = {
            id: `ch${i}-sec${j}`,
            label: `Section ${i}.${j}`,
            title: { runs: [{ text: `Section ${i}.${j}` }] },
            contents: [
              {
                blockType: "https://xats.org/core/blocks/paragraph",
                content: {
                  runs: [{ text: `Content for section ${i}.${j}...` }]
                }
              }
            ]
          };
          chapter.contents.push(section);
        }

        largeDoc.bodyMatter.contents.push(chapter);
      }

      const docPath = join(ctx.tempDir, 'large.json');
      await createTestDocument(docPath, largeDoc);

      // Measure validation performance
      const startValidation = Date.now();
      const { exitCode: validateCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'validate', docPath],
        { cwd: process.cwd() }
      );
      const validationTime = Date.now() - startValidation;

      expect(validateCode).toBe(0);
      expect(validationTime).toBeLessThan(5000); // Should validate in under 5 seconds

      // Measure rendering performance
      const startRender = Date.now();
      const outputPath = join(ctx.tempDir, 'large.html');
      const { exitCode: renderCode } = await runCommand(
        'pnpm',
        ['--filter', '@xats/cli', 'run', 'cli', 'render', docPath, '--output', outputPath],
        { cwd: process.cwd() }
      );
      const renderTime = Date.now() - startRender;

      expect(renderCode).toBe(0);
      expect(renderTime).toBeLessThan(10000); // Should render in under 10 seconds

      const html = await readFile(outputPath, 'utf-8');
      expect(html).toContain('Chapter 50');
      expect(html).toContain('Section 50.10');
    });
  });
});