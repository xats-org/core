#!/bin/bash

# CI Fix PR Command - Automatically fixes CI failures for a given PR
# Usage: ci-fix-pr.sh <PR_NUMBER>

set -e

PR_NUMBER=$1
if [ -z "$PR_NUMBER" ]; then
    echo "Usage: $0 <PR_NUMBER>"
    exit 1
fi

echo "🔧 Starting CI Fix for PR #$PR_NUMBER"
echo "================================================"

# Get PR details and branch name
echo "📊 Fetching PR details..."
PR_INFO=$(gh pr view $PR_NUMBER --json headRefName,state,url)
BRANCH_NAME=$(echo "$PR_INFO" | jq -r '.headRefName')
PR_URL=$(echo "$PR_INFO" | jq -r '.url')

echo "📌 PR: $PR_URL"
echo "🌿 Branch: $BRANCH_NAME"

# Checkout the PR branch
echo "🔄 Checking out branch $BRANCH_NAME..."
git fetch origin
git checkout $BRANCH_NAME
git pull origin $BRANCH_NAME

# Create a task file for tracking
TASK_FILE="/tmp/ci-fix-pr-$PR_NUMBER.md"
echo "# CI Fix Tasks for PR #$PR_NUMBER" > $TASK_FILE
echo "Branch: $BRANCH_NAME" >> $TASK_FILE
echo "Started: $(date)" >> $TASK_FILE
echo "" >> $TASK_FILE

# Function to check CI status
check_ci_status() {
    echo "🔍 Checking CI status..."
    gh run list --branch "$BRANCH_NAME" --limit 1 --json status,conclusion,databaseId,name | \
        jq -r '.[] | "\(.databaseId)|\(.name)|\(.status)|\(.conclusion)"'
}

# Function to get failed jobs
get_failed_jobs() {
    local RUN_ID=$1
    gh run view $RUN_ID --json jobs | \
        jq -r '.jobs[] | select(.conclusion == "failure") | .name'
}

# Function to analyze and fix issues
analyze_and_fix() {
    local RUN_ID=$1
    local MAX_RETRIES=10
    local RETRY_COUNT=0
    
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        echo "🔧 Attempt $((RETRY_COUNT + 1)) of $MAX_RETRIES"
        
        # Get latest CI run if not provided
        if [ -z "$RUN_ID" ]; then
            RUN_ID=$(gh run list --branch "$BRANCH_NAME" --limit 1 --json databaseId | jq -r '.[0].databaseId')
        fi
        
        echo "📋 Analyzing CI run $RUN_ID..."
        
        # Get failed jobs
        FAILED_JOBS=$(get_failed_jobs $RUN_ID)
        
        if [ -z "$FAILED_JOBS" ]; then
            echo "✅ No failed jobs found!"
            return 0
        fi
        
        echo "❌ Failed jobs:"
        echo "$FAILED_JOBS"
        
        # Get failure logs
        echo "📜 Fetching failure logs..."
        FAILURE_LOGS=$(gh run view $RUN_ID --log-failed 2>/dev/null | head -500 || echo "")
        
        # Save logs for analysis
        echo "$FAILURE_LOGS" > /tmp/ci-failures-$RUN_ID.log
        
        # Create fix prompt
        cat > /tmp/fix-prompt.txt << EOF
You are an expert CI/CD engineer. Fix the following CI failures in PR #$PR_NUMBER.

Branch: $BRANCH_NAME
Working Directory: $(pwd)

Failed Jobs:
$FAILED_JOBS

Failure Logs (first 500 lines):
$FAILURE_LOGS

Instructions:
1. Analyze the error messages carefully
2. Identify the root cause of each failure
3. Make the necessary code changes to fix the issues
4. Test locally when possible (pnpm run build, pnpm run lint, pnpm run test)
5. Commit and push the fixes with clear commit messages

IMPORTANT:
- Fix ALL issues found in the logs
- Use proper TypeScript types instead of 'any' where possible
- Ensure all imports are correct
- Fix any ESLint or prettier issues
- Resolve any module resolution problems
- Address any test failures

After making fixes, test locally with:
- pnpm run build
- pnpm run lint
- pnpm run test

Commit your changes and provide a summary of what was fixed.
EOF
        
        echo "🤖 Invoking Claude Opus to fix issues..."
        
        # Invoke Claude to fix the issues
        claude --model claude-opus-4-1-20250805 --no-stream << 'CLAUDE_EOF'
I need to fix CI failures. Here's the context:

$(cat /tmp/fix-prompt.txt)

Please analyze and fix all the issues. Use the appropriate tools to:
1. Read the relevant files
2. Fix the issues
3. Test locally
4. Commit the changes

Be thorough and fix ALL issues found.
CLAUDE_EOF
        
        # Push the changes
        echo "📤 Pushing fixes..."
        git push origin $BRANCH_NAME
        
        # Wait for CI to run
        echo "⏳ Waiting 30 seconds for CI to start..."
        sleep 30
        
        # Check new CI status
        echo "🔄 Checking new CI status..."
        NEW_RUN_ID=$(gh run list --branch "$BRANCH_NAME" --limit 1 --json databaseId | jq -r '.[0].databaseId')
        
        # Wait for CI to complete (max 10 minutes)
        WAIT_TIME=0
        MAX_WAIT=600
        while [ $WAIT_TIME -lt $MAX_WAIT ]; do
            STATUS=$(gh run view $NEW_RUN_ID --json status | jq -r '.status')
            CONCLUSION=$(gh run view $NEW_RUN_ID --json conclusion | jq -r '.conclusion')
            
            if [ "$STATUS" = "completed" ]; then
                if [ "$CONCLUSION" = "success" ]; then
                    echo "✅ CI passed!"
                    return 0
                elif [ "$CONCLUSION" = "failure" ]; then
                    echo "❌ CI still failing, will retry..."
                    RUN_ID=$NEW_RUN_ID
                    break
                fi
            fi
            
            echo "⏳ CI status: $STATUS (waited ${WAIT_TIME}s)..."
            sleep 10
            WAIT_TIME=$((WAIT_TIME + 10))
        done
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
    done
    
    echo "❌ Failed to fix CI after $MAX_RETRIES attempts"
    return 1
}

# Main execution
echo "🚀 Starting CI fix process..."

# Initial CI check
INITIAL_STATUS=$(check_ci_status)
echo "📊 Initial CI status: $INITIAL_STATUS"

# Extract run ID from status
RUN_ID=$(echo "$INITIAL_STATUS" | cut -d'|' -f1)

# If CI is failing, start fix process
if echo "$INITIAL_STATUS" | grep -q "failure"; then
    echo "🔧 CI is failing, starting fix process..."
    analyze_and_fix $RUN_ID
else
    echo "✅ CI is already passing!"
fi

# Final status check
echo ""
echo "📊 Final CI Status:"
check_ci_status

echo ""
echo "✅ CI Fix process completed for PR #$PR_NUMBER"
echo "Completed: $(date)" >> $TASK_FILE