/**
 * @xats/types - Shared TypeScript Types for xats
 *
 * This package contains all shared type definitions used across the xats monorepo.
 * Types are organized by domain to make them easy to discover and use.
 */

// Re-export all type modules
export * from './document.js';
export * from './validation.js';
export * from './rendering.js';
export * from './file-modularity.js';
export * from './schema.js';
export * from './common.js';

// Version information
export const XATS_VERSION = '0.4.0';
export const SCHEMA_VERSION = '0.3.0';
