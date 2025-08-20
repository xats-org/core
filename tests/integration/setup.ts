/**
 * Integration Test Setup
 * Common utilities and setup for integration tests
 */

import { spawn, ChildProcess } from 'child_process';
import { rm, mkdir, writeFile, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';

export interface TestContext {
  tempDir: string;
  cleanup: () => Promise<void>;
}

/**
 * Create a temporary directory for test isolation
 */
export async function createTestContext(): Promise<TestContext> {
  const tempDir = join(tmpdir(), `xats-test-${randomBytes(8).toString('hex')}`);
  await mkdir(tempDir, { recursive: true });

  return {
    tempDir,
    cleanup: async () => {
      await rm(tempDir, { recursive: true, force: true });
    }
  };
}

/**
 * Run a command and capture output
 */
export async function runCommand(
  command: string,
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {}
): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      ...options,
      shell: true,
      env: { ...process.env, ...options.env }
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', reject);

    child.on('close', (exitCode) => {
      resolve({
        stdout,
        stderr,
        exitCode: exitCode ?? 0
      });
    });
  });
}

/**
 * Create a test xats document
 */
export async function createTestDocument(
  path: string,
  content: any = getMinimalDocument()
): Promise<void> {
  await writeFile(path, JSON.stringify(content, null, 2));
}

/**
 * Get a minimal valid xats document
 */
export function getMinimalDocument() {
  return {
    schemaVersion: "0.3.0",
    bibliographicEntry: {
      id: "test-doc",
      title: "Test Document",
      type: "book"
    },
    subject: {
      name: "Test Subject",
      description: "A test document for integration testing"
    },
    bodyMatter: {
      contents: [
        {
          id: "ch1",
          label: "Chapter 1",
          title: {
            runs: [{ text: "Introduction" }]
          },
          contents: [
            {
              blockType: "https://xats.org/core/blocks/paragraph",
              content: {
                runs: [{ text: "This is a test paragraph." }]
              }
            }
          ]
        }
      ]
    }
  };
}

/**
 * Get a complex xats document with multiple features
 */
export function getComplexDocument() {
  return {
    schemaVersion: "0.3.0",
    bibliographicEntry: {
      id: "complex-doc",
      title: "Complex Test Document",
      author: [
        {
          given: "Test",
          family: "Author"
        }
      ],
      type: "book",
      issued: {
        "date-parts": [[2025, 1]]
      }
    },
    subject: {
      name: "Advanced Testing",
      description: "A complex document for comprehensive testing",
      keywords: ["testing", "integration", "xats"]
    },
    frontMatter: {
      contents: [
        {
          blockType: "https://xats.org/core/placeholders/tableOfContents",
          content: {}
        }
      ]
    },
    bodyMatter: {
      contents: [
        {
          id: "unit1",
          label: "Unit 1",
          title: {
            runs: [{ text: "Foundations" }]
          },
          learningObjectives: [
            {
              id: "lo1",
              statement: {
                runs: [{ text: "Understand basic concepts" }]
              }
            }
          ],
          contents: [
            {
              id: "ch1",
              label: "Chapter 1",
              title: {
                runs: [{ text: "Introduction to Testing" }]
              },
              contents: [
                {
                  id: "sec1",
                  label: "Section 1.1",
                  title: {
                    runs: [{ text: "Getting Started" }]
                  },
                  contents: [
                    {
                      blockType: "https://xats.org/core/blocks/heading",
                      content: {
                        level: 1,
                        text: {
                          runs: [{ text: "Welcome" }]
                        }
                      }
                    },
                    {
                      blockType: "https://xats.org/core/blocks/paragraph",
                      content: {
                        runs: [
                          { text: "This is a paragraph with " },
                          { text: "emphasis", emphasis: true },
                          { text: " and " },
                          { text: "strong", strong: true },
                          { text: " text." }
                        ]
                      }
                    },
                    {
                      blockType: "https://xats.org/core/blocks/list",
                      content: {
                        ordered: true,
                        items: [
                          {
                            runs: [{ text: "First item" }]
                          },
                          {
                            runs: [{ text: "Second item" }]
                          },
                          {
                            runs: [{ text: "Third item" }]
                          }
                        ]
                      }
                    },
                    {
                      blockType: "https://xats.org/core/blocks/codeBlock",
                      content: {
                        language: "typescript",
                        code: "const greeting = 'Hello, World!';\nconsole.log(greeting);"
                      }
                    },
                    {
                      blockType: "https://xats.org/core/blocks/mathBlock",
                      content: {
                        tex: "E = mc^2"
                      }
                    },
                    {
                      blockType: "https://xats.org/core/blocks/figure",
                      content: {
                        src: "https://example.com/image.png",
                        alt: "Example figure",
                        caption: {
                          runs: [{ text: "Figure 1: An example figure" }]
                        }
                      }
                    },
                    {
                      blockType: "https://xats.org/core/blocks/table",
                      content: {
                        caption: {
                          runs: [{ text: "Table 1: Sample Data" }]
                        },
                        headers: [
                          { runs: [{ text: "Name" }] },
                          { runs: [{ text: "Value" }] }
                        ],
                        rows: [
                          [
                            { runs: [{ text: "Alpha" }] },
                            { runs: [{ text: "1" }] }
                          ],
                          [
                            { runs: [{ text: "Beta" }] },
                            { runs: [{ text: "2" }] }
                          ]
                        ]
                      }
                    },
                    {
                      blockType: "https://xats.org/core/blocks/blockquote",
                      content: {
                        quote: {
                          runs: [{ text: "This is a quoted text." }]
                        },
                        citation: {
                          runs: [{ text: "Source Author" }]
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    backMatter: {
      contents: [
        {
          blockType: "https://xats.org/core/placeholders/bibliography",
          content: {}
        },
        {
          blockType: "https://xats.org/core/placeholders/index",
          content: {}
        }
      ]
    }
  };
}

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for condition');
}

/**
 * Create a mock MCP server for testing
 */
export async function createMockMCPServer(port: number = 3000): Promise<ChildProcess> {
  // This would be implemented when MCP server is created
  throw new Error('MCP server not yet implemented');
}