# xats Architectural Decision Record (ADR)

**Version:** 1.0 (for xats schema v0.1.0)
**Status:** Living Document

---

## 1. Introduction

This document records the major architectural decisions made during the design of the **eXtensible Academic Text Standard (xats)**. Its purpose is to provide a stable reference for current and future contributors, ensuring that the core philosophy of the standard is understood and maintained. Each decision includes the context, the trade-offs considered, and the final rationale.

---

## 2. ADR-001: Semantic Containers vs. Generic Containers

* **Context:** A core decision was how to model the primary structure of a book (e.g., `Units`, `Chapters`, `Sections`).
* **Decision:** We chose to define distinct, semantically meaningful objects (`Unit`, `Chapter`, `Section`) rather than a single, generic, recursive `Section` or `Node` object.
* **Rationale:**
    * **Clarity of Purpose:** A generic model would force consumers (AI agents, renderers) to inspect an object's properties to guess its purpose. The current model provides a clear "contract": a `Chapter` is the place for `learningObjectives`; a `Section` is the place for `content`.
    * **Simplified Tooling:** This specificity makes it vastly simpler to build reliable tools. An AI agent tasked with creating a study guide can be given a simple, unambiguous instruction: "Extract the `title` and `learningObjectives` from all `Chapter` objects."
    * **Trade-off:** We sacrificed a degree of structural flexibility for a massive gain in semantic clarity and predictability, which is the correct trade-off for a machine-readable standard.

---

## 3. ADR-002: Open Vocabularies (URIs) vs. Closed Vocabularies (Enums)

* **Context:** The schema needed a way to define controlled lists for properties like `blockType`, `resourceType`, and `pathwayType`.
* **Decision:** All controlled vocabularies are identified by URIs, not by a hard-coded `enum` list.
* **Rationale:**
    * **Decentralized Extensibility:** Hard-coded `enum`s create a "closed world" where innovation is bottlenecked by the standards committee. The URI model allows any community to define, host, and use their own custom types without permission, fostering a rich ecosystem.
    * **Self-Documentation:** A URI can resolve to a human-readable definition, making the schema self-documenting.
    * **Future-Proofing:** The standard does not need to be updated every time a new type of content or resource is invented.

---

## 4. ADR-003: Adoption of CSL-JSON for Bibliographic Data

* **Context:** The schema required a robust system for handling academic citations.
* **Decision:** We chose to adopt the established **Citation Style Language (CSL-JSON)** standard for all bibliographic entries, including the textbook's own metadata.
* **Rationale:**
    * **Don't Reinvent the Wheel:** Bibliographic data is an incredibly complex, solved problem. Creating a proprietary format would have been inefficient and arrogant.
    * **Instant Interoperability:** Adopting CSL-JSON makes **xats** immediately compatible with a vast ecosystem of academic tools like Zotero and Mendeley.
    * **Separation of Data and Style:** CSL is designed to separate raw data from presentational styling. This aligns perfectly with our core philosophy, allowing a renderer to format the same `xats` document in APA, MLA, or any other style.

---

## 5. ADR-004: `SemanticText` Model for In-line Content

* **Context:** Prose content needed a way to embed rich, machine-readable meaning, such as links and emphasis.
* **Decision:** We replaced simple string properties for prose with the `SemanticText` object, which contains an array of typed "runs." We explicitly decided *against* allowing a field to be `oneOf` a string or a `SemanticText` object.
* **Rationale:**
    * **Consumer Consistency:** While allowing a simple string is more convenient for authors in the simplest cases, it pushes massive complexity downstream. Every single consumer of the data would have to write logic to handle two different data types for the same conceptual field.
    * **Predictability:** By enforcing the `SemanticText` structure, we guarantee that the `content` of a paragraph is *always* an object with a `runs` array. This predictability is critical for building a reliable ecosystem of tools. The slight verbosity for the author is a small price to pay for universal consistency for the consumer.

---

## 6. ADR-005: Universal Metadata and Inheritance

* **Context:** Many objects throughout the schema required the same set of metadata properties (`id`, `tags`, `extensions`, etc.).
* **Decision:** We created a foundational `XatsObject` to house all universal metadata and used an inheritance model (`allOf`) to apply it consistently to all major components.
* **Rationale:**
    * **DRY (Don't Repeat Yourself):** This architectural pattern makes the schema itself cleaner, more maintainable, and less prone to error.
    * **Guaranteed Features:** It provides a guarantee to developers that any major object they encounter will have a consistent set of core properties, simplifying agent and tool development.

---

## 7. ADR-006: Optional Pedagogy

* **Context:** The schema initially required `learningObjectives` on every `Chapter`, enforcing modern pedagogical best practices.
* **Decision:** The `learningObjectives` property was made **optional**.
* **Rationale:** Requiring objectives created a significant barrier for adoption. It made it impossible to faithfully represent historical texts or modern narrative-driven works without inventing objectives that were not part of the original author's intent. The final decision was to **enable best practices, not enforce them** at the cost of excluding valid content. This makes the standard truly universal and backwards-compatible with the existing corpus of human knowledge.

---

## 8. ADR-007: Rendering Intent vs. Presentation

* **Context:** Authors needed a way to communicate presentational intent (e.g., "start this on a new page") without violating the strict separation of content and style.
* **Decision:** We introduced the `renderingHints` system.
* **Rationale:** We determined that providing **high-level, semantic hints** about the author's structural intent (e.g., `breakBefore: "always"`) is fundamentally different from hard-coding specific styles (e.g., `margin-top: "2in"`). This system provides necessary context to the renderer without compromising the portability of the content, walking the line between intent and presentation without crossing it.

---

## 9. ADR-008: Placeholders for Generated Content

* **Context:** Content like a Table of Contents or a formatted Bibliography is generated by the renderer, not authored manually. The schema needed a way to tell the renderer *if* and *where* to place this content.
* **Decision:** We created the "placeholders" `blockType` (e.g., `https://xats.org/vocabularies/placeholders/tableOfContents`).
* **Rationale:** This pattern creates an explicit, unambiguous instruction in the document structure. It correctly keeps the generated content out of the source file (preventing data from becoming stale) while giving the author full control over its placement.

---

## 10. ADR-009: Flexible Containers for Ancillary Content

* **Context:** The `FrontMatter` and `BackMatter` objects were initially too rigid, with a fixed set of properties for specific sections like a `preface`.
* **Decision:** We redesigned them to be flexible containers holding a generic `sections` array.
* **Rationale:** It is impossible to predict every type of ancillary section an author might want to include. The flexible container model allows authors to add any section (e.g., a `Dedication`, `Epigraph`, `About the Author`) simply by creating a `Section` with the appropriate `title`, making the standard infinitely more extensible.

---

## 11. ADR-010: Universal Labeling System

* **Context:** The schema originally used restrictive, numeric-only properties like `chapterNumber` and `sectionNumber`.
* **Decision:** We replaced these with a single, optional `label` property on the `StructuralContainer`.
* **Rationale:** This decision was made to support the vast diversity of real-world documents that use Roman numerals (I, II, III), letters (A, B, C), or even words ("Introduction") as their section identifiers. It correctly separates the *sequence* of an object (its order in an array) from its *display label*, making the schema more flexible and universal.

---

## 12. ADR-011: Choice of JSON as the Base Format

* **Context:** A foundational choice of data interchange format was required. Many legacy publishing standards use XML.
* **Decision:** We chose **JSON** as the exclusive format for the **xats** standard.
* **Rationale:** JSON's lightweight syntax, ease of parsing in modern programming languages (especially JavaScript), and native support in web APIs and AI/ML workflows make it the superior choice for a forward-looking, developer-focused standard. The trade-off was a departure from some legacy publishing systems in favor of a much lower barrier to entry for the AI and web development communities we aim to serve.

---

## 13. ADR-012: Architectural Stance on Accessibility (WCAG)

* **Context:** We needed to define the schema's role in ensuring content conforms to accessibility standards like WCAG.
* **Decision:** The schema's role is to **enable, not enforce,** accessibility.
* **Rationale:** The standard provides the necessary semantic hooks for accessibility (e.g., `altText` on resources, a clear heading hierarchy via `StructuralContainer`s, semantic emphasis runs). However, it does not attempt to validate the *quality* of that content (e.g., if the alt text is meaningful). This is a deliberate separation of concerns: the schema enforces the presence of the *fields*, but the responsibility for creating accessible content and rendering it accessibly lies with the authors, AI agents, and rendering platforms.

---

## 14. ADR-013: Distinction Between Internal and External Linking

* **Context:** Within the `SemanticText` model, we needed to handle links to other parts of the same book and links to outside sources.
* **Decision:** We created two distinct run types: **`ReferenceRun`** for internal links and **`CitationRun`** for external bibliographic links.
* **Rationale:** This separation is critical for machine readability. It creates a clear, unambiguous signal about the nature of a link. An AI agent knows that a `ReferenceRun` points to another `XatsObject` within the document's own knowledge graph. Conversely, it knows that a `CitationRun` points to an external source in the `bibliography`. A single, generic "link" object would have been too ambiguous.