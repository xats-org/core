# Issue #105: Repository Cleanup Plan

## Current State Analysis

### ✅ Already Migrated to Packages
- `/schemas/` → `packages/schema/schemas/` ✅
- Source code → Various packages under `/packages/` ✅
- Build system → Turborepo with pnpm workspaces ✅

### 🔄 Directories Requiring Action

#### 1. `/docs/` Directory (10 files)
**Current Location**: Root level
**Target**: `apps/docs/` (Issue #86)
**Action**: MIGRATE
```bash
# Create apps/docs if not exists
mkdir -p apps/docs
# Move documentation
mv docs/* apps/docs/
# Remove empty directory
rmdir docs
```

#### 2. `/examples/` Directory (1 subdirectory)
**Current Location**: Root level with `/invalid/` subdirectory
**Target**: Already exists in `packages/examples/`
**Action**: VERIFY & REMOVE
```bash
# Check if content is already in packages/examples
diff -r examples/ packages/examples/examples/
# If duplicated, remove root level
rm -rf examples/
```

#### 3. `/extensions/` Directory (6+ subdirectories)
**Current Location**: Root level
**Target**: Create `packages/extensions/` or keep at root
**Action**: EVALUATE
- Contains extension definitions and schemas
- May be better as a separate package or kept at root for community contributions

#### 4. `/tests/` Directory
**Current Location**: Root level with e2e and integration subdirectories
**Target**: Already migrated
**Action**: REMOVE
```bash
# Verify tests exist in packages
ls tests/e2e/
ls tests/integration/
# These appear to be placeholder tests, safe to remove
rm -rf tests/
```

## URI Updates Required

### Files to Update (129 files contain xats.org URIs)
1. **Schema files** in `packages/schema/schemas/`
2. **Vocabulary files** in `packages/vocabularies/src/`
3. **Example documents** in `packages/examples/`
4. **TypeScript definitions** in various packages
5. **Documentation** files

### URI Migration Strategy
Since xats is pre-production, we'll update all URIs:

**Current Pattern**:
```
https://xats.org/core/blocks/[type]
https://xats.org/core/placeholders/[type]
```

**New Pattern** (aligned with package structure):
```
https://xats.org/vocabularies/blocks/[type]
https://xats.org/vocabularies/placeholders/[type]
```

## Implementation Steps

### Phase 1: Quick Wins (Immediate)
1. ✅ Remove `/tests/` directory (placeholder files only)
2. ✅ Verify and remove `/examples/` if duplicated
3. ✅ Update cleanup script or remove if obsolete

### Phase 2: Documentation Migration (Week 1)
1. Create `apps/docs/` structure
2. Migrate all documentation from `/docs/`
3. Update all internal links and references
4. Update build scripts to use new location

### Phase 3: Extensions Decision (Week 1)
1. Evaluate whether extensions should be:
   - A package (`packages/extensions/`)
   - Kept at root for community access
   - Moved to a separate repository
2. Implement chosen approach

### Phase 4: URI Standardization (Week 2)
1. Create migration script for URI updates
2. Update all 129 files with new URI structure
3. Run full test suite to verify
4. Update documentation with new URI patterns

### Phase 5: Final Cleanup (Week 3)
1. Remove all empty directories
2. Update `.gitignore` for new structure
3. Update all CI/CD references
4. Final validation of all packages

## Commands for Safe Migration

```bash
# Phase 1: Quick cleanup
rm -rf tests/  # Only placeholder tests

# Phase 2: Documentation migration
mkdir -p apps/docs
git mv docs/* apps/docs/
rmdir docs

# Phase 3: Extensions (if moving to packages)
mkdir -p packages/extensions
git mv extensions/* packages/extensions/
rmdir extensions

# Phase 4: URI updates (use automated script)
# Create a script to update all URIs consistently

# Phase 5: Final cleanup
find . -type d -empty -delete  # Remove empty directories
```

## Validation Checklist

- [ ] All packages build successfully: `pnpm run build`
- [ ] All tests pass: `pnpm run test`
- [ ] Documentation builds: `pnpm --filter docs build`
- [ ] No broken imports: `pnpm run typecheck`
- [ ] URIs are consistent across codebase
- [ ] CI/CD pipelines pass
- [ ] No legacy directories remain (except intentional)

## Risk Mitigation

1. **Create backup branch** before major changes
2. **Use git mv** to preserve history
3. **Test each phase** before proceeding
4. **Document all changes** in CHANGELOG
5. **Coordinate with team** on timing

## Success Criteria

- Clean monorepo structure following best practices
- All content properly organized in packages/apps
- Consistent URI structure throughout
- No broken references or imports
- Complete documentation of new structure
- All tests and builds passing

## Timeline

- **Today**: Phase 1 (Quick wins)
- **Week 1**: Phases 2-3 (Documentation & Extensions)
- **Week 2**: Phase 4 (URI standardization)
- **Week 3**: Phase 5 (Final cleanup & validation)
- **Target**: Complete before v0.4.0 release (2026-03-31)