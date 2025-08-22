import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, it, expect } from 'vitest';

describe('Enhanced Rendering Hints v0.5.0 - Basic Tests', () => {
  let ajv: Ajv;
  let schemaV050: any;

  beforeAll(() => {
    ajv = new Ajv({ allErrors: true, strict: false });
    addFormats(ajv);
    
    // Add CSL schema stub to prevent external reference resolution errors
    const cslSchema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string' },
        title: { type: 'string' },
        author: { type: 'array' },
        issued: { type: 'object' },
        'container-title': { type: 'string' },
        publisher: { type: 'string' },
        page: { type: 'string' },
        volume: { type: 'string' },
        issue: { type: 'string' },
        URL: { type: 'string' },
        DOI: { type: 'string' },
        ISBN: { type: 'string' },
      },
      additionalProperties: true,
    };

    ajv.addSchema(
      cslSchema,
      'https://raw.githubusercontent.com/citation-style-language/schema/master/csl-data.json'
    );
    
    // Add LTI extension schema stub to prevent external reference resolution errors
    const ltiSchema = {
      $id: 'https://xats.org/extensions/lti-1.3/schema.json',
      definitions: {
        LtiConfiguration: {
          type: 'object',
          properties: {
            ltiVersion: { type: 'string' },
            platformId: { type: 'string' },
            clientId: { type: 'string' },
          },
          additionalProperties: true,
        },
        LtiLaunchMetadata: {
          type: 'object',
          properties: {
            contextId: { type: 'string' },
            resourceLinkId: { type: 'string' },
          },
          additionalProperties: true,
        },
        LtiGradePassback: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            maxScore: { type: 'number' },
          },
          additionalProperties: true,
        },
        LtiDeepLinking: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            returnUrl: { type: 'string' },
          },
          additionalProperties: true,
        },
        LtiPathwayIntegration: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            pathwayMappings: { type: 'array' },
          },
          additionalProperties: true,
        },
      },
    };

    ajv.addSchema(ltiSchema);
    
    try {
      schemaV050 = require('../../schemas/0.5.0/xats.schema.json');
      ajv.addSchema(schemaV050, 'xats-v0.5.0');
    } catch (error) {
      console.error('Failed to load schema:', error);
      throw error;
    }
  });

  describe('Schema Loading', () => {
    it('should load the v0.5.0 schema successfully', () => {
      expect(schemaV050).toBeDefined();
      expect(schemaV050.$id).toBe('https://xats.org/schemas/0.5.0/schema.json');
      expect(schemaV050.title).toBe('eXtensible Academic Text Standard v0.5.0');
    });

    it('should have RenderingHint definition', () => {
      expect(schemaV050.definitions.RenderingHint).toBeDefined();
    });

    it('should support v0.5.0 in schemaVersion enum', () => {
      const versionEnum = schemaV050.properties.schemaVersion.enum;
      expect(versionEnum).toContain('0.5.0');
    });
  });

  describe('Basic Rendering Hint Validation', () => {
    it('should validate a simple rendering hint', () => {
      const simpleHint = {
        hintType: 'https://xats.org/vocabularies/hints/layoutMode',
        value: 'single-column'
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      const isValid = validate(simpleHint);
      
      if (!isValid) {
        console.error('Validation errors:', validate.errors);
      }
      
      expect(isValid).toBe(true);
    });

    it('should validate a hint with priority', () => {
      const hintWithPriority = {
        hintType: 'https://xats.org/vocabularies/hints/semantic/warning',
        value: 'warning',
        priority: 5
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      const isValid = validate(hintWithPriority);
      
      if (!isValid) {
        console.error('Validation errors:', validate.errors);
      }
      
      expect(isValid).toBe(true);
    });

    it('should validate hint with simple fallback', () => {
      const hintWithFallback = {
        hintType: 'https://xats.org/vocabularies/hints/accessibility/motion-safe',
        value: 'motion-safe',
        fallback: {
          hintType: 'https://xats.org/vocabularies/hints/semantic/highlight',
          value: 'highlight'
        }
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      const isValid = validate(hintWithFallback);
      
      if (!isValid) {
        console.error('Validation errors:', validate.errors);
      }
      
      expect(isValid).toBe(true);
    });
  });

  describe('Enhanced Features', () => {
    it('should validate conditions object', () => {
      const hintWithConditions = {
        hintType: 'https://xats.org/vocabularies/hints/layout/position',
        value: 'center',
        conditions: {
          outputFormats: ['html', 'epub'],
          mediaQuery: 'screen and (max-width: 768px)',
          userPreferences: ['high-contrast']
        }
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      const isValid = validate(hintWithConditions);
      
      if (!isValid) {
        console.error('Validation errors:', validate.errors);
      }
      
      expect(isValid).toBe(true);
    });

    it('should validate inheritance property', () => {
      const hintWithInheritance = {
        hintType: 'https://xats.org/vocabularies/hints/semantic/emphasis',
        value: 'emphasis',
        inheritance: 'cascade'
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      const isValid = validate(hintWithInheritance);
      
      if (!isValid) {
        console.error('Validation errors:', validate.errors);
      }
      
      expect(isValid).toBe(true);
    });
  });

  describe('Value Type Validation', () => {
    it('should accept string values', () => {
      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/test',
        value: 'test-string'
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });

    it('should accept number values', () => {
      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/test',
        value: 42
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });

    it('should accept boolean values', () => {
      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/test',
        value: true
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });

    it('should accept object values', () => {
      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/test',
        value: {
          position: 'center',
          width: '80%'
        }
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });

    it('should accept array values', () => {
      const hint = {
        hintType: 'https://xats.org/vocabularies/hints/test',
        value: ['option1', 'option2', 'option3']
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hint)).toBe(true);
    });
  });

  describe('Required Fields', () => {
    it('should require hintType', () => {
      const hintWithoutType = {
        value: 'test'
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hintWithoutType)).toBe(false);
    });

    it('should require value', () => {
      const hintWithoutValue = {
        hintType: 'https://xats.org/vocabularies/hints/test'
      };

      const validate = ajv.compile(schemaV050.definitions.RenderingHint);
      expect(validate(hintWithoutValue)).toBe(false);
    });
  });
});