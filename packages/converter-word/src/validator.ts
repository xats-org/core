/**
 * @fileoverview Word document validation
 */

import JSZip from 'jszip';

import type { FormatValidationResult, WordValidationIssue } from './types';
import type { XatsDocument } from '@xats-org/types';

/**
 * Validates Word documents and xats documents for conversion compatibility
 */
export class WordValidator {
  /**
   * Validate Word document format and structure
   */
  async validate(content: string | Buffer): Promise<FormatValidationResult> {
    const issues: WordValidationIssue[] = [];
    let structureValid = true;
    let contentValid = true;
    let metadataValid = true;

    try {
      // Convert string to buffer if needed
      const buffer = typeof content === 'string' ? Buffer.from(content, 'base64') : content;

      // Check if it's a valid ZIP file (docx format)
      const zip = await JSZip.loadAsync(buffer);

      // Check for required DOCX structure
      const requiredFiles = ['[Content_Types].xml', '_rels/.rels', 'word/document.xml'];

      for (const file of requiredFiles) {
        if (!zip.files[file]) {
          structureValid = false;
          issues.push({
            type: 'structure',
            severity: 'error',
            message: `Missing required file: ${file}`,
            suggestion: 'Ensure the document is a valid DOCX file',
          });
        }
      }

      // Validate document.xml content
      if (zip.files['word/document.xml']) {
        const documentXml = await zip.files['word/document.xml'].async('string');

        if (!documentXml.includes('<w:document')) {
          contentValid = false;
          issues.push({
            type: 'content',
            severity: 'error',
            message: 'Invalid document.xml structure',
            suggestion: 'Document must contain valid Word document markup',
          });
        }
      }

      // Check for app properties (metadata)
      if (!zip.files['docProps/app.xml']) {
        metadataValid = false;
        issues.push({
          type: 'metadata',
          severity: 'warning',
          message: 'Missing application properties',
          suggestion: 'Document may be missing important metadata',
        });
      }

      // Validate styles if present
      if (zip.files['word/styles.xml']) {
        const stylesXml = await zip.files['word/styles.xml'].async('string');

        if (!stylesXml.includes('<w:styles')) {
          issues.push({
            type: 'style',
            severity: 'warning',
            message: 'Invalid styles.xml structure',
            suggestion: 'Styles may not be preserved correctly',
          });
        }
      }
    } catch (error) {
      structureValid = false;
      issues.push({
        type: 'structure',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Unknown validation error',
        suggestion: 'Ensure the file is a valid DOCX document',
      });
    }

    return {
      valid: structureValid && contentValid,
      format: 'docx',
      structureValid,
      contentValid,
      metadataValid,
      errors: issues.filter((i) => i.severity === 'error').map((i) => i.message),
      warnings: issues.filter((i) => i.severity === 'warning').map((i) => i.message),
      wordSpecificIssues: issues,
    };
  }

  /**
   * Validate xats document for Word conversion compatibility
   */
  validateXatsDocument(document: XatsDocument): FormatValidationResult {
    const issues: WordValidationIssue[] = [];
    let structureValid = true;
    let contentValid = true;

    try {
      // Check basic document structure
      if (!document.schemaVersion) {
        structureValid = false;
        issues.push({
          type: 'structure',
          severity: 'error',
          message: 'Missing schema version',
          suggestion: 'Add schemaVersion property to document',
        });
      }

      if (!document.bodyMatter) {
        structureValid = false;
        issues.push({
          type: 'structure',
          severity: 'error',
          message: 'Missing body matter',
          suggestion: 'Document must have bodyMatter content',
        });
      }

      if (!document.bibliographicEntry) {
        issues.push({
          type: 'metadata',
          severity: 'warning',
          message: 'Missing bibliographic entry',
          suggestion: 'Add bibliographic entry for proper Word metadata',
        });
      }

      // Check for unsupported features
      const unsupportedBlockTypes = [
        'https://xats.org/vocabularies/blocks/interactive',
        'https://xats.org/vocabularies/blocks/3dModel',
        'https://xats.org/vocabularies/blocks/animation',
      ];

      // Recursively check block types
      this.checkBlockTypes(document.bodyMatter?.contents || [], unsupportedBlockTypes, issues);

      // Check for complex mathematical content
      this.checkMathComplexity(document.bodyMatter?.contents || [], issues);
    } catch (error) {
      contentValid = false;
      issues.push({
        type: 'content',
        severity: 'error',
        message: error instanceof Error ? error.message : 'Document validation failed',
        suggestion: 'Ensure document follows xats schema',
      });
    }

    return {
      valid: structureValid && contentValid,
      format: 'docx',
      structureValid,
      contentValid,
      metadataValid: true,
      errors: issues.filter((i) => i.severity === 'error').map((i) => i.message),
      warnings: issues.filter((i) => i.severity === 'warning').map((i) => i.message),
      wordSpecificIssues: issues,
    };
  }

  /**
   * Check for unsupported block types recursively
   */
  private checkBlockTypes(
    contents: unknown[],
    unsupportedTypes: string[],
    issues: WordValidationIssue[]
  ): void {
    for (const item of contents) {
      if (item && typeof item === 'object' && 'blockType' in item) {
        const contentItem = item as any;
        if (contentItem.blockType && unsupportedTypes.includes(contentItem.blockType)) {
        issues.push({
          type: 'content',
          severity: 'warning',
          message: `Unsupported block type for Word conversion: ${contentItem.blockType}`,
          suggestion: 'Consider alternative representation or skip this block',
        });
        }

        // Check nested contents
        if (contentItem.contents && Array.isArray(contentItem.contents)) {
          this.checkBlockTypes(contentItem.contents, unsupportedTypes, issues);
        }

        if (contentItem.bodyMatter?.contents && Array.isArray(contentItem.bodyMatter.contents)) {
          this.checkBlockTypes(contentItem.bodyMatter.contents, unsupportedTypes, issues);
        }
      }
    }
  }

  /**
   * Check mathematical content complexity
   */
  private checkMathComplexity(contents: unknown[], issues: WordValidationIssue[]): void {
    for (const item of contents) {
      if (item && typeof item === 'object' && 'blockType' in item) {
        const contentItem = item as any;
        if (contentItem.blockType === 'https://xats.org/vocabularies/blocks/mathBlock') {
          const mathContent = contentItem.content?.latex || contentItem.content?.mathML || '';

          // Check for complex LaTeX that might not convert well
          const complexPatterns = [/\\tikz/, /\\pgfplots/, /\\xy/, /\\diagram/, /\\commutative/];

          for (const pattern of complexPatterns) {
            if (pattern.test(mathContent)) {
              issues.push({
                type: 'content',
                severity: 'warning',
                message: 'Complex mathematical diagrams may not convert perfectly to Word',
                suggestion: 'Consider providing alternative representations for complex diagrams',
              });
              break;
            }
          }
        }

        // Check nested contents
        if (contentItem.contents && Array.isArray(contentItem.contents)) {
          this.checkMathComplexity(contentItem.contents, issues);
        }
      }
    }
  }
}
