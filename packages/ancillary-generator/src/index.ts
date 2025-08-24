// Export types
export * from './types';

// Export base generator
export { BaseAncillaryGenerator } from './base-generator';

// Export specific generators
export { StudyGuideGenerator } from './generators/study-guide-generator';
export { SlideDeckGenerator } from './generators/slide-deck-generator';
export { TestBankExtractor } from './generators/test-bank-extractor';

// Re-export vocabularies for convenience
export { getAncillaryVocabulary, ancillaryTypes } from '@xats-org/vocabularies';