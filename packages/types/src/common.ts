/**
 * Common types used across the xats ecosystem
 */

/**
 * Base interface for all xats objects with universal metadata
 */
export interface XatsObject {
  id?: string;
  tags?: string[];
  extensions?: Record<string, unknown>;
  metadata?: {
    created?: string;
    modified?: string;
    author?: string;
    [key: string]: unknown;
  };
}

/**
 * Supported xats schema versions
 */
export type XatsVersion = '0.1.0' | '0.2.0' | '0.3.0' | '0.4.0' | '0.5.0';

/**
 * URI type for controlled vocabularies
 */
export type XatsUri = string;

/**
 * Language code following BCP 47
 */
export type LanguageCode = string;
