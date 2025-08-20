/**
 * @xats/mcp-server - Types and interfaces for MCP server
 */

import type { XatsDocument, XatsVersion, ValidationResult } from '@xats/types';

// MCP Tool Result Types
export interface McpToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

// Tool-specific result types
export interface ValidateResult extends McpToolResult {
  data?: ValidationResult;
}

export interface CreateResult extends McpToolResult {
  data?: {
    document: XatsDocument;
    template: string;
  };
}

export interface AnalyzeResult extends McpToolResult {
  data?: {
    structure: DocumentStructure;
    statistics: DocumentStatistics;
    issues: DocumentIssue[];
  };
}

export interface ExtractResult extends McpToolResult {
  data?: {
    content: any;
    path: string;
    type: string;
  };
}

export interface TransformResult extends McpToolResult {
  data?: {
    document: XatsDocument;
    format: string;
    changes: TransformChange[];
  };
}

// Analysis types
export interface DocumentStructure {
  type: 'textbook' | 'course' | 'chapter' | 'unit';
  containers: {
    units: number;
    chapters: number;
    sections: number;
  };
  contentBlocks: {
    total: number;
    byType: Record<string, number>;
  };
  assessments: {
    total: number;
    byType: Record<string, number>;
  };
  pathways: {
    total: number;
    byType: Record<string, number>;
  };
}

export interface DocumentStatistics {
  wordCount: number;
  characterCount: number;
  readingTimeMinutes: number;
  complexityScore: number;
  learningObjectives: number;
  resources: number;
  references: number;
}

export interface DocumentIssue {
  level: 'error' | 'warning' | 'info';
  message: string;
  path: string;
  code?: string;
  suggestion?: string;
}

export interface TransformChange {
  type: 'added' | 'removed' | 'modified';
  path: string;
  before?: any;
  after?: any;
  description: string;
}

// Tool input schemas
export interface ValidateInput {
  document: unknown;
  schemaVersion?: XatsVersion;
  strict?: boolean;
}

export interface CreateInput {
  template: 'minimal' | 'textbook' | 'course' | 'assessment';
  title: string;
  subject?: string;
  author?: string;
  language?: string;
  schemaVersion?: XatsVersion;
  options?: {
    includeFrontMatter?: boolean;
    includeBackMatter?: boolean;
    includeAssessments?: boolean;
    includePathways?: boolean;
  };
}

export interface AnalyzeInput {
  document: XatsDocument;
  depth?: 'basic' | 'detailed' | 'comprehensive';
  includeIssues?: boolean;
  includeStatistics?: boolean;
}

export interface ExtractInput {
  document: XatsDocument;
  path?: string;
  type?: 'content' | 'metadata' | 'structure' | 'assessments';
  filter?: {
    blockTypes?: string[];
    pathways?: string[];
    includeEmpty?: boolean;
  };
}

export interface TransformInput {
  document: XatsDocument;
  targetFormat?: 'json' | 'markdown' | 'html' | 'text';
  targetVersion?: XatsVersion;
  options?: {
    preserveMetadata?: boolean;
    flattenStructure?: boolean;
    stripAssessments?: boolean;
    includeRendering?: boolean;
  };
}

// Server configuration
export interface McpServerConfig {
  name: string;
  version: string;
  description: string;
  capabilities?: {
    tools?: boolean;
    resources?: boolean;
    prompts?: boolean;
  };
  defaultSchemaVersion?: XatsVersion;
  validation?: {
    strict?: boolean;
    allErrors?: boolean;
  };
  logging?: {
    enabled?: boolean;
  };
}

// Error types
export class McpError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'McpError';
  }
}

export class ValidationError extends McpError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class TransformError extends McpError {
  constructor(message: string, details?: any) {
    super(message, 'TRANSFORM_ERROR', details);
    this.name = 'TransformError';
  }
}

export class AnalysisError extends McpError {
  constructor(message: string, details?: any) {
    super(message, 'ANALYSIS_ERROR', details);
    this.name = 'AnalysisError';
  }
}
