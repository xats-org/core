/**
 * @xats/mcp-server - Server Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { XatsMcpServer, createServer } from '../server.js';

import type { McpServerConfig } from '../types.js';

describe('XatsMcpServer', () => {
  let server: XatsMcpServer;
  let mockConfig: McpServerConfig;

  beforeEach(() => {
    mockConfig = {
      name: 'test-mcp-server',
      version: '0.4.0',
      description: 'Test MCP server',
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
  });

  afterEach(async () => {
    if (server) {
      await server.close();
    }
  });

  describe('constructor', () => {
    it('should create server with default config', () => {
      server = new XatsMcpServer();
      const config = server.getConfig();

      expect(config.name).toBe('xats-mcp-server');
      expect(config.version).toBe('0.4.0');
      expect(config.capabilities?.tools).toBe(true);
    });

    it('should create server with custom config', () => {
      server = new XatsMcpServer(mockConfig);
      const config = server.getConfig();

      expect(config.name).toBe('test-mcp-server');
      expect(config.defaultSchemaVersion).toBe('0.3.0');
      expect(config.validation?.strict).toBe(true);
    });

    it('should merge partial config with defaults', () => {
      const partialConfig = {
        name: 'custom-server',
        validation: {
          strict: false,
        },
      };

      server = new XatsMcpServer(partialConfig);
      const config = server.getConfig();

      expect(config.name).toBe('custom-server');
      expect(config.version).toBe('0.4.0'); // default
      expect(config.validation?.strict).toBe(false); // custom
      expect(config.validation?.allErrors).toBe(true); // default
    });
  });

  describe('createServer', () => {
    it('should create server instance', async () => {
      server = await createServer(mockConfig);
      expect(server).toBeInstanceOf(XatsMcpServer);
    });

    it('should create server with no config', async () => {
      server = await createServer();
      expect(server).toBeInstanceOf(XatsMcpServer);
    });
  });

  describe('getConfig', () => {
    it('should return server configuration', () => {
      server = new XatsMcpServer(mockConfig);
      const config = server.getConfig();

      expect(config).toEqual(mockConfig);
      expect(config).not.toBe(mockConfig); // should be a copy
    });
  });

  describe('validation', () => {
    beforeEach(() => {
      server = new XatsMcpServer(mockConfig);
    });

    it('should validate input objects', () => {
      const validateInput = (server as any).validateInput.bind(server);

      // Valid input
      expect(() => validateInput({ document: {} }, 'validate')).not.toThrow();

      // Invalid input
      expect(() => validateInput(null, 'validate')).toThrow('Invalid input');
      expect(() => validateInput('string', 'validate')).toThrow('Invalid input');
      expect(() => validateInput(123, 'validate')).toThrow('Invalid input');
    });
  });
});
