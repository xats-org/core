/**
 * @xats-org/utils - Utility functions for the xats ecosystem
 */

// JSON utilities
export {
  deepClone,
  deepMerge,
  isXatsObject,
  extractXatsObjects,
  findXatsObjectById,
  removeUndefined,
} from './json.js';

// URI utilities
export {
  isValidUri,
  isXatsCoreUri,
  isExtensionUri,
  extractNamespace,
  extractVocabularyType,
  buildCoreUri,
  buildExtensionUri,
  parseXatsUri,
  normalizeUri,
  type ParsedUri,
} from './uri.js';

// Text utilities
export {
  createSemanticText,
  extractPlainText,
  countWords,
  isEmptySemanticText,
  mergeConsecutiveRuns,
  splitSemanticText,
  truncateSemanticText,
  emphasize,
  strong,
  code,
  concatSemanticText,
} from './text.js';

// Path utilities
export {
  generatePath,
  parsePath,
  findByPath,
  extractPathways,
  evaluateCondition,
  getNextContent,
  buildBreadcrumbs,
  extractContentBlocks,
  countContentBlocks,
  getStructureDepth,
  type Breadcrumb,
} from './path.js';

// Collaborative project utilities
export {
  createCollaborativeProject,
  createProjectRole,
  createProjectDeliverable,
  createProjectPhase,
  createPeerAssessment,
  CollaborativeProjectValidator,
  CollaborativeProjectAnalyzer,
  CollaborativeProjectTemplates,
} from './collaborative.js';
