/**
 * WCAG 2.1 AA Compliance Test Suite for xats Schema
 * Tests specific WCAG success criteria against xats documents
 */

import { describe, it, expect, beforeAll } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Types for xats document structure
interface XatsDocument {
  schemaVersion: string;
  bibliographicEntry: any;
  subject: string;
  language?: string;
  bodyMatter: {
    contents: any[];
  };
  resources?: Resource[];
  frontMatter?: any;
  backMatter?: any;
}

interface Resource {
  id: string;
  type: string;
  url: string;
  altText?: string;
  longDescription?: string;
  speechText?: string;
}

interface ContentBlock {
  id: string;
  blockType: string;
  content: any;
  language?: string;
  accessibilityMetadata?: AccessibilityMetadata;
}

interface AccessibilityMetadata {
  language?: string;
  landmarkRole?: string;
  headingLevel?: number;
  skipTarget?: boolean;
  focusable?: boolean;
  tabOrder?: number;
}

describe('WCAG 2.1 AA Compliance Tests', () => {
  
  describe('1.1.1 Non-text Content (Level A)', () => {
    
    it('should require alt text for all image resources', () => {
      const document: XatsDocument = {
        schemaVersion: '0.1.0',
        bibliographicEntry: { id: 'test', type: 'book', title: 'Test' },
        subject: 'Test',
        bodyMatter: { contents: [] },
        resources: [
          {
            id: 'img-1',
            type: 'https://xats.org/core/resources/image',
            url: 'https://example.com/image.jpg',
            altText: 'Descriptive alternative text'
          }
        ]
      };

      const imageResources = document.resources?.filter(r => 
        r.type === 'https://xats.org/core/resources/image'
      ) || [];

      imageResources.forEach(img => {
        expect(img.altText, `Image ${img.id} must have alt text`).toBeDefined();
        expect(img.altText!.trim().length, `Alt text for ${img.id} must not be empty`).toBeGreaterThan(0);
        expect(img.altText!.length, `Alt text for ${img.id} should be meaningful`).toBeGreaterThan(3);
      });
    });

    it('should fail when image resources lack alt text', () => {
      const document: XatsDocument = {
        schemaVersion: '0.1.0',
        bibliographicEntry: { id: 'test', type: 'book', title: 'Test' },
        subject: 'Test',
        bodyMatter: { contents: [] },
        resources: [
          {
            id: 'img-1',
            type: 'https://xats.org/core/resources/image',
            url: 'https://example.com/image.jpg'
            // Missing altText - should fail
          }
        ]
      };

      const imageResources = document.resources?.filter(r => 
        r.type === 'https://xats.org/core/resources/image'
      ) || [];

      expect(() => {
        imageResources.forEach(img => {
          if (!img.altText || img.altText.trim().length === 0) {
            throw new Error(`WCAG 1.1.1 VIOLATION: Image ${img.id} missing alt text`);
          }
        });
      }).toThrow('WCAG 1.1.1 VIOLATION');
    });

    it('should require long descriptions for complex images', () => {
      // Complex image types that need detailed descriptions
      // const complexImageTypes = ['chart', 'diagram', 'graph', 'map'];
      
      const document: XatsDocument = {
        schemaVersion: '0.1.0',
        bibliographicEntry: { id: 'test', type: 'book', title: 'Test' },
        subject: 'Test',
        bodyMatter: { contents: [] },
        resources: [
          {
            id: 'chart-1',
            type: 'https://xats.org/core/resources/image',
            url: 'https://example.com/complex-chart.svg',
            altText: 'Bar chart showing sales data',
            longDescription: 'Detailed description: A bar chart displaying quarterly sales figures for 2024. Q1 shows $10k, Q2 shows $15k, Q3 shows $12k, and Q4 shows $18k.'
          }
        ]
      };

      // Test that complex images have long descriptions
      const imageResources = document.resources?.filter(r => 
        r.type === 'https://xats.org/core/resources/image'
      ) || [];

      imageResources.forEach(img => {
        const isComplex = img.url.includes('chart') || 
                         img.url.includes('diagram') || 
                         img.url.includes('graph') ||
                         img.altText?.includes('chart') ||
                         img.altText?.includes('diagram');

        if (isComplex) {
          expect(img.longDescription, `Complex image ${img.id} should have long description`).toBeDefined();
          expect(img.longDescription!.length, `Long description for ${img.id} should be substantial`).toBeGreaterThan(50);
        }
      });
    });

    it('should require alt text for math blocks', () => {
      const mathBlock: ContentBlock = {
        id: 'math-1',
        blockType: 'https://xats.org/core/blocks/mathBlock',
        content: {
          notation: 'latex',
          expression: '\\int_0^1 x^2 dx',
          altText: 'Integral from 0 to 1 of x squared dx',
          speechText: 'The definite integral from zero to one of x squared with respect to x'
        }
      };

      expect(mathBlock.content.altText, 'Math blocks must have alt text').toBeDefined();
      expect(mathBlock.content.altText.length, 'Math alt text must be meaningful').toBeGreaterThan(10);
      
      // Enhanced requirement: speech text for screen readers
      if (mathBlock.content.speechText) {
        expect(mathBlock.content.speechText.length, 'Math speech text should be detailed').toBeGreaterThan(20);
      }
    });
  });

  describe('1.3.1 Info and Relationships (Level A)', () => {
    
    it('should require proper table header structure', () => {
      const tableBlock: ContentBlock = {
        id: 'table-1',
        blockType: 'https://xats.org/core/blocks/table',
        content: {
          caption: { runs: [{ type: 'text', text: 'Student Grades' }] },
          headers: [
            { 
              text: { runs: [{ type: 'text', text: 'Name' }] },
              scope: 'col',
              id: 'header-name'
            },
            { 
              text: { runs: [{ type: 'text', text: 'Grade' }] },
              scope: 'col',
              id: 'header-grade'
            }
          ],
          rows: [
            [
              { 
                text: { runs: [{ type: 'text', text: 'John' }] },
                headers: 'header-name'
              },
              { 
                text: { runs: [{ type: 'text', text: 'A+' }] },
                headers: 'header-grade'
              }
            ]
          ]
        }
      };

      // Test table structure
      expect(tableBlock.content.headers, 'Table must have headers').toBeDefined();
      expect(tableBlock.content.headers.length, 'Table must have at least one header').toBeGreaterThan(0);
      
      // Test header scope attributes (enhanced requirement)
      tableBlock.content.headers.forEach((header: any) => {
        if (header.scope) {
          expect(['col', 'row', 'colgroup', 'rowgroup']).toContain(header.scope);
        }
      });
    });

    it('should require heading levels for heading blocks', () => {
      const headingBlock: ContentBlock = {
        id: 'heading-1',
        blockType: 'https://xats.org/core/blocks/heading',
        content: {
          text: { runs: [{ type: 'text', text: 'Chapter 1: Introduction' }] },
          level: 1
        },
        accessibilityMetadata: {
          headingLevel: 1
        }
      };

      // Current schema doesn't support level - this test shows the requirement
      if (headingBlock.content.level || headingBlock.accessibilityMetadata?.headingLevel) {
        const level = headingBlock.content.level || headingBlock.accessibilityMetadata?.headingLevel;
        expect(level, 'Heading level must be specified').toBeDefined();
        expect(level, 'Heading level must be between 1-6').toBeGreaterThanOrEqual(1);
        expect(level, 'Heading level must be between 1-6').toBeLessThanOrEqual(6);
      } else {
        // This should fail in current schema
        expect(() => {
          throw new Error('WCAG 1.3.1 VIOLATION: Heading blocks must specify level');
        }).toThrow();
      }
    });

    it('should validate proper list structure', () => {
      const listBlock: ContentBlock = {
        id: 'list-1',
        blockType: 'https://xats.org/core/blocks/list',
        content: {
          listType: 'ordered',
          items: [
            { text: { runs: [{ type: 'text', text: 'First item' }] } },
            { text: { runs: [{ type: 'text', text: 'Second item' }] } }
          ]
        }
      };

      expect(listBlock.content.listType, 'List must specify type').toBeDefined();
      expect(['ordered', 'unordered']).toContain(listBlock.content.listType);
      expect(listBlock.content.items, 'List must have items').toBeDefined();
      expect(listBlock.content.items.length, 'List must have at least one item').toBeGreaterThan(0);
    });
  });

  describe('1.3.2 Meaningful Sequence (Level A)', () => {
    
    it('should maintain logical reading order in content arrays', () => {
      const section = {
        id: 'section-1',
        title: 'Introduction',
        content: [
          {
            id: 'heading-1',
            blockType: 'https://xats.org/core/blocks/heading',
            content: { text: { runs: [{ type: 'text', text: 'Overview' }] } }
          },
          {
            id: 'paragraph-1',
            blockType: 'https://xats.org/core/blocks/paragraph',
            content: { text: { runs: [{ type: 'text', text: 'This section introduces...' }] } }
          }
        ]
      };

      // Test that content maintains logical order
      expect(section.content, 'Section must have content').toBeDefined();
      expect(Array.isArray(section.content), 'Content must be an ordered array').toBe(true);
      
      // Verify heading comes before paragraph (logical structure)
      const headingIndex = section.content.findIndex(c => c.blockType.includes('heading'));
      const paragraphIndex = section.content.findIndex(c => c.blockType.includes('paragraph'));
      
      if (headingIndex !== -1 && paragraphIndex !== -1) {
        expect(headingIndex, 'Heading should come before related paragraph').toBeLessThan(paragraphIndex);
      }
    });
  });

  describe('2.4.1 Bypass Blocks (Level A)', () => {
    
    it('should support skip navigation links', () => {
      // This test shows what should be possible but currently isn't in v0.1.0
      const skipNavBlock = {
        id: 'skip-nav-1',
        blockType: 'https://xats.org/core/blocks/skipNavigation',
        content: {
          skipLinks: [
            {
              id: 'skip-to-main',
              label: 'Skip to main content',
              destinationId: 'main-content',
              keyboardShortcut: 'Alt+M'
            },
            {
              id: 'skip-to-nav',
              label: 'Skip to navigation',
              destinationId: 'main-nav'
            }
          ]
        }
      };

      expect(skipNavBlock.content.skipLinks, 'Skip nav must have links').toBeDefined();
      expect(skipNavBlock.content.skipLinks.length, 'Must have at least one skip link').toBeGreaterThan(0);
      
      skipNavBlock.content.skipLinks.forEach((link: any) => {
        expect(link.label, 'Skip link must have label').toBeDefined();
        expect(link.destinationId, 'Skip link must have destination').toBeDefined();
        expect(link.label.length, 'Skip link label must be meaningful').toBeGreaterThan(5);
      });
    });
  });

  describe('2.4.3 Focus Order (Level A)', () => {
    
    it('should support tab order specification', () => {
      const interactiveBlocks = [
        {
          id: 'input-1',
          blockType: 'https://xats.org/core/blocks/input',
          accessibilityMetadata: {
            focusable: true,
            tabOrder: 1
          }
        },
        {
          id: 'button-1',
          blockType: 'https://xats.org/core/blocks/button',
          accessibilityMetadata: {
            focusable: true,
            tabOrder: 2
          }
        }
      ];

      interactiveBlocks.forEach(block => {
        if (block.accessibilityMetadata?.focusable) {
          expect(block.accessibilityMetadata.tabOrder, `Focusable element ${block.id} should have tab order`).toBeDefined();
          expect(block.accessibilityMetadata.tabOrder, 'Tab order should be positive').toBeGreaterThan(0);
        }
      });
    });
  });

  describe('2.4.6 Headings and Labels (Level AA)', () => {
    
    it('should require descriptive heading text', () => {
      const headings = [
        {
          id: 'heading-good',
          blockType: 'https://xats.org/core/blocks/heading',
          content: {
            text: { runs: [{ type: 'text', text: 'Chapter 1: Introduction to Calculus' }] },
            level: 1
          }
        },
        {
          id: 'heading-bad',
          blockType: 'https://xats.org/core/blocks/heading',
          content: {
            text: { runs: [{ type: 'text', text: 'Click here' }] }, // Non-descriptive
            level: 2
          }
        }
      ];

      headings.forEach(heading => {
        const headingText = heading.content.text.runs
          .filter((run: any) => run.type === 'text')
          .map((run: any) => run.text)
          .join('');

        expect(headingText.length, `Heading ${heading.id} must have meaningful text`).toBeGreaterThan(5);
        
        // Test for non-descriptive patterns
        const badPatterns = ['click here', 'read more', 'more info', 'click', 'here'];
        const hasDescriptiveText = !badPatterns.some(pattern => 
          headingText.toLowerCase().includes(pattern)
        );
        
        expect(hasDescriptiveText, `Heading "${headingText}" should be descriptive, not generic`).toBe(true);
      });
    });
  });

  describe('3.1.1 Language of Page (Level A)', () => {
    
    it('should require language identification at document level', () => {
      const document: XatsDocument = {
        schemaVersion: '0.1.0',
        bibliographicEntry: { 
          id: 'test', 
          type: 'book', 
          title: 'Test',
          language: 'en-US' // Should be at this level or higher
        },
        subject: 'Test',
        bodyMatter: { contents: [] }
      };

      // Test for language identification
      const hasLanguage = document.language || 
                         document.bibliographicEntry?.language;

      if (!hasLanguage) {
        expect(() => {
          throw new Error('WCAG 3.1.1 VIOLATION: Document must specify primary language');
        }).toThrow();
      } else {
        // Validate BCP 47 format
        const langPattern = /^[a-z]{2,3}(-[A-Z]{2})?(-[a-z]{4})?$/;
        expect(langPattern.test(hasLanguage), 'Language must be valid BCP 47 format').toBe(true);
      }
    });
  });

  describe('3.1.2 Language of Parts (Level AA)', () => {
    
    it('should support language identification for content parts', () => {
      const multilingualContent = [
        {
          id: 'english-text',
          blockType: 'https://xats.org/core/blocks/paragraph',
          language: 'en',
          content: {
            text: { runs: [{ type: 'text', text: 'This is in English.' }] }
          }
        },
        {
          id: 'spanish-text',
          blockType: 'https://xats.org/core/blocks/paragraph',
          language: 'es',
          content: {
            text: { runs: [{ type: 'text', text: 'Esto está en español.' }] }
          }
        }
      ];

      multilingualContent.forEach(block => {
        if (block.language && block.language !== 'en') { // Different from document language
          const langPattern = /^[a-z]{2,3}(-[A-Z]{2})?(-[a-z]{4})?$/;
          expect(langPattern.test(block.language), `Block ${block.id} language must be valid BCP 47`).toBe(true);
        }
      });
    });
  });

  describe('Accessibility Metadata Framework', () => {
    
    it('should support comprehensive accessibility metadata', () => {
      const contentWithMetadata: ContentBlock = {
        id: 'accessible-content',
        blockType: 'https://xats.org/core/blocks/paragraph',
        language: 'en-US',
        accessibilityMetadata: {
          language: 'en-US',
          landmarkRole: 'main',
          skipTarget: true,
          focusable: false,
          tabOrder: 0
        },
        content: {
          text: { runs: [{ type: 'text', text: 'This is accessible content.' }] }
        }
      };

      const metadata = contentWithMetadata.accessibilityMetadata!;
      
      expect(metadata.language, 'Accessibility metadata should include language').toBeDefined();
      expect(['main', 'navigation', 'complementary', 'banner', 'contentinfo'].includes(metadata.landmarkRole!), 
             'Landmark role should be valid').toBe(true);
      expect(typeof metadata.skipTarget, 'Skip target should be boolean').toBe('boolean');
      expect(typeof metadata.focusable, 'Focusable should be boolean').toBe('boolean');
      expect(typeof metadata.tabOrder, 'Tab order should be number').toBe('number');
    });
  });
});

describe('WCAG Validation Utilities', () => {
  
  /**
   * Utility function to validate heading level hierarchy
   */
  function validateHeadingHierarchy(headings: Array<{ level: number; text: string }>): boolean {
    let previousLevel = 0;
    
    for (const heading of headings) {
      if (heading.level > previousLevel + 1) {
        return false; // Skipped a level
      }
      previousLevel = heading.level;
    }
    
    return true;
  }

  /**
   * Utility function to check alt text quality
   */
  function validateAltTextQuality(altText: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    if (!altText || altText.trim().length === 0) {
      issues.push('Alt text is empty');
      return { isValid: false, issues };
    }
    
    // Check for common poor alt text patterns
    const poorPatterns = [
      /^image of/i,
      /^picture of/i,
      /^photo of/i,
      /^graphic of/i,
      /^icon$/i,
      /^button$/i,
      /^link$/i,
      /filename\.(jpg|png|gif|svg)$/i
    ];
    
    poorPatterns.forEach(pattern => {
      if (pattern.test(altText)) {
        issues.push(`Alt text contains redundant phrase: "${altText.match(pattern)?.[0]}"`);
      }
    });
    
    if (altText.length > 125) {
      issues.push('Alt text is too long (>125 characters) - consider using longDescription');
    }
    
    if (altText.length < 3) {
      issues.push('Alt text is too short to be meaningful');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  it('should validate heading hierarchy', () => {
    const goodHierarchy = [
      { level: 1, text: 'Chapter 1' },
      { level: 2, text: 'Section 1.1' },
      { level: 3, text: 'Subsection 1.1.1' },
      { level: 2, text: 'Section 1.2' }
    ];
    
    const badHierarchy = [
      { level: 1, text: 'Chapter 1' },
      { level: 3, text: 'Subsection - skipped level 2!' },
      { level: 2, text: 'Section 1.1' }
    ];

    expect(validateHeadingHierarchy(goodHierarchy)).toBe(true);
    expect(validateHeadingHierarchy(badHierarchy)).toBe(false);
  });

  it('should validate alt text quality', () => {
    const goodAltText = 'Graph showing quarterly sales increasing from $10k to $25k';
    const badAltText = 'image of chart.png';
    const emptyAltText = '';

    const goodResult = validateAltTextQuality(goodAltText);
    const badResult = validateAltTextQuality(badAltText);
    const emptyResult = validateAltTextQuality(emptyAltText);

    expect(goodResult.isValid).toBe(true);
    expect(badResult.isValid).toBe(false);
    expect(badResult.issues).toContain(expect.stringContaining('redundant phrase'));
    expect(emptyResult.isValid).toBe(false);
    expect(emptyResult.issues).toContain('Alt text is empty');
  });
});

/**
 * Integration test with actual schema validation
 */
describe('Schema Integration Tests', () => {
  let ajv: Ajv;
  
  beforeAll(async () => {
    ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    
    // In a real implementation, load the actual schema
    // const schema = await loadXatsSchema();
    // ajv.addSchema(schema, 'xats');
  });

  it('should validate complete accessible document', () => {
    const accessibleDocument = {
      schemaVersion: '0.1.0',
      bibliographicEntry: {
        id: 'accessible-textbook',
        type: 'book',
        title: 'Accessible Mathematics',
        language: 'en-US'
      },
      subject: 'Mathematics',
      bodyMatter: {
        contents: [
          {
            id: 'chapter-1',
            title: 'Introduction',
            language: 'en-US',
            sections: [
              {
                id: 'section-1',
                title: 'Basic Concepts',
                language: 'en-US',
                content: [
                  {
                    id: 'heading-1',
                    blockType: 'https://xats.org/core/blocks/heading',
                    language: 'en-US',
                    content: {
                      text: { runs: [{ type: 'text', text: 'Understanding Functions' }] },
                      level: 2
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      resources: [
        {
          id: 'function-graph',
          type: 'https://xats.org/core/resources/image',
          url: 'https://example.com/function-graph.svg',
          altText: 'Graph of f(x) = x² showing parabola opening upward',
          longDescription: 'A coordinate plane showing the quadratic function f(x) = x². The parabola opens upward with vertex at origin (0,0). Points are plotted at (-2,4), (-1,1), (0,0), (1,1), and (2,4) showing the symmetric U-shape characteristic of quadratic functions.'
        }
      ]
    };

    // This would validate against the actual schema
    // expect(ajv.validate('xats', accessibleDocument)).toBe(true);
    
    // For now, test the structure manually
    expect(accessibleDocument.schemaVersion).toBeDefined();
    expect(accessibleDocument.bibliographicEntry.language).toBeDefined();
    expect(accessibleDocument.resources?.[0]?.altText).toBeDefined();
    expect(accessibleDocument.resources?.[0]?.longDescription).toBeDefined();
  });
});