/**
 * JSON Schema related types for xats
 */

import type { XatsVersion } from './common.js';

/**
 * Schema definition metadata
 */
export interface SchemaMetadata {
  $id: string;
  $schema: string;
  title: string;
  description: string;
  version: XatsVersion;
  type: 'object';
}

/**
 * Schema property definition
 */
export interface SchemaProperty {
  type?: string | string[];
  description?: string;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  examples?: unknown[];
  $ref?: string;
  items?: SchemaProperty;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  additionalProperties?: boolean | SchemaProperty;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  format?: string;
}

/**
 * Complete schema definition
 */
export interface SchemaDefinition extends SchemaMetadata {
  definitions?: Record<string, SchemaProperty>;
  properties?: Record<string, SchemaProperty>;
  required?: string[];
  additionalProperties?: boolean | SchemaProperty;
  allOf?: Array<SchemaProperty | { $ref: string }>;
  anyOf?: Array<SchemaProperty | { $ref: string }>;
  oneOf?: Array<SchemaProperty | { $ref: string }>;
}

/**
 * Schema validation keyword
 */
export type SchemaKeyword =
  | 'type'
  | 'enum'
  | 'const'
  | 'multipleOf'
  | 'maximum'
  | 'minimum'
  | 'maxLength'
  | 'minLength'
  | 'pattern'
  | 'items'
  | 'properties'
  | 'required'
  | 'dependencies'
  | 'additionalProperties'
  | 'format'
  | 'allOf'
  | 'anyOf'
  | 'oneOf'
  | 'not';

/**
 * Schema format type
 */
export type SchemaFormat =
  | 'date-time'
  | 'date'
  | 'time'
  | 'duration'
  | 'email'
  | 'hostname'
  | 'ipv4'
  | 'ipv6'
  | 'uri'
  | 'uri-reference'
  | 'uri-template'
  | 'json-pointer'
  | 'regex'
  | 'uuid';

/**
 * Custom schema extension
 */
export interface SchemaExtension {
  keyword: string;
  validate: (data: unknown, schema: unknown) => boolean;
  compile?: (schema: unknown) => (data: unknown) => boolean;
  error?: string;
}

/**
 * Schema registry for managing multiple schemas
 */
export interface SchemaRegistry {
  schemas: Map<string, SchemaDefinition>;
  defaultVersion: XatsVersion;
  getSchema(version: XatsVersion): SchemaDefinition | undefined;
  registerSchema(schema: SchemaDefinition): void;
  validateAgainstSchema(data: unknown, version?: XatsVersion): boolean;
}
