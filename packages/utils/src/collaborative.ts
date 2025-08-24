/**
 * xats v0.5.0 Collaborative Project Utilities
 *
 * Utility functions for working with collaborative project blocks
 */

import type {
  CollaborativeProjectContent,
  CollaborativeProjectBlock,
  ProjectRole,
  ProjectDeliverable,
  ProjectPhase,
  PeerAssessmentConfig,
} from '@xats-org/types';

/**
 * Create a new collaborative project block
 */
export function createCollaborativeProject(
  id: string,
  title: string,
  description: string,
  projectType: CollaborativeProjectContent['projectType'],
  options: Partial<CollaborativeProjectContent> = {}
): CollaborativeProjectBlock {
  return {
    id,
    language: 'en',
    blockType: 'https://xats.org/vocabularies/blocks/collaborativeProject',
    content: {
      title: { runs: [{ type: 'text', text: title }] },
      description: { runs: [{ type: 'text', text: description }] },
      projectType,
      roles: options.roles || [],
      deliverables: options.deliverables || [],
      ...options,
    },
  } as CollaborativeProjectBlock;
}

/**
 * Create a project role
 */
export function createProjectRole(
  roleId: string,
  title: string,
  description: string,
  responsibilities: string[],
  options: Partial<ProjectRole> = {}
): ProjectRole {
  return {
    roleId,
    title,
    description: { runs: [{ type: 'text', text: description }] },
    responsibilities: responsibilities.map((resp) => ({
      runs: [{ type: 'text', text: resp }],
    })),
    ...options,
  };
}

/**
 * Create a project deliverable
 */
export function createProjectDeliverable(
  deliverableId: string,
  title: string,
  description: string,
  format: ProjectDeliverable['format'],
  isGroupDeliverable: boolean,
  options: Partial<ProjectDeliverable> = {}
): ProjectDeliverable {
  return {
    deliverableId,
    title,
    description: { runs: [{ type: 'text', text: description }] },
    format,
    isGroupDeliverable,
    ...options,
  };
}

/**
 * Create a project phase
 */
export function createProjectPhase(
  phaseId: string,
  title: string,
  description: string,
  options: Partial<ProjectPhase> = {}
): ProjectPhase {
  return {
    phaseId,
    title,
    description: { runs: [{ type: 'text', text: description }] },
    ...options,
  };
}

/**
 * Create peer assessment configuration
 */
export function createPeerAssessment(
  enabled: boolean,
  options: Partial<PeerAssessmentConfig> = {}
): PeerAssessmentConfig {
  return {
    enabled,
    anonymity: true,
    reciprocity: true,
    ...options,
  };
}

/**
 * Validation functions
 */
export const CollaborativeProjectValidator = {
  /**
   * Validate that all role IDs are unique
   */
  validateUniqueRoleIds(roles: ProjectRole[]): string[] {
    const errors: string[] = [];
    const seen = new Set<string>();

    for (const role of roles) {
      if (seen.has(role.roleId)) {
        errors.push(`Duplicate role ID: ${role.roleId}`);
      }
      seen.add(role.roleId);
    }

    return errors;
  },

  /**
   * Validate that all deliverable IDs are unique
   */
  validateUniqueDeliverableIds(deliverables: ProjectDeliverable[]): string[] {
    const errors: string[] = [];
    const seen = new Set<string>();

    for (const deliverable of deliverables) {
      if (seen.has(deliverable.deliverableId)) {
        errors.push(`Duplicate deliverable ID: ${deliverable.deliverableId}`);
      }
      seen.add(deliverable.deliverableId);
    }

    return errors;
  },

  /**
   * Validate assessment criteria weights sum to 1.0
   */
  validateAssessmentWeights(deliverable: ProjectDeliverable): string[] {
    const errors: string[] = [];

    if (!deliverable.assessmentCriteria || deliverable.assessmentCriteria.length === 0) {
      return errors;
    }

    const totalWeight = deliverable.assessmentCriteria.reduce(
      (sum, criterion) => sum + criterion.weight,
      0
    );

    // Allow small floating point tolerance
    const tolerance = 0.001;
    if (Math.abs(totalWeight - 1.0) > tolerance) {
      errors.push(
        `Assessment criteria weights for ${deliverable.deliverableId} sum to ${totalWeight}, should sum to 1.0`
      );
    }

    return errors;
  },

  /**
   * Validate that phase deliverable references exist
   */
  validatePhaseDeliverables(phases: ProjectPhase[], deliverables: ProjectDeliverable[]): string[] {
    const errors: string[] = [];
    const deliverableIds = new Set(deliverables.map((d) => d.deliverableId));

    for (const phase of phases) {
      if (phase.deliverableIds) {
        for (const deliverableId of phase.deliverableIds) {
          if (!deliverableIds.has(deliverableId)) {
            errors.push(
              `Phase ${phase.phaseId} references non-existent deliverable: ${deliverableId}`
            );
          }
        }
      }
    }

    return errors;
  },

  /**
   * Validate complete collaborative project
   */
  validateProject(project: CollaborativeProjectContent): string[] {
    const errors: string[] = [];

    // Basic required field validation
    if (!project.title?.runs?.length) {
      errors.push('Project must have a title');
    }

    if (!project.description?.runs?.length) {
      errors.push('Project must have a description');
    }

    if (!project.roles?.length) {
      errors.push('Project must define at least one role');
    }

    if (!project.deliverables?.length) {
      errors.push('Project must define at least one deliverable');
    }

    // Detailed validation
    errors.push(...this.validateUniqueRoleIds(project.roles || []));
    errors.push(...this.validateUniqueDeliverableIds(project.deliverables || []));

    for (const deliverable of project.deliverables || []) {
      errors.push(...this.validateAssessmentWeights(deliverable));
    }

    if (project.timeline?.phases && project.deliverables) {
      errors.push(...this.validatePhaseDeliverables(project.timeline.phases, project.deliverables));
    }

    return errors;
  },
};

/**
 * Analysis and reporting functions
 */
export const CollaborativeProjectAnalyzer = {
  /**
   * Calculate total project effort in hours
   */
  calculateTotalEffort(project: CollaborativeProjectContent): number {
    if (project.timeline?.estimatedHours) {
      return project.timeline.estimatedHours;
    }

    // Fallback: estimate based on deliverables (rough heuristic)
    const deliverableCount = project.deliverables?.length || 0;
    const roleCount = project.roles?.length || 1;

    // Rough estimate: 5-10 hours per deliverable per role
    return deliverableCount * roleCount * 7.5;
  },

  /**
   * Get all unique skills required across roles
   */
  getRequiredSkills(project: CollaborativeProjectContent): string[] {
    const skills = new Set<string>();

    for (const role of project.roles || []) {
      if (role.requiredSkills) {
        role.requiredSkills.forEach((skill) => skills.add(skill));
      }
    }

    return Array.from(skills).sort();
  },

  /**
   * Calculate project complexity score
   */
  calculateComplexityScore(project: CollaborativeProjectContent): {
    score: number;
    factors: Record<string, number>;
  } {
    const factors = {
      roleCount: Math.min((project.roles?.length || 0) * 0.2, 1.0),
      deliverableCount: Math.min((project.deliverables?.length || 0) * 0.15, 1.0),
      phaseCount: Math.min((project.timeline?.phases?.length || 0) * 0.1, 0.5),
      skillDiversity: Math.min(this.getRequiredSkills(project).length * 0.05, 0.5),
      peerAssessment: project.peerAssessment?.enabled ? 0.3 : 0,
      timeline: project.timeline ? 0.2 : 0,
    };

    const score = Object.values(factors).reduce((sum, val) => sum + val, 0);

    return {
      score: Math.min(score, 5.0), // Cap at 5.0
      factors,
    };
  },

  /**
   * Generate project summary report
   */
  generateSummaryReport(project: CollaborativeProjectContent): string {
    const complexity = this.calculateComplexityScore(project);
    const skills = this.getRequiredSkills(project);
    const effort = this.calculateTotalEffort(project);

    const firstRun = project.title.runs[0];
    const titleText = firstRun && 'text' in firstRun ? firstRun.text : 'Untitled';
    let report = `# Collaborative Project Summary: ${titleText}\n\n`;
    report += `**Type**: ${project.projectType}\n`;
    report += `**Complexity Score**: ${complexity.score.toFixed(1)}/5.0\n`;
    report += `**Estimated Effort**: ${effort} hours\n\n`;

    report += `## Structure\n`;
    report += `- **Roles**: ${project.roles?.length || 0}\n`;
    report += `- **Deliverables**: ${project.deliverables?.length || 0}\n`;
    report += `- **Phases**: ${project.timeline?.phases?.length || 0}\n`;
    report += `- **Peer Assessment**: ${project.peerAssessment?.enabled ? 'Enabled' : 'Disabled'}\n\n`;

    if (skills.length > 0) {
      report += `## Required Skills\n`;
      skills.forEach((skill) => {
        report += `- ${skill}\n`;
      });
      report += '\n';
    }

    return report;
  },
};

/**
 * Template generators for common project types
 */
export const CollaborativeProjectTemplates = {
  /**
   * Create a research project template
   */
  createResearchProject(id: string, topic: string): CollaborativeProjectBlock {
    return createCollaborativeProject(
      id,
      `Research Project: ${topic}`,
      `Collaborative research project investigating ${topic}`,
      'research-project',
      {
        roles: [
          createProjectRole(
            'research-lead',
            'Research Lead',
            'Coordinates research activities and ensures quality of findings',
            ['Design research methodology', 'Coordinate team activities', 'Review findings quality']
          ),
          createProjectRole(
            'data-analyst',
            'Data Analyst',
            'Responsible for data collection and analysis',
            ['Collect relevant data', 'Perform statistical analysis', 'Create visualizations']
          ),
          createProjectRole(
            'writer',
            'Writer/Editor',
            'Responsible for writing and editing the final report',
            [
              'Draft research report',
              'Edit and proofread content',
              'Ensure academic writing standards',
            ]
          ),
        ],
        deliverables: [
          createProjectDeliverable(
            'literature-review',
            'Literature Review',
            'Comprehensive review of existing research on the topic',
            'document',
            true
          ),
          createProjectDeliverable(
            'data-analysis',
            'Data Analysis Report',
            'Statistical analysis of collected data with visualizations',
            'report',
            false
          ),
          createProjectDeliverable(
            'final-report',
            'Final Research Report',
            'Complete research report with findings and recommendations',
            'document',
            true
          ),
        ],
        peerAssessment: createPeerAssessment(true, {
          assessmentType: 'peer-evaluation',
          anonymity: true,
        }),
      }
    );
  },

  /**
   * Create a case study analysis template
   */
  createCaseStudyProject(id: string, caseTitle: string): CollaborativeProjectBlock {
    return createCollaborativeProject(
      id,
      `Case Study Analysis: ${caseTitle}`,
      `Collaborative analysis of the ${caseTitle} case study`,
      'case-study-analysis',
      {
        roles: [
          createProjectRole(
            'analyst',
            'Primary Analyst',
            'Leads the case analysis and identifies key issues',
            [
              'Identify key problems and stakeholders',
              'Analyze root causes',
              'Develop solution framework',
            ]
          ),
          createProjectRole(
            'researcher',
            'Background Researcher',
            'Provides context and supporting research',
            ['Research industry context', 'Find comparable cases', 'Gather supporting evidence']
          ),
          createProjectRole(
            'presenter',
            'Presentation Lead',
            'Develops and delivers the final presentation',
            [
              'Create presentation slides',
              'Practice and deliver presentation',
              'Handle Q&A session',
            ]
          ),
        ],
        deliverables: [
          createProjectDeliverable(
            'case-analysis',
            'Case Analysis Report',
            'Detailed written analysis of the case study',
            'document',
            true
          ),
          createProjectDeliverable(
            'presentation',
            'Case Presentation',
            'Presentation of findings and recommendations',
            'presentation',
            true
          ),
        ],
      }
    );
  },
};

