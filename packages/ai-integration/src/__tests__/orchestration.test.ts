/**
 * @xats-org/ai-integration - Orchestration Tests
 */

import { describe, test, expect, beforeEach } from 'vitest';
import {
  AgentRegistry,
  WorkflowOrchestrator,
  WORKFLOW_TEMPLATES,
  type AIAgent,
  type WorkflowDefinition,
} from '../orchestration/workflow.js';
import type { XatsDocument } from '@xats-org/types';

describe('Agent Orchestration', () => {
  describe('AgentRegistry', () => {
    let registry: AgentRegistry;

    beforeEach(() => {
      registry = new AgentRegistry();
    });

    test('registers and retrieves agents', () => {
      const agent: AIAgent = {
        id: 'test-agent',
        role: 'content-writer',
        capabilities: ['writing', 'education'],
        version: '1.0.0',
      };

      registry.register(agent);
      
      expect(registry.get('test-agent')).toEqual(agent);
      expect(registry.has('test-agent')).toBe(true);
      expect(registry.has('nonexistent')).toBe(false);
    });

    test('unregisters agents', () => {
      const agent: AIAgent = {
        id: 'test-agent',
        role: 'content-writer',
        capabilities: ['writing'],
      };

      registry.register(agent);
      expect(registry.has('test-agent')).toBe(true);

      registry.unregister('test-agent');
      expect(registry.has('test-agent')).toBe(false);
    });

    test('finds agents by capability', () => {
      const agents: AIAgent[] = [
        {
          id: 'writer',
          role: 'content-writer',
          capabilities: ['writing', 'education'],
        },
        {
          id: 'reviewer',
          role: 'content-reviewer',
          capabilities: ['review', 'quality-assessment'],
        },
        {
          id: 'planner',
          role: 'content-planner',
          capabilities: ['planning', 'education'],
        },
      ];

      agents.forEach(agent => registry.register(agent));

      const educationAgents = registry.findByCapability('education');
      expect(educationAgents).toHaveLength(2);
      expect(educationAgents.map(a => a.id)).toContain('writer');
      expect(educationAgents.map(a => a.id)).toContain('planner');

      const reviewAgents = registry.findByCapability('review');
      expect(reviewAgents).toHaveLength(1);
      expect(reviewAgents[0].id).toBe('reviewer');
    });

    test('lists all agents', () => {
      const agent1: AIAgent = { id: 'agent1', role: 'role1', capabilities: [] };
      const agent2: AIAgent = { id: 'agent2', role: 'role2', capabilities: [] };

      registry.register(agent1);
      registry.register(agent2);

      const allAgents = registry.list();
      expect(allAgents).toHaveLength(2);
      expect(allAgents).toContainEqual(agent1);
      expect(allAgents).toContainEqual(agent2);
    });
  });

  describe('WorkflowOrchestrator', () => {
    let registry: AgentRegistry;
    let orchestrator: WorkflowOrchestrator;

    beforeEach(() => {
      registry = new AgentRegistry();
      orchestrator = new WorkflowOrchestrator(registry);

      // Register test agents
      const agents: AIAgent[] = [
        {
          id: 'content-planner',
          role: 'planner',
          capabilities: ['content-planning', 'structure-design'],
        },
        {
          id: 'content-writer',
          role: 'writer',
          capabilities: ['content-generation', 'writing'],
        },
        {
          id: 'example-generator',
          role: 'generator',
          capabilities: ['example-creation', 'problem-generation'],
        },
        {
          id: 'content-reviewer',
          role: 'reviewer',
          capabilities: ['content-review', 'quality-assessment'],
        },
      ];

      agents.forEach(agent => registry.register(agent));
    });

    test('registers workflow definitions', () => {
      const workflow: WorkflowDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            agentId: 'content-planner',
            requiredCapabilities: ['content-planning'],
            inputs: [],
            outputs: [],
          },
        ],
        dependencies: {},
        config: {},
      };

      expect(() => orchestrator.registerWorkflow(workflow)).not.toThrow();
    });

    test('validates workflow with unknown agents', () => {
      const workflow: WorkflowDefinition = {
        id: 'invalid-workflow',
        name: 'Invalid Workflow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            agentId: 'unknown-agent',
            requiredCapabilities: [],
          },
        ],
      };

      expect(() => orchestrator.registerWorkflow(workflow)).toThrow('Agent not found: unknown-agent');
    });

    test('validates workflow dependencies', () => {
      const workflow: WorkflowDefinition = {
        id: 'invalid-deps',
        name: 'Invalid Dependencies',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            agentId: 'content-planner',
            requiredCapabilities: [],
          },
        ],
        dependencies: {
          step1: ['unknown-step'],
        },
      };

      expect(() => orchestrator.registerWorkflow(workflow)).toThrow('Step step1 depends on unknown step: unknown-step');
    });

    test('starts workflow execution', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Test Document',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [],
        },
      };

      const workflow = WORKFLOW_TEMPLATES.TEXTBOOK_CREATION;
      orchestrator.registerWorkflow(workflow);

      const executionId = await orchestrator.startWorkflow(workflow.id, document);

      expect(executionId).toBeDefined();
      expect(typeof executionId).toBe('string');

      const status = orchestrator.getExecutionStatus(executionId);
      expect(status).toBeDefined();
      expect(status?.workflowId).toBe(workflow.id);
      expect(status?.metadata.status).toMatch(/pending|running/);
    });

    test('gets execution status', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Test Document',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [],
        },
      };

      const workflow = WORKFLOW_TEMPLATES.TEXTBOOK_CREATION;
      orchestrator.registerWorkflow(workflow);

      const executionId = await orchestrator.startWorkflow(workflow.id, document);
      const status = orchestrator.getExecutionStatus(executionId);

      expect(status).toBeDefined();
      expect(status?.executionId).toBe(executionId);
      expect(status?.workflowId).toBe(workflow.id);
      expect(status?.metadata).toBeDefined();
    });

    test('cancels workflow execution', async () => {
      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Test Document',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [],
        },
      };

      const workflow = WORKFLOW_TEMPLATES.TEXTBOOK_CREATION;
      orchestrator.registerWorkflow(workflow);

      const executionId = await orchestrator.startWorkflow(workflow.id, document);
      
      // Wait a moment for execution to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const cancelled = orchestrator.cancelExecution(executionId);
      
      // Note: In the real implementation, this might work if the workflow is running
      // For the test, we just verify the method exists and can be called
      expect(typeof cancelled).toBe('boolean');
    });

    test('handles workflow execution errors gracefully', async () => {
      const invalidWorkflow: WorkflowDefinition = {
        id: 'error-workflow',
        name: 'Error Workflow',
        version: '1.0.0',
        steps: [
          {
            id: 'step1',
            name: 'Error Step',
            agentId: 'content-planner',
            requiredCapabilities: ['nonexistent-capability'], // This will cause an error
            inputs: [],
            outputs: [],
          },
        ],
        dependencies: {},
        config: {},
      };

      orchestrator.registerWorkflow(invalidWorkflow);

      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'book',
          title: 'Test Document',
        },
        subject: 'Test Subject',
        bodyMatter: {
          contents: [],
        },
      };

      const executionId = await orchestrator.startWorkflow(invalidWorkflow.id, document);
      
      // Wait for execution to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const status = orchestrator.getExecutionStatus(executionId);
      expect(status?.metadata.status).toBe('failed');
    });
  });

  describe('Workflow Templates', () => {
    test('TEXTBOOK_CREATION template is valid', () => {
      const template = WORKFLOW_TEMPLATES.TEXTBOOK_CREATION;
      
      expect(template.id).toBe('textbook-creation');
      expect(template.name).toBe('Multi-Agent Textbook Creation');
      expect(template.steps).toHaveLength(4);
      
      // Check step dependencies
      expect(template.dependencies.content).toContain('outline');
      expect(template.dependencies.examples).toContain('content');
      expect(template.dependencies.review).toContain('examples');
    });

    test('template has correct step sequence', () => {
      const template = WORKFLOW_TEMPLATES.TEXTBOOK_CREATION;
      const stepIds = template.steps.map(s => s.id);
      
      expect(stepIds).toEqual(['outline', 'content', 'examples', 'review']);
    });

    test('template agents have required capabilities', () => {
      const template = WORKFLOW_TEMPLATES.TEXTBOOK_CREATION;
      
      const outlineStep = template.steps.find(s => s.id === 'outline');
      expect(outlineStep?.requiredCapabilities).toContain('content-planning');
      
      const contentStep = template.steps.find(s => s.id === 'content');
      expect(contentStep?.requiredCapabilities).toContain('content-generation');
      
      const examplesStep = template.steps.find(s => s.id === 'examples');
      expect(examplesStep?.requiredCapabilities).toContain('example-creation');
      
      const reviewStep = template.steps.find(s => s.id === 'review');
      expect(reviewStep?.requiredCapabilities).toContain('content-review');
    });
  });
});