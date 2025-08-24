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

## [0.5.0] - 2025-08-24

### Added
- **Bidirectional Rendering Architecture**: Multi-format output with 95%+ round-trip fidelity
  - **HTML**: Modern semantic HTML5 with comprehensive accessibility features and responsive design support
  - **Markdown**: GitHub Flavored Markdown with extensions for educational content
  - **LaTeX**: Professional academic typesetting with automated bibliography formatting
  - **Microsoft Word**: .docx format with proper styling, headings, and cross-references
  - **R Markdown**: Integration with R statistical environment for data-driven educational content
  - Semantic preservation across all formats with intelligent content transformation
  - Automated style mapping and layout optimization for each target format
- **AI Integration with Model Context Protocol (MCP)**: Comprehensive AI-powered content creation
  - **@xats-org/mcp-server**: Dedicated MCP server for xats document processing
  - **Multi-Provider Support**: Anthropic Claude, OpenAI GPT-4, and extensible provider architecture
  - **Content Generation**: AI-powered creation of educational content with schema compliance
  - **Assessment Creation**: Automated generation of questions, rubrics, and feedback from content
  - **Accessibility Analysis**: AI-powered alt text generation and accessibility compliance checking
  - **Content Validation**: Intelligent schema validation with contextual suggestions
  - **Pedagogical Enhancement**: AI suggestions for learning objectives and content structure
- **Enhanced Rendering Hints System**: Advanced layout and presentation controls
  - **Responsive Design**: Multi-device layout with customizable breakpoints and fluid typography
  - **Advanced Accessibility**: Focus management, color contrast validation, and screen reader optimization
  - **Print Optimization**: Professional typesetting with page break control, margin management, and orphan/widow prevention
  - **Layout Controls**: Multi-column layouts, grid systems, and flexible content arrangement
  - **Typography**: Advanced font management, line spacing, and hierarchical text styling
- **Comprehensive WCAG 2.1 AA Compliance**: Automated accessibility validation and enforcement
  - **Real-time Validation**: Continuous accessibility checking during content creation
  - **Color Contrast Analysis**: Automated testing with 4.5:1 minimum and 7:1 enhanced ratios
  - **Focus Management**: Intelligent tab order and focus indicator validation
  - **Screen Reader Optimization**: ARIA label validation and semantic structure verification
  - **Keyboard Navigation**: Full keyboard accessibility with skip links and logical navigation
  - **Alternative Content**: AI-powered alt text generation and long description creation
- **Advanced Package Architecture**: Enhanced monorepo with specialized packages
  - **@xats-org/renderer**: Bidirectional rendering engine with multi-format support
  - **@xats-org/mcp-server**: Model Context Protocol server for AI integration
  - **@xats-org/accessibility**: WCAG compliance validation and remediation tools
  - Enhanced TypeScript support with strict null checks and comprehensive type coverage

### Changed
- **Schema version updated to "0.5.0"** with full backward compatibility for all previous versions
- **Enhanced rendering performance** with optimized content transformation pipelines
- **Improved CLI interface** with new commands for rendering, AI integration, and accessibility validation
- **Expanded test coverage** to 701 tests with comprehensive validation scenarios
- **Enhanced documentation** with interactive examples and comprehensive API reference
- **Improved error messages** with contextual suggestions and remediation guidance
- **Optimized build system** with faster compilation and intelligent caching

### Fixed
- **Multi-format rendering consistency** across all supported output formats
- **AI integration reliability** with improved error handling and fallback mechanisms
- **Accessibility validation accuracy** with comprehensive WCAG 2.1 compliance checking
- **Performance optimization** for large documents and complex rendering scenarios
- **Cross-platform compatibility** issues in CLI tools and rendering engines
- **Memory management** improvements for processing large educational documents

## [0.4.0] - 2025-06-15

### Added
- **Monorepo Architecture**: Comprehensive TypeScript monorepo with Turborepo and pnpm workspaces
  - **@xats-org/schema**: Core JSON Schema definitions with enhanced validation
  - **@xats-org/validator**: Advanced validation logic with detailed error reporting
  - **@xats-org/types**: Comprehensive TypeScript type definitions with strict null checks
  - **@xats-org/cli**: Modern command-line interface with enhanced functionality
  - **@xats-org/utils**: Shared utilities for common operations across packages
  - **@xats-org/examples**: Curated example documents demonstrating all schema features
  - **apps/docs**: Comprehensive documentation site with interactive examples
  - **apps/website**: Official xats.org website with community resources
- **Enhanced Developer Experience**: Modern toolchain with productivity improvements
  - **Turborepo Integration**: Parallel builds with intelligent caching and dependency management
  - **TypeScript First**: Strict type checking with comprehensive coverage across all packages
  - **ESLint & Prettier**: Consistent code quality and formatting standards
  - **Automated Testing**: 650+ tests with comprehensive coverage reporting
  - **pnpm Workspaces**: Efficient dependency management with monorepo optimization
  - **Build Optimization**: Fast, parallel builds with incremental compilation
- **Advanced CLI Features**: Enhanced command-line interface with new capabilities
  - **Modular Validation**: Package-specific validation with detailed error reporting
  - **Batch Processing**: Validate multiple documents with parallel execution
  - **Watch Mode**: Automatic revalidation on file changes for development workflows
  - **Export Utilities**: Schema export in multiple formats for integration
  - **Performance Profiling**: Built-in performance analysis for large documents
- **Documentation Platform**: Comprehensive documentation infrastructure
  - **Interactive Schema Browser**: Explore schema definitions with real-time examples
  - **API Documentation**: Auto-generated documentation from TypeScript definitions
  - **Migration Tools**: Automated migration assistance between schema versions
  - **Community Resources**: Enhanced contributing guidelines and development workflows

### Changed
- **Schema version updated to "0.4.0"** with full backward compatibility for 0.1.0-0.3.0 documents
- **Package structure reorganized** from single @xats-org/core to modular packages
- **Build system modernized** with Turborepo replacing custom build scripts
- **TypeScript configuration enhanced** with strict null checks and improved type safety
- **Development workflow streamlined** with integrated testing and validation
- **Documentation structure improved** with clear separation of user and developer docs
- **Error reporting enhanced** with contextual information and suggested fixes
- **Performance optimized** with parallel processing and intelligent caching

### Fixed
- **TypeScript compilation errors** in complex schema definitions and validation logic
- **Dependency resolution issues** in monorepo structure with proper workspace configuration
- **CLI tool reliability** with improved error handling and user feedback
- **Cross-platform compatibility** issues in build processes and file handling
- **Memory usage optimization** for processing large documents and complex schemas
- **Package publishing** workflow with proper version coordination across packages

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
  - **Case Study Blocks** (`https://xats.org/vocabularies/blocks/caseStudy`):
    - Comprehensive scenario and background support
    - Stakeholder perspectives and timeline tracking
    - Analysis questions with cognitive level specification
    - Resource attachments and exhibits
    - Learning objectives integration
  - **Metacognitive Prompt Blocks** (`https://xats.org/vocabularies/blocks/metacognitivePrompt`):
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