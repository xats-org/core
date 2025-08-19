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
- **Core Assessment Framework**: Built-in assessment capabilities
  - Multiple question types (multiple choice, true/false, short answer, essay)
  - Automatic scoring and grade calculation
  - LTI grade passback integration
  - Rubric support for essay questions
  - Feedback and hint systems
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
- Schema version updated to "0.2.0"
- Improved TypeScript type definitions
- Enhanced CLI validator with accessibility checks
- Updated all example documents with new features
- Expanded test coverage to include all new features

### Fixed
- Accessibility test validation for generic heading text
- Alt text quality validation for redundant phrases
- Language code validation using BCP 47 format
- Schema reference resolution for extension types

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