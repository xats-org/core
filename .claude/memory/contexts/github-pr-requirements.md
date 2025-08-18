# GitHub Pull Request Requirements

## Overview
All pull requests in the xats-org/core repository must follow specific GitHub rules enforced by automated checks.

## PR Title Format
- **MUST use conventional commit format**: `type: description`
- **Valid types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- **Examples**:
  - `feat: add release automation workflow`
  - `fix: resolve CI test failures`
  - `docs: update API documentation`
  - `test: add integration tests for CLI`
  - `chore: update dependencies`

## PR Metadata Requirements

### Milestone (REQUIRED)
- Every PR MUST be assigned to a milestone
- Current milestones:
  - `v0.1.0` - Core functionality (Due: 2025-09-30)
  - `v0.2.0` - Assessment framework (Due: 2025-11-30)
  - `v0.3.0` - Extended features (Due: 2026-01-31)

### Labels (RECOMMENDED)
- Add appropriate labels for type and components:
  - Type: `type:feature`, `type:bug`, `type:documentation`
  - Component: `component:schema`, `component:testing`, `component:infrastructure`
  - Priority: `priority:1` (critical), `priority:2` (high), `priority:3` (standard)

### Linked Issues (REQUIRED)
- Reference related issues in PR body
- Use `Closes #X` or `Fixes #X` to auto-close issues when merged
- Use `Refs #X` to reference without closing

## PR Commands

### Create PR with all requirements
```bash
gh pr create \
  --title "fix: description here" \
  --milestone "v0.1.0" \
  --body "Closes #X"
```

### Fix existing PR missing milestone
```bash
gh pr edit [PR_NUMBER] --milestone "v0.1.0"
```

### Update PR title to conventional format
```bash
gh pr edit [PR_NUMBER] --title "fix: updated title here"
```

## Automated Checks

GitHub Actions will verify:
1. ❌ **PR must be assigned to a milestone** - BLOCKING
2. ℹ️ **PR title should use conventional commit format** - WARNING

## Common Mistakes to Avoid

1. **Missing milestone**: Always assign to appropriate version milestone
2. **Wrong title format**: Use `type: description` not `Type: Description` or `[TYPE] Description`
3. **No linked issues**: Always reference the issues being addressed
4. **Generic titles**: Be specific about what the PR does

## Examples of Good PR Titles

- ✅ `feat: add pathway condition parser for adaptive learning`
- ✅ `fix: resolve schema validation for ContentBlock types`
- ✅ `docs: update API documentation for v0.1.0`
- ✅ `test: add comprehensive validator test suite`
- ✅ `chore: update GitHub Actions to Node.js 20`

## Examples of Bad PR Titles

- ❌ `Update files` - Too generic
- ❌ `Fix bug` - Not descriptive
- ❌ `WIP: Feature` - Don't create WIP PRs, use draft PRs instead
- ❌ `feat(scope): description` - Don't use scope in parentheses
- ❌ `FEAT: Description` - Don't use uppercase type

## Enforcement

- PRs without milestones will be flagged by the automated checker
- The `milestone-reminder` bot will comment on PRs missing milestones
- PRs cannot be merged without addressing these requirements

Last updated: 2025-01-18