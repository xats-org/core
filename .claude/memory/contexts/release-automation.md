# Release Automation Setup

## Overview

Comprehensive release automation has been implemented for the xats-core project, addressing **Issue #16 - Setup CI/CD Pipeline with GitHub Actions**.

## Components Created

### 1. GitHub Actions Release Workflow (`.github/workflows/release.yml`)

**Features:**
- **Trigger**: Automatic execution on version tags (`v*`)
- **Multi-Node Testing**: Validates against Node.js 18, 20, and 22
- **Comprehensive Validation**: 
  - Full test suite execution
  - Linting and type checking
  - Example document validation
  - Security audit
- **Version Verification**: Ensures package.json version matches git tag
- **Automated Release Notes**: Generates release notes from commit history
- **GitHub Release Creation**: Creates release with artifacts
- **npm Publication**: Publishes to npm registry (stable releases only)
- **Artifact Management**: Uploads build artifacts with 30-day retention

**Security Features:**
- Environment protection for npm publication
- Security audit with moderate vulnerability threshold
- Clean working directory validation
- Version verification before release

### 2. Release Management Script (`scripts/release.sh`)

**Capabilities:**
- **Version Bump Types**: patch, minor, major, or specific version
- **Pre-release Validation**:
  - Git working directory cleanliness check
  - Branch verification (recommends main)
  - Full test suite execution
  - Build verification
  - Example validation
- **Automated Git Operations**:
  - Version commit with conventional format
  - Tag creation with release metadata
  - Push to remote repository
- **Interactive Confirmation**: User confirmation before executing release

**Usage Examples:**
```bash
# Patch release (0.1.0 → 0.1.1)
npm run release:patch

# Minor release (0.1.0 → 0.2.0)
npm run release:minor

# Major release (0.1.0 → 1.0.0)
npm run release:major

# Specific version
./scripts/release.sh 0.1.1
```

### 3. Changelog Management (`CHANGELOG.md`)

**Structure:**
- Follows [Keep a Changelog](https://keepachangelog.com/) format
- Adheres to [Semantic Versioning](https://semver.org/)
- Includes unreleased section for ongoing development
- Documents v0.1.0 initial release with comprehensive feature list

**Categories:**
- Added: New features
- Changed: Changes in existing functionality
- Deprecated: Soon-to-be removed features
- Removed: Removed features
- Fixed: Bug fixes
- Security: Security improvements

### 4. Package Configuration Updates

**Enhanced package.json:**
- Added release scripts for common version bump types
- Included CHANGELOG.md in published files
- Maintained existing file structure and dependencies

## Workflow Process

### 1. Development Phase
- Create feature branches from main
- Implement changes with tests
- Update documentation as needed
- Submit pull requests

### 2. Release Preparation
- Ensure all changes are merged to main
- Update CHANGELOG.md with release notes
- Verify all tests pass locally

### 3. Release Execution
```bash
# Choose appropriate release type
npm run release:patch  # For bug fixes
npm run release:minor  # For new features
npm run release:major  # For breaking changes
```

### 4. Automated Pipeline
1. **Pre-release Validation**: Full CI pipeline execution
2. **Security Audit**: Vulnerability scanning
3. **Package Building**: TypeScript compilation and packaging
4. **Release Notes Generation**: Automatic generation from commits
5. **GitHub Release**: Creation with artifacts and documentation
6. **npm Publication**: Publication to npm registry (stable releases)
7. **Notifications**: Summary and status reporting

## Environment Setup Requirements

### GitHub Secrets
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions
- `NPM_TOKEN`: Required for npm publication (to be configured)

### npm Environment
- Environment named `npm-production` should be created in GitHub repository settings
- Configure protection rules as needed

## Best Practices

### 1. Version Management
- Follow semantic versioning strictly
- Update CHANGELOG.md before releases
- Test release process in development environment

### 2. Security
- Regular dependency updates
- Security audit integration
- Protected npm environment

### 3. Documentation
- Keep release notes comprehensive
- Document breaking changes clearly
- Maintain migration guides

## Monitoring and Troubleshooting

### Release Status
- Monitor at: https://github.com/xats-org/core/actions
- Check releases at: https://github.com/xats-org/core/releases

### Common Issues
1. **Version Mismatch**: Ensure package.json version matches git tag
2. **npm Token**: Configure NPM_TOKEN secret for publication
3. **Environment Protection**: Set up npm-production environment

### Rollback Procedures
- Manual rollback possible through GitHub interface
- npm unpublish available within 24 hours (use sparingly)
- Git tag deletion and re-creation if needed

## Implementation Status

✅ **Completed:**
- GitHub Actions release workflow
- Release management script
- Changelog structure
- Package configuration
- Documentation

⏳ **Pending:**
- NPM_TOKEN secret configuration
- npm-production environment setup
- First release execution

## Future Enhancements

**Potential Improvements:**
- Automatic changelog generation from conventional commits
- Release candidate workflow for pre-releases
- Automated testing in multiple environments
- Integration with project management tools
- Performance benchmarking in release pipeline

This comprehensive release automation system ensures consistent, reliable, and secure releases for the xats-core project while maintaining high code quality standards.