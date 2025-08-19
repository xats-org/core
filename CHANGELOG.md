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

## [0.2.0] - 2025-08-19

### Added
- **Assessment Framework**: Comprehensive assessment support with multiple question types
  - Multiple choice questions (single and multiple response)
  - Short answer questions with validation patterns
  - Essay prompts with rubric support
- **Accessibility Features**: WCAG 2.1 Level AA compliance
  - `AccessibilityMetadata` for comprehensive accessibility information
  - `AssessmentAccessibilitySettings` for assessment-specific accommodations
  - Support for alternative formats, cognitive supports, and time extensions
  - Screen reader optimization and keyboard navigation
- **Pedagogical Metadata**: Cognitive and learning classification
  - Bloom's Taxonomy level tagging
  - Difficulty ratings (1-5 scale)
  - Estimated completion times
  - Prerequisite tracking
  - Learning objective alignment
- **LTI 1.3 Integration**: Learning Tools Interoperability support
  - Platform registration and tool configuration
  - Grade passback for assessments
  - Deep linking capabilities
- **Rights Management**: Content licensing and copyright tracking
  - Document-level and element-level rights metadata
  - Support for Creative Commons and custom licenses

### Documentation
- Reference documentation for new v0.2.0 objects:
  - `AccessibilityMetadata` - Comprehensive accessibility information
  - `AssessmentAccessibilitySettings` - Assessment-specific accommodations
  - `MultipleChoiceContent` - Multiple choice question structure
  - `PedagogicalMetadata` - Cognitive and pedagogical classification
  - `AnswerOption` - Individual answer option structure
- LTI 1.3 integration guide
- Rights management examples
- Comprehensive v0.2.0 example documents

### Changed
- Schema version now accepts both "0.1.0" and "0.2.0"
- Enhanced `XatsObject` with accessibility and rights metadata
- Improved extension system with LTI configuration support

### Technical Improvements
- Full backward compatibility with v0.1.0 documents
- Enhanced validation for assessment content
- Performance optimizations for large documents
- Comprehensive test coverage for all new features

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