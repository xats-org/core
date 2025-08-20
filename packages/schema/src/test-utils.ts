/**
 * Test utilities for schema validation tests
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create a validator instance for testing
 * Uses the latest schema (0.3.0) by default
 */
export function createValidator() {
  const ajv = new Ajv({
    allErrors: true,
    strict: false,
    validateFormats: true,
  });

  // Add standard formats
  addFormats(ajv);

  // Load the schema
  const schemaPath = resolve(__dirname, '..', 'schemas', '0.3.0', 'xats.json');
  const schemaContent = readFileSync(schemaPath, 'utf-8');
  const schema = JSON.parse(schemaContent);

  // Add CSL schema stub to prevent MissingRefError
  ajv.addSchema({
    $id: 'https://resource.citationstyles.org/schema/latest/input/json/csl-data.json',
    type: 'object',
    properties: {
      type: { type: 'string' },
      id: { type: 'string' },
      title: { type: 'string' },
      author: { type: 'array' },
      issued: { type: 'object' },
    },
  });

  const validate = ajv.compile(schema);

  return {
    validate: (doc: any) => {
      const isValid = validate(doc);
      return {
        isValid,
        errors: validate.errors || [],
      };
    },
  };
}