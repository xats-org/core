# Branch Protection Configuration

This document defines the branch protection rules and status check requirements for the xats project.

## Overview

Branch protection ensures code quality and prevents accidental changes to important branches. All protected branches require status checks to pass before merging.

## Required Status Checks

### Status Check Names (MUST match exactly)

The following status check names are used by our CI workflow and MUST be configured in branch protection rules:

#### Core Checks (for all protected branches)
- `Lint` - Code linting and style checks
- `Test on Node.js 20` - Primary test suite on Node.js 20

#### Extended Checks (for main branch)
- `Test on Node.js 18` - Test suite on Node.js 18
- `Test on Node.js 22` - Test suite on Node.js 22  
- `Security Audit` - npm security vulnerability scan
- `Validate JSON Schema` - Schema syntax validation
- `Validate Example Documents` - Example document validation
- `Build and Package` - Build and packaging verification
- `Integration Tests` - End-to-end integration tests

## Branch Protection Rules

### Main Branch (`main`)
- **Protected**: Yes
- **Required status checks**: All extended checks (9 total)
- **Require PR reviews**: Yes (1 approval)
- **Dismiss stale reviews**: Yes
- **Restrict who can push**: No
- **Allow force pushes**: No
- **Allow deletions**: No

### Version Branches (`v*.*.*`)
- **Protected**: Yes
- **Required status checks**: Core checks only (2 total)
- **Require PR reviews**: Yes (1 approval)
- **Dismiss stale reviews**: Yes
- **Restrict who can push**: No
- **Allow force pushes**: No
- **Allow deletions**: No

### Feature Branches
- **Protected**: No
- **Required status checks**: None (but CI still runs)

## Automated Setup

Use the provided script to automatically configure branch protection:

```bash
# Set up protection for a new version branch
.github/scripts/setup-branch-protection.sh v0.4.0

# Set up protection for main branch
.github/scripts/setup-branch-protection.sh main
```

## CI Workflow Job Names

The job names in `.github/workflows/ci.yml` that create these status checks:

```yaml
jobs:
  lint:
    name: Lint                          # Creates "Lint" status check
    
  test:
    name: Test on Node.js ${{ matrix.node-version }}  
    # Creates "Test on Node.js 18", "Test on Node.js 20", "Test on Node.js 22"
    
  validate-examples:
    name: Validate Example Documents    # Creates "Validate Example Documents"
    
  schema-validation:
    name: Validate JSON Schema          # Creates "Validate JSON Schema"
    
  security:
    name: Security Audit                # Creates "Security Audit"
    
  build:
    name: Build and Package             # Creates "Build and Package"
    
  integration:
    name: Integration Tests             # Creates "Integration Tests"
```

## Common Issues

### "Expected — Waiting for status to be reported"

This occurs when:
1. **Wrong status check names**: The branch protection expects different names than what CI provides
2. **CI not running**: Check if workflows are enabled and triggered correctly
3. **Branch mismatch**: Ensure the PR targets the correct base branch

**Solution**: Run the setup script to fix protection rules:
```bash
.github/scripts/setup-branch-protection.sh <branch-name>
```

### Checks Not Running on PRs

Ensure:
1. The `.github/workflows/ci.yml` file exists in the feature branch
2. The workflow has proper triggers for pull_request events
3. GitHub Actions are enabled for the repository

## Manual Configuration

If you need to manually configure via GitHub UI:

1. Go to Settings → Branches
2. Add/Edit protection rule for the branch
3. Enable "Require status checks to pass before merging"
4. Search and add the EXACT status check names listed above
5. Enable "Require branches to be up to date before merging" (optional)
6. Enable "Require pull request reviews before merging"
7. Set required approvals to 1
8. Enable "Dismiss stale pull request approvals when new commits are pushed"
9. Disable "Allow force pushes" and "Allow deletions"

## Verification

To verify branch protection is correctly configured:

```bash
# Check protection status
gh api repos/xats-org/core/branches/<branch-name>/protection

# Check required status checks
gh api repos/xats-org/core/branches/<branch-name>/protection/required_status_checks

# List status checks for a PR
gh pr checks <pr-number>
```

## Maintaining Consistency

**IMPORTANT**: When modifying CI workflow job names:
1. Update this documentation
2. Update the setup script
3. Re-run protection setup for all protected branches
4. Verify PRs show correct status checks

---

*Last updated: 2025-08-19*
*Script location: `.github/scripts/setup-branch-protection.sh`*