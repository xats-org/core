/**
 * xats Core Library
 * 
 * Main entry point for the xats core validation and tooling library.
 */

export {
  XatsValidator,
  createValidator,
  validateXats,
  validateXatsFile,
  type ValidationResult,
  type ValidationError,
  type ValidatorOptions
} from './validator.js';

// Version information
export const version = '0.1.0';
export const schemaVersion = '0.1.0';