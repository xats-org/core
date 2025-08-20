# CI Auto-Fix Agent Command

This command invokes specialized agents to automatically fix CI failures for a PR.

## Command Format
```
xats-dev:ci-auto-fix
```

## Implementation

When invoked, this command will:

1. **Request PR Number** from the user if not provided
2. **Launch the test-engineer agent** to analyze and fix CI failures
3. **Use the debugger agent** for complex error analysis
4. **Employ the code-auditor agent** for code quality checks
5. **Iterate until all CI checks pass**

## Agent Workflow

The command orchestrates multiple agents:

### Phase 1: Analysis
- **error-detective** agent analyzes CI logs
- Identifies root causes of failures
- Creates fix strategy

### Phase 2: Implementation  
- **test-engineer** agent fixes test failures
- **debugger** agent resolves runtime errors
- **code-auditor** ensures code quality

### Phase 3: Verification
- Local testing with build/lint/test
- Commits and pushes fixes
- Monitors new CI run

### Phase 4: Iteration
- If CI still fails, repeats process
- Maximum 10 iterations
- Progressively fixes remaining issues

## Usage Example

```bash
# Run the command
claude --command xats-dev:ci-auto-fix

# When prompted, enter PR number
> Enter PR number: 135

# Command will then:
# 1. Checkout PR branch
# 2. Analyze CI failures
# 3. Apply fixes
# 4. Push changes
# 5. Monitor CI
# 6. Repeat until success
```

## Success Criteria

The command succeeds when:
- All CI jobs pass
- No lint errors remain
- All tests pass
- Build completes successfully
- Type checking passes

## Error Handling

If the command cannot fix issues after 10 attempts:
- Provides detailed failure analysis
- Suggests manual interventions
- Saves debug logs for review