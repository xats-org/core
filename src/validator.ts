/**
 * xats Document Validator
 * 
 * Provides validation capabilities for xats documents against the JSON Schema.
 */

import Ajv, { type AnySchemaObject } from 'ajv';
import addFormats from 'ajv-formats';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  schemaVersion?: string;
}

export interface ValidationError {
  path: string;
  message: string;
  keyword?: string;
  params?: Record<string, unknown>;
  data?: unknown;
}

export interface ValidatorOptions {
  schemaVersion?: string;
  strict?: boolean;
  allErrors?: boolean;
}

export class XatsValidator {
  private ajv: Ajv;
  private schemaCache: Map<string, AnySchemaObject> = new Map();

  constructor(options: ValidatorOptions = {}) {
    this.ajv = new Ajv({
      allErrors: options.allErrors ?? true,
      strict: options.strict ?? true,
      loadSchema: this.loadSchema.bind(this),
      formats: {
        // Custom format for URIs in xats context
        'xats-uri': /^https:\/\/xats.org\/[\w\-/.]+$/
      }
    });

    // Add standard formats (email, uri, etc.)
    addFormats(this.ajv);
    
    // Add basic CSL schema for offline validation
    this.addBasicCslSchema();
  }

  /**
   * Validate a xats document against the appropriate schema version
   */
  async validate(document: unknown, options: ValidatorOptions = {}): Promise<ValidationResult> {
    try {
      // Determine schema version
      const schemaVersion = this.determineSchemaVersion(document, options.schemaVersion);
      
      // Load the schema
      const schema = await this.getSchema(schemaVersion);
      
      // Compile validator if not cached
      let validate = this.ajv.getSchema(`https://xats.org/schemas/${schemaVersion}/schema.json`);
      if (!validate) {
        validate = this.ajv.compile(schema as AnySchemaObject);
      }

      // Perform validation
      const isValid = validate(document);
      
      if (isValid) {
        return {
          isValid: true,
          errors: [],
          schemaVersion
        };
      }

      // Transform AJV errors to our format
      const errors: ValidationError[] = (validate.errors || []).map(error => ({
        path: error.instancePath || 'root',
        message: error.message || 'Unknown validation error',
        keyword: error.keyword,
        params: error.params || {},
        data: error.data
      }));

      return {
        isValid: false,
        errors,
        schemaVersion
      };

    } catch (error) {
      return {
        isValid: false,
        errors: [{
          path: 'root',
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }

  /**
   * Validate a xats document from a file path
   */
  async validateFile(filePath: string, options: ValidatorOptions = {}): Promise<ValidationResult> {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const document = JSON.parse(content);
      return await this.validate(document, options);
    } catch (error) {
      return {
        isValid: false,
        errors: [{
          path: 'file',
          message: `Failed to read or parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]
      };
    }
  }

  /**
   * Get available schema versions
   */
  getAvailableVersions(): string[] {
    return ['0.1.0']; // Hardcoded for now, could be dynamic
  }

  /**
   * Load schema by version
   */
  private async getSchema(version: string): Promise<AnySchemaObject> {
    const cacheKey = version;
    if (this.schemaCache.has(cacheKey)) {
      return this.schemaCache.get(cacheKey)!;
    }

    try {
      // Resolve schema path relative to project root (up one level from dist)
      const schemaPath = resolve(__dirname, `../schemas/${version}/xats.json`);
      const schemaContent = readFileSync(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaContent) as AnySchemaObject;
      
      this.schemaCache.set(cacheKey, schema);
      return schema;
    } catch (error) {
      throw new Error(`Failed to load schema version ${version}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Determine the schema version from the document or options
   */
  private determineSchemaVersion(document: unknown, optionsVersion?: string): string {
    if (optionsVersion) {
      return optionsVersion;
    }

    if (document && typeof document === 'object' && document !== null) {
      const doc = document as Record<string, unknown>;
      if (typeof doc.schemaVersion === 'string') {
        return doc.schemaVersion;
      }
    }

    // Default to latest stable version
    return '0.1.0';
  }

  /**
   * Dynamic schema loading (for AJV)
   */
  private async loadSchema(uri: string): Promise<AnySchemaObject> {
    // Extract version from URI
    const match = uri.match(/\/schemas\/([^/]+)\/schema.json$/);
    if (!match) {
      throw new Error(`Invalid schema URI: ${uri}`);
    }

    const version = match[1]!;
    return await this.getSchema(version);
  }

  /**
   * Add a basic CSL schema for offline validation
   */
  private addBasicCslSchema(): void {
    const basicCslSchema = {
      "$id": "https://raw.githubusercontent.com/citation-style-language/schema/master/csl-data.json",
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "string" },
        "title": { "type": "string" },
        "author": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "family": { "type": "string" },
              "given": { "type": "string" }
            }
          }
        },
        "issued": {
          "type": "object",
          "properties": {
            "date-parts": {
              "type": "array",
              "items": {
                "type": "array",
                "items": { "type": "number" }
              }
            }
          }
        }
      },
      "required": ["id", "type", "title"]
    };

    this.ajv.addSchema(basicCslSchema);
  }
}

/**
 * Create a new validator instance with default options
 */
export function createValidator(options: ValidatorOptions = {}): XatsValidator {
  return new XatsValidator(options);
}

/**
 * Quick validation function for simple use cases
 */
export async function validateXats(document: unknown, options: ValidatorOptions = {}): Promise<ValidationResult> {
  const validator = createValidator(options);
  return await validator.validate(document, options);
}

/**
 * Quick file validation function
 */
export async function validateXatsFile(filePath: string, options: ValidatorOptions = {}): Promise<ValidationResult> {
  const validator = createValidator(options);
  return await validator.validateFile(filePath, options);
}