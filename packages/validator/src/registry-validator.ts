/**
 * Registry validation logic for xats v0.5.0 advanced file modularity
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type {
  RegistryConfig,
  CacheConfig,
  RegistryReference,
  ResolvedRegistryReference,
  RegistryResolutionOptions,
  RegistryResolutionResult,
  RegistryResolutionError,
  RegistryResolutionWarning,
  DependencyResolutionResult,
  DependencyNode,
  VersionConstraint,
} from '@xats-org/types';

// Get the current directory for schema loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Registry validator class for validating registry configurations and references
 */
export class RegistryValidator {
  private ajv: Ajv;
  private registrySchema: any;
  private cacheSchema: any;

  constructor() {
    this.ajv = new Ajv({ 
      strict: false, 
      allErrors: true,
      verbose: true,
      validateFormats: true,
    });
    addFormats(this.ajv);
    
    this.loadSchemas();
  }

  /**
   * Load JSON schemas from the schema package
   */
  private loadSchemas(): void {
    try {
      // Try to load from the monorepo structure
      const schemaBasePath = join(__dirname, '../../schema/schemas/0.5.0/registry');
      
      this.registrySchema = JSON.parse(
        readFileSync(join(schemaBasePath, 'registry.schema.json'), 'utf8')
      );
      
      this.cacheSchema = JSON.parse(
        readFileSync(join(schemaBasePath, 'cache.schema.json'), 'utf8')
      );

      // Compile schemas
      this.ajv.addSchema(this.registrySchema, 'registry');
      this.ajv.addSchema(this.cacheSchema, 'cache');
    } catch (error) {
      throw new Error(`Failed to load registry schemas: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Validate a registry configuration against the schema
   */
  validateRegistry(config: unknown): { valid: boolean; errors: string[] } {
    const validate = this.ajv.getSchema('registry');
    if (!validate) {
      return { valid: false, errors: ['Registry schema not found'] };
    }

    const valid = validate(config);
    const errors = validate.errors ? 
      validate.errors.map(error => `${error.instancePath}: ${error.message}`) : 
      [];

    return { valid: !!valid, errors };
  }

  /**
   * Validate a cache configuration against the schema
   */
  validateCache(config: unknown): { valid: boolean; errors: string[] } {
    const validate = this.ajv.getSchema('cache');
    if (!validate) {
      return { valid: false, errors: ['Cache schema not found'] };
    }

    const valid = validate(config);
    const errors = validate.errors ? 
      validate.errors.map(error => `${error.instancePath}: ${error.message}`) : 
      [];

    return { valid: !!valid, errors };
  }

  /**
   * Parse a registry reference string into components
   */
  parseRegistryReference(reference: string): RegistryReference | null {
    // Expected format: xats://registry-name/package-name[@version][/path]
    // Package name can include namespaces with forward slashes
    const match = reference.match(/^xats:\/\/([^\/]+)\/([^@]+?)(?:@([^\/]+))?(?:\/(.+))?$/);
    
    if (!match) {
      return null;
    }

    const [, registry, packageName, version, path] = match;
    
    return {
      protocol: 'xats',
      registry: registry!,
      package: packageName!,
      version: version || undefined,
      path: path || undefined,
    };
  }

  /**
   * Validate a registry reference format
   */
  validateRegistryReference(reference: string): { valid: boolean; errors: string[] } {
    const parsed = this.parseRegistryReference(reference);
    const errors: string[] = [];

    if (!parsed) {
      errors.push('Invalid registry reference format. Expected: xats://registry/package[@version][/path]');
      return { valid: false, errors };
    }

    // Validate registry name format
    if (!/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(parsed.registry)) {
      errors.push('Registry name must contain only lowercase letters, numbers, underscores, and hyphens');
    }

    // Validate package name format
    if (!/^[a-z0-9]([a-z0-9_-]*[a-z0-9])?([\/][a-z0-9]([a-z0-9_-]*[a-z0-9])?)*$/.test(parsed.package)) {
      errors.push('Package name must follow reverse domain notation (e.g., org/package)');
    }

    // Validate version format (if provided)
    if (parsed.version && !/^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?$/.test(parsed.version)) {
      errors.push('Version must follow semantic versioning format (e.g., 1.2.3, 1.0.0-alpha.1)');
    }

    // Validate path format (if provided)
    if (parsed.path && !/^[^\/].*$/.test(parsed.path)) {
      errors.push('Path must not start with a forward slash');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate semantic version constraint
   */
  validateVersionConstraint(constraint: VersionConstraint): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Allow empty constraint (means any version)
    if (!constraint || constraint.trim() === '') {
      return { valid: true, errors: [] };
    }

    // Check for valid constraint operators and version format
    const constraintPattern = /^(\^|~|>=|<=|>|<|=)?\d+\.\d+\.\d+(-[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*)?$/;
    
    if (!constraintPattern.test(constraint)) {
      errors.push('Version constraint must use valid operators (^, ~, >=, <=, >, <, =) followed by semantic version');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate integrity hash format
   */
  validateIntegrityHash(hash: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!hash || hash.trim() === '') {
      errors.push('Integrity hash is required');
      return { valid: false, errors };
    }

    const pattern = algorithm === 'sha256' ? 
      /^sha256-[A-Za-z0-9+\/]+=*$/ : 
      algorithm === 'sha384' ?
      /^sha384-[A-Za-z0-9+\/]+=*$/ :
      /^sha512-[A-Za-z0-9+\/]+=*$/;

    if (!pattern.test(hash)) {
      errors.push(`Integrity hash must be ${algorithm} format: ${algorithm}-<base64-hash>`);
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate package file MIME type
   */
  validateMimeType(mimeType: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!mimeType) {
      return { valid: true, errors: [] }; // MIME type is optional
    }

    const mimePattern = /^[a-z0-9][a-z0-9!#$&\-\^_]*\/[a-z0-9][a-z0-9!#$&\-\^_.]*$/;
    
    if (!mimePattern.test(mimeType)) {
      errors.push('Invalid MIME type format');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate registry configuration with additional business rules
   */
  validateRegistryConfig(config: RegistryConfig): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // First validate against JSON schema
    const schemaValidation = this.validateRegistry(config);
    errors.push(...schemaValidation.errors);

    if (schemaValidation.valid) {
      // Additional business rule validations
      
      // Validate package names are unique
      const packageNames = Object.keys(config.packages);
      const uniqueNames = new Set(packageNames);
      if (packageNames.length !== uniqueNames.size) {
        errors.push('Duplicate package names found in registry');
      }

      // Validate package versions and dependencies
      for (const [packageName, packageMetadata] of Object.entries(config.packages)) {
        // Check if latest version exists
        if (!packageMetadata.versions[packageMetadata.latest]) {
          errors.push(`Package ${packageName}: latest version ${packageMetadata.latest} not found in versions`);
        }

        // Validate each version
        for (const [versionNumber, versionData] of Object.entries(packageMetadata.versions)) {
          // Check version number matches
          if (versionData.version !== versionNumber) {
            errors.push(`Package ${packageName} version ${versionNumber}: version field mismatch`);
          }

          // Validate file integrity hashes
          for (const file of versionData.files) {
            const integrityValidation = this.validateIntegrityHash(file.integrity);
            if (!integrityValidation.valid) {
              errors.push(`Package ${packageName} version ${versionNumber} file ${file.path}: ${integrityValidation.errors.join(', ')}`);
            }

            // Validate MIME type
            if (file.mimeType) {
              const mimeValidation = this.validateMimeType(file.mimeType);
              if (!mimeValidation.valid) {
                errors.push(`Package ${packageName} version ${versionNumber} file ${file.path}: ${mimeValidation.errors.join(', ')}`);
              }
            }
          }

          // Validate dependencies
          if (versionData.dependencies) {
            for (const [depName, constraint] of Object.entries(versionData.dependencies)) {
              const constraintValidation = this.validateVersionConstraint(constraint);
              if (!constraintValidation.valid) {
                errors.push(`Package ${packageName} version ${versionNumber} dependency ${depName}: ${constraintValidation.errors.join(', ')}`);
              }
            }
          }

          // Check for deprecated versions without messages
          if (versionData.deprecated && !versionData.deprecationMessage) {
            warnings.push(`Package ${packageName} version ${versionNumber}: deprecated but no deprecation message provided`);
          }
        }
      }

      // Validate registry info
      if (config.registryInfo.trustLevel === 'verified' && !config.registryInfo.publicKey) {
        errors.push('Verified registries must provide a public key for content verification');
      }

      // Warn about potential security issues
      if (config.access?.public === true && config.access?.authentication?.required === false) {
        warnings.push('Public registry without authentication may be vulnerable to unauthorized modifications');
      }
    }

    return { 
      valid: errors.length === 0, 
      errors, 
      warnings 
    };
  }

  /**
   * Validate cache configuration with performance considerations
   */
  validateCacheConfig(config: CacheConfig): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // First validate against JSON schema
    const schemaValidation = this.validateCache(config);
    errors.push(...schemaValidation.errors);

    if (schemaValidation.valid) {
      // Additional validation for cache configuration
      
      // Memory cache validation
      if (config.levels.memory?.enabled) {
        if (config.levels.memory.maxSize && config.levels.memory.maxItems) {
          warnings.push('Both maxSize and maxItems specified for memory cache; maxSize will take precedence');
        }

        if (config.levels.memory.compressionEnabled && !config.levels.memory.compressionThreshold) {
          warnings.push('Memory compression enabled but no threshold specified; using default 1KB');
        }
      }

      // Disk cache validation
      if (config.levels.disk?.enabled) {
        if (!config.levels.disk.path) {
          errors.push('Disk cache enabled but no path specified');
        }

        if (config.levels.disk.compressionLevel && !config.levels.disk.compressionEnabled) {
          warnings.push('Disk compression level specified but compression not enabled');
        }
      }

      // Distributed cache validation
      if (config.levels.distributed?.enabled) {
        if (!config.levels.distributed.provider) {
          errors.push('Distributed cache enabled but no provider specified');
        }

        if (!config.levels.distributed.connection?.host) {
          errors.push('Distributed cache enabled but no host specified');
        }

        if (config.levels.distributed.provider === 'redis' && config.levels.distributed.connection?.cluster) {
          if (config.levels.distributed.connection.cluster.length < 3) {
            warnings.push('Redis cluster should have at least 3 nodes for proper failover');
          }
        }
      }

      // Performance threshold validation
      if (config.performance?.thresholds) {
        const thresholds = config.performance.thresholds;
        
        if (thresholds.hitRateMinimum !== undefined && (thresholds.hitRateMinimum < 0 || thresholds.hitRateMinimum > 1)) {
          errors.push('Hit rate minimum must be between 0 and 1');
        }

        if (thresholds.memoryUsageMaximum !== undefined && (thresholds.memoryUsageMaximum < 0 || thresholds.memoryUsageMaximum > 1)) {
          errors.push('Memory usage maximum must be between 0 and 1');
        }

        if (thresholds.responseTimeMaximum !== undefined && thresholds.responseTimeMaximum <= 0) {
          errors.push('Response time maximum must be positive');
        }
      }

      // Security validation
      if (config.security?.encryption?.enabled && !config.security.encryption.algorithm) {
        errors.push('Encryption enabled but no algorithm specified');
      }

      // Strategy consistency validation
      if (config.strategy === 'aggressive') {
        if (!config.levels.memory?.enabled && !config.levels.disk?.enabled) {
          warnings.push('Aggressive caching strategy but no memory or disk cache enabled');
        }
      }

      if (config.strategy === 'conservative') {
        if (config.performance?.optimization?.preloading) {
          warnings.push('Conservative caching with preloading may be counterproductive');
        }
      }
    }

    return { 
      valid: errors.length === 0, 
      errors, 
      warnings 
    };
  }
}

/**
 * Registry resolver class for resolving registry references
 */
export class RegistryResolver {
  private validator: RegistryValidator;

  constructor() {
    this.validator = new RegistryValidator();
  }

  /**
   * Resolve a single registry reference
   */
  async resolveReference(
    reference: string,
    options: RegistryResolutionOptions
  ): Promise<ResolvedRegistryReference | null> {
    // Parse the reference
    const parsed = this.validator.parseRegistryReference(reference);
    if (!parsed) {
      return null;
    }

    // Find the appropriate registry
    const registry = options.registries.find(r => r.registryInfo.name === parsed.registry);
    if (!registry) {
      throw new Error(`Registry '${parsed.registry}' not found`);
    }

    // Find the package
    const packageMetadata = registry.packages[parsed.package];
    if (!packageMetadata) {
      throw new Error(`Package '${parsed.package}' not found in registry '${parsed.registry}'`);
    }

    // Resolve version (use latest if not specified)
    const targetVersion = parsed.version || packageMetadata.latest;
    const versionMetadata = packageMetadata.versions[targetVersion];
    if (!versionMetadata) {
      throw new Error(`Version '${targetVersion}' not found for package '${parsed.package}'`);
    }

    // Find file metadata if path is specified
    let fileMetadata;
    if (parsed.path) {
      fileMetadata = versionMetadata.files.find(f => f.path === parsed.path);
      if (!fileMetadata) {
        throw new Error(`File '${parsed.path}' not found in package '${parsed.package}' version '${targetVersion}'`);
      }
    }

    // Construct resolved URL
    const baseUrl = registry.registryInfo.url.endsWith('/') ? 
      registry.registryInfo.url.slice(0, -1) : 
      registry.registryInfo.url;
    
    const resolvedUrl = parsed.path ?
      `${baseUrl}/${parsed.package}/${targetVersion}/${parsed.path}` :
      `${baseUrl}/${parsed.package}/${targetVersion}`;

    const result: ResolvedRegistryReference = {
      ...parsed,
      version: targetVersion,
      resolvedUrl,
      packageMetadata,
      versionMetadata,
    };

    if (fileMetadata) {
      result.fileMetadata = fileMetadata;
    }

    return result;
  }

  /**
   * Resolve multiple registry references
   */
  async resolveReferences(
    references: string[],
    options: RegistryResolutionOptions
  ): Promise<RegistryResolutionResult> {
    const resolved: ResolvedRegistryReference[] = [];
    const errors: RegistryResolutionError[] = [];
    const warnings: RegistryResolutionWarning[] = [];
    const startTime = Date.now();
    let cacheHits = 0;
    let cacheMisses = 0;
    let totalBytes = 0;

    for (const reference of references) {
      try {
        const resolvedRef = await this.resolveReference(reference, options);
        if (resolvedRef) {
          resolved.push(resolvedRef);
          // TODO: Implement actual cache tracking
          cacheMisses++;
          totalBytes += resolvedRef.versionMetadata.size;
        }
      } catch (error) {
        errors.push({
          reference,
          error: error instanceof Error ? error.message : String(error),
          code: this.categorizeError(error instanceof Error ? error.message : String(error)),
        });
      }
    }

    const totalTime = Date.now() - startTime;

    return {
      resolved,
      errors,
      warnings,
      stats: {
        totalReferences: references.length,
        successful: resolved.length,
        cacheHits,
        cacheMisses,
        totalTime,
        averageTime: totalTime / Math.max(references.length, 1),
        totalBytes,
      },
    };
  }

  /**
   * Categorize errors for better error handling
   */
  private categorizeError(errorMessage: string): RegistryResolutionError['code'] {
    if (errorMessage.includes('Registry') && errorMessage.includes('not found')) {
      return 'registry-not-found';
    }
    if (errorMessage.includes('Package') && errorMessage.includes('not found')) {
      return 'package-not-found';
    }
    if (errorMessage.includes('Version') && errorMessage.includes('not found')) {
      return 'version-not-found';
    }
    if (errorMessage.includes('File') && errorMessage.includes('not found')) {
      return 'file-not-found';
    }
    if (errorMessage.includes('integrity') || errorMessage.includes('checksum')) {
      return 'integrity-mismatch';
    }
    if (errorMessage.includes('timeout')) {
      return 'timeout';
    }
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'network-error';
    }
    if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
      return 'authentication-failed';
    }
    if (errorMessage.includes('rate') && errorMessage.includes('limit')) {
      return 'rate-limited';
    }
    return 'other';
  }
}

/**
 * Dependency resolver for handling package dependencies
 */
export class DependencyResolver {
  private validator: RegistryValidator;

  constructor() {
    this.validator = new RegistryValidator();
  }

  /**
   * Resolve dependencies for a package
   */
  async resolveDependencies(
    packageName: string,
    version: string,
    registries: RegistryConfig[],
    visited: Set<string> = new Set()
  ): Promise<DependencyResolutionResult> {
    const errors: any[] = [];
    const conflicts: any[] = [];

    // Check for circular dependencies
    const packageKey = `${packageName}@${version}`;
    if (visited.has(packageKey)) {
      errors.push({
        package: packageName,
        error: `Circular dependency detected: ${Array.from(visited).join(' -> ')} -> ${packageKey}`,
        code: 'circular-dependency',
      });
      return { dependencyGraph: null as any, flattenedDependencies: [], conflicts, errors };
    }

    visited.add(packageKey);

    // Find the package in registries
    let packageMetadata;
    let versionMetadata;
    
    for (const registry of registries) {
      packageMetadata = registry.packages[packageName];
      if (packageMetadata) {
        versionMetadata = packageMetadata.versions[version];
        if (versionMetadata) break;
      }
    }

    if (!packageMetadata || !versionMetadata) {
      errors.push({
        package: packageName,
        error: `Package ${packageName}@${version} not found in any registry`,
        code: 'version-not-found',
      });
      return { dependencyGraph: null as any, flattenedDependencies: [], conflicts, errors };
    }

    // Build dependency tree
    const dependencyNodes: DependencyNode[] = [];
    const flattenedDependencies: any[] = [];

    if (versionMetadata.dependencies) {
      for (const [depName, constraint] of Object.entries(versionMetadata.dependencies)) {
        // Resolve version constraint to actual version
        const resolvedVersion = this.resolveVersionConstraint(depName, constraint, registries);
        
        if (resolvedVersion) {
          // Recursively resolve dependencies
          const depResult = await this.resolveDependencies(depName, resolvedVersion, registries, new Set(visited));
          
          errors.push(...depResult.errors);
          conflicts.push(...depResult.conflicts);
          
          if (depResult.dependencyGraph) {
            dependencyNodes.push(depResult.dependencyGraph);
          }

          flattenedDependencies.push({
            package: depName,
            constraint,
            resolvedVersion,
            requestedBy: packageName,
          });
          
          flattenedDependencies.push(...depResult.flattenedDependencies);
        } else {
          errors.push({
            package: depName,
            error: `Cannot resolve version constraint '${constraint}' for package '${depName}'`,
            code: 'version-not-found',
          });
        }
      }
    }

    const dependencyGraph: DependencyNode = {
      package: packageName,
      version,
      dependencies: dependencyNodes,
      depth: visited.size - 1,
    };

    visited.delete(packageKey);

    return {
      dependencyGraph,
      flattenedDependencies,
      conflicts,
      errors,
    };
  }

  /**
   * Resolve a version constraint to an actual version
   */
  private resolveVersionConstraint(packageName: string, constraint: string, registries: RegistryConfig[]): string | null {
    // Find all available versions for the package
    const availableVersions: string[] = [];
    
    for (const registry of registries) {
      const packageMetadata = registry.packages[packageName];
      if (packageMetadata) {
        availableVersions.push(...Object.keys(packageMetadata.versions));
      }
    }

    if (availableVersions.length === 0) {
      return null;
    }

    // Sort versions in descending order (latest first)
    const sortedVersions = availableVersions.sort((a, b) => this.compareVersions(b, a));

    // Simple constraint resolution (could be enhanced with semver library)
    if (constraint.startsWith('^')) {
      // Compatible within same major version
      const targetVersion = constraint.slice(1);
      const [major] = targetVersion.split('.');
      return sortedVersions.find(v => v.startsWith(`${major}.`)) || null;
    } else if (constraint.startsWith('~')) {
      // Compatible within same major.minor version
      const targetVersion = constraint.slice(1);
      const [major, minor] = targetVersion.split('.');
      return sortedVersions.find(v => v.startsWith(`${major}.${minor}.`)) || null;
    } else if (constraint.startsWith('>=')) {
      // Greater than or equal
      const targetVersion = constraint.slice(2);
      return sortedVersions.find(v => this.compareVersions(v, targetVersion) >= 0) || null;
    } else {
      // Exact match or latest
      return sortedVersions.includes(constraint) ? constraint : (sortedVersions[0] || null);
    }
  }

  /**
   * Compare two semantic versions
   */
  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart > bPart) return 1;
      if (aPart < bPart) return -1;
    }

    return 0;
  }
}

// Export instances for convenience
export const registryValidator = new RegistryValidator();
export const registryResolver = new RegistryResolver();
export const dependencyResolver = new DependencyResolver();