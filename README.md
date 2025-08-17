# Extensible Academic Textbook Schema (xats)

**Version:** 0.1.0
**Status:** In Development
**Pronunciation:** "cats"

[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)

---

## 1. Abstract

The **Extensible Academic Textbook Schema (xats)** is a JSON-based standard for defining the structure and content of educational materials. It is designed from the ground up to be a universal, machine-readable blueprint for a new generation of AI-driven educational tools. Its core purpose is to create a deeply semantic, interconnected, and extensible format that allows AI agents to reliably generate, deconstruct, and repurpose educational content into a wide array of products, such as videos, quizzes, and personalized learning paths.

This project is a community-driven effort to create an open standard for the future of educational publishing.

---

## 2. The `xats` Philosophy

Traditional document formats are designed for human consumption and visual layout. They are often "black boxes" to machines, making it difficult to parse their underlying pedagogical structure. **xats** was created to solve this problem by adhering to a set of core architectural principles.

To understand the "why" behind the schema's design, please read the full **[Architectural Decision Record (ADR)](./docs/ARCHITECTURE.md)**.

---

## 3. Getting Started

### a. The Schema

The official JSON Schema file for the current version can be found at:
**[`/core/schemas/0.1.0/xats.json`](./core/schemas/0.1.0/xats.json)**

The latest released version of the JSON Schema should be available using the url:
"[https://xats.org/core/schemas/latest/xats.json](https://xats.org/core/schemas/latest/xats.json)"

### b. Documentation

Complete schema documentation can be found in this repository. Documentation is organized to serve both contributors and consumers of the schema.

- **[Contributing Guide](./CONTRIBUTING.md):** Document explaining the process and rules for contributing to this project.
- **[Architectural Decision Record (ADR)](./docs/ARCHITECTURE.md)**: Rationale for the architecture of xats and related components.
- **[Quickstart Tutorial](./docs/QUICKSTART_TUTORIAL.md):** The best place to start. A hands-on guide to creating your first `xats` document.
- **[Authoring Guide](./docs/guides/authoring-guide.md):** Best practices for authors and AI agents creating `xats` content.
- **[Schema Reference Guide](./docs/reference/index.md):** The complete, exhaustive reference for every object and property in the schema.

### c. A Minimal Example

This example shows a simple, valid `xats` document with a single chapter and section.

```json
{
  "schemaVersion": "0.1.0",
  "bibliographicEntry": {
    "id": "example-book-01",
    "type": "book",
    "title": "A Brief Introduction"
  },
  "subject": "Example",
  "bodyMatter": {
    "contents": [
      {
        "id": "ch-1",
        "label": "1",
        "title": "The First Chapter",
        "sections": [
          {
            "id": "sec-1-1",
            "label": "1.1",
            "title": "Hello, xats",
            "content": [
              {
                "id": "block-1-1-a",
                "blockType": "[https://xats.org/core/blocks/paragraph](https://xats.org/core/blocks/paragraph)",
                "content": {
                  "runs": [
                    {
                      "type": "text",
                      "text": "This is the first paragraph."
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

## 4. Contributing

This is an open project, and we welcome contributions of all kinds. Please see our **[Contributing Guide](./CONTRIBUTING.md)** to learn how to participate.

All contributors are expected to uphold our **[Code of Conduct](./CODE_OF_CONDUCT.md)**.

---

## 5. Project Vision

To see the future direction of the standard, including planned features and long-term goals for the ecosystem, please read our **[Project Roadmap](./docs/ROADMAP.md)**.