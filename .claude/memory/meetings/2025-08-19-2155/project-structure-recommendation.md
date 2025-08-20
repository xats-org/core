# xats Project Structure Recommendation: Enhanced Monorepo with Workspaces

**Date:** August 19, 2025  
**Status:** Board Approved  
**Implementation Target:** 4 weeks  
**Review Date:** September 16, 2025  

---

## Executive Summary

The xats Standards Board unanimously recommends adopting an **Enhanced Monorepo with Workspaces** structure to support the tooling phase (v0.4.0 and beyond). This approach balances the benefits of atomic schema-tooling coordination with the scalability needed for our expanding ecosystem.

## Recommendation: Enhanced Monorepo Architecture

### Proposed Repository Structure

```
xats-org/core/
├── packages/
│   ├── schema/                 # Core schema definitions
│   │   ├── schemas/           # JSON Schema files  
│   │   ├── vocabularies/      # URI vocabulary definitions
│   │   └── package.json       # @xats-org/schema
│   ├── validator/             # Validation library
│   │   ├── src/              # TypeScript validation code
│   │   ├── bin/              # CLI binaries
│   │   └── package.json      # @xats-org/validator
│   ├── core-utils/           # Shared utilities
│   │   ├── src/              # Common TypeScript utilities
│   │   └── package.json      # @xats-org/core-utils
│   ├── mcp-server/           # Model Context Protocol server
│   │   ├── src/              # MCP server implementation
│   │   └── package.json      # @xats-org/mcp-server
│   ├── renderer-html/        # HTML rendering engine
│   │   ├── src/              # HTML renderer code
│   │   ├── templates/        # HTML templates
│   │   └── package.json      # @xats-org/renderer-html
│   ├── renderer-pdf/         # PDF rendering engine
│   │   ├── src/              # PDF renderer code
│   │   └── package.json      # @xats-org/renderer-pdf
│   ├── renderer-rmarkdown/   # R-markdown renderer
│   │   ├── src/              # R-markdown generation
│   │   └── package.json      # @xats-org/renderer-rmarkdown
│   ├── cli/                  # Command-line interface
│   │   ├── src/              # CLI implementation
│   │   ├── commands/         # Individual CLI commands
│   │   └── package.json      # @xats-org/cli
│   └── analytics/            # Learning analytics platform
│       ├── src/              # Analytics engine
│       └── package.json      # @xats-org/analytics
├── apps/
│   ├── docs-site/           # Documentation website (Docusaurus)
│   │   ├── docs/            # Markdown documentation
│   │   ├── blog/            # Project blog
│   │   └── package.json     # Site dependencies
│   ├── playground/          # Online xats playground
│   │   ├── src/             # React/TypeScript playground
│   │   └── package.json     # Playground dependencies
│   └── vscode-extension/    # VS Code extension
│       ├── src/             # Extension code
│       └── package.json     # Extension dependencies
├── tools/
│   ├── build-scripts/       # Shared build utilities
│   ├── test-utils/         # Shared testing utilities
│   ├── eslint-config/      # Shared ESLint configuration
│   └── typescript-config/  # Shared TypeScript configuration
├── examples/               # Cross-package examples
│   ├── basic-textbook/     # Simple textbook example
│   ├── assessment-heavy/   # Assessment-focused example
│   └── multilingual/       # i18n example
├── docs/                   # Legacy documentation (migrate to apps/docs-site)
├── .github/               # GitHub workflows and templates
├── turbo.json            # Turborepo configuration
├── pnpm-workspace.yaml   # pnpm workspace configuration
├── package.json          # Root package.json
└── README.md            # Project overview
```

### Tooling Stack

#### Build Orchestration: Turborepo
- **Caching:** Intelligent build caching across packages
- **Parallelization:** Concurrent builds and tests
- **Dependency Tracking:** Automatic rebuild when dependencies change
- **Remote Caching:** Shared cache for CI/CD and team development

#### Package Management: pnpm workspaces
- **Efficient Storage:** Deduplicated node_modules with symlinks
- **Fast Installs:** Faster than npm/yarn for monorepos
- **Workspace Protocol:** Easy cross-package dependencies
- **Filtering:** Run commands on specific packages

#### Release Management: Changesets
- **Coordinated Releases:** Manage versions across related packages
- **Semantic Versioning:** Automatic version bumping
- **Changelog Generation:** Automated release notes
- **Independent Versioning:** Allow packages to have different release cycles when needed

#### Configuration Sharing
- **ESLint:** Shared configuration in `tools/eslint-config`
- **TypeScript:** Shared base configs with package-specific extensions
- **Prettier:** Unified code formatting across all packages
- **Jest/Vitest:** Shared test utilities and configurations

### Package Organization Strategy

#### Core Packages (Tightly Coupled)
- `@xats-org/schema` - Schema definitions and vocabularies
- `@xats-org/validator` - Core validation library
- `@xats-org/core-utils` - Shared utilities

#### Tooling Packages (Moderately Coupled)  
- `@xats-org/renderer-html` - HTML output generation
- `@xats-org/renderer-pdf` - PDF output generation
- `@xats-org/renderer-rmarkdown` - R-markdown generation
- `@xats-org/cli` - Command-line interface

#### Integration Packages (Loosely Coupled)
- `@xats-org/mcp-server` - AI integration server
- `@xats-org/analytics` - Learning analytics platform

#### Applications (Independent)
- Documentation site (not published to npm)
- Playground application (not published to npm)
- VS Code extension (published to VS Code marketplace)

---

## Implementation Timeline

### Phase 1: Infrastructure Setup (Week 1-2)

#### Week 1: Tooling Installation
- [ ] Install and configure Turborepo
- [ ] Set up pnpm workspaces
- [ ] Configure changesets for release management
- [ ] Create shared ESLint and TypeScript configurations
- [ ] Set up basic monorepo scripts in root package.json

#### Week 2: CI/CD Migration  
- [ ] Update GitHub Actions for workspace-aware builds
- [ ] Configure Turborepo remote caching
- [ ] Set up package-specific test and build pipelines
- [ ] Configure automated changesets and releases
- [ ] Test full build and release process

### Phase 2: Code Migration (Week 3-4)

#### Week 3: Core Package Migration
- [ ] Create `packages/schema/` with existing schema files
- [ ] Create `packages/validator/` with existing validation code
- [ ] Create `packages/core-utils/` for shared utilities
- [ ] Update all import paths and package references
- [ ] Migrate existing tests to new package structure

#### Week 4: Documentation and Examples
- [ ] Set up `apps/docs-site/` with Docusaurus
- [ ] Migrate existing documentation to new site structure
- [ ] Update `examples/` to work with new package structure
- [ ] Create package-specific README files
- [ ] Update root README with new structure overview

### Phase 3: New Development (Week 5+)

#### Ongoing: New Package Development
- [ ] Implement `packages/mcp-server/` following established patterns
- [ ] Create renderer packages as needed
- [ ] Set up VS Code extension in `apps/vscode-extension/`
- [ ] Develop CLI tools in `packages/cli/`
- [ ] Build analytics platform in `packages/analytics/`

---

## Development Workflow

### Local Development Setup

```bash
# Clone repository
git clone https://github.com/xats-org/core.git
cd core

# Install dependencies (uses pnpm workspaces)
pnpm install

# Build all packages
pnpm run build

# Run tests across all packages
pnpm run test

# Work on specific package
cd packages/validator
pnpm run dev
```

### Cross-Package Development

```bash
# Build only packages that changed
turbo run build

# Test packages affected by current changes
turbo run test --filter="...[HEAD^]"

# Run specific command on specific packages
turbo run test --filter="@xats-org/validator"

# Work on multiple related packages
turbo run dev --filter="@xats-org/{validator,mcp-server}"
```

### Adding New Packages

```bash
# Create new package directory
mkdir packages/new-package
cd packages/new-package

# Initialize package.json
pnpm init
# Edit package.json to follow naming conventions

# Add dependencies on other workspace packages
pnpm add @xats-org/schema@workspace:*
pnpm add @xats-org/core-utils@workspace:*

# Add to root turbo.json pipeline if needed
```

### Release Process

```bash
# Create changeset for your changes
pnpm changeset

# Version packages based on changesets
pnpm changeset version

# Build and publish all changed packages
pnpm changeset publish
```

---

## Package Naming and Versioning Strategy

### Naming Conventions

All packages published to npm use the `@xats-org/` scope:

- **Core packages:** `@xats-org/schema`, `@xats-org/validator`
- **Tooling packages:** `@xats-org/renderer-html`, `@xats-org/cli`
- **Integration packages:** `@xats-org/mcp-server`, `@xats-org/analytics`

### Versioning Strategy

#### Coordinated Releases (Default)
- Core packages (`schema`, `validator`, `core-utils`) maintain synchronized versions
- Major schema changes trigger coordinated major version bumps
- Breaking changes in core packages trigger cascade updates

#### Independent Releases (When Appropriate)
- Tooling packages can have independent minor/patch releases
- Integration packages (MCP server, analytics) can evolve independently
- Applications (VS Code extension) follow their own release cycles

#### Version Compatibility Matrix

```
xats Schema Version | Compatible Packages
v0.3.x             | @xats-org/validator@^0.3.0
v0.4.x             | @xats-org/validator@^0.4.0
                   | @xats-org/mcp-server@^0.1.0
                   | @xats-org/renderer-html@^0.1.0
```

---

## Quality Assurance and Testing

### Testing Strategy

#### Package-Level Testing
- Each package has its own test suite
- Unit tests for package-specific functionality
- Integration tests for cross-package functionality
- End-to-end tests for complete workflows

#### Monorepo-Level Testing
- Cross-package integration tests
- Full example validation across all packages
- Performance testing for build and release processes
- Documentation testing (link checking, example validation)

### Continuous Integration Pipeline

```yaml
# .github/workflows/ci.yml (simplified)
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: turbo run build test lint
      - run: turbo run test:integration
```

### Quality Gates

- **All tests pass:** No package can be released with failing tests
- **Type checking:** All TypeScript must compile without errors
- **Linting:** Code must pass ESLint rules
- **Documentation:** All public APIs must be documented
- **Examples:** Changes must not break existing examples

---

## Migration Plan from Current Structure

### Automated Migration Steps

```bash
# 1. Install new tooling
pnpm add -w turbo @changesets/cli

# 2. Create package directories
mkdir -p packages/{schema,validator,core-utils}
mkdir -p apps/{docs-site,playground}
mkdir -p tools/{build-scripts,test-utils}

# 3. Move existing code
mv schemas/ packages/schema/schemas/
mv src/ packages/validator/src/
mv bin/ packages/validator/bin/
mv test/ packages/validator/test/

# 4. Create package.json files for each package
# (scripted generation based on templates)

# 5. Update import paths
# (automated find/replace with proper scoping)

# 6. Configure workspace dependencies
# (automated based on current dependencies)
```

### Manual Migration Steps

1. **Review and reorganize:** Ensure logical package boundaries
2. **Update documentation:** Reflect new structure in all docs
3. **Test thoroughly:** Verify all functionality works in new structure
4. **Update external references:** GitHub workflows, scripts, etc.

### Rollback Plan

If the migration encounters critical issues:

1. **Preserve current main branch** until migration is fully validated
2. **Create migration branch** for all structural changes
3. **Incremental merge** - merge migration in phases if needed
4. **Full rollback option** - ability to return to current structure if necessary

---

## Benefits and Trade-offs

### Benefits of Enhanced Monorepo

#### Developer Experience
- **Single repository clone** - everything available immediately
- **Shared development tooling** - consistent experience across packages
- **Atomic changes** - schema and tooling changes in single commits
- **Simplified dependency management** - workspace protocol handles internal deps

#### Project Management
- **Coordinated releases** - ensure compatibility across packages
- **Unified issue tracking** - all issues in single location with good labeling
- **Consistent quality** - shared linting, testing, and CI/CD standards
- **Single documentation site** - cohesive user experience

#### Third-Party Adoption
- **Predictable versioning** - clear compatibility matrix
- **Unified npm scope** - easy package discovery
- **Consistent APIs** - shared utilities ensure consistent patterns
- **Complete examples** - examples can demonstrate full stack

### Trade-offs and Mitigation

#### Repository Size
- **Issue:** Repository grows large with many packages
- **Mitigation:** Use Git LFS for large assets, regular cleanup

#### Build Complexity  
- **Issue:** Complex build pipeline with many packages
- **Mitigation:** Turborepo caching, incremental builds, clear documentation

#### Contributor Onboarding
- **Issue:** New contributors face complex setup
- **Mitigation:** Excellent documentation, VS Code workspace setup, dev containers

#### CI/CD Resource Usage
- **Issue:** Potentially expensive CI builds
- **Mitigation:** Smart caching, test filtering, parallel execution

---

## Success Metrics

### Technical Metrics

#### Build Performance
- **Target:** Build times under 2 minutes for full monorepo
- **Measure:** CI pipeline duration, local build times
- **Baseline:** Current build time ~45 seconds

#### Developer Productivity
- **Target:** New contributor productive within 30 minutes
- **Measure:** Time from clone to first successful contribution
- **Baseline:** Current ~15 minutes (simple structure)

#### Package Quality
- **Target:** All packages have >90% test coverage
- **Measure:** Combined coverage reports
- **Baseline:** Current ~85% coverage

### User Experience Metrics

#### Package Discovery
- **Target:** Users find relevant packages within 2 clicks
- **Measure:** Documentation analytics, user feedback
- **Baseline:** Establish baseline after launch

#### Integration Success
- **Target:** >95% successful installations of package combinations
- **Measure:** npm telemetry, issue reports
- **Baseline:** Track from v0.4.0 launch

### Community Metrics

#### Contribution Rate
- **Target:** Maintain or increase contribution velocity
- **Measure:** PR rate, issue resolution time
- **Baseline:** Current ~15 PRs/month

#### Package Adoption
- **Target:** Each package gains independent usage
- **Measure:** npm download statistics
- **Baseline:** Current validator downloads ~100/week

---

## Future Considerations

### Potential Evolutions

#### Selective Repository Splitting
If specific packages grow large enough to warrant their own repositories:
- **Candidates:** Large applications (VS Code extension, analytics platform)
- **Criteria:** >50k lines of code, independent release cycles, different contributor bases
- **Process:** Maintain in monorepo until criteria met, then extract with preserved history

#### Language Diversification
For non-TypeScript/JavaScript packages:
- **R packages:** May need separate repository for CRAN compliance
- **Python packages:** Consider separate repository for PyPI publishing
- **Rust tools:** May benefit from Cargo workspace in separate repository

#### Enterprise Offerings
- **Private packages:** Additional packages for enterprise features
- **Support tools:** Internal tooling for customer support
- **Cloud services:** API packages for hosted services

### Review Schedule

#### Monthly Reviews (First 6 Months)
- Build performance metrics
- Developer feedback collection
- Package usage analytics
- Issue and PR velocity

#### Quarterly Strategic Reviews
- Repository structure effectiveness
- Package boundary evaluation
- Tooling stack assessment
- Community feedback integration

#### Annual Architecture Review
- Full evaluation of monorepo vs. alternatives
- Technology stack evolution
- Long-term scalability assessment
- Industry best practice alignment

---

## Conclusion

The Enhanced Monorepo with Workspaces approach provides the optimal balance of developer experience, maintainability, and scalability for the xats project's current needs and 5-year roadmap. This structure supports atomic schema-tooling evolution while providing the flexibility to grow our ecosystem effectively.

The implementation plan is conservative and includes rollback options to minimize risk. Success metrics ensure we can objectively evaluate the effectiveness of this approach and make adjustments as needed.

**Next Steps:**
1. Begin Phase 1 implementation immediately
2. Weekly progress reviews during migration
3. Full evaluation at 4-week milestone
4. Adjust approach based on lessons learned

This recommendation reflects the unanimous consensus of the xats Standards Board and aligns with industry best practices from successful open-source projects.