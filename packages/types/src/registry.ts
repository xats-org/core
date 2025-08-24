/**
 * Registry system types for xats v0.5.0 advanced file modularity
 */

/**
 * Registry information metadata
 */
export interface RegistryInfo {
  /** Human-readable name of the registry */
  name: string;
  /** Description of the registry's purpose and content */
  description?: string;
  /** Base URL where the registry content is hosted */
  url: string;
  /** API version supported by this registry */
  apiVersion: string;
  /** List of registry maintainers */
  maintainers?: Maintainer[];
  /** Default license for content in this registry */
  license?: string;
  /** Public key for verifying registry content signatures (base64-encoded) */
  publicKey?: string;
  /** Trust level of this registry */
  trustLevel?: 'verified' | 'trusted' | 'community' | 'experimental';
  /** ISO 8601 timestamp when the registry was created */
  created?: string;
  /** ISO 8601 timestamp when the registry was last updated */
  updated?: string;
}

/**
 * Package metadata in a registry
 */
export interface PackageMetadata {
  /** Package name following reverse domain notation */
  name: string;
  /** Human-readable title of the package */
  title: string;
  /** Detailed description of the package content */
  description?: string;
  /** Available versions of this package */
  versions: Record<string, PackageVersion>;
  /** Latest stable version identifier */
  latest: string;
  /** Searchable tags for content discovery */
  tags?: string[];
  /** Content categories for organization */
  categories?: PackageCategory[];
  /** Package maintainers */
  maintainers?: Maintainer[];
  /** Package license (overrides registry default) */
  license?: string;
  /** Package homepage URL */
  homepage?: string;
  /** Source code repository information */
  repository?: Repository;
  /** ISO 8601 timestamp when the package was created */
  created?: string;
  /** ISO 8601 timestamp when the package was last updated */
  updated?: string;
  /** Total download count across all versions */
  downloadCount?: number;
}

/**
 * Content categories for package organization
 */
export type PackageCategory =
  | 'biology'
  | 'chemistry'
  | 'physics'
  | 'mathematics'
  | 'engineering'
  | 'computer-science'
  | 'medicine'
  | 'business'
  | 'economics'
  | 'psychology'
  | 'education'
  | 'literature'
  | 'history'
  | 'philosophy'
  | 'art'
  | 'language';

/**
 * A specific version of a package
 */
export interface PackageVersion {
  /** Semantic version number */
  version: string;
  /** Description of changes in this version */
  description?: string;
  /** Files included in this package version */
  files: PackageFile[];
  /** Package dependencies with version constraints */
  dependencies?: Record<string, string>;
  /** Peer dependencies that should be provided by the consuming project */
  peerDependencies?: Record<string, string>;
  /** Integrity hash for the package version (SHA-256) */
  integrity: string;
  /** Total size of the package in bytes */
  size: number;
  /** ISO 8601 timestamp when this version was published */
  published: string;
  /** Whether this version is deprecated */
  deprecated?: boolean;
  /** Message explaining why the version is deprecated */
  deprecationMessage?: string;
  /** Compatible xats engine versions */
  engines?: EngineRequirements;
  /** Distribution information for this version */
  dist?: DistributionInfo;
}

/**
 * A file within a package version
 */
export interface PackageFile {
  /** Relative path within the package */
  path: string;
  /** Type of file content */
  type: PackageFileType;
  /** File size in bytes */
  size: number;
  /** File integrity hash (SHA-256) */
  integrity: string;
  /** MIME type of the file */
  mimeType?: string;
  /** Text encoding (for text files) */
  encoding?: 'utf-8' | 'utf-16' | 'ascii' | 'iso-8859-1';
}

/**
 * Types of files in a package
 */
export type PackageFileType =
  | 'xats-document'
  | 'xats-chapter'
  | 'xats-section'
  | 'resource'
  | 'schema'
  | 'template'
  | 'metadata';

/**
 * A package or registry maintainer
 */
export interface Maintainer {
  /** Maintainer's name */
  name: string;
  /** Maintainer's email address */
  email?: string;
  /** Maintainer's website or profile URL */
  url?: string;
  /** Maintainer's organization */
  organization?: string;
}

/**
 * Source code repository information
 */
export interface Repository {
  /** Version control system type */
  type: 'git' | 'svn' | 'hg' | 'bzr';
  /** Repository URL */
  url: string;
  /** Subdirectory within the repository (for monorepos) */
  directory?: string;
}

/**
 * xats engine compatibility requirements
 */
export interface EngineRequirements {
  /** Compatible xats schema versions */
  xats?: string;
  /** Compatible Node.js versions (for tooling) */
  node?: string;
}

/**
 * Distribution and download information
 */
export interface DistributionInfo {
  /** URL to the package tarball */
  tarball: string;
  /** SHA-1 checksum of the tarball */
  shasum?: string;
  /** Integrity hash of the tarball */
  integrity: string;
  /** Total size when unpacked in bytes */
  unpackedSize?: number;
  /** Number of files in the package */
  fileCount?: number;
  /** npm-compatible distribution information */
  npm?: Record<string, unknown>;
}

/**
 * Complete registry configuration
 */
export interface RegistryConfig {
  /** Schema version */
  schemaVersion: '0.5.0';
  /** Information about the registry itself */
  registryInfo: RegistryInfo;
  /** Map of available packages in this registry */
  packages: Record<string, PackageMetadata>;
  /** Access control configuration for the registry */
  access?: AccessConfig;
}

/**
 * Access control configuration for the registry
 */
export interface AccessConfig {
  /** Whether the registry is publicly accessible */
  public?: boolean;
  /** Authentication requirements */
  authentication?: AuthenticationConfig;
  /** Permission-based access controls */
  permissions?: PermissionsConfig;
  /** Rate limiting configuration */
  rateLimit?: RateLimitConfig;
}

/**
 * Authentication configuration
 */
export interface AuthenticationConfig {
  /** Whether authentication is required */
  required?: boolean;
  /** Supported authentication methods */
  methods?: AuthenticationMethod[];
}

/**
 * Supported authentication methods
 */
export type AuthenticationMethod = 'token' | 'oauth' | 'saml' | 'ldap' | 'basic';

/**
 * Permission-based access controls
 */
export interface PermissionsConfig {
  /** Read permission requirements */
  read?: PermissionRule;
  /** Write permission requirements */
  write?: PermissionRule;
  /** Administrative permission requirements */
  admin?: PermissionRule;
}

/**
 * A permission rule for access control
 */
export interface PermissionRule {
  /** Required user roles */
  roles?: string[];
  /** Specific allowed users */
  users?: string[];
  /** Allowed organizations */
  organizations?: string[];
  /** Additional conditions (JSON Logic format) */
  conditions?: Record<string, unknown>;
}

/**
 * Rate limiting configuration
 */
export interface RateLimitConfig {
  /** Whether rate limiting is enabled */
  enabled?: boolean;
  /** Maximum requests per hour */
  requestsPerHour?: number;
  /** Maximum burst requests */
  burstLimit?: number;
}

// Cache-related types

/**
 * Overall caching strategy
 */
export type CacheStrategy = 'aggressive' | 'conservative' | 'adaptive' | 'custom';

/**
 * Multi-level cache configuration
 */
export interface CacheLevels {
  /** In-memory cache configuration */
  memory?: MemoryCacheConfig;
  /** Disk cache configuration */
  disk?: DiskCacheConfig;
  /** Network cache configuration (CDN/proxy) */
  network?: NetworkCacheConfig;
  /** Distributed cache configuration (Redis/Memcached) */
  distributed?: DistributedCacheConfig;
}

/**
 * In-memory cache configuration
 */
export interface MemoryCacheConfig {
  /** Whether memory caching is enabled */
  enabled?: boolean;
  /** Maximum memory cache size (e.g., '100MB', '1GB') */
  maxSize?: string;
  /** Maximum number of cached items */
  maxItems?: number;
  /** Default time-to-live (e.g., '1h', '30m', '60s') */
  ttl?: string;
  /** Cache eviction algorithm */
  algorithm?: 'lru' | 'lfu' | 'fifo' | 'random';
  /** Whether to compress cached content in memory */
  compressionEnabled?: boolean;
  /** Minimum size for compression (bytes) */
  compressionThreshold?: number;
}

/**
 * Disk cache configuration
 */
export interface DiskCacheConfig {
  /** Whether disk caching is enabled */
  enabled?: boolean;
  /** Cache directory path */
  path?: string;
  /** Maximum disk cache size (e.g., '1GB', '10GB') */
  maxSize?: string;
  /** Maximum number of cached files */
  maxFiles?: number;
  /** Default time-to-live for disk cache */
  ttl?: string;
  /** Whether to compress cached files */
  compressionEnabled?: boolean;
  /** Compression level (1-9) */
  compressionLevel?: number;
  /** Automatic cleanup configuration */
  cleanup?: CleanupConfig;
  /** Cache indexing for faster lookups */
  indexing?: IndexingConfig;
}

/**
 * Automatic cleanup configuration for disk cache
 */
export interface CleanupConfig {
  /** Whether automatic cleanup is enabled */
  enabled?: boolean;
  /** Cleanup interval */
  interval?: string;
  /** Maximum age for cached files */
  maxAge?: string;
  /** Disk space threshold for aggressive cleanup (0-1) */
  diskSpaceThreshold?: number;
}

/**
 * Cache indexing configuration
 */
export interface IndexingConfig {
  /** Whether indexing is enabled */
  enabled?: boolean;
  /** Path to the cache index file */
  indexPath?: string;
  /** Interval to rebuild the index */
  rebuildInterval?: string;
}

/**
 * Network cache configuration (CDN/proxy)
 */
export interface NetworkCacheConfig {
  /** Whether network caching is enabled */
  enabled?: boolean;
  /** CDN provider configuration */
  provider?: 'cloudflare' | 'aws-cloudfront' | 'fastly' | 'azure-cdn' | 'custom';
  /** CDN endpoint URLs */
  endpoints?: string[];
  /** Cache control headers */
  headers?: CacheHeaders;
  /** Cache purging configuration */
  purging?: PurgingConfig;
}

/**
 * Cache control headers configuration
 */
export interface CacheHeaders {
  /** Cache-Control max-age in seconds */
  maxAge?: number;
  /** Stale-while-revalidate time in seconds */
  staleWhileRevalidate?: number;
  /** Stale-if-error time in seconds */
  staleIfError?: number;
  /** Whether content is immutable */
  immutable?: boolean;
}

/**
 * Cache purging configuration
 */
export interface PurgingConfig {
  /** Whether automatic purging is enabled */
  enabled?: boolean;
  /** API key for purging operations */
  apiKey?: string;
  /** Webhook URL for purge notifications */
  webhookUrl?: string;
}

/**
 * Distributed cache configuration (Redis/Memcached)
 */
export interface DistributedCacheConfig {
  /** Whether distributed caching is enabled */
  enabled?: boolean;
  /** Distributed cache provider */
  provider?: 'redis' | 'memcached' | 'hazelcast';
  /** Connection configuration */
  connection?: ConnectionConfig;
  /** Data serialization format */
  serialization?: 'json' | 'msgpack' | 'protobuf';
  /** Compression settings for distributed cache */
  compression?: CompressionConfig;
}

/**
 * Connection configuration for distributed cache
 */
export interface ConnectionConfig {
  /** Cache server host */
  host?: string;
  /** Cache server port */
  port?: number;
  /** Authentication password */
  password?: string;
  /** Database number (Redis only) */
  database?: number;
  /** Cluster nodes for Redis cluster */
  cluster?: ClusterNode[];
}

/**
 * Redis cluster node configuration
 */
export interface ClusterNode {
  /** Node host */
  host: string;
  /** Node port */
  port: number;
}

/**
 * Compression configuration
 */
export interface CompressionConfig {
  /** Whether compression is enabled */
  enabled?: boolean;
  /** Compression algorithm */
  algorithm?: 'gzip' | 'lz4' | 'snappy';
  /** Minimum size for compression (bytes) */
  threshold?: number;
}

/**
 * Cache invalidation strategies
 */
export interface InvalidationStrategy {
  /** Primary invalidation strategy */
  strategy?: 'time-based' | 'dependency-based' | 'manual' | 'hybrid';
  /** Default TTL for time-based invalidation */
  timeBasedTtl?: string;
  /** Dependency-based invalidation settings */
  dependencyTracking?: DependencyTrackingConfig;
  /** Webhook-based invalidation */
  webhooks?: WebhookConfig[];
}

/**
 * Dependency tracking configuration
 */
export interface DependencyTrackingConfig {
  /** Whether dependency tracking is enabled */
  enabled?: boolean;
  /** Track file modification times */
  trackFileModification?: boolean;
  /** Track content hashes for changes */
  trackContentHash?: boolean;
  /** Invalidate dependent entries when dependencies change */
  cascadeInvalidation?: boolean;
}

/**
 * Webhook configuration for cache invalidation
 */
export interface WebhookConfig {
  /** Webhook URL */
  url: string;
  /** Webhook secret for verification */
  secret?: string;
  /** Events that trigger this webhook */
  events: WebhookEvent[];
}

/**
 * Webhook events
 */
export type WebhookEvent = 'cache-miss' | 'cache-hit' | 'cache-invalidate' | 'cache-expire';

/**
 * Complete cache configuration
 */
export interface CacheConfig {
  /** Schema version */
  schemaVersion: '0.5.0';
  /** Overall caching strategy */
  strategy: CacheStrategy;
  /** Multi-level cache configuration */
  levels: CacheLevels;
  /** Cache invalidation strategies */
  invalidation?: InvalidationStrategy;
  /** Performance monitoring and optimization settings */
  performance?: PerformanceConfig;
  /** Security settings for cached content */
  security?: SecurityConfig;
}

/**
 * Performance monitoring and optimization settings
 */
export interface PerformanceConfig {
  /** Performance monitoring settings */
  monitoring?: MonitoringConfig;
  /** Automatic optimization settings */
  optimization?: OptimizationConfig;
  /** Performance thresholds for alerts */
  thresholds?: ThresholdConfig;
}

/**
 * Performance monitoring configuration
 */
export interface MonitoringConfig {
  /** Whether performance monitoring is enabled */
  enabled?: boolean;
  /** Interval for collecting metrics */
  metricsInterval?: string;
  /** How long to retain performance history */
  historyRetention?: string;
}

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  /** Whether automatic optimization is enabled */
  enabled?: boolean;
  /** Automatically adjust cache sizes based on usage */
  adaptiveSizing?: boolean;
  /** Preload frequently accessed content */
  preloading?: boolean;
  /** Hit rate threshold for prefetching (0-1) */
  prefetchThreshold?: number;
}

/**
 * Performance threshold configuration
 */
export interface ThresholdConfig {
  /** Minimum acceptable cache hit rate (0-1) */
  hitRateMinimum?: number;
  /** Maximum acceptable response time (ms) */
  responseTimeMaximum?: number;
  /** Maximum acceptable memory usage (0-1) */
  memoryUsageMaximum?: number;
}

/**
 * Security settings for cached content
 */
export interface SecurityConfig {
  /** Encryption settings for sensitive cached content */
  encryption?: EncryptionConfig;
  /** Access control for cached content */
  accessControl?: AccessControlConfig;
  /** Content integrity verification */
  integrity?: IntegrityConfig;
}

/**
 * Encryption configuration
 */
export interface EncryptionConfig {
  /** Whether encryption is enabled */
  enabled?: boolean;
  /** Encryption algorithm */
  algorithm?: 'aes-256-gcm' | 'chacha20-poly1305';
  /** Key rotation interval */
  keyRotationInterval?: string;
}

/**
 * Access control configuration
 */
export interface AccessControlConfig {
  /** Whether access control is enabled */
  enabled?: boolean;
  /** Allowed origins for cache access */
  allowedOrigins?: string[];
  /** Whether authentication is required for cache access */
  requireAuthentication?: boolean;
}

/**
 * Content integrity verification
 */
export interface IntegrityConfig {
  /** Whether integrity verification is enabled */
  enabled?: boolean;
  /** Hash algorithm for integrity checking */
  algorithm?: 'sha256' | 'sha384' | 'sha512';
  /** Verify integrity when reading from cache */
  verifyOnRead?: boolean;
}

// Registry reference types

/**
 * Reference to content in a registry
 */
export interface RegistryReference {
  /** Registry protocol prefix (xats://) */
  protocol: 'xats';
  /** Registry name */
  registry: string;
  /** Package name */
  package: string;
  /** Package version (optional, defaults to latest) */
  version?: string | undefined;
  /** Path within the package (optional) */
  path?: string | undefined;
}

/**
 * Resolved registry reference with metadata
 */
export interface ResolvedRegistryReference extends RegistryReference {
  /** Resolved absolute URL */
  resolvedUrl: string;
  /** Package metadata */
  packageMetadata: PackageMetadata;
  /** Version metadata */
  versionMetadata: PackageVersion;
  /** File metadata (if path is specified) */
  fileMetadata?: PackageFile | undefined;
}

/**
 * Registry resolution options
 */
export interface RegistryResolutionOptions {
  /** Registry configurations */
  registries: RegistryConfig[];
  /** Cache configuration */
  cache?: CacheConfig;
  /** Timeout for registry operations (ms) */
  timeout?: number;
  /** Whether to verify package integrity */
  verifyIntegrity?: boolean;
  /** Whether to allow prerelease versions */
  allowPrerelease?: boolean;
}

/**
 * Registry resolution result
 */
export interface RegistryResolutionResult {
  /** Successfully resolved references */
  resolved: ResolvedRegistryReference[];
  /** Resolution errors */
  errors: RegistryResolutionError[];
  /** Resolution warnings */
  warnings: RegistryResolutionWarning[];
  /** Resolution statistics */
  stats: RegistryResolutionStats;
}

/**
 * Registry resolution error
 */
export interface RegistryResolutionError {
  /** Registry reference that failed */
  reference: string;
  /** Error message */
  error: string;
  /** Error code */
  code:
    | 'registry-not-found'
    | 'package-not-found'
    | 'version-not-found'
    | 'file-not-found'
    | 'integrity-mismatch'
    | 'network-error'
    | 'authentication-failed'
    | 'rate-limited'
    | 'timeout'
    | 'other';
}

/**
 * Registry resolution warning
 */
export interface RegistryResolutionWarning {
  /** Registry reference that generated the warning */
  reference: string;
  /** Warning message */
  warning: string;
  /** Warning code */
  code: string;
}

/**
 * Registry resolution statistics
 */
export interface RegistryResolutionStats {
  /** Total number of references processed */
  totalReferences: number;
  /** Number of successful resolutions */
  successful: number;
  /** Number of cache hits */
  cacheHits: number;
  /** Number of cache misses */
  cacheMisses: number;
  /** Total resolution time (ms) */
  totalTime: number;
  /** Average resolution time per reference (ms) */
  averageTime: number;
  /** Total data transferred (bytes) */
  totalBytes: number;
}

// Version resolution and dependency tracking

/**
 * Semantic version constraint
 */
export type VersionConstraint = string;

/**
 * Dependency graph node
 */
export interface DependencyNode {
  /** Package name */
  package: string;
  /** Resolved version */
  version: string;
  /** Dependencies of this package */
  dependencies: DependencyNode[];
  /** Whether this is a peer dependency */
  isPeerDependency?: boolean;
  /** Dependency depth in the graph */
  depth: number;
}

/**
 * Dependency resolution result
 */
export interface DependencyResolutionResult {
  /** Resolved dependency graph */
  dependencyGraph: DependencyNode;
  /** Flattened dependency list */
  flattenedDependencies: ResolvedDependency[];
  /** Dependency conflicts */
  conflicts: DependencyConflict[];
  /** Resolution errors */
  errors: DependencyResolutionError[];
}

/**
 * Resolved dependency
 */
export interface ResolvedDependency {
  /** Package name */
  package: string;
  /** Constraint from dependent */
  constraint: VersionConstraint;
  /** Resolved version */
  resolvedVersion: string;
  /** Source package that requested this dependency */
  requestedBy: string;
}

/**
 * Dependency conflict
 */
export interface DependencyConflict {
  /** Package name with conflict */
  package: string;
  /** Conflicting version constraints */
  constraints: Array<{
    constraint: VersionConstraint;
    requestedBy: string;
  }>;
  /** Suggested resolution */
  suggestedResolution?: string;
}

/**
 * Dependency resolution error
 */
export interface DependencyResolutionError {
  /** Package name that caused the error */
  package: string;
  /** Error message */
  error: string;
  /** Error code */
  code:
    | 'version-not-found'
    | 'circular-dependency'
    | 'conflicting-constraints'
    | 'peer-dependency-missing'
    | 'other';
}

// Lazy loading and streaming types

/**
 * Loading strategy for content
 */
export type LoadingStrategy = 'eager' | 'lazy' | 'streaming' | 'progressive';

/**
 * Lazy loading configuration
 */
export interface LazyLoadingConfig {
  /** Loading strategy */
  strategy: LoadingStrategy;
  /** Chunk size for progressive loading (bytes) */
  chunkSize?: number;
  /** Prefetch distance (number of chunks ahead) */
  prefetchDistance?: number;
  /** Whether to enable background loading */
  backgroundLoading?: boolean;
  /** Loading priority levels */
  priorities?: LoadingPriorities;
}

/**
 * Loading priorities for different content types
 */
export interface LoadingPriorities {
  /** Priority for critical content (visible above fold) */
  critical: number;
  /** Priority for important content (visible on scroll) */
  important: number;
  /** Priority for optional content (images, media) */
  optional: number;
  /** Priority for deferred content (below fold) */
  deferred: number;
}

/**
 * Streaming loader interface
 */
export interface StreamingLoader {
  /** Start streaming content */
  start(): Promise<void>;
  /** Pause streaming */
  pause(): void;
  /** Resume streaming */
  resume(): void;
  /** Stop streaming and cleanup */
  stop(): void;
  /** Get current loading progress (0-1) */
  getProgress(): number;
  /** Subscribe to loading events */
  on(event: LoadingEvent, callback: (data: unknown) => void): void;
}

/**
 * Loading events
 */
export type LoadingEvent =
  | 'start'
  | 'progress'
  | 'chunk'
  | 'complete'
  | 'error'
  | 'pause'
  | 'resume';

/**
 * Streaming chunk
 */
export interface StreamingChunk {
  /** Chunk sequence number */
  sequence: number;
  /** Chunk data */
  data: Uint8Array;
  /** Chunk metadata */
  metadata?: ChunkMetadata;
  /** Whether this is the final chunk */
  isLast: boolean;
}

/**
 * Chunk metadata
 */
export interface ChunkMetadata {
  /** Content type of this chunk */
  contentType: string;
  /** Encoding of this chunk */
  encoding?: string;
  /** Compression applied to this chunk */
  compression?: string;
  /** Chunk integrity hash */
  integrity?: string;
}
