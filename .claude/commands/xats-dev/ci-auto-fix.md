# CI Auto-Fix Command

Automatically fixes all CI failures for a given PR using intelligent analysis and iterative fixes.

## Usage

```bash
claude --command xats-dev:ci-auto-fix --pr <PR_NUMBER>
```

## Description

This command performs a comprehensive CI fix workflow:

1. **Checkout PR Branch** - Fetches and checks out the PR branch
2. **Analyzes CI Failures** - Uses `gh pr checks <PR> --watch` to wait for CI completion
3. **Diagnoses Root Causes** - Parses error messages to understand the issues
4. **Applies Fixes** - Makes code changes to resolve identified problems
5. **Tests Locally** - Runs build, lint, and test commands to verify fixes
6. **Commits and Pushes** - Creates clear commits describing the fixes
7. **Waits for CI Results** - Uses `gh pr checks <PR> --watch` to monitor new CI run
8. **Iterates** - Repeats steps 2-7 until all CI checks pass (max 10 attempts)

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

## IMPORTANT EXECUTION INSTRUCTIONS

When executing this command, you MUST:

1. **ALWAYS use `gh pr checks <PR> --watch`** to wait for CI to complete before analyzing results
2. **NEVER declare success** without verifying all CI checks have passed
3. **ITERATE until all checks pass** or max retries reached:
   - After pushing fixes, use `gh pr checks <PR> --watch` again
   - Analyze any remaining failures
   - Apply additional fixes if needed
   - Repeat until all checks are green
4. **Track iteration count** and stop after max retries (default: 10)
5. **Report final status** with:
   - Number of iterations performed
   - Final CI status (all passing or list of remaining failures)
   - Summary of all fixes applied

## Workflow Loop

```
for iteration in 1..max_retries:
  1. Run: gh pr checks <PR> --watch
  2. If all checks pass: SUCCESS - exit loop
  3. If checks fail: analyze failures
  4. Apply fixes based on error types
  5. Test locally (pnpm lint, pnpm test, pnpm build)
  6. Commit and push fixes
  7. Continue to next iteration
```

If max_retries reached without success, report remaining failures.