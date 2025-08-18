/**
 * WCAG 2.1 AA Automated Validation Rules for xats Schema
 * Provides automated checking for WCAG compliance in CI/CD pipelines
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Types for WCAG validation
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: WcagScore;
}

interface ValidationError {
  wcagCriterion: string;
  level: 'A' | 'AA' | 'AAA';
  severity: 'critical' | 'major' | 'minor';
  message: string;
  location: string;
  elementId?: string;
  suggestedFix?: string;
}

interface ValidationWarning {
  wcagCriterion: string;
  message: string;
  location: string;
  recommendation: string;
}

interface WcagScore {
  overallCompliance: number; // 0-100
  levelA: number;
  levelAA: number; 
  criticalIssues: number;
  majorIssues: number;
  minorIssues: number;
}

/**
 * Main WCAG Validator Class
 */
export class WcagValidator {
  private ajv: Ajv;
  private rules: Map<string, ValidationRule>;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.rules = new Map();
    this.initializeRules();
  }

  /**
   * Validate a complete xats document against WCAG 2.1 AA
   */
  public validateDocument(document: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Run all validation rules
    for (const [ruleId, rule] of this.rules) {
      try {
        const ruleResult = rule.validate(document);
        errors.push(...ruleResult.errors);
        warnings.push(...ruleResult.warnings);
      } catch (error) {
        errors.push({
          wcagCriterion: ruleId,
          level: 'AA',
          severity: 'critical',
          message: `Validation rule failed: ${error}`,
          location: 'document',
          suggestedFix: 'Contact development team'
        });
      }
    }

    const score = this.calculateScore(errors, warnings);

    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Initialize all WCAG validation rules
   */
  private initializeRules(): void {
    // WCAG 1.1.1 - Non-text Content
    this.rules.set('1.1.1', new TextAlternativesRule());
    
    // WCAG 1.3.1 - Info and Relationships  
    this.rules.set('1.3.1', new InfoAndRelationshipsRule());
    
    // WCAG 1.3.2 - Meaningful Sequence
    this.rules.set('1.3.2', new MeaningfulSequenceRule());
    
    // WCAG 2.4.1 - Bypass Blocks
    this.rules.set('2.4.1', new BypassBlocksRule());
    
    // WCAG 2.4.3 - Focus Order
    this.rules.set('2.4.3', new FocusOrderRule());
    
    // WCAG 2.4.6 - Headings and Labels
    this.rules.set('2.4.6', new HeadingsAndLabelsRule());
    
    // WCAG 3.1.1 - Language of Page
    this.rules.set('3.1.1', new LanguageOfPageRule());
    
    // WCAG 3.1.2 - Language of Parts
    this.rules.set('3.1.2', new LanguageOfPartsRule());
  }

  /**
   * Calculate WCAG compliance score
   */
  private calculateScore(errors: ValidationError[], warnings: ValidationWarning[]): WcagScore {
    const criticalIssues = errors.filter(e => e.severity === 'critical').length;
    const majorIssues = errors.filter(e => e.severity === 'major').length;
    const minorIssues = errors.filter(e => e.severity === 'minor').length;

    const levelAErrors = errors.filter(e => e.level === 'A').length;
    const levelAAErrors = errors.filter(e => e.level === 'AA').length;

    // Scoring algorithm - heavily penalize critical issues
    const maxPossibleScore = 100;
    const criticalPenalty = criticalIssues * 20;
    const majorPenalty = majorIssues * 10;
    const minorPenalty = minorIssues * 5;
    const warningPenalty = warnings.length * 2;

    const overallCompliance = Math.max(0, maxPossibleScore - criticalPenalty - majorPenalty - minorPenalty - warningPenalty);

    return {
      overallCompliance,
      levelA: levelAErrors === 0 ? 100 : Math.max(0, 100 - (levelAErrors * 15)),
      levelAA: levelAAErrors === 0 ? 100 : Math.max(0, 100 - (levelAAErrors * 10)),
      criticalIssues,
      majorIssues,
      minorIssues
    };
  }
}

/**
 * Base class for validation rules
 */
abstract class ValidationRule {
  abstract wcagCriterion: string;
  abstract level: 'A' | 'AA' | 'AAA';
  abstract validate(document: any): { errors: ValidationError[]; warnings: ValidationWarning[] };

  protected createError(severity: 'critical' | 'major' | 'minor', message: string, location: string, elementId?: string, suggestedFix?: string): ValidationError {
    return {
      wcagCriterion: this.wcagCriterion,
      level: this.level,
      severity,
      message,
      location,
      elementId,
      suggestedFix
    };
  }

  protected createWarning(message: string, location: string, recommendation: string): ValidationWarning {
    return {
      wcagCriterion: this.wcagCriterion,
      message,
      location,
      recommendation
    };
  }
}

/**
 * WCAG 1.1.1 - Non-text Content
 */
class TextAlternativesRule extends ValidationRule {
  wcagCriterion = '1.1.1';
  level = 'A' as const;

  validate(document: any): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check image resources
    if (document.resources) {
      document.resources.forEach((resource: any) => {
        if (resource.type === 'https://xats.org/core/resources/image') {
          if (!resource.altText) {
            errors.push(this.createError(
              'critical',
              `Image resource "${resource.id || `index-${index}`}" is missing alt text`,
              `resources[${index}]`,
              resource.id,
              'Add altText property with meaningful description'
            ));
          } else if (resource.altText.trim().length < 3) {
            errors.push(this.createError(
              'major',
              `Alt text for image "${resource.id}" is too short to be meaningful`,
              `resources[${index}].altText`,
              resource.id,
              'Provide more descriptive alt text (at least 3 characters)'
            ));
          } else if (this.hasPooorAltTextPatterns(resource.altText)) {
            warnings.push(this.createWarning(
              `Alt text for image "${resource.id}" may not be optimal: "${resource.altText}"`,
              `resources[${index}].altText`,
              'Avoid phrases like "image of", "picture of", or filename references. Focus on the content and function.'
            ));
          }

          // Check for complex images that should have long descriptions
          if (this.isComplexImage(resource) && !resource.longDescription) {
            warnings.push(this.createWarning(
              `Complex image "${resource.id}" should include a long description`,
              `resources[${index}]`,
              'Add longDescription property for complex images like charts, diagrams, or maps'
            ));
          }
        }
      });
    }

    // Check math blocks
    this.validateContentBlocks(document.bodyMatter?.contents || [], errors, warnings);

    return { errors, warnings };
  }

  private validateContentBlocks(contents: any[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    contents.forEach((item, index) => {
      if (item.sections) {
        item.sections.forEach((section: any) => {
          this.validateContentBlocks(section.content || [], errors, warnings);
        });
      }
      
      if (item.content && Array.isArray(item.content)) {
        item.content.forEach((block: any, blockIndex: number) => {
          if (block.blockType === 'https://xats.org/core/blocks/mathBlock') {
            if (!block.content.altText && !block.content.speechText) {
              errors.push(this.createError(
                'critical',
                `Math block "${block.id}" is missing text alternatives`,
                `content[${blockIndex}]`,
                block.id,
                'Add altText and/or speechText properties for math expressions'
              ));
            }
          }
          
          if (block.blockType === 'https://xats.org/core/blocks/figure') {
            // Figure should reference a resource with proper alt text
            if (!block.content.altText && !block.content.resourceId) {
              errors.push(this.createError(
                'major',
                `Figure block "${block.id}" has no alt text and no resource reference`,
                `content[${blockIndex}]`,
                block.id,
                'Add altText property or ensure referenced resource has proper alt text'
              ));
            }
          }
        });
      }
    });
  }

  private hasPooorAltTextPatterns(altText: string): boolean {
    const poorPatterns = [
      /^image of/i,
      /^picture of/i,
      /^photo of/i,
      /^graphic of/i,
      /filename\.(jpg|png|gif|svg)$/i,
      /^icon$/i,
      /^button$/i,
      /^link$/i
    ];
    
    return poorPatterns.some(pattern => pattern.test(altText));
  }

  private isComplexImage(resource: any): boolean {
    const complexKeywords = ['chart', 'graph', 'diagram', 'map', 'flowchart', 'plot'];
    const url = resource.url?.toLowerCase() || '';
    const altText = resource.altText?.toLowerCase() || '';
    
    return complexKeywords.some(keyword => 
      url.includes(keyword) || altText.includes(keyword)
    );
  }
}

/**
 * WCAG 1.3.1 - Info and Relationships
 */
class InfoAndRelationshipsRule extends ValidationRule {
  wcagCriterion = '1.3.1';
  level = 'A' as const;

  validate(document: any): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.validateStructuralElements(document.bodyMatter?.contents || [], errors, warnings);

    return { errors, warnings };
  }

  private validateStructuralElements(contents: any[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    contents.forEach((item, index) => {
      // Validate headings have proper level specification
      if (item.sections) {
        item.sections.forEach((section: any) => {
          this.validateContentBlocks(section.content || [], errors, warnings);
        });
      }
    });
  }

  private validateContentBlocks(blocks: any[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    blocks.forEach((block: any) => {
      if (block.blockType === 'https://xats.org/core/blocks/heading') {
        if (!block.content.level && !block.accessibilityMetadata?.headingLevel) {
          errors.push(this.createError(
            'major',
            `Heading block "${block.id}" is missing level specification`,
            `content[${index}]`,
            block.id,
            'Add level property (1-6) to heading content or headingLevel in accessibilityMetadata'
          ));
        }
      }

      if (block.blockType === 'https://xats.org/core/blocks/table') {
        this.validateTableStructure(block, index, errors, warnings);
      }
    });
  }

  private validateTableStructure(tableBlock: any, index: number, errors: ValidationError[], warnings: ValidationWarning[]): void {
    if (!tableBlock.content.headers || tableBlock.content.headers.length === 0) {
      errors.push(this.createError(
        'major',
        `Table "${tableBlock.id}" is missing header row`,
        `content[${index}].content`,
        tableBlock.id,
        'Add headers array to table content'
      ));
      return;
    }

    // Check if headers have proper scope attributes (enhancement for v0.2.0)
    tableBlock.content.headers.forEach((header: any, headerIndex: number) => {
      if (header.scope && !['col', 'row', 'colgroup', 'rowgroup'].includes(header.scope)) {
        errors.push(this.createError(
          'minor',
          `Table header has invalid scope value: "${header.scope}"`,
          `content[${index}].content.headers[${headerIndex}]`,
          tableBlock.id,
          'Use valid scope values: col, row, colgroup, rowgroup'
        ));
      }
    });

    // Warn if complex table lacks proper header associations
    if (tableBlock.content.rows && tableBlock.content.rows.length > 10) {
      warnings.push(this.createWarning(
        `Large table "${tableBlock.id}" may need enhanced header associations`,
        `content[${index}]`,
        'Consider adding header associations for improved accessibility in complex tables'
      ));
    }
  }
}

/**
 * WCAG 1.3.2 - Meaningful Sequence
 */
class MeaningfulSequenceRule extends ValidationRule {
  wcagCriterion = '1.3.2';
  level = 'A' as const;

  validate(document: any): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.validateContentSequence(document.bodyMatter?.contents || [], errors, warnings);

    return { errors, warnings };
  }

  private validateContentSequence(contents: any[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    contents.forEach((item, index) => {
      if (item.sections) {
        item.sections.forEach((section: any) => {
          this.validateSectionSequence(section.content || [], errors, warnings, section.id);
        });
      }
    });
  }

  private validateSectionSequence(blocks: any[], errors: ValidationError[], warnings: ValidationWarning[], sectionId: string): void {
    let previousHeadingLevel = 0;

    blocks.forEach((block: any) => {
      if (block.blockType === 'https://xats.org/core/blocks/heading') {
        const currentLevel = block.content.level || block.accessibilityMetadata?.headingLevel || 0;
        
        if (currentLevel > 0 && currentLevel > previousHeadingLevel + 1) {
          errors.push(this.createError(
            'major',
            `Heading level sequence violation: skipped from level ${previousHeadingLevel} to ${currentLevel}`,
            `section[${sectionId}].content[${index}]`,
            block.id,
            `Use heading level ${previousHeadingLevel + 1} instead of ${currentLevel}`
          ));
        }
        
        if (currentLevel > 0) {
          previousHeadingLevel = currentLevel;
        }
      }

      // Check logical flow: heading should come before related content
      if (index > 0 && block.blockType === 'https://xats.org/core/blocks/paragraph') {
        const previousBlock = blocks[index - 1];
        if (previousBlock.blockType === 'https://xats.org/core/blocks/figure') {
          warnings.push(this.createWarning(
            `Paragraph follows figure without intermediate heading in "${sectionId}"`,
            `section[${sectionId}].content[${index}]`,
            'Consider adding explanatory text or heading between figures and paragraphs'
          ));
        }
      }
    });
  }
}

/**
 * WCAG 2.4.1 - Bypass Blocks
 */
class BypassBlocksRule extends ValidationRule {
  wcagCriterion = '2.4.1';
  level = 'A' as const;

  validate(document: any): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const hasSkipNavigation = this.findSkipNavigation(document.bodyMatter?.contents || []);

    if (!hasSkipNavigation) {
      warnings.push(this.createWarning(
        'Document appears to lack skip navigation mechanisms',
        'document.bodyMatter',
        'Consider adding skip navigation links for better keyboard accessibility. Use blockType: "https://xats.org/core/blocks/skipNavigation"'
      ));
    }

    return { errors, warnings };
  }

  private findSkipNavigation(contents: any[]): boolean {
    for (const item of contents) {
      if (item.sections) {
        for (const section of item.sections) {
          if (section.content) {
            for (const block of section.content) {
              if (block.blockType === 'https://xats.org/core/blocks/skipNavigation') {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }
}

/**
 * WCAG 2.4.3 - Focus Order
 */
class FocusOrderRule extends ValidationRule {
  wcagCriterion = '2.4.3';
  level = 'A' as const;

  validate(document: any): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const focusableElements = this.findFocusableElements(document.bodyMatter?.contents || []);
    
    if (focusableElements.length > 1) {
      this.validateTabOrder(focusableElements, errors, warnings);
    }

    return { errors, warnings };
  }

  private findFocusableElements(contents: any[]): any[] {
    const focusableElements: any[] = [];

    const searchContent = (items: any[]) => {
      items.forEach(item => {
        if (item.sections) {
          item.sections.forEach((section: any) => {
            if (section.content) {
              section.content.forEach((block: any) => {
                if (this.isFocusableBlockType(block.blockType) || block.accessibilityMetadata?.focusable) {
                  focusableElements.push(block);
                }
              });
            }
          });
        }
      });
    };

    searchContent(contents);
    return focusableElements;
  }

  private isFocusableBlockType(blockType: string): boolean {
    const focusableTypes = [
      'https://xats.org/core/blocks/button',
      'https://xats.org/core/blocks/input',
      'https://xats.org/core/blocks/multipleChoice',
      'https://xats.org/core/blocks/fillInBlank',
      'https://xats.org/core/blocks/skipNavigation'
    ];
    return focusableTypes.includes(blockType);
  }

  private validateTabOrder(elements: any[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    const elementsWithTabOrder = elements.filter(el => el.accessibilityMetadata?.tabOrder);
    
    if (elementsWithTabOrder.length > 1) {
      const tabOrders = elementsWithTabOrder.map(el => el.accessibilityMetadata.tabOrder);
      const hasDuplicates = tabOrders.length !== new Set(tabOrders).size;
      
      if (hasDuplicates) {
        errors.push(this.createError(
          'major',
          'Duplicate tab order values found in focusable elements',
          'accessibilityMetadata.tabOrder',
          undefined,
          'Ensure each focusable element has a unique tab order value'
        ));
      }
    }

    if (elements.length > 3 && elementsWithTabOrder.length < elements.length / 2) {
      warnings.push(this.createWarning(
        'Many focusable elements lack explicit tab order specification',
        'document.bodyMatter',
        'Consider specifying tabOrder in accessibilityMetadata for better keyboard navigation'
      ));
    }
  }
}

/**
 * WCAG 2.4.6 - Headings and Labels
 */
class HeadingsAndLabelsRule extends ValidationRule {
  wcagCriterion = '2.4.6';
  level = 'AA' as const;

  validate(document: any): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    this.validateHeadingText(document.bodyMatter?.contents || [], errors, warnings);

    return { errors, warnings };
  }

  private validateHeadingText(contents: any[], errors: ValidationError[], warnings: ValidationWarning[]): void {
    const searchContent = (items: any[]) => {
      items.forEach(item => {
        if (item.sections) {
          item.sections.forEach((section: any) => {
            if (section.content) {
              section.content.forEach((block: any) => {
                if (block.blockType === 'https://xats.org/core/blocks/heading') {
                  this.validateHeadingContent(block, index, errors, warnings);
                }
              });
            }
          });
        }
      });
    };

    searchContent(contents);
  }

  private validateHeadingContent(headingBlock: any, index: number, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const headingText = this.extractTextFromSemanticText(headingBlock.content.text);

    if (!headingText || headingText.trim().length === 0) {
      errors.push(this.createError(
        'major',
        `Heading "${headingBlock.id}" has no text content`,
        `content[${index}]`,
        headingBlock.id,
        'Add meaningful text content to heading'
      ));
      return;
    }

    if (headingText.length < 3) {
      warnings.push(this.createWarning(
        `Heading "${headingBlock.id}" has very short text: "${headingText}"`,
        `content[${index}]`,
        'Consider using more descriptive heading text'
      ));
    }

    // Check for non-descriptive patterns
    const nonDescriptivePatterns = [
      /^click here/i,
      /^read more/i,
      /^more info/i,
      /^click/i,
      /^here/i,
      /^section \d+$/i
    ];

    if (nonDescriptivePatterns.some(pattern => pattern.test(headingText))) {
      errors.push(this.createError(
        'minor',
        `Heading text "${headingText}" is not descriptive enough`,
        `content[${index}]`,
        headingBlock.id,
        'Use headings that describe the content that follows'
      ));
    }
  }

  private extractTextFromSemanticText(semanticText: any): string {
    if (!semanticText || !semanticText.runs) {
      return '';
    }

    return semanticText.runs
      .filter((run: any) => run.type === 'text')
      .map((run: any) => run.text)
      .join('');
  }
}

/**
 * WCAG 3.1.1 - Language of Page
 */
class LanguageOfPageRule extends ValidationRule {
  wcagCriterion = '3.1.1';
  level = 'A' as const;

  validate(document: any): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const hasDocumentLanguage = document.language || 
                               document.bibliographicEntry?.language ||
                               document.extensions?.language;

    if (!hasDocumentLanguage) {
      errors.push(this.createError(
        'critical',
        'Document is missing primary language identification',
        'document',
        undefined,
        'Add language property at document level or in bibliographicEntry (e.g., "en-US")'
      ));
    } else if (!this.isValidLanguageTag(hasDocumentLanguage)) {
      errors.push(this.createError(
        'major',
        `Document language "${hasDocumentLanguage}" is not a valid BCP 47 language tag`,
        'document.language',
        undefined,
        'Use valid BCP 47 format (e.g., "en", "en-US", "es-MX")'
      ));
    }

    return { errors, warnings };
  }

  private isValidLanguageTag(tag: string): boolean {
    // Basic BCP 47 validation pattern
    const bcp47Pattern = /^[a-z]{2,3}(-[A-Z]{2})?(-[a-z]{4})?$/;
    return bcp47Pattern.test(tag);
  }
}

/**
 * WCAG 3.1.2 - Language of Parts
 */
class LanguageOfPartsRule extends ValidationRule {
  wcagCriterion = '3.1.2';
  level = 'AA' as const;

  validate(document: any): { errors: ValidationError[]; warnings: ValidationWarning[] } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    const documentLanguage = document.language || document.bibliographicEntry?.language || 'en';
    
    this.validateContentLanguages(document.bodyMatter?.contents || [], documentLanguage, errors, warnings);

    return { errors, warnings };
  }

  private validateContentLanguages(contents: any[], documentLanguage: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const searchContent = (items: any[]) => {
      items.forEach(item => {
        if (item.language && item.language !== documentLanguage) {
          if (!this.isValidLanguageTag(item.language)) {
            errors.push(this.createError(
              'minor',
              `Invalid language tag "${item.language}" in content element "${item.id}"`,
              `${item.id}.language`,
              item.id,
              'Use valid BCP 47 language tag'
            ));
          }
        }

        if (item.sections) {
          item.sections.forEach((section: any) => {
            if (section.language && section.language !== documentLanguage) {
              if (!this.isValidLanguageTag(section.language)) {
                errors.push(this.createError(
                  'minor',
                  `Invalid language tag "${section.language}" in section "${section.id}"`,
                  `${section.id}.language`,
                  section.id,
                  'Use valid BCP 47 language tag'
                ));
              }
            }

            if (section.content) {
              section.content.forEach((block: any) => {
                if (block.language && block.language !== documentLanguage) {
                  if (!this.isValidLanguageTag(block.language)) {
                    errors.push(this.createError(
                      'minor',
                      `Invalid language tag "${block.language}" in block "${block.id}"`,
                      `${block.id}.language`,
                      block.id,
                      'Use valid BCP 47 language tag'
                    ));
                  }
                }
              });
            }
          });
        }
      });
    };

    searchContent(contents);
  }

  private isValidLanguageTag(tag: string): boolean {
    const bcp47Pattern = /^[a-z]{2,3}(-[A-Z]{2})?(-[a-z]{4})?$/;
    return bcp47Pattern.test(tag);
  }
}

/**
 * CLI Interface for WCAG validation
 */
export class WcagValidatorCLI {
  private validator: WcagValidator;

  constructor() {
    this.validator = new WcagValidator();
  }

  /**
   * Validate a document from file path
   */
  public async validateFile(filePath: string): Promise<ValidationResult> {
    const fs = await import('fs/promises');
    const documentContent = await fs.readFile(filePath, 'utf-8');
    const document = JSON.parse(documentContent);
    
    return this.validator.validateDocument(document);
  }

  /**
   * Generate detailed report
   */
  public generateReport(result: ValidationResult): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(60));
    lines.push('WCAG 2.1 AA ACCESSIBILITY AUDIT REPORT');
    lines.push('='.repeat(60));
    lines.push('');
    
    // Summary
    lines.push(`Overall Compliance Score: ${result.score.overallCompliance}/100`);
    lines.push(`Level A Compliance: ${result.score.levelA}/100`);
    lines.push(`Level AA Compliance: ${result.score.levelAA}/100`);
    lines.push('');
    
    lines.push(`Critical Issues: ${result.score.criticalIssues}`);
    lines.push(`Major Issues: ${result.score.majorIssues}`);
    lines.push(`Minor Issues: ${result.score.minorIssues}`);
    lines.push(`Warnings: ${result.warnings.length}`);
    lines.push('');

    // Overall result
    if (result.isValid) {
      lines.push('✅ DOCUMENT PASSES WCAG 2.1 AA VALIDATION');
    } else {
      lines.push('❌ DOCUMENT FAILS WCAG 2.1 AA VALIDATION');
    }
    lines.push('');

    // Critical errors first
    const criticalErrors = result.errors.filter(e => e.severity === 'critical');
    if (criticalErrors.length > 0) {
      lines.push('🚨 CRITICAL ISSUES (Must Fix):');
      lines.push('-'.repeat(40));
      criticalErrors.forEach(error => {
        lines.push(`❌ ${error.wcagCriterion} (${error.level}): ${error.message}`);
        lines.push(`   Location: ${error.location}`);
        if (error.suggestedFix) {
          lines.push(`   Fix: ${error.suggestedFix}`);
        }
        lines.push('');
      });
    }

    // Major errors
    const majorErrors = result.errors.filter(e => e.severity === 'major');
    if (majorErrors.length > 0) {
      lines.push('⚠️  MAJOR ISSUES (High Priority):');
      lines.push('-'.repeat(40));
      majorErrors.forEach(error => {
        lines.push(`⚠️  ${error.wcagCriterion} (${error.level}): ${error.message}`);
        lines.push(`   Location: ${error.location}`);
        if (error.suggestedFix) {
          lines.push(`   Fix: ${error.suggestedFix}`);
        }
        lines.push('');
      });
    }

    // Minor errors
    const minorErrors = result.errors.filter(e => e.severity === 'minor');
    if (minorErrors.length > 0) {
      lines.push('ℹ️  MINOR ISSUES (Medium Priority):');
      lines.push('-'.repeat(40));
      minorErrors.forEach(error => {
        lines.push(`ℹ️  ${error.wcagCriterion} (${error.level}): ${error.message}`);
        lines.push(`   Location: ${error.location}`);
        if (error.suggestedFix) {
          lines.push(`   Fix: ${error.suggestedFix}`);
        }
        lines.push('');
      });
    }

    // Warnings
    if (result.warnings.length > 0) {
      lines.push('💡 RECOMMENDATIONS:');
      lines.push('-'.repeat(40));
      result.warnings.forEach(warning => {
        lines.push(`💡 ${warning.wcagCriterion}: ${warning.message}`);
        lines.push(`   Recommendation: ${warning.recommendation}`);
        lines.push('');
      });
    }

    lines.push('='.repeat(60));
    lines.push('Report generated by xats WCAG Validator');
    lines.push(`Timestamp: ${new Date().toISOString()}`);
    lines.push('='.repeat(60));

    return lines.join('\n');
  }

  /**
   * Generate CI/CD friendly JSON report
   */
  public generateJsonReport(result: ValidationResult): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      isValid: result.isValid,
      score: result.score,
      summary: {
        criticalIssues: result.score.criticalIssues,
        majorIssues: result.score.majorIssues,
        minorIssues: result.score.minorIssues,
        warnings: result.warnings.length
      },
      errors: result.errors,
      warnings: result.warnings
    }, null, 2);
  }
}

// Export for use in CI/CD systems
export default WcagValidator;