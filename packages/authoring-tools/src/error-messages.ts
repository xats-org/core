/**
 * Service for converting technical validation errors into user-friendly messages
 */

import type { UserFriendlyError, ErrorSuggestion, ErrorSeverity } from './types.js';
import type { ValidationError } from '@xats-org/types';

/**
 * Options for error message service
 */
export interface ErrorMessagesServiceOptions {
  /** User experience level */
  userLevel: 'beginner' | 'intermediate' | 'advanced';

  /** Language for messages */
  language: string;

  /** Include suggestions with errors */
  includeSuggestions: boolean;
}

/**
 * Service for creating user-friendly error messages and suggestions
 */
export class ErrorMessagesService {
  private options: Required<ErrorMessagesServiceOptions>;
  private errorTemplates: Map<string, ErrorTemplate> = new Map();
  private suggestionGenerators: Map<string, SuggestionGenerator> = new Map();

  constructor(options: ErrorMessagesServiceOptions) {
    this.options = {
      ...options,
      userLevel: options.userLevel || 'intermediate',
      language: options.language || 'en',
      includeSuggestions: options.includeSuggestions ?? true,
    };

    this.initializeErrorTemplates();
    this.initializeSuggestionGenerators();
  }

  /**
   * Convert technical validation errors to user-friendly format
   */
  async convertValidationErrors(validationErrors: ValidationError[]): Promise<UserFriendlyError[]> {
    const userFriendlyErrors: UserFriendlyError[] = [];

    for (const error of validationErrors) {
      const userFriendlyError = this.convertSingleError(error);
      userFriendlyErrors.push(userFriendlyError);
    }

    return userFriendlyErrors;
  }

  /**
   * Generate suggestions for common validation errors
   */
  generateSuggestions(validationErrors: ValidationError[]): ErrorSuggestion[] {
    const suggestions: ErrorSuggestion[] = [];
    const errorTypes = new Set(validationErrors.map((e) => e.keyword));

    // Generate contextual suggestions based on error patterns
    if (errorTypes.has('required')) {
      suggestions.push({
        description: 'Make sure all required fields are included in your document',
        action: 'add',
        fix: 'Add missing required fields like title, author, or schemaVersion',
        confidence: 0.9,
      });
    }

    if (errorTypes.has('type')) {
      suggestions.push({
        description: 'Check that your data types match what is expected',
        action: 'fix',
        fix: 'Ensure strings are quoted, numbers are numeric, and arrays use square brackets',
        confidence: 0.8,
      });
    }

    if (errorTypes.has('format')) {
      suggestions.push({
        description: 'Verify that URIs and other formatted fields follow the correct pattern',
        action: 'fix',
        fix: 'Use valid xats vocabulary URIs like "https://xats.org/vocabularies/blocks/paragraph"',
        confidence: 0.85,
      });
    }

    return suggestions;
  }

  /**
   * Update service options
   */
  updateOptions(newOptions: Partial<ErrorMessagesServiceOptions>): void {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Convert a single validation error to user-friendly format
   */
  private convertSingleError(error: ValidationError): UserFriendlyError {
    const template = this.errorTemplates.get(error.keyword || 'unknown');
    const severity = this.determineSeverity(error);

    let message: string;
    let code: string;

    if (template) {
      message = template.getMessage(error, this.options.userLevel);
      code = template.code;
    } else {
      message = this.getGenericErrorMessage(error);
      code = 'UNKNOWN_ERROR';
    }

    const suggestions = this.options.includeSuggestions ? this.generateErrorSuggestions(error) : [];

    const location = this.extractLocation(error);
    const userError: UserFriendlyError = {
      message,
      code,
      severity,
      suggestions,
      documentation: this.getDocumentationLinks(error.keyword || 'unknown'),
    };

    if (location) {
      userError.location = location;
    }

    return userError;
  }

  /**
   * Initialize error message templates
   */
  private initializeErrorTemplates(): void {
    this.errorTemplates = new Map([
      ['required', new RequiredFieldErrorTemplate()],
      ['type', new TypeMismatchErrorTemplate()],
      ['format', new FormatErrorTemplate()],
      ['enum', new EnumErrorTemplate()],
      ['pattern', new PatternErrorTemplate()],
      ['additionalProperties', new AdditionalPropertiesErrorTemplate()],
      ['oneOf', new OneOfErrorTemplate()],
      ['anyOf', new AnyOfErrorTemplate()],
      ['const', new ConstantErrorTemplate()],
      ['minimum', new MinimumErrorTemplate()],
      ['maximum', new MaximumErrorTemplate()],
      ['minLength', new MinLengthErrorTemplate()],
      ['maxLength', new MaxLengthErrorTemplate()],
    ]);
  }

  /**
   * Initialize suggestion generators
   */
  private initializeSuggestionGenerators(): void {
    this.suggestionGenerators = new Map([
      ['required', new RequiredFieldSuggestionGenerator()],
      ['type', new TypeMismatchSuggestionGenerator()],
      ['format', new FormatSuggestionGenerator()],
      ['enum', new EnumSuggestionGenerator()],
    ]);
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: ValidationError): ErrorSeverity {
    switch (error.keyword) {
      case 'required':
        return 'error';
      case 'type':
        return 'error';
      case 'format':
        return 'warning';
      case 'enum':
        return 'warning';
      case 'pattern':
        return 'warning';
      case 'additionalProperties':
        return 'info';
      default:
        return 'warning';
    }
  }

  /**
   * Extract location information from error
   */
  private extractLocation(
    error: ValidationError
  ): { line?: number; column?: number; path?: string } | undefined {
    if (error.path) {
      return {
        path: error.path,
      };
    }
    return undefined;
  }

  /**
   * Get documentation links for error types
   */
  private getDocumentationLinks(keyword: string): Array<{ title: string; url: string }> {
    const baseUrl = 'https://xats.org/docs/authoring-guide';

    const linkMap: Record<string, Array<{ title: string; url: string }>> = {
      required: [
        { title: 'Required Fields Guide', url: `${baseUrl}#required-fields` },
        { title: 'Document Structure', url: `${baseUrl}#structure` },
      ],
      type: [
        { title: 'Data Types Guide', url: `${baseUrl}#data-types` },
        { title: 'Schema Reference', url: 'https://xats.org/docs/reference' },
      ],
      format: [
        { title: 'URI Formats', url: `${baseUrl}#uris` },
        { title: 'Vocabularies Guide', url: `${baseUrl}#vocabularies` },
      ],
      enum: [
        { title: 'Valid Values', url: `${baseUrl}#valid-values` },
        { title: 'Block Types', url: `${baseUrl}#block-types` },
      ],
    };

    return linkMap[keyword] || [{ title: 'Authoring Guide', url: baseUrl }];
  }

  /**
   * Generate suggestions for a specific error
   */
  private generateErrorSuggestions(error: ValidationError): ErrorSuggestion[] {
    const generator = this.suggestionGenerators.get(error.keyword || 'unknown');

    if (generator) {
      return generator.generateSuggestions(error, this.options.userLevel);
    }

    // Generic suggestions
    return [
      {
        description: 'Review the error details and check the documentation',
        action: 'fix',
        fix: 'Refer to the xats documentation for guidance',
        confidence: 0.5,
      },
    ];
  }

  /**
   * Get generic error message for unknown error types
   */
  private getGenericErrorMessage(error: ValidationError): string {
    return `Validation error${error.path ? ` at ${error.path}` : ''}: ${error.message || 'Unknown error'}`;
  }
}

/**
 * Base class for error message templates
 */
abstract class ErrorTemplate {
  abstract code: string;
  abstract getMessage(error: ValidationError, userLevel: string): string;
}

/**
 * Base class for suggestion generators
 */
abstract class SuggestionGenerator {
  abstract generateSuggestions(error: ValidationError, userLevel: string): ErrorSuggestion[];
}

// Error template implementations

class RequiredFieldErrorTemplate extends ErrorTemplate {
  code = 'REQUIRED_FIELD_MISSING';

  getMessage(error: ValidationError, userLevel: string): string {
    const params = error.params as { missingProperty?: string } | undefined;
    const field = params?.missingProperty || 'field';

    switch (userLevel) {
      case 'beginner':
        return `You need to include a "${field}" in your document. This is a required field that cannot be left empty.`;
      case 'intermediate':
        return `Missing required field: "${field}". Please add this field to your document.`;
      case 'advanced':
        return `Required property "${field}" is missing from ${error.path || 'root'}.`;
      default:
        return `Missing required field: "${field}"`;
    }
  }
}

class TypeMismatchErrorTemplate extends ErrorTemplate {
  code = 'TYPE_MISMATCH';

  getMessage(error: ValidationError, userLevel: string): string {
    const params = error.params as { type?: string } | undefined;
    const expected = params?.type || 'unknown';

    switch (userLevel) {
      case 'beginner':
        return `The data type is incorrect. Expected ${expected}, but got something else. Check if you need quotes around text or if numbers should not have quotes.`;
      case 'intermediate':
        return `Type mismatch: expected ${expected}. Check the data type of this field.`;
      case 'advanced':
        return `Type validation failed at ${error.path}: expected ${expected}, got ${typeof error.data}.`;
      default:
        return `Invalid type: expected ${expected}`;
    }
  }
}

class FormatErrorTemplate extends ErrorTemplate {
  code = 'FORMAT_INVALID';

  getMessage(error: ValidationError, userLevel: string): string {
    const params = error.params as { format?: string } | undefined;
    const format = params?.format || 'unknown';

    switch (userLevel) {
      case 'beginner':
        return `The format is not correct. This field expects a ${format} format. Check the examples in the documentation.`;
      case 'intermediate':
        return `Invalid ${format} format. Please check the field value matches the expected format.`;
      case 'advanced':
        return `Format validation failed: expected ${format} format at ${error.path}.`;
      default:
        return `Invalid format: expected ${format}`;
    }
  }
}

class EnumErrorTemplate extends ErrorTemplate {
  code = 'ENUM_INVALID';

  getMessage(error: ValidationError, userLevel: string): string {
    const params = error.params as { allowedValues?: unknown[] } | undefined;
    const allowedValues = params?.allowedValues || [];

    switch (userLevel) {
      case 'beginner':
        return `The value must be one of these options: ${allowedValues.join(', ')}. Please choose from the list of valid values.`;
      case 'intermediate':
        return `Invalid value. Allowed values are: ${allowedValues.join(', ')}.`;
      case 'advanced':
        return `Enum constraint violation at ${error.path}. Valid values: ${JSON.stringify(allowedValues)}.`;
      default:
        return `Invalid value. Must be one of: ${allowedValues.join(', ')}`;
    }
  }
}

class PatternErrorTemplate extends ErrorTemplate {
  code = 'PATTERN_INVALID';

  getMessage(error: ValidationError, userLevel: string): string {
    switch (userLevel) {
      case 'beginner':
        return `The text doesn't match the required pattern. Check the format requirements for this field.`;
      case 'intermediate':
        return `Pattern validation failed. The text doesn't match the required format.`;
      case 'advanced': {
        const params = error.params as { pattern?: string } | undefined;
        return `Pattern constraint failed at ${error.path}: ${params?.pattern || 'unknown pattern'}`;
      }
      default:
        return `Pattern validation failed`;
    }
  }
}

class AdditionalPropertiesErrorTemplate extends ErrorTemplate {
  code = 'ADDITIONAL_PROPERTIES';

  getMessage(error: ValidationError, userLevel: string): string {
    const params = error.params as { additionalProperty?: string } | undefined;
    const additionalProperty = params?.additionalProperty || 'property';

    switch (userLevel) {
      case 'beginner':
        return `There's an extra field "${additionalProperty}" that shouldn't be there. You might have a typo in the field name.`;
      case 'intermediate':
        return `Unexpected property "${additionalProperty}". This field is not allowed here.`;
      case 'advanced':
        return `Additional property "${additionalProperty}" not allowed at ${error.path}.`;
      default:
        return `Unexpected property: "${additionalProperty}"`;
    }
  }
}

class OneOfErrorTemplate extends ErrorTemplate {
  code = 'ONE_OF_INVALID';

  getMessage(error: ValidationError, userLevel: string): string {
    switch (userLevel) {
      case 'beginner':
        return `The data doesn't match any of the expected formats. Check the documentation for valid structures.`;
      case 'intermediate':
        return `Data doesn't match any of the allowed schemas. Review the field requirements.`;
      case 'advanced':
        return `OneOf constraint failed at ${error.path}. Data doesn't match any allowed schema.`;
      default:
        return `Data doesn't match any allowed schema`;
    }
  }
}

class AnyOfErrorTemplate extends ErrorTemplate {
  code = 'ANY_OF_INVALID';

  getMessage(error: ValidationError, userLevel: string): string {
    switch (userLevel) {
      case 'beginner':
        return `The data doesn't match any of the possible formats. Double-check your data structure.`;
      case 'intermediate':
        return `AnyOf validation failed. Data must match at least one allowed schema.`;
      case 'advanced':
        return `AnyOf constraint failed at ${error.path}. No matching schema found.`;
      default:
        return `Data doesn't match any allowed schema`;
    }
  }
}

class ConstantErrorTemplate extends ErrorTemplate {
  code = 'CONSTANT_INVALID';

  getMessage(error: ValidationError, userLevel: string): string {
    const params = error.params as { allowedValue?: unknown } | undefined;
    const expected = params?.allowedValue;

    switch (userLevel) {
      case 'beginner':
        return `This field must have the exact value: ${JSON.stringify(expected)}. You cannot change this value.`;
      case 'intermediate':
        return `Constant value required: ${JSON.stringify(expected)}.`;
      case 'advanced':
        return `Const constraint failed at ${error.path}: expected ${JSON.stringify(expected)}.`;
      default:
        return `Must be constant value: ${JSON.stringify(expected)}`;
    }
  }
}

class MinimumErrorTemplate extends ErrorTemplate {
  code = 'MINIMUM_INVALID';

  getMessage(error: ValidationError, userLevel: string): string {
    const params = error.params as { limit?: number } | undefined;
    const limit = params?.limit;

    switch (userLevel) {
      case 'beginner':
        return `The number is too small. It must be at least ${limit}.`;
      case 'intermediate':
        return `Value must be at least ${limit}.`;
      case 'advanced':
        return `Minimum constraint failed at ${error.path}: value must be >= ${limit}.`;
      default:
        return `Value must be at least ${limit}`;
    }
  }
}

class MaximumErrorTemplate extends ErrorTemplate {
  code = 'MAXIMUM_INVALID';

  getMessage(error: ValidationError, userLevel: string): string {
    const params = error.params as { limit?: number } | undefined;
    const limit = params?.limit;

    switch (userLevel) {
      case 'beginner':
        return `The number is too large. It must be at most ${limit}.`;
      case 'intermediate':
        return `Value must be at most ${limit}.`;
      case 'advanced':
        return `Maximum constraint failed at ${error.path}: value must be <= ${limit}.`;
      default:
        return `Value must be at most ${limit}`;
    }
  }
}

class MinLengthErrorTemplate extends ErrorTemplate {
  code = 'MIN_LENGTH_INVALID';

  getMessage(error: ValidationError, userLevel: string): string {
    const params = error.params as { limit?: number } | undefined;
    const limit = params?.limit;

    switch (userLevel) {
      case 'beginner':
        return `The text is too short. It must be at least ${limit} characters long.`;
      case 'intermediate':
        return `Text must be at least ${limit} characters long.`;
      case 'advanced':
        return `MinLength constraint failed at ${error.path}: minimum ${limit} characters required.`;
      default:
        return `Text must be at least ${limit} characters`;
    }
  }
}

class MaxLengthErrorTemplate extends ErrorTemplate {
  code = 'MAX_LENGTH_INVALID';

  getMessage(error: ValidationError, userLevel: string): string {
    const params = error.params as { limit?: number } | undefined;
    const limit = params?.limit;

    switch (userLevel) {
      case 'beginner':
        return `The text is too long. It must be at most ${limit} characters long.`;
      case 'intermediate':
        return `Text must be at most ${limit} characters long.`;
      case 'advanced':
        return `MaxLength constraint failed at ${error.path}: maximum ${limit} characters allowed.`;
      default:
        return `Text must be at most ${limit} characters`;
    }
  }
}

// Suggestion generator implementations

class RequiredFieldSuggestionGenerator extends SuggestionGenerator {
  generateSuggestions(error: ValidationError, _userLevel: string): ErrorSuggestion[] {
    const params = error.params as { missingProperty?: string } | undefined;
    const field = params?.missingProperty || 'field';
    const suggestions: ErrorSuggestion[] = [];

    // Common required field fixes
    const fieldDefaults: Record<string, string> = {
      schemaVersion: '0.5.0',
      title: 'My Document',
      type: 'book',
      subject: 'General',
    };

    if (fieldDefaults[field]) {
      suggestions.push({
        description: `Add the required ${field} field`,
        action: 'add',
        fix: `"${field}": "${fieldDefaults[field]}"`,
        confidence: 0.9,
        automatic: true,
      });
    }

    suggestions.push({
      description: `Check the documentation for required fields in this section`,
      action: 'fix',
      fix: 'Review the schema documentation for required properties',
      confidence: 0.7,
    });

    return suggestions;
  }
}

class TypeMismatchSuggestionGenerator extends SuggestionGenerator {
  generateSuggestions(error: ValidationError, _userLevel: string): ErrorSuggestion[] {
    const params = error.params as { type?: string } | undefined;
    const expected = params?.type;
    const suggestions: ErrorSuggestion[] = [];

    switch (expected) {
      case 'string':
        suggestions.push({
          description: 'Add quotes around the text value',
          action: 'fix',
          fix: 'Wrap the value in double quotes: "your text here"',
          confidence: 0.8,
        });
        break;
      case 'number':
        suggestions.push({
          description: 'Remove quotes from the numeric value',
          action: 'fix',
          fix: 'Use numeric value without quotes: 42 instead of "42"',
          confidence: 0.8,
        });
        break;
      case 'array':
        suggestions.push({
          description: 'Use square brackets for arrays',
          action: 'fix',
          fix: 'Format as array: ["item1", "item2"]',
          confidence: 0.8,
        });
        break;
      case 'object':
        suggestions.push({
          description: 'Use curly braces for objects',
          action: 'fix',
          fix: 'Format as object: {"property": "value"}',
          confidence: 0.8,
        });
        break;
    }

    return suggestions;
  }
}

class FormatSuggestionGenerator extends SuggestionGenerator {
  generateSuggestions(error: ValidationError, _userLevel: string): ErrorSuggestion[] {
    const params = error.params as { format?: string } | undefined;
    const format = params?.format;
    const suggestions: ErrorSuggestion[] = [];

    if (format === 'xats-uri') {
      suggestions.push({
        description: 'Use a valid xats vocabulary URI',
        action: 'fix',
        fix: 'https://xats.org/vocabularies/blocks/paragraph',
        confidence: 0.9,
        automatic: true,
      });
    } else if (format === 'uri') {
      suggestions.push({
        description: 'Ensure the URI is properly formatted',
        action: 'fix',
        fix: 'Use complete URI: https://example.com/path',
        confidence: 0.7,
      });
    }

    return suggestions;
  }
}

class EnumSuggestionGenerator extends SuggestionGenerator {
  generateSuggestions(error: ValidationError, _userLevel: string): ErrorSuggestion[] {
    const params = error.params as { allowedValues?: unknown[] } | undefined;
    const allowedValues = params?.allowedValues || [];
    const suggestions: ErrorSuggestion[] = [];

    if (allowedValues.length > 0) {
      allowedValues.slice(0, 3).forEach((value: unknown) => {
        suggestions.push({
          description: `Use "${String(value)}" as the value`,
          action: 'replace',
          fix: JSON.stringify(value),
          confidence: 0.8,
        });
      });
    }

    return suggestions;
  }
}
