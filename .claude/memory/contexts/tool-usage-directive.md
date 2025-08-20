# Tool Usage Directive

## Critical Instruction
**ALWAYS use relevant tools (agents, commands, MCPs) to get current, accurate information.**

## Why This Matters
- Avoid outdated information
- Get real-time, accurate data
- Leverage specialized tools for specific tasks
- Ensure recommendations are based on current state

## Required Tool Usage

### For Package/Library Information
- **ALWAYS use**: `mcp__context7__resolve-library-id` and `mcp__context7__get-library-docs`
- **NEVER**: Rely on training data for version numbers or features

### For Web Information
- **ALWAYS use**: `WebSearch`, `WebFetch`, or MCP tools like `mcp__brave-search__brave_web_search`
- **NEVER**: Guess URLs or rely on potentially outdated web information

### For File System Operations
- **ALWAYS use**: File system MCP tools or standard file operations
- **NEVER**: Assume file contents without reading

### For Git/GitHub Operations
- **ALWAYS use**: `gh` CLI commands or GitHub MCP tools
- **NEVER**: Assume repository state without checking

### For Testing and Validation
- **ALWAYS use**: Actual test runners and validators
- **NEVER**: Assume test results without running them

## Examples of Correct Usage

### ✅ CORRECT: Getting package information
```
1. Use mcp__context7__resolve-library-id to find the package
2. Use mcp__context7__get-library-docs to get current documentation
3. Base recommendations on actual current versions
```

### ❌ INCORRECT: Using training data
```
"Based on my knowledge, vitest version X has feature Y..."
```

## Standing Orders
1. **Check first, recommend second** - Always verify current state before making recommendations
2. **Use specialized agents** - Deploy xats board agents, security auditors, etc. when relevant
3. **Verify with multiple sources** - Cross-reference information when critical
4. **Document tool usage** - Be transparent about which tools were used for decisions

## Context for Current Task
When dealing with dependency updates and security vulnerabilities:
- Use Context7 MCP to get latest package versions and migration guides
- Use npm/package managers to check actual installed versions
- Use security scanning tools to verify vulnerability status
- Use test runners to confirm nothing breaks after updates

---
*This directive was created on 2025-08-20 to ensure all Claude Code sessions use current, accurate information through appropriate tooling rather than relying on potentially outdated training data.*