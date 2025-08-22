/**
 * @xats-org/ai-integration - Enhanced MCP Server for AI Workflows
 * 
 * This module extends the base xats MCP server with AI-specific operations
 * for orchestration, metadata tracking, and multi-agent workflows.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { XatsMcpServer } from '@xats-org/mcp-server';
import type { XatsDocument } from '@xats-org/types';

import { AgentRegistry, WorkflowOrchestrator, WORKFLOW_TEMPLATES } from '../orchestration/workflow.js';
import { 
  createAIGenerationExtension,
  addReviewToExtension,
  validateAIGenerationExtension,
  hasAIGenerationMetadata,
  getAIGenerationMetadata,
  type AIGenerationExtension,
  type AIModel,
  type AIPrompt,
  type AIAgent,
} from '../metadata/schema.js';

/**
 * Enhanced MCP Server with AI Integration capabilities
 */
export class AIIntegratedMcpServer extends XatsMcpServer {
  private agentRegistry: AgentRegistry;
  private orchestrator: WorkflowOrchestrator;
  private activeWorkflows = new Map<string, string>(); // executionId -> workflowId

  constructor(config: any = {}) {
    super(config);
    this.agentRegistry = new AgentRegistry();
    this.orchestrator = new WorkflowOrchestrator(this.agentRegistry);
    
    // Workflow templates will be registered when appropriate agents are available
    // For now, we'll register them manually when needed

    this.setupAIHandlers();
  }

  /**
   * Setup AI-specific MCP handlers
   */
  private setupAIHandlers(): void {
    // We'll extend the functionality by overriding the handlers directly
    // Since we can't access the private server, we'll implement this differently
    this.registerAITools();
  }

  /**
   * Register AI-specific tools
   */
  private registerAITools(): void {
    // Get the server instance from parent and add our tools
    const server = (this as any).server;
    
    server.setRequestHandler(ListToolsRequestSchema, async () => {
      // Return all tools including AI-specific ones
      const aiTools = [
        {
          name: 'ai_add_generation_metadata',
          description: 'Add AI generation metadata to a content block or document',
          inputSchema: {
            type: 'object',
            properties: {
              target: {
                type: 'object',
                description: 'The xats object to add metadata to',
              },
              model: {
                type: 'object',
                properties: {
                  provider: { type: 'string' },
                  id: { type: 'string' },
                  version: { type: 'string' },
                  config: { type: 'object' },
                },
                required: ['provider', 'id', 'version'],
                description: 'AI model information',
              },
              prompt: {
                type: 'object',
                properties: {
                  template: { type: 'string' },
                  parameters: { type: 'object' },
                  context: { type: 'array', items: { type: 'string' } },
                  systemPrompt: { type: 'string' },
                  generationParams: { type: 'object' },
                },
                required: ['template'],
                description: 'Prompt information',
              },
              sessionId: {
                type: 'string',
                description: 'Optional session identifier',
              },
            },
            required: ['target', 'model', 'prompt'],
          },
        },
        {
          name: 'ai_start_workflow',
          description: 'Start a multi-agent workflow for content generation',
          inputSchema: {
            type: 'object',
            properties: {
              workflowId: {
                type: 'string',
                description: 'Workflow template ID',
                enum: Object.keys(WORKFLOW_TEMPLATES),
              },
              document: {
                type: 'object',
                description: 'Initial xats document to process',
              },
              initialState: {
                type: 'object',
                description: 'Initial workflow state',
                default: {},
              },
            },
            required: ['workflowId', 'document'],
          },
        },
        {
          name: 'ai_get_workflow_status',
          description: 'Get the status of a running workflow',
          inputSchema: {
            type: 'object',
            properties: {
              executionId: {
                type: 'string',
                description: 'Workflow execution ID',
              },
            },
            required: ['executionId'],
          },
        },
        {
          name: 'ai_register_agent',
          description: 'Register an AI agent for use in workflows',
          inputSchema: {
            type: 'object',
            properties: {
              agent: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  role: { type: 'string' },
                  capabilities: { type: 'array', items: { type: 'string' } },
                  version: { type: 'string' },
                },
                required: ['id', 'role'],
                description: 'Agent information',
              },
            },
            required: ['agent'],
          },
        },
        {
          name: 'ai_analyze_generation_metadata',
          description: 'Analyze AI generation metadata in a document',
          inputSchema: {
            type: 'object',
            properties: {
              document: {
                type: 'object',
                description: 'xats document to analyze',
              },
              includeStatistics: {
                type: 'boolean',
                description: 'Include generation statistics',
                default: true,
              },
            },
            required: ['document'],
          },
        },
        {
          name: 'ai_update_review_status',
          description: 'Update the review status of AI-generated content',
          inputSchema: {
            type: 'object',
            properties: {
              target: {
                type: 'object',
                description: 'xats object with AI generation metadata',
              },
              review: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['pending', 'in_review', 'approved', 'rejected', 'needs_revision'],
                  },
                  reviewer: { type: 'string' },
                  comments: { type: 'array', items: { type: 'string' } },
                  qualityScore: { type: 'number', minimum: 0, maximum: 1 },
                },
                required: ['status'],
                description: 'Review information',
              },
            },
            required: ['target', 'review'],
          },
        },
      ];

      return {
        tools: aiTools,
      };
    });

    // Handle AI-specific tool calls
    server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'ai_add_generation_metadata':
            return await this.handleAddGenerationMetadata(args);
          
          case 'ai_start_workflow':
            return await this.handleStartWorkflow(args);
          
          case 'ai_get_workflow_status':
            return await this.handleGetWorkflowStatus(args);
          
          case 'ai_register_agent':
            return await this.handleRegisterAgent(args);
          
          case 'ai_analyze_generation_metadata':
            return await this.handleAnalyzeGenerationMetadata(args);
          
          case 'ai_update_review_status':
            return await this.handleUpdateReviewStatus(args);

          default:
            return {
              content: [{
                type: 'text',
                text: JSON.stringify({ success: false, error: `Unknown tool: ${name}` }, null, 2),
              }],
              isError: true,
            };
        }
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              details: error instanceof Error ? error.stack : undefined,
            }, null, 2),
          }],
          isError: true,
        };
      }
    });
  }

  /**
   * Handle adding AI generation metadata
   */
  private async handleAddGenerationMetadata(args: any) {
    const { target, model, prompt, sessionId } = args;
    
    const extension = createAIGenerationExtension(model as AIModel, prompt as AIPrompt, sessionId);
    
    // Add extension to target object
    if (!target.extensions) {
      target.extensions = {};
    }
    target.extensions.aiGeneration = extension;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: 'AI generation metadata added successfully',
          metadata: extension,
        }, null, 2),
      }],
    };
  }

  /**
   * Handle starting a workflow
   */
  private async handleStartWorkflow(args: any) {
    const { workflowId, document, initialState = {} } = args;
    
    const executionId = await this.orchestrator.startWorkflow(
      workflowId,
      document as XatsDocument,
      initialState
    );
    
    this.activeWorkflows.set(executionId, workflowId);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          executionId,
          workflowId,
          message: 'Workflow started successfully',
        }, null, 2),
      }],
    };
  }

  /**
   * Handle getting workflow status
   */
  private async handleGetWorkflowStatus(args: any) {
    const { executionId } = args;
    
    const status = this.orchestrator.getExecutionStatus(executionId);
    
    if (!status) {
      throw new Error(`Workflow execution not found: ${executionId}`);
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          status,
        }, null, 2),
      }],
    };
  }

  /**
   * Handle registering an agent
   */
  private async handleRegisterAgent(args: any) {
    const { agent } = args;
    
    this.agentRegistry.register(agent as AIAgent);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: `Agent ${agent.id} registered successfully`,
          agent,
        }, null, 2),
      }],
    };
  }

  /**
   * Handle analyzing generation metadata
   */
  private async handleAnalyzeGenerationMetadata(args: any) {
    const { document, includeStatistics = true } = args;
    
    const analysis = this.analyzeDocumentMetadata(document, includeStatistics);

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          analysis,
        }, null, 2),
      }],
    };
  }

  /**
   * Handle updating review status
   */
  private async handleUpdateReviewStatus(args: any) {
    const { target, review } = args;
    
    if (!hasAIGenerationMetadata(target)) {
      throw new Error('Target object does not have AI generation metadata');
    }

    const updatedExtension = addReviewToExtension(target.extensions.aiGeneration, review);
    target.extensions.aiGeneration = updatedExtension;

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: true,
          message: 'Review status updated successfully',
          review: updatedExtension.review,
        }, null, 2),
      }],
    };
  }

  /**
   * Analyze AI generation metadata in a document
   */
  private analyzeDocumentMetadata(document: any, includeStatistics: boolean) {
    const results = {
      hasAIContent: false,
      aiGeneratedBlocks: [] as any[],
      statistics: includeStatistics ? {
        totalBlocks: 0,
        aiGeneratedCount: 0,
        humanReviewedCount: 0,
        approvedCount: 0,
        pendingReviewCount: 0,
        modelUsage: {} as Record<string, number>,
      } : undefined,
    };

    // Recursively analyze document structure
    this.analyzeObjectMetadata(document, results);

    if (includeStatistics && results.statistics) {
      results.statistics.aiGeneratedCount = results.aiGeneratedBlocks.length;
    }

    return results;
  }

  /**
   * Recursively analyze an object for AI metadata
   */
  private analyzeObjectMetadata(obj: any, results: any): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    // Check if this object has AI generation metadata
    const metadata = getAIGenerationMetadata(obj);
    if (metadata) {
      results.hasAIContent = true;
      results.aiGeneratedBlocks.push({
        metadata,
        path: obj.id || 'unknown',
      });

      if (results.statistics) {
        const modelKey = `${metadata.model.provider}:${metadata.model.id}`;
        results.statistics.modelUsage[modelKey] = (results.statistics.modelUsage[modelKey] || 0) + 1;
        
        if (metadata.review) {
          results.statistics.humanReviewedCount++;
          if (metadata.review.status === 'approved') {
            results.statistics.approvedCount++;
          } else if (metadata.review.status === 'pending') {
            results.statistics.pendingReviewCount++;
          }
        }
      }
    }

    // Recursively check child objects and arrays
    if (Array.isArray(obj)) {
      obj.forEach(item => this.analyzeObjectMetadata(item, results));
    } else {
      Object.values(obj).forEach(value => this.analyzeObjectMetadata(value, results));
    }

    if (results.statistics) {
      results.statistics.totalBlocks++;
    }
  }

  /**
   * Get registered agents
   */
  getAgentRegistry(): AgentRegistry {
    return this.agentRegistry;
  }

  /**
   * Get workflow orchestrator
   */
  getOrchestrator(): WorkflowOrchestrator {
    return this.orchestrator;
  }
}

/**
 * Create and start the enhanced AI MCP server
 */
export async function createAIIntegratedServer(config?: any): Promise<AIIntegratedMcpServer> {
  return new AIIntegratedMcpServer(config);
}

/**
 * Start the enhanced AI MCP server with stdio transport
 */
export async function startAIIntegratedServer(config?: any): Promise<void> {
  const server = await createAIIntegratedServer(config);
  await server.run();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    void server.close().finally(() => {
      process.exit(0);
    });
  });

  process.on('SIGTERM', () => {
    void server.close().finally(() => {
      process.exit(0);
    });
  });
}