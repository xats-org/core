# CI Auto-Fix Command

Automatically fixes all CI failures for a given PR using intelligent analysis and iterative fixes.

## Usage

```bash
claude --command xats-dev:ci-auto-fix --pr <PR_NUMBER>
```

## Description

This command performs a comprehensive CI fix workflow:

1. **Analyzes CI Failures** - Uses `gh` CLI to identify failing jobs and fetch error logs
2. **Diagnoses Root Causes** - Parses error messages to understand the issues
3. **Applies Fixes** - Makes code changes to resolve identified problems
4. **Tests Locally** - Runs build, lint, and test commands to verify fixes
5. **Commits and Pushes** - Creates clear commits describing the fixes
6. **Monitors CI** - Waits for new CI run and checks if issues are resolved
7. **Iterates** - Repeats the process until all CI checks pass (max 10 attempts)

## Features

- **Intelligent Error Analysis** - Understands TypeScript, ESLint, test failures, and build errors
- **Automated Fix Application** - Applies appropriate fixes based on error types
- **Local Verification** - Tests changes locally before pushing
- **Progress Tracking** - Provides real-time updates on fix progress
- **Retry Logic** - Automatically retries if initial fixes don't resolve all issues
- **Comprehensive Logging** - Maintains detailed logs of all actions taken

## Parameters

- `--pr <number>` - The PR number to fix (required)
- `--max-retries <number>` - Maximum fix attempts (default: 10)
- `--wait-time <seconds>` - Time to wait for CI to complete (default: 600)

## Examples

```bash
# Fix CI for PR #135
claude --command xats-dev:ci-auto-fix --pr 135

# Fix with custom retry limit
claude --command xats-dev:ci-auto-fix --pr 135 --max-retries 5

# Fix with extended wait time
claude --command xats-dev:ci-auto-fix --pr 135 --wait-time 900
```

## Error Types Handled

- TypeScript compilation errors
- ESLint violations
- Prettier formatting issues
- Module resolution failures
- Test failures
- Build configuration issues
- Missing dependencies
- Import order problems
- Type mismatches

## Implementation

The command uses:
- **debugger** agent for error analysis
- **test-engineer** agent for test fixes
- **code-auditor** agent for code quality
- GitHub CLI for CI interaction
- Local test runners for verification