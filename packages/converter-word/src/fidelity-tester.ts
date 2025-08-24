/**
 * @fileoverview Round-trip fidelity testing for Word converter
 */

import { isEqual, difference } from 'lodash';

import type { RoundTripOptions, RoundTripResult, FidelityIssue, DocumentDifference } from './types';
import type { XatsDocument, ContentBlock, Unit, Chapter } from '@xats-org/types';

interface FormattingInfo {
  emphasisCount: number;
  strongCount: number;
  codeCount: number;
  underlineCount: number;
  strikethroughCount: number;
  subscriptCount: number;
  superscriptCount: number;
  mathInlineCount: number;
  referenceCount: number;
  citationCount: number;
}

interface FormattingDifference {
  path: string;
  description: string;
  original: number;
  converted: number;
}

interface StructureInfo {
  hasBodyMatter: boolean;
  hasFrontMatter: boolean;
  hasBackMatter: boolean;
  maxNestingLevel: number;
}

/**
 * Tests round-trip conversion fidelity between xats and Word formats
 */
export class FidelityTester {
  /**
   * Compare original and converted documents
   */
  async compare(
    original: XatsDocument,
    converted: XatsDocument,
    options: RoundTripOptions = {}
  ): Promise<RoundTripResult> {
    const threshold = options.fidelityThreshold || 0.85;
    const issues: FidelityIssue[] = [];
    const differences: DocumentDifference[] = [];

    try {
      // Calculate fidelity scores
      const contentFidelity = this.calculateContentFidelity(
        original,
        converted,
        issues,
        differences
      );
      const formattingFidelity = options.ignoreFormatting
        ? 1.0
        : this.calculateFormattingFidelity(original, converted, issues, differences);
      const structureFidelity = this.calculateStructureFidelity(
        original,
        converted,
        issues,
        differences
      );

      // Calculate overall score
      const weights = { content: 0.6, formatting: 0.2, structure: 0.2 };
      const overallScore =
        contentFidelity * weights.content +
        formattingFidelity * weights.formatting +
        structureFidelity * weights.structure;

      const success = overallScore >= threshold;

      return {
        success,
        fidelityScore: overallScore,
        contentFidelity,
        formattingFidelity,
        structureFidelity,
        issues,
        originalDocument: original,
        convertedDocument: converted,
        differences,
      };
    } catch (error) {
      return {
        success: false,
        fidelityScore: 0,
        contentFidelity: 0,
        formattingFidelity: 0,
        structureFidelity: 0,
        issues: [
          {
            type: 'content',
            severity: 'critical',
            description: `Fidelity testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        originalDocument: original,
        convertedDocument: converted,
        differences: [],
      };
    }
  }

  /**
   * Calculate content fidelity score
   */
  private calculateContentFidelity(
    original: XatsDocument,
    converted: XatsDocument,
    issues: FidelityIssue[],
    differences: DocumentDifference[]
  ): number {
    let score = 1.0;
    let totalChecks = 0;
    let passedChecks = 0;

    // Check basic document properties
    totalChecks++;
    if (original.bibliographicEntry?.title === converted.bibliographicEntry?.title) {
      passedChecks++;
    } else {
      score -= 0.1;
      issues.push({
        type: 'content',
        severity: 'minor',
        description: 'Document title mismatch',
        originalValue: original.bibliographicEntry?.title,
        convertedValue: converted.bibliographicEntry?.title,
      });
      differences.push({
        path: 'bibliographicEntry.title',
        type: 'modified',
        original: original.bibliographicEntry?.title,
        converted: converted.bibliographicEntry?.title,
        impact: 'low',
      });
    }

    // Check subject
    totalChecks++;
    if (original.subject === converted.subject) {
      passedChecks++;
    } else {
      score -= 0.05;
      issues.push({
        type: 'content',
        severity: 'minor',
        description: 'Subject mismatch',
        originalValue: original.subject,
        convertedValue: converted.subject,
      });
    }

    // Compare content blocks
    const originalBlocks = this.extractContentBlocks(original);
    const convertedBlocks = this.extractContentBlocks(converted);

    const blockFidelity = this.compareContentBlocks(
      originalBlocks,
      convertedBlocks,
      issues,
      differences
    );
    score = Math.min(score, blockFidelity);

    return Math.max(0, score);
  }

  /**
   * Calculate formatting fidelity score
   */
  private calculateFormattingFidelity(
    original: XatsDocument,
    converted: XatsDocument,
    issues: FidelityIssue[],
    differences: DocumentDifference[]
  ): number {
    let score = 1.0;

    // Check if semantic text formatting is preserved
    const originalFormatting = this.extractFormattingInfo(original);
    const convertedFormatting = this.extractFormattingInfo(converted);

    const formattingDifferences = this.compareFormatting(originalFormatting, convertedFormatting);

    for (const diff of formattingDifferences) {
      score -= 0.1;
      issues.push({
        type: 'formatting',
        severity: 'minor',
        description: `Formatting difference: ${diff.description}`,
        originalValue: diff.original,
        convertedValue: diff.converted,
      });
      differences.push({
        path: diff.path,
        type: 'modified',
        original: diff.original,
        converted: diff.converted,
        impact: 'medium',
      });
    }

    return Math.max(0, score);
  }

  /**
   * Calculate structure fidelity score
   */
  private calculateStructureFidelity(
    original: XatsDocument,
    converted: XatsDocument,
    issues: FidelityIssue[],
    differences: DocumentDifference[]
  ): number {
    let score = 1.0;

    // Check document structure
    const originalStructure = this.extractStructureInfo(original);
    const convertedStructure = this.extractStructureInfo(converted);

    if (originalStructure.hasBodyMatter !== convertedStructure.hasBodyMatter) {
      score -= 0.5;
      issues.push({
        type: 'structure',
        severity: 'major',
        description: 'Body matter presence mismatch',
      });
    }

    if (originalStructure.hasFrontMatter !== convertedStructure.hasFrontMatter) {
      score -= 0.2;
      issues.push({
        type: 'structure',
        severity: 'minor',
        description: 'Front matter presence mismatch',
      });
    }

    if (originalStructure.hasBackMatter !== convertedStructure.hasBackMatter) {
      score -= 0.2;
      issues.push({
        type: 'structure',
        severity: 'minor',
        description: 'Back matter presence mismatch',
      });
    }

    // Check nesting levels
    if (Math.abs(originalStructure.maxNestingLevel - convertedStructure.maxNestingLevel) > 1) {
      score -= 0.3;
      issues.push({
        type: 'structure',
        severity: 'major',
        description: 'Document nesting structure significantly changed',
        originalValue: originalStructure.maxNestingLevel,
        convertedValue: convertedStructure.maxNestingLevel,
      });
    }

    return Math.max(0, score);
  }

  /**
   * Extract content blocks from document
   */
  private extractContentBlocks(document: XatsDocument): ContentBlock[] {
    const blocks: ContentBlock[] = [];

    const processContents = (contents: unknown[]) => {
      for (const item of contents || []) {
        if (item && typeof item === 'object' && 'blockType' in item) {
          blocks.push(item as ContentBlock);
        }
        if (item && typeof item === 'object' && 'contents' in item) {
          processContents((item as any).contents);
        }
      }
    };

    if (document.frontMatter?.contents) {
      processContents(document.frontMatter.contents);
    }
    if (document.bodyMatter?.contents) {
      processContents(document.bodyMatter.contents);
    }
    if (document.backMatter?.contents) {
      processContents(document.backMatter.contents);
    }

    return blocks;
  }

  /**
   * Compare content blocks
   */
  private compareContentBlocks(
    originalBlocks: ContentBlock[],
    convertedBlocks: ContentBlock[],
    issues: FidelityIssue[],
    differences: DocumentDifference[]
  ): number {
    let score = 1.0;

    // Check block count
    if (originalBlocks.length !== convertedBlocks.length) {
      const ratio =
        Math.min(originalBlocks.length, convertedBlocks.length) /
        Math.max(originalBlocks.length, convertedBlocks.length);
      score *= ratio;

      issues.push({
        type: 'content',
        severity: 'major',
        description: `Block count mismatch: ${originalBlocks.length} vs ${convertedBlocks.length}`,
        originalValue: originalBlocks.length,
        convertedValue: convertedBlocks.length,
      });
    }

    // Compare individual blocks
    const minLength = Math.min(originalBlocks.length, convertedBlocks.length);
    let matchingBlocks = 0;

    for (let i = 0; i < minLength; i++) {
      const originalBlock = originalBlocks[i];
      const convertedBlock = convertedBlocks[i];

      if (this.blocksMatch(originalBlock, convertedBlock)) {
        matchingBlocks++;
      } else {
        issues.push({
          type: 'content',
          severity: 'minor',
          description: `Block ${i} content or type mismatch`,
          originalValue: originalBlock.blockType,
          convertedValue: convertedBlock.blockType,
        });
        differences.push({
          path: `blocks[${i}]`,
          type: 'modified',
          original: originalBlock,
          converted: convertedBlock,
          impact: 'medium',
        });
      }
    }

    if (minLength > 0) {
      const blockMatchRatio = matchingBlocks / minLength;
      score *= blockMatchRatio;
    }

    return score;
  }

  /**
   * Check if two blocks match
   */
  private blocksMatch(block1: ContentBlock, block2: ContentBlock): boolean {
    // Check block type
    if (block1.blockType !== block2.blockType) {
      return false;
    }

    // Check basic content similarity
    const text1 = this.extractTextFromBlock(block1);
    const text2 = this.extractTextFromBlock(block2);

    // Simple text similarity check
    if (text1 && text2) {
      const similarity = this.calculateTextSimilarity(text1, text2);
      return similarity > 0.8;
    }

    return true; // No text content to compare
  }

  /**
   * Extract text content from block
   */
  private extractTextFromBlock(block: ContentBlock): string {
    if (block.content && typeof block.content === 'object') {
      const content = block.content as any;
      if (content.text) {
        if (typeof content.text === 'string') {
          return content.text;
        }
        if (content.text.runs && Array.isArray(content.text.runs)) {
          return content.text.runs.map((run: any) => run.text || '').join('');
        }
      }
    }
    return '';
  }

  /**
   * Calculate text similarity
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, ' ').trim();

    const norm1 = normalize(text1);
    const norm2 = normalize(text2);

    if (norm1 === norm2) return 1.0;

    // Simple similarity based on common words
    const words1 = new Set(norm1.split(' '));
    const words2 = new Set(norm2.split(' '));

    const intersection = new Set([...words1].filter((word) => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Extract formatting information
   */
  private extractFormattingInfo(document: XatsDocument): FormattingInfo {
    const info = {
      emphasisCount: 0,
      strongCount: 0,
      codeCount: 0,
      underlineCount: 0,
      strikethroughCount: 0,
      subscriptCount: 0,
      superscriptCount: 0,
      mathInlineCount: 0,
      referenceCount: 0,
      citationCount: 0,
    };

    const processBlocks = (blocks: unknown[]) => {
      for (const block of blocks || []) {
        if (block && typeof block === 'object') {
          const contentBlock = block as any;
          if (contentBlock.content?.text?.runs && Array.isArray(contentBlock.content.text.runs)) {
            for (const run of contentBlock.content.text.runs) {
            switch (run.type) {
              case 'emphasis':
                info.emphasisCount++;
                break;
              case 'strong':
                info.strongCount++;
                break;
              case 'code':
                info.codeCount++;
                break;
              case 'underline':
                info.underlineCount++;
                break;
              case 'strikethrough':
                info.strikethroughCount++;
                break;
              case 'subscript':
                info.subscriptCount++;
                break;
              case 'superscript':
                info.superscriptCount++;
                break;
              case 'mathInline':
                info.mathInlineCount++;
                break;
              case 'reference':
                info.referenceCount++;
                break;
              case 'citation':
                info.citationCount++;
                break;
            }
          }
          }

          // Process nested content
          if (contentBlock.contents && Array.isArray(contentBlock.contents)) {
            processBlocks(contentBlock.contents);
          }
        }
      }
    };

    if (document.frontMatter?.preface) processBlocks(document.frontMatter.preface);
    if (document.bodyMatter?.contents) processBlocks(document.bodyMatter.contents);
    if (document.backMatter?.bibliography) processBlocks(document.backMatter.bibliography);

    return info;
  }

  /**
   * Compare formatting
   */
  private compareFormatting(original: FormattingInfo, converted: FormattingInfo): FormattingDifference[] {
    const differences: FormattingDifference[] = [];

    const formatTypes: (keyof FormattingInfo)[] = [
      'emphasisCount',
      'strongCount',
      'codeCount',
      'underlineCount',
      'strikethroughCount',
      'subscriptCount',
      'superscriptCount',
      'mathInlineCount',
      'referenceCount',
      'citationCount',
    ];

    for (const type of formatTypes) {
      if (original[type] !== converted[type]) {
        differences.push({
          path: `formatting.${type}`,
          description: `${type} count mismatch`,
          original: original[type],
          converted: converted[type],
        });
      }
    }

    return differences;
  }

  /**
   * Extract structure information
   */
  private extractStructureInfo(document: XatsDocument): StructureInfo {
    return {
      hasBodyMatter: !!document.bodyMatter,
      hasFrontMatter: !!document.frontMatter,
      hasBackMatter: !!document.backMatter,
      maxNestingLevel: this.calculateMaxNestingLevel(document),
    };
  }

  /**
   * Calculate maximum nesting level
   */
  private calculateMaxNestingLevel(document: XatsDocument): number {
    let maxLevel = 0;

    const calculateLevel = (contents: any[], currentLevel: number) => {
      maxLevel = Math.max(maxLevel, currentLevel);

      for (const item of contents || []) {
        if (item.contents) {
          calculateLevel(item.contents, currentLevel + 1);
        }
      }
    };

    if (document.bodyMatter?.contents) {
      calculateLevel(document.bodyMatter.contents, 1);
    }

    return maxLevel;
  }
}
