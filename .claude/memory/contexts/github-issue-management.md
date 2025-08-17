# GitHub Issue Management Context

## Established Requirements (2025-08-17)

### Mandatory Metadata
Every GitHub issue in the xats-org/core repository MUST have:

1. **Milestone**: Target schema version
   - v0.1.0 - Core functionality (Due: 2025-09-30)
   - v0.2.0 - Assessment framework (Due: 2025-11-30)
   - v0.3.0 - Extended features (Due: 2026-01-31)

2. **Project**: xats-core
   - URL: https://github.com/orgs/xats-org/projects/2
   - Note: Requires project scope in GH token

3. **Labels**: Minimum requirements
   - Priority: priority:1, priority:2, or priority:3
   - Type: type:feature, type:bug, type:enhancement, type:documentation
   - Component: component:schema, component:vocabularies, etc.

4. **Relationships**: Document dependencies
   - Use "Depends on #X" in body
   - Use "Blocks #Y" for blocking relationships
   - Use "Related to #Z" for context

### Current Issue Status

#### v0.1.0 Milestone (9 issues)
- Critical: #6 (vocabularies), #7 (validator), #8 (examples)
- High: #9 (ContentBlock), #10 (tutorial), #11 (infrastructure), #12 (pathways)
- Standard: #14 (tests), #16 (CI/CD)

#### v0.2.0 Milestone (4 issues)
- All assessment-related: #1, #2, #3, #13

#### v0.3.0 Milestone (5 issues)
- Extended features: #4, #5, #15, #17, #18

### Key Dependencies
- #7 depends on #6 (validator needs vocabularies)
- #8 depends on #6 and #7 (examples need both)
- #9 related to #6 (ContentBlock validation)

### Documentation Updated
- CLAUDE.md: Added mandatory issue requirements
- Board meeting command: Issue metadata requirements
- Issue triage command: Compliance checking
- Created github-issue-guidelines.md for all agents

### Compliance Checklist
Before any issue work:
- [ ] Has milestone?
- [ ] Has priority label?
- [ ] Has type label?
- [ ] Dependencies documented?
- [ ] Clear acceptance criteria?

---
*This context should be referenced by all agents working with GitHub issues*