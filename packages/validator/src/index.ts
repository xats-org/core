import AjvDefault from 'ajv';
import addFormats from 'ajv-formats';

import { XatsSchema } from '@xats/schema';

import type { XatsDocument } from '@xats/types';

const ajv = new AjvDefault({ allErrors: true });
addFormats(ajv);

export function validateXatsDocument(_document: XatsDocument): boolean {
  // TODO: Implement actual validation logic
  // For now, just return true and reference the schema version
  const schemaVersion = XatsSchema.version;
  return Boolean(schemaVersion);
}

export type { XatsDocument } from '@xats/types';
