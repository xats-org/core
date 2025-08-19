#!/bin/bash
# Script to set up branch protection rules for xats version branches
# Usage: ./setup-branch-protection.sh <branch-name>

set -e

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if branch name is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Branch name required${NC}"
    echo "Usage: $0 <branch-name>"
    echo "Example: $0 v0.4.0"
    exit 1
fi

BRANCH_NAME="$1"
REPO="xats-org/core"

echo -e "${YELLOW}Setting up branch protection for: ${BRANCH_NAME}${NC}"

# Define the required status checks
# These match the actual job names from .github/workflows/ci.yml
REQUIRED_CHECKS='[
  "Lint",
  "Test on Node.js 20"
]'

# Additional checks for main branch (comprehensive)
MAIN_CHECKS='[
  "Lint",
  "Test on Node.js 18",
  "Test on Node.js 20", 
  "Test on Node.js 22",
  "Security Audit",
  "Validate JSON Schema",
  "Validate Example Documents",
  "Build and Package",
  "Integration Tests"
]'

# Determine which checks to use
if [ "$BRANCH_NAME" == "main" ]; then
    CHECKS="$MAIN_CHECKS"
    echo "Using comprehensive checks for main branch"
else
    CHECKS="$REQUIRED_CHECKS"
    echo "Using standard checks for version branch"
fi

# Create the protection rules JSON
PROTECTION_JSON=$(cat <<EOF
{
  "required_status_checks": {
    "strict": false,
    "contexts": $CHECKS
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "require_last_push_approval": false
  },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": false,
  "lock_branch": false,
  "allow_fork_syncing": false
}
EOF
)

# Apply branch protection
echo "Applying branch protection rules..."
if gh api \
    --method PUT \
    "repos/${REPO}/branches/${BRANCH_NAME}/protection" \
    --input - <<< "$PROTECTION_JSON" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Branch protection successfully applied to ${BRANCH_NAME}${NC}"
    
    # Display the applied rules
    echo ""
    echo "Applied rules:"
    echo "- Required status checks: $(echo "$CHECKS" | jq -r '.[]' | tr '\n' ',' | sed 's/,$//')"
    echo "- Require PR reviews: Yes (1 approval required)"
    echo "- Dismiss stale reviews: Yes"
    echo "- Prevent force pushes: Yes"
    echo "- Prevent branch deletion: Yes"
else
    echo -e "${RED}✗ Failed to apply branch protection${NC}"
    echo "You may need to authenticate: gh auth login"
    exit 1
fi

# Verify the protection was applied
echo ""
echo "Verifying branch protection..."
if gh api "repos/${REPO}/branches/${BRANCH_NAME}/protection" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Branch protection verified${NC}"
    
    # Show current status checks
    echo ""
    echo "Current required status checks:"
    gh api "repos/${REPO}/branches/${BRANCH_NAME}/protection/required_status_checks" 2>/dev/null | \
        jq -r '.contexts[]' | sed 's/^/  - /'
else
    echo -e "${YELLOW}⚠ Could not verify branch protection${NC}"
fi

echo ""
echo -e "${GREEN}Branch protection setup complete!${NC}"