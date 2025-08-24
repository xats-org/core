# xats Schema Reference Guide

Welcome to the official technical reference for the **eXtensible Academic Text Standard (xats)**. This guide provides a detailed, item-by-item explanation of every object and property within the schema, including the comprehensive assessment framework, accessibility features, and LTI 1.3 integration support.

**Current Version:** v0.3.0  
**Previous Versions:** v0.2.0, v0.1.0

Use the links below to navigate to the detailed specification for each definition.

## Foundational Objects
- [XatsObject](./XatsObject.md) - Base object for all addressable components with universal metadata
- [RenderingHint](./RenderingHint.md) - Guidance for content presentation and styling
- [StructuralContainer](./StructuralContainer.md) - Base for all structural textbook components
- [ContentBlock](./ContentBlock.md) - Individual content units within sections

## Text and Semantic Content
- [SemanticText](./SemanticText.md) - Structured text with inline formatting and references
- [TextRun](./TextRun.md) - Basic plain text spans
- [ReferenceRun](./ReferenceRun.md) - Inline cross-references to other content
- [CitationRun](./CitationRun.md) - Inline citations to bibliographic entries
- [EmphasisRun](./EmphasisRun.md) - Text with emphasis formatting (italic)
- [StrongRun](./StrongRun.md) - Text with strong emphasis formatting (bold)
- [IndexRun](./IndexRun.md) - Indexable text markers for professional publishing *(v0.3.0)*

## Structural Components
- [Unit](./Unit.md) - High-level organizational containers
- [Chapter](./Chapter.md) - Major content divisions with learning objectives
- [Section](./Section.md) - Subdivisions within chapters containing content blocks
- [FileReference](./FileReference.md) - External file references for modular documents *(v0.3.0)*

## Pedagogical Components
- [LearningOutcome](./LearningOutcome.md) - Broad capabilities students should possess
- [LearningObjective](./LearningObjective.md) - Specific, measurable learning goals
- [Pathway](./Pathway.md) - Adaptive learning routes with conditional logic
- [PedagogicalMetadata](./PedagogicalMetadata.md) - Cognitive and pedagogical classification *(v0.2.0)*

## Content Components
- [Resource](./Resource.md) - Shared multimedia assets and files
- [KeyTerm](./KeyTerm.md) - Important vocabulary with definitions

## Assessment Framework (v0.2.0)

### Assessment Types
- [MultipleChoiceContent](./MultipleChoiceContent.md) - Single or multi-select choice questions
- [ShortAnswerContent](./ShortAnswerContent.md) - Brief text, numeric, or equation responses
- [EssayPromptContent](./EssayPromptContent.md) - Extended written responses with rubrics

### Assessment Metadata
- [CognitiveMetadata](./CognitiveMetadata.md) - Bloom's taxonomy, difficulty, and learning characteristics
- [ScoringStructure](./ScoringStructure.md) - Point values, scoring methods, and attempt limits
- [FeedbackStructure](./FeedbackStructure.md) - Student feedback, hints, and explanations
- [EssayRubric](./EssayRubric.md) - Structured scoring criteria for written work

## Navigation and Accessibility (v0.2.0)

### Navigation Components
- [NavigationContent](./NavigationContent.md) - Semantic navigation landmarks and menus
- [NavigationItem](./NavigationItem.md) - Individual navigation links with hierarchy
- [SkipNavigationContent](./SkipNavigationContent.md) - Keyboard shortcuts for accessibility

### Accessibility Features
- [AccessibilityMetadata](./AccessibilityMetadata.md) - WCAG compliance and assistive technology support
- [AssessmentAccessibilitySettings](./AssessmentAccessibilitySettings.md) - Assessment-specific accessibility options

## Rights and Licensing (v0.2.0/v0.3.0)
- [RightsMetadata](./RightsMetadata.md) - Comprehensive intellectual property and licensing information *(enhanced in v0.3.0)*

## Active Learning Framework (v0.5.0)

### Problem-Based Learning
- [ProblemScenarioContent](./ProblemScenarioContent.md) - Comprehensive problem-based learning scenarios with multi-phase structure, stakeholder analysis, and authentic constraints

### Skill Acquisition and Transfer
- [WorkedExampleContent](./WorkedExampleContent.md) - Step-by-step worked examples with progressive fading and scaffolded practice problems

### Collaborative Learning
- [ThinkPairShareContent](./ThinkPairShareContent.md) - Three-phase collaborative activities promoting peer learning and synthesis

### Applied Analysis
- [CaseStudyContent](./CaseStudyContent.md) - Enhanced case study scenarios with sophisticated stakeholder modeling and professional decision-making contexts *(enhanced in v0.5.0)*

## Pedagogical Content Types (v0.3.0)

### Reflective Learning 
- [MetacognitivePromptContent](./MetacognitivePromptContent.md) - Self-reflection prompts with scaffolding and assessment
- [PedagogicalMetadata](./PedagogicalMetadata.md) - Extended pedagogical classification and instructional methods

## Bibliographic Components
- [CslDataItem](./CslDataItem.md) - Citation Style Language bibliographic entries

## Top-Level Book Structure
- [FrontMatter](./FrontMatter.md) - Preface, dedication, table of contents
- [BodyMatter](./BodyMatter.md) - Main instructional content organization
- [BackMatter](./BackMatter.md) - Appendices, glossary, bibliography

---

## What's New in v0.5.0

- **Active Learning Framework**: Four new block types for evidence-based active learning methodologies
- **Problem-Based Learning**: Comprehensive scenarios with multi-phase structure and stakeholder analysis
- **Worked Examples with Fading**: Progressive scaffolding system for skill acquisition and transfer
- **Think-Pair-Share Activities**: Structured collaborative learning with three-phase engagement
- **Enhanced Case Studies**: Professional decision-making scenarios with sophisticated stakeholder modeling

## What's New in v0.3.0

- **File Modularity System**: Split large textbooks across multiple JSON files with `FileReference` support
- **Enhanced Internationalization**: Language identification and text direction support for global content
- **Advanced Indexing**: New `IndexRun` type in SemanticText for professional publishing with hierarchical structure
- **New Pedagogical Content Types**: Case study blocks for applied learning and metacognitive prompt blocks for self-reflection
- **Enhanced Rights Management**: Granular licensing control with multi-stakeholder copyright support
- **Expanded Accessibility**: Comprehensive cognitive support and assessment accommodation features

## What's New in v0.2.0

- **Comprehensive Assessment Framework**: Support for multiple choice, short answer, and essay assessments with rich metadata
- **Enhanced Accessibility**: WCAG 2.1 compliance features and assistive technology support
- **Navigation Systems**: Semantic navigation landmarks and skip navigation for keyboard users
- **Rights Management**: Detailed licensing and intellectual property metadata
- **LTI 1.3 Integration**: Support for Learning Management System interoperability (see extensions documentation)
- **Improved Text Semantics**: Enhanced inline formatting with emphasis, strong, and citation runs
