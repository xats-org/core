# Changelog - v0.4.0

All notable changes to the xats project version 0.4.0 are documented here.

## [0.4.0] - 2025-01-20

### 🎉 Major Release: Monorepo Architecture

This release represents a complete restructuring of the xats project into a modern monorepo architecture using Turborepo, pnpm workspaces, and Changesets.

### ⚠️ Breaking Changes

- **Package Structure:** Complete reorganization into scoped packages under `@xats/*`
- **Import Paths:** All imports must now use the new scoped package names
- **CLI Commands:** CLI has been consolidated into a single `xats` command with subcommands
- **Vocabulary URIs:** All URIs updated from `https://xats.org/core/*` to `https://xats.org/vocabularies/*`

### ✨ New Features

#### Packages Created

- **@xats/schema** - Core JSON Schema definitions with multi-version support
- **@xats/validator** - Comprehensive validation logic with detailed error reporting
- **@xats/types** - Shared TypeScript type definitions for strong typing
- **@xats/cli** - Unified command-line interface with multiple commands
- **@xats/renderer** - Multi-format rendering engine (HTML, Markdown, Text)
- **@xats/utils** - Shared utility functions for common operations
- **@xats/examples** - Comprehensive example documents and use cases
- **@xats/vocabularies** - Vocabulary definitions for blocks, hints, and more
- **@xats/extensions** - Extension system for custom functionality

#### CLI Enhancements

- `xats validate` - Validate xats documents with detailed error reporting
- `xats render` - Render documents to HTML, Markdown, or plain text
- `xats stats` - Get comprehensive statistics about documents
- `xats format` - Format JSON documents with proper indentation
- `xats info` - Display detailed information about documents

#### Rendering Capabilities

- **HTML Renderer** - Full-featured HTML output with semantic markup
- **Markdown Renderer** - Clean Markdown output for documentation
- **Text Renderer** - Plain text output for accessibility
- **Custom Renderers** - Extensible base class for custom rendering

#### Development Infrastructure

- **Turborepo** - Efficient monorepo build system with caching
- **pnpm Workspaces** - Fast, disk-space efficient package management
- **Changesets** - Automated versioning and changelog generation
- **Vitest** - Modern testing framework with workspace support
- **ESLint & Prettier** - Shared configuration across all packages
- **TypeScript Project References** - Optimized TypeScript compilation

### 🚀 Improvements

#### Performance

- Parallel package builds with Turborepo caching
- Optimized TypeScript compilation with project references
- Tree-shakeable packages for smaller bundle sizes
- Lazy loading of heavy dependencies

#### Developer Experience

- Unified CLI with intuitive subcommands
- Comprehensive TypeScript types
- Improved error messages with actionable fixes
- Hot module replacement in development
- Integrated testing across packages

#### Code Quality

- Shared ESLint and Prettier configurations
- Comprehensive test coverage
- Type-safe package interfaces
- Consistent coding standards

#### CI/CD

- GitHub Actions workflows for automated testing
- Security scanning with Dependabot and CodeQL
- Automated release process with Changesets
- Performance benchmarking in CI

### 🔧 Technical Details

#### Monorepo Structure

```
xats/
├── packages/           # Core packages
│   ├── @xats/schema
│   ├── @xats/validator
│   ├── @xats/types
│   ├── @xats/cli
│   ├── @xats/renderer
│   ├── @xats/utils
│   ├── @xats/examples
│   ├── @xats/vocabularies
│   └── @xats/extensions
├── apps/              # Applications
│   ├── docs/         # Documentation site
│   └── website/      # xats.org website
├── turbo.json        # Turborepo configuration
├── pnpm-workspace.yaml
└── package.json
```

#### Build Pipeline

1. TypeScript compilation with project references
2. Parallel builds with Turborepo
3. Bundle optimization with tsup
4. Type declaration generation
5. Package linking for development

#### Testing Strategy

- Unit tests for individual packages
- Integration tests for cross-package functionality
- End-to-end tests for complete workflows
- Performance benchmarking
- Security scanning

### 📦 Package Versions

| Package | Version | Description |
|---------|---------|-------------|
| @xats/schema | 0.4.0 | Core JSON Schema definitions |
| @xats/validator | 0.4.0 | Validation logic |
| @xats/types | 0.4.0 | TypeScript types |
| @xats/cli | 0.4.0 | Command-line interface |
| @xats/renderer | 0.4.0 | Rendering framework |
| @xats/utils | 0.4.0 | Shared utilities |
| @xats/examples | 0.4.0 | Example documents |
| @xats/vocabularies | 0.4.0 | Vocabulary definitions |
| @xats/extensions | 0.4.0 | Extension schemas |

### 🐛 Bug Fixes

- Fixed validation errors for deeply nested documents
- Resolved TypeScript compilation issues with strict mode
- Fixed rendering of complex semantic text structures
- Corrected URI resolution for modular documents
- Fixed memory leaks in large document processing

### 📚 Documentation

- Comprehensive migration guide from v0.3.0
- Package-specific README files
- API documentation for all public interfaces
- Example usage for all features
- Contributing guidelines updated for monorepo

### 🔒 Security

- Automated dependency scanning with Dependabot
- CodeQL security analysis
- Secret scanning in CI/CD
- License compliance checking
- Software Bill of Materials (SBOM) generation

### 🙏 Acknowledgments

Thanks to all contributors who made this major release possible:

- xats Standards Board for architectural guidance
- Community members for testing and feedback
- Open source projects that power our infrastructure

### 📝 Migration Guide

See [Migration Guide](./docs/migration/v0.4.0-migration-guide.md) for detailed migration instructions from v0.3.0.

### 🔗 Links

- [GitHub Repository](https://github.com/xats-org/core)
- [Documentation](https://xats.org/docs)
- [npm Packages](https://www.npmjs.com/org/xats)

---

For questions or issues, please visit our [GitHub Issues](https://github.com/xats-org/core/issues) page.