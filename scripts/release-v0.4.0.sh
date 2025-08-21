#!/bin/bash

# xats v0.4.0 Release Script
# This script guides through the v0.4.0 release process

set -e

echo "🚀 xats v0.4.0 Release Process"
echo "================================"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to prompt for confirmation
confirm() {
    read -p "$1 (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Aborted.${NC}"
        exit 1
    fi
}

# Step 1: Verify current branch and status
echo -e "${YELLOW}Step 1: Verifying current branch and status...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "v0.4.0" ]; then
    echo -e "${RED}Error: Not on v0.4.0 branch. Current branch: $CURRENT_BRANCH${NC}"
    exit 1
fi

git status
confirm "Is the working directory clean?"

# Step 2: Run final tests
echo -e "${YELLOW}Step 2: Running final build and tests...${NC}"
pnpm run build
pnpm run test
echo -e "${GREEN}✅ Build and tests successful${NC}"

# Step 3: Check npm authentication
echo -e "${YELLOW}Step 3: Checking npm authentication...${NC}"
if npm whoami 2>/dev/null; then
    echo -e "${GREEN}✅ Authenticated to npm${NC}"
else
    echo -e "${YELLOW}Please login to npm:${NC}"
    npm login
fi

# Step 4: Publish packages
echo -e "${YELLOW}Step 4: Publishing packages to npm...${NC}"
confirm "Ready to publish all packages to npm?"

# Try changesets first
if command -v changeset &> /dev/null; then
    echo "Using changesets to publish..."
    pnpm changeset publish --no-git-tag
else
    echo "Publishing packages manually..."
    for pkg in schema types validator utils cli renderer mcp-server examples vocabularies eslint-config prettier-config vitest-config; do
        echo "Publishing @xats/$pkg..."
        (cd packages/$pkg && npm publish --access public)
    done
fi

echo -e "${GREEN}✅ Packages published to npm${NC}"

# Step 5: Create and push git tag
echo -e "${YELLOW}Step 5: Creating git tag...${NC}"
confirm "Ready to create and push v0.4.0 tag?"

git tag -a v0.4.0 -m "Release v0.4.0: Monorepo Architecture

- Transformed project into modern monorepo with Turborepo
- Published 12 packages under @xats/* scope on npm
- Added comprehensive CLI with validation and rendering
- Established foundation for future development
- 458 tests ensuring reliability"

git push origin v0.4.0
echo -e "${GREEN}✅ Tag v0.4.0 created and pushed${NC}"

# Step 6: Create GitHub release
echo -e "${YELLOW}Step 6: Creating GitHub release...${NC}"
confirm "Ready to create GitHub release?"

gh release create v0.4.0 \
  --title "xats v0.4.0: Monorepo Architecture" \
  --notes-file "docs/releases/RELEASE-NOTES-v0.4.0.md" \
  --latest

echo -e "${GREEN}✅ GitHub release created${NC}"

# Step 7: Create PR to merge to main
echo -e "${YELLOW}Step 7: Creating PR to merge v0.4.0 to main...${NC}"
confirm "Ready to create PR to main?"

gh pr create \
  --base "main" \
  --head "v0.4.0" \
  --title "Release: v0.4.0 - Monorepo Architecture" \
  --milestone "v0.4.0" \
  --body "## Release Summary

Merging v0.4.0 release branch to main after successful npm publication and GitHub release creation.

## Key Changes
- Monorepo architecture with Turborepo
- 12 published packages under @xats/* scope
- Comprehensive CLI with validation and rendering
- Enhanced developer experience with modern tooling
- 458 tests ensuring reliability

## Verification
- ✅ All packages published to npm
- ✅ GitHub release v0.4.0 created
- ✅ All CI checks passing
- ✅ Documentation updated

Closes #93"

echo -e "${GREEN}✅ PR created to merge to main${NC}"

# Step 8: Verification
echo -e "${YELLOW}Step 8: Running verification...${NC}"
echo "Checking npm packages..."
npm view @xats/schema version
npm view @xats/cli version

echo "Checking GitHub release..."
gh release view v0.4.0

echo ""
echo -e "${GREEN}🎉 v0.4.0 Release Process Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review and merge the PR to main"
echo "2. Update local main branch after merge"
echo "3. Close Issue #93"
echo "4. Announce the release to the community"