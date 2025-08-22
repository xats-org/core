/**
 * @xats-org/ai-integration - Main Export Module
 * 
 * AI Integration Framework for Multi-Agent Textbook Creation
 * Provides comprehensive tools for AI-assisted content generation using xats.
 */

// Metadata exports
export {
  // Schema types
  type AIModel,
  type AIPrompt,
  type AIMetadata,
  type AIReview,
  type AIAgent,
  type AIWorkflow,
  type AIGenerationExtension,
  
  // Schema validation
  AIModelSchema,
  AIPromptSchema,
  AIMetadataSchema,
  AIReviewSchema,
  AIAgentSchema,
  AIWorkflowSchema,
  AIGenerationExtensionSchema,
  
  // Helper functions
  createAIGenerationExtension,
  addReviewToExtension,
  validateAIGenerationExtension,
  hasAIGenerationMetadata,
  getAIGenerationMetadata,
} from './metadata/schema.js';

// Orchestration exports
export {
  // Workflow types
  type WorkflowStep,
  type WorkflowDefinition,
  type WorkflowContext,
  
  // Schema validation
  WorkflowStepSchema,
  WorkflowDefinitionSchema,
  WorkflowContextSchema,
  
  // Core classes
  AgentRegistry,
  WorkflowOrchestrator,
  
  // Templates
  WORKFLOW_TEMPLATES,
} from './orchestration/workflow.js';

// MCP server exports
export {
  AIIntegratedMcpServer,
  createAIIntegratedServer,
  startAIIntegratedServer,
} from './mcp/ai-mcp-server.js';

// Import for use in the framework class
import { AgentRegistry, WorkflowOrchestrator } from './orchestration/workflow.js';
import { AIIntegratedMcpServer } from './mcp/ai-mcp-server.js';

/**
 * Package version
 */
export const VERSION = '0.5.0';

/**
 * AI Integration Framework - Main orchestration class
 */
export class AIIntegrationFramework {
  private agentRegistry: AgentRegistry;
  private orchestrator: WorkflowOrchestrator;
  private mcpServer?: AIIntegratedMcpServer;

  constructor() {
    this.agentRegistry = new AgentRegistry();
    this.orchestrator = new WorkflowOrchestrator(this.agentRegistry);
  }

  /**
   * Get the agent registry
   */
  getAgentRegistry(): AgentRegistry {
    return this.agentRegistry;
  }

  /**
   * Get the workflow orchestrator
   */
  getOrchestrator(): WorkflowOrchestrator {
    return this.orchestrator;
  }

  /**
   * Start the MCP server
   */
  async startMcpServer(config?: any): Promise<AIIntegratedMcpServer> {
    if (this.mcpServer) {
      throw new Error('MCP server is already running');
    }

    this.mcpServer = new AIIntegratedMcpServer(config);
    await this.mcpServer.run();
    return this.mcpServer;
  }

  /**
   * Stop the MCP server
   */
  async stopMcpServer(): Promise<void> {
    if (this.mcpServer) {
      await this.mcpServer.close();
      this.mcpServer = undefined as any;
    }
  }

  /**
   * Get the MCP server instance
   */
  getMcpServer(): AIIntegratedMcpServer | undefined {
    return this.mcpServer;
  }
}

/**
 * Create a new AI Integration Framework instance
 */
export function createFramework(): AIIntegrationFramework {
  return new AIIntegrationFramework();
}

/**
 * Default framework instance
 */
export const defaultFramework = createFramework();