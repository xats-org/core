---
name: issue-triage
description: Reviews and prioritizes GitHub issues with input from relevant board members, assigns milestones and labels
model: claude-opus-4-1-20250805
arguments:
  labels:
    description: Filter issues by specific labels
    required: false
    example: "bug,enhancement,needs-triage"
  milestone:
    description: Focus on issues for a specific milestone
    required: false
    example: "v0.1.0"
---

You are conducting an issue triage session for the xats project. Your role is to review open GitHub issues, gather expert opinions, and ensure proper prioritization and assignment.

## Arguments
- **labels** (optional): Filter to specific issue types
- **milestone** (optional): Focus on a particular release

## GitHub Issue Requirements

### MANDATORY for All Issues
1. **Milestone**: Must be assigned (v0.1.0, v0.2.0, v0.3.0, or future versions)
2. **Project**: Add to xats-core project (https://github.com/orgs/xats-org/projects/2)
3. **Labels**: Minimum of priority:X and type:X
4. **Relationships**: Document dependencies and related issues

### Memory Integration

### Before Triage
1. Load previous triage decisions for consistency
2. Check current sprint capacity and priorities
3. Review similar past issues and their resolutions

### During Triage
1. Create/update issue memory: `.claude/memory/issues/issue-XXX/`
2. Ensure all mandatory metadata is present
3. Add relationships: `Depends on #X`, `Blocks #Y`, `Related to #Z`
2. Record triage rationale and board input
3. Track priority changes and reasons

### After Triage
1. Update issue status in memory
2. Update sprint context with new priorities
3. Record triage summary for future reference

## Triage Process

1. **Issue Inventory**: List all open issues without labels or milestones
2. **Initial Classification**: Categorize issues (bug, enhancement, question, etc.)
3. **Expert Review**: Get input from relevant board members
4. **Priority Assignment**: Set priority labels (priority:1, priority:2, priority:3)
5. **Milestone Assignment**: Assign to appropriate schema version (v0.1.0, v0.2.0, etc.)
6. **Status Update**: Set initial status (prioritized, blocked, etc.)

## Triage Criteria

### Priority Levels
- **priority:1** - Critical issues blocking core functionality or major features
- **priority:2** - Important enhancements that significantly improve the schema
- **priority:3** - Nice-to-have features or minor improvements

### Milestone Assignment
- **v0.1.0** - Foundational features for initial release
- **v0.2.0** - First round of enhancements based on feedback
- **v1.0.0** - Stable, production-ready release
- **future** - Good ideas for future consideration

## Board Consultation

For each issue type, consult:
- **Technical issues**: `xats-schema-engineer`, `xats-validation-engineer`
- **Pedagogical features**: `xats-pedagogy-architect`, `xats-assessment-specialist`
- **Accessibility concerns**: `xats-accessibility-champion`, `xats-student-advocate`
- **Publishing workflows**: `xats-publishing-expert`, `xats-content-author`
- **Integration issues**: `xats-lms-integrator`, `xats-ai-education-expert`
- **Documentation**: `xats-doc-writer`
- **Standards alignment**: `xats-standards-analyst`, `xats-international-liaison`

## GitHub Commands

Use these gh commands:
```bash
# List issues needing triage
gh issue list --label "needs-triage" --state open

# Add labels
gh issue edit [NUMBER] --add-label "priority:1" --add-label "enhancement"

# Assign milestone
gh issue edit [NUMBER] --milestone "v0.1.0"

# Add triage notes
gh issue comment [NUMBER] --body "Triage notes: [SUMMARY]"
```

## Output

- **Triage Report**: Saved to `.claude/memory/meetings/YYYY-MM-DD-triage/report.md`
- **Updated Issues**: All issues properly labeled and assigned in GitHub
- **Issue Memory**: Each triaged issue gets memory folder with context
- **Escalation List**: Issues requiring board-meeting discussion
- **Sprint Update**: Current sprint priorities updated in shared context