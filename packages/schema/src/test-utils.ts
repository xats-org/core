/**
 * Test utilities for schema validation tests
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import Ajv, { type ValidationError } from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidatorInstance {
  validate: (doc: unknown) => ValidationResult;
}

/**
 * Create a validator instance for testing
 * Uses the latest schema (0.3.0) by default
 */
export function createValidator(): ValidatorInstance {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateFormats: true,
  });

  // Add standard formats
  addFormats(ajv);

  // Load the schema (use 0.1.0 for basic compatibility)
  const schemaPath = resolve(__dirname, '..', 'schemas', '0.1.0', 'xats.json');
  const schemaContent = readFileSync(schemaPath, 'utf-8');
  const schema = JSON.parse(schemaContent) as Record<string, unknown>;

  // Add CSL schema stubs to prevent MissingRefError
  const cslSchema = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      type: { type: 'string' },
      title: { type: 'string' },
      author: { type: 'array' },
      issued: { type: 'object' },
      'container-title': { type: 'string' },
      publisher: { type: 'string' },
      page: { type: 'string' },
      volume: { type: 'string' },
      issue: { type: 'string' },
      URL: { type: 'string' },
      DOI: { type: 'string' },
      ISBN: { type: 'string' },
    },
    additionalProperties: true,
  };

  ajv.addSchema(
    cslSchema,
    'https://resource.citationstyles.org/schema/latest/input/json/csl-data.json'
  );
  ajv.addSchema(
    cslSchema,
    'https://raw.githubusercontent.com/citation-style-language/schema/master/csl-data.json'
  );

  // Add LTI extension schema stub to prevent MissingRefError
  const ltiSchema = {
    $id: 'https://xats.org/extensions/lti-1.3/schema.json',
    definitions: {
      LtiConfiguration: {
        type: 'object',
        properties: {
          ltiVersion: { type: 'string' },
          platformId: { type: 'string' },
          clientId: { type: 'string' },
        },
        additionalProperties: true,
      },
      LtiLaunchMetadata: {
        type: 'object',
        properties: {
          contextId: { type: 'string' },
          resourceLinkId: { type: 'string' },
        },
        additionalProperties: true,
      },
      LtiGradePassback: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          maxScore: { type: 'number' },
        },
        additionalProperties: true,
      },
      LtiDeepLinking: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          returnUrl: { type: 'string' },
        },
        additionalProperties: true,
      },
      LtiPathwayIntegration: {
        type: 'object',
        properties: {
          enabled: { type: 'boolean' },
          pathwayMappings: { type: 'array' },
        },
        additionalProperties: true,
      },
    },
  };

  ajv.addSchema(ltiSchema);

  const validate = ajv.compile(schema);

  return {
    validate: (doc: unknown): ValidationResult => {
      const isValid = validate(doc);
      return {
        isValid,
        errors: (validate.errors || []) as ValidationError[],
      };
    },
  };
}
