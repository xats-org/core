/**
 * @xats-org/mcp-server - Tools Index
 *
 * Exports all MCP tools and utilities
 */

// Tool implementations
export {
  validateTool,
  validateToolSync,
  validateBatchTool,
  getValidationSummary,
} from './validate.js';
export { createTool, getAvailableTemplates } from './create.js';
export { analyzeTool, getAnalysisSummary } from './analyze.js';
export { extractTool, getExtractionTypes, getCommonPaths } from './extract.js';
export { transformTool, getAvailableFormats } from './transform.js';

// Re-export types for convenience
export type {
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
  McpToolResult,
  DocumentStructure,
  DocumentStatistics,
  DocumentIssue,
  TransformChange,
} from '../types.js';

/**
 * Registry of all available tools
 */
export const TOOL_REGISTRY = {
  xats_validate: {
    name: 'xats_validate',
    description: 'Validate a xats document against the JSON Schema',
    category: 'validation',
    version: '1.0.0',
  },
  xats_create: {
    name: 'xats_create',
    description: 'Create a new xats document from a template',
    category: 'creation',
    version: '1.0.0',
  },
  xats_analyze: {
    name: 'xats_analyze',
    description: 'Analyze the structure and content of a xats document',
    category: 'analysis',
    version: '1.0.0',
  },
  xats_extract: {
    name: 'xats_extract',
    description: 'Extract specific content from a xats document',
    category: 'extraction',
    version: '1.0.0',
  },
  xats_transform: {
    name: 'xats_transform',
    description: 'Transform a xats document to different formats or versions',
    category: 'transformation',
    version: '1.0.0',
  },
} as const;

/**
 * Tool categories for organization
 */
export const TOOL_CATEGORIES = {
  validation: {
    name: 'Validation',
    description: 'Tools for validating xats documents',
    tools: ['xats_validate'],
  },
  creation: {
    name: 'Creation',
    description: 'Tools for creating new xats documents',
    tools: ['xats_create'],
  },
  analysis: {
    name: 'Analysis',
    description: 'Tools for analyzing xats documents',
    tools: ['xats_analyze'],
  },
  extraction: {
    name: 'Extraction',
    description: 'Tools for extracting content from xats documents',
    tools: ['xats_extract'],
  },
  transformation: {
    name: 'Transformation',
    description: 'Tools for transforming xats documents',
    tools: ['xats_transform'],
  },
} as const;

/**
 * Get all available tools
 */
export function getAllTools() {
  return Object.values(TOOL_REGISTRY);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: keyof typeof TOOL_CATEGORIES) {
  const categoryInfo = TOOL_CATEGORIES[category];
  if (!categoryInfo) {
    return [];
  }

  return categoryInfo.tools.map(
    (toolName) => TOOL_REGISTRY[toolName as keyof typeof TOOL_REGISTRY]
  );
}

/**
 * Get tool information
 */
export function getToolInfo(toolName: string) {
  return TOOL_REGISTRY[toolName as keyof typeof TOOL_REGISTRY] || null;
}

/**
 * Check if a tool exists
 */
export function isValidTool(toolName: string): boolean {
  return toolName in TOOL_REGISTRY;
}
