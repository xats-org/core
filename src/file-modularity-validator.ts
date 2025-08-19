/**
 * File Modularity Validator for xats Documents
 * 
 * Provides validation capabilities for xats documents that use FileReference objects
 * to compose content across multiple files. This validator ensures:
 * - FileReferences resolve correctly
 * - Circular references are detected and prevented
 * - Security constraints are enforced (no absolute paths, no parent directory traversal)
 * - Referenced files validate against their schemas
 * - Performance tracking for multi-file loading
 */

import { readFileSync, existsSync, statSync } from 'fs';
import { resolve, dirname, relative, isAbsolute, normalize } from 'path';
import { performance } from 'perf_hooks';
import { createHash } from 'crypto';
import type { ValidationResult, ValidationError, ValidatorOptions } from './validator.js';
import { XatsValidator } from './validator.js';

export interface FileReference {
  $ref: string;
  'xats:refMetadata'?: {
    title?: string;
    authors?: string[];
    lastModified?: string;
    checksum?: string;
    version?: string;
  };
}

export interface ResolvedFile {
  path: string;
  content: unknown;
  checksum: string;
  lastModified: Date;
  size: number;
}

export interface FileResolutionResult {
  resolved: Map<string, ResolvedFile>;
  errors: ValidationError[];
  circularReferences: string[];
  performanceMetrics: PerformanceMetrics;
}

export interface PerformanceMetrics {
  totalFiles: number;
  totalSizeBytes: number;
  totalLoadTimeMs: number;
  averageFileLoadTimeMs: number;
  maxFileLoadTimeMs: number;
  circularReferenceCheckTimeMs: number;
  validationTimeMs: number;
}

export interface FileModularityValidatorOptions extends ValidatorOptions {
  maxFileSize?: number; // bytes
  maxTotalFiles?: number;
  maxDepth?: number;
  allowedFileExtensions?: string[];
  basePath?: string;
}

export class FileModularityValidator {
  private baseValidator: XatsValidator;
  private options: FileModularityValidatorOptions;
  private fileCache: Map<string, ResolvedFile> = new Map();
  private performanceStart: number = 0;

  constructor(options: FileModularityValidatorOptions = {}) {
    this.options = {
      maxFileSize: 10 * 1024 * 1024, // 10MB default
      maxTotalFiles: 1000, // Maximum files in a textbook
      maxDepth: 20, // Maximum reference depth
      allowedFileExtensions: ['.json'],
      ...options
    };
    
    this.baseValidator = new XatsValidator(options);
  }

  /**
   * Validate a xats document with file modularity support
   */
  async validate(
    documentPath: string, 
    options: FileModularityValidatorOptions = {}
  ): Promise<ValidationResult & { fileResolution?: FileResolutionResult }> {
    this.performanceStart = performance.now();
    
    try {
      // Validate the main document first
      const mainValidation = await this.baseValidator.validateFile(documentPath, options);
      
      if (!mainValidation.isValid) {
        return {
          ...mainValidation,
          fileResolution: {
            resolved: new Map(),
            errors: mainValidation.errors,
            circularReferences: [],
            performanceMetrics: this.getEmptyMetrics()
          }
        };
      }

      // Load and parse the main document
      const mainContent = this.loadFile(documentPath);
      if (!mainContent.success) {
        return {
          isValid: false,
          errors: [{ path: documentPath, message: mainContent.error! }],
          fileResolution: {
            resolved: new Map(),
            errors: [{ path: documentPath, message: mainContent.error! }],
            circularReferences: [],
            performanceMetrics: this.getEmptyMetrics()
          }
        };
      }

      // Resolve all file references
      const basePath = options.basePath || dirname(documentPath);
      const resolutionResult = await this.resolveAllFileReferences(
        mainContent.data!, 
        basePath, 
        documentPath
      );

      // Validate all resolved files
      const validationErrors = await this.validateResolvedFiles(resolutionResult.resolved);
      resolutionResult.errors.push(...validationErrors);

      // Calculate final performance metrics
      resolutionResult.performanceMetrics.totalLoadTimeMs = performance.now() - this.performanceStart;
      
      const isValid = resolutionResult.errors.length === 0 && resolutionResult.circularReferences.length === 0;
      
      return {
        isValid,
        errors: resolutionResult.errors,
        schemaVersion: mainValidation.schemaVersion || '0.3.0',
        fileResolution: resolutionResult
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [{
          path: documentPath,
          message: `File modularity validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }],
        fileResolution: {
          resolved: new Map(),
          errors: [{
            path: documentPath,
            message: `File modularity validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          circularReferences: [],
          performanceMetrics: this.getEmptyMetrics()
        }
      };
    }
  }

  /**
   * Resolve all FileReference objects in a document
   */
  private async resolveAllFileReferences(
    document: unknown,
    basePath: string,
    rootPath: string,
    visitedPaths: Set<string> = new Set(),
    depth: number = 0
  ): Promise<FileResolutionResult> {
    const result: FileResolutionResult = {
      resolved: new Map(),
      errors: [],
      circularReferences: [],
      performanceMetrics: this.initializeMetrics()
    };

    // Check maximum depth
    if (depth > (this.options.maxDepth || 20)) {
      result.errors.push({
        path: rootPath,
        message: `Maximum reference depth exceeded (${this.options.maxDepth})`
      });
      return result;
    }

    // Check for circular references
    const normalizedRootPath = normalize(rootPath);
    if (visitedPaths.has(normalizedRootPath)) {
      result.circularReferences.push(normalizedRootPath);
      return result;
    }

    visitedPaths.add(normalizedRootPath);

    try {
      await this.processDocumentReferences(
        document,
        basePath,
        visitedPaths,
        depth,
        result
      );
    } catch (error) {
      result.errors.push({
        path: rootPath,
        message: `Error processing references: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    return result;
  }

  /**
   * Recursively process all FileReference objects in a document
   */
  private async processDocumentReferences(
    obj: unknown,
    basePath: string,
    visitedPaths: Set<string>,
    depth: number,
    result: FileResolutionResult
  ): Promise<void> {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        await this.processDocumentReferences(item, basePath, visitedPaths, depth, result);
      }
      return;
    }

    const objRecord = obj as Record<string, unknown>;

    // Check if this is a FileReference
    if (this.isFileReference(objRecord)) {
      const fileRef = objRecord as unknown as FileReference;
      const refValidation = this.validateFileReference(fileRef, basePath);
      
      if (!refValidation.valid) {
        result.errors.push(...refValidation.errors);
        return;
      }

      const resolvedPath = refValidation.resolvedPath!;
      
      // Load the referenced file
      const fileLoadStart = performance.now();
      const loadResult = this.loadFile(resolvedPath);
      const loadTime = performance.now() - fileLoadStart;

      result.performanceMetrics.maxFileLoadTimeMs = Math.max(
        result.performanceMetrics.maxFileLoadTimeMs,
        loadTime
      );

      if (!loadResult.success) {
        result.errors.push({
          path: resolvedPath,
          message: loadResult.error!
        });
        return;
      }

      // Store resolved file
      result.resolved.set(resolvedPath, loadResult.data!);
      result.performanceMetrics.totalFiles++;
      result.performanceMetrics.totalSizeBytes += loadResult.data!.size;

      // Recursively process the referenced document
      const subResult = await this.resolveAllFileReferences(
        loadResult.data!.content,
        dirname(resolvedPath),
        resolvedPath,
        new Set(visitedPaths),
        depth + 1
      );

      // Merge results
      for (const [path, file] of subResult.resolved) {
        result.resolved.set(path, file);
      }
      result.errors.push(...subResult.errors);
      result.circularReferences.push(...subResult.circularReferences);
      result.performanceMetrics.totalFiles += subResult.performanceMetrics.totalFiles;
      result.performanceMetrics.totalSizeBytes += subResult.performanceMetrics.totalSizeBytes;
    }

    // Continue processing nested objects
    for (const value of Object.values(objRecord)) {
      await this.processDocumentReferences(value, basePath, visitedPaths, depth, result);
    }
  }

  /**
   * Check if an object is a FileReference
   */
  private isFileReference(obj: Record<string, unknown>): boolean {
    return typeof obj.$ref === 'string' && obj.$ref.startsWith('./') && obj.$ref.endsWith('.json');
  }

  /**
   * Validate a FileReference object
   */
  private validateFileReference(
    fileRef: FileReference,
    basePath: string
  ): { valid: boolean; errors: ValidationError[]; resolvedPath?: string } {
    const errors: ValidationError[] = [];

    // Validate $ref format
    if (!fileRef.$ref.match(/^\.\/[^.]*.*\.json$/)) {
      errors.push({
        path: fileRef.$ref,
        message: 'FileReference $ref must match pattern: ./[path].json'
      });
    }

    // Security validation: no absolute paths
    if (isAbsolute(fileRef.$ref)) {
      errors.push({
        path: fileRef.$ref,
        message: 'FileReference $ref cannot be an absolute path'
      });
    }

    // Security validation: no parent directory traversal
    if (fileRef.$ref.includes('..')) {
      errors.push({
        path: fileRef.$ref,
        message: 'FileReference $ref cannot contain parent directory traversal (..)'
      });
    }

    // Resolve path
    const resolvedPath = resolve(basePath, fileRef.$ref);
    
    // Security validation: ensure resolved path is within base path
    const relativePath = relative(basePath, resolvedPath);
    if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
      errors.push({
        path: fileRef.$ref,
        message: 'FileReference resolves outside of document root directory'
      });
    }

    // Check file extension
    if (this.options.allowedFileExtensions?.length && 
        !this.options.allowedFileExtensions.some(ext => resolvedPath.endsWith(ext))) {
      errors.push({
        path: fileRef.$ref,
        message: `File extension not allowed. Allowed extensions: ${this.options.allowedFileExtensions.join(', ')}`
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      ...(errors.length === 0 && { resolvedPath })
    };
  }

  /**
   * Load a file and return parsed content with metadata
   */
  private loadFile(filePath: string): { success: false; error: string } | { success: true; data: ResolvedFile } {
    try {
      // Check if file exists
      if (!existsSync(filePath)) {
        return {
          success: false,
          error: `File does not exist: ${filePath}`
        };
      }

      // Get file stats
      const stats = statSync(filePath);
      
      // Check file size
      if (this.options.maxFileSize && stats.size > this.options.maxFileSize) {
        return {
          success: false,
          error: `File too large (${stats.size} bytes, max: ${this.options.maxFileSize} bytes): ${filePath}`
        };
      }

      // Read file content
      const content = readFileSync(filePath, 'utf-8');
      
      // Parse JSON
      let parsedContent: unknown;
      try {
        parsedContent = JSON.parse(content);
      } catch (parseError) {
        return {
          success: false,
          error: `JSON parse error in ${filePath}: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
        };
      }

      // Calculate checksum
      const checksum = createHash('sha256').update(content).digest('hex');

      return {
        success: true,
        data: {
          path: filePath,
          content: parsedContent,
          checksum,
          lastModified: stats.mtime,
          size: stats.size
        }
      };

    } catch (error) {
      return {
        success: false,
        error: `Error loading file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate all resolved files for basic structural validity
   * Note: Referenced files are partial xats objects (Chapter, Section, etc.) 
   * and don't need to validate against the full document schema
   */
  private async validateResolvedFiles(resolvedFiles: Map<string, ResolvedFile>): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    for (const [path, file] of resolvedFiles) {
      try {
        // Basic validation: ensure it's a valid object with required xats properties
        if (!this.isValidPartialXatsObject(file.content)) {
          errors.push({
            path,
            message: 'Referenced file does not contain a valid xats object structure'
          });
        }
      } catch (error) {
        errors.push({
          path,
          message: `Validation error: ${error instanceof Error ? error.message : 'Unknown validation error'}`
        });
      }
    }

    return errors;
  }

  /**
   * Basic validation for partial xats objects
   */
  private isValidPartialXatsObject(obj: unknown): boolean {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return false;
    }

    const record = obj as Record<string, unknown>;
    
    // Must have id and language (required by XatsObject base)
    if (typeof record.id !== 'string' || typeof record.language !== 'string') {
      return false;
    }

    return true;
  }

  /**
   * Initialize performance metrics
   */
  private initializeMetrics(): PerformanceMetrics {
    return {
      totalFiles: 0,
      totalSizeBytes: 0,
      totalLoadTimeMs: 0,
      averageFileLoadTimeMs: 0,
      maxFileLoadTimeMs: 0,
      circularReferenceCheckTimeMs: 0,
      validationTimeMs: 0
    };
  }

  /**
   * Get empty performance metrics for error cases
   */
  private getEmptyMetrics(): PerformanceMetrics {
    return this.initializeMetrics();
  }

  /**
   * Clear the file cache (useful for testing)
   */
  clearCache(): void {
    this.fileCache.clear();
  }

  /**
   * Get performance benchmarks for a multi-file textbook
   */
  async benchmarkTextbook(documentPath: string, iterations: number = 3): Promise<{
    averageMetrics: PerformanceMetrics;
    iterations: PerformanceMetrics[];
    memoryUsage: NodeJS.MemoryUsage;
  }> {
    const iterationMetrics: PerformanceMetrics[] = [];
    
    for (let i = 0; i < iterations; i++) {
      this.clearCache(); // Clear cache for fair benchmark
      const result = await this.validate(documentPath);
      if (result.fileResolution) {
        iterationMetrics.push(result.fileResolution.performanceMetrics);
      }
    }

    // Calculate averages
    const averageMetrics: PerformanceMetrics = {
      totalFiles: Math.round(iterationMetrics.reduce((sum, m) => sum + m.totalFiles, 0) / iterations),
      totalSizeBytes: Math.round(iterationMetrics.reduce((sum, m) => sum + m.totalSizeBytes, 0) / iterations),
      totalLoadTimeMs: iterationMetrics.reduce((sum, m) => sum + m.totalLoadTimeMs, 0) / iterations,
      averageFileLoadTimeMs: iterationMetrics.reduce((sum, m) => sum + m.averageFileLoadTimeMs, 0) / iterations,
      maxFileLoadTimeMs: Math.max(...iterationMetrics.map(m => m.maxFileLoadTimeMs)),
      circularReferenceCheckTimeMs: iterationMetrics.reduce((sum, m) => sum + m.circularReferenceCheckTimeMs, 0) / iterations,
      validationTimeMs: iterationMetrics.reduce((sum, m) => sum + m.validationTimeMs, 0) / iterations
    };

    return {
      averageMetrics,
      iterations: iterationMetrics,
      memoryUsage: process.memoryUsage()
    };
  }
}

/**
 * Create a new file modularity validator
 */
export function createFileModularityValidator(options: FileModularityValidatorOptions = {}): FileModularityValidator {
  return new FileModularityValidator(options);
}

/**
 * Quick validation function for file modular xats documents
 */
export async function validateModularXats(
  documentPath: string, 
  options: FileModularityValidatorOptions = {}
): Promise<ValidationResult & { fileResolution?: FileResolutionResult }> {
  const validator = createFileModularityValidator(options);
  return await validator.validate(documentPath, options);
}