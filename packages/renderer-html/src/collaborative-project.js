/* eslint-disable */
/**
 * JavaScript functionality for collaborative project blocks
 *
 * Provides interactive features including role assignment, deliverable tracking,
 * peer assessment forms, and project progress management.
 */

class CollaborativeProjectController {
  constructor(projectElement, options = {}) {
    this.projectElement = projectElement;
    this.options = {
      apiEndpoint: '/api/collaborative-projects',
      userId: null,
      projectId: null,
      enableAutosave: true,
      autosaveInterval: 30000, // 30 seconds
      ...options,
    };

    this.projectData = null;
    this.assignedMembers = new Map(); // roleId -> [userIds]
    this.deliverableStatus = new Map(); // deliverableId -> status
    this.peerAssessments = new Map(); // assesseeId -> assessmentData
    this.autosaveTimer = null;

    this.init();
  }

  /**
   * Initialize the collaborative project controller
   */
  async init() {
    try {
      // Load project data
      await this.loadProjectData();

      // Set up event listeners
      this.setupEventListeners();

      // Initialize components
      this.initializeRoleAssignments();
      this.initializeDeliverableTracking();
      this.initializePeerAssessment();

      // Start autosave if enabled
      if (this.options.enableAutosave) {
        this.startAutosave();
      }

      console.log('Collaborative project initialized successfully');
    } catch (error) {
      console.error('Failed to initialize collaborative project:', error);
      this.showError('Failed to load project. Please refresh the page.');
    }
  }

  /**
   * Load project data from the server
   */
  async loadProjectData() {
    if (!this.options.projectId) return;

    try {
      const response = await fetch(`${this.options.apiEndpoint}/${this.options.projectId}`);
      if (!response.ok) throw new Error('Failed to load project data');

      this.projectData = await response.json();

      // Load existing assignments and status
      if (this.projectData.assignments) {
        this.assignedMembers = new Map(Object.entries(this.projectData.assignments));
      }

      if (this.projectData.deliverableStatus) {
        this.deliverableStatus = new Map(Object.entries(this.projectData.deliverableStatus));
      }
    } catch (error) {
      console.error('Error loading project data:', error);
    }
  }

  /**
   * Set up event listeners for interactive elements
   */
  setupEventListeners() {
    // Role assignment controls
    const assignRolesBtn = this.projectElement.querySelector('.xats-collab-assign-roles');
    const autoAssignBtn = this.projectElement.querySelector('.xats-collab-auto-assign');
    const clearAssignmentsBtn = this.projectElement.querySelector('.xats-collab-clear-assignments');

    if (assignRolesBtn) {
      assignRolesBtn.addEventListener('click', () => this.showRoleAssignmentModal());
    }

    if (autoAssignBtn) {
      autoAssignBtn.addEventListener('click', () => this.autoAssignRoles());
    }

    if (clearAssignmentsBtn) {
      clearAssignmentsBtn.addEventListener('click', () => this.clearAllAssignments());
    }

    // Role assignment areas (drag & drop)
    const assignmentAreas = this.projectElement.querySelectorAll('.xats-collab-assigned-members');
    assignmentAreas.forEach((area) => {
      area.addEventListener('click', (e) => this.handleRoleClick(e));
      area.addEventListener('dragover', (e) => this.handleDragOver(e));
      area.addEventListener('drop', (e) => this.handleDrop(e));
    });

    // Deliverable status updates
    const deliverableElements = this.projectElement.querySelectorAll('.xats-collab-deliverable');
    deliverableElements.forEach((element) => {
      const statusArea = element.querySelector('.xats-collab-deliverable-status');
      if (statusArea) {
        statusArea.addEventListener('click', (e) => this.handleDeliverableStatusClick(e));
      }
    });

    // Peer assessment form
    const assessmentForm = this.projectElement.querySelector('.xats-collab-assessment-form');
    if (assessmentForm) {
      assessmentForm.addEventListener('submit', (e) => this.handleAssessmentSubmit(e));

      const saveButton = assessmentForm.querySelector('.xats-collab-save-draft');
      if (saveButton) {
        saveButton.addEventListener('click', (e) => this.handleAssessmentSave(e));
      }

      const memberSelect = assessmentForm.querySelector('.xats-collab-member-select');
      if (memberSelect) {
        memberSelect.addEventListener('change', (e) => this.handleAssessmentMemberChange(e));
      }
    }
  }

  /**
   * Initialize role assignments display
   */
  initializeRoleAssignments() {
    this.assignedMembers.forEach((memberIds, roleId) => {
      this.updateRoleAssignmentDisplay(roleId, memberIds);
    });
  }

  /**
   * Initialize deliverable tracking
   */
  initializeDeliverableTracking() {
    this.deliverableStatus.forEach((status, deliverableId) => {
      this.updateDeliverableStatusDisplay(deliverableId, status);
    });

    // Add default status indicators for all deliverables
    const deliverables = this.projectElement.querySelectorAll('.xats-collab-deliverable');
    deliverables.forEach((element) => {
      const deliverableId = element.dataset.deliverableId;
      if (!this.deliverableStatus.has(deliverableId)) {
        this.updateDeliverableStatusDisplay(deliverableId, 'not-started');
      }
    });
  }

  /**
   * Initialize peer assessment form
   */
  initializePeerAssessment() {
    const memberSelect = this.projectElement.querySelector('.xats-collab-member-select');
    if (!memberSelect) return;

    // Populate member select with assigned team members
    this.populateMemberSelect();

    // Load saved assessments
    this.loadSavedAssessments();
  }

  /**
   * Show role assignment modal
   */
  async showRoleAssignmentModal() {
    try {
      // Create modal for role assignment
      const modal = this.createRoleAssignmentModal();
      document.body.appendChild(modal);

      // Load available users
      await this.loadAvailableUsers(modal);

      // Show modal
      modal.style.display = 'flex';
    } catch (error) {
      console.error('Error showing role assignment modal:', error);
      this.showError('Failed to load role assignment interface.');
    }
  }

  /**
   * Create role assignment modal
   */
  createRoleAssignmentModal() {
    const modal = document.createElement('div');
    modal.className = 'xats-collab-modal';
    modal.innerHTML = `
      <div class="xats-collab-modal-content">
        <div class="xats-collab-modal-header">
          <h3>Assign Project Roles</h3>
          <button class="xats-collab-modal-close">&times;</button>
        </div>
        <div class="xats-collab-modal-body">
          <div class="xats-collab-assignment-interface">
            <div class="xats-collab-available-users">
              <h4>Available Team Members</h4>
              <div class="xats-collab-user-list" id="available-users-list">
                <div class="loading">Loading users...</div>
              </div>
            </div>
            <div class="xats-collab-role-assignments">
              <h4>Role Assignments</h4>
              <div class="xats-collab-roles-list" id="roles-assignment-list">
                <!-- Roles will be populated here -->
              </div>
            </div>
          </div>
        </div>
        <div class="xats-collab-modal-footer">
          <button class="xats-collab-btn-secondary xats-collab-modal-cancel">Cancel</button>
          <button class="xats-collab-btn-primary xats-collab-modal-save">Save Assignments</button>
        </div>
      </div>
    `;

    // Add event listeners
    const closeBtn = modal.querySelector('.xats-collab-modal-close');
    const cancelBtn = modal.querySelector('.xats-collab-modal-cancel');
    const saveBtn = modal.querySelector('.xats-collab-modal-save');

    closeBtn.addEventListener('click', () => this.closeModal(modal));
    cancelBtn.addEventListener('click', () => this.closeModal(modal));
    saveBtn.addEventListener('click', () => this.saveRoleAssignments(modal));

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });

    return modal;
  }

  /**
   * Load available users for assignment
   */
  async loadAvailableUsers(modal) {
    try {
      const response = await fetch(`${this.options.apiEndpoint}/users`);
      if (!response.ok) throw new Error('Failed to load users');

      const users = await response.json();

      const usersList = modal.querySelector('#available-users-list');
      usersList.innerHTML = users
        .map(
          (user) => `
        <div class="xats-collab-user-card" data-user-id="${user.id}" draggable="true">
          <div class="xats-collab-user-avatar">
            <img src="${user.avatar || '/default-avatar.png'}" alt="${user.name}">
          </div>
          <div class="xats-collab-user-info">
            <div class="xats-collab-user-name">${user.name}</div>
            <div class="xats-collab-user-skills">${(user.skills || []).join(', ')}</div>
          </div>
        </div>
      `
        )
        .join('');

      // Add drag and drop functionality
      this.setupUserDragAndDrop(modal);

      // Populate roles list
      this.populateRolesList(modal);
    } catch (error) {
      console.error('Error loading users:', error);
      const usersList = modal.querySelector('#available-users-list');
      usersList.innerHTML = '<div class="error">Failed to load users</div>';
    }
  }

  /**
   * Auto-assign roles based on skills and preferences
   */
  async autoAssignRoles() {
    if (!confirm('This will automatically assign roles based on member skills. Continue?')) {
      return;
    }

    try {
      const response = await fetch(
        `${this.options.apiEndpoint}/${this.options.projectId}/auto-assign`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) throw new Error('Auto-assignment failed');

      const assignments = await response.json();

      // Update local assignments
      this.assignedMembers = new Map(Object.entries(assignments));

      // Update display
      this.assignedMembers.forEach((memberIds, roleId) => {
        this.updateRoleAssignmentDisplay(roleId, memberIds);
      });

      this.showSuccess('Roles have been automatically assigned based on member skills.');
    } catch (error) {
      console.error('Error in auto-assignment:', error);
      this.showError('Failed to auto-assign roles. Please assign manually.');
    }
  }

  /**
   * Clear all role assignments
   */
  clearAllAssignments() {
    if (!confirm('This will clear all role assignments. Continue?')) {
      return;
    }

    this.assignedMembers.clear();

    // Update display
    const assignmentAreas = this.projectElement.querySelectorAll('.xats-collab-assigned-members');
    assignmentAreas.forEach((area) => {
      area.innerHTML = '';
    });

    this.saveData();
    this.showSuccess('All role assignments have been cleared.');
  }

  /**
   * Update role assignment display
   */
  updateRoleAssignmentDisplay(roleId, memberIds) {
    const assignmentArea = this.projectElement.querySelector(
      `[data-role-id="${roleId}"] .xats-collab-assigned-members`
    );
    if (!assignmentArea) return;

    assignmentArea.innerHTML = memberIds
      .map((userId) => {
        const member = this.getMemberById(userId);
        return `
        <div class="xats-collab-assigned-member" data-user-id="${userId}">
          <img src="${member.avatar || '/default-avatar.png'}" alt="${member.name}" class="member-avatar">
          <span>${member.name}</span>
          <button class="remove-member" onclick="collaborativeProject.removeMemberFromRole('${roleId}', '${userId}')">&times;</button>
        </div>
      `;
      })
      .join('');
  }

  /**
   * Update deliverable status display
   */
  updateDeliverableStatusDisplay(deliverableId, status) {
    const statusArea = this.projectElement.querySelector(
      `[data-deliverable-id="${deliverableId}"] .xats-collab-deliverable-status`
    );
    if (!statusArea) return;

    const statusConfig = {
      'not-started': { label: 'Not Started', class: 'status-not-started', color: '#6b7280' },
      'in-progress': { label: 'In Progress', class: 'status-in-progress', color: '#f59e0b' },
      completed: { label: 'Completed', class: 'status-completed', color: '#10b981' },
      overdue: { label: 'Overdue', class: 'status-overdue', color: '#ef4444' },
    };

    const config = statusConfig[status] || statusConfig['not-started'];

    statusArea.innerHTML = `
      <div class="xats-collab-status-indicator ${config.class}" data-status="${status}">
        <span class="status-dot" style="background-color: ${config.color}"></span>
        <span class="status-label">${config.label}</span>
        <button class="status-change" onclick="collaborativeProject.changeDeliverableStatus('${deliverableId}')">
          Change Status
        </button>
      </div>
    `;
  }

  /**
   * Handle deliverable status change
   */
  changeDeliverableStatus(deliverableId) {
    const currentStatus = this.deliverableStatus.get(deliverableId) || 'not-started';
    const statusOptions = ['not-started', 'in-progress', 'completed'];

    const select = document.createElement('select');
    statusOptions.forEach((status) => {
      const option = document.createElement('option');
      option.value = status;
      option.textContent = status.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      option.selected = status === currentStatus;
      select.appendChild(option);
    });

    const modal = this.createSimpleModal('Change Deliverable Status', select);
    document.body.appendChild(modal);

    const saveBtn = modal.querySelector('.modal-save');
    saveBtn.addEventListener('click', () => {
      const newStatus = select.value;
      this.deliverableStatus.set(deliverableId, newStatus);
      this.updateDeliverableStatusDisplay(deliverableId, newStatus);
      this.saveData();
      this.closeModal(modal);
    });

    modal.style.display = 'flex';
  }

  /**
   * Handle peer assessment form submission
   */
  async handleAssessmentSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const assesseeId = form.querySelector('.xats-collab-member-select').value;

    if (!assesseeId) {
      this.showError('Please select a team member to assess.');
      return;
    }

    try {
      const assessmentData = this.collectAssessmentData(form);

      // Submit to server
      const response = await fetch(
        `${this.options.apiEndpoint}/${this.options.projectId}/assessments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assesseeId,
            assessorId: this.options.userId,
            assessmentData,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to submit assessment');

      // Store locally
      this.peerAssessments.set(assesseeId, assessmentData);

      // Clear form
      form.reset();

      this.showSuccess('Peer assessment submitted successfully.');
    } catch (error) {
      console.error('Error submitting assessment:', error);
      this.showError('Failed to submit assessment. Please try again.');
    }
  }

  /**
   * Collect assessment data from form
   */
  collectAssessmentData(form) {
    const data = {};

    const criterionElements = form.querySelectorAll('.xats-collab-assessment-criterion');
    criterionElements.forEach((element) => {
      const criterionId = element.dataset.criterionId;
      const input = element.querySelector(
        'input[type="range"], input[type="radio"]:checked, input[type="text"]'
      );

      if (input) {
        data[criterionId] = {
          value: input.value,
          type: input.type,
        };
      }
    });

    return data;
  }

  /**
   * Start autosave functionality
   */
  startAutosave() {
    this.autosaveTimer = setInterval(() => {
      this.saveData();
    }, this.options.autosaveInterval);
  }

  /**
   * Save project data to server
   */
  async saveData() {
    if (!this.options.projectId) return;

    try {
      const data = {
        assignments: Object.fromEntries(this.assignedMembers),
        deliverableStatus: Object.fromEntries(this.deliverableStatus),
        peerAssessments: Object.fromEntries(this.peerAssessments),
        lastUpdated: new Date().toISOString(),
      };

      const response = await fetch(`${this.options.apiEndpoint}/${this.options.projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save data');
    } catch (error) {
      console.error('Error saving project data:', error);
    }
  }

  /**
   * Utility methods
   */
  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `xats-collab-notification xats-collab-notification-${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 100);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  closeModal(modal) {
    modal.style.display = 'none';
    document.body.removeChild(modal);
  }

  getMemberById(userId) {
    // This would typically fetch from a members cache or API
    return {
      id: userId,
      name: `Member ${userId}`,
      avatar: '/default-avatar.png',
    };
  }
}

// Global instance for easy access
let collaborativeProject = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const projectElement = document.querySelector('.xats-collab-project');
  if (projectElement) {
    collaborativeProject = new CollaborativeProjectController(projectElement, {
      projectId: projectElement.dataset.projectId,
      userId: projectElement.dataset.userId,
    });
  }
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CollaborativeProjectController;
}

