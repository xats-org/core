# xats Project Roadmap

**Version:** 3.0 (for xats schema v0.3.0)
**Status:** Living Document

---
 
## 1. Introduction

This document outlines the future direction for the **Extensible Academic Textbook Schema (xats)**. It details planned features, known limitations in the current version, and the long-term vision for the ecosystem. Its purpose is to provide context for current design decisions and to guide future development, ensuring the standard remains relevant, credible, and powerful within the academic and publishing communities.

---

## 2. Recent Completions (v0.2.0 - v0.3.0)

This phase completed the most critical missing features to make **xats** a viable platform for creating and distributing high-quality, pedagogically sound educational content.

### a. ✅ Formal Assessment Vocabulary & Pedagogical Metadata (v0.2.0 - COMPLETED)

**COMPLETED:** The comprehensive assessment framework has been implemented with full pedagogical metadata support.

**Implemented `blockType` URIs:**
- ✅ `https://xats.org/core/blocks/multipleChoice`
- ✅ `https://xats.org/core/blocks/shortAnswer`
- ✅ `https://xats.org/core/blocks/essayPrompt`

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
- ✅ `https://xats.org/core/blocks/caseStudy`
- ✅ `https://xats.org/core/blocks/metacognitivePrompt`

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

## 3. Near-Term Roadmap (v0.4.0 - v0.6.0)

This phase focuses on expanding the ecosystem, improving the scholarly and production lifecycle, and handling more complex use cases.

### a. Production & Scholarly Workflow Integration

For publishers and academics to adopt **xats**, it must integrate with established workflows.
- **Round-Trip Conversion Tooling:** We will need a standard for "round-tripping" content between **xats** and existing formats like InDesign (IDML).
- **Automated Ancillary Generation:** We will define a standard set of `tags` to facilitate the automated generation of ancillary materials (e.g., study guides, slide decks).
- **Formal Peer Review & Annotation Layer:** We will define a core vocabulary for annotations (`suggestion`, `clarification_request`, `minor_revision_needed`) that can be attached to any `XatsObject`, including a `status` property (`"open"`, `"resolved"`) to support the review workflow.
- **Collaborative Project Block:** A new `blockType` will be defined to structure group projects, including fields for roles, deliverables, and peer assessment criteria.

### b. Granular Rights Management & Academic Provenance

Content provenance and rights management are critical for academic integrity and commercial publishing.
- **Standardized Rights Extension:** We will define a standard `extension` for the `Resource` object to hold structured rights information (e.g., `copyrightHolder`, `licenseType`).
- **Content Block History:** We will investigate a standard pattern for tracking the version history of a specific `ContentBlock`, including author, date, and a summary of the change.
- **AI Generation Metadata:** A standard extension will be defined to allow AI-generated content to be explicitly marked as such, including the model used and the prompt.

### c. Advanced Internationalization (v0.4.0)

Building on v0.3.0's i18n foundation for advanced multi-language support.
- **Content Translation:** Standard patterns for multiple language versions within single objects
- **Locale-Specific Rendering:** Locale-aware `renderingHints` and cultural adaptations
- **Translation Workflow:** Integration with professional translation management systems

### d. AI Integration Framework (v0.4.0)

Native support for AI-powered content generation and enhancement.
- **AI Generation Metadata:** Standard marking for AI-generated content with model attribution
- **Content Generation APIs:** Structured interfaces for AI content creation
- **Quality Assurance:** AI-powered validation and content quality assessment
- **Adaptive Content:** AI-driven content personalization based on learner analytics

### e. Advanced Analytics Platform (v0.5.0)

Comprehensive learning analytics and content performance measurement.
- **Learning Analytics Framework:** Detailed student interaction and performance tracking
- **Content Performance Metrics:** Usage patterns, engagement rates, and learning outcome correlations
- **Publisher Analytics:** Commercial metrics for content effectiveness and market performance
- **Privacy-First Design:** GDPR/CCPA compliant analytics with learner consent management

---

## 4. Mid-Term Vision (v0.7.0 - v0.9.0)

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