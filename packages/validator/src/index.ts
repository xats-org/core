/**
 * @xats/validator - xats Document Validator
 *
 * Provides validation capabilities for xats documents against the JSON Schema.
 */

// @ts-expect-error - Ajv has complex default export handling
import Ajv, { type ValidateFunction, type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';

import { loadSchema, getSchemaId, isVersionAvailable, LATEST_VERSION } from '@xats/schema';

import type {
  ValidationResult,
  ValidationError,
  ValidatorOptions,
  XatsDocument,
  XatsVersion,
} from '@xats/types';

export class XatsValidator {
  private ajv: Ajv;
  private validatorCache: Map<string, ValidateFunction> = new Map();

  constructor(options: ValidatorOptions = {}) {
    this.ajv = new Ajv({
      allErrors: options.allErrors ?? true,
      strict: options.strict ?? false, // Set to false to allow external refs
      loadSchema: this.loadRemoteSchema.bind(this),
      validateFormats: true,
      validateSchema: false, // Don't validate the schema itself
    });

    // Add standard formats (email, uri, etc.)
    addFormats(this.ajv);

    // Add custom xats URI format
    this.ajv.addFormat('xats-uri', {
      validate: (data: string) => /^https:\/\/xats\.org\/[\w\-/.]+$/.test(data),
    });

    // Pre-load schemas for offline validation
    this.preloadSchemas();
  }

  /**
   * Pre-load common schemas for offline validation
   */
  private preloadSchemas(): void {
    // Load CSL schema stub - matches the URL referenced in xats schemas
    this.ajv.addSchema({
      $id: 'https://raw.githubusercontent.com/citation-style-language/schema/master/csl-data.json',
      type: 'object',
      additionalProperties: true,
    });

    // Also add the resource.citationstyles.org version
    this.ajv.addSchema({
      $id: 'https://resource.citationstyles.org/schema/latest/input/json/csl-data.json',
      type: 'object',
      additionalProperties: true,
    });

    // Load LTI extension schema stub
    this.ajv.addSchema({
      $id: 'https://xats.org/extensions/lti-1.3/schema.json',
      type: 'object',
      properties: {
        resourceLink: { type: 'object' },
        context: { type: 'object' },
        platform: { type: 'object' },
      },
      additionalProperties: true,
    });
  }

  /**
   * Load remote schema (for $ref resolution)
   */
  private loadRemoteSchema(uri: string): Promise<object> {
    return Promise.resolve(this.loadRemoteSchemaSync(uri));
  }

  private loadRemoteSchemaSync(uri: string): object {
    // Try to resolve from local schemas first
    const versionMatch = uri.match(/schemas\/(\d+\.\d+\.\d+)\//);
    if (versionMatch && versionMatch[1] && isVersionAvailable(versionMatch[1])) {
      const schema = loadSchema(versionMatch[1] as XatsVersion);
      if (schema) return schema as object;
    }

    // Return stub for unknown schemas
    return { type: 'object', additionalProperties: true };
  }

  /**
   * Determine schema version from document or options
   */
  private determineSchemaVersion(document: unknown, explicitVersion?: string): string {
    if (explicitVersion) {
      return explicitVersion;
    }

    const doc = document as Partial<XatsDocument>;
    if (doc.schemaVersion) {
      return doc.schemaVersion;
    }

    return LATEST_VERSION;
  }

  /**
   * Get or compile validator for a schema version
   */
  private getValidator(version: string): Promise<ValidateFunction | null> {
    return Promise.resolve(this.getValidatorSync(version));
  }

  private getValidatorSync(version: string): ValidateFunction | null {
    // Check if it's a valid version
    if (!isVersionAvailable(version)) {
      return null;
    }
    const schemaId = getSchemaId(version as XatsVersion);

    // Check cache
    const cachedValidator = this.validatorCache.get(schemaId);
    if (cachedValidator) {
      return cachedValidator;
    }

    // Load schema
    const schema = loadSchema(version as XatsVersion);
    if (!schema) {
      return null;
    }

    try {
      // Compile validator
      const validate = this.ajv.compile(schema);
      this.validatorCache.set(schemaId, validate);
      return validate;
    } catch (error) {
      console.error(`Failed to compile schema ${version}:`, error);
      return null;
    }
  }

  /**
   * Validate a xats document against the appropriate schema version
   */
  async validate(document: unknown, options: ValidatorOptions = {}): Promise<ValidationResult> {
    try {
      // Determine schema version
      const schemaVersion = this.determineSchemaVersion(document, options.schemaVersion);

      // Get validator
      const validate = await this.getValidator(schemaVersion);
      if (!validate) {
        return {
          isValid: false,
          errors: [
            {
              path: 'root',
              message: `Schema version ${schemaVersion} not found or could not be compiled`,
            },
          ],
          schemaVersion,
        };
      }

      // Perform validation
      const isValid = validate(document);

      if (isValid) {
        return {
          isValid: true,
          errors: [],
          schemaVersion,
        };
      }

      // Transform AJV errors to our format
      const errors = this.transformErrors(validate.errors || []);

      return {
        isValid: false,
        errors,
        schemaVersion,
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          {
            path: 'root',
            message: error instanceof Error ? error.message : 'Unknown validation error',
          },
        ],
      };
    }
  }

  /**
   * Transform AJV errors to ValidationError format
   */
  private transformErrors(ajvErrors: ErrorObject[]): ValidationError[] {
    return ajvErrors.map((error) => ({
      path: error.instancePath || 'root',
      message: this.formatErrorMessage(error),
      keyword: error.keyword,
      params: error.params || {},
      data: error.data,
    }));
  }

  /**
   * Format error message for better readability
   */
  private formatErrorMessage(error: ErrorObject): string {
    if (error.message) {
      return error.message;
    }

    switch (error.keyword) {
      case 'required':
        return `Missing required property: ${error.params?.missingProperty}`;
      case 'type':
        return `Invalid type: expected ${error.params?.type}`;
      case 'enum':
        return `Invalid value: must be one of ${JSON.stringify(error.params?.allowedValues)}`;
      case 'pattern':
        return `String does not match pattern: ${error.params?.pattern}`;
      case 'format':
        return `Invalid format: ${error.params?.format}`;
      default:
        return 'Validation error';
    }
  }

  /**
   * Validate a document synchronously (for pre-loaded schemas)
   */
  validateSync(document: unknown, options: ValidatorOptions = {}): ValidationResult {
    const schemaVersion = this.determineSchemaVersion(document, options.schemaVersion);

    // Check if it's a valid version
    if (!isVersionAvailable(schemaVersion)) {
      return {
        isValid: false,
        errors: [
          {
            path: 'root',
            message: `Invalid schema version: ${schemaVersion}`,
          },
        ],
      };
    }

    const schemaId = getSchemaId(schemaVersion as XatsVersion);

    // Try to get cached validator
    const validate = this.validatorCache.get(schemaId) || this.ajv.getSchema(schemaId);

    if (!validate) {
      // Try to compile on the fly
      const schema = loadSchema(schemaVersion as XatsVersion);
      if (!schema) {
        return {
          isValid: false,
          errors: [
            {
              path: 'root',
              message: `Schema version ${schemaVersion} not available for synchronous validation`,
            },
          ],
          schemaVersion,
        };
      }

      try {
        const newValidate = this.ajv.compile(schema);
        this.validatorCache.set(schemaId, newValidate);

        const isValid = newValidate(document);
        return {
          isValid,
          errors: isValid ? [] : this.transformErrors(newValidate.errors || []),
          schemaVersion,
        };
      } catch (error) {
        return {
          isValid: false,
          errors: [
            {
              path: 'root',
              message: `Failed to compile schema: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          schemaVersion,
        };
      }
    }

    const isValid = validate(document);
    return {
      isValid,
      errors: isValid ? [] : this.transformErrors(validate.errors || []),
      schemaVersion,
    };
  }

  /**
   * Clear validator cache
   */
  clearCache(): void {
    this.validatorCache.clear();
  }

  /**
   * Add custom format validator
   */
  addFormat(name: string, format: string | RegExp | ((data: string) => boolean)): void {
    if (typeof format === 'function') {
      this.ajv.addFormat(name, { validate: format });
    } else {
      this.ajv.addFormat(name, format);
    }
  }

  /**
   * Add custom keyword validator
   */
  addKeyword(keyword: string, definition: Record<string, unknown>): void {
    // @ts-expect-error - Ajv type definition issue
    this.ajv.addKeyword(keyword, definition);
  }
}

/**
 * Create a new validator instance
 */
export function createValidator(options?: ValidatorOptions): XatsValidator {
  return new XatsValidator(options);
}

/**
 * Validate a xats document (convenience function)
 */
export async function validateXats(
  document: unknown,
  options?: ValidatorOptions
): Promise<ValidationResult> {
  const validator = new XatsValidator(options);
  return validator.validate(document, options);
}

/**
 * Validate a xats document synchronously (convenience function)
 */
export function validateXatsSync(document: unknown, options?: ValidatorOptions): ValidationResult {
  const validator = new XatsValidator(options);
  return validator.validateSync(document, options);
}

// Re-export types
export type {
  ValidationResult,
  ValidationError,
  ValidatorOptions,
  ValidationWarning,
  ValidationMetadata,
} from '@xats/types';
