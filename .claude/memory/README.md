# xats Board Memory System

This directory contains persistent memory for the xats standards board, enabling continuity between command runs and agent interactions.

## Directory Structure

```
.claude/memory/
├── meetings/           # Meeting minutes and outcomes
│   ├── YYYY-MM-DD/    # Date-based organization
│   │   ├── agenda.md
│   │   ├── minutes.md
│   │   ├── decisions.json
│   │   └── action-items.json
├── issues/            # Issue-specific context
│   ├── issue-XXX/    # Per-issue memory
│   │   ├── discussion.md
│   │   ├── reviews.json
│   │   └── status.json
├── decisions/         # Architecture Decision Records
│   ├── ADR-XXXX.md   # Formal decision records
│   └── index.json    # Decision index
├── context/          # Shared context between agents
│   ├── current-sprint.json
│   ├── roadmap-status.json
│   └── stakeholder-feedback.json
└── agents/           # Agent-specific memory
    ├── [agent-name]/
    │   ├── state.json
    │   └── notes.md

```

## Memory Management Strategy

### 1. Meeting Memory
- Each meeting creates a dated folder
- Agenda and minutes are markdown for readability
- Decisions and action items are JSON for programmatic access
- Older meetings archived after 90 days to `archive/` subfolder

### 2. Issue Memory
- Each GitHub issue gets its own folder
- Tracks discussion history, reviews, and current status
- Cleaned up 30 days after issue closure

### 3. Decision Records
- Formal ADRs for significant architectural decisions
- Indexed for quick reference
- Never deleted (permanent record)

### 4. Shared Context
- Current sprint status and priorities
- Roadmap progress tracking
- Accumulated stakeholder feedback
- Updated incrementally, not replaced

### 5. Agent Memory
- Each agent maintains its own state
- Useful for tracking what each agent has reviewed
- Prevents duplicate work and maintains consistency

## Token Optimization

To minimize token usage:

1. **Selective Loading**: Commands only load relevant memory chunks
2. **Summarization**: Older items summarized rather than retained verbatim
3. **Indexing**: JSON indexes point to full content without loading it
4. **Archival**: Old data moved to archive, loaded only when needed
5. **Compression**: Long discussions compressed to key points

## Usage Patterns

### Writing Memory
```javascript
// After a meeting
writeMemory('meetings/2024-01-15/minutes.md', minutesContent);
writeMemory('meetings/2024-01-15/decisions.json', decisionsData);
```

### Reading Memory
```javascript
// Load recent context
const sprintStatus = readMemory('context/current-sprint.json');
const recentMeetings = listRecentMeetings(7); // Last 7 days
```

### Querying Memory
```javascript
// Find relevant past decisions
const relevantDecisions = searchDecisions('assessment');
const issueHistory = getIssueContext('issue-123');
```

## Maintenance

### Automatic Cleanup
- Meeting folders > 90 days old → archived
- Closed issue folders > 30 days old → archived
- Agent state > 180 days old → reset

### Manual Maintenance
```bash
# Archive old meetings
claude --command archive-memory meetings

# Compress discussions
claude --command compress-memory issues

# Generate summary reports
claude --command memory-report
```

## Best Practices

1. **Always write memory** after significant events
2. **Query before deciding** to check for precedents
3. **Summarize verbose content** before storing
4. **Index for search** rather than sequential scanning
5. **Version important decisions** for traceability