# File Modularity Proposal for xats v0.3.0

**Document Type:** Technical Proposal  
**Version:** 1.0  
**Date:** August 18, 2025  
**Status:** Approved by xats Standards Board  
**Target Release:** v0.3.0  

## Executive Summary

This proposal defines file modularity capabilities for xats v0.3.0 to address scalability limitations of single-file documents. The solution leverages JSON Schema `$ref` mechanisms with xats-specific extensions to enable:

- **Large Textbook Support**: Break 1000+ page textbooks into manageable file structures
- **Collaborative Authoring**: Multiple authors working simultaneously on different sections  
- **Content Reusability**: Share components between textbooks and courses
- **Performance Optimization**: Lazy loading and caching for better user experience
- **Publishing Flexibility**: Modular content assembly for different output formats

The implementation maintains full backward compatibility while providing a clear migration path for existing documents.

## Problem Statement

### Current Limitations

1. **File Size**: Large textbooks create unwieldy JSON files (10MB+ common)
2. **Collaboration Barriers**: Multiple authors cannot work on same document simultaneously
3. **Performance Issues**: Large files impact loading, parsing, and validation times
4. **Content Reuse**: No mechanism to share content between documents
5. **Version Control**: Git diffs become meaningless for large JSON files
6. **Tool Limitations**: Editors struggle with very large JSON documents

### User Impact

- **Faculty**: Difficulty collaborating on course materials
- **Publishers**: Complex content management and version control
- **Students**: Slow loading times for large textbooks
- **Developers**: Performance bottlenecks in tools and platforms

## Proposed Solution

### Technical Approach

**Foundation**: JSON Schema `$ref` mechanism with xats-specific extensions

**Reference Syntax**:
```json
{
  "$ref": "./chapters/introduction.json",
  "xats:metadata": {
    "title": "Introduction to Biology", 
    "contentType": "chapter",
    "version": "0.2.0",
    "dependencies": ["./shared/terminology.json"]
  }
}
```

**Security Model**: Sandboxed file access within document root directory

**Validation Strategy**: Two-phase validation (individual files + merged document)

### File Organization Pattern

```
biology-textbook/
├── main.xats.json              # Root document
├── metadata/
│   ├── bibliography.json       # Shared bibliography
│   └── glossary.json          # Terminology definitions
├── chapters/
│   ├── 01-introduction.json    # Individual chapters
│   ├── 02-cell-biology.json
│   └── 03-genetics.json
├── shared/
│   ├── exercises/             # Reusable exercises
│   ├── figures/               # Shared images/diagrams
│   └── assessments/           # Common assessments
└── build/
    ├── manifest.json          # Build dependency manifest
    └── flattened.xats.json    # Single-file output
```

### Core Features

#### 1. Reference Resolution
- **Relative Paths**: `./chapters/introduction.json`
- **Absolute Paths**: `/shared/bibliography.json` (within document root)
- **External References**: `https://registry.xats.org/biology/cell-diagrams.json` (optional)

#### 2. Metadata Schema
```json
{
  "xats:metadata": {
    "title": "Human-readable title",
    "contentType": "chapter|section|unit|block|resource",
    "version": "Schema version of referenced file", 
    "dependencies": ["Array of file dependencies"],
    "checksum": "Optional integrity verification",
    "lastModified": "ISO 8601 timestamp",
    "author": "Content author information"
  }
}
```

#### 3. Validation Configuration
```json
{
  "xats:validation": {
    "allowExternalReferences": false,
    "maxReferenceDepth": 5,
    "requiredFiles": ["./bibliography.json"],
    "contentIntegrityChecks": true,
    "circularReferenceDetection": true
  }
}
```

#### 4. Build Manifest
```json
{
  "xats:manifest": {
    "version": "0.3.0",
    "main": "main.xats.json",
    "resolution": "eager|lazy|flatten",
    "files": [
      {
        "path": "chapters/introduction.json",
        "checksum": "sha256-abc123...",
        "size": 45678,
        "lastModified": "2025-08-18T23:33:00Z"
      }
    ],
    "dependencies": {
      "external": [],
      "registry": ["xats://biology/diagrams@1.2.0"]
    }
  }
}
```

## Implementation Phases

### Phase 1: Core Features (v0.3.0)

**Timeline**: 6-8 weeks from approval

**Deliverables**:
1. **Schema Extensions**: JSON Schema updates for $ref and metadata
2. **Validation Library**: Reference resolution and cross-file validation
3. **Documentation**: Authoring guide and implementation examples
4. **Test Suite**: Comprehensive validation tests and edge cases
5. **Security Audit**: Independent security review

**Scope Limitations**:
- Local file references only (within document root)
- Basic metadata and validation
- Simple resolution strategies

### Phase 2: Advanced Features (v0.3.1+)

**Timeline**: 3-4 months after Phase 1

**Deliverables**:
1. **Registry System**: Shared content libraries with versioning
2. **Advanced Caching**: Performance optimizations and incremental validation
3. **Tool Integration**: Enhanced authoring tool support
4. **Migration Tools**: Automated single-file to modular conversion
5. **LMS Helpers**: Specialized integration libraries

## Security Considerations

### File Access Controls

1. **Sandboxing**: References limited to document root directory tree
2. **Path Validation**: Prevent path traversal attacks (`../../../etc/passwd`)
3. **URI Schemes**: Different trust levels for different reference types
4. **Content Integrity**: Optional checksum verification for critical content

### Trust Levels

- **Local References** (`./path/file.json`): Full trust within document tree
- **Registry References** (`xats://registry/content@version`): Curated, verified content
- **External References** (`https://example.com/content.json`): Explicit opt-in required

### Security Checklist

- [ ] Path traversal prevention
- [ ] File permission validation  
- [ ] Content type verification
- [ ] Checksum validation (when enabled)
- [ ] Reference depth limits
- [ ] Circular reference detection
- [ ] Access logging and monitoring

## Performance Implications

### Loading Strategies

1. **Eager Loading**: Resolve all references upfront
   - **Pros**: Predictable performance, works offline
   - **Cons**: Slower initial load, higher memory usage

2. **Lazy Loading**: Load content on-demand
   - **Pros**: Faster initial load, lower memory usage
   - **Cons**: Network dependencies, complex caching

3. **Flatten Mode**: Preprocessing step creates single-file version
   - **Pros**: Maximum compatibility, predictable performance
   - **Cons**: Loss of modularity benefits, larger files

### Performance Targets

- **Reference Resolution**: < 100ms for typical textbook (50 files)
- **Validation**: < 5 seconds for complete document validation
- **Memory Usage**: < 20% increase over single-file equivalent
- **Cache Hit Rate**: > 90% for repeated access to same content

## Tool Requirements

### Authoring Tools

1. **Reference Auto-completion**: Intelligent path completion based on file structure
2. **Inline Preview**: Show referenced content within editing context
3. **Dependency Visualization**: Graph view of file relationships
4. **Validation Integration**: Real-time validation with clear error reporting
5. **Refactoring Support**: Update references when files are moved or renamed

### Publishing Systems

1. **Build Integration**: Resolve references during publication process
2. **Asset Collection**: Gather all dependencies for distribution
3. **Format Conversion**: Generate both modular and flattened outputs
4. **Quality Assurance**: Cross-reference validation and consistency checking

### LMS Platforms

1. **Resolution Options**: Support for eager, lazy, or flattened loading
2. **Caching Layer**: Efficient caching of resolved content
3. **Security Controls**: Proper sandboxing and access controls
4. **Performance Monitoring**: Track loading times and user experience

## Migration Strategy

### Backward Compatibility

- **100% Compatibility**: All existing xats documents continue to work unchanged
- **Gradual Adoption**: Authors can adopt file modularity incrementally
- **Tool Support**: Existing tools continue to work with single-file documents

### Migration Tools

1. **Document Splitter**: Automated tool to break large documents into modular structure
2. **Reference Updater**: Tool to update file references when restructuring
3. **Validation Helper**: Verify migrated documents maintain semantic equivalence
4. **Best Practice Guide**: Recommendations for optimal file organization

### Migration Process

1. **Assessment**: Analyze document structure and identify natural split points
2. **Planning**: Design file organization based on content hierarchy
3. **Splitting**: Use automated tools with manual review
4. **Validation**: Verify migrated document validates and renders correctly
5. **Testing**: Ensure all tools and workflows work with new structure

## Success Metrics

### Adoption Metrics
- **Target**: 3+ large textbook projects adopt modular structure within 6 months
- **Measurement**: Track GitHub repositories using file references

### Performance Metrics  
- **Target**: < 20% performance degradation for single-file documents
- **Measurement**: Automated benchmarking of validation and loading times

### Tool Ecosystem
- **Target**: 2+ major authoring tools implement reference support
- **Measurement**: Survey of xats-compatible tools and features

### Quality Metrics
- **Target**: Zero critical security vulnerabilities in 6-month post-release period
- **Measurement**: Security audit reports and vulnerability disclosures

### User Experience
- **Target**: < 10% increase in support requests related to file organization
- **Measurement**: Support ticket analysis and community feedback

## Risk Analysis

### High Priority Risks

1. **Complexity for Non-Technical Authors**
   - **Probability**: Medium
   - **Impact**: High  
   - **Mitigation**: Maintain single-file option, provide templates, improve tooling

2. **Performance Degradation**
   - **Probability**: Medium
   - **Impact**: Medium
   - **Mitigation**: Comprehensive benchmarking, optimization, caching strategies

3. **Security Vulnerabilities**
   - **Probability**: Low
   - **Impact**: High
   - **Mitigation**: Security audit, sandboxing, conservative defaults

### Medium Priority Risks

1. **Tool Fragmentation**
   - **Probability**: Medium
   - **Impact**: Medium
   - **Mitigation**: Reference implementation, clear specification, test suite

2. **Publishing Workflow Disruption**
   - **Probability**: Medium  
   - **Impact**: Medium
   - **Mitigation**: Flattening tools, gradual migration, publisher partnerships

## Community Impact

### Benefits by Stakeholder

**Content Authors**:
- Collaborative editing capabilities
- Better version control and change tracking
- Reusable content libraries
- Improved organization for large projects

**Publishers**:
- Modular content management
- Flexible publication formats
- Improved quality assurance workflows
- Better asset tracking and licensing

**Students**:
- Faster loading times for large textbooks
- Personalized content delivery
- Better offline support options

**Developers**:
- Cleaner tool architecture
- Better performance characteristics
- Standardized reference patterns
- Extensible foundation for future features

### Implementation Support

1. **Developer Resources**: Reference implementation library and examples
2. **Community Guidelines**: Best practices and file organization patterns  
3. **Support Channels**: Dedicated help for migration and implementation
4. **Training Materials**: Workshops and documentation for tool developers

## Conclusion

The file modularity feature represents a critical evolution for the xats standard, addressing real scalability limitations while maintaining the core principles of semantic clarity and machine-readability. The proposed solution:

- **Leverages Standards**: Built on JSON Schema `$ref` for maximum compatibility
- **Maintains Simplicity**: Optional feature that doesn't complicate basic use cases
- **Ensures Security**: Comprehensive security model with sandboxing and controls
- **Enables Scale**: Supports textbooks of any size with manageable file structures
- **Facilitates Collaboration**: Multiple authors can work simultaneously

The phased implementation approach allows for careful validation and community feedback while delivering immediate value. With proper execution, this feature will establish xats as the definitive standard for large-scale educational content management.

**Recommendation**: Proceed with Phase 1 implementation targeting v0.3.0 release.

---

**Document Prepared By**: xats Standards Board  
**Meeting Reference**: 2025-08-18-2333  
**Next Review**: Technical Specification Review (August 25, 2025)