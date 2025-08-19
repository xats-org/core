# ADR: Rights Management for xats v0.2.0

**Date**: 2025-08-18
**Status**: Implemented
**Version**: 0.2.0

## Problem Statement

Commercial publishers and educational institutions require comprehensive rights management capabilities to:

1. **Protect Intellectual Property**: Clear copyright and licensing information
2. **Enable Commercial Adoption**: Support for proprietary licenses and restrictions
3. **Manage Mixed-Rights Content**: Different rights for different components
4. **Ensure Legal Compliance**: Proper attribution and usage permissions
5. **Support Time-Limited Content**: Expiration dates for licensed materials

## Decision

Implement comprehensive rights management through:

### 1. RightsMetadata Definition

```json
{
  "RightsMetadata": {
    "properties": {
      "license": { "type": "string", "format": "uri" },
      "copyrightHolder": { "type": "string" },
      "copyrightYear": { "type": "string" },
      "permissions": { 
        "redistribute": "boolean",
        "modify": "boolean", 
        "commercialUse": "boolean",
        "createDerivatives": "boolean",
        "shareAlike": "boolean"
      },
      "restrictions": {
        "noCommercialUse": "boolean",
        "educationalUseOnly": "boolean",
        "geographicRestrictions": "array"
      },
      "attribution": {
        "required": "boolean",
        "format": "string"
      },
      "expirationDate": { "type": "string", "format": "date" }
    }
  }
}
```

### 2. Rights Inheritance Hierarchy

1. **Document Level**: Default rights for entire textbook
2. **Structural Level**: Units, chapters, sections can override
3. **Content Block Level**: Individual blocks can specify rights
4. **Resource Level**: Individual assets have independent rights

### 3. License URI Vocabulary

Standardized URIs for common licenses:
- `https://xats.org/licenses/cc-by-4.0` (Creative Commons)
- `https://xats.org/licenses/cc-by-sa-4.0` (Share Alike)
- `https://xats.org/licenses/cc-by-nc-4.0` (Non-Commercial)
- `https://xats.org/licenses/proprietary` (All rights reserved)
- `https://xats.org/licenses/public-domain` (No rights reserved)
- `https://xats.org/licenses/educational-use-only` (Educational restriction)

## Implementation Details

### Schema Integration

1. **XatsObject Base Class**: Added optional `rights` property
2. **Root Schema**: Added optional `rights` for document defaults
3. **Resource Definition**: Added `resourceRights` for asset-specific rights

### Inheritance Rules

1. **Default Inheritance**: Child objects inherit parent rights
2. **Override Capability**: Any level can specify more restrictive rights
3. **Resource Independence**: Resources can have completely different rights
4. **Explicit Over Implicit**: Specified rights always override inherited ones

### Commercial IP Protection

- **Proprietary License Support**: Full copyright protection
- **Usage Restrictions**: Educational-only, institutional-only controls
- **Commercial Controls**: Explicit commercial use permissions
- **Attribution Enforcement**: Required attribution with custom formats
- **Contact Information**: Legal contact for licensing inquiries

## Benefits

1. **Commercial Viability**: Publishers can protect proprietary content
2. **Mixed Content Support**: Different rights for different components
3. **Legal Clarity**: Clear attribution and usage requirements
4. **Flexibility**: Granular control from document to resource level
5. **Standards Compliance**: URI-based vocabulary for interoperability
6. **Future-Proof**: Extensible for new license types

## Backward Compatibility

- All rights properties are **optional**
- Existing v0.1.0 documents remain valid
- No required changes to existing content
- Graceful degradation when rights not specified

## Usage Examples

### Document-Level Rights
```json
{
  "rights": {
    "license": "https://xats.org/licenses/cc-by-sa-4.0",
    "copyrightHolder": "Academic Press Inc.",
    "copyrightYear": "2023"
  }
}
```

### Chapter-Specific Rights
```json
{
  "rights": {
    "license": "https://xats.org/licenses/cc-by-nc-4.0",
    "restrictions": {
      "noCommercialUse": true,
      "educationalUseOnly": true
    },
    "expirationDate": "2028-12-31"
  }
}
```

### Proprietary Resource Rights
```json
{
  "resourceRights": {
    "license": "https://xats.org/licenses/proprietary",
    "permissions": {
      "redistribute": false,
      "modify": false,
      "commercialUse": false
    },
    "restrictions": {
      "educationalUseOnly": true,
      "institutionalUseOnly": true
    },
    "attribution": {
      "required": true,
      "format": "© 2023 TechCorp Solutions. Used with permission."
    }
  }
}
```

## Risk Mitigation

1. **Legal Compliance**: Standard license vocabulary ensures proper rights expression
2. **Commercial Adoption**: Clear IP protection enables publisher participation  
3. **User Confusion**: Documentation and examples clarify inheritance rules
4. **Schema Bloat**: Optional properties minimize impact on simple use cases

## Next Steps

1. **Documentation**: Update authoring guide with rights management examples
2. **Tooling**: Add validation for license URI vocabulary
3. **Community**: Gather feedback from commercial publishers
4. **Extensions**: Consider domain-specific license extensions

This implementation enables commercial adoption while maintaining the open, extensible nature of xats.