# xats Authoring Guide

**Version:** 1.0 (for xats schema v0.1.0)
**Audience:** Authors, Instructional Designers, and AI Engineers

---

## 1. Introduction

This guide provides best practices for creating effective, semantically rich, and machine-readable documents using the **xats** standard. While the schema defines *what* is possible, this guide explains *how* to use the features to achieve the desired pedagogical and technical outcomes.

## 2. Thinking in `xats`: The Author's Mindset

- **Structure First:** Before writing content, map out your `Units`, `Chapters`, and `Sections`. A clear hierarchy is the foundation of a good `xats` document.
- **Embrace Semantics:** Don't think about what your content will *look like*. Think about what it *is*. Is this a `definition`? An `example`? A `paragraph`? Using the correct `blockType` is the most important part of authoring.
- **Link Everything:** A core strength of `xats` is its interconnectedness. As you write, constantly think about how you can use `ReferenceRun` and `CitationRun` to link concepts together and to outside sources.
- **Define Your Goals:** Even though `learningObjectives` are optional, they are the key to unlocking the full power of the AI ecosystem. If your content is instructional, define them clearly for each chapter to enable automated assessment and content generation.

## 3. Best Practices by Feature

### a. `SemanticText`

- **Keep Runs Small:** A run should be a single, coherent piece of text. Don't put multiple sentences in a single `TextRun` if they can be broken up by a reference or emphasis.
- **Use Emphasis Meaningfully:**
  - Use `EmphasisRun` (`<em>`) for light stress, defining a term for the first time, or for foreign words.
  - Use `StrongRun` (`<strong>`) for concepts of critical importance, key terms, and warnings. Overusing it will dilute its impact.
- **Make Reference Text Descriptive:** The `text` in a `ReferenceRun` should be the natural text of the sentence (e.g., "see the **previous chapter**"), not a generic "click here."

### b. Learning Objectives & Outcomes

- **Outcomes are Broad:** A `LearningOutcome` should be a high-level goal for the entire book or a major unit (e.g., "The learner will be able to analyze 19th-century poetry").
- **Objectives are Specific and Measurable:** A `LearningObjective` should be a concrete, testable skill (e.g., "The learner will be able to identify iambic pentameter in a sonnet").
- **Use Nesting for Clarity:** Break down complex objectives into smaller, nested sub-objectives. This creates a clear knowledge hierarchy for AI tutors.
- **Link Content to Objectives:** Use the `linkedObjectiveIds` property on `Sections` and `ContentBlocks` to create an explicit map between your content and your goals.

### c. `ContentBlock`s

- **Choose the Most Specific Block Possible:** Don't use a generic `paragraph` if a `definition` or `quote` block is more appropriate. The more specific you are, the smarter AI agents can be.
- **Use Placeholders Explicitly:** If you want a Table of Contents, you must add a `Section` in your `frontMatter` and place the `tableOfContents` placeholder block inside it. The schema will not generate one automatically.

### d. For AI Engineers (Prompting)

When prompting a large language model to generate `xats` content, be explicit in your instructions:
- **Request a Specific `blockType`:** "Generate a `ContentBlock` of `blockType: '.../quote'` about the importance of data standards."
- **Ask for Semantic Linking:** "In the generated paragraph, create a `ReferenceRun` that links the text 'data standards' to the `KeyTerm` with `id: 'term-data-standards'`."
- **Demand Metadata:** "For every `ContentBlock` generated, also generate a `description` and an array of relevant `tags`."

By providing these structured instructions, you can guide the AI to produce high-quality, semantically rich `xats` content.