# xats Board Meeting Minutes: File Modularity for v0.3.0

**Date:** August 18, 2025  
**Time:** 23:33  
**Meeting Type:** Focused Technical Discussion  
**Chair:** xats-project-steward  
**Duration:** 85 minutes

## Attendees

- **xats-project-steward** (Chair)
- **xats-schema-engineer** 
- **xats-validation-engineer**
- **xats-content-author**
- **xats-publishing-expert**
- **xats-lms-integrator**

## Meeting Purpose

Evaluate and design file modularity capabilities for xats v0.3.0 to address scalability concerns for large textbooks and complex educational materials.

## Key Decisions Made

### 1. Technical Approach: JSON Schema $ref with Extensions

**APPROVED**: Use JSON Schema `$ref` mechanism as the foundation with selective custom extensions for xats-specific metadata.

**Rationale:**
- Leverages existing JSON Schema ecosystem and tooling
- Provides standard resolution behavior
- Allows custom extensions for xats-specific features
- Balances standardization with flexibility

### 2. Security and Sandboxing Framework

**APPROVED**: Implement file access controls with multiple trust levels:

- **Local References**: Limited to document root directory tree
- **Registry References**: Trusted content libraries with versioning
- **External References**: Optional, with explicit security controls
- **Content Integrity**: Optional checksums for verification

### 3. Phased Implementation Strategy

**APPROVED**: Two-phase rollout for v0.3.0:

**Phase 1 (v0.3.0 Core)**:
- JSON Schema $ref support for structural containers
- Relative path resolution within document root
- Basic cross-file validation
- Reference metadata schema
- Simple authoring patterns

**Phase 2 (v0.3.1+)**:
- Registry-based references for shared libraries
- Advanced caching and performance optimizations
- Enhanced LMS integration helpers
- Migration and transformation tools

### 4. Backward Compatibility Guarantee

**APPROVED**: All existing xats documents (v0.1.0, v0.2.0) remain fully compatible. Single-file documents continue to be supported indefinitely.

## Technical Specifications Approved

### Reference Syntax
```json
{
  "$ref": "./chapters/chapter-01.json",
  "xats:metadata": {
    "title": "Introduction to Biology",
    "contentType": "chapter", 
    "version": "0.2.0",
    "dependencies": ["./shared/biology-terms.json"]
  }
}
```

### Validation Configuration
```json
{
  "xats:validation": {
    "allowExternalReferences": false,
    "maxReferenceDepth": 5,
    "requiredFiles": ["./bibliography.json"],
    "contentIntegrityChecks": true
  }
}
```

### Build Manifest Format
```json
{
  "xats:manifest": {
    "version": "0.3.0",
    "main": "textbook.xats.json", 
    "files": [
      "chapters/chapter-01.json",
      "shared/bibliography.json"
    ],
    "integrity": {
      "chapters/chapter-01.json": "sha256-abc123..."
    }
  }
}
```

### Resolution Strategy Options
- `"resolution": "eager"` - Resolve all references immediately
- `"resolution": "lazy"` - Load content on-demand  
- `"resolution": "flatten"` - Provide single-file version

## Requirements Established

### Functional Requirements

1. **File Reference System**
   - JSON Schema $ref compatibility
   - Relative path resolution within document root
   - Support for referencing Units, Chapters, Sections, and ContentBlocks
   - Optional external references with security controls

2. **Validation Framework**
   - Two-phase validation (individual files + merged document)
   - Cross-file reference validation
   - Dependency graph construction and circular reference detection
   - Clear error reporting with file location context

3. **Metadata System**
   - Reference metadata schema for describing content without loading
   - Dependency declaration and tracking
   - Version compatibility information
   - Content type and structural metadata

4. **Security Controls**
   - File access sandboxing within document tree
   - URI scheme-based trust levels
   - Optional content integrity verification
   - Protection against path traversal attacks

### Non-Functional Requirements

1. **Performance**
   - Efficient caching of resolved references
   - Incremental validation (only re-validate changed files)
   - Lazy loading capabilities for large documents
   - Build-time optimization for publishing workflows

2. **Tooling Support**
   - Reference resolution library for implementers
   - Authoring tool integration requirements
   - Build system compatibility
   - LMS platform integration patterns

3. **Documentation**
   - Clear authoring guidelines and best practices
   - File organization conventions
   - Migration tools and examples
   - Implementation guides for tool developers

## Risk Assessment and Mitigation

### High Priority Risks

1. **Complexity Increase for Authors**
   - **Risk**: File modularity may confuse non-technical content creators
   - **Mitigation**: Maintain single-file option, provide clear templates and examples, develop authoring tool support

2. **Validation Performance**
   - **Risk**: Cross-file validation may be slow for large document sets
   - **Mitigation**: Implement caching, incremental validation, parallel processing

3. **Tool Ecosystem Fragmentation**  
   - **Risk**: Different tools may implement references inconsistently
   - **Mitigation**: Provide reference implementation library, comprehensive test suite, clear specification

4. **Security Vulnerabilities**
   - **Risk**: File references could enable path traversal or unauthorized access
   - **Mitigation**: Strict sandboxing, URI scheme controls, security audit requirements

### Medium Priority Risks

1. **Backward Compatibility Maintenance**
   - **Risk**: New features may inadvertently break existing documents
   - **Mitigation**: Comprehensive test suite, version compatibility matrix, automated regression testing

2. **Publishing Workflow Disruption**
   - **Risk**: Existing publishing pipelines may need significant changes
   - **Mitigation**: Provide flattening tools, gradual migration path, publisher partnership program

## Action Items and Next Steps

### Immediate Actions (Next 2 Weeks)

1. **xats-schema-engineer**: Create detailed technical specification document
2. **xats-validation-engineer**: Design validation framework architecture  
3. **xats-project-steward**: Create GitHub issues for Phase 1 implementation
4. **All Members**: Review and approve technical specification

### Phase 1 Development (Target: 4-6 weeks)

1. **Schema Updates**: Extend xats schema to support $ref and metadata
2. **Validation Library**: Implement reference resolution and validation
3. **Documentation**: Create authoring guide and implementation examples
4. **Test Suite**: Comprehensive tests for reference patterns and edge cases

### Phase 1 Validation (Target: 2 weeks after development)

1. **Community Testing**: Beta testing with select content authors
2. **Tool Integration**: Test with existing xats-compatible tools
3. **Performance Benchmarking**: Validate performance claims
4. **Security Audit**: Independent review of security controls

## Success Criteria

The file modularity feature will be considered successful if:

1. **Adoption**: At least 3 large textbook projects adopt modular structure within 6 months
2. **Performance**: No more than 20% performance degradation for single-file documents
3. **Tool Support**: At least 2 major authoring tools implement reference support
4. **Security**: Zero critical security vulnerabilities in 6-month post-release period
5. **Usability**: Less than 10% increase in support requests related to file organization

## Meeting Outcomes

**Status**: All requirements approved for Phase 1 implementation  
**Next Meeting**: Technical specification review (scheduled for August 25, 2025)  
**Milestone Assignment**: All Phase 1 work assigned to v0.3.0 milestone  

**Meeting concluded at 00:58**