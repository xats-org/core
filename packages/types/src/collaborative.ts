/**
 * xats v0.5.0 Collaborative Project Types
 *
 * TypeScript type definitions for collaborative project features
 * introduced in xats schema version 0.5.0
 */

import { XatsObject } from './common.js';
import { SemanticText, Resource } from './document.js';

/**
 * Collaborative project block content for structured group work
 */
export interface CollaborativeProjectContent {
  /** Title of the collaborative project */
  title: SemanticText;
  
  /** Detailed description of the project objectives and requirements */
  description: SemanticText;
  
  /** Category of collaborative project */
  projectType: 'research-project' | 'case-study-analysis' | 'presentation-development' | 
               'peer-review-activity' | 'design-challenge' | 'problem-solving-exercise' |
               'creative-collaboration' | 'literature-review' | 'data-analysis-project' |
               'peer-teaching-activity';
  
  /** Defined roles for project participants with specific responsibilities */
  roles: ProjectRole[];
  
  /** Project deliverables with deadlines and assessment criteria */
  deliverables: ProjectDeliverable[];
  
  /** Peer assessment configuration for collaborative evaluation */
  peerAssessment?: PeerAssessmentConfig;
  
  /** Project timeline with phases and milestones */
  timeline?: ProjectTimeline;
  
  /** Resources available for the project */
  resources?: Resource[];
  
  /** Detailed instructions for project execution */
  instructions?: SemanticText;
  
  /** Any constraints or limitations for the project */
  constraints?: SemanticText[];
}

/**
 * Project role definition with responsibilities and requirements
 */
export interface ProjectRole {
  /** Unique identifier for the role */
  roleId: string;
  
  /** Display name of the role */
  title: string;
  
  /** Detailed description of the role */
  description: SemanticText;
  
  /** Specific responsibilities for this role */
  responsibilities: SemanticText[];
  
  /** Skills required for this role */
  requiredSkills?: string[];
  
  /** Maximum number of participants for this role */
  maxParticipants?: number;
}

/**
 * Project deliverable with assessment criteria
 */
export interface ProjectDeliverable {
  /** Unique identifier for the deliverable */
  deliverableId: string;
  
  /** Display name of the deliverable */
  title: string;
  
  /** Detailed description of the deliverable */
  description: SemanticText;
  
  /** Format type of the deliverable */
  format: 'document' | 'presentation' | 'media' | 'code' | 'prototype' | 'report' | 'analysis' | 'other';
  
  /** Due date for the deliverable */
  dueDate?: string; // ISO 8601 date-time
  
  /** Whether entire group collaborates on this deliverable */
  isGroupDeliverable: boolean;
  
  /** Assessment criteria for grading */
  assessmentCriteria?: AssessmentCriterion[];
}

/**
 * Assessment criterion for deliverable evaluation
 */
export interface AssessmentCriterion {
  /** Name of the criterion */
  criterion: string;
  
  /** Weight of this criterion in overall grade (0-1) */
  weight: number;
  
  /** Description of the criterion */
  description?: SemanticText;
}

/**
 * Peer assessment configuration
 */
export interface PeerAssessmentConfig {
  /** Whether peer assessment is enabled */
  enabled: boolean;
  
  /** Type of peer assessment */
  assessmentType?: 'peer-evaluation' | 'self-reflection' | 'mutual-feedback' | 
                   'role-assessment' | 'contribution-rating';
  
  /** Assessment criteria for peer evaluation */
  criteria?: PeerAssessmentCriterion[];
  
  /** Whether assessments are anonymous */
  anonymity?: boolean;
  
  /** Whether all members assess all other members */
  reciprocity?: boolean;
}

/**
 * Peer assessment criterion
 */
export interface PeerAssessmentCriterion {
  /** Unique identifier for the criterion */
  criterionId: string;
  
  /** Display name of the criterion */
  name: string;
  
  /** Description of what this criterion measures */
  description: SemanticText;
  
  /** Scale configuration for rating */
  scale: AssessmentScale;
}

/**
 * Assessment scale configuration
 */
export interface AssessmentScale {
  /** Type of scale */
  type: 'numeric' | 'likert' | 'categorical' | 'binary';
  
  /** Range for numeric scales */
  range?: {
    min: number;
    max: number;
  };
  
  /** Labels for scale points or categorical options */
  labels?: string[];
}

/**
 * Project timeline with phases
 */
export interface ProjectTimeline {
  /** Project phases with activities and deadlines */
  phases?: ProjectPhase[];
  
  /** Total estimated work hours for the project */
  estimatedHours?: number;
}

/**
 * Project phase definition
 */
export interface ProjectPhase {
  /** Unique identifier for the phase */
  phaseId: string;
  
  /** Display name of the phase */
  title: string;
  
  /** Description of the phase activities */
  description: SemanticText;
  
  /** Phase start date */
  startDate?: string; // ISO 8601 date-time
  
  /** Phase end date */
  endDate?: string; // ISO 8601 date-time
  
  /** Activities to be completed in this phase */
  activities?: SemanticText[];
  
  /** References to deliverables due in this phase */
  deliverableIds?: string[];
}

/**
 * Collaborative project block with all metadata
 */
export interface CollaborativeProjectBlock extends XatsObject {
  /** Block type URI for collaborative projects */
  blockType: 'https://xats.org/vocabularies/blocks/collaborativeProject';
  
  /** Collaborative project content */
  content: CollaborativeProjectContent;
}

/**
 * Utility functions for collaborative projects
 */
export namespace CollaborativeProjectUtils {
  /**
   * Validate that a collaborative project has required components
   */
  export function validateProject(project: CollaborativeProjectContent): string[] {
    const errors: string[] = [];
    
    if (!project.title || !project.title.runs || project.title.runs.length === 0) {
      errors.push('Project must have a title');
    }
    
    if (!project.description || !project.description.runs || project.description.runs.length === 0) {
      errors.push('Project must have a description');
    }
    
    if (!project.roles || project.roles.length === 0) {
      errors.push('Project must define at least one role');
    }
    
    if (!project.deliverables || project.deliverables.length === 0) {
      errors.push('Project must define at least one deliverable');
    }
    
    // Validate role IDs are unique
    const roleIds = new Set<string>();
    for (const role of project.roles || []) {
      if (roleIds.has(role.roleId)) {
        errors.push(`Duplicate role ID: ${role.roleId}`);
      }
      roleIds.add(role.roleId);
    }
    
    // Validate deliverable IDs are unique
    const deliverableIds = new Set<string>();
    for (const deliverable of project.deliverables || []) {
      if (deliverableIds.has(deliverable.deliverableId)) {
        errors.push(`Duplicate deliverable ID: ${deliverable.deliverableId}`);
      }
      deliverableIds.add(deliverable.deliverableId);
    }
    
    return errors;
  }
  
  /**
   * Calculate total assessment weight for deliverable
   */
  export function calculateDeliverableWeight(deliverable: ProjectDeliverable): number {
    if (!deliverable.assessmentCriteria) return 0;
    return deliverable.assessmentCriteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  }
  
  /**
   * Get all unique skills required across all roles
   */
  export function getRequiredSkills(project: CollaborativeProjectContent): string[] {
    const skills = new Set<string>();
    for (const role of project.roles) {
      if (role.requiredSkills) {
        role.requiredSkills.forEach(skill => skills.add(skill));
      }
    }
    return Array.from(skills);
  }
  
  /**
   * Check if project timeline is consistent with deliverable dates
   */
  export function validateTimeline(project: CollaborativeProjectContent): string[] {
    const errors: string[] = [];
    
    if (!project.timeline?.phases || !project.deliverables) {
      return errors;
    }
    
    // Check that referenced deliverables exist
    for (const phase of project.timeline.phases) {
      if (phase.deliverableIds) {
        for (const deliverableId of phase.deliverableIds) {
          const deliverable = project.deliverables.find(d => d.deliverableId === deliverableId);
          if (!deliverable) {
            errors.push(`Phase ${phase.phaseId} references non-existent deliverable: ${deliverableId}`);
          }
        }
      }
    }
    
    return errors;
  }
}