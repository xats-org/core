/**
 * @xats/examples - Example xats documents
 */

// @xats/types import removed - not currently used
// import type { XatsDocument } from '@xats/types';

// Export all version examples
export * as v010 from './v0.1.0/index.js';
export * as v020 from './v0.2.0/index.js';
export * as v030 from './v0.3.0/index.js';

/**
 * Example metadata
 */
export interface ExampleMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  features: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

/**
 * Get all available examples
 */
export function getAllExamples(): ExampleMetadata[] {
  return [...getV010Examples(), ...getV020Examples(), ...getV030Examples()];
}

/**
 * Get v0.1.0 examples
 */
export function getV010Examples(): ExampleMetadata[] {
  return [
    {
      id: 'minimal-v0.1.0',
      name: 'Minimal Document',
      description: 'The simplest valid xats document',
      version: '0.1.0',
      features: ['basic-structure'],
      difficulty: 'basic',
    },
    {
      id: 'complete-v0.1.0',
      name: 'Complete Textbook',
      description: 'A full textbook with all major features',
      version: '0.1.0',
      features: ['units', 'chapters', 'sections', 'all-block-types'],
      difficulty: 'advanced',
    },
  ];
}

/**
 * Get v0.2.0 examples
 */
export function getV020Examples(): ExampleMetadata[] {
  return [
    {
      id: 'accessibility-v0.2.0',
      name: 'Accessibility Features',
      description: 'Demonstrates accessibility features in v0.2.0',
      version: '0.2.0',
      features: ['accessibility', 'alt-text', 'descriptions'],
      difficulty: 'intermediate',
    },
    {
      id: 'adaptive-pathways-v0.2.0',
      name: 'Adaptive Pathways',
      description: 'Shows conditional learning paths based on assessments',
      version: '0.2.0',
      features: ['pathways', 'assessments', 'conditions'],
      difficulty: 'advanced',
    },
  ];
}

/**
 * Get v0.3.0 examples
 */
export function getV030Examples(): ExampleMetadata[] {
  return [
    {
      id: 'features-v0.3.0',
      name: 'v0.3.0 Features',
      description: 'Demonstrates new features introduced in v0.3.0',
      version: '0.3.0',
      features: ['file-modularity', 'interactive-content', 'annotations'],
      difficulty: 'advanced',
    },
  ];
}
