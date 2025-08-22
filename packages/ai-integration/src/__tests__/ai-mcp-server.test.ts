/**
 * @xats-org/ai-integration - AI MCP Server Tests
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { AIIntegratedMcpServer, createAIIntegratedServer } from '../mcp/ai-mcp-server.js';
import type { XatsDocument } from '@xats-org/types';

describe('AI Integrated MCP Server', () => {
  let server: AIIntegratedMcpServer | undefined;

  beforeEach(async () => {
    try {
      server = await createAIIntegratedServer({
        name: 'test-ai-mcp-server',
        version: '0.5.0-test',
      });
    } catch (error) {
      // Server creation might fail, tests should handle this
      console.log('Server creation failed:', error);
    }
  });

  afterEach(async () => {
    if (server) {
      await server.close();
      server = undefined;
    }
  });

  test('creates server instance', () => {
    expect(server).toBeDefined();
    expect(server).toBeInstanceOf(AIIntegratedMcpServer);
    if (server) {
      expect(server.getConfig().name).toBe('test-ai-mcp-server');
      expect(server.getConfig().version).toBe('0.5.0-test');
    }
  });

  test('provides agent registry', () => {
    if (!server) return;
    const registry = server.getAgentRegistry();
    expect(registry).toBeDefined();
    expect(typeof registry.register).toBe('function');
    expect(typeof registry.get).toBe('function');
  });

  test('provides workflow orchestrator', () => {
    if (!server) return;
    const orchestrator = server.getOrchestrator();
    expect(orchestrator).toBeDefined();
  });

  test('registers agents through registry', () => {
    const registry = server.getAgentRegistry();
    
    const agent = {
      id: 'test-agent',
      role: 'content-writer',
      capabilities: ['writing', 'education'],
      version: '1.0.0',
    };

    registry.register(agent);
    
    const retrieved = registry.get('test-agent');
    expect(retrieved).toEqual(agent);
  });

  test('starts workflows through orchestrator', async () => {
    const orchestrator = server.getOrchestrator();
    const registry = server.getAgentRegistry();

    // Register required agents for the textbook creation workflow
    const agents = [
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

    const document: XatsDocument = {
      schemaVersion: '0.5.0',
      bibliographicEntry: {
        type: 'book',
        title: 'Test Textbook',
      },
      subject: 'Mathematics',
      bodyMatter: {
        contents: [],
      },
    };

    // Register the textbook creation workflow manually since it's not auto-registered
    orchestrator.registerWorkflow({
      id: 'textbook-creation',
      name: 'Test Textbook Creation',
      version: '1.0.0',
      steps: [
        {
          id: 'outline',
          name: 'Create Outline',
          agentId: 'content-planner',
          requiredCapabilities: ['content-planning'],
          inputs: [],
          outputs: ['outline'],
        }
      ],
      dependencies: {},
      config: {},
    });

    const executionId = await orchestrator.startWorkflow(
      'textbook-creation',
      document,
      { testMode: true }
    );

    expect(executionId).toBeDefined();
    expect(typeof executionId).toBe('string');

    const status = orchestrator.getExecutionStatus(executionId);
    expect(status).toBeDefined();
    expect(status?.workflowId).toBe('textbook-creation');
  });

  test('inherits base MCP server functionality', () => {
    const config = server.getConfig();
    
    expect(config.capabilities).toBeDefined();
    expect(config.capabilities?.tools).toBe(true);
    expect(config.defaultSchemaVersion).toBe('0.3.0');
    expect(config.validation).toBeDefined();
  });

  test('extends server with AI-specific capabilities', () => {
    // The AI server should have all the base capabilities plus AI extensions
    const agentRegistry = server.getAgentRegistry();
    const orchestrator = server.getOrchestrator();

    expect(agentRegistry).toBeDefined();
    expect(orchestrator).toBeDefined();
    
    // Verify that we can register agents
    expect(typeof agentRegistry.register).toBe('function');
    expect(typeof agentRegistry.get).toBe('function');
    expect(typeof agentRegistry.findByCapability).toBe('function');
    
    // Verify that we can work with workflows
    expect(typeof orchestrator.getExecutionStatus).toBe('function');
    expect(typeof orchestrator.cancelExecution).toBe('function');
  });

  test('handles graceful shutdown', async () => {
    expect(typeof server.close).toBe('function');
    await expect(server.close()).resolves.not.toThrow();
  });

  describe('AI-specific functionality', () => {
    test('agent registry manages agents correctly', () => {
      const registry = server.getAgentRegistry();
      
      const agent1 = {
        id: 'writer-1',
        role: 'content-writer',
        capabilities: ['writing', 'technical-writing'],
      };
      
      const agent2 = {
        id: 'reviewer-1',
        role: 'content-reviewer',
        capabilities: ['review', 'quality-assessment'],
      };

      registry.register(agent1);
      registry.register(agent2);

      expect(registry.list()).toHaveLength(2);
      expect(registry.has('writer-1')).toBe(true);
      expect(registry.has('reviewer-1')).toBe(true);
      
      const writers = registry.findByCapability('writing');
      expect(writers).toHaveLength(1);
      expect(writers[0].id).toBe('writer-1');
    });

    test('workflow orchestrator manages executions', async () => {
      const orchestrator = server.getOrchestrator();
      const registry = server.getAgentRegistry();

      // Register a simple agent
      registry.register({
        id: 'simple-agent',
        role: 'processor',
        capabilities: ['simple-processing'],
      });

      // Register a simple workflow
      const simpleWorkflow = {
        id: 'simple-workflow',
        name: 'Simple Test Workflow',
        version: '1.0.0',
        steps: [
          {
            id: 'process',
            name: 'Simple Processing',
            agentId: 'simple-agent',
            requiredCapabilities: ['simple-processing'],
            inputs: [],
            outputs: [],
          },
        ],
        dependencies: {},
        config: {},
      };

      orchestrator.registerWorkflow(simpleWorkflow);

      const document: XatsDocument = {
        schemaVersion: '0.5.0',
        bibliographicEntry: {
          type: 'article',
          title: 'Simple Test',
        },
        subject: 'Testing',
        bodyMatter: {
          contents: [],
        },
      };

      const executionId = await orchestrator.startWorkflow('simple-workflow', document);
      
      expect(executionId).toBeDefined();
      
      const status = orchestrator.getExecutionStatus(executionId);
      expect(status?.executionId).toBe(executionId);
      expect(status?.workflowId).toBe('simple-workflow');
    });
  });
});