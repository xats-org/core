# Changesets

This repository uses [changesets](https://github.com/changesets/changesets) to manage package versioning and changelog generation.

## Creating a Changeset

When you make changes to any package, you need to create a changeset:

```bash
pnpm changeset:add
```

Follow the prompts to:
1. Select which packages have changed
2. Choose the type of change (major, minor, or patch)
3. Write a description of the changes

## Changeset Types

### Patch Release (x.x.X)
- Bug fixes
- Documentation improvements
- Internal refactoring
- Dependency updates

### Minor Release (x.X.0)
- New features (backward compatible)
- New APIs or functionality
- Deprecations (with migration path)

### Major Release (X.0.0)
- Breaking changes
- Removed features
- Major architectural changes
- Incompatible API changes

## Writing Good Changeset Messages

- Start with an action verb (Add, Fix, Update, Remove, etc.)
- Be specific about what changed
- Mention the affected package if relevant
- Include issue numbers when applicable

### Examples:
```
- Fix validation error for nested content blocks (#123)
- Add support for mathematical expressions in renderer
- Update TypeScript to version 5.3
- Remove deprecated `legacyMode` option
```

## Release Process

### For Maintainers

1. **Create changesets** as you work:
   ```bash
   pnpm changeset:add
   ```

2. **Check changeset status**:
   ```bash
   pnpm changeset:status
   ```

3. **Version packages** (creates PR):
   ```bash
   pnpm changeset:version
   ```

4. **Publish to npm** (after PR merge):
   ```bash
   pnpm changeset:publish
   ```

### Automated Releases

When changes with changesets are pushed to version branches, the GitHub Action will:
1. Create a "Version Packages" PR with updated versions and changelogs
2. When merged, automatically publish packages to npm
3. Create GitHub releases with changelogs

## Package Linking

All `@xats/*` packages are linked, meaning they'll be versioned together when any of them change.

## Questions?

For more information, see:
- [Changesets documentation](https://github.com/changesets/changesets)
- [Contributing guidelines](../CONTRIBUTING.md)