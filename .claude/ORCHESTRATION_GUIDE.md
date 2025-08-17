# xats Board Orchestration Guide

## Overview

The xats standards board uses a sophisticated orchestration system that combines AI agents, structured commands, and persistent memory to manage schema development. This guide explains how to effectively use this system.

## Command Usage

### Basic Syntax
```bash
claude --command <command-name> [arguments]
```

### With Arguments
Commands accept arguments to focus discussions:
```bash
# Focus board meeting on specific topics
claude --command xats-board:board-meeting --topics "assessment-blocks,pathway-system"

# Triage issues for specific milestone
claude --command xats-board:issue-triage --milestone "v0.1.0"

# Review specific pull request
claude --command xats-board:schema-review --pr "123"
```

## Memory System Architecture

### Folder Structure
```
.claude/memory/
├── meetings/          # All meeting records
├── issues/           # Per-issue context
├── decisions/        # Architecture Decision Records
├── context/          # Shared state between agents
└── agents/           # Agent-specific memory
```

### Token Optimization

The memory system is designed to minimize token usage:

1. **Selective Loading**: Only relevant memory chunks are loaded
2. **Progressive Summarization**: Old content is summarized
3. **Indexed Access**: Use indexes to find without loading
4. **Automatic Archival**: Old data moves to archive/

### Memory Persistence Patterns

#### Cross-Session Continuity
```javascript
// Session 1: Board meeting
const decisions = makeDecisions();
writeMemory('meetings/2024-01-15/decisions.json', decisions);

// Session 2: Implementation (days later)
const previousDecisions = readMemory('meetings/2024-01-15/decisions.json');
implementBasedOn(previousDecisions);
```

#### Cross-Agent Communication
```javascript
// Agent A discovers issue
writeMemory('agents/validator/concerns.json', validationIssues);

// Agent B reads concerns
const validatorConcerns = readMemory('agents/validator/concerns.json');
addressInDesign(validatorConcerns);
```

## Workflow Examples

### 1. Feature Development Workflow

```bash
# Step 1: Ideate new feature
claude --command xats-board:feature-ideation --topics "adaptive-learning"
# Creates: memory/meetings/YYYY-MM-DD-ideation/

# Step 2: Assess impact
claude --command xats-board:impact-assessment --change "adaptive-pathways"
# Creates: memory/assessments/YYYY-MM-DD-change/

# Step 3: Board review
claude --command xats-board:board-meeting --topics "adaptive-pathways-proposal"
# Creates: memory/meetings/YYYY-MM-DD/

# Step 4: Implementation review
claude --command xats-board:schema-review --feature "adaptive-pathways"
# Creates: memory/reviews/YYYY-MM-DD-feature/
```

### 2. Issue Management Workflow

```bash
# Weekly triage
claude --command xats-board:issue-triage --labels "needs-triage"
# Updates: memory/issues/issue-XXX/

# Stakeholder input
claude --command xats-board:stakeholder-feedback --topics "issue-123"
# Updates: memory/context/stakeholder-feedback.json

# Resolution planning
claude --command xats-board:board-meeting --topics "issue-123-resolution"
# Creates: memory/meetings/YYYY-MM-DD/
```

### 3. Release Workflow

```bash
# Plan release
claude --command xats-board:release-planning --version "v0.2.0"
# Creates: memory/releases/v0.2.0/

# Review milestone issues
claude --command xats-board:issue-triage --milestone "v0.2.0"
# Updates: memory/context/current-sprint.json

# Final review
claude --command xats-board:board-meeting --topics "v0.2.0-release"
# Creates: memory/meetings/YYYY-MM-DD/
```

## Memory Queries

### Finding Past Decisions
```javascript
// Find all decisions about assessment
const assessmentDecisions = queryMemory({
  type: 'decisions',
  filter: { topics: ['assessment'] }
});
```

### Loading Recent Context
```javascript
// Get last week's activity
const recentActivity = queryMemory({
  type: 'meetings',
  dateRange: { 
    start: new Date(Date.now() - 7*24*60*60*1000),
    end: new Date()
  }
});
```

### Checking Issue History
```javascript
// Get full context for an issue
const issueContext = readMemory('issues/issue-123/discussion.md');
const issueReviews = readMemory('issues/issue-123/reviews.json');
```

## Best Practices

### 1. Always Provide Context
When invoking commands, the system automatically loads relevant memory. However, specifying topics and arguments helps focus the discussion:
```bash
# Good: Specific and focused
claude --command xats-board:board-meeting --topics "v0.2.0-assessment-blocks"

# Less effective: Too broad
claude --command xats-board:board-meeting
```

### 2. Chain Commands Effectively
Commands can build on each other's outputs:
```bash
# First gather feedback
claude --command xats-board:stakeholder-feedback --groups "instructors"

# Then assess impact based on feedback
claude --command xats-board:impact-assessment --change "instructor-requested-features"

# Finally make decisions
claude --command xats-board:board-meeting --topics "instructor-features"
```

### 3. Use Memory for Continuity
The system maintains context between sessions:
- Previous decisions influence new discussions
- Rejected ideas are remembered to avoid repetition
- Patterns emerge from accumulated feedback

### 4. Regular Maintenance
```bash
# Monthly: Archive old meetings
claude --command xats-board:memory-utils archive --type meetings --age 90

# Quarterly: Generate summary reports
claude --command xats-board:memory-utils summarize --quarter "2024-Q1"

# As needed: Clean up resolved issues
claude --command xats-board:memory-utils clean --type issues --status closed
```

## Monitoring Board Activity

### View Recent Activity
```bash
# Check recent meetings
ls -la .claude/memory/meetings/

# Review recent decisions
cat .claude/memory/decisions/index.json

# Check sprint status
cat .claude/memory/context/current-sprint.json
```

### Generate Reports
```bash
# Weekly activity summary
claude --command xats-board:memory-utils report --period week

# Decision history
claude --command xats-board:memory-utils decisions --since "2024-01-01"

# Stakeholder feedback trends
claude --command xats-board:memory-utils feedback-trends
```

## Troubleshooting

### Memory Not Persisting
- Check folder permissions in `.claude/memory/`
- Ensure commands complete successfully
- Verify JSON files are valid

### Token Limit Issues
- Use `--scope quick` for faster assessments
- Archive old data regularly
- Use summaries instead of full content

### Conflicting Decisions
- Check decision history in memory/decisions/
- Run xats-board:board-meeting to resolve conflicts
- Update ADRs with clarifications

## Advanced Usage

### Custom Queries
```javascript
// Complex query combining multiple criteria
const relevantContext = queryMemory({
  type: ['meetings', 'decisions'],
  filter: {
    topics: ['assessment', 'pathways'],
    participants: ['pedagogy-architect'],
    impact: 'high'
  },
  dateRange: { start: lastMonth, end: today },
  limit: 10
});
```

### Batch Operations
```bash
# Review multiple related issues
for issue in 123 124 125; do
  claude --command xats-board:issue-triage --issue "$issue"
done

# Generate reports for all recent meetings
for dir in .claude/memory/meetings/2024-01-*/; do
  claude --command xats-board:memory-utils summarize --meeting "$dir"
done
```

### Integration with Git Workflow
```bash
# Before creating PR
claude --command xats-board:impact-assessment --change "my-feature"

# After PR creation
claude --command xats-board:schema-review --pr "$(gh pr view --json number -q .number)"

# Before merge
claude --command xats-board:board-meeting --topics "pr-$(gh pr view --json number -q .number)"
```

## Summary

The orchestration system enables:
1. **Persistent Memory**: Decisions and context survive between sessions
2. **Focused Discussions**: Arguments target specific topics
3. **Cross-Agent Coordination**: Agents share context through memory
4. **Token Efficiency**: Smart loading and summarization minimize usage
5. **Traceable Decisions**: All choices are documented and retrievable

Use this system to maintain continuity, make informed decisions, and build a robust schema through structured collaboration.