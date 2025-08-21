# Schema Versioning Policy

## Overview

The xats (eXtensible Academic Text Standard) follows a comprehensive versioning strategy designed to ensure long-term stability, clear migration paths, and predictable evolution of the standard. This document outlines the official versioning policy, breaking change guidelines, and compatibility guarantees.

## Table of Contents

- [Semantic Versioning](#semantic-versioning)
- [Version Numbering](#version-numbering)
- [Breaking Changes Policy](#breaking-changes-policy)
- [Backward Compatibility](#backward-compatibility)
- [Deprecation Process](#deprecation-process)
- [Version Support Lifecycle](#version-support-lifecycle)
- [Schema Evolution Guidelines](#schema-evolution-guidelines)
- [Extension Versioning](#extension-versioning)

## Semantic Versioning

The xats schema follows [Semantic Versioning 2.0.0](https://semver.org/) with the format `MAJOR.MINOR.PATCH`:

### MAJOR Version (X.0.0)

**Incremented when making incompatible API changes.**

Examples of major version changes:
- Removing required fields
- Changing field types in incompatible ways
- Removing support for existing vocabulary URIs
- Restructuring core object hierarchies
- Changes that require existing documents to be modified to remain valid

**Impact**: Existing documents may require modification to validate against the new schema.

**Timeline**: Major versions are planned approximately 18-24 months apart to allow ecosystem adaptation.

### MINOR Version (0.X.0)

**Incremented when adding functionality in a backward-compatible manner.**

Examples of minor version changes:
- Adding new optional fields
- Adding new vocabulary URIs to existing enumerations
- Adding new block types
- Introducing new extensions
- Enhancing validation rules without breaking existing content
- Adding new assessment types or pedagogical metadata

**Impact**: All existing documents remain valid and functional.

**Timeline**: Minor versions are released approximately 3-6 months apart.

### PATCH Version (0.0.X)

**Incremented when making backward-compatible bug fixes.**

Examples of patch version changes:
- Fixing schema validation errors
- Correcting documentation typos
- Improving error messages
- Fixing regex patterns that were too restrictive
- Correcting example documents

**Impact**: No functional changes to document structure or validation.

**Timeline**: Patch versions are released as needed, typically within days or weeks of identifying issues.

## Version Numbering

### Current Version Strategy

- **Active Development**: v0.3.0 (in development)
- **Stable Release**: v0.2.0 (current stable)
- **Legacy Support**: v0.1.0 (security fixes only)

### Pre-1.0 Versioning

During the pre-1.0 phase (current), the xats project uses a modified semantic versioning approach:

- **0.X.0**: Significant feature additions and architectural changes
- **0.X.Y**: Bug fixes and minor enhancements
- **Release Candidates**: 0.X.0-rc.N for testing before stable release

### Post-1.0 Versioning

Once the schema reaches maturity (v1.0.0):

- Full semantic versioning will apply with stronger compatibility guarantees
- Major versions will have extended support lifecycles
- LTS (Long Term Support) versions will be designated for enterprise adoption

## Breaking Changes Policy

### Definition of Breaking Changes

A breaking change is any modification that:

1. **Causes existing valid documents to become invalid**
2. **Changes the semantic meaning of existing fields**
3. **Removes or renames required fields**
4. **Changes the structure of core objects**
5. **Modifies validation rules in restrictive ways**

### Non-Breaking Changes

The following are explicitly considered non-breaking:

1. **Adding optional fields**
2. **Adding new vocabulary URIs**
3. **Adding new block types**
4. **Relaxing validation constraints**
5. **Adding new extensions**
6. **Improving documentation or examples**

### Breaking Change Process

When breaking changes are necessary:

1. **RFC Process**: Major changes require Request for Comments (RFC)
2. **Community Review**: Minimum 30-day review period
3. **Migration Tools**: Automated migration tools provided when possible
4. **Documentation**: Comprehensive migration guides
5. **Deprecation Period**: Minimum one minor version cycle before removal

## Backward Compatibility

### Compatibility Guarantees

#### Within Major Versions
- **Forward Compatibility**: Documents valid in version X.Y.Z are valid in X.Y+N.Z
- **Feature Availability**: New features are always optional or additive
- **Vocabulary Stability**: Existing vocabulary URIs remain stable

#### Cross Major Versions
- **No Automatic Compatibility**: Major versions may require document updates
- **Migration Support**: Tools and guides provided for migration
- **Parallel Support**: Previous major version supported for minimum 12 months

### Version Detection

All xats documents MUST specify their schema version:

```json
{
  "schemaVersion": "0.3.0",
  // ... rest of document
}
```

Consumers MUST:
1. Check the `schemaVersion` field first
2. Validate against the appropriate schema version
3. Handle unknown versions gracefully
4. Provide clear error messages for unsupported versions

## Deprecation Process

### Deprecation Timeline

1. **Announcement**: Feature marked deprecated in documentation
2. **Warning Period**: Minimum one minor version with validation warnings
3. **Removal**: Feature removed in next major version

### Deprecation Markers

Deprecated features are marked in:
- **Schema Documentation**: Clear deprecation notices
- **Validation Output**: Warnings for deprecated usage
- **Migration Guides**: Replacement patterns documented

### Example Deprecation

```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "properties": {
    "oldField": {
      "type": "string",
      "deprecated": true,
      "description": "DEPRECATED: Use 'newField' instead. Will be removed in v1.0.0"
    },
    "newField": {
      "type": "string",
      "description": "Replacement for oldField with enhanced functionality"
    }
  }
}
```

## Version Support Lifecycle

### Support Phases

#### Active Development
- **Latest Major.Minor**: Full feature development and bug fixes
- **Duration**: Until next minor version release

#### Stable Support
- **Previous Minor**: Bug fixes and security updates
- **Duration**: Until next major version release

#### Security Support
- **Previous Major**: Critical security fixes only
- **Duration**: 12 months after major version release

#### End of Life
- **No Updates**: No further updates or support
- **Migration Required**: Users must upgrade to supported versions

### Current Support Status

| Version | Status | Support Level | End of Life |
|---------|--------|---------------|-------------|
| 0.3.0 | Active Development | Full | TBD |
| 0.2.0 | Stable | Bug fixes + Security | TBD |
| 0.1.0 | Security Support | Security only | 2026-01-01 |

## Schema Evolution Guidelines

### Additive Changes (Preferred)

Always prefer additive changes that enhance functionality:

```json
// ✅ Good: Adding optional field
"properties": {
  "existingField": { "type": "string" },
  "newOptionalField": { 
    "type": "string",
    "description": "New functionality added in v0.3.0"
  }
}

// ✅ Good: Extending enumeration
"blockType": {
  "type": "string",
  "format": "uri",
  "examples": [
    "https://xats.org/vocabularies/blocks/paragraph",
    "https://xats.org/vocabularies/blocks/newBlockType"  // Added in v0.3.0
  ]
}
```

### Evolutionary Patterns

#### Field Enhancement
Instead of changing field types, add enhanced alternatives:

```json
// Instead of changing type
"score": { "type": "number" }

// Add enhanced version
"score": { "type": "number" },
"scoringStructure": {
  "$ref": "#/definitions/ScoringStructure"
}
```

#### Vocabulary Extensions
Extend vocabularies through URI namespaces:

```json
// Core vocabulary
"https://xats.org/vocabularies/blocks/paragraph"

// Extension vocabulary
"https://xats.org/extensions/assessment/quiz"
"https://xats.org/extensions/interactive/simulation"
```

## Extension Versioning

### Extension Schema Versions

Extensions follow their own versioning, independent of core schema:

```json
{
  "schemaVersion": "0.3.0",
  "extensions": {
    "https://xats.org/extensions/lti": {
      "version": "1.3.0",
      // ... LTI-specific configuration
    },
    "https://xats.org/extensions/assessment": {
      "version": "0.2.0",
      // ... Assessment-specific configuration
    }
  }
}
```

### Extension Compatibility

- **Core Independence**: Extensions version independently from core schema
- **Minimum Core Version**: Extensions specify minimum required core version
- **Feature Detection**: Extensions can query core schema capabilities

### Extension Evolution

Extensions follow the same semantic versioning principles:
- **Major**: Breaking changes to extension API
- **Minor**: New features and enhancements
- **Patch**: Bug fixes and documentation

## Version Negotiation

### Consumer Requirements

Schema consumers SHOULD:

1. **Declare Supported Versions**: Specify which schema versions are supported
2. **Graceful Degradation**: Handle newer versions by ignoring unknown fields
3. **Feature Detection**: Check for required features rather than version numbers
4. **Error Handling**: Provide clear messages for unsupported versions

### Producer Responsibilities

Schema producers SHOULD:

1. **Version Declaration**: Always declare schema version in documents
2. **Feature Usage**: Use features appropriate to declared version
3. **Compatibility Testing**: Validate against target schema version
4. **Migration Planning**: Plan for version upgrades in content workflows

## Implementation Examples

### Version Detection Pattern

```javascript
function validateDocument(document) {
  const version = document.schemaVersion;
  
  if (!version) {
    throw new Error('Missing schemaVersion field');
  }
  
  const supportedVersions = ['0.2.0', '0.3.0'];
  if (!supportedVersions.includes(version)) {
    throw new Error(`Unsupported schema version: ${version}. Supported: ${supportedVersions.join(', ')}`);
  }
  
  // Load appropriate schema for validation
  const schema = loadSchemaVersion(version);
  return validateAgainstSchema(document, schema);
}
```

### Feature Detection Pattern

```javascript
function supportsAssessments(document) {
  const version = document.schemaVersion;
  const [major, minor] = version.split('.').map(Number);
  
  // Assessments added in v0.2.0
  return major > 0 || (major === 0 && minor >= 2);
}
```

## Governance

### Version Planning

- **Roadmap Reviews**: Quarterly reviews of version roadmap
- **Community Input**: RFC process for major changes
- **Breaking Change Approval**: Requires steering committee consensus
- **Release Timing**: Coordinated with ecosystem partners

### Change Approval Process

1. **Minor Changes**: Core team approval sufficient
2. **Major Changes**: Community RFC and steering committee approval
3. **Emergency Fixes**: Expedited process for security issues

## Related Documents

- [Migration Guide: v0.1.0 to v0.2.0](../guides/migration-guide.md)
- [Version Compatibility Matrix](../specs/version-compatibility-matrix.md)
- [Schema Architecture](../ARCHITECTURE.md)
- [Extension Development Guide](../guides/extension-guide.md)

---

*This document is maintained by the xats Standards Board and updated with each schema release.*