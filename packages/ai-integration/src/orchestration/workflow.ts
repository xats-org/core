/**
 * @xats-org/ai-integration - Agent Orchestration Framework
 * 
 * This module provides the infrastructure for orchestrating multiple AI agents
 * in collaborative textbook creation workflows using xats as the data interchange format.
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { XatsDocument } from '@xats-org/types';
import type { AIAgent, AIWorkflow, AIGenerationExtension } from '../metadata/schema.js';

/**
 * Workflow step definition
 */
export const WorkflowStepSchema = z.object({
  /** Step identifier */
  id: z.string().min(1),
  /** Step name */
  name: z.string().min(1),
  /** Agent responsible for this step */
  agentId: z.string().min(1),
  /** Step description */
  description: z.string().optional(),
  /** Required capabilities for this step */
  requiredCapabilities: z.array(z.string()).default([]),
  /** Input requirements */
  inputs: z.array(z.string()).default([]),
  /** Expected outputs */
  outputs: z.array(z.string()).default([]),
  /** Validation criteria */
  validation: z.record(z.unknown()).optional(),
  /** Retry configuration */
  retry: z.object({
    maxAttempts: z.number().int().positive().default(3),
    backoffMs: z.number().int().positive().default(1000),
  }).optional(),
});

/**
 * Workflow definition
 */
export const WorkflowDefinitionSchema = z.object({
  /** Workflow identifier */
  id: z.string().min(1),
  /** Workflow name */
  name: z.string().min(1),
  /** Workflow description */
  description: z.string().optional(),
  /** Version of the workflow */
  version: z.string().default('1.0.0'),
  /** Workflow steps */
  steps: z.array(WorkflowStepSchema),
  /** Dependencies between steps */
  dependencies: z.record(z.array(z.string())).default({}),
  /** Global workflow configuration */
  config: z.record(z.unknown()).default({}).optional(),
});

/**
 * Workflow execution context
 */
export const WorkflowContextSchema = z.object({
  /** Execution identifier */
  executionId: z.string().uuid(),
  /** Workflow definition being executed */
  workflowId: z.string().min(1),
  /** Current step being executed */
  currentStep: z.string().optional(),
  /** Completed steps */
  completedSteps: z.array(z.string()).default([]),
  /** Failed steps */
  failedSteps: z.array(z.string()).default([]),
  /** Execution state */
  state: z.record(z.unknown()).default({}),
  /** Execution metadata */
  metadata: z.object({
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  }),
});

// Type exports
export type WorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type WorkflowDefinition = z.infer<typeof WorkflowDefinitionSchema>;
export type WorkflowContext = z.infer<typeof WorkflowContextSchema>;

/**
 * Agent registry for managing available agents
 */
export class AgentRegistry {
  private agents = new Map<string, AIAgent>();

  /**
   * Register an agent
   */
  register(agent: AIAgent): void {
    this.agents.set(agent.id, agent);
  }

  /**
   * Unregister an agent
   */
  unregister(agentId: string): void {
    this.agents.delete(agentId);
  }

  /**
   * Get agent by ID
   */
  get(agentId: string): AIAgent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Find agents by capability
   */
  findByCapability(capability: string): AIAgent[] {
    return Array.from(this.agents.values()).filter(agent =>
      agent.capabilities.includes(capability)
    );
  }

  /**
   * List all registered agents
   */
  list(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Check if agent exists
   */
  has(agentId: string): boolean {
    return this.agents.has(agentId);
  }
}

/**
 * Workflow orchestrator for managing multi-agent workflows
 */
export class WorkflowOrchestrator {
  private workflows = new Map<string, WorkflowDefinition>();
  private executions = new Map<string, WorkflowContext>();
  private agentRegistry: AgentRegistry;

  constructor(agentRegistry: AgentRegistry) {
    this.agentRegistry = agentRegistry;
  }

  /**
   * Register a workflow definition
   */
  registerWorkflow(workflow: WorkflowDefinition): void {
    // Validate workflow
    this.validateWorkflow(workflow);
    this.workflows.set(workflow.id, workflow);
  }

  /**
   * Start a workflow execution
   */
  async startWorkflow(
    workflowId: string,
    document: XatsDocument,
    initialState: Record<string, unknown> = {}
  ): Promise<string> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const executionId = uuidv4();
    const context: WorkflowContext = {
      executionId,
      workflowId,
      completedSteps: [],
      failedSteps: [],
      state: { document, ...initialState },
      metadata: {
        startTime: new Date().toISOString(),
        status: 'pending',
      },
    };

    this.executions.set(executionId, context);
    
    // Start execution asynchronously
    void this.executeWorkflow(executionId);
    
    return executionId;
  }

  /**
   * Get workflow execution status
   */
  getExecutionStatus(executionId: string): WorkflowContext | undefined {
    return this.executions.get(executionId);
  }

  /**
   * Cancel a workflow execution
   */
  cancelExecution(executionId: string): boolean {
    const context = this.executions.get(executionId);
    if (context && context.metadata.status === 'running') {
      context.metadata.status = 'cancelled';
      context.metadata.endTime = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Execute a workflow
   */
  private async executeWorkflow(executionId: string): Promise<void> {
    const context = this.executions.get(executionId);
    if (!context) {
      throw new Error(`Execution context not found: ${executionId}`);
    }

    const workflow = this.workflows.get(context.workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${context.workflowId}`);
    }

    try {
      context.metadata.status = 'running';

      // Execute steps in dependency order
      const executionOrder = this.getExecutionOrder(workflow);
      
      for (const stepId of executionOrder) {
        const step = workflow.steps.find(s => s.id === stepId);
        if (!step) {
          throw new Error(`Step not found: ${stepId}`);
        }

        context.currentStep = stepId;
        
        try {
          await this.executeStep(step, context);
          context.completedSteps.push(stepId);
        } catch (error) {
          context.failedSteps.push(stepId);
          throw error;
        }
      }

      context.metadata.status = 'completed';
    } catch (error) {
      context.metadata.status = 'failed';
      context.state.error = error instanceof Error ? error.message : 'Unknown error';
    } finally {
      context.currentStep = undefined;
      context.metadata.endTime = new Date().toISOString();
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: WorkflowStep, context: WorkflowContext): Promise<void> {
    const agent = this.agentRegistry.get(step.agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${step.agentId}`);
    }

    // Validate agent capabilities
    for (const capability of step.requiredCapabilities) {
      if (!agent.capabilities.includes(capability)) {
        throw new Error(`Agent ${agent.id} missing required capability: ${capability}`);
      }
    }

    // Execute step with retry logic
    const retryConfig = step.retry || { maxAttempts: 3, backoffMs: 1000 };
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        // This would integrate with the actual agent execution
        // For now, we'll simulate step execution
        await this.simulateStepExecution(step, context, agent);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < retryConfig.maxAttempts) {
          await this.delay(retryConfig.backoffMs * attempt);
        }
      }
    }

    throw lastError || new Error('Step execution failed');
  }

  /**
   * Simulate step execution (to be replaced with actual agent integration)
   */
  private async simulateStepExecution(
    step: WorkflowStep,
    context: WorkflowContext,
    agent: AIAgent
  ): Promise<void> {
    // Simulate processing time
    await this.delay(Math.random() * 1000 + 500);

    // Add AI generation metadata to the document
    const document = context.state.document as XatsDocument & { extensions?: any };
    if (!document.extensions) {
      document.extensions = {};
    }
    document.extensions.aiGeneration = {
        model: {
          provider: 'simulation',
          id: agent.id,
          version: agent.version || '1.0.0',
        },
        prompt: {
          template: `Execute step: ${step.name}`,
          parameters: {},
          context: [`Step: ${step.id}`, `Agent: ${agent.id}`],
        },
        metadata: {
          timestamp: new Date().toISOString(),
          sessionId: context.executionId,
          confidence: 0.95,
          attempts: 1,
        },
        agent,
        workflow: {
          workflowId: context.workflowId,
          step: context.completedSteps.length + 1,
          state: { stepId: step.id },
        },
      };
  }

  /**
   * Get execution order based on dependencies
   */
  private getExecutionOrder(workflow: WorkflowDefinition): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (stepId: string) => {
      if (visiting.has(stepId)) {
        throw new Error(`Circular dependency detected involving step: ${stepId}`);
      }
      if (visited.has(stepId)) {
        return;
      }

      visiting.add(stepId);

      // Visit dependencies first
      const dependencies = workflow.dependencies[stepId] || [];
      for (const dep of dependencies) {
        visit(dep);
      }

      visiting.delete(stepId);
      visited.add(stepId);
      order.push(stepId);
    };

    // Visit all steps
    for (const step of workflow.steps) {
      visit(step.id);
    }

    return order;
  }

  /**
   * Validate workflow definition
   */
  private validateWorkflow(workflow: WorkflowDefinition): void {
    // Check that all referenced agents exist
    for (const step of workflow.steps) {
      if (!this.agentRegistry.has(step.agentId)) {
        throw new Error(`Agent not found: ${step.agentId}`);
      }
    }

    // Check that all dependencies reference valid steps
    const stepIds = new Set(workflow.steps.map(s => s.id));
    for (const [stepId, deps] of Object.entries(workflow.dependencies)) {
      if (!stepIds.has(stepId)) {
        throw new Error(`Dependency references unknown step: ${stepId}`);
      }
      for (const dep of deps) {
        if (!stepIds.has(dep)) {
          throw new Error(`Step ${stepId} depends on unknown step: ${dep}`);
        }
      }
    }
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Pre-defined workflow templates
 */
export const WORKFLOW_TEMPLATES = {
  TEXTBOOK_CREATION: {
    id: 'textbook-creation',
    name: 'Multi-Agent Textbook Creation',
    description: 'Collaborative workflow for creating educational textbooks',
    version: '1.0.0',
    steps: [
      {
        id: 'outline',
        name: 'Create Content Outline',
        agentId: 'content-planner',
        description: 'Generate initial chapter and section structure',
        requiredCapabilities: ['content-planning', 'structure-design'],
        inputs: [],
        outputs: ['document-outline'],
      },
      {
        id: 'content',
        name: 'Generate Content',
        agentId: 'content-writer',
        description: 'Write chapter and section content',
        requiredCapabilities: ['content-generation', 'writing'],
        inputs: ['document-outline'],
        outputs: ['written-content'],
      },
      {
        id: 'examples',
        name: 'Create Examples',
        agentId: 'example-generator',
        description: 'Generate examples and exercises',
        requiredCapabilities: ['example-creation', 'problem-generation'],
        inputs: ['written-content'],
        outputs: ['enhanced-content'],
      },
      {
        id: 'review',
        name: 'Content Review',
        agentId: 'content-reviewer',
        description: 'Review and refine content quality',
        requiredCapabilities: ['content-review', 'quality-assessment'],
        inputs: ['enhanced-content'],
        outputs: ['reviewed-content'],
      },
    ],
    dependencies: {
      content: ['outline'],
      examples: ['content'],
      review: ['examples'],
    },
    config: {},
  } satisfies WorkflowDefinition,
} as const;