#!/usr/bin/env node

/**
 * CI Auto-Fix Command
 * Automatically fixes CI failures for a given PR
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let prNumber = null;
let maxRetries = 10;
let waitTime = 600;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--pr' && args[i + 1]) {
    prNumber = args[i + 1];
    i++;
  } else if (args[i] === '--max-retries' && args[i + 1]) {
    maxRetries = parseInt(args[i + 1]);
    i++;
  } else if (args[i] === '--wait-time' && args[i + 1]) {
    waitTime = parseInt(args[i + 1]);
    i++;
  }
}

if (!prNumber) {
  console.error('Usage: ci-auto-fix --pr <PR_NUMBER> [--max-retries <number>] [--wait-time <seconds>]');
  process.exit(1);
}

console.log(`🔧 CI Auto-Fix for PR #${prNumber}`);
console.log('='.repeat(50));

// Helper function to run commands
function runCommand(command, silent = false) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
    return output;
  } catch (error) {
    if (!silent) {
      console.error(`Command failed: ${command}`);
      console.error(error.message);
    }
    return null;
  }
}

// Get PR details
console.log('📊 Fetching PR details...');
const prInfo = JSON.parse(runCommand(`gh pr view ${prNumber} --json headRefName,state,url`, true));
const branchName = prInfo.headRefName;
const prUrl = prInfo.url;

console.log(`📌 PR: ${prUrl}`);
console.log(`🌿 Branch: ${branchName}`);

// Checkout the branch
console.log(`🔄 Checking out branch ${branchName}...`);
runCommand('git fetch origin');
runCommand(`git checkout ${branchName}`);
runCommand(`git pull origin ${branchName}`);

// Function to check CI status
function checkCIStatus() {
  const runs = JSON.parse(runCommand(`gh run list --branch "${branchName}" --limit 1 --json status,conclusion,databaseId,name`, true));
  if (runs.length === 0) return null;
  return runs[0];
}

// Function to get failed jobs
function getFailedJobs(runId) {
  const runData = JSON.parse(runCommand(`gh run view ${runId} --json jobs`, true));
  return runData.jobs.filter(job => job.conclusion === 'failure').map(job => job.name);
}

// Function to get failure logs
function getFailureLogs(runId) {
  const logs = runCommand(`gh run view ${runId} --log-failed 2>/dev/null | head -1000`, true);
  return logs || '';
}

// Main fix loop
async function fixCI() {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    attempts++;
    console.log(`\n🔧 Attempt ${attempts} of ${maxRetries}`);
    
    // Check current CI status
    const ciStatus = checkCIStatus();
    if (!ciStatus) {
      console.log('❌ No CI runs found');
      break;
    }
    
    console.log(`📋 CI Run: ${ciStatus.databaseId} - ${ciStatus.status}/${ciStatus.conclusion}`);
    
    // If CI is passing, we're done
    if (ciStatus.conclusion === 'success') {
      console.log('✅ CI is passing!');
      return true;
    }
    
    // If CI is still running, wait
    if (ciStatus.status !== 'completed') {
      console.log('⏳ CI is still running, waiting...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      continue;
    }
    
    // Get failed jobs and logs
    const failedJobs = getFailedJobs(ciStatus.databaseId);
    const failureLogs = getFailureLogs(ciStatus.databaseId);
    
    console.log('❌ Failed jobs:', failedJobs.join(', '));
    
    // Save logs for analysis
    const logFile = `/tmp/ci-failures-${ciStatus.databaseId}.log`;
    fs.writeFileSync(logFile, failureLogs);
    
    // Create fix prompt
    const fixPrompt = `
You MUST use the claude-opus-4-1-20250805 model.

Fix the following CI failures in PR #${prNumber}:

Branch: ${branchName}
Working Directory: ${process.cwd()}
Failed Jobs: ${failedJobs.join(', ')}

Failure Logs:
${failureLogs.substring(0, 5000)}

Instructions:
1. Analyze the error messages carefully
2. Fix ALL issues found
3. Test locally with: pnpm run build, pnpm run lint, pnpm run test
4. Commit and push the fixes

Use the Task tool with appropriate agents (debugger, test-engineer, code-auditor) as needed.
Be thorough and fix ALL issues in one go.
`;

    // Save prompt to file
    fs.writeFileSync('/tmp/ci-fix-prompt.txt', fixPrompt);
    
    console.log('🤖 Analyzing and fixing issues...');
    
    // Use Claude to fix the issues
    runCommand(`claude --model claude-opus-4-1-20250805 --no-stream << 'EOF'
${fixPrompt}
EOF`);
    
    // Push changes
    console.log('📤 Pushing fixes...');
    runCommand(`git push origin ${branchName}`);
    
    // Wait for new CI run
    console.log('⏳ Waiting for new CI run...');
    await new Promise(resolve => setTimeout(resolve, 30000));
  }
  
  console.log('❌ Failed to fix CI after maximum attempts');
  return false;
}

// Run the fix process
fixCI().then(success => {
  if (success) {
    console.log('\n✅ CI Auto-Fix completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ CI Auto-Fix failed');
    process.exit(1);
  }
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});