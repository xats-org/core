/**
 * File modularity types for xats
 */

import type { ValidatorOptions, ValidationResult } from './validation.js';

/**
 * Reference to an external file
 */
export interface FileReference {
  $ref: string;
  integrity?: string;
  mimeType?: string;
  encoding?: string;
  fallback?: unknown;
}

/**
 * Resolved file information
 */
export interface ResolvedFile {
  path: string;
  absolutePath: string;
  content: unknown;
  size: number;
  checksum?: string;
}

/**
 * Result of file resolution
 */
export interface FileResolutionResult {
  resolved: ResolvedFile[];
  errors: FileResolutionError[];
  warnings: FileResolutionWarning[];
  stats: FileResolutionStats;
}

/**
 * Error during file resolution
 */
export interface FileResolutionError {
  file: string;
  error: string;
  code: 'not-found' | 'access-denied' | 'invalid-format' | 'circular-reference' | 'too-large' | 'other';
}

/**
 * Warning during file resolution
 */
export interface FileResolutionWarning {
  file: string;
  warning: string;
  code: string;
}

/**
 * Statistics about file resolution
 */
export interface FileResolutionStats {
  totalFiles: number;
  totalSize: number;
  resolutionTime: number;
  maxDepth: number;
  circularReferences: number;
}

/**
 * Performance metrics for file operations
 */
export interface PerformanceMetrics {
  totalFiles: number;
  totalSize: number;
  resolutionTime: number;
  validationTime: number;
  cacheHits: number;
  cacheMisses: number;
  memoryUsed?: number;
}

/**
 * Options for file modularity validator
 */
export interface FileModularityValidatorOptions extends ValidatorOptions {
  maxFileSize?: number;
  maxTotalSize?: number;
  maxDepth?: number;
  allowAbsolutePaths?: boolean;
  allowNetworkPaths?: boolean;
  allowSymlinks?: boolean;
  baseDir?: string;
  cache?: boolean;
  cacheDir?: string;
  timeout?: number;
}

/**
 * File cache entry
 */
export interface FileCacheEntry {
  path: string;
  content: unknown;
  size: number;
  checksum: string;
  timestamp: number;
  hits: number;
}

/**
 * File resolution strategy
 */
export type FileResolutionStrategy = 'eager' | 'lazy' | 'on-demand';

/**
 * Security policy for file access
 */
export interface FileSecurityPolicy {
  allowedPaths: string[];
  blockedPaths: string[];
  maxFileSize: number;
  maxTotalSize: number;
  allowedMimeTypes?: string[];
  scanForMalware?: boolean;
}