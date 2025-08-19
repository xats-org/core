# xats: eXtensible Academic Text Standard

<div align="center">

[![Version](https://img.shields.io/badge/stable-v0.2.0-blue.svg)](https://github.com/xats-org/core/releases)
[![Development](https://img.shields.io/badge/development-v0.3.0-orange.svg)](https://github.com/xats-org/core/tree/v0.3.0)
[![License: CC BY-SA 4.0](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/)
[![CI Status](https://img.shields.io/github/actions/workflow/status/xats-org/core/ci.yml?branch=v0.2.0&label=CI)](https://github.com/xats-org/core/actions)
[![npm version](https://img.shields.io/npm/v/@xats-org/core.svg)](https://www.npmjs.com/package/@xats-org/core)

**The Modern Standard for Academic and Educational Content**

[Documentation](./docs) • [Quick Start](./docs/QUICKSTART_TUTORIAL.md) • [Schema Reference](./docs/reference/index.md) • [Migration Guide](./docs/guides/migration-guide.md) • [Examples](./examples) • [Contributing](./CONTRIBUTING.md)

</div>

---

## 🎯 What is xats?

The **eXtensible Academic Text Standard (xats)** is a modern, JSON-based schema designed specifically for educational and academic content. Built from the ground up for the AI era, xats enables:

- 🤖 **AI-Native Design**: Deeply semantic structure optimized for AI processing and generation
- 📚 **Rich Educational Metadata**: Built-in support for learning objectives, assessments, and pedagogical structures
- ♿ **Accessibility First**: 100% WCAG 2.1 AA compliant with comprehensive accessibility features
- 🔌 **LMS Integration**: Native LTI 1.3 support for seamless Learning Management System integration
- 📊 **Assessment Framework**: Comprehensive built-in assessment system with multiple question types
- 🔐 **Rights Management**: Comprehensive licensing and copyright management for publishers
- 🚀 **Extensible Architecture**: Domain-specific extensions without breaking compatibility

## 📊 How xats Compares

### Comparison with Academic/Textbook Content Standards

| Feature | **xats** | JATS/BITS | DocBook | EPUB/EDUPUB | DITA |
|---------|----------|-----------|---------|-------------|------|
| **Format** | JSON | XML | XML | XHTML/XML | XML |
| **Primary Focus** | Educational textbooks | Journal articles/STM books | Technical documentation | E-books | Modular technical content |
| **Learning Objectives** | ✅ Native support | ❌ No | ❌ No | ⚠️ Limited | ❌ No |
| **Assessment Framework** | ✅ Built-in | ❌ No | ❌ No | ⚠️ Basic | ❌ No |
| **Adaptive Learning Paths** | ✅ Native pathways | ❌ No | ❌ No | ❌ No | ⚠️ Conditional only |
| **WCAG 2.1 AA Compliance** | ✅ 100% compliant | ⚠️ Partial | ⚠️ Partial | ✅ Good | ⚠️ Partial |
| **LTI 1.3 Integration** | ✅ Native | ❌ No | ❌ No | ❌ No | ❌ No |
| **AI Processing** | ✅ Optimized | ⚠️ Possible | ⚠️ Possible | ⚠️ Limited | ⚠️ Complex |
| **Interactive Content** | ✅ Extensible | ❌ Limited | ⚠️ Basic | ✅ Good | ⚠️ Documentation only |
| **Rights Management** | ✅ Comprehensive | ⚠️ Basic | ⚠️ Basic | ✅ Good | ⚠️ Limited |
| **Semantic Richness** | ✅ Deep semantics | ✅ Academic focused | ✅ Technical focused | ⚠️ Presentation focused | ✅ Structured |
| **Authoring Complexity** | ✅ Simple JSON | ⚠️ Complex XML | ⚠️ Complex XML | ⚠️ Moderate | ❌ Very complex |
| **Extensibility** | ✅ JSON extensions | ✅ DTD/Schema | ✅ Customization | ⚠️ Limited | ✅ Specialization |

### Key Advantages of xats

#### 🎓 **Purpose-Built for Education**
Unlike general-purpose formats, xats is designed specifically for academic and educational content with native support for:
- Learning objectives and outcomes
- Multiple assessment types
- Adaptive learning pathways
- Student progress tracking
- Prerequisite management

#### 🤝 **Modern Integration Ready**
- **LMS Integration**: Native LTI 1.3 support for Canvas, Blackboard, Moodle, etc.
- **API-First**: JSON format works seamlessly with modern web APIs
- **Version Control Friendly**: Human-readable JSON works well with Git
- **Cloud Native**: Optimized for distributed systems and microservices

#### ♿ **Accessibility Excellence**
- 100% WCAG 2.1 AA compliant
- Comprehensive alt text support
- Language identification for all content
- Semantic structure for screen readers
- Keyboard navigation support

## 🚀 Quick Start

### Installation

```bash
npm install -g @xats-org/core
```

### Validate a Document

```bash
xats-validate my-textbook.json
```

### Programmatic Usage

```javascript
import { validateDocument } from '@xats-org/core';

const document = {
  schemaVersion: "0.2.0",
  bibliographicEntry: {
    id: "calculus-101",
    type: "book",
    title: "Introduction to Calculus"
  },
  subject: "Mathematics",
  bodyMatter: {
    contents: [/* ... */]
  }
};

const { valid, errors } = await validateDocument(document);
```

## 📖 Example Document

```json
{
  "schemaVersion": "0.2.0",
  "bibliographicEntry": {
    "id": "biology-fundamentals",
    "type": "book",
    "title": "Biology Fundamentals",
    "author": [{"family": "Smith", "given": "Jane"}],
    "publisher": "Academic Press",
    "issued": {"date-parts": [[2025, 1]]}
  },
  "subject": "Biology",
  "bodyMatter": {
    "contents": [
      {
        "id": "ch-1",
        "language": "en",
        "label": "Chapter 1", 
        "title": "Introduction to Cell Biology",
        "learningObjectives": [
          {
            "id": "lo-1-1",
            "language": "en",
            "description": "Understand the basic structure of a cell"
          }
        ],
        "sections": [
          {
            "id": "sec-1-1",
            "language": "en",
            "title": "What is a Cell?",
            "content": [
              {
                "id": "para-1",
                "language": "en",
                "blockType": "https://xats.org/core/blocks/paragraph",
                "content": {
                  "text": {
                    "runs": [
                      {
                        "type": "text",
                        "text": "A cell is the smallest unit of life."
                      }
                    ]
                  }
                }
              },
              {
                "id": "assessment-1",
                "language": "en",
                "blockType": "https://xats.org/core/blocks/multipleChoice",
                "content": {
                  "question": {
                    "runs": [
                      {
                        "type": "text",
                        "text": "What is the basic unit of life?"
                      }
                    ]
                  },
                  "options": [
                    {
                      "id": "opt-a",
                      "text": {"runs": [{"type": "text", "text": "Cell"}]},
                      "correct": true
                    },
                    {
                      "id": "opt-b",
                      "text": {"runs": [{"type": "text", "text": "Tissue"}]},
                      "correct": false
                    }
                  ],
                  "cognitiveMetadata": {
                    "bloomsLevel": "remember",
                    "difficulty": 1,
                    "estimatedTimeMinutes": 1
                  },
                  "scoring": {
                    "points": 10,
                    "scoringMethod": "automatic"
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

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[Quick Start Tutorial](./docs/QUICKSTART_TUTORIAL.md)** | Get started with your first xats document |
| **[Authoring Guide](./docs/guides/authoring-guide.md)** | Best practices for content creation |
| **[Schema Reference](./docs/reference/index.md)** | Complete API reference |
| **[Architecture](./docs/ARCHITECTURE.md)** | Design decisions and rationale |
| **[Migration Guide](./docs/guides/migration-guide.md)** | Comprehensive migration between all versions |
| **[Schema Versioning Policy](./docs/specs/schema-versioning-policy.md)** | Official versioning strategy and compatibility |
| **[Version Compatibility Matrix](./docs/specs/version-compatibility-matrix.md)** | Feature availability across versions |
| **[Migration Tools Reference](./docs/specs/migration-tools.md)** | Complete migration tooling guide |
| **[Extension Guide](./docs/guides/extension-guide.md)** | Creating custom extensions |
| **[LTI Integration](./docs/guides/lti-integration.md)** | LMS integration guide |
| **[Accessibility Guide](./docs/guides/accessibility-guide.md)** | WCAG compliance guide |

## 🏗️ Project Structure

```
xats-org/core/
├── schemas/           # JSON Schema definitions
│   ├── v0.1.0/       # Stable release
│   └── v0.2.0/       # Development version
├── src/              # TypeScript source code
│   ├── validator/    # Validation logic
│   └── types/        # TypeScript definitions
├── test/             # Comprehensive test suite
├── examples/         # Example documents
├── docs/             # Documentation
└── bin/              # CLI tools
```

## 🔄 Version Management

| Version | Status | Support Level | Key Features |
|---------|--------|---------------|--------------|
| **v0.3.0** | 🚧 Development | Full | IndexRun, Case Studies, Metacognitive Prompts |
| **v0.2.0** | ✅ Stable | Full | WCAG AA, LTI 1.3, Assessments, Rights Management |
| **v0.1.0** | 🔒 Security Only | Security Only | Core schema, Basic content types |

**Migration Support:** All versions are forward-compatible. Documents automatically work with newer schema versions.

**Key Documents:**
- 📋 [Versioning Policy](./docs/specs/schema-versioning-policy.md) - Semantic versioning and compatibility guarantees
- 🔄 [Migration Guide](./docs/guides/migration-guide.md) - Step-by-step migration instructions
- 📊 [Compatibility Matrix](./docs/specs/version-compatibility-matrix.md) - Feature availability by version

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/xats-org/core.git
cd core

# Install dependencies
npm install

# Run tests
npm test

# Validate examples
npm run validate examples/
```

### Key Contributors

- **Project Steward**: Coordinating development and community
- **Schema Engineers**: Designing and implementing the schema
- **Accessibility Champions**: Ensuring WCAG compliance
- **Documentation Team**: Creating comprehensive guides

## 📈 Roadmap

### v0.2.0 (Current Stable Release)
- ✅ 100% WCAG 2.1 AA compliance
- ✅ LTI 1.3 integration with grade passback
- ✅ Rights management extension
- ✅ Core assessment framework with multiple question types
- ✅ Enhanced validation and TypeScript support
- ✅ Comprehensive documentation updates

### v0.3.0 (Planned)
- 📑 Formal indexing support
- 📚 Case study block types
- 🧠 Metacognitive prompts
- 🔍 Enhanced search capabilities

### Future Vision
- 🌍 Internationalization (i18n)
- 📊 Advanced analytics
- 🤖 AI authoring tools
- 📱 Mobile-first rendering
- 🎮 Gamification elements

See our [full roadmap](./docs/ROADMAP.md) for detailed plans.

## 📄 License

This project is licensed under the [Creative Commons Attribution-ShareAlike 4.0 International License](https://creativecommons.org/licenses/by-sa/4.0/).

## 🌟 Community

- **GitHub**: [github.com/xats-org/core](https://github.com/xats-org/core)
- **Website**: [xats.org](https://xats.org)
- **Issues**: [Report bugs or request features](https://github.com/xats-org/core/issues)
- **Discussions**: [Join the conversation](https://github.com/xats-org/core/discussions)

## 🙏 Acknowledgments

xats is a community-driven project building on decades of work in educational technology and academic publishing. We acknowledge the contributions of:

- The JATS/BITS community for pioneering academic markup
- The W3C for web standards and accessibility guidelines
- IMS Global for LTI and educational interoperability standards
- All our contributors and early adopters

---

<div align="center">

**Building the future of educational content, one schema at a time.**

Made with ❤️ by the xats community

</div>