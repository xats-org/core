import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, it, expect } from 'vitest';

const schemaV050 = require('../../schemas/0.5.0/xats.schema.json');

describe('Enhanced Rendering Hints v0.5.0', () => {
  let ajv: Ajv;

  beforeAll(() => {
    ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    ajv.addSchema(schemaV050, 'xats-v0.5.0');
  });

  describe('Basic Rendering Hint Structure', () => {
    it('should accept simple hintType/value pairs (v0.3.0 compatibility)', () => {
      const simpleHint = {
        hintType: 'https://xats.org/vocabularies/hints/layoutMode',
        value: 'single-column'
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(simpleHint)).toBe(true);
    });

    it('should accept enhanced hints with priority and conditions', () => {
      const enhancedHint = {
        hintType: 'https://xats.org/vocabularies/hints/semantic/warning',
        value: 'warning',
        priority: 5,
        conditions: {
          outputFormats: ['html', 'pdf'],
          userPreferences: ['high-contrast']
        },
        inheritance: 'cascade'
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(enhancedHint)).toBe(true);
    });

    it('should accept hints with fallback chains', () => {
      const hintWithFallback = {
        hintType: 'https://xats.org/vocabularies/hints/accessibility/motion-safe',
        value: 'motion-safe',
        priority: 4,
        fallback: {
          hintType: 'https://xats.org/vocabularies/hints/semantic/highlight',
          value: 'highlight'
        }
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hintWithFallback)).toBe(true);
    });
  });

  describe('Semantic Intent Hints', () => {
    it('should validate semantic hint values', () => {
      const semanticHints = [
        'emphasis', 'strong-emphasis', 'highlight', 'warning', 'info',
        'success', 'error', 'aside', 'featured', 'secondary', 'decorative',
        'functional', 'call-to-action', 'definition', 'example'
      ];

      semanticHints.forEach(value => {
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/semantic/test',
          value
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(true);
      });
    });

    it('should reject invalid semantic hint values', () => {
      const invalidHint = {
        hintType: 'https://xats.org/vocabularies/hints/semantic/invalid',
        value: 'invalid-semantic-value'
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(invalidHint)).toBe(false);
    });
  });

  describe('Pedagogical Role Hints', () => {
    it('should validate pedagogical role values', () => {
      const pedagogicalRoles = [
        'introduction', 'key-concept', 'example', 'non-example', 'summary',
        'prerequisite', 'advanced-topic', 'enrichment', 'assessment'
      ];

      pedagogicalRoles.forEach(value => {
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/pedagogical/test',
          value
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(true);
      });
    });
  });

  describe('Prominence Level Hints', () => {
    it('should validate prominence levels 1-5', () => {
      for (let level = 1; level <= 5; level++) {
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/prominence/level',
          value: level
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(true);
      }
    });

    it('should reject invalid prominence levels', () => {
      const invalidLevels = [0, 6, -1, 3.5, 'high'];

      invalidLevels.forEach(level => {
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/prominence/level',
          value: level
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(false);
      });
    });
  });

  describe('Layout Hints', () => {
    it('should validate string layout values', () => {
      const layoutValues = [
        'keep-together', 'allow-break', 'force-new-page', 'center', 'full-width'
      ];

      layoutValues.forEach(value => {
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/layout/position',
          value
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(true);
      });
    });

    it('should validate object layout values', () => {
      const layoutObject = {
        position: 'center',
        width: '80%',
        margin: '1em auto',
        padding: '0.5em'
      };

      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/layout/complex',
        value: layoutObject
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });
  });

  describe('Accessibility Hints', () => {
    it('should validate string accessibility values', () => {
      const accessibilityValues = [
        'screen-reader-priority-high', 'screen-reader-priority-low',
        'keyboard-shortcut', 'high-contrast-compatible', 'motion-safe'
      ];

      accessibilityValues.forEach(value => {
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/accessibility/test',
          value
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(true);
      });
    });

    it('should validate object accessibility values', () => {
      const accessibilityObject = {
        ariaLabel: 'Important content',
        keyboardShortcut: 'Ctrl+I',
        cognitiveSupport: {
          simplifyLanguage: true,
          provideGlossary: false
        }
      };

      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/accessibility/complex',
        value: accessibilityObject
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });
  });

  describe('Cross-Reference Hints', () => {
    it('should validate cross-reference styling objects', () => {
      const crossRefValue = {
        style: 'superscript',
        includePageNumber: true,
        linkBehavior: 'internal-link',
        hoverPreview: false
      };

      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/cross-reference/style',
        value: crossRefValue
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });
  });

  describe('Mathematics Hints', () => {
    it('should validate mathematical display preferences', () => {
      const mathValue = {
        displayStyle: 'block',
        preferredNotation: 'latex',
        fontSize: 'large',
        alignment: 'center',
        showSteps: true,
        interactive: false
      };

      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/mathematics/display',
        value: mathValue
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });
  });

  describe('Media Hints', () => {
    it('should validate media placement and interaction hints', () => {
      const mediaValue = {
        placement: 'float-right',
        size: 'medium',
        aspectRatio: '16:9',
        lazy: true,
        autoplay: false,
        controls: true,
        interactionLevel: 'basic'
      };

      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/media/placement',
        value: mediaValue
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });

    it('should validate aspect ratio patterns', () => {
      const validRatios = ['16:9', '4:3', '1:1', 'auto'];
      const invalidRatios = ['16x9', '4-3', '1.5:1', 'wide'];

      validRatios.forEach(ratio => {
        const mediaValue = { aspectRatio: ratio, placement: 'inline' };
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/media/test',
          value: mediaValue
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(true);
      });

      invalidRatios.forEach(ratio => {
        const mediaValue = { aspectRatio: ratio, placement: 'inline' };
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/media/test',
          value: mediaValue
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(false);
      });
    });
  });

  describe('Priority and Conflict Resolution', () => {
    it('should validate priority levels 1-5', () => {
      for (let priority = 1; priority <= 5; priority++) {
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/semantic/test',
          value: 'emphasis',
          priority
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(true);
      }
    });

    it('should reject invalid priority levels', () => {
      const invalidPriorities = [0, 6, -1, 2.5];

      invalidPriorities.forEach(priority => {
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/semantic/test',
          value: 'emphasis',
          priority
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(false);
      });
    });

    it('should validate inheritance options', () => {
      const inheritanceValues = ['inherit', 'no-inherit', 'cascade'];

      inheritanceValues.forEach(inheritance => {
        const hint = {
          hintType: 'https://xats.org/vocabularies/hints/semantic/test',
          value: 'emphasis',
          inheritance
        };

        const validate = ajv.compile(schemaV050.definitions.RenderingHint);
        expect(validate(hint)).toBe(true);
      });
    });
  });

  describe('Conditional Application', () => {
    it('should validate output format conditions', () => {
      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/layout/responsive',
        value: 'responsive',
        conditions: {
          outputFormats: ['html', 'epub'],
          mediaQuery: 'screen and (max-width: 768px)'
        }
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });

    it('should validate user preference conditions', () => {
      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/accessibility/high-contrast',
        value: 'high-contrast-compatible',
        conditions: {
          userPreferences: ['high-contrast', 'large-text', 'reduced-motion']
        }
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });
  });

  describe('Complete Document Validation', () => {
    it('should validate the enhanced rendering hints demo document', async () => {
      const demoDoc = require('../../examples/v0.5.0/enhanced-rendering-hints-demo.json');
      
      const validate = ajv.compile(schemaV050);
      const isValid = validate(demoDoc);
      
      if (!isValid) {
        console.error('Validation errors:', validate.errors);
      }
      
      expect(isValid).toBe(true);
    });

    it('should validate the backward compatibility demo document', async () => {
      const compatDoc = require('../../examples/v0.5.0/backward-compatibility-demo.json');
      
      const validate = ajv.compile(schemaV050);
      const isValid = validate(compatDoc);
      
      if (!isValid) {
        console.error('Validation errors:', validate.errors);
      }
      
      expect(isValid).toBe(true);
    });
  });
});