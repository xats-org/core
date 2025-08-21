#!/bin/bash

# Script to close all Dependabot PRs
# These will be replaced by grouped PRs from the new configuration

echo "Closing all Dependabot PRs..."

# Get all open Dependabot PRs
PR_NUMBERS=$(gh pr list --author "app/dependabot" --state open --json number --jq '.[].number')

if [ -z "$PR_NUMBERS" ]; then
    echo "No open Dependabot PRs found."
    exit 0
fi

echo "Found the following Dependabot PRs: $PR_NUMBERS"
echo ""

# Count total
TOTAL=$(echo "$PR_NUMBERS" | wc -w | xargs)
echo "Total PRs to close: $TOTAL"
echo ""

# Ask for confirmation
read -p "Are you sure you want to close all $TOTAL Dependabot PRs? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Close each PR with a comment
    for PR_NUM in $PR_NUMBERS; do
        echo "Closing PR #$PR_NUM..."
        gh pr close $PR_NUM --comment "Closing this PR as we're consolidating Dependabot updates. A new grouped update will be created for all dependencies."
    done
    echo ""
    echo "✅ Closed $TOTAL Dependabot PRs"
else
    echo "❌ Cancelled - no PRs were closed"
fi