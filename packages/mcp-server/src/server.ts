/**
 * @xats/mcp-server - Main MCP Server Implementation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

import type { McpServerConfig } from './types.js';
import { validateTool } from './tools/validate.js';
import { createTool } from './tools/create.js';
import { analyzeTool } from './tools/analyze.js';
import { extractTool } from './tools/extract.js';
import { transformTool } from './tools/transform.js';

export class XatsMcpServer {
  private server: Server;
  private config: McpServerConfig;

  constructor(config: Partial<McpServerConfig> = {}) {
    const defaultConfig: McpServerConfig = {
      name: 'xats-mcp-server',
      version: '0.4.0',
      description: 'Model Context Protocol server for xats documents',
      capabilities: {
        tools: true,
        resources: false,
        prompts: false,
      },
      defaultSchemaVersion: '0.3.0',
      validation: {
        strict: true,
        allErrors: true,
      },
    };

    this.config = {
      ...defaultConfig,
      ...config,
      capabilities: {
        ...defaultConfig.capabilities,
        ...config.capabilities,
      },
      validation: {
        ...defaultConfig.validation,
        ...config.validation,
      },
    };

    this.server = new Server(
      {
        name: this.config.name,
        version: this.config.version,
        description: this.config.description,
      },
      {
        capabilities: {
          tools: this.config.capabilities?.tools ? {} : undefined,
          resources: this.config.capabilities?.resources ? {} : undefined,
          prompts: this.config.capabilities?.prompts ? {} : undefined,
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'xats_validate',
          description: 'Validate a xats document against the JSON Schema',
          inputSchema: {
            type: 'object',
            properties: {
              document: {
                type: 'object',
                description: 'The xats document to validate',
              },
              schemaVersion: {
                type: 'string',
                description: 'Specific schema version to validate against (optional)',
                enum: ['0.1.0', '0.2.0', '0.3.0'],
              },
              strict: {
                type: 'boolean',
                description: 'Enable strict validation mode',
                default: true,
              },
            },
            required: ['document'],
          },
        },
        {
          name: 'xats_create',
          description: 'Create a new xats document from a template',
          inputSchema: {
            type: 'object',
            properties: {
              template: {
                type: 'string',
                description: 'Template type to use',
                enum: ['minimal', 'textbook', 'course', 'assessment'],
                default: 'minimal',
              },
              title: {
                type: 'string',
                description: 'Title of the document',
              },
              subject: {
                type: 'string',
                description: 'Subject area (optional)',
              },
              author: {
                type: 'string',
                description: 'Author name (optional)',
              },
              language: {
                type: 'string',
                description: 'Document language code',
                default: 'en',
              },
              schemaVersion: {
                type: 'string',
                description: 'Schema version to use',
                enum: ['0.1.0', '0.2.0', '0.3.0'],
                default: '0.3.0',
              },
              options: {
                type: 'object',
                properties: {
                  includeFrontMatter: {
                    type: 'boolean',
                    default: true,
                  },
                  includeBackMatter: {
                    type: 'boolean',
                    default: false,
                  },
                  includeAssessments: {
                    type: 'boolean',
                    default: false,
                  },
                  includePathways: {
                    type: 'boolean',
                    default: false,
                  },
                },
              },
            },
            required: ['title'],
          },
        },
        {
          name: 'xats_analyze',
          description: 'Analyze the structure and content of a xats document',
          inputSchema: {
            type: 'object',
            properties: {
              document: {
                type: 'object',
                description: 'The xats document to analyze',
              },
              depth: {
                type: 'string',
                description: 'Analysis depth level',
                enum: ['basic', 'detailed', 'comprehensive'],
                default: 'detailed',
              },
              includeIssues: {
                type: 'boolean',
                description: 'Include potential issues and suggestions',
                default: true,
              },
              includeStatistics: {
                type: 'boolean',
                description: 'Include document statistics',
                default: true,
              },
            },
            required: ['document'],
          },
        },
        {
          name: 'xats_extract',
          description: 'Extract specific content from a xats document',
          inputSchema: {
            type: 'object',
            properties: {
              document: {
                type: 'object',
                description: 'The xats document to extract from',
              },
              path: {
                type: 'string',
                description: 'JSON path to extract (optional, extracts all if not specified)',
              },
              type: {
                type: 'string',
                description: 'Type of content to extract',
                enum: ['content', 'metadata', 'structure', 'assessments'],
                default: 'content',
              },
              filter: {
                type: 'object',
                properties: {
                  blockTypes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Filter by specific block types',
                  },
                  pathways: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Filter by pathway types',
                  },
                  includeEmpty: {
                    type: 'boolean',
                    description: 'Include empty content blocks',
                    default: false,
                  },
                },
              },
            },
            required: ['document'],
          },
        },
        {
          name: 'xats_transform',
          description: 'Transform a xats document to different formats or versions',
          inputSchema: {
            type: 'object',
            properties: {
              document: {
                type: 'object',
                description: 'The xats document to transform',
              },
              targetFormat: {
                type: 'string',
                description: 'Target format for transformation',
                enum: ['json', 'markdown', 'html', 'text'],
                default: 'json',
              },
              targetVersion: {
                type: 'string',
                description: 'Target schema version (for version migration)',
                enum: ['0.1.0', '0.2.0', '0.3.0'],
              },
              options: {
                type: 'object',
                properties: {
                  preserveMetadata: {
                    type: 'boolean',
                    description: 'Preserve all metadata during transformation',
                    default: true,
                  },
                  flattenStructure: {
                    type: 'boolean',
                    description: 'Flatten hierarchical structure',
                    default: false,
                  },
                  stripAssessments: {
                    type: 'boolean',
                    description: 'Remove assessment content',
                    default: false,
                  },
                  includeRendering: {
                    type: 'boolean',
                    description: 'Include rendering hints and metadata',
                    default: false,
                  },
                },
              },
            },
            required: ['document'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'xats_validate': {
            const input = this.validateInput(args, 'validate');
            const result = await validateTool(input, this.config);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'xats_create': {
            const input = this.validateInput(args, 'create');
            const result = await createTool(input, this.config);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'xats_analyze': {
            const input = this.validateInput(args, 'analyze');
            const result = await analyzeTool(input, this.config);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'xats_extract': {
            const input = this.validateInput(args, 'extract');
            const result = await extractTool(input, this.config);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'xats_transform': {
            const input = this.validateInput(args, 'transform');
            const result = await transformTool(input, this.config);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          default:
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    success: false,
                    error: `Unknown tool: ${name}`,
                  }, null, 2),
                },
              ],
              isError: true,
            };
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                details: error instanceof Error ? error.stack : undefined,
              }, null, 2),
            },
          ],
          isError: true,
        };
      }
    });
  }

  private validateInput(args: any, toolType: string): any {
    // Basic input validation - in a real implementation, you'd use more sophisticated validation
    if (!args || typeof args !== 'object') {
      throw new Error(`Invalid input for ${toolType} tool: expected object`);
    }

    return args;
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  async close(): Promise<void> {
    await this.server.close();
  }

  getConfig(): McpServerConfig {
    return { ...this.config };
  }
}

/**
 * Create and start the MCP server
 */
export async function createServer(config?: Partial<McpServerConfig>): Promise<XatsMcpServer> {
  const server = new XatsMcpServer(config);
  return server;
}

/**
 * Start the MCP server with stdio transport
 */
export async function startServer(config?: Partial<McpServerConfig>): Promise<void> {
  const server = await createServer(config);
  await server.run();
  
  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await server.close();
    process.exit(0);
  });
}