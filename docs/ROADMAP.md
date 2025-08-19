# xats Project Roadmap

**Version:** 2.0 (for xats schema v0.2.0)
**Status:** Living Document

---
 
## 1. Introduction

This document outlines the future direction for the **Extensible Academic Textbook Schema (xats)**. It details planned features, known limitations in the current version, and the long-term vision for the ecosystem. Its purpose is to provide context for current design decisions and to guide future development, ensuring the standard remains relevant, credible, and powerful within the academic and publishing communities.

---

## 2. Near-Term Roadmap (v0.2.0 - v0.3.0)

This phase focuses on implementing the most critical missing features to make **xats** a viable platform for creating and distributing high-quality, pedagogically sound educational content.

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

### b. Support for Authentic & Formative Assessment (v0.3.0 - IN PROGRESS)

To support modern pedagogy, we are expanding beyond traditional testing formats.
- **New `blockType` for Case Studies:** A core `blockType` (`.../blocks/caseStudy`) will be introduced to structure case-based problems, a cornerstone of higher education in fields like business, law, and medicine.
- **Metacognitive Prompts:** A new `blockType` (`.../blocks/metacognitivePrompt`) will be defined for prompts that encourage student self-reflection (e.g., "What was the most challenging concept in this section and why?").
- **Performance Tasks:** Extended assessment activities that require multiple steps and real-world application.

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

### f. Formal Indexing Support (v0.3.0)

The current `index` placeholder is a simple marker. A more advanced system is needed for professional publishing.
- **New `IndexRun`:** A new run type will be added to `SemanticText` to allow authors to tag a specific word or phrase as indexable.
- **Hierarchical Indexing:** The `IndexRun` will support nested terms and cross-references ("See also:").
- Consider that IndexRuns may be nested within other runs (since it will be targeting a phrase that may be a portion of other runs)

---

## 3. Mid-Term Roadmap (v0.4.0 - v0.9.0)

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

### c. Internationalization (i18n) and Localization (l10n)

A truly universal standard must support multiple languages.
- **Content Translation:** We will define a standard pattern to allow objects to hold multiple language versions of their content.
- **Locale-Specific Rendering:** We will research a mechanism for providing locale-specific `renderingHints`.

---

## 4. Long-Term Vision & Research (v1.0.0 and Beyond)

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