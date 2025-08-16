# Contributing to xats

First off, thank you for considering contributing to the **Extensible Academic Textbook Schema (xats)**. This project is a community effort, and we welcome any contribution, from fixing typos in the documentation to proposing major architectural changes.

This document provides a set of guidelines for contributing to the project.

---

## Code of Conduct

By participating in this project, you are expected to uphold our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before you start.

---

## How Can I Contribute?

### Reporting Bugs or Suggesting Enhancements

If you find a bug in the schema or documentation, or if you have an idea for an enhancement, the best way to start is by **opening an issue** on our GitHub repository.

Please be as detailed as possible. For bugs, include steps to reproduce the issue. For enhancements, provide a clear and detailed description of the feature you're proposing and the problem it solves, referencing the [Architectural Decision Record (ADR)](./ARCHITECTURE.md) where appropriate.

### Proposing Changes

1.  **Fork the repository** on GitHub.
2.  **Create a new branch** for your changes (`git checkout -b feature/my-new-feature`).
3.  **Make your changes** to the schema or documentation.
4.  **Submit a pull request (PR)** to the `main` branch.
5.  **Link the PR to the relevant issue.**

A member of the standards committee will review your PR. We may suggest some changes or improvements.

---

## Proposing a New Core Vocabulary URI

The bar for adding a new URI to the core vocabulary is high, as it must be broadly applicable across multiple disciplines.

1.  **Start with a custom URI.** The best way to prove the utility of a new type is to define it in your own namespace and use it in real-world projects.
2.  **Open an issue** with the label "Vocabulary Proposal."
3.  **Provide a detailed rationale:**
    * The full URI you are proposing (e.g., `https://xats.org/core/blocks/new-block`).
    * A clear description of its purpose.
    * For `blockType`s, a complete JSON Schema for its `content` object.
    * Examples of its use and evidence of its adoption by the community.
4.  The proposal will be discussed by the committee and the community.

---

## Versioning Strategy

The **xats** standard follows **Semantic Versioning (SemVer)**.
- **MAJOR** version (e.g., `1.0.0` -> `2.0.0`) for incompatible, breaking changes to the schema.
- **MINOR** version (e.g., `1.0.0` -> `1.1.0`) for adding new, backward-compatible functionality.
- **PATCH** version (e.g., `1.0.0` -> `1.0.1`) for backward-compatible bug fixes or clarifications in the documentation.