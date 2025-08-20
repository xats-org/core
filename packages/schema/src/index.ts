/**
 * @xats/schema - JSON Schema definitions for xats
 * 
 * This package provides access to all xats schema versions and utilities
 * for working with schemas.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { SchemaDefinition, XatsVersion } from '@xats/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Available schema versions
export const SCHEMA_VERSIONS: XatsVersion[] = ['0.1.0', '0.2.0', '0.3.0'];
export const LATEST_VERSION: XatsVersion = '0.3.0';
export const CURRENT_VERSION: XatsVersion = '0.3.0';

// Schema cache to avoid repeated file reads
const schemaCache = new Map<string, SchemaDefinition>();

/**
 * Load a schema by version
 * @param version - The schema version to load
 * @returns The schema definition or null if not found
 */
export function loadSchema(version: XatsVersion | 'latest'): SchemaDefinition | null {
  const cacheKey = version === 'latest' ? LATEST_VERSION : version;
  
  // Check cache first
  if (schemaCache.has(cacheKey)) {
    return schemaCache.get(cacheKey)!;
  }

  try {
    const schemaPath = resolve(__dirname, '..', 'schemas', version, 'xats.json');
    const schemaContent = readFileSync(schemaPath, 'utf-8');
    const schema = JSON.parse(schemaContent) as SchemaDefinition;
    
    // Cache the loaded schema
    schemaCache.set(cacheKey, schema);
    return schema;
  } catch (error) {
    console.error(`Failed to load schema version ${version}:`, error);
    return null;
  }
}

/**
 * Get all available schema versions
 */
export function getAvailableVersions(): XatsVersion[] {
  return [...SCHEMA_VERSIONS];
}

/**
 * Check if a version is available
 */
export function isVersionAvailable(version: string): version is XatsVersion {
  return SCHEMA_VERSIONS.includes(version as XatsVersion);
}

/**
 * Get schema version from a schema ID
 */
export function getVersionFromSchemaId(schemaId: string): XatsVersion | null {
  const match = schemaId.match(/schemas[/\\](\d+\.\d+\.\d+)[/\\]/);
  if (match && match[1] && isVersionAvailable(match[1])) {
    return match[1] as XatsVersion;
  }
  return null;
}

/**
 * Get the schema ID for a version
 */
export function getSchemaId(version: XatsVersion): string {
  return `https://xats.org/schemas/${version}/xats.json`;
}

/**
 * Load schema definitions (for resolving $refs)
 */
export function loadSchemaDefinitions(version: XatsVersion): Record<string, unknown> {
  const schema = loadSchema(version);
  return schema?.definitions || {};
}

/**
 * Get schema metadata
 */
export function getSchemaMetadata(version: XatsVersion): {
  version: string;
  title: string;
  description: string;
} | null {
  const schema = loadSchema(version);
  if (!schema) return null;
  
  return {
    version: schema.version || version,
    title: schema.title || 'Extensible Academic Textbook Schema',
    description: schema.description || 'JSON Schema for academic textbook content'
  };
}

/**
 * Export all schemas as an object
 */
export function getAllSchemas(): Record<XatsVersion, SchemaDefinition | null> {
  const schemas: Partial<Record<XatsVersion, SchemaDefinition | null>> = {};
  
  for (const version of SCHEMA_VERSIONS) {
    schemas[version] = loadSchema(version);
  }
  
  return schemas as Record<XatsVersion, SchemaDefinition | null>;
}

// Re-export types
export type { SchemaDefinition, SchemaProperty, SchemaMetadata, XatsVersion } from '@xats/types';