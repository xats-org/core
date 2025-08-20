/**
 * TypeScript interfaces for CLI command options
 */

import type { XatsDocument } from '@xats/types';

/**
 * Base command options available on all commands
 */
export interface BaseCommandOptions {
  color?: boolean;
  quiet?: boolean;
  verbose?: boolean;
  parent?: {
    verbose?: boolean;
    quiet?: boolean;
    color?: boolean;
  };
}

/**
 * Options for the validate command
 */
export interface ValidateCommandOptions extends BaseCommandOptions {
  schema?: string;
  strict?: boolean;
  extensions?: boolean;
  format?: 'text' | 'json';
}

/**
 * Options for the info command
 */
export interface InfoCommandOptions extends BaseCommandOptions {
  format?: 'text' | 'json';
}

/**
 * Options for the stats command
 */
export interface StatsCommandOptions extends BaseCommandOptions {
  format?: 'text' | 'json';
  detailed?: boolean;
}

/**
 * Options for the format command
 */
export interface FormatCommandOptions extends BaseCommandOptions {
  output?: string;
  indent?: string;
  sortKeys?: boolean;
  compact?: boolean;
}

/**
 * Document information extracted for info command
 */
export interface DocumentInfo {
  schemaVersion: string;
  title: string;
  authors: Array<{ family?: string; given?: string; literal?: string }>;
  subject: string;
  publisher?: string;
  publishedDate?: number[];
  isbn?: string;
  language: string;
  hasFrontMatter: boolean;
  hasBackMatter: boolean;
  unitCount: number;
  chapterCount: number;
  sectionCount: number;
}

/**
 * Document statistics extracted for stats command
 */
export interface DocumentStats {
  fileSize: number;
  schemaVersion: string;
  structuralDepth: number;
  totalBlocks: number;
  blockTypes: Record<string, number>;
  totalWords: number;
  averageWordsPerBlock: number;
  hasAssessments: boolean;
  hasFigures: boolean;
  hasTables: boolean;
  hasCode: boolean;
  hasMath: boolean;
  hasReferences: boolean;
  hasCitations: boolean;
  extensionsUsed: string[];
  referenceCount?: number;
}

/**
 * Type guard to check if a value is a valid XatsDocument
 */
export function isXatsDocument(value: unknown): value is XatsDocument {
  return (
    typeof value === 'object' &&
    value !== null &&
    'schemaVersion' in value &&
    'bibliographicEntry' in value &&
    'subject' in value &&
    'bodyMatter' in value
  );
}

/**
 * Type guard to check if a value is a structural container with contents
 */
export function isStructuralContainer(
  value: unknown
): value is { type: string; contents?: unknown[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof (value as Record<string, unknown>).type === 'string'
  );
}

/**
 * Type guard to check if a value is a content block
 */
export function isContentBlock(
  value: unknown
): value is { blockType: string; content?: unknown; extensions?: Record<string, unknown> } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'blockType' in value &&
    typeof (value as Record<string, unknown>).blockType === 'string'
  );
}

/**
 * Type guard to check if a value has semantic text structure
 */
export function isSemanticText(
  value: unknown
): value is { runs: Array<{ type: string; text?: string }> } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'runs' in value &&
    Array.isArray((value as Record<string, unknown>).runs)
  );
}

/**
 * Type for CSL-JSON author objects
 */
export interface CslAuthor {
  family?: string;
  given?: string;
  literal?: string;
}

/**
 * Package.json interface for reading version information
 */
export interface PackageJson {
  name: string;
  version: string;
  description?: string;
  [key: string]: unknown;
}
