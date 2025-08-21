---
layout: home

hero:
  name: "xats"
  text: "Extensible Academic Textbook Schema"
  tagline: "A JSON-based standard for deeply semantic, machine-readable educational materials"
  image:
    src: /logo.svg
    alt: xats logo
  actions:
    - theme: brand
      text: Quick Start
      link: /getting-started/quickstart
    - theme: alt
      text: View on GitHub
      link: https://github.com/xats-org/core

features:
  - icon: 📚
    title: Semantic Structure
    details: Rich, hierarchical document structure with Units, Chapters, and Sections that maintain semantic meaning across different rendering contexts.
    
  - icon: 🔗
    title: URI-based Vocabularies
    details: Extensible vocabulary system using URIs for block types, assessment types, and content classifications enabling decentralized innovation.
    
  - icon: 🎯
    title: Assessment Framework
    details: Built-in assessment capabilities with multiple question types, adaptive pathways, and comprehensive analytics support.
    
  - icon: ♿
    title: Accessibility First
    details: WCAG 2.1 AA compliant by design with comprehensive screen reader support, alternative text requirements, and semantic markup.
    
  - icon: 🌐
    title: Internationalization
    details: Native support for multiple languages, right-to-left text, locale-specific formatting, and cultural adaptation.
    
  - icon: 🔄
    title: Migration Tools
    details: Comprehensive migration utilities and compatibility layers for seamless upgrades between schema versions.
    
  - icon: 🛠️
    title: Developer Tools
    details: Complete TypeScript definitions, validation libraries, CLI tools, and rendering frameworks for rapid development.
    
  - icon: 📖
    title: File Modularity
    details: Split large textbooks across multiple files while maintaining cross-references and consistent navigation.
    
  - icon: 🤖
    title: AI Integration
    details: Model Context Protocol (MCP) server for seamless integration with AI tools and educational technology platforms.
---

## What is xats?

The **Extensible Academic Textbook Schema (xats)** is a comprehensive JSON-based standard designed specifically for educational content. It provides a deeply semantic, machine-readable format that enables AI-driven educational tools to generate, deconstruct, and repurpose educational materials with unprecedented precision.

## Quick Example

```json
{
  "schemaVersion": "0.4.0",
  "bibliographicEntry": {
    "type": "book",
    "title": "Introduction to Computer Science",
    "author": [{"literal": "Jane Doe"}]
  },
  "subject": "Computer Science",
  "bodyMatter": {
    "contents": [
      {
        "id": "unit-1",
        "label": "Unit 1",
        "title": {
          "runs": [{"type": "text", "text": "Programming Fundamentals"}]
        },
        "chapters": [
          {
            "id": "chapter-1-1",
            "label": "Chapter 1",
            "title": {
              "runs": [{"type": "text", "text": "Variables and Data Types"}]
            },
            "contentBlocks": [
              {
                "id": "intro-paragraph",
                "blockType": "https://xats.org/core/blocks/paragraph",
                "content": {
                  "text": {
                    "runs": [
                      {
                        "type": "text",
                        "text": "In programming, variables are containers for storing data values."
                      }
                    ]
                  }
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

## Key Benefits

### For Educators
- **Semantic Authoring**: Create content that maintains meaning across different platforms
- **Accessibility Compliance**: Built-in WCAG 2.1 AA support ensures inclusive design
- **Assessment Integration**: Native support for quizzes, assignments, and adaptive learning
- **Reusability**: Modular content that can be repurposed across courses and institutions

### For Developers
- **Type Safety**: Complete TypeScript definitions for all schema objects
- **Validation**: Comprehensive JSON Schema validation with detailed error reporting
- **Extensibility**: URI-based vocabulary system for custom content types
- **Tooling**: CLI tools, rendering frameworks, and integration libraries

### For Institutions
- **Standards Compliance**: Aligns with educational technology standards and best practices
- **Vendor Independence**: Open standard prevents vendor lock-in
- **Migration Support**: Tools and guidance for transitioning between versions
- **Interoperability**: Works with existing LMS and educational technology infrastructure

## Current Version: 0.4.0

The latest version includes:

- **Monorepo Architecture**: Modern TypeScript monorepo with optimized build system
- **Enhanced Type System**: Improved TypeScript definitions and validation
- **AI Integration**: Model Context Protocol server for AI tool integration
- **Developer Experience**: Better tooling, documentation, and development workflow
- **Performance**: Optimized validation and rendering performance

## Package Ecosystem

| Package | Description | NPM |
|---------|-------------|-----|
| [@xats/schema](./packages/schema/) | Core JSON Schema definitions | ![npm](https://img.shields.io/npm/v/@xats/schema) |
| [@xats/validator](./packages/validator/) | Validation logic and error reporting | ![npm](https://img.shields.io/npm/v/@xats/validator) |
| [@xats/types](./packages/types/) | TypeScript type definitions | ![npm](https://img.shields.io/npm/v/@xats/types) |
| [@xats/cli](./packages/cli/) | Command-line interface | ![npm](https://img.shields.io/npm/v/@xats/cli) |
| [@xats/renderer](./packages/renderer/) | Rendering framework | ![npm](https://img.shields.io/npm/v/@xats/renderer) |
| [@xats/mcp-server](./packages/mcp-server/) | Model Context Protocol server | ![npm](https://img.shields.io/npm/v/@xats/mcp-server) |

## Getting Started

<div class="tip custom-block" style="padding-top: 8px">

Just want to try it out? Skip to the [Quickstart Guide](./getting-started/quickstart.md).

</div>

### Installation

Install the core packages using your preferred package manager:

::: code-group

```bash [npm]
npm install @xats/schema @xats/validator @xats/types
```

```bash [yarn]
yarn add @xats/schema @xats/validator @xats/types
```

```bash [pnpm]
pnpm add @xats/schema @xats/validator @xats/types
```

:::

### Basic Usage

```typescript
import { validateXatsDocument } from '@xats/validator'
import type { XatsDocument } from '@xats/types'

const document: XatsDocument = {
  schemaVersion: "0.4.0",
  // ... your document structure
}

const result = validateXatsDocument(document)
if (result.valid) {
  console.log('Document is valid!')
} else {
  console.error('Validation errors:', result.errors)
}
```

## Community and Support

### Resources
- **[GitHub Repository](https://github.com/xats-org/core)** - Source code and issue tracking
- **[Discussion Forum](https://github.com/xats-org/core/discussions)** - Community questions and discussions
- **[Documentation](./getting-started/)** - Comprehensive guides and references

### Getting Help
- **[Issues](https://github.com/xats-org/core/issues)** - Bug reports and feature requests
- **[Migration Support](./guides/migration.md)** - Version upgrade assistance
- **[Contributing Guide](./project/contributing.md)** - How to contribute to the project

### Professional Support
- **Training Workshops** - [xats.org/training](https://xats.org/training)
- **Integration Consulting** - [xats.org/consulting](https://xats.org/consulting)
- **Enterprise Support** - [xats.org/enterprise](https://xats.org/enterprise)

---

*Ready to start building with xats? [Get started with our quickstart guide](./getting-started/quickstart.md)*