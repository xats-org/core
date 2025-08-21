# xats Project Roadmap

**Version:** 4.0 (for xats schema v0.4.0)
**Status:** Living Document
**Last Updated:** 2025-08-20

---
 
## 1. Introduction

This document outlines the future direction for the **eXtensible Academic Text Standard (xats)**. It details planned features, known limitations in the current version, and the long-term vision for the ecosystem. Its purpose is to provide context for current design decisions and to guide future development, ensuring the standard remains relevant, credible, and powerful within the academic and publishing communities.

---

## 2. Recent Completions (v0.2.0 - v0.3.0)

This phase completed the most critical missing features to make **xats** a viable platform for creating and distributing high-quality, pedagogically sound educational content.

### a. ✅ Formal Assessment Vocabulary & Pedagogical Metadata (v0.2.0 - COMPLETED)

**COMPLETED:** The comprehensive assessment framework has been implemented with full pedagogical metadata support.

**Implemented `blockType` URIs:**
- ✅ `https://xats.org/vocabularies/blocks/multipleChoice`
- ✅ `https://xats.org/vocabularies/blocks/shortAnswer`
- ✅ `https://xats.org/vocabularies/blocks/essayPrompt`

**Completed Enhancements for Pedagogical Rigor:**
- ✅ **Cognitive Metadata:** Full support for Bloom's Taxonomy levels, difficulty scaling (1-5), and estimated time requirements
- ✅ **Comprehensive Scoring:** Point values, scoring methods (automatic/manual/hybrid), attempt limits, and penalty structures
- ✅ **Rich Feedback System:** Complete feedback with correct/incorrect responses, hints with point penalties, and detailed explanations
- ✅ **Essay Rubrics:** Structured scoring criteria with performance levels and weighted evaluation
- ✅ **Assessment Analytics:** Built-in support for learning analytics through detailed metadata
- ✅ **Accessibility Compliance:** Comprehensive WCAG 2.1 AA compliance for all assessment types with `AssessmentAccessibilitySettings`

### b. ✅ Support for Authentic & Formative Assessment (v0.3.0 - COMPLETED)

**COMPLETED:** Expanded beyond traditional testing formats to support modern pedagogy.

**Implemented `blockType` URIs:**
- ✅ `https://xats.org/vocabularies/blocks/caseStudy`
- ✅ `https://xats.org/vocabularies/blocks/metacognitivePrompt`

**Completed Features:**
- ✅ **Case Study Blocks:** Complete support for case-based learning with scenarios, stakeholders, timelines, and analysis questions
- ✅ **Metacognitive Prompts:** 8 distinct prompt types for self-reflection and learning strategies
- ✅ **Scaffolding Support:** Sentence starters, examples, and rubrics for student guidance
- ✅ **Pedagogical Integration:** Learning objectives linking and cognitive level specification

### c. ✅ Enhanced Accessibility & Navigation (v0.2.0 - COMPLETED)

**COMPLETED:** Comprehensive accessibility framework ensuring WCAG 2.1 AA compliance.

**Implemented Features:**
- ✅ **Language Support:** Required `language` property with ISO 639-1 codes for WCAG 3.1.1 compliance
- ✅ **Text Direction:** `textDirection` property for proper RTL language rendering (WCAG 3.1.2)
- ✅ **Accessibility Metadata:** Rich `AccessibilityMetadata` with ARIA roles, labels, and landmarks
- ✅ **Navigation Components:** `NavigationContent` and `SkipNavigationContent` for keyboard accessibility
- ✅ **Cognitive Support:** Reading levels, complexity indicators, and simplified content options
- ✅ **Assessment Accessibility:** `AssessmentAccessibilitySettings` with extended time, screen reader support, and alternative input methods

### d. ✅ Rights Management & Content Licensing (v0.2.0 - COMPLETED)

**COMPLETED:** Complete intellectual property and licensing framework for commercial publishing.

**Implemented Features:**
- ✅ **Comprehensive Rights Metadata:** License URIs, copyright holders, and usage permissions
- ✅ **Commercial Publishing Support:** Clear permissions for redistribution, modification, and commercial use
- ✅ **Attribution Framework:** Required attribution formats and license inclusion requirements
- ✅ **Geographic Restrictions:** Support for region-specific licensing agreements
- ✅ **Rights Inheritance:** Object-level rights that can override document-level defaults

### e. ✅ LTI 1.3 Integration Framework (v0.2.0 - COMPLETED)

**COMPLETED:** Foundation for Learning Management System integration through extensions.

**Implemented Features:**
- ✅ **Extension Framework:** Structured extension system with LTI 1.3 schema references
- ✅ **Grade Passback Support:** `ltiGradePassback` extension for Assignment and Grade Services
- ✅ **Deep Linking Support:** `ltiDeepLinking` extension for content selection
- ✅ **Platform Registration:** `ltiConfiguration` for tool setup and registration
- ✅ **Pathway Integration:** `ltiPathwayIntegration` for adaptive learning with grade data

### f. ✅ Formal Indexing Support (v0.3.0 - COMPLETED)

**COMPLETED:** Advanced indexing system for professional publishing.

**Implemented Features:**
- ✅ **IndexRun Type:** New run type in `SemanticText` for marking indexable terms
- ✅ **Hierarchical Indexing:** Support for main terms and sub-terms
- ✅ **Cross-References:** "See also" functionality and redirect support
- ✅ **Machine-Readable:** Structured index entries for automated index generation
- ✅ **Nested Support:** IndexRuns can be embedded within other semantic runs

### g. ✅ File Modularity System (v0.3.0 - COMPLETED)

**NEW FEATURE:** Enterprise-scale document organization capabilities.

**Implemented Features:**
- ✅ **FileReference Support:** `$ref` JSON Pointer syntax for external file references
- ✅ **Metadata Tracking:** `xats:refMetadata` for version and integrity validation
- ✅ **Team Collaboration:** Independent file editing for large textbook projects
- ✅ **Validation Tools:** Comprehensive modular document integrity checking

### h. ✅ Enhanced Internationalization (v0.3.0 - COMPLETED)

**ENHANCED:** Global content support with comprehensive i18n features.

**Implemented Features:**
- ✅ **Language Identification:** ISO 639-1 codes for all content elements
- ✅ **Text Direction Support:** RTL language support for Arabic, Hebrew, etc.
- ✅ **WCAG Compliance:** Full 3.1.1 and 3.1.2 compliance for accessibility
- ✅ **Multi-Language Content:** Mixed language support within documents

### i. ✅ Enhanced Rights Management (v0.3.0 - COMPLETED)

**ENHANCED:** Publisher-ready licensing and attribution framework.

**Implemented Features:**
- ✅ **Granular Permissions:** Fine-grained control over usage rights
- ✅ **Multi-Stakeholder Copyright:** Complex authorship and collaboration support
- ✅ **Attribution Framework:** Required attribution formats and specifications
- ✅ **Commercial Licensing:** Publisher-ready licensing and restriction controls

---

## 3. Near-Term Roadmap (v0.4.0 - v0.7.0)

This phase focuses on modernizing the project infrastructure, expanding the ecosystem, improving the scholarly and production lifecycle, and handling more complex use cases.

### v0.4.0 - Monorepo Infrastructure & Modern Tooling (Target: 2026-03-31)

This release establishes a modern, scalable monorepo architecture using industry best practices and TypeScript throughout, enabling rapid development and ecosystem expansion.

#### a. Monorepo Architecture Migration (CRITICAL PRIORITY)

Complete restructuring of the xats project as a modern TypeScript monorepo with Turborepo.

**Phase 1: Infrastructure Setup (Weeks 1-2)**
- **Turborepo Configuration:** High-performance build system with intelligent caching and parallel execution
- **TypeScript Project References:** Proper type sharing across packages with build-time validation
- **Shared Configurations:** Centralized ESLint, Prettier, and tsconfig for consistency
- **Vitest Testing Framework:** Modern, fast testing with watch mode and coverage reporting
- **Changesets Integration:** Automated versioning and changelog generation for all packages

**Phase 2: Core Package Migration (Weeks 3-4)**
- **@xats-org/schema:** Core JSON Schema definitions with TypeScript type generation
- **@xats-org/validator:** High-performance validation with detailed error reporting
- **@xats-org/types:** Shared TypeScript definitions and interfaces
- **Build Pipelines:** Optimized build processes with Turborepo caching

**Phase 3: Tool Development (Weeks 5-6)**
- **@xats-org/cli:** Command-line interface for validation, conversion, and generation
- **@xats-org/renderer:** Pluggable rendering framework for multiple output formats
- **@xats-org/mcp-server:** Model Context Protocol server for AI integration
- **@xats-org/utils:** Shared utilities and helper functions

**Phase 4: Documentation & Testing (Week 7)**
- **Documentation Migration:** Updated docs reflecting monorepo structure
- **Storybook Integration:** Component documentation and visual testing
- **Integration Tests:** Comprehensive cross-package testing
- **CI/CD Pipelines:** GitHub Actions with matrix testing and automated releases

**Phase 5: Polish & Release (Week 8)**
- **Performance Optimization:** Bundle size analysis and tree-shaking
- **Security Audit:** Dependency scanning and vulnerability assessment
- **Migration Guide:** Comprehensive guide for transitioning from v0.3.0
- **Release Preparation:** Coordinated package releases with Changesets

#### b. Developer Experience Enhancements

Modern tooling and workflows for optimal developer productivity.
- **TypeScript Everywhere:** Full TypeScript coverage with strict mode
- **Automated Type Generation:** JSON Schema to TypeScript type generation
- **Hot Module Replacement:** Fast development iteration with HMR
- **Intelligent IDE Support:** Enhanced autocomplete and inline documentation
- **Monorepo Task Orchestration:** Turborepo for efficient task running
- **Dependency Management:** pnpm workspaces for efficient package management

#### c. Package Architecture

Modular, composable packages for flexible ecosystem growth.
- **Core Packages:**
  - `@xats-org/schema`: JSON Schema definitions
  - `@xats-org/validator`: Validation logic
  - `@xats-org/types`: TypeScript types
- **Tool Packages:**
  - `@xats-org/cli`: Command-line tools
  - `@xats-org/renderer`: Rendering framework
  - `@xats-org/mcp-server`: AI integration
- **Utility Packages:**
  - `@xats-org/utils`: Common utilities
  - `@xats-org/examples`: Example documents
- **Future Packages:** Foundation for ecosystem expansion

### v0.5.0 - Rendering, AI Integration & Extended Features (Target: 2026-09-30)

Building on the monorepo foundation, this release focuses on content rendering, AI integration, and production workflows.

#### a. Enhanced Rendering Hints System (HIGH PRIORITY)

Build out comprehensive rendering hints to help renderers determine and preserve author intent.
- **Semantic Intent Vocabulary:** URI-based vocabulary for author intent (`emphasis`, `warning`, `highlight`, `aside`, `featured`)
- **Pedagogical Roles:** Classification system for content roles (`introduction`, `example`, `summary`, `key-concept`)
- **Prominence Levels:** Granular control over visual emphasis (1-5 scale)
- **Layout Hints:** Suggestions for layout preservation (`keep-together`, `allow-break`, `force-new-page`)
- **Cross-Renderer Consistency:** Standard interpretation guidelines for all renderers
- **Fallback Strategies:** Graceful degradation for unsupported hints

#### b. AI Integration Framework (HIGH PRIORITY)

Native support for AI-powered content orchestration and generation.
- **MCP Server for xats:** Model Context Protocol server for AI agents to work with xats files
  - Read/write/validate xats documents
  - Schema-aware content manipulation
  - Multi-agent orchestration support
  - Content generation templates
- **AI Generation Metadata Extension:** Comprehensive tracking of AI-generated content
  - Model attribution and versioning
  - Prompt preservation and parameters
  - Confidence scores and validation status
  - Human review tracking
- **Agent Orchestration Protocol:** Enable multiple AI agents to collaborate on textbook creation
  - xats as data interchange format
  - Sequential and parallel agent workflows
  - Context preservation between agents
  - Quality gates and validation points
- **Memory & Context Management:** Schema serves as persistent memory for AI workflows
  - Progressive content building
  - Cross-section context awareness
  - Dependency tracking
  - Version control integration

#### c. Enhanced Authoring Experience (Issue #36)

Revolutionary authoring approach through bidirectional renderers, eliminating JSON complexity.
- **Native Tool Authoring:** Authors work entirely in Word, LaTeX, or Markdown
- **Zero JSON Exposure:** Complete abstraction of xats JSON format
- **Visual Web Editor:** HTML renderer enables browser-based visual authoring
- **Template Libraries:** Pre-built templates for common content patterns
- **Real-Time Validation:** Immediate feedback on xats compliance
- **Seamless Round-Tripping:** Edit in any format, maintain full fidelity

#### d. Production & Scholarly Workflow Integration

For publishers and academics to adopt **xats**, it must integrate with established workflows.
- **Round-Trip Conversion Tooling:** Standard for "round-tripping" content between **xats** and existing formats like InDesign (IDML)
- **Automated Ancillary Generation:** Standard set of `tags` to facilitate automated generation of ancillary materials (e.g., study guides, slide decks)
- **Formal Peer Review & Annotation Layer:** Core vocabulary for annotations with workflow status tracking
- **Collaborative Project Block:** New `blockType` for group projects with roles and peer assessment

#### e. Learning Analytics & Progress Tracking

Advanced analytics for learning outcomes and content effectiveness.
- **Learning Analytics Framework:** Detailed student interaction and performance tracking
- **Content Performance Metrics:** Usage patterns, engagement rates, and learning outcome correlations
- **Problem-Based Learning Blocks:** Interactive problem-solving and active learning components
- **Privacy-First Design:** GDPR/CCPA compliant analytics with learner consent management

### v0.6.0 - Analytics, Advanced Pedagogy & Internationalization (Target: 2026-09-30)

Building on the foundation of v0.5.0's bidirectional renderers, this release focuses on advanced pedagogical features and analytics.

#### a. Advanced Analytics Platform

Comprehensive learning analytics and content performance measurement.
- **Learning Analytics Framework:** Detailed student interaction and performance tracking
- **Content Performance Metrics:** Usage patterns, engagement rates, and learning outcome correlations
- **Publisher Analytics:** Commercial metrics for content effectiveness and market performance
- **Privacy-First Design:** GDPR/CCPA compliant analytics with learner consent management

#### b. Advanced Pedagogical Features (Issues #2, #3)

Sophisticated educational enhancements building on v0.2.0's assessment framework.

**Cognitive Level Metadata (Issue #2):**
- **Bloom's Taxonomy Integration:** Tag objectives and assessments with cognitive levels
- **DOK Level Specification:** Depth of Knowledge classification (1-4)
- **Verb Taxonomies:** URI-based vocabulary for learning objective verbs
- **Cognitive Alignment Validation:** Ensure objectives match assessment complexity
- **Progressive Complexity Mapping:** Track cognitive demand throughout content

**Formative Assessment & Feedback Systems (Issue #3):**
- **Multi-Level Hint Systems:** Progressive hints with optional point penalties
- **Misconception-Targeted Feedback:** Pattern-based feedback for common errors
- **Self-Assessment Tools:** Confidence ratings and metacognitive prompts
- **Low-Stakes Practice:** Formative checkpoints with immediate feedback
- **Peer Review Integration:** Structured peer assessment workflows

#### c. Advanced Internationalization

Building on v0.3.0's i18n foundation for advanced multi-language support.
- **Content Translation:** Standard patterns for multiple language versions within single objects
- **Locale-Specific Rendering:** Locale-aware `renderingHints` and cultural adaptations
- **Translation Workflow:** Integration with professional translation management systems

### v0.7.0 - Extended Ecosystem (Target: 2027-01-31)

#### a. Granular Rights Management & Academic Provenance

Content provenance and rights management for academic integrity and commercial publishing.
- **Standardized Rights Extension:** Standard `extension` for structured rights information
- **Content Block History:** Version history tracking for specific `ContentBlock` elements
- **Blockchain Integration:** Immutable provenance tracking for academic content

---

## 4. Mid-Term Vision (v0.8.0 - v0.9.0)

Advanced ecosystem integration and specialized domain support.

### a. Specialized Domain Extensions

Discipline-specific extensions for complex academic fields.
- **STEM Extensions:** Advanced mathematical notation, chemical formulas, and scientific diagrams
- **Medical Education:** Clinical case studies, patient simulations, and medical imaging integration
- **Legal Education:** Case law integration, legal citation standards, and mock trial scenarios
- **Business Education:** Financial modeling, market simulations, and corporate case studies

### b. Immersive Content Support

Next-generation educational content delivery.
- **VR/AR Integration:** Virtual and augmented reality content embedding
- **Interactive Simulations:** Complex educational simulations and virtual laboratories
- **3D Content:** Three-dimensional models and interactive visualizations
- **Gamification Elements:** Achievement systems, progress tracking, and educational games

## 5. Long-Term Vision & Research (v1.0.0 and Beyond)

This phase focuses on the long-term health, governance, and deep integration of the **xats** standard into the academic and publishing landscape.

### a. Content Protection & Distribution Models

The standard must accommodate the business realities of content distribution.
- **Encryption & Access Control:** We will investigate a standard mechanism for referencing encrypted resources, allowing for secure, subscription-based access models.
- **Print-on-Demand (POD) Profile:** We will develop a specific profile of `renderingHints` and best practices tailored for generating high-quality, print-ready PDFs from a `xats` document.

### b. Learning Analytics for Pedagogical & Product Improvement

A digital-first standard must produce data that can be used to improve learning outcomes and business decisions.
- **Formal xAPI Integration:** We will define a core vocabulary of xAPI (Experience API) verbs and statement templates that correspond to interactions with `xats` objects.
- **Publisher-Focused Analytics:** The xAPI profile will include statements relevant to product development, such as tracking time-on-task for specific sections or identifying assessment questions with high failure rates.
- **Ethical Data Framework:** A formal document will be created outlining the ethical considerations and best practices for collecting and analyzing student interaction data.

### c. Deep Ecosystem Integration & Governance

To achieve widespread adoption, **xats** must integrate seamlessly with the tools academics and institutions already use.
- **LMS Integration Profiles:** We will develop official profiles and best-practice guides for integrating `xats` content within major Learning Management Systems (LMS).
- **Repository & Database Connectivity:** We will research a standard `blockType` for creating live, dynamic links to research databases (e.g., JSTOR, PubMed).
- **Governance and Community Stewardship:** A formal governance model will be established, with working groups for specialized disciplines and for publishers to ensure the standard meets the unique needs of different fields and the realities of the market.
- **Official Tooling:** The project will sponsor key open-source tools, including a `xats-validator`, a baseline `xats-renderer-js`, and a `xats-a11y-checker`.
- **AI Agent Collaboration Protocol:** We will propose a simple standard for how different AI agents can hand off `xats` documents to each other in a collaborative pipeline.
- **Decentralized Content Networks:** Blockchain-based content distribution and rights management
- **Quantum-Ready Security:** Post-quantum cryptographic standards for long-term content protection
- **Neural Content Interfaces:** Direct brain-computer interfaces for enhanced learning experiences