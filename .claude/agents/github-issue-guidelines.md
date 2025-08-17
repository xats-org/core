# GitHub Issue Management Guidelines for All Agents

## MANDATORY Requirements for Every Issue

When creating or updating GitHub issues, ALL agents MUST ensure:

### 1. Milestone Assignment
- **Required**: Every issue MUST have a milestone
- Available milestones:
  - `v0.1.0` - Core functionality and infrastructure
  - `v0.2.0` - Assessment framework and pedagogical enhancements  
  - `v0.3.0` - Extended features and ecosystem development
- Choose based on when the feature is needed

### 2. Project Assignment
- **Project**: xats-core (https://github.com/orgs/xats-org/projects/2)
- Note: Requires project scope in GitHub token

### 3. Labels (Minimum Required)
- **Priority**: `priority:1` (Critical), `priority:2` (High), `priority:3` (Standard)
- **Type**: `type:feature`, `type:bug`, `type:enhancement`, `type:documentation`
- **Component** (optional but recommended): `component:schema`, `component:vocabularies`, `component:testing`, etc.

### 4. Issue Relationships
Document in issue body:
- `Depends on #X` - This issue cannot start until X is complete
- `Blocks #Y` - Issue Y cannot start until this is complete
- `Related to #Z` - Share context or scope with Z
- `Duplicate of #W` - Mark clear duplicates

## Issue Creation Template

```bash
gh issue create \
  --title "Clear, actionable title" \
  --body "## Description
[Detailed description]

## Acceptance Criteria
- [ ] Specific measurable outcome
- [ ] Another criterion

## Dependencies
- Depends on #X
- Blocks #Y

## Priority
[Critical/High/Standard] - [Reasoning]" \
  --label "priority:1" \
  --label "type:feature" \
  --label "component:schema" \
  --milestone "v0.1.0"
```

## Update Existing Issues

```bash
# Add milestone
gh issue edit [NUMBER] --milestone "v0.1.0"

# Add labels
gh issue edit [NUMBER] --add-label "priority:1" --add-label "type:bug"

# Add relationships via comment
gh issue comment [NUMBER] --body "**Dependencies:**
- Depends on #6
- Blocks #10"
```

## Checking Compliance

Before finishing any issue-related task:
1. ✅ Has milestone?
2. ✅ Has priority label?
3. ✅ Has type label?
4. ✅ Dependencies documented?
5. ✅ Clear acceptance criteria?

## Special Cases

### Assessment-Related Issues
- Generally milestone `v0.2.0`
- Link to related assessment issues

### Infrastructure Issues
- Often milestone `v0.1.0` if blocking
- Document impact on other issues

### Documentation Issues
- Milestone matches the feature being documented
- Link to implementation issue

## Remember
- Issues without milestones won't be prioritized
- Issues without relationships may be worked on out of order
- Clear acceptance criteria prevent scope creep

---
*This document applies to ALL agents that interact with GitHub issues*