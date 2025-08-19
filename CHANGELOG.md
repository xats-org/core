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

## [0.3.0] - Unreleased

### Added
- **Formal Indexing Support**: Complete implementation of IndexRun for professional publishing
  - New `IndexRun` type in SemanticText for marking indexable terms
  - Support for hierarchical indexing with sub-terms
  - Cross-references and "See also" functionality
  - Redirect support for index aliases
- **Case Study Blocks**: New structured content type for case-based learning
  - Comprehensive scenario and background support
  - Stakeholder perspectives and timelines
  - Analysis questions and discussion prompts
  - Learning objectives integration
- **Metacognitive Prompt Blocks**: Self-reflection and metacognitive support
  - 8 distinct prompt types for different cognitive activities
  - Scaffolding with example responses
  - Self-assessment integration
  - Progress tracking support

### Changed
- Updated schema to version 0.3.0 with backward compatibility
- Enhanced SemanticText to support nested IndexRun elements
- Expanded block types with case study and metacognitive prompt support

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