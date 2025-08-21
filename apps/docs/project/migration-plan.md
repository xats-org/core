# Documentation Migration Plan

This document outlines the migration from the legacy `/docs` directory to the new VitePress-based documentation site in `/apps/docs`.

## Overview

The xats project is migrating from a simple Markdown documentation structure to a modern VitePress-powered documentation site. This migration provides:

- **Better Organization** - Structured navigation and cross-linking
- **Enhanced Search** - Full-text search across all documentation
- **Improved UX** - Modern, responsive design with dark mode
- **Package Integration** - Dedicated documentation for each @xats/* package
- **Version Support** - Proper versioning and release documentation
- **Developer Experience** - Hot reloading, TypeScript support, and component system

## Migration Scope

### What's Moving

| Current Location | New Location | Status | Notes |
|------------------|--------------|--------|-------|
| `/docs/index.md` | `/apps/docs/index.md` | ✅ Migrated | Converted to VitePress home layout |
| `/docs/QUICKSTART_TUTORIAL.md` | `/apps/docs/getting-started/quickstart.md` | ✅ Migrated | Updated with new package imports |
| `/docs/ARCHITECTURE.md` | `/apps/docs/project/architecture.md` | 📋 Planned | Needs import updates |
| `/docs/ROADMAP.md` | `/apps/docs/project/roadmap.md` | 📋 Planned | Needs import updates |
| `/docs/guides/` | `/apps/docs/guides/` | 📋 Planned | Update all @xats/* imports |
| `/docs/reference/` | `/apps/docs/reference/` | 📋 Planned | Restructure for new package structure |
| `/docs/integration/` | `/apps/docs/guides/integration/` | 📋 Planned | Reorganize under guides |
| `/docs/specs/` | `/apps/docs/reference/` | 📋 Planned | Move technical specs to reference |

### New Content

| Path | Description | Status |
|------|-------------|--------|
| `/apps/docs/packages/` | Package-specific documentation | 🚧 In Progress |
| `/apps/docs/getting-started/installation.md` | Comprehensive installation guide | ✅ Complete |
| `/apps/docs/getting-started/concepts.md` | Core concepts explanation | 📋 Planned |
| `/apps/docs/getting-started/first-document.md` | Step-by-step tutorial | 📋 Planned |

## Migration Strategy

### Phase 1: Core Infrastructure ✅
- [x] Set up VitePress in `/apps/docs`
- [x] Create basic configuration and navigation
- [x] Design new home page with hero section
- [x] Set up build pipeline in Turbo

### Phase 2: Package Documentation 🚧
- [x] Create package overview page
- [x] Document `@xats/schema` package
- [x] Document `@xats/validator` package
- [ ] Document remaining packages:
  - [ ] `@xats/types`
  - [ ] `@xats/cli`
  - [ ] `@xats/renderer`
  - [ ] `@xats/mcp-server`
  - [ ] `@xats/utils`
  - [ ] `@xats/examples`

### Phase 3: Getting Started Content 🚧
- [x] Quickstart guide with v0.4.0 examples
- [x] Installation guide
- [ ] Core concepts explanation
- [ ] First document tutorial
- [ ] Migration from old versions

### Phase 4: Content Migration 📋
- [ ] Migrate and update guides
- [ ] Migrate reference documentation
- [ ] Migrate integration guides
- [ ] Update all code examples

### Phase 5: Legacy Cleanup 📋
- [ ] Set up redirects from old URLs
- [ ] Update external links
- [ ] Archive legacy documentation
- [ ] Update CI/CD pipelines

## Import Updates Required

All documentation will need updates to reflect the new package structure:

### Before (v0.3.0 and earlier)
```javascript
// Old imports - need updating
import { validateXatsDocument } from 'xats'
import schema from 'xats/schema'
const { XatsDocument } = require('xats')
```

### After (v0.4.0+)
```javascript
// New imports - monorepo packages
import { validateXatsDocument } from '@xats/validator'
import { getSchema } from '@xats/schema'
import type { XatsDocument } from '@xats/types'
```

### CLI Commands
```bash
# Old
xats-cli validate document.json

# New
xats validate document.json
```

## File Mapping

### Guides Migration

| Legacy File | New Location | Updates Needed |
|-------------|--------------|----------------|
| `guides/authoring-guide.md` | `guides/authoring.md` | Update imports, add package examples |
| `guides/migration-guide.md` | `guides/migration.md` | Add v0.4.0 migration section |
| `guides/accessibility-guide.md` | `guides/accessibility.md` | Update with new validation examples |
| `guides/extension-guide.md` | `guides/extensions.md` | Update with new package structure |
| `guides/renderer-guide.md` | `guides/renderer.md` | Rewrite for `@xats/renderer` |

### Reference Migration

| Legacy File | New Location | Updates Needed |
|-------------|--------------|----------------|
| `reference/index.md` | `reference/schema/index.md` | Focus on schema reference |
| `reference/*.md` | `reference/schema/*.md` | Update with TypeScript types |
| N/A | `reference/api/validation.md` | New API documentation |
| N/A | `reference/api/rendering.md` | New API documentation |

### Integration Migration

| Legacy File | New Location | Updates Needed |
|-------------|--------------|----------------|
| `integration/lti-1.3-integration-guide.md` | `guides/integration/lti.md` | Update imports and examples |
| N/A | `guides/integration/lms.md` | New general LMS guide |
| N/A | `guides/integration/ai.md` | New AI integration guide |

## URL Structure Changes

### Old URLs (legacy)
```
/docs/QUICKSTART_TUTORIAL.md
/docs/guides/authoring-guide.md
/docs/reference/index.md
```

### New URLs (VitePress)
```
/docs/getting-started/quickstart
/docs/guides/authoring
/docs/reference/schema/
```

### Redirect Plan
We'll need to set up redirects for common URLs:

```nginx
# Example redirect configuration
/docs/QUICKSTART_TUTORIAL.md -> /docs/getting-started/quickstart
/docs/guides/authoring-guide.md -> /docs/guides/authoring
/docs/reference/index.md -> /docs/reference/schema/
```

## Content Standards

### Code Examples
All code examples must use the new package structure:

```typescript
// ✅ Correct - use new packages
import { validateXatsDocument } from '@xats/validator'
import type { XatsDocument } from '@xats/types'

// ❌ Incorrect - old imports
import { validateXatsDocument } from 'xats'
```

### Cross-References
Use VitePress-style internal links:

```markdown
<!-- ✅ Correct - relative links -->
[Validation Guide](../packages/validator/)
[Getting Started](./quickstart.md)

<!-- ❌ Incorrect - absolute paths -->
[Validation Guide](/docs/packages/validator/index.md)
```

### Package Documentation Format
Each package should follow this structure:

```
packages/[package-name]/
├── index.md          # Main package documentation
├── api.md            # API reference (if applicable)
├── examples.md       # Usage examples
└── migration.md      # Migration notes (if applicable)
```

## Timeline

### Sprint 1 (Current) 🚧
- Complete package documentation for all packages
- Finish getting-started section
- Set up proper navigation structure

### Sprint 2 📋
- Migrate all guides with updated imports
- Migrate reference documentation
- Create new integration guides

### Sprint 3 📋
- Set up redirects and deployment
- Update external documentation links
- Archive legacy documentation

### Sprint 4 📋
- Polish and user testing
- Performance optimization
- Search optimization

## Success Criteria

### Migration Complete When:
- [ ] All existing documentation migrated
- [ ] All code examples use v0.4.0 packages
- [ ] Navigation is complete and intuitive
- [ ] Search works across all content
- [ ] External links updated
- [ ] Redirects configured
- [ ] Performance meets standards (Lighthouse 90+)

### Quality Standards:
- [ ] All internal links work
- [ ] All code examples are tested
- [ ] Consistent formatting and style
- [ ] Mobile-responsive design
- [ ] Dark mode support
- [ ] Accessibility compliance (WCAG 2.1 AA)

## Resource Requirements

### Development
- **Estimated effort**: 40-60 hours
- **Skills needed**: VitePress, Markdown, TypeScript
- **Tools required**: Node.js 18+, VitePress, text editor

### Content Review
- **Technical review**: All migrated content
- **Link validation**: Automated and manual testing
- **User testing**: Navigation and search functionality

## Risk Mitigation

### Potential Issues:
1. **Broken Links** - Comprehensive link checking during migration
2. **SEO Impact** - Proper redirects and sitemap updates
3. **User Confusion** - Clear migration announcements
4. **Content Gaps** - Systematic content audit

### Mitigation Strategies:
1. **Automated Testing** - Link checking in CI/CD
2. **Staged Deployment** - Gradual rollout with feedback
3. **Documentation** - Clear migration guides for users
4. **Rollback Plan** - Keep legacy docs available during transition

## Getting Help

For questions about the migration:

- **Technical Issues**: [GitHub Issues](https://github.com/xats-org/core/issues)
- **Content Questions**: [GitHub Discussions](https://github.com/xats-org/core/discussions)
- **Migration Support**: [migration@xats.org](mailto:migration@xats.org)

---

*This migration plan will be updated as work progresses. Last updated: 2024-12-20*