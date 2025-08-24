/**
 * Test suite for collaborative project block validation
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { describe, test, expect } from 'vitest';

interface CollaborativeProjectDocument {
  schemaVersion: string;
  bodyMatter: {
    contents: Array<{
      id: string;
      sections: Array<{
        id: string;
        content: Array<{
          blockType: string;
          content: {
            title: { runs: Array<{ type: string; text: string }> };
            description: { runs: Array<{ type: string; text: string }> };
            projectType: string;
            roles: Array<{
              roleId: string;
              title: string;
              description: { runs: Array<{ type: string; text: string }> };
              responsibilities: Array<{ runs: Array<{ type: string; text: string }> }>;
              requiredSkills?: string[];
            }>;
            deliverables: Array<{
              deliverableId: string;
              title: string;
              description: { runs: Array<{ type: string; text: string }> };
              format: string;
              isGroupDeliverable: boolean;
              assessmentCriteria?: Array<{
                criterion: string;
                weight: number;
                description?: { runs: Array<{ type: string; text: string }> };
              }>;
            }>;
            peerAssessment?: {
              enabled: boolean;
              assessmentType?: string;
              criteria?: Array<{
                criterionId: string;
                name: string;
                description: { runs: Array<{ type: string; text: string }> };
                scale: {
                  type: string;
                  range?: { min: number; max: number };
                  labels?: string[];
                };
              }>;
              anonymity?: boolean;
              reciprocity?: boolean;
            };
            timeline?: {
              phases?: Array<{
                phaseId: string;
                title: string;
                description: { runs: Array<{ type: string; text: string }> };
                startDate?: string;
                endDate?: string;
                activities?: Array<{ runs: Array<{ type: string; text: string }> }>;
                deliverableIds?: string[];
              }>;
              estimatedHours?: number;
            };
            resources?: Array<{
              title: string;
              location: string;
              type: string;
            }>;
            instructions?: { runs: Array<{ type: string; text: string }> };
            constraints?: Array<{ runs: Array<{ type: string; text: string }> }>;
          };
        }>;
      }>;
    }>;
  };
}

describe('Collaborative Project Block Validation', () => {
  // Load the collaborative project demo
  const examplePath = join(__dirname, '../examples/v0.5.0/collaborative-project-demo.json');
  const document = JSON.parse(readFileSync(examplePath, 'utf8')) as CollaborativeProjectDocument;

  test('collaborative project demo document structure is valid', () => {
    // Basic structure validation without full schema validation
    expect(document).toBeDefined();
    expect(document.schemaVersion).toBeDefined();
    expect(document.bodyMatter).toBeDefined();
    expect(document.bodyMatter.contents).toBeDefined();
  });

  test('document has correct schema version', () => {
    expect(document.schemaVersion).toBe('0.5.0');
  });

  test('collaborative project block has required properties', () => {
    const collaborativeBlock = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1];

    expect(collaborativeBlock).toBeDefined();
    expect(collaborativeBlock?.blockType).toBe(
      'https://xats.org/vocabularies/blocks/collaborativeProject'
    );
    expect(collaborativeBlock?.content).toBeDefined();
    expect(collaborativeBlock?.content?.title).toBeDefined();
    expect(collaborativeBlock?.content?.description).toBeDefined();
    expect(collaborativeBlock?.content?.projectType).toBeDefined();
    expect(collaborativeBlock?.content?.roles).toBeDefined();
    expect(collaborativeBlock?.content?.deliverables).toBeDefined();
  });

  test('project has valid roles structure', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;

    expect(project).toBeDefined();
    expect(Array.isArray(project?.roles)).toBe(true);
    expect(project?.roles?.length).toBeGreaterThan(0);

    for (const role of project?.roles || []) {
      expect(role.roleId).toBeDefined();
      expect(role.title).toBeDefined();
      expect(role.description).toBeDefined();
      expect(Array.isArray(role.responsibilities)).toBe(true);
      expect(role.responsibilities.length).toBeGreaterThan(0);
    }
  });

  test('project has valid deliverables structure', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;

    expect(Array.isArray(project?.deliverables)).toBe(true);
    expect(project?.deliverables?.length).toBeGreaterThan(0);

    for (const deliverable of project?.deliverables || []) {
      expect(deliverable.deliverableId).toBeDefined();
      expect(deliverable.title).toBeDefined();
      expect(deliverable.description).toBeDefined();
      expect(deliverable.format).toBeDefined();
      expect(typeof deliverable.isGroupDeliverable).toBe('boolean');
    }
  });

  test('project has valid peer assessment configuration', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;

    expect(project?.peerAssessment).toBeDefined();
    expect(typeof project?.peerAssessment?.enabled).toBe('boolean');
    expect(project?.peerAssessment?.enabled).toBe(true);
    expect(project?.peerAssessment?.assessmentType).toBeDefined();
    expect(Array.isArray(project?.peerAssessment?.criteria)).toBe(true);
    expect(project?.peerAssessment?.criteria?.length).toBeGreaterThan(0);
  });

  test('project has valid timeline structure', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;

    expect(project?.timeline).toBeDefined();
    expect(Array.isArray(project?.timeline?.phases)).toBe(true);
    expect(project?.timeline?.phases?.length).toBeGreaterThan(0);
    expect(typeof project?.timeline?.estimatedHours).toBe('number');

    for (const phase of project?.timeline?.phases || []) {
      expect(phase.phaseId).toBeDefined();
      expect(phase.title).toBeDefined();
      expect(phase.description).toBeDefined();
      expect(Array.isArray(phase.activities)).toBe(true);
    }
  });

  test('role IDs are unique', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;
    const roleIds = project?.roles?.map((role) => role.roleId) || [];
    const uniqueIds = new Set(roleIds);

    expect(roleIds.length).toBe(uniqueIds.size);
  });

  test('deliverable IDs are unique', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;
    const deliverableIds =
      project?.deliverables?.map((deliverable) => deliverable.deliverableId) || [];
    const uniqueIds = new Set(deliverableIds);

    expect(deliverableIds.length).toBe(uniqueIds.size);
  });

  test('assessment criteria weights are valid', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;

    for (const deliverable of project?.deliverables || []) {
      if (deliverable.assessmentCriteria) {
        const totalWeight = deliverable.assessmentCriteria.reduce(
          (sum, criterion) => sum + criterion.weight,
          0
        );

        // Allow small floating point tolerance
        expect(Math.abs(totalWeight - 1.0)).toBeLessThan(0.001);
      }
    }
  });

  test('phase deliverable references are valid', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;
    const deliverableIds = new Set(project?.deliverables?.map((d) => d.deliverableId) || []);

    for (const phase of project?.timeline?.phases || []) {
      if (phase.deliverableIds) {
        for (const deliverableId of phase.deliverableIds) {
          expect(deliverableIds.has(deliverableId)).toBe(true);
        }
      }
    }
  });

  test('semantic text structures are valid', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;

    // Check title and description
    expect(project?.title?.runs).toBeDefined();
    expect(Array.isArray(project?.title?.runs)).toBe(true);
    expect(project?.title?.runs?.length).toBeGreaterThan(0);

    expect(project?.description?.runs).toBeDefined();
    expect(Array.isArray(project?.description?.runs)).toBe(true);
    expect(project?.description?.runs?.length).toBeGreaterThan(0);

    // Check role descriptions
    for (const role of project?.roles || []) {
      expect(role.description.runs).toBeDefined();
      expect(Array.isArray(role.description.runs)).toBe(true);
      expect(role.description.runs.length).toBeGreaterThan(0);

      for (const responsibility of role.responsibilities) {
        expect(responsibility.runs).toBeDefined();
        expect(Array.isArray(responsibility.runs)).toBe(true);
        expect(responsibility.runs.length).toBeGreaterThan(0);
      }
    }
  });

  test('project type is from valid enum', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;
    const validTypes = [
      'research-project',
      'case-study-analysis',
      'presentation-development',
      'peer-review-activity',
      'design-challenge',
      'problem-solving-exercise',
      'creative-collaboration',
      'literature-review',
      'data-analysis-project',
      'peer-teaching-activity',
    ];

    expect(validTypes.includes(project?.projectType || '')).toBe(true);
  });

  test('deliverable formats are from valid enum', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;
    const validFormats = [
      'document',
      'presentation',
      'media',
      'code',
      'prototype',
      'report',
      'analysis',
      'other',
    ];

    for (const deliverable of project?.deliverables || []) {
      expect(validFormats.includes(deliverable.format)).toBe(true);
    }
  });

  test('peer assessment scale types are valid', () => {
    const project = document.bodyMatter.contents[0]?.sections?.[0]?.content?.[1]?.content;
    const validScaleTypes = ['numeric', 'likert', 'categorical', 'binary'];

    for (const criterion of project?.peerAssessment?.criteria || []) {
      expect(validScaleTypes.includes(criterion.scale.type)).toBe(true);

      if (criterion.scale.type === 'numeric') {
        expect(criterion.scale.range).toBeDefined();
        expect(typeof criterion.scale.range?.min).toBe('number');
        expect(typeof criterion.scale.range?.max).toBe('number');
        expect(criterion.scale.range?.max).toBeGreaterThan(criterion.scale.range?.min || 0);
      }

      if (criterion.scale.type === 'likert' || criterion.scale.type === 'categorical') {
        expect(Array.isArray(criterion.scale.labels)).toBe(true);
        expect(criterion.scale.labels?.length).toBeGreaterThan(0);
      }
    }
  });
});
