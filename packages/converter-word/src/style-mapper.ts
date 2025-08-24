/**
 * @fileoverview Style mapping between xats and Word formats
 */

import type { WordStyleMappings, StyleReport, StyleConflict } from './types';

/**
 * Maps styles between xats block types and Word styles
 */
export class StyleMapper {
  private readonly defaultMappings: WordStyleMappings;
  private customMappings: WordStyleMappings = {};

  constructor(customMappings: WordStyleMappings = {}) {
    this.defaultMappings = {
      paragraphs: {
        // Standard Word styles to xats block types
        Normal: 'https://xats.org/vocabularies/blocks/paragraph',
        'Heading 1': 'https://xats.org/vocabularies/blocks/heading',
        'Heading 2': 'https://xats.org/vocabularies/blocks/heading',
        'Heading 3': 'https://xats.org/vocabularies/blocks/heading',
        'Heading 4': 'https://xats.org/vocabularies/blocks/heading',
        'Heading 5': 'https://xats.org/vocabularies/blocks/heading',
        'Heading 6': 'https://xats.org/vocabularies/blocks/heading',
        Quote: 'https://xats.org/vocabularies/blocks/blockquote',
        'Intense Quote': 'https://xats.org/vocabularies/blocks/blockquote',
        Code: 'https://xats.org/vocabularies/blocks/codeBlock',

        // Educational-specific styles
        'Learning Objective': 'https://xats.org/vocabularies/blocks/learningObjective',
        'Key Term': 'https://xats.org/vocabularies/blocks/keyTerm',
        'Case Study': 'https://xats.org/vocabularies/blocks/caseStudy',
        Definition: 'https://xats.org/vocabularies/blocks/definition',
        Example: 'https://xats.org/vocabularies/blocks/example',
        Exercise: 'https://xats.org/vocabularies/blocks/exercise',
        Note: 'https://xats.org/vocabularies/blocks/note',
        Warning: 'https://xats.org/vocabularies/blocks/warning',
        Tip: 'https://xats.org/vocabularies/blocks/tip',
        Summary: 'https://xats.org/vocabularies/blocks/summary',
      },
      characters: {
        // Character-level formatting
        Strong: 'strong',
        Emphasis: 'emphasis',
        'Code Char': 'code',
        'Key Term Char': 'keyTerm',
        Hyperlink: 'reference',
        Citation: 'citation',
      },
      tables: {
        'Table Grid': 'https://xats.org/vocabularies/blocks/table',
        'Table Professional': 'https://xats.org/vocabularies/blocks/table',
        'Data Table': 'https://xats.org/vocabularies/blocks/table',
      },
      lists: {
        'List Paragraph': 'https://xats.org/vocabularies/blocks/list',
        Bullet: 'https://xats.org/vocabularies/blocks/list',
        Number: 'https://xats.org/vocabularies/blocks/list',
      },
    };

    this.customMappings = customMappings;
  }

  /**
   * Get xats block type for Word style
   */
  getXatsBlockType(
    wordStyle: string,
    category: keyof WordStyleMappings = 'paragraphs'
  ): string | null {
    // Check custom mappings first
    const customMapping = this.customMappings[category]?.[wordStyle];
    if (customMapping) {
      return customMapping;
    }

    // Fall back to default mappings
    return this.defaultMappings[category]?.[wordStyle] || null;
  }

  /**
   * Get Word style for xats block type
   */
  getWordStyle(
    xatsBlockType: string,
    category: keyof WordStyleMappings = 'paragraphs'
  ): string | null {
    // Search in custom mappings first
    const customMappings = this.customMappings[category] || {};
    for (const [wordStyle, blockType] of Object.entries(customMappings)) {
      if (blockType === xatsBlockType) {
        return wordStyle;
      }
    }

    // Fall back to default mappings
    const defaultMappings = this.defaultMappings[category] || {};
    for (const [wordStyle, blockType] of Object.entries(defaultMappings)) {
      if (blockType === xatsBlockType) {
        return wordStyle;
      }
    }

    return null;
  }

  /**
   * Create Word style name from xats block type
   */
  createWordStyleName(xatsBlockType: string): string {
    // Extract the last part of the URI and convert to title case
    const parts = xatsBlockType.split('/');
    const lastPart = parts[parts.length - 1];

    // Convert camelCase to Title Case
    return lastPart
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  /**
   * Generate style mappings report
   */
  generateStyleReport(usedStyles: string[], requiredBlockTypes: string[]): StyleReport {
    const mappedStyles: Record<string, string> = {};
    const unmappedStyles: string[] = [];
    const newStyles: string[] = [];
    const conflicts: StyleConflict[] = [];

    // Check which styles have mappings
    for (const style of usedStyles) {
      const blockType = this.getXatsBlockType(style);
      if (blockType) {
        mappedStyles[style] = blockType;
      } else {
        unmappedStyles.push(style);
      }
    }

    // Check which block types need new Word styles
    for (const blockType of requiredBlockTypes) {
      const wordStyle = this.getWordStyle(blockType);
      if (!wordStyle) {
        const newStyleName = this.createWordStyleName(blockType);
        newStyles.push(newStyleName);

        // Check for potential conflicts
        if (usedStyles.includes(newStyleName)) {
          conflicts.push({
            styleName: newStyleName,
            conflict: `Style name already exists in document`,
            resolution: `Will use ${newStyleName}_xats instead`,
          });
        }
      }
    }

    return {
      mappedStyles,
      unmappedStyles,
      newStyles,
      conflicts,
    };
  }

  /**
   * Update custom mappings
   */
  updateMappings(mappings: WordStyleMappings): void {
    this.customMappings = {
      paragraphs: { ...this.customMappings.paragraphs, ...mappings.paragraphs },
      characters: { ...this.customMappings.characters, ...mappings.characters },
      tables: { ...this.customMappings.tables, ...mappings.tables },
      lists: { ...this.customMappings.lists, ...mappings.lists },
    };
  }

  /**
   * Get all available mappings
   */
  getAllMappings(): WordStyleMappings {
    return {
      paragraphs: { ...this.defaultMappings.paragraphs, ...this.customMappings.paragraphs },
      characters: { ...this.defaultMappings.characters, ...this.customMappings.characters },
      tables: { ...this.defaultMappings.tables, ...this.customMappings.tables },
      lists: { ...this.defaultMappings.lists, ...this.customMappings.lists },
    };
  }

  /**
   * Check if a Word style is educational content
   */
  isEducationalStyle(wordStyle: string): boolean {
    const educationalStyles = [
      'Learning Objective',
      'Key Term',
      'Case Study',
      'Definition',
      'Example',
      'Exercise',
      'Note',
      'Warning',
      'Tip',
      'Summary',
    ];

    return educationalStyles.includes(wordStyle);
  }

  /**
   * Get heading level from Word style
   */
  getHeadingLevel(wordStyle: string): number | null {
    const match = wordStyle.match(/^Heading (\d+)$/);
    if (match) {
      return parseInt(match[1], 10);
    }

    // Check for other heading patterns
    const patterns = [
      { pattern: /^Title$/i, level: 1 },
      { pattern: /^Subtitle$/i, level: 2 },
      { pattern: /^Chapter$/i, level: 1 },
      { pattern: /^Section$/i, level: 2 },
    ];

    for (const { pattern, level } of patterns) {
      if (pattern.test(wordStyle)) {
        return level;
      }
    }

    return null;
  }

  /**
   * Create Word heading style from level
   */
  createHeadingStyle(level: number): string {
    if (level >= 1 && level <= 6) {
      return `Heading ${level}`;
    }
    return 'Normal';
  }
}
