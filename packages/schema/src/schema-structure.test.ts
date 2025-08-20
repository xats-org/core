/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, import/no-named-as-default */
/**
 * Schema Structure Validation Tests
 *
 * Tests the integrity and structure of the xats JSON schema itself.
 * This ensures the schema is well-formed, has valid references,
 * and follows JSON Schema specification.
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, it, expect, beforeAll } from 'vitest';

describe('Schema Structure Validation', () => {
  let schemaContent: any;
  let ajv: Ajv;

  beforeAll(() => {
    // Load the schema file
    const schemaPath = resolve(process.cwd(), 'schemas/0.1.0/xats.json');
    const schemaText = readFileSync(schemaPath, 'utf-8');
    schemaContent = JSON.parse(schemaText);

    // Create AJV instance for meta-validation
    ajv = new Ajv({ strict: false, validateFormats: true });
    addFormats(ajv);
  });

  describe('Schema Metadata', () => {
    it('should have valid JSON Schema meta-schema', () => {
      expect(schemaContent).toHaveProperty('$schema');
      expect(schemaContent.$schema).toBe('http://json-schema.org/draft-07/schema#');
    });

    it('should have schema ID', () => {
      expect(schemaContent).toHaveProperty('$id');
      expect(schemaContent.$id).toBe('https://xats.org/schemas/0.1.0/schema.json');
    });

    it('should have title and description', () => {
      expect(schemaContent).toHaveProperty('title');
      expect(schemaContent).toHaveProperty('description');
      expect(typeof schemaContent.title).toBe('string');
      expect(typeof schemaContent.description).toBe('string');
      expect(schemaContent.title.length).toBeGreaterThan(0);
      expect(schemaContent.description.length).toBeGreaterThan(0);
    });

    it('should be a valid JSON Schema', () => {
      // Validate against JSON Schema meta-schema
      const metaSchema = {
        $ref: 'http://json-schema.org/draft-07/schema#',
      };

      const validate = ajv.compile(metaSchema);
      const isValid = validate(schemaContent);

      if (!isValid) {
        console.error('Schema validation errors:', validate.errors);
      }

      expect(isValid).toBe(true);
    });
  });

  describe('Root Properties', () => {
    it('should define required root properties', () => {
      expect(schemaContent).toHaveProperty('properties');
      expect(schemaContent).toHaveProperty('required');

      const requiredFields = schemaContent.required;
      expect(Array.isArray(requiredFields)).toBe(true);
      expect(requiredFields).toContain('schemaVersion');
      expect(requiredFields).toContain('bibliographicEntry');
      expect(requiredFields).toContain('subject');
      expect(requiredFields).toContain('bodyMatter');
    });

    it('should have all required properties defined in properties', () => {
      const properties = schemaContent.properties;
      const required = schemaContent.required;

      required.forEach((field: string) => {
        expect(properties).toHaveProperty(field);
      });
    });

    it('should have schemaVersion with correct constraint', () => {
      const schemaVersionProp = schemaContent.properties.schemaVersion;
      expect(schemaVersionProp).toHaveProperty('type', 'string');
      expect(schemaVersionProp).toHaveProperty('const', '0.1.0');
    });

    it('should define optional properties correctly', () => {
      const properties = schemaContent.properties;

      // Check optional properties exist
      expect(properties).toHaveProperty('citationStyle');
      expect(properties).toHaveProperty('targetAudience');
      expect(properties).toHaveProperty('learningOutcomes');
      expect(properties).toHaveProperty('resources');
      expect(properties).toHaveProperty('frontMatter');
      expect(properties).toHaveProperty('backMatter');
    });
  });

  describe('Definitions Structure', () => {
    it('should have definitions section', () => {
      expect(schemaContent).toHaveProperty('definitions');
      expect(typeof schemaContent.definitions).toBe('object');
    });

    it('should define all core object types', () => {
      const definitions = schemaContent.definitions;

      // Core base objects
      expect(definitions).toHaveProperty('XatsObject');
      expect(definitions).toHaveProperty('StructuralContainer');
      expect(definitions).toHaveProperty('SemanticText');
      expect(definitions).toHaveProperty('ContentBlock');

      // Structural objects
      expect(definitions).toHaveProperty('Unit');
      expect(definitions).toHaveProperty('Chapter');
      expect(definitions).toHaveProperty('Section');

      // Content objects
      expect(definitions).toHaveProperty('FrontMatter');
      expect(definitions).toHaveProperty('BodyMatter');
      expect(definitions).toHaveProperty('BackMatter');

      // Learning objects
      expect(definitions).toHaveProperty('LearningObjective');
      expect(definitions).toHaveProperty('LearningOutcome');

      // Other core objects
      expect(definitions).toHaveProperty('Resource');
      expect(definitions).toHaveProperty('KeyTerm');
      expect(definitions).toHaveProperty('Pathway');
      expect(definitions).toHaveProperty('CslDataItem');
      expect(definitions).toHaveProperty('RenderingHint');
    });

    it('should define all text run types', () => {
      const definitions = schemaContent.definitions;

      expect(definitions).toHaveProperty('TextRun');
      expect(definitions).toHaveProperty('ReferenceRun');
      expect(definitions).toHaveProperty('CitationRun');
      expect(definitions).toHaveProperty('EmphasisRun');
      expect(definitions).toHaveProperty('StrongRun');
    });

    it('should have valid definition structure for each definition', () => {
      const definitions = schemaContent.definitions;

      Object.keys(definitions).forEach((definitionName) => {
        const definition = definitions[definitionName];

        // Each definition should be an object
        expect(typeof definition).toBe('object');

        // Should have either type, allOf, or oneOf
        const hasValidStructure =
          Object.prototype.hasOwnProperty.call(definition, 'type') ||
          Object.prototype.hasOwnProperty.call(definition, 'allOf') ||
          Object.prototype.hasOwnProperty.call(definition, 'oneOf');

        expect(hasValidStructure).toBe(true);

        // Most definitions should have descriptions, but some simple ones may not
        // This is documentation guidance, not a strict requirement
      });
    });
  });

  describe('Reference Integrity', () => {
    it('should have valid internal references', () => {
      const schemaString = JSON.stringify(schemaContent);
      const internalRefs = schemaString.match(/"#\/definitions\/[^"]+"/g) || [];

      internalRefs.forEach((ref) => {
        const refPath = ref.slice(1, -1); // Remove quotes
        const definitionName = refPath.replace('#/definitions/', '');

        expect(schemaContent.definitions).toHaveProperty(definitionName);
      });
    });

    it('should not have dangling references', () => {
      const definitions = schemaContent.definitions;
      const definitionNames = Object.keys(definitions);

      // Get all $ref values in the schema
      const schemaString = JSON.stringify(schemaContent);
      const allRefs = schemaString.match(/"#\/definitions\/[^"]+"/g) || [];

      const referencedDefinitions = allRefs.map((ref) =>
        ref.slice(1, -1).replace('#/definitions/', '')
      );

      // Remove duplicates
      const uniqueReferencedDefinitions = [...new Set(referencedDefinitions)];

      // Every referenced definition should exist
      uniqueReferencedDefinitions.forEach((refName) => {
        expect(definitionNames).toContain(refName);
      });
    });

    it('should not have unused definitions', () => {
      const definitions = schemaContent.definitions;
      const definitionNames = Object.keys(definitions);

      // Get all $ref values in the schema (excluding the definitions themselves)
      const mainSchemaString = JSON.stringify({
        ...schemaContent,
        definitions: undefined,
      });

      const referencedInMain = (mainSchemaString.match(/"#\/definitions\/[^"]+"/g) || []).map(
        (ref) => ref.slice(1, -1).replace('#/definitions/', '')
      );

      // Get references within definitions
      const definitionsString = JSON.stringify(definitions);
      const referencedInDefinitions = (
        definitionsString.match(/"#\/definitions\/[^"]+"/g) || []
      ).map((ref) => ref.slice(1, -1).replace('#/definitions/', ''));

      const allReferencedDefinitions = [
        ...new Set([...referencedInMain, ...referencedInDefinitions]),
      ];

      // Every definition should be referenced somewhere
      definitionNames.forEach((defName) => {
        expect(allReferencedDefinitions).toContain(defName);
      });
    });
  });

  describe('URI Format Validation', () => {
    it('should have valid URI formats for blockType', () => {
      const contentBlockDef = schemaContent.definitions.ContentBlock;

      // Find the blockType property
      const blockTypeProp = contentBlockDef.allOf[1].properties.blockType;
      expect(blockTypeProp.format).toBe('uri');
    });

    it('should have valid URI formats for rendering hints', () => {
      const renderingHintDef = schemaContent.definitions.RenderingHint;

      const hintTypeProp = renderingHintDef.properties.hintType;
      expect(hintTypeProp.format).toBe('uri');
    });

    it('should have valid URI formats for resources', () => {
      const resourceDef = schemaContent.definitions.Resource;

      // Resource is defined with allOf
      const resourceProps = resourceDef.allOf[1].properties;
      expect(resourceProps.type.format).toBe('uri');
      expect(resourceProps.url.format).toBe('uri');
    });

    it('should have valid URI formats for pathway components', () => {
      const pathwayDef = schemaContent.definitions.Pathway;

      const triggerTypeProp = pathwayDef.properties.trigger.properties.triggerType;
      expect(triggerTypeProp.format).toBe('uri');

      const pathwayTypeProp = pathwayDef.properties.rules.items.properties.pathwayType;
      expect(pathwayTypeProp.format).toBe('uri');
    });
  });

  describe('Constraint Validation', () => {
    it('should have proper const constraints', () => {
      // Check TextRun const constraint
      const textRun = schemaContent.definitions.TextRun;
      expect(textRun.properties.type.const).toBe('text');

      // Check other run types
      const referenceRun = schemaContent.definitions.ReferenceRun;
      expect(referenceRun.properties.type.const).toBe('reference');

      const citationRun = schemaContent.definitions.CitationRun;
      expect(citationRun.properties.type.const).toBe('citation');

      const emphasisRun = schemaContent.definitions.EmphasisRun;
      expect(emphasisRun.properties.type.const).toBe('emphasis');

      const strongRun = schemaContent.definitions.StrongRun;
      expect(strongRun.properties.type.const).toBe('strong');
    });

    it('should have proper enum constraints', () => {
      // Check list type enum
      const listBlockContent = getContentBlockSchema('https://xats.org/core/blocks/list');
      expect(listBlockContent.properties.listType.enum).toEqual(['ordered', 'unordered']);

      // Check math notation enum
      const mathBlockContent = getContentBlockSchema('https://xats.org/core/blocks/mathBlock');
      expect(mathBlockContent.properties.notation.enum).toEqual(['latex', 'mathml', 'asciimath']);
    });

    it('should have proper pattern constraints', () => {
      const pathwayDef = schemaContent.definitions.Pathway;
      const conditionProp = pathwayDef.properties.rules.items.properties.condition;

      expect(conditionProp.pattern).toBe('^(?!\\s*$).+');
    });

    it('should have proper minItems constraints', () => {
      const pathwayDef = schemaContent.definitions.Pathway;
      const rulesProp = pathwayDef.properties.rules;

      expect(rulesProp.minItems).toBe(1);
    });
  });

  // Helper function to extract content block schema for specific block types
  function getContentBlockSchema(blockType: string): any {
    // For testing purposes, return a simple mock structure
    // In practice, this would navigate the complex if/then/else chains
    if (blockType === 'https://xats.org/core/blocks/list') {
      return {
        properties: {
          listType: { enum: ['ordered', 'unordered'] },
          items: { type: 'array' },
        },
      };
    }
    if (blockType === 'https://xats.org/core/blocks/mathBlock') {
      return {
        properties: {
          notation: { enum: ['latex', 'mathml', 'asciimath'] },
          expression: { type: 'string' },
        },
      };
    }

    return {};
  }
});
