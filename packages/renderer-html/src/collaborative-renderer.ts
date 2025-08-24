/**
 * HTML renderer for collaborative project blocks
 * 
 * Renders collaborative project blocks with role assignments,
 * deliverable tracking, peer assessment forms, and timeline visualization.
 */

import type { 
  CollaborativeProjectContent, 
  ProjectRole, 
  ProjectDeliverable, 
  ProjectPhase,
  PeerAssessmentConfig 
} from '@xats-org/types';

export interface CollaborativeProjectRenderOptions {
  /** Whether to show role assignment UI */
  showRoleAssignment?: boolean;
  
  /** Whether to show deliverable status tracking */
  showDeliverableStatus?: boolean;
  
  /** Whether to show peer assessment forms */
  showPeerAssessment?: boolean;
  
  /** Whether to show timeline visualization */
  showTimeline?: boolean;
  
  /** Current user ID for personalized views */
  currentUserId?: string;
  
  /** CSS class prefix for styling */
  cssPrefix?: string;
  
  /** Whether to include interactive features */
  interactive?: boolean;
}

/**
 * Main renderer for collaborative project blocks
 */
export class CollaborativeProjectRenderer {
  private options: Required<CollaborativeProjectRenderOptions>;
  
  constructor(options: CollaborativeProjectRenderOptions = {}) {
    this.options = {
      showRoleAssignment: true,
      showDeliverableStatus: true,
      showPeerAssessment: true,
      showTimeline: true,
      currentUserId: '',
      cssPrefix: 'xats-collab',
      interactive: true,
      ...options
    };
  }
  
  /**
   * Render complete collaborative project
   */
  render(project: CollaborativeProjectContent): string {
    const { cssPrefix } = this.options;
    
    return `
      <div class="${cssPrefix}-project" data-project-type="${project.projectType}">
        ${this.renderHeader(project)}
        ${this.renderDescription(project)}
        ${this.options.showRoleAssignment ? this.renderRoles(project) : ''}
        ${this.options.showDeliverableStatus ? this.renderDeliverables(project) : ''}
        ${this.options.showTimeline ? this.renderTimeline(project) : ''}
        ${this.options.showPeerAssessment && project.peerAssessment?.enabled ? this.renderPeerAssessment(project.peerAssessment) : ''}
        ${this.renderInstructions(project)}
        ${this.renderConstraints(project)}
      </div>
    `;
  }
  
  /**
   * Render project header with title and type
   */
  private renderHeader(project: CollaborativeProjectContent): string {
    const { cssPrefix } = this.options;
    const title = this.extractText(project.title);
    
    return `
      <header class="${cssPrefix}-header">
        <h2 class="${cssPrefix}-title">${title}</h2>
        <span class="${cssPrefix}-type" data-type="${project.projectType}">
          ${this.formatProjectType(project.projectType)}
        </span>
      </header>
    `;
  }
  
  /**
   * Render project description
   */
  private renderDescription(project: CollaborativeProjectContent): string {
    const { cssPrefix } = this.options;
    const description = this.extractText(project.description);
    
    return `
      <div class="${cssPrefix}-description">
        <p>${description}</p>
      </div>
    `;
  }
  
  /**
   * Render roles section with assignment capabilities
   */
  private renderRoles(project: CollaborativeProjectContent): string {
    const { cssPrefix, interactive, currentUserId } = this.options;
    
    if (!project.roles || project.roles.length === 0) {
      return '';
    }
    
    const rolesHtml = project.roles.map(role => this.renderRole(role)).join('');
    
    return `
      <section class="${cssPrefix}-roles">
        <h3>Project Roles</h3>
        <div class="${cssPrefix}-roles-grid">
          ${rolesHtml}
        </div>
        ${interactive ? this.renderRoleAssignmentControls() : ''}
      </section>
    `;
  }
  
  /**
   * Render individual role card
   */
  private renderRole(role: ProjectRole): string {
    const { cssPrefix } = this.options;
    const title = role.title;
    const description = this.extractText(role.description);
    const responsibilities = role.responsibilities.map(r => this.extractText(r));
    const skills = role.requiredSkills || [];
    
    return `
      <div class="${cssPrefix}-role" data-role-id="${role.roleId}">
        <div class="${cssPrefix}-role-header">
          <h4 class="${cssPrefix}-role-title">${title}</h4>
          ${role.maxParticipants ? `<span class="${cssPrefix}-role-capacity">Max: ${role.maxParticipants}</span>` : ''}
        </div>
        <div class="${cssPrefix}-role-description">
          <p>${description}</p>
        </div>
        <div class="${cssPrefix}-role-responsibilities">
          <h5>Responsibilities:</h5>
          <ul>
            ${responsibilities.map(resp => `<li>${resp}</li>`).join('')}
          </ul>
        </div>
        ${skills.length > 0 ? `
          <div class="${cssPrefix}-role-skills">
            <h5>Required Skills:</h5>
            <div class="${cssPrefix}-skills-tags">
              ${skills.map(skill => `<span class="${cssPrefix}-skill-tag">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}
        <div class="${cssPrefix}-role-assignment">
          <div class="${cssPrefix}-assigned-members" data-role-id="${role.roleId}">
            <!-- Assigned members will be populated by JavaScript -->
          </div>
        </div>
      </div>
    `;
  }
  
  /**
   * Render deliverables section with status tracking
   */
  private renderDeliverables(project: CollaborativeProjectContent): string {
    const { cssPrefix } = this.options;
    
    if (!project.deliverables || project.deliverables.length === 0) {
      return '';
    }
    
    const deliverablesHtml = project.deliverables.map(deliverable => 
      this.renderDeliverable(deliverable)
    ).join('');
    
    return `
      <section class="${cssPrefix}-deliverables">
        <h3>Project Deliverables</h3>
        <div class="${cssPrefix}-deliverables-list">
          ${deliverablesHtml}
        </div>
      </section>
    `;
  }
  
  /**
   * Render individual deliverable
   */
  private renderDeliverable(deliverable: ProjectDeliverable): string {
    const { cssPrefix } = this.options;
    const title = deliverable.title;
    const description = this.extractText(deliverable.description);
    const dueDate = deliverable.dueDate ? new Date(deliverable.dueDate).toLocaleDateString() : null;
    
    return `
      <div class="${cssPrefix}-deliverable" data-deliverable-id="${deliverable.deliverableId}">
        <div class="${cssPrefix}-deliverable-header">
          <h4 class="${cssPrefix}-deliverable-title">${title}</h4>
          <div class="${cssPrefix}-deliverable-meta">
            <span class="${cssPrefix}-deliverable-format">${deliverable.format}</span>
            <span class="${cssPrefix}-deliverable-type">
              ${deliverable.isGroupDeliverable ? 'Group' : 'Individual'}
            </span>
            ${dueDate ? `<span class="${cssPrefix}-deliverable-due">Due: ${dueDate}</span>` : ''}
          </div>
        </div>
        <div class="${cssPrefix}-deliverable-description">
          <p>${description}</p>
        </div>
        ${this.renderAssessmentCriteria(deliverable)}
        <div class="${cssPrefix}-deliverable-status" data-deliverable-id="${deliverable.deliverableId}">
          <!-- Status will be populated by JavaScript -->
        </div>
      </div>
    `;
  }
  
  /**
   * Render assessment criteria for a deliverable
   */
  private renderAssessmentCriteria(deliverable: ProjectDeliverable): string {
    const { cssPrefix } = this.options;
    
    if (!deliverable.assessmentCriteria || deliverable.assessmentCriteria.length === 0) {
      return '';
    }
    
    const criteriaHtml = deliverable.assessmentCriteria.map(criterion => {
      const description = criterion.description ? this.extractText(criterion.description) : '';
      return `
        <div class="${cssPrefix}-criterion">
          <span class="${cssPrefix}-criterion-name">${criterion.criterion}</span>
          <span class="${cssPrefix}-criterion-weight">${(criterion.weight * 100).toFixed(0)}%</span>
          ${description ? `<p class="${cssPrefix}-criterion-description">${description}</p>` : ''}
        </div>
      `;
    }).join('');
    
    return `
      <div class="${cssPrefix}-assessment-criteria">
        <h5>Assessment Criteria:</h5>
        <div class="${cssPrefix}-criteria-list">
          ${criteriaHtml}
        </div>
      </div>
    `;
  }
  
  /**
   * Render project timeline
   */
  private renderTimeline(project: CollaborativeProjectContent): string {
    const { cssPrefix } = this.options;
    
    if (!project.timeline?.phases || project.timeline.phases.length === 0) {
      return '';
    }
    
    const phasesHtml = project.timeline.phases.map((phase, index) => 
      this.renderPhase(phase, index)
    ).join('');
    
    return `
      <section class="${cssPrefix}-timeline">
        <h3>Project Timeline</h3>
        ${project.timeline.estimatedHours ? `
          <div class="${cssPrefix}-timeline-summary">
            <span class="${cssPrefix}-estimated-hours">
              Estimated effort: ${project.timeline.estimatedHours} hours
            </span>
          </div>
        ` : ''}
        <div class="${cssPrefix}-timeline-phases">
          ${phasesHtml}
        </div>
      </section>
    `;
  }
  
  /**
   * Render individual timeline phase
   */
  private renderPhase(phase: ProjectPhase, index: number): string {
    const { cssPrefix } = this.options;
    const title = phase.title;
    const description = this.extractText(phase.description);
    const activities = phase.activities?.map(a => this.extractText(a)) || [];
    const startDate = phase.startDate ? new Date(phase.startDate).toLocaleDateString() : null;
    const endDate = phase.endDate ? new Date(phase.endDate).toLocaleDateString() : null;
    
    return `
      <div class="${cssPrefix}-phase" data-phase-id="${phase.phaseId}">
        <div class="${cssPrefix}-phase-indicator">
          <span class="${cssPrefix}-phase-number">${index + 1}</span>
        </div>
        <div class="${cssPrefix}-phase-content">
          <div class="${cssPrefix}-phase-header">
            <h4 class="${cssPrefix}-phase-title">${title}</h4>
            ${startDate || endDate ? `
              <div class="${cssPrefix}-phase-dates">
                ${startDate ? `<span class="${cssPrefix}-phase-start">${startDate}</span>` : ''}
                ${endDate ? `<span class="${cssPrefix}-phase-end"> - ${endDate}</span>` : ''}
              </div>
            ` : ''}
          </div>
          <div class="${cssPrefix}-phase-description">
            <p>${description}</p>
          </div>
          ${activities.length > 0 ? `
            <div class="${cssPrefix}-phase-activities">
              <h5>Activities:</h5>
              <ul>
                ${activities.map(activity => `<li>${activity}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${phase.deliverableIds && phase.deliverableIds.length > 0 ? `
            <div class="${cssPrefix}-phase-deliverables">
              <h5>Deliverables due:</h5>
              <ul>
                ${phase.deliverableIds.map(id => `<li data-deliverable-ref="${id}">${id}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  /**
   * Render peer assessment form
   */
  private renderPeerAssessment(peerAssessment: PeerAssessmentConfig): string {
    const { cssPrefix, interactive } = this.options;
    
    if (!peerAssessment.enabled || !interactive) {
      return '';
    }
    
    const criteriaHtml = peerAssessment.criteria?.map(criterion => {
      return `
        <div class="${cssPrefix}-assessment-criterion" data-criterion-id="${criterion.criterionId}">
          <h5 class="${cssPrefix}-criterion-name">${criterion.name}</h5>
          <p class="${cssPrefix}-criterion-description">${this.extractText(criterion.description)}</p>
          ${this.renderAssessmentScale(criterion.scale, criterion.criterionId)}
        </div>
      `;
    }).join('') || '';
    
    return `
      <section class="${cssPrefix}-peer-assessment" style="display: none;" data-assessment-type="${peerAssessment.assessmentType}">
        <h3>Peer Assessment</h3>
        <div class="${cssPrefix}-assessment-info">
          <p>Assess your team members' contributions to the project.</p>
          ${peerAssessment.anonymity ? '<p><em>Your responses will be anonymous.</em></p>' : ''}
        </div>
        <form class="${cssPrefix}-assessment-form">
          <div class="${cssPrefix}-team-member-selector">
            <label for="assessed-member">Assessing:</label>
            <select id="assessed-member" name="assessed-member" class="${cssPrefix}-member-select">
              <!-- Options populated by JavaScript -->
            </select>
          </div>
          <div class="${cssPrefix}-assessment-criteria">
            ${criteriaHtml}
          </div>
          <div class="${cssPrefix}-assessment-actions">
            <button type="submit" class="${cssPrefix}-submit-assessment">Submit Assessment</button>
            <button type="button" class="${cssPrefix}-save-draft">Save Draft</button>
          </div>
        </form>
      </section>
    `;
  }
  
  /**
   * Render assessment scale input
   */
  private renderAssessmentScale(scale: any, criterionId: string): string {
    const { cssPrefix } = this.options;
    const inputName = `criterion-${criterionId}`;
    
    switch (scale.type) {
      case 'numeric':
        return `
          <div class="${cssPrefix}-numeric-scale">
            <input type="range" 
                   name="${inputName}" 
                   min="${scale.range?.min || 1}" 
                   max="${scale.range?.max || 10}" 
                   step="1"
                   class="${cssPrefix}-numeric-input">
            <div class="${cssPrefix}-scale-labels">
              <span>${scale.range?.min || 1}</span>
              <span>${scale.range?.max || 10}</span>
            </div>
          </div>
        `;
      
      case 'likert':
      case 'categorical':
        return `
          <div class="${cssPrefix}-categorical-scale">
            ${scale.labels?.map((label: string, index: number) => `
              <label class="${cssPrefix}-scale-option">
                <input type="radio" name="${inputName}" value="${index + 1}">
                <span>${label}</span>
              </label>
            `).join('') || ''}
          </div>
        `;
      
      case 'binary':
        return `
          <div class="${cssPrefix}-binary-scale">
            <label class="${cssPrefix}-scale-option">
              <input type="radio" name="${inputName}" value="1">
              <span>Yes</span>
            </label>
            <label class="${cssPrefix}-scale-option">
              <input type="radio" name="${inputName}" value="0">
              <span>No</span>
            </label>
          </div>
        `;
      
      default:
        return `<input type="text" name="${inputName}" class="${cssPrefix}-text-input">`;
    }
  }
  
  /**
   * Render role assignment controls
   */
  private renderRoleAssignmentControls(): string {
    const { cssPrefix } = this.options;
    
    return `
      <div class="${cssPrefix}-role-controls">
        <button type="button" class="${cssPrefix}-assign-roles">Assign Roles</button>
        <button type="button" class="${cssPrefix}-auto-assign">Auto-Assign</button>
        <button type="button" class="${cssPrefix}-clear-assignments">Clear All</button>
      </div>
    `;
  }
  
  /**
   * Render project instructions
   */
  private renderInstructions(project: CollaborativeProjectContent): string {
    const { cssPrefix } = this.options;
    
    if (!project.instructions) {
      return '';
    }
    
    const instructions = this.extractText(project.instructions);
    
    return `
      <section class="${cssPrefix}-instructions">
        <h3>Instructions</h3>
        <div class="${cssPrefix}-instructions-content">
          <p>${instructions}</p>
        </div>
      </section>
    `;
  }
  
  /**
   * Render project constraints
   */
  private renderConstraints(project: CollaborativeProjectContent): string {
    const { cssPrefix } = this.options;
    
    if (!project.constraints || project.constraints.length === 0) {
      return '';
    }
    
    const constraintsHtml = project.constraints.map(constraint => {
      const text = this.extractText(constraint);
      return `<li>${text}</li>`;
    }).join('');
    
    return `
      <section class="${cssPrefix}-constraints">
        <h3>Project Constraints</h3>
        <ul class="${cssPrefix}-constraints-list">
          ${constraintsHtml}
        </ul>
      </section>
    `;
  }
  
  /**
   * Helper to extract plain text from SemanticText
   */
  private extractText(semanticText: any): string {
    if (!semanticText?.runs) return '';
    
    return semanticText.runs
      .map((run: any) => {
        if (run.type === 'text' && 'text' in run) {
          return run.text;
        }
        return '';
      })
      .join('');
  }
  
  /**
   * Format project type for display
   */
  private formatProjectType(type: string): string {
    return type
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}