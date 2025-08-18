/**
 * LTI 1.3 Integration Test Suite for xats v0.2.0
 * 
 * Tests LTI schema extensions and validates integration examples
 * against the xats JSON Schema.
 */

import { describe, it, expect } from 'vitest';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fs from 'fs';
import path from 'path';

// Load schemas
const xatsSchema = JSON.parse(
  fs.readFileSync(path.resolve('schemas/0.2.0/xats.json'), 'utf8')
);

const ltiExtensionSchema = JSON.parse(
  fs.readFileSync(path.resolve('extensions/lti-1.3.json'), 'utf8')
);

const ltiIntegrationExample = JSON.parse(
  fs.readFileSync(path.resolve('examples/lti-integration-example.json'), 'utf8')
);

// Initialize AJV with options to handle external references
const ajv = new Ajv({ 
  allErrors: true, 
  strict: false,
  validateFormats: false // Skip format validation to avoid external dependencies
});
addFormats(ajv);

// Add LTI extension schema
ajv.addSchema(ltiExtensionSchema, 'https://xats.org/extensions/lti-1.3/schema.json');

// Create a modified schema without CSL external reference for testing
const testSchema = JSON.parse(JSON.stringify(xatsSchema));
if (testSchema.definitions?.CslDataItem?.allOf) {
  // Replace CSL reference with simplified schema for testing
  testSchema.definitions.CslDataItem = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      type: { type: 'string' },
      title: { type: 'string' }
    },
    required: ['id'],
    additionalProperties: true
  };
}

// Compile main schema
const validate = ajv.compile(testSchema);

describe('LTI 1.3 Extension Schema', () => {
  describe('Schema Definitions', () => {
    it('should have all required LTI definitions', () => {
      const requiredDefinitions = [
        'LtiConfiguration',
        'LtiPlatformRegistration',
        'LtiServiceEndpoints', 
        'LtiLaunchMetadata',
        'LtiGradePassback',
        'LtiDeepLinking',
        'LtiContentItem',
        'LtiPathwayIntegration'
      ];

      requiredDefinitions.forEach(def => {
        expect(ltiExtensionSchema.definitions).toHaveProperty(def);
        expect(ltiExtensionSchema.definitions[def]).toHaveProperty('type');
        expect(ltiExtensionSchema.definitions[def]).toHaveProperty('properties');
      });
    });

    it('should define LtiConfiguration with required properties', () => {
      const ltiConfig = ltiExtensionSchema.definitions.LtiConfiguration;
      
      expect(ltiConfig.required).toContain('toolTitle');
      expect(ltiConfig.required).toContain('launchUrl');
      expect(ltiConfig.required).toContain('loginInitiationUrl');
      expect(ltiConfig.required).toContain('redirectUris');
      expect(ltiConfig.required).toContain('jwksUrl');
      
      expect(ltiConfig.properties.supportedServices.items.enum).toContain(
        'https://purl.imsglobal.org/spec/lti-ags/scope/score'
      );
    });

    it('should define LtiGradePassback with proper AGS mapping', () => {
      const gradePassback = ltiExtensionSchema.definitions.LtiGradePassback;
      
      expect(gradePassback.properties).toHaveProperty('lineItemConfig');
      expect(gradePassback.properties.lineItemConfig.properties).toHaveProperty('scoreMaximum');
      expect(gradePassback.properties).toHaveProperty('scoreFormat');
      expect(gradePassback.properties.scoreFormat.enum).toContain('percentage');
    });

    it('should define LtiDeepLinking with content item support', () => {
      const deepLinking = ltiExtensionSchema.definitions.LtiDeepLinking;
      
      expect(deepLinking.properties).toHaveProperty('contentItems');
      expect(deepLinking.properties.acceptTypes.items.enum).toContain('ltiResourceLink');
    });
  });

  describe('Integration Example Validation', () => {
    it('should validate the complete LTI integration example', () => {
      const valid = validate(ltiIntegrationExample);
      
      if (!valid) {
        console.error('Validation errors:', JSON.stringify(validate.errors, null, 2));
      }
      
      expect(valid).toBe(true);
    });

    it('should have LTI configuration at document level', () => {
      expect(ltiIntegrationExample.extensions).toHaveProperty('ltiConfiguration');
      
      const ltiConfig = ltiIntegrationExample.extensions.ltiConfiguration;
      expect(ltiConfig).toHaveProperty('toolTitle');
      expect(ltiConfig).toHaveProperty('launchUrl');
      expect(ltiConfig).toHaveProperty('platformRegistrations');
      expect(Array.isArray(ltiConfig.platformRegistrations)).toBe(true);
    });

    it('should have grade passback configured on assessments', () => {
      const chapter = ltiIntegrationExample.bodyMatter.contents[0];
      const assessmentSection = chapter.sections.find(s => s.id === 'bonding-concepts');
      const assessment = assessmentSection.content.find(c => c.blockType.includes('multipleChoice'));
      
      expect(assessment.extensions).toHaveProperty('ltiGradePassback');
      expect(assessment.extensions.ltiGradePassback.enabled).toBe(true);
      expect(assessment.extensions.ltiGradePassback.lineItemConfig).toHaveProperty('scoreMaximum');
    });

    it('should have deep linking configured on structural containers', () => {
      const chapter = ltiIntegrationExample.bodyMatter.contents[0];
      
      expect(chapter.extensions).toHaveProperty('ltiDeepLinking');
      expect(chapter.extensions.ltiDeepLinking.enabled).toBe(true);
      expect(chapter.extensions.ltiDeepLinking).toHaveProperty('contentItems');
      expect(Array.isArray(chapter.extensions.ltiDeepLinking.contentItems)).toBe(true);
    });

    it('should have pathway integration with LTI data', () => {
      const chapter = ltiIntegrationExample.bodyMatter.contents[0];
      const pathway = chapter.pathways[0];
      
      expect(pathway.extensions).toHaveProperty('ltiPathwayIntegration');
      expect(pathway.extensions.ltiPathwayIntegration.useGradeData).toBe(true);
      expect(pathway.extensions.ltiPathwayIntegration).toHaveProperty('gradeVariables');
      
      // Check pathway rules use LTI variables
      const rules = pathway.rules;
      expect(rules.some(rule => rule.condition.includes('lti_score_percentage'))).toBe(true);
    });
  });

  describe('LMS Platform Registration', () => {
    it('should validate Canvas platform registration', () => {
      const ltiConfig = ltiIntegrationExample.extensions.ltiConfiguration;
      const canvasRegistration = ltiConfig.platformRegistrations.find(
        p => p.platformId === 'https://canvas.university.edu'
      );
      
      expect(canvasRegistration).toBeDefined();
      expect(canvasRegistration).toHaveProperty('clientId');
      expect(canvasRegistration).toHaveProperty('deploymentIds');
      expect(canvasRegistration).toHaveProperty('keySetUrl');
      expect(canvasRegistration).toHaveProperty('authTokenUrl');
      expect(canvasRegistration).toHaveProperty('authLoginUrl');
    });

    it('should include required service endpoints', () => {
      const ltiConfig = ltiIntegrationExample.extensions.ltiConfiguration;
      const registration = ltiConfig.platformRegistrations[0];
      
      expect(registration.serviceEndpoints).toHaveProperty('scopes');
      expect(registration.serviceEndpoints.scopes).toContain(
        'https://purl.imsglobal.org/spec/lti-ags/scope/score'
      );
    });
  });

  describe('Assessment to AGS Mapping', () => {
    it('should correctly map assessment scoring to line item config', () => {
      const chapter = ltiIntegrationExample.bodyMatter.contents[0];
      const assessment = chapter.sections[1].content[0];
      
      // xats assessment scoring
      expect(assessment.content.scoring.points).toBe(10);
      expect(assessment.content.scoring.scoringMethod).toBe('automatic');
      
      // LTI grade passback mapping
      const gradePassback = assessment.extensions.ltiGradePassback;
      expect(gradePassback.lineItemConfig.scoreMaximum).toBe(100);
      expect(gradePassback.scoreFormat).toBe('percentage');
    });

    it('should include proper metadata for grade reporting', () => {
      const chapter = ltiIntegrationExample.bodyMatter.contents[0];
      const assessment = chapter.sections[1].content[0];
      const metadata = assessment.extensions.ltiGradePassback.includeMetadata;
      
      expect(metadata.timestamp).toBe(true);
      expect(metadata.activityProgress).toBe(true);
      expect(metadata.gradingProgress).toBe(true);
    });
  });

  describe('Deep Linking Content Items', () => {
    it('should define valid content items for selection', () => {
      const chapter = ltiIntegrationExample.bodyMatter.contents[0];
      const contentItems = chapter.extensions.ltiDeepLinking.contentItems;
      
      expect(contentItems).toHaveLength(2);
      
      // Interactive content item
      const interactiveItem = contentItems[0];
      expect(interactiveItem.type).toBe('ltiResourceLink');
      expect(interactiveItem).toHaveProperty('title');
      expect(interactiveItem).toHaveProperty('url');
      expect(interactiveItem).toHaveProperty('xatsResourceId');
      
      // Assessment with line item
      const assessmentItem = contentItems[1];
      expect(assessmentItem).toHaveProperty('lineItem');
      expect(assessmentItem.lineItem).toHaveProperty('scoreMaximum');
      expect(assessmentItem.lineItem).toHaveProperty('label');
    });

    it('should reference valid xats resource IDs', () => {
      const chapter = ltiIntegrationExample.bodyMatter.contents[0];
      const contentItems = chapter.extensions.ltiDeepLinking.contentItems;
      
      // Verify xatsResourceId references exist in document
      contentItems.forEach(item => {
        if (item.xatsResourceId) {
          // Should find matching ID in document structure
          const resourceExists = findResourceById(ltiIntegrationExample, item.xatsResourceId);
          expect(resourceExists).toBe(true);
        }
      });
    });
  });

  describe('Security and Compliance', () => {
    it('should use HTTPS URLs for all endpoints', () => {
      const ltiConfig = ltiIntegrationExample.extensions.ltiConfiguration;
      
      expect(ltiConfig.launchUrl).toMatch(/^https:\/\//);
      expect(ltiConfig.loginInitiationUrl).toMatch(/^https:\/\//);
      expect(ltiConfig.jwksUrl).toMatch(/^https:\/\//);
      
      ltiConfig.redirectUris.forEach(uri => {
        expect(uri).toMatch(/^https:\/\//);
      });
    });

    it('should validate JWT and OAuth endpoints format', () => {
      const registration = ltiIntegrationExample.extensions.ltiConfiguration.platformRegistrations[0];
      
      expect(registration.keySetUrl).toMatch(/^https:\/\/.*\/jwks/);
      expect(registration.authTokenUrl).toMatch(/^https:\/\/.*\/token/);
      expect(registration.authLoginUrl).toMatch(/^https:\/\//);
    });

    it('should include proper privacy level configuration', () => {
      const ltiConfig = ltiIntegrationExample.extensions.ltiConfiguration;
      
      expect(['public', 'email_only', 'name_only', 'anonymous']).toContain(ltiConfig.privacyLevel);
    });
  });
});

// Helper function to find resource by ID in document structure
function findResourceById(doc, targetId) {
  function searchObject(obj) {
    if (typeof obj !== 'object' || obj === null) return false;
    
    if (obj.id === targetId) return true;
    
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (searchObject(item)) return true;
        }
      } else if (typeof value === 'object') {
        if (searchObject(value)) return true;
      }
    }
    
    return false;
  }
  
  return searchObject(doc);
}

describe('LTI Pathway Integration', () => {
  it('should define valid LTI grade variables', () => {
    const chapter = ltiIntegrationExample.bodyMatter.contents[0];
    const pathway = chapter.pathways[0];
    const integration = pathway.extensions.ltiPathwayIntegration;
    
    expect(integration.gradeVariables).toHaveProperty('scorePercentage');
    expect(integration.gradeVariables).toHaveProperty('attempts');
    expect(integration.gradeVariables).toHaveProperty('activityProgress');
  });

  it('should use LTI variables in pathway conditions', () => {
    const chapter = ltiIntegrationExample.bodyMatter.contents[0];
    const pathway = chapter.pathways[0];
    
    const ltiConditions = pathway.rules.filter(rule => 
      rule.condition.includes('lti_score_percentage') ||
      rule.condition.includes('lti_attempts')
    );
    
    expect(ltiConditions.length).toBeGreaterThan(0);
    
    // Validate condition syntax
    ltiConditions.forEach(rule => {
      expect(rule.condition).toMatch(/lti_\w+/);
      expect(rule).toHaveProperty('destinationId');
      expect(rule).toHaveProperty('pathwayType');
    });
  });
});