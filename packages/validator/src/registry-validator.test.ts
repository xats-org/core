/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { RegistryValidator, RegistryResolver, DependencyResolver } from './registry-validator.js';

import type { RegistryConfig, CacheConfig, RegistryResolutionOptions } from '@xats-org/types';

describe('RegistryValidator', () => {
  let validator: RegistryValidator;

  beforeEach(() => {
    validator = new RegistryValidator();
  });

  describe('parseRegistryReference', () => {
    it('should parse valid registry references', () => {
      const ref = 'xats://biology-commons/cell-diagrams@1.0.0/diagrams/prokaryotic.json';
      const parsed = validator.parseRegistryReference(ref);

      expect(parsed).toEqual({
        protocol: 'xats',
        registry: 'biology-commons',
        package: 'cell-diagrams',
        version: '1.0.0',
        path: 'diagrams/prokaryotic.json',
      });
    });

    it('should parse reference without version', () => {
      const ref = 'xats://biology-commons/cell-diagrams';
      const parsed = validator.parseRegistryReference(ref);

      expect(parsed).toEqual({
        protocol: 'xats',
        registry: 'biology-commons',
        package: 'cell-diagrams',
        version: undefined,
        path: undefined,
      });
    });

    it('should parse reference with namespace', () => {
      const ref = 'xats://biology-commons/org/cell-biology/diagrams@1.0.0';
      const parsed = validator.parseRegistryReference(ref);

      expect(parsed).toEqual({
        protocol: 'xats',
        registry: 'biology-commons',
        package: 'org/cell-biology/diagrams',
        version: '1.0.0',
        path: undefined,
      });
    });

    it('should return null for invalid references', () => {
      const invalidRefs = [
        'https://example.com/package',
        'xats:/biology-commons/package',
        'xats://registry/',
        'not-a-reference',
      ];

      for (const ref of invalidRefs) {
        expect(validator.parseRegistryReference(ref)).toBeNull();
      }
    });
  });

  describe('validateRegistryReference', () => {
    it('should validate correct registry references', () => {
      const validRefs = [
        'xats://biology-commons/cell-diagrams',
        'xats://biology-commons/cell-diagrams@1.0.0',
        'xats://biology-commons/org/cell-diagrams@1.0.0',
        'xats://biology-commons/cell-diagrams@1.0.0-alpha.1',
        'xats://biology-commons/cell-diagrams@1.0.0/path/to/file.json',
      ];

      for (const ref of validRefs) {
        const result = validator.validateRegistryReference(ref);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it('should reject invalid registry references', () => {
      const invalidRefs = [
        'xats://biology-commons',
        'xats://INVALID-REGISTRY/package',
        'xats://registry/package@invalid-version',
        'xats://registry/package//invalid-path',
      ];

      for (const ref of invalidRefs) {
        const result = validator.validateRegistryReference(ref);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateVersionConstraint', () => {
    it('should validate semantic version constraints', () => {
      const validConstraints = [
        '',
        '1.0.0',
        '^1.0.0',
        '~1.2.0',
        '>=1.0.0',
        '<=2.0.0',
        '>0.9.0',
        '<3.0.0',
        '=1.5.0',
        '1.0.0-alpha.1',
        '^2.1.0-beta.2',
      ];

      for (const constraint of validConstraints) {
        const result = validator.validateVersionConstraint(constraint);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it('should reject invalid version constraints', () => {
      const invalidConstraints = ['invalid', '1.0', 'v1.0.0', '>=1.0', '1.0.0.0', '1.0.0-'];

      for (const constraint of invalidConstraints) {
        const result = validator.validateVersionConstraint(constraint);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateIntegrityHash', () => {
    it('should validate SHA-256 hashes', () => {
      const validHashes = [
        'sha256-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz567890abcdef12',
        'sha256-ABCD1234EFGH5678IJKL9012MNOP3456QRST7890UVWX1234YZ567890ABCDEF12',
        'sha256-aBcD1234eFgH5678iJkL9012mNoP3456qRsT7890uVwX1234yZ567890aBcDeF12',
      ];

      for (const hash of validHashes) {
        const result = validator.validateIntegrityHash(hash);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it('should reject invalid integrity hashes', () => {
      const invalidHashes = [
        '',
        'sha256-invalid',
        'md5-abcd1234',
        'abcd1234efgh5678',
        'sha256-',
        'sha256-abcd!@#$',
      ];

      for (const hash of invalidHashes) {
        const result = validator.validateIntegrityHash(hash);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateMimeType', () => {
    it('should validate correct MIME types', () => {
      const validMimeTypes = [
        'application/json',
        'text/plain',
        'image/png',
        'image/svg-xml',
        'application/vnd.api-json',
        'text/html',
      ];

      for (const mimeType of validMimeTypes) {
        const result = validator.validateMimeType(mimeType);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      }
    });

    it('should accept empty MIME type', () => {
      const result = validator.validateMimeType('');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid MIME types', () => {
      const invalidMimeTypes = ['invalid', 'text/', '/json', 'text//json', 'TEXT/PLAIN'];

      for (const mimeType of invalidMimeTypes) {
        const result = validator.validateMimeType(mimeType);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('validateRegistryConfig', () => {
    it('should validate a complete registry configuration', () => {
      const config: RegistryConfig = {
        schemaVersion: '0.5.0',
        registryInfo: {
          name: 'test-registry',
          url: 'https://registry.example.com/',
          apiVersion: '1.0.0',
          trustLevel: 'community',
        },
        packages: {
          'test/package': {
            name: 'test/package',
            title: 'Test Package',
            versions: {
              '1.0.0': {
                version: '1.0.0',
                files: [
                  {
                    path: 'index.json',
                    type: 'xats-document',
                    size: 1024,
                    integrity:
                      'sha256-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz567890abcdef12',
                  },
                ],
                integrity:
                  'sha256-1234abcd5678efgh9012ijkl3456mnop7890qrst1234uvwx5678yz9012abcdef',
                size: 1024,
                published: '2024-01-01T00:00:00Z',
              },
            },
            latest: '1.0.0',
          },
        },
      };

      const result = validator.validateRegistryConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing latest version', () => {
      const config: RegistryConfig = {
        schemaVersion: '0.5.0',
        registryInfo: {
          name: 'test-registry',
          url: 'https://registry.example.com/',
          apiVersion: '1.0.0',
        },
        packages: {
          'test/package': {
            name: 'test/package',
            title: 'Test Package',
            versions: {
              '1.0.0': {
                version: '1.0.0',
                files: [
                  {
                    path: 'index.json',
                    type: 'xats-document',
                    size: 1024,
                    integrity:
                      'sha256-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz567890abcdef12',
                  },
                ],
                integrity:
                  'sha256-1234abcd5678efgh9012ijkl3456mnop7890qrst1234uvwx5678yz9012abcdef',
                size: 1024,
                published: '2024-01-01T00:00:00Z',
              },
            },
            latest: '2.0.0', // This version doesn't exist
          },
        },
      };

      const result = validator.validateRegistryConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('latest version'))).toBe(true);
    });
  });

  describe('validateCacheConfig', () => {
    it('should validate a complete cache configuration', () => {
      const config: CacheConfig = {
        schemaVersion: '0.5.0',
        strategy: 'adaptive',
        levels: {
          memory: {
            enabled: true,
            maxSize: '100MB',
            ttl: '1h',
            algorithm: 'lru',
          },
          disk: {
            enabled: true,
            path: '/tmp/cache',
            maxSize: '1GB',
            ttl: '24h',
            compressionEnabled: true,
          },
        },
      };

      const result = validator.validateCacheConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing disk path when disk cache is enabled', () => {
      const config: CacheConfig = {
        schemaVersion: '0.5.0',
        strategy: 'adaptive',
        levels: {
          disk: {
            enabled: true,
            // Missing path
            maxSize: '1GB',
            ttl: '24h',
          },
        },
      };

      const result = validator.validateCacheConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('path'))).toBe(true);
    });

    it('should warn about conflicting memory cache settings', () => {
      const config: CacheConfig = {
        schemaVersion: '0.5.0',
        strategy: 'adaptive',
        levels: {
          memory: {
            enabled: true,
            maxSize: '100MB',
            maxItems: 1000, // Both maxSize and maxItems specified
            ttl: '1h',
          },
        },
      };

      const result = validator.validateCacheConfig(config);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.includes('maxSize and maxItems'))).toBe(true);
    });
  });
});

describe('RegistryResolver', () => {
  let resolver: RegistryResolver;
  let mockRegistry: RegistryConfig;

  beforeEach(() => {
    resolver = new RegistryResolver();
    mockRegistry = {
      schemaVersion: '0.5.0',
      registryInfo: {
        name: 'test-registry',
        url: 'https://registry.example.com',
        apiVersion: '1.0.0',
      },
      packages: {
        'test/package': {
          name: 'test/package',
          title: 'Test Package',
          versions: {
            '1.0.0': {
              version: '1.0.0',
              files: [
                {
                  path: 'index.json',
                  type: 'xats-document',
                  size: 1024,
                  integrity:
                    'sha256-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz567890abcdef12',
                },
              ],
              integrity: 'sha256-1234abcd5678efgh9012ijkl3456mnop7890qrst1234uvwx5678yz9012abcdef',
              size: 1024,
              published: '2024-01-01T00:00:00Z',
            },
          },
          latest: '1.0.0',
        },
      },
    };
  });

  describe('resolveReference', () => {
    it('should resolve valid registry reference', () => {
      const options: RegistryResolutionOptions = {
        registries: [mockRegistry],
      };

      const result = resolver.resolveReference('xats://test-registry/test/package@1.0.0', options);

      expect(result).toBeDefined();
      if (result) {
        expect(result.registry).toBe('test-registry');
        expect(result.package).toBe('test/package');
        expect(result.version).toBe('1.0.0');
        expect(result.resolvedUrl).toBe('https://registry.example.com/test/package/1.0.0');
      }
    });

    it('should resolve reference without explicit version to latest', () => {
      const options: RegistryResolutionOptions = {
        registries: [mockRegistry],
      };

      const result = resolver.resolveReference('xats://test-registry/test/package', options);

      expect(result).toBeDefined();
      if (result) {
        expect(result.version).toBe('1.0.0'); // Should resolve to latest
      }
    });

    it('should throw error for unknown registry', () => {
      const options: RegistryResolutionOptions = {
        registries: [mockRegistry],
      };

      expect(() =>
        resolver.resolveReference('xats://unknown-registry/test/package', options)
      ).toThrow("Registry 'unknown-registry' not found");
    });

    it('should throw error for unknown package', () => {
      const options: RegistryResolutionOptions = {
        registries: [mockRegistry],
      };

      expect(() =>
        resolver.resolveReference('xats://test-registry/unknown/package', options)
      ).toThrow("Package 'unknown/package' not found");
    });
  });

  describe('resolveReferences', () => {
    it('should resolve multiple references', () => {
      const options: RegistryResolutionOptions = {
        registries: [mockRegistry],
      };

      const result = resolver.resolveReferences(
        ['xats://test-registry/test/package@1.0.0', 'xats://test-registry/test/package'],
        options
      );

      expect(result.resolved).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.stats.successful).toBe(2);
    });

    it('should handle mix of valid and invalid references', () => {
      const options: RegistryResolutionOptions = {
        registries: [mockRegistry],
      };

      const result = resolver.resolveReferences(
        [
          'xats://test-registry/test/package@1.0.0',
          'xats://unknown-registry/test/package',
          'xats://test-registry/unknown/package',
        ],
        options
      );

      expect(result.resolved).toHaveLength(1);
      expect(result.errors).toHaveLength(2);
      expect(result.stats.successful).toBe(1);
    });
  });
});

describe('DependencyResolver', () => {
  let resolver: DependencyResolver;
  let mockRegistries: RegistryConfig[];

  beforeEach(() => {
    resolver = new DependencyResolver();
    mockRegistries = [
      {
        schemaVersion: '0.5.0',
        registryInfo: {
          name: 'test-registry',
          url: 'https://registry.example.com',
          apiVersion: '1.0.0',
        },
        packages: {
          'package-a': {
            name: 'package-a',
            title: 'Package A',
            versions: {
              '1.0.0': {
                version: '1.0.0',
                files: [],
                integrity: 'sha256-1234',
                size: 1024,
                published: '2024-01-01T00:00:00Z',
                dependencies: {
                  'package-b': '^1.0.0',
                },
              },
            },
            latest: '1.0.0',
          },
          'package-b': {
            name: 'package-b',
            title: 'Package B',
            versions: {
              '1.0.0': {
                version: '1.0.0',
                files: [],
                integrity: 'sha256-5678',
                size: 512,
                published: '2024-01-01T00:00:00Z',
              },
              '1.1.0': {
                version: '1.1.0',
                files: [],
                integrity: 'sha256-9012',
                size: 768,
                published: '2024-02-01T00:00:00Z',
              },
            },
            latest: '1.1.0',
          },
        },
      },
    ];
  });

  describe('resolveDependencies', () => {
    it('should resolve package dependencies', async () => {
      const result = await resolver.resolveDependencies('package-a', '1.0.0', mockRegistries);

      expect(result.errors).toHaveLength(0);
      expect(result.dependencyGraph).toBeDefined();
      if (result.dependencyGraph) {
        expect(result.dependencyGraph.package).toBe('package-a');
        expect(result.dependencyGraph.dependencies).toHaveLength(1);
        if (result.dependencyGraph.dependencies[0]) {
          expect(result.dependencyGraph.dependencies[0].package).toBe('package-b');
        }
      }
      expect(result.flattenedDependencies).toHaveLength(1);
    });

    it('should detect circular dependencies', async () => {
      // Add circular dependency
      if (mockRegistries[0]?.packages['package-b']?.versions['1.1.0']) {
        mockRegistries[0].packages['package-b'].versions['1.1.0'].dependencies = {
          'package-a': '^1.0.0',
        };
      }

      const result = await resolver.resolveDependencies('package-a', '1.0.0', mockRegistries);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.code === 'circular-dependency')).toBe(true);
    });

    it('should handle missing dependencies', async () => {
      // Add dependency to non-existent package
      if (mockRegistries[0]?.packages['package-a']?.versions['1.0.0']) {
        mockRegistries[0].packages['package-a'].versions['1.0.0'].dependencies = {
          'non-existent-package': '^1.0.0',
        };
      }

      const result = await resolver.resolveDependencies('package-a', '1.0.0', mockRegistries);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.code === 'version-not-found')).toBe(true);
    });
  });
});
