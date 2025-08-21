# Quick Start Guide

Get up and running with xats in under 10 minutes! This guide will walk you through installation, creating your first document, and validating it.

## What You'll Build

By the end of this guide, you'll have:
- ✅ A working xats development environment
- ✅ Your first valid xats document
- ✅ A simple validation workflow
- ✅ Understanding of core xats concepts

## Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Package manager** - npm (comes with Node.js), yarn, or pnpm
- **Text editor** - VS Code recommended for TypeScript support

## Step 1: Installation

Install the core xats packages:

::: code-group

```bash [npm]
# Create a new project
mkdir my-xats-project
cd my-xats-project
npm init -y

# Install xats packages
npm install @xats/schema @xats/validator @xats/types
```

```bash [yarn]
# Create a new project
mkdir my-xats-project
cd my-xats-project
yarn init -y

# Install xats packages
yarn add @xats/schema @xats/validator @xats/types
```

```bash [pnpm]
# Create a new project
mkdir my-xats-project
cd my-xats-project
pnpm init

# Install xats packages
pnpm add @xats/schema @xats/validator @xats/types
```

:::

::: tip Pro Tip
For a complete development setup including CLI tools, also install:
```bash
npm install -g @xats/cli
```
:::

## Step 2: Create Your First Document

Create a file called `my-first-textbook.json`:

```json
{
  "schemaVersion": "0.4.0",
  "bibliographicEntry": {
    "type": "book",
    "title": "My First xats Textbook",
    "author": [
      {
        "literal": "Your Name"
      }
    ],
    "issued": {
      "date-parts": [[2024]]
    }
  },
  "subject": "Introduction to Programming",
  "bodyMatter": {
    "contents": [
      {
        "id": "unit-1",
        "type": "Unit",
        "label": "Unit 1",
        "title": {
          "runs": [
            {
              "type": "text",
              "text": "Getting Started with Programming"
            }
          ]
        },
        "chapters": [
          {
            "id": "chapter-1-1",
            "type": "Chapter",
            "label": "Chapter 1",
            "title": {
              "runs": [
                {
                  "type": "text",
                  "text": "Hello, World!"
                }
              ]
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
                        "text": "Welcome to your first programming lesson! In this chapter, we'll learn how to create a simple 'Hello, World!' program."
                      }
                    ]
                  }
                }
              },
              {
                "id": "code-example",
                "blockType": "https://xats.org/core/blocks/codeBlock",
                "content": {
                  "code": "console.log('Hello, World!')",
                  "language": "javascript",
                  "caption": {
                    "runs": [
                      {
                        "type": "text",
                        "text": "A simple JavaScript hello world program"
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

## Step 3: Validate Your Document

Create a file called `validate.js` (or `validate.ts` for TypeScript):

::: code-group

```javascript [JavaScript]
import { validateXatsDocument } from '@xats/validator'
import { readFileSync } from 'fs'

// Read the document
const documentText = readFileSync('my-first-textbook.json', 'utf8')
const document = JSON.parse(documentText)

// Validate the document
const result = validateXatsDocument(document)

if (result.valid) {
  console.log('🎉 Congratulations! Your xats document is valid!')
  console.log(`📊 Validation completed in ${result.performance?.validationTime}ms`)
} else {
  console.error('❌ Validation failed. Errors found:')
  result.errors.forEach((error, index) => {
    console.error(`  ${index + 1}. ${error.path}: ${error.message}`)
  })
}
```

```typescript [TypeScript]
import { validateXatsDocument } from '@xats/validator'
import type { XatsDocument, ValidationResult } from '@xats/types'
import { readFileSync } from 'fs'

// Read the document
const documentText = readFileSync('my-first-textbook.json', 'utf8')
const document: unknown = JSON.parse(documentText)

// Validate the document
const result: ValidationResult = validateXatsDocument(document)

if (result.valid) {
  console.log('🎉 Congratulations! Your xats document is valid!')
  console.log(`📊 Validation completed in ${result.performance?.validationTime}ms`)
  
  // TypeScript now knows document is valid XatsDocument
  const validDocument = document as XatsDocument
  console.log(`📚 Document title: ${validDocument.bibliographicEntry.title}`)
} else {
  console.error('❌ Validation failed. Errors found:')
  result.errors.forEach((error, index) => {
    console.error(`  ${index + 1}. ${error.path}: ${error.message}`)
  })
}
```

:::

Run your validation:

```bash
node validate.js
# or for TypeScript: npx tsx validate.ts
```

You should see:
```
🎉 Congratulations! Your xats document is valid!
📊 Validation completed in 2ms
📚 Document title: My First xats Textbook
```

## Step 4: Add More Content

Let's expand our document with an assessment. Add this to the `contentBlocks` array in your chapter:

```json
{
  "id": "quiz-1",
  "blockType": "https://xats.org/core/blocks/assessment",
  "content": {
    "assessment": {
      "id": "hello-world-quiz",
      "title": {
        "runs": [
          {
            "type": "text", 
            "text": "Quick Check: Hello World"
          }
        ]
      },
      "assessmentType": "https://xats.org/core/assessments/quiz",
      "questions": [
        {
          "id": "q1",
          "questionType": "https://xats.org/core/questions/multipleChoice",
          "prompt": {
            "runs": [
              {
                "type": "text",
                "text": "What will the following JavaScript code output?"
              }
            ]
          },
          "code": "console.log('Hello, World!')",
          "choices": [
            {
              "id": "a",
              "text": {
                "runs": [
                  {
                    "type": "text",
                    "text": "Hello, World!"
                  }
                ]
              },
              "correct": true
            },
            {
              "id": "b", 
              "text": {
                "runs": [
                  {
                    "type": "text",
                    "text": "Hello World"
                  }
                ]
              },
              "correct": false
            }
          ]
        }
      ]
    }
  }
}
```

Re-run your validation to make sure everything still works!

## Step 5: Using the CLI (Optional)

If you installed the CLI tools, you can also use them:

```bash
# Validate your document
xats validate my-first-textbook.json

# Get document information
xats info my-first-textbook.json

# Convert to HTML (if renderer is installed)
xats convert my-first-textbook.json --format html --output textbook.html
```

## Understanding the Structure

Let's break down what you just created:

### Document Root
```json
{
  "schemaVersion": "0.4.0",      // Version of xats schema
  "bibliographicEntry": { ... }, // Metadata about the document
  "subject": "...",              // Academic subject
  "bodyMatter": { ... }          // Main content
}
```

### Content Hierarchy
```
Document
└── Body Matter
    └── Contents (Units or Chapters)
        └── Unit
            └── Chapters
                └── Chapter
                    └── Content Blocks
```

### Content Blocks
Content blocks are the building blocks of xats documents:
- **Paragraph** - Regular text content
- **Code Block** - Programming code with syntax highlighting
- **Assessment** - Quizzes and interactive exercises
- **Figure** - Images, diagrams, and media
- **Table** - Tabular data
- **Math Block** - Mathematical expressions

### Semantic Text
All text in xats uses "semantic text" with "runs":
```json
{
  "runs": [
    { "type": "text", "text": "Regular text" },
    { "type": "emphasis", "text": "emphasized text" },
    { "type": "strong", "text": "strong text" }
  ]
}
```

## Next Steps

🎉 **Congratulations!** You've successfully created and validated your first xats document. Here's what to explore next:

### Learn More
- 📖 [Core Concepts](./concepts.md) - Understand xats architecture
- 📝 [Authoring Guide](../guides/authoring.md) - Best practices for content creation
- 🔍 [Schema Reference](../reference/schema/) - Complete API documentation

### Add Features
- 🎯 [Assessments](../guides/authoring.md#assessments) - Add quizzes and exercises
- 🌍 [Internationalization](../guides/authoring.md#internationalization) - Multi-language support
- ♿ [Accessibility](../guides/accessibility.md) - Ensure inclusive design

### Integration
- 🔧 [CLI Tools](../packages/cli/) - Command-line productivity tools
- 🎨 [Rendering](../packages/renderer/) - Convert to HTML, PDF, and more
- 🤖 [AI Integration](../packages/mcp-server/) - Connect with AI tools

### Development
- 📦 [Package Ecosystem](../packages/) - Explore all xats packages
- 🛠️ [Custom Extensions](../guides/extensions.md) - Extend xats for your needs
- 🔄 [Migration Guide](../guides/migration.md) - Upgrade between versions

## Getting Help

Need assistance? Here are your options:

- 💬 **Community** - [GitHub Discussions](https://github.com/xats-org/core/discussions)
- 🐛 **Bug Reports** - [GitHub Issues](https://github.com/xats-org/core/issues)
- 📧 **Support** - [support@xats.org](mailto:support@xats.org)
- 📚 **Documentation** - You're reading it!

## Common Issues

### TypeScript Errors
If you're using TypeScript and getting import errors:
```bash
npm install -D typescript @types/node
```

### Validation Fails
Double-check your JSON syntax - missing commas and brackets are common issues. Use a JSON validator or VS Code's built-in JSON support.

### Missing Dependencies
Make sure you've installed all required packages:
```bash
npm install @xats/schema @xats/validator @xats/types
```

---

*Ready to dive deeper? Continue with [Core Concepts](./concepts.md) or jump to the [Authoring Guide](../guides/authoring.md).*