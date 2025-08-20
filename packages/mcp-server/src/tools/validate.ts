/**
 * @xats/mcp-server - Validate Tool Implementation
 */

import { createValidator } from '@xats/validator';
import type { 
  ValidateInput, 
  ValidateResult, 
  McpServerConfig 
} from '../types.js';
import { ValidationError } from '../types.js';

/**
 * Validate a xats document against the JSON Schema
 */
export async function validateTool(
  input: ValidateInput,
  config: McpServerConfig
): Promise<ValidateResult> {
  try {
    // Validate input parameters
    if (!input.document) {
      throw new ValidationError('Document is required for validation');
    }

    // Create validator with server configuration
    const validator = createValidator({
      strict: input.strict ?? config.validation?.strict ?? true,
      allErrors: config.validation?.allErrors ?? true,
    });

    // Perform validation
    const validationOptions: any = {
      strict: input.strict ?? config.validation?.strict ?? true,
    };
    
    if (input.schemaVersion) {
      validationOptions.schemaVersion = input.schemaVersion;
    } else if (config.defaultSchemaVersion) {
      validationOptions.schemaVersion = config.defaultSchemaVersion;
    }
    
    const validationResult = await validator.validate(input.document, validationOptions);

    return {
      success: true,
      data: validationResult,
      metadata: {
        toolName: 'xats_validate',
        timestamp: new Date().toISOString(),
        schemaVersion: validationResult.schemaVersion || config.defaultSchemaVersion,
        strict: input.strict ?? config.validation?.strict ?? true,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
      metadata: {
        toolName: 'xats_validate',
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
      },
    };
  }
}

/**
 * Validate a xats document synchronously (for pre-loaded schemas)
 */
export function validateToolSync(
  input: ValidateInput,
  config: McpServerConfig
): ValidateResult {
  try {
    // Validate input parameters
    if (!input.document) {
      throw new ValidationError('Document is required for validation');
    }

    // Create validator with server configuration
    const validator = createValidator({
      strict: input.strict ?? config.validation?.strict ?? true,
      allErrors: config.validation?.allErrors ?? true,
    });

    // Perform synchronous validation
    const validationOptions: any = {
      strict: input.strict ?? config.validation?.strict ?? true,
    };
    
    if (input.schemaVersion) {
      validationOptions.schemaVersion = input.schemaVersion;
    } else if (config.defaultSchemaVersion) {
      validationOptions.schemaVersion = config.defaultSchemaVersion;
    }
    
    const validationResult = validator.validateSync(input.document, validationOptions);

    return {
      success: true,
      data: validationResult,
      metadata: {
        toolName: 'xats_validate_sync',
        timestamp: new Date().toISOString(),
        schemaVersion: validationResult.schemaVersion || config.defaultSchemaVersion,
        strict: input.strict ?? config.validation?.strict ?? true,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown validation error',
      metadata: {
        toolName: 'xats_validate_sync',
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
      },
    };
  }
}

/**
 * Validate multiple documents in batch
 */
export async function validateBatchTool(
  documents: ValidateInput[],
  config: McpServerConfig
): Promise<ValidateResult[]> {
  const results: ValidateResult[] = [];
  
  for (const input of documents) {
    const result = await validateTool(input, config);
    results.push(result);
  }
  
  return results;
}

/**
 * Get validation summary for multiple results
 */
export function getValidationSummary(results: ValidateResult[]): {
  total: number;
  valid: number;
  invalid: number;
  errorSummary: Record<string, number>;
} {
  const summary = {
    total: results.length,
    valid: 0,
    invalid: 0,
    errorSummary: {} as Record<string, number>,
  };

  for (const result of results) {
    if (result.success && result.data?.isValid) {
      summary.valid++;
    } else {
      summary.invalid++;
      
      // Count error types
      if (result.data?.errors) {
        for (const error of result.data.errors) {
          const errorType = error.keyword || 'unknown';
          summary.errorSummary[errorType] = (summary.errorSummary[errorType] || 0) + 1;
        }
      }
    }
  }

  return summary;
}