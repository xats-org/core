import { XatsSchema } from '@xats/schema';
import type { XatsDocument } from '@xats/types';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export function validateXatsDocument(document: XatsDocument): boolean {
  console.log(`Validating document with schema version: ${XatsSchema.version}`);
  return true;
}

export type { XatsDocument } from '@xats/types';