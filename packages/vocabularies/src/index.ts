import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Load a vocabulary definition by category and name
 */
export function loadVocabulary(
  category: 'blocks' | 'hints' | 'pathways' | 'placeholders' | 'triggers' | 'ancillary',
  name: string
) {
  const vocabularyPath = join(__dirname, '..', 'vocabularies', category, name, 'index.json');
  try {
    const content = readFileSync(vocabularyPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load vocabulary ${category}/${name}: ${error}`);
  }
}

/**
 * Get all available vocabulary names for a category
 */
export function getVocabularyNames(
  category: 'blocks' | 'hints' | 'pathways' | 'placeholders' | 'triggers' | 'ancillary'
): string[] {
  const categoryPath = join(__dirname, '..', 'vocabularies', category);
  try {
    const { readdirSync } = require('fs');
    return readdirSync(categoryPath, { withFileTypes: true })
      .filter((entry: any) => entry.isDirectory())
      .map((entry: any) => entry.name);
  } catch (error) {
    return [];
  }
}

/**
 * Block vocabulary loaders
 */
export const getBlockVocabulary = (name: string) => loadVocabulary('blocks', name);
export const getHintVocabulary = (name: string) => loadVocabulary('hints', name);
export const getPathwayVocabulary = (name: string) => loadVocabulary('pathways', name);
export const getPlaceholderVocabulary = (name: string) => loadVocabulary('placeholders', name);
export const getTriggerVocabulary = (name: string) => loadVocabulary('triggers', name);
export const getAncillaryVocabulary = (name: string) => loadVocabulary('ancillary', name);

/**
 * Available vocabulary types
 */
export const blockTypes = getVocabularyNames('blocks');
export const hintTypes = getVocabularyNames('hints');
export const pathwayTypes = getVocabularyNames('pathways');
export const placeholderTypes = getVocabularyNames('placeholders');
export const triggerTypes = getVocabularyNames('triggers');
export const ancillaryTypes = getVocabularyNames('ancillary');

/**
 * Vocabulary URI constants
 */
export const VOCABULARY_BASE_URI = 'https://xats.org/vocabularies';

export const getVocabularyURI = (category: string, name: string) =>
  `${VOCABULARY_BASE_URI}/${category}/${name}`;
