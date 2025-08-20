#!/bin/bash

# xats Monorepo Cleanup Script
# This script performs the comprehensive cleanup of legacy directories
# after successful monorepo migration to packages/ architecture

set -e

echo "🧹 xats Monorepo Cleanup Script v0.4.0"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Dry run mode flag
DRY_RUN=${1:-false}

if [ "$DRY_RUN" = "--dry-run" ]; then
    print_warning "Running in DRY RUN mode - no actual changes will be made"
    echo ""
fi

# Function to execute commands (respects dry run)
execute() {
    if [ "$DRY_RUN" = "--dry-run" ]; then
        echo -e "${YELLOW}[DRY RUN]${NC} $@"
    else
        "$@"
    fi
}

# Function to create directory if it doesn't exist
ensure_dir() {
    if [ ! -d "$1" ]; then
        print_info "Creating directory: $1"
        execute mkdir -p "$1"
    fi
}

# Function to move files/directories
move_if_exists() {
    if [ -e "$1" ]; then
        print_info "Moving $1 to $2"
        execute mv "$1" "$2"
    else
        print_warning "$1 does not exist, skipping"
    fi
}

# Function to remove files/directories
remove_if_exists() {
    if [ -e "$1" ]; then
        print_warning "Removing $1"
        execute rm -rf "$1"
    fi
}

echo "Phase 1: Creating new package structure"
echo "======================================="

# Create @xats/vocabularies package for vocabulary schemas
ensure_dir "packages/vocabularies"
ensure_dir "packages/vocabularies/src"
ensure_dir "packages/vocabularies/src/blocks"
ensure_dir "packages/vocabularies/src/hints"
ensure_dir "packages/vocabularies/src/pathways"
ensure_dir "packages/vocabularies/src/triggers"
ensure_dir "packages/vocabularies/src/placeholders"
ensure_dir "packages/vocabularies/src/resources"

# Create @xats/extensions package
ensure_dir "packages/extensions"
ensure_dir "packages/extensions/src"

echo ""
echo "Phase 2: Migrating vocabulary directories to @xats/vocabularies"
echo "=============================================================="

# Migrate vocabulary directories
if [ -d "blocks" ]; then
    print_info "Migrating blocks vocabulary..."
    execute cp -r blocks/* packages/vocabularies/src/blocks/ 2>/dev/null || true
    print_success "Blocks migrated"
fi

if [ -d "hints" ]; then
    print_info "Migrating hints vocabulary..."
    execute cp -r hints/* packages/vocabularies/src/hints/ 2>/dev/null || true
    print_success "Hints migrated"
fi

if [ -d "pathways" ]; then
    print_info "Migrating pathways vocabulary..."
    execute cp -r pathways/* packages/vocabularies/src/pathways/ 2>/dev/null || true
    print_success "Pathways migrated"
fi

if [ -d "triggers" ]; then
    print_info "Migrating triggers vocabulary..."
    execute cp -r triggers/* packages/vocabularies/src/triggers/ 2>/dev/null || true
    print_success "Triggers migrated"
fi

if [ -d "placeholders" ]; then
    print_info "Migrating placeholders vocabulary..."
    execute cp -r placeholders/* packages/vocabularies/src/placeholders/ 2>/dev/null || true
    print_success "Placeholders migrated"
fi

if [ -d "resources" ]; then
    print_info "Migrating resources vocabulary..."
    execute cp -r resources/* packages/vocabularies/src/resources/ 2>/dev/null || true
    print_success "Resources migrated"
fi

echo ""
echo "Phase 3: Migrating extensions"
echo "============================="

if [ -d "extensions" ]; then
    print_info "Migrating extensions..."
    execute cp -r extensions/* packages/extensions/src/ 2>/dev/null || true
    print_success "Extensions migrated"
fi

echo ""
echo "Phase 4: Archiving legacy directories"
echo "====================================="

# Create archive directory
ensure_dir ".archive/v0.3.0-legacy"

# Archive legacy directories before removal
for dir in blocks hints pathways triggers placeholders resources extensions src test bin; do
    if [ -d "$dir" ]; then
        print_info "Archiving $dir..."
        execute cp -r "$dir" ".archive/v0.3.0-legacy/" 2>/dev/null || true
    fi
done

echo ""
echo "Phase 5: Removing legacy directories"
echo "===================================="

if [ "$DRY_RUN" != "--dry-run" ]; then
    print_warning "Removing legacy directories..."
    
    # Remove vocabulary directories (now in packages/vocabularies)
    remove_if_exists "blocks"
    remove_if_exists "hints"
    remove_if_exists "pathways"
    remove_if_exists "triggers"
    remove_if_exists "placeholders"
    remove_if_exists "resources"
    
    # Remove extensions (now in packages/extensions)
    remove_if_exists "extensions"
    
    # Remove legacy source and test directories
    remove_if_exists "src"
    remove_if_exists "test"
    remove_if_exists "bin"
    
    # Remove build artifacts
    remove_if_exists "dist"
    remove_if_exists "coverage"
    
    print_success "Legacy directories removed"
else
    print_warning "Skipping removal in dry run mode"
fi

echo ""
echo "Phase 6: Updating .gitignore"
echo "============================"

if [ "$DRY_RUN" != "--dry-run" ]; then
    print_info "Updating .gitignore..."
    
    # Check if patterns already exist before adding
    if ! grep -q "# Monorepo specific" .gitignore 2>/dev/null; then
        cat >> .gitignore << 'EOF'

# Monorepo specific
packages/*/dist
packages/*/coverage
packages/*/.turbo
apps/*/dist
apps/*/.next
apps/*/.turbo

# Archive directory
.archive/

# Turborepo
.turbo

# Changesets
.changeset/*.md
!.changeset/README.md
EOF
        print_success ".gitignore updated"
    else
        print_info ".gitignore already contains monorepo patterns"
    fi
fi

echo ""
echo "Phase 7: Summary"
echo "================"

if [ "$DRY_RUN" = "--dry-run" ]; then
    print_warning "DRY RUN COMPLETE - No actual changes were made"
    echo ""
    echo "To perform the actual cleanup, run:"
    echo "  ./scripts/cleanup-monorepo.sh"
else
    print_success "Monorepo cleanup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Review the changes with: git status"
    echo "2. Install dependencies: pnpm install"
    echo "3. Build all packages: pnpm build"
    echo "4. Run tests: pnpm test"
    echo "5. Commit the changes"
fi

echo ""
echo "📦 New package structure:"
echo "  - @xats/schema       - Core JSON Schema definitions"
echo "  - @xats/validator    - Validation logic"
echo "  - @xats/types        - TypeScript types"
echo "  - @xats/cli          - Command-line interface"
echo "  - @xats/renderer     - Rendering framework"
echo "  - @xats/utils        - Shared utilities"
echo "  - @xats/examples     - Example documents"
echo "  - @xats/vocabularies - Vocabulary definitions (NEW)"
echo "  - @xats/extensions   - Extension schemas (NEW)"
echo "  - @xats/mcp-server   - MCP server (coming soon)"