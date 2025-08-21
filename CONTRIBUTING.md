# Contributing to xats

First off, thank you for considering contributing to the **Extensible Academic Textbook Schema (xats)**. This project is a community effort, and we welcome any contribution, from fixing typos in the documentation to proposing major architectural changes.

This document provides a set of guidelines for contributing to the project.

---

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before you start.

---

## How Can I Contribute?

### Reporting Bugs or Suggesting Enhancements

If you find a bug in the schema or documentation, or if you have an idea for an enhancement, the best way to start is by **opening an issue** on our GitHub repository.

Please be as detailed as possible. For bugs, include steps to reproduce the issue. For enhancements, provide a clear and detailed description of the feature you're proposing and the problem it solves, referencing the [Architectural Decision Record (ADR)](./ARCHITECTURE.md) where appropriate.

### Proposing Changes

**Important: We use a version-based branching strategy. The `main` branch contains the latest stable release. Active development happens on version branches (e.g., `v0.4.0`).**

#### For New Features and Enhancements:

1.  **Fork the repository** on GitHub.
2.  **Check out the current development branch** (e.g., `v0.4.0`):
    ```bash
    git checkout v0.4.0
    git pull origin v0.4.0
    ```
3.  **Create a new feature branch** from the version branch:
    ```bash
    git checkout -b feature/issue-NUMBER-description
    ```
4.  **Make your changes** to the schema or documentation.
5.  **Submit a pull request (PR)** targeting the **version branch** (not `main`):
    ```bash
    gh pr create --base v0.4.0 --title "feat: your feature" --body "Closes #NUMBER"
    ```
6.  **Ensure your PR has a milestone** matching the target version (e.g., `v0.4.0`).

#### For Hotfixes to Stable Release:

1.  **Create a hotfix branch** from `main`:
    ```bash
    git checkout main
    git pull origin main
    git checkout -b hotfix/v0.3.1-description
    ```
2.  **Make your fix** and test thoroughly.
3.  **Submit a PR** to `main`:
    ```bash
    gh pr create --base main --title "fix: critical issue" --body "Fixes #NUMBER"
    ```
4.  **After merging**, forward-port the fix to active development branches.

A member of the standards committee will review your PR. We may suggest some changes or improvements.

---

## Proposing a New Core Vocabulary URI

The bar for adding a new URI to the core vocabulary is high, as it must be broadly applicable across multiple disciplines.

1.  **Start with a custom URI.** The best way to prove the utility of a new type is to define it in your own namespace and use it in real-world projects.
2.  **Open an issue** with the label "Vocabulary Proposal."
3.  **Provide a detailed rationale:**
    * The full URI you are proposing (e.g., `https://xats.org/vocabularies/blocks/new-block`).
    * A clear description of its purpose.
    * For `blockType`s, a complete JSON Schema for its `content` object.
    * Examples of its use and evidence of its adoption by the community.
4.  The proposal will be discussed by the committee and the community.

---

## Versioning Strategy

The **xats** standard follows **Semantic Versioning (SemVer)** with a structured branching model:

### Version Numbers
- **MAJOR** version (e.g., `1.0.0` -> `2.0.0`) for incompatible, breaking changes to the schema.
- **MINOR** version (e.g., `1.0.0` -> `1.1.0`) for adding new, backward-compatible functionality.
- **PATCH** version (e.g., `1.0.0` -> `1.0.1`) for backward-compatible bug fixes or clarifications in the documentation.

### Branch Structure
- **`main`** - Contains the latest stable release (currently v0.3.0)
- **Version branches** (e.g., `v0.4.0`, `v0.5.0`) - Active development for upcoming releases
- **Feature branches** - Created from version branches for specific features
- **Hotfix branches** - Created from `main` for critical fixes to stable releases
- **Release candidate branches** (e.g., `v0.2.0-rc1`) - Pre-release testing

### Current Development Status
- **Stable Release**: v0.3.0 (on `main`)
- **Active Development**: v0.4.0 (on `v0.4.0` branch)
- **Previous Versions**: v0.2.0 (security only), v0.1.0 (security only)

All version branches are preserved permanently for historical reference. Schemas are maintained in version-specific directories (e.g., `/schemas/0.1.0/`, `/schemas/0.2.0/`, `/schemas/0.3.0/`).

### Version Support Policy
- **Current Stable** (v0.3.0): Full feature development and bug fixes
- **Previous Stable** (v0.2.0): Security fixes only
- **Legacy** (v0.1.0): Security fixes only

See our [Version Compatibility Matrix](./docs/specs/version-compatibility-matrix.md) for feature availability across versions.

---

## New in v0.3.0

The current stable release includes several major new features:

### File Modularity
Large textbooks can now be split across multiple JSON files for better organization and team collaboration:

```json
{
  "bodyMatter": {
    "contents": [
      {"$ref": "./chapters/chapter-01.json"},
      {"$ref": "./chapters/chapter-02.json"}
    ]
  }
}
```

### Enhanced Internationalization
Full support for language identification and text direction:

```json
{
  "language": "ar-SA",
  "textDirection": "rtl",
  "content": {"runs": [{"type": "text", "text": "مرحبا"}]}
}
```

### Advanced Indexing
Semantic index entries with the new IndexRun type:

```json
{
  "type": "index",
  "text": "photosynthesis",
  "indexTerm": "Photosynthesis",
  "subTerm": "Process",
  "crossReferences": ["Cellular Respiration"],
  "indexId": "idx-photo-001"
}
```

### New Pedagogical Content Types
- **Case Study Blocks**: Structured case-based learning support
- **Metacognitive Prompts**: Self-reflection and learning awareness tools

See the [v0.3.0 Release Notes](./docs/releases/v0.3.0.md) for complete details.

---

## Monorepo Development (v0.4.0+)

Starting with v0.4.0, xats is organized as a TypeScript monorepo using Turborepo and pnpm workspaces. This enables better code organization, shared dependencies, and parallel builds.

### Prerequisites
- Node.js >= 18.0.0
- pnpm >= 8.0.0 (Install with `npm install -g pnpm`)

### Getting Started
```bash
# Clone the repository
git clone https://github.com/xats-org/core.git
cd core

# Install pnpm if not already installed
npm install -g pnpm

# Install dependencies for all packages
pnpm install

# Build all packages
pnpm run build

# Run tests across all packages
pnpm run test

# Start development mode
pnpm run dev
```

### Monorepo Structure
```
xats/
├── packages/           # Core packages
│   ├── @xats/schema/   # JSON Schema definitions
│   ├── @xats/validator/# Validation logic
│   ├── @xats/types/    # Shared TypeScript types
│   ├── @xats/cli/      # Command-line interface
│   └── ...
├── apps/              # Applications
│   ├── docs/          # Documentation site
│   └── website/       # xats.org website
└── turbo.json         # Turborepo configuration
```

### Working with Packages
```bash
# Run commands for specific packages
pnpm --filter @xats/schema build
pnpm --filter @xats/validator test

# Add dependencies to a specific package
pnpm --filter @xats/schema add ajv

# Add dev dependencies to root
pnpm add -D -w eslint
```

### Turborepo Features
- **Parallel Builds**: Packages build in parallel based on dependency graph
- **Caching**: Build outputs are cached for faster subsequent builds
- **Watch Mode**: `pnpm run dev` watches all packages for changes
- **Pipeline Optimization**: Tasks run in optimal order based on dependencies
- **Remote Caching**: (Optional) Share build caches across team members

#### Available Scripts
```bash
# Core development commands
pnpm build         # Build all packages
pnpm build:watch   # Build with file watching
pnpm dev          # Start development mode
pnpm test         # Run all tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Generate coverage reports
pnpm lint         # Lint all packages
pnpm lint:fix     # Auto-fix linting issues
pnpm format       # Format code with Prettier
pnpm typecheck    # Type-check all packages
pnpm clean        # Clean build artifacts
pnpm validate     # Run full validation (build, lint, test)
```

#### Turborepo Cache
Turborepo caches task outputs to speed up builds:
- Cache is stored in `.turbo/` directory
- Automatically invalidated when inputs change
- Can be cleared with `pnpm clean`

#### Remote Caching Setup (Optional)
For teams, enable remote caching to share build artifacts:
```bash
# Set up Vercel Remote Cache (requires Vercel account)
npx turbo login
npx turbo link

# Or use custom remote cache
# Add to .env.local:
TURBO_API=https://your-cache-server.com
TURBO_TOKEN=your-token
TURBO_TEAM=your-team
```

### Creating New Packages
1. Create a new directory under `packages/` or `apps/`
2. Add a `package.json` with appropriate name and scripts
3. Add TypeScript configuration extending root config
4. Update dependencies in other packages as needed

---

## Development Guidelines

### Creating Changesets

**All changes to packages require a changeset.** Changesets help us track changes, generate changelogs, and manage releases.

#### When to Create a Changeset
Create a changeset when you:
- Add new features
- Fix bugs
- Update dependencies
- Make breaking changes
- Improve documentation (in packages)

#### How to Create a Changeset
```bash
# Create a new changeset
pnpm changeset:add

# Follow the prompts to:
# 1. Select affected packages
# 2. Choose version bump type (patch/minor/major)
# 3. Write a description
```

#### Changeset Guidelines
- **Patch**: Bug fixes, documentation, internal changes
- **Minor**: New features, deprecations (backward compatible)
- **Major**: Breaking changes, removed features

#### Example Changeset Messages
```
- Fix: Resolve validation error for nested content blocks (#123)
- Feat: Add support for mathematical expressions in renderer
- Breaking: Remove deprecated legacyMode option
```

### Schema Validation
Always validate your changes against the schema:

```bash
# Validate against current stable schema
npm run validate examples/

# Test specific features
npm run test:modularity
npm run test:i18n
npm run test:indexing
```

### Documentation Requirements
All contributions must include appropriate documentation:

- **Schema Changes**: Update JSON Schema with proper descriptions
- **New Features**: Add examples to `/examples/` directory
- **Breaking Changes**: Update migration guide
- **API Changes**: Update schema reference documentation

### Testing Requirements
Contributions must include comprehensive tests:

- **Unit Tests**: For individual schema components
- **Integration Tests**: For complex features like file modularity
- **Accessibility Tests**: WCAG compliance validation
- **Example Tests**: Validate all example documents