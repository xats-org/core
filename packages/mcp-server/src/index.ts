/**
 * @xats-org/mcp-server - Main Package Entry Point
 */

import { createServer } from './server.js';
import { TOOL_REGISTRY, TOOL_CATEGORIES } from './tools/index.js';

import type { McpServerConfig } from './types.js';

// Server exports
export { XatsMcpServer, createServer, startServer } from './server.js';

// Tool exports
export {
  validateTool,
  validateToolSync,
  validateBatchTool,
  getValidationSummary,
  createTool,
  getAvailableTemplates,
  analyzeTool,
  getAnalysisSummary,
  extractTool,
  getExtractionTypes,
  getCommonPaths,
  transformTool,
  getAvailableFormats,
  TOOL_REGISTRY,
  TOOL_CATEGORIES,
  getAllTools,
  getToolsByCategory,
  getToolInfo,
  isValidTool,
} from './tools/index.js';

// Type exports
export type {
  McpServerConfig,
  McpToolResult,
  ValidateInput,
  ValidateResult,
  CreateInput,
  CreateResult,
  AnalyzeInput,
  AnalyzeResult,
  ExtractInput,
  ExtractResult,
  TransformInput,
  TransformResult,
  DocumentStructure,
  DocumentStatistics,
  DocumentIssue,
  TransformChange,
} from './types.js';

// Error exports
export {
  McpError,
  ValidationError,
  SchemaValidationError,
  InputValidationError,
  DocumentError,
  DocumentNotFoundError,
  DocumentParseError,
  UnsupportedSchemaVersionError,
  ToolError,
  AnalysisError,
  TransformError,
  ExtractionError,
  CreationError,
  ServerError,
  ConfigurationError,
  TimeoutError,
  ResourceError,
  NetworkError,
  FileSystemError,
  createErrorResponse,
  validateToolInput,
  safeExecuteTool,
  ERROR_SEVERITY,
  getErrorHandlingStrategy,
  formatErrorForLogging,
  COMMON_ERRORS,
  createCommonError,
} from './errors.js';

// Version and metadata
export const VERSION = '0.4.0';
export const PACKAGE_NAME = '@xats-org/mcp-server';

/**
 * Default configuration for the MCP server
 */
export const DEFAULT_CONFIG: Partial<McpServerConfig> = {
  name: 'xats-mcp-server',
  version: VERSION,
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

/**
 * Create server with default configuration
 */
export function createDefaultServer(overrides?: Partial<McpServerConfig>) {
  return createServer({ ...DEFAULT_CONFIG, ...overrides });
}

/**
 * Utility to check if MCP SDK is available
 */
export function checkMcpAvailability(): boolean {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require('@modelcontextprotocol/sdk');
    return true;
  } catch {
    return false;
  }
}

/**
 * Get server information
 */
export function getServerInfo() {
  return {
    name: PACKAGE_NAME,
    version: VERSION,
    description: 'Model Context Protocol server for xats documents',
    author: 'xats.org',
    license: 'MIT',
    capabilities: {
      tools: Object.keys(TOOL_REGISTRY),
      toolCount: Object.keys(TOOL_REGISTRY).length,
      categories: Object.keys(TOOL_CATEGORIES),
    },
    supportedSchemaVersions: ['0.1.0', '0.2.0', '0.3.0'],
    supportedFormats: ['json', 'markdown', 'html', 'text'],
  };
}
