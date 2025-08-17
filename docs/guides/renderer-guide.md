# xats Renderer & Consumer Guide

**Version:** 1.0 (for xats schema v0.1.0)
**Audience:** Developers building renderers, LMS integrations, and AI tools.

---

## 1. Introduction

This guide provides best practices for consuming and interpreting `xats` documents. The schema is designed to be predictable and robust, but a successful implementation depends on understanding its core architectural principles.

## 2. Core Responsibilities of a Consumer

A `xats` consumer (e.g., a web renderer, a PDF generator, an AI agent) is responsible for:
1.  **Parsing the Semantic Structure:** Traversing the `Unit`, `Chapter`, and `Section` hierarchy.
2.  **Interpreting `ContentBlock`s:** Rendering content based on the `blockType` URI.
3.  **Handling `SemanticText`:** Assembling runs into a coherent view and resolving references.
4.  **Generating Content from Placeholders:** Creating and inserting items like the Table of Contents.
5.  **Executing `Pathway`s:** Implementing the logic for adaptive content.
6.  **Graceful Fallbacks:** Handling unknown or custom URIs without crashing.

## 3. Best Practices by Feature

### a. Handling Open Vocabularies (URIs)

The most important principle is to **never assume a closed world**. Your application will encounter URIs it does not recognize.

- **`blockType`:** Your renderer should have a registry of core `blockType`s it knows how to render.
  - **If a URI is recognized:** Render the specialized component (e.g., an interactive code block).
  - **If a URI is NOT recognized (Graceful Fallback):** Do not fail. Instead, inspect the `content` object. If it contains a `runs` property, you can safely render it as a paragraph. If not, you can render a simple "Unsupported Content Block" message or display the raw JSON.
- **`renderingHints`:** Your renderer should only act on `hintType` URIs that it explicitly understands. Ignore all others.

### b. Rendering `SemanticText`

When processing a `SemanticText` object's `runs` array:
1.  Iterate through the array.
2.  For a `TextRun`, append the text to the output.
3.  For an `EmphasisRun` or `StrongRun`, wrap the text in the appropriate semantic HTML (`<em>`, `<strong>`) or apply the equivalent styling.
4.  For a `ReferenceRun`, create a hyperlink. The link's destination should be the HTML element with the `id` matching the `refId`.
5.  For a `CitationRun`, look up the `refId` in the `backMatter.bibliography`. Use a CSL processing engine (like `citeproc-js`) and the top-level `citationStyle` to generate the correct in-line citation text, then wrap it in a hyperlink to the full entry in the rendered bibliography.

### c. Generating Content

- **Table of Contents:** When you encounter a `tableOfContents` placeholder, your application should:
  1.  Traverse the entire `bodyMatter`.
  2.  Collect all `StructuralContainer` objects (`Unit`, `Chapter`, `Section`).
  3.  Check each object's `renderingHints` to see if it should be excluded from the TOC.
  4.  Build a nested list of hyperlinks based on the hierarchy.
  5.  Insert this generated list in place of the placeholder block.
- **Bibliography:** When you encounter a `bibliography` placeholder, your application should:
  1.  Read the `backMatter.bibliography` array of CSL-JSON objects.
  2.  Use a CSL processing engine and the `citationStyle` to format the full list.
  3.  Insert the formatted list in place of the placeholder.

### d. Executing Pathways

A platform that supports adaptive learning must have a pathway execution engine.
1.  At the end of a `StructuralContainer`, check for a `pathways` property.
2.  Listen for the specified `triggerType`.
3.  If triggered, evaluate the `rules` in order.
4.  The first rule whose `condition` evaluates to true determines the next step. Redirect the user to the `destinationId`.
5.  Your engine must maintain a state (e.g., quiz scores, user choices) that the `condition` strings can be evaluated against.