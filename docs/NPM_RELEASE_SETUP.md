# NPM Release Configuration Guide

This guide explains how to configure and publish the xats packages to npm.

## Prerequisites

- npm account with publish permissions for `@xats` organization
- npm authentication token (you mentioned you have a key)
- pnpm installed (`pnpm@10.15.0` as specified in package.json)

## 1. NPM Authentication Setup

### Option A: Using npm login (Interactive)
```bash
npm login
# Enter your npm username, password, and email
# This will store credentials in ~/.npmrc
```

### Option B: Using npm token (Automated/CI)
```bash
# Set your npm token (replace YOUR_NPM_TOKEN with your actual token)
npm config set //registry.npmjs.org/:_authToken YOUR_NPM_TOKEN

# Or add directly to ~/.npmrc
echo "//registry.npmjs.org/:_authToken=YOUR_NPM_TOKEN" >> ~/.npmrc
```

### Option C: Using .env file (Local Development)
Create a `.env` file in the project root:
```bash
NPM_TOKEN=your_npm_token_here
```

Then add to your `.npmrc`:
```bash
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

## 2. Project Configuration

The project is already configured for npm releases with:

### Monorepo Structure
- Root package is private (`"private": true` in root package.json)
- Individual packages in `/packages/*` are publishable
- Using Changesets for version management

### Package Configuration
Each publishable package has:
```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

### Changesets Configuration
Located in `.changeset/config.json`:
- Linked packages: All `@xats/*` packages version together
- Access: Public
- Base branch: `v0.4.0`

## 3. Publishing Workflow

### Step 1: Create a Changeset
When you make changes that should trigger a release:
```bash
# Create a new changeset
pnpm changeset

# Or use the shorthand
pnpm changeset:add
```

Follow the prompts to:
1. Select which packages have changed
2. Choose the version bump type (patch/minor/major)
3. Write a description of the changes

### Step 2: Version Packages
```bash
# Update package versions based on changesets
pnpm changeset:version

# This will:
# - Update package.json versions
# - Update internal dependencies
# - Generate CHANGELOG.md entries
# - Delete processed changesets
```

### Step 3: Build and Test
```bash
# Build all packages
pnpm build

# Run tests
pnpm test:all

# Run validation
pnpm validate
```

### Step 4: Publish to NPM
```bash
# Publish all changed packages
pnpm changeset:publish

# Or use the release script
pnpm release
```

## 4. Release Scripts

The project includes release scripts for different version types:

```bash
# Patch release (0.4.0 -> 0.4.1)
pnpm release:patch

# Minor release (0.4.0 -> 0.5.0)
pnpm release:minor

# Major release (0.4.0 -> 1.0.0)
pnpm release:major
```

## 5. Package-Specific Publishing

If you need to publish a specific package:

```bash
# Navigate to the package
cd packages/schema

# Ensure it's built
pnpm build

# Publish
npm publish --access public
```

## 6. Verify Publication

After publishing, verify your packages:

```bash
# Check package on npm
npm view @xats/schema

# Install in a test project
npm install @xats/schema @xats/validator @xats/types
```

## 7. Troubleshooting

### Authentication Issues
```bash
# Check current npm user
npm whoami

# Verify authentication
npm ping
```

### Permission Issues
- Ensure you're a member of the `@xats` organization on npm
- Check organization settings at https://www.npmjs.com/org/xats

### Build Issues
```bash
# Clean and rebuild
pnpm clean:all
pnpm install
pnpm build
```

### Changeset Issues
```bash
# Check changeset status
pnpm changeset:status

# Reset changesets (careful!)
rm -rf .changeset/*.md
```

## 8. CI/CD Integration

For GitHub Actions, add NPM_TOKEN to repository secrets:
1. Go to Settings → Secrets and variables → Actions
2. Add new repository secret: `NPM_TOKEN`
3. Use in workflow:

```yaml
- name: Setup NPM
  run: echo "//registry.npmjs.org/:_authToken=${{ secrets.NPM_TOKEN }}" > ~/.npmrc

- name: Publish packages
  run: pnpm changeset:publish
```

## 9. Pre-release Versions

For alpha/beta releases:

```bash
# Create pre-release changeset
pnpm changeset pre enter alpha

# Version packages
pnpm changeset:version

# Publish pre-release
pnpm changeset:publish

# Exit pre-release mode
pnpm changeset pre exit
```

## 10. Important Notes

- **Never commit** `.npmrc` with tokens to version control
- **Always test** in a local npm registry (like Verdaccio) before publishing
- **Use changesets** for all version updates to maintain consistency
- **Tag releases** in git after publishing:
  ```bash
  git tag v0.4.0
  git push origin v0.4.0
  ```

## Quick Start Checklist

- [ ] Set up npm authentication with your token
- [ ] Verify authentication: `npm whoami`
- [ ] Create changeset: `pnpm changeset`
- [ ] Version packages: `pnpm changeset:version`
- [ ] Build project: `pnpm build`
- [ ] Run tests: `pnpm test:all`
- [ ] Publish: `pnpm changeset:publish`
- [ ] Create git tag and push