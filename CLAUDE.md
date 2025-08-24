# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The **eXtensible Academic Text Standard (xats)** is a JSON-based standard for defining educational materials. It creates a deeply semantic, machine-readable format for AI-driven educational tools to generate, deconstruct, and repurpose educational content.

### Monorepo Structure (v0.4.0+)

Starting with v0.4.0, xats is organized as a TypeScript monorepo using Turborepo and pnpm workspaces:

```
xats/
├── packages/
│   ├── @xats-org/schema/         # Core JSON Schema definitions
│   ├── @xats-org/validator/      # Validation logic and error reporting
│   ├── @xats-org/types/          # Shared TypeScript types
│   ├── @xats-org/cli/            # Command-line interface
│   ├── @xats-org/renderer/       # Rendering framework
│   ├── @xats-org/mcp-server/     # Model Context Protocol server
│   ├── @xats-org/utils/          # Shared utilities
│   └── @xats-org/examples/       # Example documents
├── apps/
│   ├── docs/                 # Documentation site
│   └── website/              # xats.org website
├── turbo.json                # Turborepo configuration
├── pnpm-workspace.yaml       # pnpm workspace configuration
└── package.json              # Root package.json
```

### Development Workflow

When working with the monorepo:
- Use `pnpm install` to install dependencies
- Use `pnpm run build` to build all packages
- Use `pnpm run test` to run all tests
- Use `pnpm run dev` to start development mode
- Individual packages can be run with `pnpm --filter @xats-org/[package] [command]`

## Memory Management

### Directory Structure
The project uses `.claude/memory/` for persistent storage of important artifacts:

```
.claude/memory/
├── meetings/                    # Board meeting minutes
│   └── YYYY-MM-DD-HHMM/        # Date and time-based folders (24-hour format)
│       ├── minutes.md           # Meeting minutes
│       ├── agenda.md            # Meeting agenda
│       └── action-items.json   # Structured action items
├── decisions/                   # Architectural Decision Records (ADRs)
├── contexts/                    # Shared context documents
└── archives/                    # Historical records
```

### Storage Guidelines
- **Meeting Minutes**: Always store in `.claude/memory/meetings/YYYY-MM-DD-HHMM/minutes.md`
  - Use 24-hour format for time (e.g., `2025-01-17-1430` for 2:30 PM)
  - This allows multiple meetings per day
  - **IMPORTANT**: Always use `.claude/commands/xats-utils/get-timestamp.sh` to get correct date/time
- **Decision Records**: Store ADRs in `.claude/memory/decisions/`
- **Project Context**: Maintain shared context in `.claude/memory/contexts/`
- **Never** store temporary or working documents at the project root
- Use memory directories for all persistent board and project artifacts

### Getting Correct Date and Time
**All agents and commands MUST use the timestamp utility to ensure consistency:**
```bash
# Get full timestamp (YYYY-MM-DD-HHMM)
TIMESTAMP=$(.claude/commands/xats-utils/get-timestamp.sh --timestamp)

# Get just date (YYYY-MM-DD)
DATE=$(.claude/commands/xats-utils/get-timestamp.sh --date)

# Get just time (HHMM)
TIME=$(.claude/commands/xats-utils/get-timestamp.sh --time)
```
This ensures all memory artifacts use consistent, accurate timestamps.

### STRICT File Placement Rules

#### ✅ Files that belong in PROJECT ROOT
- `README.md` - Project overview
- `LICENSE.md` - License information  
- `CODE_OF_CONDUCT.md` - Community guidelines
- `CONTRIBUTING.md` - Contribution guidelines
- `CLAUDE.md` - This file, with AI assistant instructions
- `.gitignore`, `package.json`, other config files

#### ❌ Files that NEVER belong in PROJECT ROOT
- Meeting minutes or notes
- Analysis documents
- Recommendations or proposals
- Board member outputs
- Temporary working documents
- Agent-generated reports

#### 📁 Proper Locations for Generated Content
- **Meeting artifacts**: `.claude/memory/meetings/YYYY-MM-DD-HHMM/`
  - `minutes.md` - Official meeting minutes
  - `agenda.md` - Meeting agenda
  - `action-items.json` - Structured tasks
  - Any analysis or recommendations from that meeting
- **Project documentation**: `/docs/` (only if it's official, permanent documentation)
- **Examples**: `/examples/` (only validated, working examples)
- **Schema definitions**: `/schemas/` (only official schema files)

#### ⚠️ IMPORTANT: Before Creating Any File
1. Ask: "Is this official project documentation or code?"
   - YES → Place in appropriate project folder
   - NO → Place in `.claude/memory/`
2. Ask: "Will users need this file to use xats?"
   - YES → Place in project structure
   - NO → Place in `.claude/memory/`
3. When in doubt → Use `.claude/memory/`

## Version Management & Branching Strategy

The xats project follows a structured versioning and branching strategy to maintain stability while enabling active development.

### Branch Structure

#### **main branch**
- Contains the **latest stable release** (currently v0.3.0)
- **Protected from force pushes and deletion**
- Only receives merges from version branches when they are stable
- Tagged with release versions (e.g., `v0.1.0`, `v0.1.1`)

#### **Version branches** (e.g., `v0.2.0`, `v0.3.0`)
- **Active development branches** for each version
- **Protected from force pushes and deletion**
- **Preserved permanently** for historical record
- Default target for PRs during development phase
- Contains schema directories for their version (e.g., `/schemas/v0.2.0/`)

#### **Feature branches**
- Created from version branches: `feature/issue-[NUMBER]-[SHORT_DESCRIPTION]`
- Target version branches in PRs, not main
- Deleted after merge to keep repository clean

#### **Hotfix branches**
- Created from main for urgent fixes: `hotfix/v0.1.1`
- Merged back to main AND forward-ported to active development branches
- Tagged immediately after merging to main

#### **Release candidate branches**
- Pre-release testing: `v0.2.0-rc1`, `v0.2.0-rc2`
- Created from version branches for final testing
- Merged back to version branch after validation

### Workflow Process

**⚠️ CRITICAL: NEVER commit directly to main or version branches (v0.2.0, v0.3.0, v0.4.0, etc.)**
**ALWAYS create feature branches and use pull requests for ALL changes.**

#### 1. Starting New Development
```bash
# Create new version branch from main (only for new versions)
git checkout main
git pull origin main
git checkout -b v0.2.0
git push -u origin v0.2.0
```

#### 2. Feature Development
```bash
# ALWAYS create feature branch from version branch
git checkout v0.2.0
git pull origin v0.2.0
git checkout -b feature/issue-42-new-feature

# Make your changes
# Commit your changes
# Push feature branch
git push -u origin feature/issue-42-new-feature
```

#### 3. Pull Request Creation
```bash
# ALWAYS target the version branch, NOT main
# Feature branches → Version branches (during development)
gh pr create \
  --base "v0.2.0" \
  --title "feat: implement new feature" \
  --milestone "v0.2.0" \
  --body "Closes #42"
```

#### 4. Version Release (ONLY when version is complete)
```bash
# Version branches → main (ONLY for releases)
# This PR is created ONLY when the version is ready for production
gh pr create \
  --base "main" \
  --head "v0.2.0" \
  --title "Release: v0.2.0" \
  --body "Release notes..."

# After PR is approved and merged
git checkout main
git pull origin main
git tag v0.2.0
git push origin v0.2.0
```

#### Important Rules:
1. **NEVER commit directly to main** - All changes must go through PR review
2. **NEVER commit directly to version branches** - Use feature branches
3. **Feature branches target version branches** - Not main
4. **Version branches target main ONLY for releases** - When fully ready for production
5. **Always create PRs** - Even for small changes

#### 5. Hotfix Process
```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/v0.1.1
# Make fixes, commit, then:
gh pr create --base "main" --title "fix: critical hotfix"
# After merge to main:
git checkout v0.2.0
git merge main  # Forward-port the hotfix
```

### Schema Organization

**All branches maintain their schema directories:**
- `main`: `/schemas/v0.1.0/` (current stable)
- `v0.2.0` branch: `/schemas/v0.1.0/` + `/schemas/v0.2.0/`
- `v0.3.0` branch: `/schemas/v0.1.0/` + `/schemas/v0.2.0/` + `/schemas/v0.3.0/`

This ensures backward compatibility and provides complete historical context.

### Branch Protection Rules

**main branch:**
- Require PR reviews
- Require status checks to pass
- Restrict pushes to administrators only
- No force pushes or deletions allowed

**Version branches:**
- Require PR reviews for major changes
- No force pushes or deletions allowed
- Allow direct pushes for minor updates (documentation, examples)

### Release Tagging Strategy

**Release tags are created when merging to main:**
```bash
# Semantic versioning tags
git tag v0.1.0    # Major.Minor.Patch
git tag v0.1.1    # Hotfix releases
git tag v0.2.0-rc1  # Release candidates
```

**Tag naming conventions:**
- `v0.1.0` - Stable releases
- `v0.1.1` - Hotfix/patch releases
- `v0.2.0-rc1` - Release candidates
- `v0.2.0-beta1` - Beta releases (if needed)

### Current Active Branches

- **main** - v0.3.0 (stable)
- **v0.4.0** - Monorepo infrastructure (completed)
- **v0.5.0** - Enhanced rendering and AI integration (current development)
- **v0.6.0** - Analytics and advanced internationalization (planned)

## Key Architecture Principles

1. **Semantic Containers over Generic Containers**: Uses specific objects (`Unit`, `Chapter`, `Section`) rather than generic nodes for clarity
2. **URI-based Vocabularies**: All controlled vocabularies use URIs for decentralized extensibility (e.g., `blockType`, `resourceType`)
3. **CSL-JSON for Citations**: Adopts Citation Style Language for all bibliographic data
4. **SemanticText Model**: Rich text using typed "runs" for consistent machine parsing
5. **Optional Pedagogy**: Learning objectives are optional to support diverse content types
6. **Separation of Content and Presentation**: Uses `renderingHints` for intent without hard-coding styles

## Schema Structure

### Core Components
- **XatsObject**: Base object with universal metadata (`id`, `tags`, `extensions`)
- **StructuralContainer**: Base for `Unit`, `Chapter`, `Section` with `label`, `title`, `pathways`
- **ContentBlock**: Basic unit of content with `blockType` URI and type-specific `content`
- **SemanticText**: Structured text with typed runs (text, reference, citation, emphasis, strong)
- **Pathway**: Conditional learning paths based on assessments

### Document Structure
```
Root
├── schemaVersion (required: "0.1.0")
├── bibliographicEntry (required: CSL-JSON)
├── subject (required)
├── frontMatter (optional)
├── bodyMatter (required)
│   └── contents: Unit[] | Chapter[]
└── backMatter (optional)
```

## Working with the Schema

### Schema Location
- Current stable version: `v0.3.0` (on main branch)
- Active development: `v0.4.0` (monorepo structure)
- Legacy versions: `v0.1.0`, `v0.2.0`

### Validation
When working with xats documents, validate against the JSON Schema to ensure compliance.

### Core Vocabulary URIs
Common `blockType` URIs:
- `https://xats.org/vocabularies/blocks/paragraph`
- `https://xats.org/vocabularies/blocks/heading`
- `https://xats.org/vocabularies/blocks/list`
- `https://xats.org/vocabularies/blocks/blockquote`
- `https://xats.org/vocabularies/blocks/codeBlock`
- `https://xats.org/vocabularies/blocks/mathBlock`
- `https://xats.org/vocabularies/blocks/table`
- `https://xats.org/vocabularies/blocks/figure`
- `https://xats.org/vocabularies/placeholders/tableOfContents`
- `https://xats.org/vocabularies/placeholders/bibliography`
- `https://xats.org/vocabularies/placeholders/index`

### Important Patterns

1. **SemanticText Usage**: Always use `SemanticText` objects with `runs` array, never plain strings
2. **References**: Use `ReferenceRun` for internal links, `CitationRun` for bibliography citations
3. **Placeholders**: Use placeholder blocks to indicate where generated content should appear
4. **Extensions**: Custom data goes in `extensions` object on any `XatsObject`

## Contributing

- Follow the architectural principles in `/docs/ARCHITECTURE.md`
- New vocabulary URIs require community discussion and evidence of adoption
- Changes follow Semantic Versioning (Major.Minor.Patch)
- All contributions must uphold the Code of Conduct

## Core Documentation References

- **Architecture Decisions**: `/docs/ARCHITECTURE.md` - Core design rationale
- **Roadmap**: `/docs/ROADMAP.md` - Future features and vision

## Consumer-Facing Documentation

- **Schema Reference**: `/docs/reference/index.md` - Complete property documentation
- **Authoring Guide**: `/docs/guides/authoring-guide.md` - Best practices for content creation

## Related Projects

The xats ecosystem consists of several related projects organized within this repository:

- **/docs/** - Consumer-facing documentation containing comprehensive guides, reference documentation, and specifications for schema users and implementers
- **/examples/** - Collection of example xats documents demonstrating various features and use cases of the schema
- **/extensions/** - Community-contributed extensions to the core xats schema, including custom vocabularies and specialized content types
- **../mcp/** - Model Context Protocol (MCP) integration tools providing schema validation, visualization, and AI assistant capabilities for xats documents
- **../website/** - Official xats.org website source code for the project's public-facing site


## xats Standards Board

The xats project is guided by a comprehensive board of AI agents representing diverse stakeholder perspectives. This board ensures balanced decision-making that considers educational, technical, commercial, and accessibility needs.

### Board Members

#### Core Development Team
- **xats-project-steward** - Project management, community liaison, strategic lead
- **xats-schema-engineer** - Technical implementation and JSON Schema expertise
- **xats-validation-engineer** - Quality assurance and testing
- **xats-doc-writer** - Documentation management and technical writing
- **xats-standards-analyst** - Research and alignment with existing standards

#### Educational Experts
- **xats-pedagogy-architect** - Learning science and instructional design
- **xats-assessment-specialist** - Educational measurement and psychometrics
- **xats-content-author** - Faculty perspective on content creation
- **xats-student-advocate** - Student experience and learning needs

#### Implementation Partners
- **xats-publishing-expert** - Commercial publishing workflows and viability
- **xats-lms-integrator** - Learning Management System integration
- **xats-ai-education-expert** - AI-driven education and future technologies

#### Quality & Inclusion
- **xats-accessibility-champion** - Universal design and accessibility compliance
- **xats-international-liaison** - Global perspectives and internationalization
- **xats-academic-administrator** - Institutional strategy and governance

### Commands

Commands are organized into categories based on their purpose:

#### Board Commands (`xats-board:`)
- **xats-board:board-meeting** - Convenes full board for major decisions
- **xats-board:feature-ideation** - Facilitates creative feature brainstorming
- **xats-board:issue-triage** - Reviews and prioritizes GitHub issues
- **xats-board:schema-review** - Technical review of proposed changes
- **xats-board:impact-assessment** - Analyzes effects on all stakeholders
- **xats-board:release-planning** - Coordinates version releases
- **xats-board:extension-review** - Evaluates extension proposals
- **xats-board:stakeholder-feedback** - Gathers input from user groups
- **xats-board:memory-utils** - Manages board memory and archives

#### Development Commands (`xats-dev:`)
- **xats-dev:schema-implement** - Implements new features with full workflow
- **xats-dev:test-suite** - Creates comprehensive test suites
- **xats-dev:code-review** - Performs thorough code reviews
- **xats-dev:ci-auto-fix** - Automatically fixes CI failures for a PR (uses Opus model)

#### User Commands (`xats-user:`)
- **xats-user:create-textbook** - Helps create xats-compliant textbooks
- **xats-user:validate-content** - Validates content for compliance
- **xats-user:create-extension** - Guides extension development

Use these commands with `claude --command [category:command-name]` to invoke specific workflows.

## GitHub Issue & Project Management Policy

**All issues must be tracked, triaged, and managed using the following workflow.**  
**Every issue must be assigned a milestone that matches the schema version it targets (e.g., `v0.1.0`).**  
**Agents to consult for best practices:**  
- `xats-project-steward` (project management, prioritization, milestone planning)
- `context-manager` (issue linking, context preservation)
- `reference-builder` (cross-referencing issues, PRs, and documentation)

### Task Workflow

#### 1. Task Analysis

- Read and understand the issue requirements.
- Assess if the issue needs to be broken down into smaller subtasks.
- If needed, create separate issues for subtasks and link them to the parent issue (use `context-manager` for linking).
- Ensure the issue has correct priority and status labels.
- **Assign a milestone** that matches the schema version (e.g., `v0.1.0`).

#### 2. Starting Work on an Issue

- **Create a branch from the appropriate version branch** (not main):  
	```bash
	# For v0.2.0 features
	git checkout v0.2.0
	git pull origin v0.2.0
	git checkout -b feature/issue-[NUMBER]-[SHORT_DESCRIPTION]
	```
- Make an initial commit referencing the issue:  
	`git commit -m "refs #[NUMBER]: Start implementing [FEATURE]"`
- The automated status tracking system will detect this commit and change the issue status to "in-progress".

#### 3. Schema-Driven Development

- Define or update the JSON Schema as needed to address the issue.
- Write or update example documents to validate against the schema.
- Use a JSON Schema validator (e.g., `ajv`, `jsonschema`, or an online tool) to ensure compliance.
- Refactor schema and examples as needed to maintain clarity and coverage.

#### 4. Completing an Issue

- **Create a pull request targeting the version branch** (not main):  
	```bash
	# Target the appropriate version branch
	gh pr create \
	  --base "v0.2.0" \
	  --title "[TITLE]" \
	  --milestone "v0.2.0" \
	  --body "Closes #[NUMBER]"
	```
- The PR body must include `Closes #[NUMBER]` or `Fixes #[NUMBER]` to automatically close the issue when merged.
- The automated status tracking system will update the issue status to "completed" when the PR is merged and adjust priorities of remaining tasks.

#### 5. GitHub Issue Management Requirements

##### MANDATORY Issue Metadata
Every issue MUST have:
1. **Milestone**: Target schema version (e.g., `v0.1.0`, `v0.2.0`, `v0.3.0`)
2. **Project**: Must be added to `xats-core` project (https://github.com/orgs/xats-org/projects/2)
3. **Labels**: At minimum `priority:X` and `type:X`
4. **Relationships**: Link related issues, PRs, or dependencies

##### Issue Creation Template
```bash
gh issue create \
  --title "Clear, actionable title" \
  --body "Detailed description with acceptance criteria" \
  --label "priority:1" \
  --label "type:feature" \
  --label "component:schema" \
  --milestone "v0.1.0"
```

##### Issue Relationships
- **Blocks/Blocked by**: Use when one issue depends on another
- **Related to**: Use for issues that share context
- **Duplicate of**: Mark duplicates appropriately
- Add relationships in issue body: `Depends on #X`, `Blocks #Y`, `Related to #Z`

##### Available Milestones
- `v0.1.0` - Core functionality and infrastructure (Completed)
- `v0.2.0` - Assessment framework and pedagogy (Due: 2025-11-30)
- `v0.3.0` - Extended features and ecosystem (Due: 2026-01-31)
- `v0.4.0` - Monorepo infrastructure and modern tooling (Due: 2026-03-31)
- `v0.5.0` - Rendering, AI integration & extended features (Due: 2026-05-31)
- `v0.6.0` - Analytics and advanced internationalization (Due: 2026-09-30)
- `v0.7.0` - Extended ecosystem and blockchain (Due: 2027-01-31)

##### GitHub Issue Management Commands

- View all issues:  
	`gh issue list`
- View specific issue with details:  
	`gh issue view [NUMBER]`
- Filter by milestone:  
	`gh issue list --milestone "v0.1.0"`
- Update milestone:  
	`gh issue edit [NUMBER] --milestone "v0.1.0"`
- Add to project (requires project scope):  
	`gh issue edit [NUMBER] --add-project "xats-core"`
- Link issues in body:  
	`gh issue edit [NUMBER] --body "$(gh issue view [NUMBER] --json body -q .body)\n\nRelated to #[OTHER]"`

#### 6. Documentation

- Update schema comments and documentation in `/docs` as needed.
- Update `README.md` or other docs as needed.
- Add new commands or processes to this `CLAUDE.md` file if relevant.

#### 7. Commit Conventions

- Use these prefixes in commit messages to trigger automatic status changes:
	- `refs #X:` References the issue without changing status
	- `implements #X:` Indicates implementation progress
	- `fixes #X:` Indicates the issue is fixed (used in final commits)
	- `closes #X:` Same as fixes, will close the issue when merged
- Always include the issue number with the `#` prefix.
- Add a descriptive message after the issue reference.
- **Branch-specific conventions:**
	- Feature branches: Include issue reference and clear description
	- Version branches: Use conventional commit format (`feat:`, `fix:`, etc.)
	- Hotfix branches: Prefix with `hotfix:` and include severity level

#### 8. Pull Request Requirements

**⚠️ IMPORTANT: All PRs MUST have a milestone assigned or CI checks will fail!**

**All PRs must follow these GitHub rules enforced by automated checks:**

##### PR Title Format
- Use conventional commit format: `type: description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Examples:
  - `feat: add release automation workflow`
  - `fix: resolve CI test failures`
  - `docs: update API documentation`

##### PR Metadata Requirements (MANDATORY)
- **🎯 Milestone (REQUIRED)**: Every PR MUST be assigned to a milestone (v0.1.0, v0.2.0, or v0.3.0)
  - **Without a milestone, the PR validator will fail and remind you to add one**
- **Labels**: Add appropriate labels for type and components
- **Assignees**: Assign to relevant team members if applicable
- **Linked Issues**: Reference related issues in PR body with `Closes #X` or `Fixes #X`

##### PR Creation Commands
```bash
# Create PR targeting version branch (DEFAULT for development)
gh pr create \
  --base "v0.2.0" \
  --title "feat: description here" \
  --milestone "v0.2.0" \
  --body "Closes #X"

# Create hotfix PR targeting main
gh pr create \
  --base "main" \
  --title "hotfix: critical fix description" \
  --milestone "v0.1.1" \
  --body "Fixes #X"

# Edit existing PR to add milestone
gh pr edit [PR_NUMBER] --milestone "v0.2.0"
```

##### GitHub Actions PR Checks
The automated PR validator will verify:
- ❌ PR must be assigned to a milestone
- ❌ PR must target appropriate branch (version branch for features, main for hotfixes)
- ℹ️ PR title should use conventional commit format
- ℹ️ Feature PRs should not target main branch directly

---

**All contributors and agents must follow this workflow to ensure issues are always tracked, milestones are set, and project management is transparent and effective.**