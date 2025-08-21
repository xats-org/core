# xats Core Vocabularies

**Version:** 1.0 (for xats schema v0.1.0)
**Canonical URL:** `https://xats.org/specs/core-vocabularies`

---

## 1. Introduction

This document is the official registry for all core vocabulary URIs defined by the **eXtensible Academic Text Standard (xats)**. These URIs serve as the stable, foundational identifiers for core components of the schema.

While the **xats** standard is designed to be infinitely extensible using custom URIs, this core set provides the common language for interoperability. All compliant renderers and AI agents should be programmed to understand the semantics of these core URIs.

---

## 2. `ContentBlock` Types

These URIs are used in the `blockType` property of `ContentBlock` objects.

### a. Foundational Blocks

- **URI:** `https://xats.org/vocabularies/blocks/paragraph`
  - **Description:** A standard block for prose text. The `content` property must be a `SemanticText` object.

- **URI:** `https://xats.org/vocabularies/blocks/list`
  - **Description:** A list of items. The `content` property must be an object containing `type` (`"ordered"` or `"unordered"`) and `items` (an array of `SemanticText` objects).

- **URI:** `https://xats.org/vocabularies/blocks/image`
  - **Description:** Displays an image from the `resources` repository. The `content` property must contain a `refId` (string) and a `caption` (`SemanticText` object).

- **URI:** `https://xats.org/vocabularies/blocks/table`
  - **Description:** Displays tabular data. The `content` property must contain a `caption` (`SemanticText`), `headers` (array of strings), and `rows` (array of arrays of `SemanticText` objects).

### b. Semantic Callout Blocks

- **URI:** `https://xats.org/vocabularies/blocks/definition`
  - **Description:** A callout for defining a key term. The `content` property must contain a `term` (string) and a `definition` (`SemanticText`).

- **URI:** `https://xats.org/vocabularies/blocks/theorem`
  - **Description:** A callout for a theorem, law, or principle. The `content` property must contain a `label` (string, e.g., "Theorem 4.1") and a `statement` (`SemanticText`).

- **URI:** `https://xats.org/vocabularies/blocks/example`
  - **Description:** A callout for a specific example. The `content` property must be a `SemanticText` object.

- **URI:** `https://xats.org/vocabularies/blocks/quote`
  - **Description:** A callout for a quotation. The `content` property must contain a `quote` (`SemanticText`) and an optional `attribution` (`SemanticText`).

### c. Placeholder Blocks

- **URI:** `https://xats.org/vocabularies/placeholders/tableOfContents`
  - **Description:** A marker indicating where a generated Table of Contents should be inserted. The `content` property must be an empty object (`{}`).

- **URI:** `https://xats.org/vocabularies/placeholders/bibliography`
  - **Description:** A marker indicating where the formatted bibliography should be inserted. The `content` property must be an empty object (`{}`).

- **URI:** `https://xats.org/vocabularies/placeholders/index`
  - **Description:** A marker indicating where a generated index should be inserted. The `content` property must be an empty object (`{}`).

---

## 3. `RenderingHint` Types

These URIs are used in the `hintType` property of `RenderingHint` objects.

- **URI:** `https://xats.org/vocabularies/hints/breakBefore`
  - **Description:** Suggests a layout break before an object.
  - **Value:** A string: `"always"`, `"avoid"`, or `"auto"`.

- **URI:** `https://xats.org/vocabularies/hints/layoutMode`
  - **Description:** Suggests a layout for a container with multiple child elements.
  - **Value:** A string, e.g., `"grid"`, `"carousel"`, `"side-by-side"`.

- **URI:** `https://xats.org/vocabularies/hints/toc`
  - **Description:** Controls an object's inclusion in a generated Table of Contents.
  - **Value:** An object, e.g., `{ "include": false, "shortTitle": "Intro" }`.

---

## 4. Pathway System Vocabularies

- **Triggers (`triggerType`):**
  - `https://xats.org/vocabularies/triggers/onCompletion`
  - `https://xats.org/vocabularies/triggers/onAssessment`
- **Types (`pathwayType`):**
  - `https://xats.org/vocabularies/pathways/remedial`
  - `https://xats.org/vocabularies/pathways/enrichment`
  - `https://xats.org/vocabularies/pathways/prerequisite`
  - `https://xats.org/vocabularies/pathways/standard`

---

## 5. Resource Types

- **URI:** `https://xats.org/vocabularies/resources/image`
- **URI:** `https://xats.org/vocabularies/resources/video`
- **URI:** `https://xats.org/vocabularies/resources/audio`
- **URI:** `https://xats.org/vocabularies/resources/transcript`