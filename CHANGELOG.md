# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security

## [0.3.0] - 2025-08-19

### Added
- **File Modularity System**: Enterprise-scale document organization
  - `FileReference` support for splitting large textbooks across multiple JSON files
  - `$ref` JSON Pointer syntax for external file references
  - `xats:refMetadata` for tracking external content versions and integrity
  - Validation tools for modular document integrity checking
  - Team collaboration support with independent file editing
- **Enhanced Internationalization (i18n)**: Global content support
  - ISO 639-1 language identification for all content elements (`language` property)
  - Text direction support (`textDirection`) for RTL languages (Arabic, Hebrew, etc.)
  - WCAG 3.1.1 and 3.1.2 compliance for language identification
  - Multi-language content support within single documents
- **Advanced Indexing System**: Professional publishing-grade indexing
  - New `IndexRun` type in SemanticText for marking indexable terms
  - Hierarchical indexing with main terms and sub-terms
  - Cross-references and "See also" functionality
  - Redirect support for index aliases ("See" references)
  - Machine-readable index entries for automated index generation
- **New Pedagogical Content Types**: Enhanced learning experiences
  - **Case Study Blocks** (`https://xats.org/core/blocks/caseStudy`):
    - Comprehensive scenario and background support
    - Stakeholder perspectives and timeline tracking
    - Analysis questions with cognitive level specification
    - Resource attachments and exhibits
    - Learning objectives integration
  - **Metacognitive Prompt Blocks** (`https://xats.org/core/blocks/metacognitivePrompt`):
    - 8 distinct prompt types for different cognitive activities
    - Scaffolding with sentence starters and examples
    - Self-assessment and reflection integration
    - Timing guidance for learning process integration
- **Enhanced Rights Management**: Publisher-ready licensing
  - Granular permission model (redistribute, modify, commercial use, derivatives)
  - Multi-stakeholder copyright support for complex authorship
  - Attribution requirements and format specification
  - Geographic and usage restrictions
  - Expiration date support for time-limited licenses
- **Expanded Accessibility Framework**: Comprehensive WCAG support
  - Enhanced `AccessibilityMetadata` with cognitive support features
  - Assessment accessibility settings for diverse learning needs
  - Alternative input method support (voice, switch, eye-tracking)
  - Cognitive accessibility features (reading level, complexity indicators)
  - Extended time and accommodation support for assessments

### Changed
- **Schema version updated to "0.3.0"** with full backward compatibility for 0.1.0 and 0.2.0 documents
- **Enhanced SemanticText** to support IndexRun elements alongside existing run types
- **Expanded block types** with case study and metacognitive prompt support
- **Improved assessment accessibility** with comprehensive accommodation settings
- **Enhanced mathematical content** with cognitive accessibility features
- **Updated table support** with improved accessibility attributes
- **Refined rights metadata** with granular permission controls

### Fixed
- **File modularity validation** for complex reference hierarchies
- **Language tag validation** using proper ISO 639-1 format with region support
- **Text direction handling** for mixed LTR/RTL content
- **Index cross-reference validation** for circular dependencies
- **Assessment accessibility compliance** with WCAG guidelines
- **Rights inheritance** from document to content element level

## [0.2.0] - 2025-01-20

### Added
- **100% WCAG 2.1 AA Compliance**: Comprehensive accessibility support with full conformance
  - Language identification for all content elements
  - Enhanced alt text and long descriptions for images
  - Proper heading hierarchy validation
  - Structural navigation support
  - Reading order specification
  - Skip navigation links
  - Keyboard accessibility features
- **LTI 1.3 Integration**: Native support for Learning Management Systems
  - Full LTI 1.3 Advantage implementation
  - Assignment and Grade Services (AGS) for grade passback
  - Deep Linking 2.0 for content selection
  - Names and Role Provisioning Services (NRPS)
  - Platform-specific configurations for Canvas, Blackboard, Moodle
- **Rights Management Extension**: Comprehensive copyright and licensing
  - Copyright holder and year tracking
  - License type specification (CC licenses, custom)
  - Usage permissions and restrictions
  - Digital rights management support
- **Core Assessment Framework**: Comprehensive built-in assessment capabilities
  - Multiple question types: multiple choice, true/false, short answer, essay prompts
  - Pedagogical metadata with Bloom's Taxonomy and Depth of Knowledge support
  - Automatic scoring and grade calculation with customizable point values
  - LTI Assignment and Grade Services (AGS) integration for seamless grade passback
  - Rubric support for essay questions with detailed scoring criteria
  - Rich feedback system with option-specific explanations and remedial content links
  - Assessment accessibility settings for accommodations and universal design
  - Learning analytics support for tracking student progress and performance
- **Enhanced Validation**: Improved schema validation
  - 682 new accessibility test cases
  - Comprehensive example documents
  - Better error messages and diagnostics
- **Documentation**: Comprehensive guides and references
  - Migration guide from v0.1.0
  - Accessibility guide with WCAG compliance
  - LTI integration guide with platform examples
  - Updated schema reference documentation

### Changed
- **Schema version updated to "0.2.0"** with backward compatibility for 0.1.0 documents
- **Improved TypeScript type definitions** with comprehensive types for all assessment components
- **Enhanced CLI validator** with accessibility checks, assessment validation, and detailed error reporting
- **Updated all example documents** with new assessment, accessibility, and LTI features
- **Expanded test coverage** to include 682 new accessibility test cases and comprehensive assessment validation
- **Enhanced documentation structure** with updated API reference and comprehensive guides
- **Improved schema validation** with better error messages and context-aware suggestions

### Fixed
- **Accessibility test validation** for generic heading text and proper semantic structure
- **Alt text quality validation** for redundant phrases and improved image descriptions
- **Language code validation** using BCP 47 format for proper internationalization support
- **Schema reference resolution** for extension types, particularly LTI 1.3 configurations
- **TypeScript compilation errors** in assessment type definitions
- **CLI tool reliability** for large documents and complex schema validations
- **Cross-platform compatibility** issues in validation and file handling

## [0.1.0] - 2025-01-17

### Added
- Initial release of xats core package
- JSON Schema for xats v0.1.0 specification
- CLI validator tool (`xats-validate`)
- TypeScript API for programmatic validation
- Comprehensive test suite with example documents
- GitHub Actions workflows for CI/CD
- Documentation and examples
- Support for Node.js 18, 20, and 22

### Features
- **Schema Validation**: Complete JSON Schema validation for xats documents
- **CLI Tool**: Command-line interface for validating xats documents
- **TypeScript Support**: Full TypeScript definitions and API
- **Example Documents**: Sample xats documents demonstrating schema features
- **Extensible Architecture**: Support for custom vocabulary extensions

### Documentation
- Complete API reference documentation
- Authoring guide for content creators
- Extension development guide
- Architecture documentation

### Testing
- Unit tests with >90% coverage
- Integration tests for CLI functionality
- Example document validation
- Security audit integration