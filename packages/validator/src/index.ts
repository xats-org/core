import AjvDefault from 'ajv';
import addFormats from 'ajv-formats';

import { XatsSchema } from '@xats/schema';

import type { XatsDocument } from '@xats/types';

export class XatsValidator {
  private ajv: AjvDefault;

  constructor() {
    this.ajv = new AjvDefault({ allErrors: true });
    addFormats(this.ajv);
  }

  validate(document: unknown): { valid: boolean; errors: string[] } {
    // Extract schema version from document
    const doc = document as Record<string, unknown>;
    const schemaVersion = doc.schemaVersion as string;

    if (!schemaVersion) {
      return { valid: false, errors: ['Missing schemaVersion field'] };
    }

    const schema = this.getSchema(schemaVersion);
    if (!schema) {
      return { valid: false, errors: [`Unsupported schema version: ${schemaVersion}`] };
    }

    // For now, return valid with basic checks
    const errors: string[] = [];
    if (!doc.bibliographicEntry) errors.push('Missing bibliographicEntry');
    if (!doc.subject) errors.push('Missing subject');
    if (!doc.bodyMatter) errors.push('Missing bodyMatter');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getSchema(version: string): Record<string, unknown> | undefined {
    // TODO: Load actual schema based on version
    if (version === '0.1.0') {
      return {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: `https://xats.org/schemas/${version}/xats.json`,
      };
    }
    return undefined;
  }
}

const ajv = new AjvDefault({ allErrors: true });
addFormats(ajv);

export function validateXatsDocument(_document: XatsDocument): boolean {
  // TODO: Implement actual validation logic
  // For now, just return true and reference the schema version
  const schemaVersion = XatsSchema.version;
  return Boolean(schemaVersion);
}

export type { XatsDocument } from '@xats/types';
