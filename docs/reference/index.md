# xats Schema Reference Guide

Welcome to the official technical reference for the **Extensible Academic Textbook Schema (xats)**. This guide provides a detailed, item-by-item explanation of every object and property within the `v0.2.0` schema, including the comprehensive assessment framework, accessibility features, and LTI 1.3 integration support.

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

## Structural Components
- [Unit](./Unit.md) - High-level organizational containers
- [Chapter](./Chapter.md) - Major content divisions with learning objectives
- [Section](./Section.md) - Subdivisions within chapters containing content blocks

## Pedagogical Components
- [LearningOutcome](./LearningOutcome.md) - Broad capabilities students should possess
- [LearningObjective](./LearningObjective.md) - Specific, measurable learning goals
- [Pathway](./Pathway.md) - Adaptive learning routes with conditional logic

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

## Rights and Licensing (v0.2.0)
- [RightsMetadata](./RightsMetadata.md) - Comprehensive intellectual property and licensing information

## Bibliographic Components
- [CslDataItem](./CslDataItem.md) - Citation Style Language bibliographic entries

## Top-Level Book Structure
- [FrontMatter](./FrontMatter.md) - Preface, dedication, table of contents
- [BodyMatter](./BodyMatter.md) - Main instructional content organization
- [BackMatter](./BackMatter.md) - Appendices, glossary, bibliography

---

## What's New in v0.2.0

- **Comprehensive Assessment Framework**: Support for multiple choice, short answer, and essay assessments with rich metadata
- **Enhanced Accessibility**: WCAG 2.1 compliance features and assistive technology support
- **Navigation Systems**: Semantic navigation landmarks and skip navigation for keyboard users
- **Rights Management**: Detailed licensing and intellectual property metadata
- **LTI 1.3 Integration**: Support for Learning Management System interoperability (see extensions documentation)
- **Improved Text Semantics**: Enhanced inline formatting with emphasis, strong, and citation runs