#!/bin/bash
#
# Release script for xats-core
# Usage: ./scripts/release.sh [patch|minor|major|<version>]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

success() {
    echo -e "${GREEN}✅ ${1}${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  ${1}${NC}"
}

error() {
    echo -e "${RED}❌ ${1}${NC}"
    exit 1
}

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    error "Must run from project root directory"
fi

# Check if git working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    error "Git working directory is not clean. Please commit or stash changes first."
fi

# Check if we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    warning "You are on branch '$CURRENT_BRANCH', not 'main'"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
info "Current version: $CURRENT_VERSION"

# Determine new version
if [ $# -eq 0 ]; then
    echo "Usage: $0 [patch|minor|major|<version>]"
    echo
    echo "Version bump types:"
    echo "  patch   - Bug fixes (1.0.0 -> 1.0.1)"
    echo "  minor   - New features (1.0.0 -> 1.1.0)"
    echo "  major   - Breaking changes (1.0.0 -> 2.0.0)"
    echo "  <version> - Specific version (e.g., 1.2.3)"
    exit 1
fi

BUMP_TYPE="$1"

# Validate bump type and calculate new version
case $BUMP_TYPE in
    patch|minor|major)
        info "Calculating new $BUMP_TYPE version..."
        NEW_VERSION=$(npm version $BUMP_TYPE --no-git-tag-version --no-commit-hooks)
        NEW_VERSION=${NEW_VERSION#v} # Remove 'v' prefix if added by npm
        ;;
    *)
        # Assume it's a specific version
        NEW_VERSION="$BUMP_TYPE"
        if ! [[ $NEW_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-.*)?$ ]]; then
            error "Invalid version format: $NEW_VERSION"
        fi
        info "Setting specific version: $NEW_VERSION"
        npm version $NEW_VERSION --no-git-tag-version --no-commit-hooks
        ;;
esac

info "New version: $NEW_VERSION"

# Confirm release
echo
warning "This will:"
echo "  1. Run full test suite"
echo "  2. Build the project"
echo "  3. Commit version bump"
echo "  4. Create and push git tag v$NEW_VERSION"
echo "  5. Trigger GitHub Actions release workflow"
echo
read -p "Proceed with release? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    # Revert version change
    git checkout package.json package-lock.json 2>/dev/null || true
    error "Release cancelled"
fi

# Run pre-release checks
info "Running pre-release checks..."

info "Installing dependencies..."
npm ci

info "Running linter..."
npm run lint

info "Running type check..."
npm run typecheck

info "Running tests..."
npm run test:run

info "Building project..."
npm run build

info "Validating examples..."
npm run validate test/fixtures/valid-minimal.json
npm run validate examples/adaptive-pathway-example.json

success "All pre-release checks passed!"

# Commit version bump
info "Committing version bump..."
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION

🚀 Generated with release script

Co-Authored-By: Claude <noreply@anthropic.com>"

# Create and push tag
info "Creating git tag v$NEW_VERSION..."
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION

🚀 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

info "Pushing changes and tag..."
git push origin main
git push origin "v$NEW_VERSION"

success "Release v$NEW_VERSION initiated!"
echo
info "GitHub Actions will now:"
echo "  - Run full CI pipeline"
echo "  - Create GitHub release with generated notes"
echo "  - Publish to npm (if configured)"
echo
info "Monitor progress at: https://github.com/xats-org/core/actions"
info "Release will be available at: https://github.com/xats-org/core/releases/tag/v$NEW_VERSION"