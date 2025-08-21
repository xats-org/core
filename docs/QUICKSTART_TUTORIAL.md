# xats Quickstart Tutorial

**Version:** 2.0 (for xats schema v0.2.0)
**Audience:** First-time authors and developers.

---

## 1. Introduction

This tutorial will guide you through the process of creating your first valid **xats** document from scratch. We will build a simple, single-chapter document that demonstrates the core concepts of the schema, including content blocks, semantic text, and referencing.

By the end of this guide, you will:
- Have a complete, valid `xats.json` file
- Understand how to use SemanticText properly
- Know how to add different content blocks
- Be able to validate your documents
- Know where to find more examples and resources

---

## 2. Prerequisites

Before starting, ensure you have:
1. A text editor (VS Code, Sublime Text, or any JSON-capable editor)
2. Node.js installed (for validation tools)
3. Basic familiarity with JSON syntax

To install the xats validation tool:
```bash
npm install -g @xats/validator
```

---

## 3. Step 1: The Document Shell

Every `xats` document starts with a root object that defines its version and core metadata. Let's create a file named `my-book.xats.json` and add the essential top-level properties.

### The Basic Structure

```json
{
  "schemaVersion": "0.2.0",
  "bibliographicEntry": {
    "id": "my-first-xats-book",
    "type": "book",
    "title": "A Quickstart Guide to xats",
    "author": [
      {
        "given": "Your",
        "family": "Name"
      }
    ],
    "issued": {
      "date-parts": [
        [2025]
      ]
    }
  },
  "subject": "Educational Technology",
  "bodyMatter": {
    "contents": []
  }
}
```

### Key Points:
- **`schemaVersion`**: Always use "0.1.0" for the current schema
- **`bibliographicEntry`**: Uses CSL-JSON standard for metadata
- **`subject`**: A string describing the main topic
- **`bodyMatter`**: Contains the actual content (chapters or units)

This document is technically valid but empty. Let's add content!

---

## 4. Step 2: Adding a Chapter

Chapters are the primary organizational units in xats. Each chapter must have an ID, title, and at least one section.

```json
{
  "schemaVersion": "0.2.0",
  "bibliographicEntry": {
    "id": "my-first-xats-book",
    "type": "book",
    "title": "A Quickstart Guide to xats",
    "author": [
      {
        "given": "Your",
        "family": "Name"
      }
    ],
    "issued": {
      "date-parts": [
        [2025]
      ]
    }
  },
  "subject": "Educational Technology",
  "bodyMatter": {
    "contents": [
      {
        "id": "chapter-intro",
        "label": "Chapter 1",
        "title": "Introduction to xats",
        "sections": []
      }
    ]
  }
}
```

### Chapter Properties:
- **`id`**: Unique identifier (used for references)
- **`label`**: Optional display label (e.g., "Chapter 1")
- **`title`**: The chapter's title
- **`sections`**: Array of section objects

---

## 5. Step 3: Adding Sections with Content

Sections contain the actual content blocks. Let's add a section with a paragraph.

```json
{
  "schemaVersion": "0.2.0",
  "bibliographicEntry": {
    "id": "my-first-xats-book",
    "type": "book",
    "title": "A Quickstart Guide to xats",
    "author": [
      {
        "given": "Your",
        "family": "Name"
      }
    ],
    "issued": {
      "date-parts": [
        [2025]
      ]
    }
  },
  "subject": "Educational Technology",
  "bodyMatter": {
    "contents": [
      {
        "id": "chapter-intro",
        "label": "Chapter 1",
        "title": "Introduction to xats",
        "sections": [
          {
            "id": "section-what-is-xats",
            "title": "What is xats?",
            "content": [
              {
                "id": "para-1",
                "blockType": "https://xats.org/vocabularies/blocks/paragraph",
                "content": {
                  "runs": [
                    {
                      "type": "text",
                      "text": "The eXtensible Academic Text Standard (xats) is a JSON-based standard for educational materials."
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

### Important: Understanding SemanticText

**Never use plain strings for text content!** xats uses SemanticText objects with a `runs` array. This is crucial for proper parsing and rendering.

❌ **Wrong:**
```json
"content": "This is plain text"
```

✅ **Correct:**
```json
"content": {
  "runs": [
    {
      "type": "text",
      "text": "This is properly formatted text"
    }
  ]
}
```

---

## 6. Step 4: Adding Rich Text Formatting

SemanticText supports various formatting types through different run types:

```json
{
  "id": "para-formatted",
  "blockType": "https://xats.org/vocabularies/blocks/paragraph",
  "content": {
    "runs": [
      {
        "type": "text",
        "text": "This paragraph contains "
      },
      {
        "type": "strong",
        "text": "bold text"
      },
      {
        "type": "text",
        "text": " and "
      },
      {
        "type": "emphasis",
        "text": "italic text"
      },
      {
        "type": "text",
        "text": " for emphasis."
      }
    ]
  }
}
```

### Available Run Types:
- **`text`**: Plain text
- **`strong`**: Bold text
- **`emphasis`**: Italic text
- **`reference`**: Internal links (requires `refId`)
- **`citation`**: Bibliography citations (requires `refId`)

---

## 7. Step 5: Adding Different Content Blocks

xats supports various content block types. Here's how to add them:

### Lists

```json
{
  "id": "list-example",
  "blockType": "https://xats.org/vocabularies/blocks/list",
  "content": {
    "listType": "unordered",
    "items": [
      {
        "runs": [
          {
            "type": "text",
            "text": "First item"
          }
        ]
      },
      {
        "runs": [
          {
            "type": "text",
            "text": "Second item with "
          },
          {
            "type": "strong",
            "text": "emphasis"
          }
        ]
      }
    ]
  }
}
```

### Code Blocks

```json
{
  "id": "code-example",
  "blockType": "https://xats.org/vocabularies/blocks/codeBlock",
  "content": {
    "language": "python",
    "code": "def hello_world():\n    print('Hello, xats!')"
  }
}
```

### Block Quotes

```json
{
  "id": "quote-example",
  "blockType": "https://xats.org/vocabularies/blocks/blockquote",
  "content": {
    "quote": {
      "runs": [
        {
          "type": "text",
          "text": "Education is the most powerful weapon which you can use to change the world."
        }
      ]
    },
    "attribution": {
      "runs": [
        {
          "type": "text",
          "text": "Nelson Mandela"
        }
      ]
    }
  }
}
```

### Math Blocks

```json
{
  "id": "math-example",
  "blockType": "https://xats.org/vocabularies/blocks/mathBlock",
  "content": {
    "notation": "latex",
    "expression": "E = mc^2"
  }
}
```

---

## 8. Step 6: Complete Working Example

Here's a complete, valid xats document combining all the concepts:

```json
{
  "schemaVersion": "0.2.0",
  "bibliographicEntry": {
    "id": "quickstart-tutorial-2025",
    "type": "book",
    "title": "My First xats Document",
    "author": [
      {
        "given": "Jane",
        "family": "Doe"
      }
    ],
    "issued": {
      "date-parts": [
        [2025, 1]
      ]
    }
  },
  "subject": "Computer Science Education",
  "bodyMatter": {
    "contents": [
      {
        "id": "chapter-1",
        "label": "Chapter 1",
        "title": "Getting Started with Programming",
        "sections": [
          {
            "id": "section-1-1",
            "title": "What is Programming?",
            "content": [
              {
                "id": "para-intro",
                "blockType": "https://xats.org/vocabularies/blocks/paragraph",
                "content": {
                  "runs": [
                    {
                      "type": "text",
                      "text": "Programming is the art of "
                    },
                    {
                      "type": "strong",
                      "text": "instructing computers"
                    },
                    {
                      "type": "text",
                      "text": " to perform tasks. It involves writing code in various "
                    },
                    {
                      "type": "emphasis",
                      "text": "programming languages"
                    },
                    {
                      "type": "text",
                      "text": "."
                    }
                  ]
                }
              },
              {
                "id": "list-languages",
                "blockType": "https://xats.org/vocabularies/blocks/list",
                "content": {
                  "listType": "ordered",
                  "items": [
                    {
                      "runs": [
                        {
                          "type": "strong",
                          "text": "Python"
                        },
                        {
                          "type": "text",
                          "text": " - Great for beginners"
                        }
                      ]
                    },
                    {
                      "runs": [
                        {
                          "type": "strong",
                          "text": "JavaScript"
                        },
                        {
                          "type": "text",
                          "text": " - Powers the web"
                        }
                      ]
                    },
                    {
                      "runs": [
                        {
                          "type": "strong",
                          "text": "Java"
                        },
                        {
                          "type": "text",
                          "text": " - Enterprise applications"
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          {
            "id": "section-1-2",
            "title": "Your First Program",
            "content": [
              {
                "id": "para-hello",
                "blockType": "https://xats.org/vocabularies/blocks/paragraph",
                "content": {
                  "runs": [
                    {
                      "type": "text",
                      "text": "Let's write the traditional 'Hello, World!' program:"
                    }
                  ]
                }
              },
              {
                "id": "code-hello",
                "blockType": "https://xats.org/vocabularies/blocks/codeBlock",
                "content": {
                  "language": "python",
                  "code": "# This is a comment\nprint('Hello, World!')\nprint('Welcome to programming!')"
                }
              },
              {
                "id": "para-explanation",
                "blockType": "https://xats.org/vocabularies/blocks/paragraph",
                "content": {
                  "runs": [
                    {
                      "type": "text",
                      "text": "The "
                    },
                    {
                      "type": "emphasis",
                      "text": "print()"
                    },
                    {
                      "type": "text",
                      "text": " function displays text on the screen."
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

Save this as `tutorial.xats.json` and proceed to validation!

---

## 9. Step 7: Validating Your Document

Validation ensures your document follows the xats schema correctly. Here's how to validate your work:

### Using the Command Line Tool

```bash
# Validate a single file
xats-validate -f tutorial.xats.json

# Validate with verbose output (shows all checks)
xats-validate -f tutorial.xats.json -v

# Validate all files in a directory
xats-validate -d ./my-xats-documents/
```

**Alternative: Using npm script**
```bash
# If xats-validate is not installed globally
npm run validate -- -f tutorial.xats.json
```

### Understanding Validation Output

**Success:**
```
✓ tutorial.xats.json is valid
  - Schema validation: PASSED
  - Vocabulary validation: PASSED
  - Structure validation: PASSED
```

**Note:** The current validator may show warnings for valid blockType URIs. These are vocabulary warnings that don't affect document validity. The schema validation (structure) is what determines if your document is truly valid.

**Common Errors and Solutions:**

1. **Missing required field:**
```
✗ Validation failed
  Error: Missing required field 'schemaVersion'
  Location: root object
```
**Solution:** Add the missing field to your document.

2. **Invalid SemanticText:**
```
✗ Validation failed
  Error: Expected object with 'runs' array, got string
  Location: /bodyMatter/contents/0/sections/0/content/0/content
```
**Solution:** Convert plain strings to SemanticText objects with runs.

3. **Unknown blockType URI:**
```
✗ Validation failed
  Error: Invalid blockType URI
  Location: Block with id 'para-1'
```
**Solution:** Use valid URIs from the core vocabulary (see list below).

### Validation Checklist

Before validating, check:
- [ ] All text content uses SemanticText with `runs` array
- [ ] Every object has a unique `id`
- [ ] All `blockType` values use valid URIs
- [ ] Required fields are present (`schemaVersion`, `bibliographicEntry`, `subject`, `bodyMatter`)
- [ ] CSL-JSON fields in `bibliographicEntry` are properly formatted
- [ ] References (`refId`) point to existing IDs

---

## 10. Common Pitfalls and Solutions

### Pitfall 1: Using Plain Strings Instead of SemanticText

**Problem:** The most common error is using plain strings where SemanticText is required.

```json
// ❌ WRONG
"title": "My Chapter Title"

// ✅ CORRECT (if title accepts SemanticText)
"title": {
  "runs": [
    {
      "type": "text",
      "text": "My Chapter Title"
    }
  ]
}
```

**Note:** Some fields like chapter `title` actually accept plain strings. Check the schema documentation for each field's requirements.

### Pitfall 2: Incorrect Block Type URIs

**Problem:** Using shorthand or incorrect URIs for block types.

```json
// ❌ WRONG
"blockType": "paragraph"
"blockType": "para"
"blockType": "p"

// ✅ CORRECT
"blockType": "https://xats.org/vocabularies/blocks/paragraph"
```

### Pitfall 3: Missing IDs

**Problem:** Every xats object needs a unique ID.

```json
// ❌ WRONG
{
  "blockType": "https://xats.org/vocabularies/blocks/paragraph",
  "content": { ... }
}

// ✅ CORRECT
{
  "id": "para-intro-1",
  "blockType": "https://xats.org/vocabularies/blocks/paragraph",
  "content": { ... }
}
```

### Pitfall 4: Invalid JSON Syntax

**Problem:** JSON syntax errors prevent parsing.

Common JSON mistakes:
- Trailing commas (not allowed in JSON)
- Single quotes instead of double quotes
- Unescaped special characters in strings
- Missing closing brackets or braces

**Solution:** Use a JSON validator or editor with JSON syntax checking.

### Pitfall 5: Incorrect Date Format

**Problem:** CSL-JSON uses a specific date format.

```json
// ❌ WRONG
"issued": "2025-01-15"
"issued": { "year": 2025 }

// ✅ CORRECT
"issued": {
  "date-parts": [
    [2025, 1, 15]
  ]
}
```

---

## 11. Core Vocabulary Reference

### Block Types (use full URIs)

**Text Content:**
- `https://xats.org/vocabularies/blocks/paragraph` - Standard paragraph
- `https://xats.org/vocabularies/blocks/heading` - Section heading
- `https://xats.org/vocabularies/blocks/list` - Ordered or unordered list
- `https://xats.org/vocabularies/blocks/blockquote` - Quoted text

**Code and Math:**
- `https://xats.org/vocabularies/blocks/codeBlock` - Source code
- `https://xats.org/vocabularies/blocks/mathBlock` - Mathematical expressions

**Structured Content:**
- `https://xats.org/vocabularies/blocks/table` - Tabular data
- `https://xats.org/vocabularies/blocks/figure` - Images with captions

**Placeholders:**
- `https://xats.org/vocabularies/placeholders/tableOfContents` - TOC placeholder
- `https://xats.org/vocabularies/placeholders/bibliography` - Bibliography placeholder
- `https://xats.org/vocabularies/placeholders/index` - Index placeholder

### SemanticText Run Types

- `text` - Plain text
- `strong` - Bold/strong emphasis
- `emphasis` - Italic/emphasis
- `reference` - Internal cross-reference (needs `refId` and `text`)
- `citation` - Bibliography citation (needs `refId`)

---

## 12. Troubleshooting Guide

### Issue: "Command not found: xats-validate"

**Cause:** The validator isn't installed globally.

**Solution:**
```bash
npm install -g @xats/validator
```

If you get permission errors:
```bash
sudo npm install -g @xats/validator
```

### Issue: "Schema validation failed with no specific error"

**Cause:** Usually a structural issue with the JSON.

**Solution:**
1. Validate JSON syntax first: `python -m json.tool tutorial.xats.json`
2. Check for required fields at each level
3. Ensure all arrays contain at least one item where required

### Issue: "Unknown block type" errors

**Cause:** Using an incorrect or shortened URI.

**Solution:** Always use full URIs from the core vocabulary. Copy them exactly from the reference list above.

### Issue: "Duplicate ID" errors

**Cause:** Two objects have the same ID value.

**Solution:** Ensure every ID in your document is unique. Use descriptive IDs like:
- `chapter-intro`
- `section-1-1`
- `para-intro-1`
- `list-features`
- `code-example-1`

### Issue: Validation passes but document doesn't render correctly

**Cause:** The document is structurally valid but semantically incorrect.

**Solution:**
1. Check that all references (`refId`) point to existing IDs
2. Verify SemanticText is used consistently
3. Ensure content blocks have the correct internal structure
4. Review the working examples in `/examples/` directory

### Issue: Large documents timeout during validation

**Cause:** Very large documents may take time to validate.

**Solution:**
```bash
# Increase timeout and use streaming validation
xats-validate -f large-book.xats.json --timeout 30000 --stream
```

---

## 13. Working Examples

The `/examples/` directory contains fully validated xats documents demonstrating various features:

### Basic Examples
- **`minimal-valid.xats.json`** - The absolute minimum valid document
- **`single-chapter.xats.json`** - Simple one-chapter textbook
- **`with-semantictext.xats.json`** - Rich text formatting examples

### Advanced Examples
- **`complete-textbook.xats.json`** - Full textbook with all features
- **`math-chapter.xats.json`** - Mathematical content and equations
- **`science-lab-manual.xats.json`** - Structured lab procedures
- **`with-pathways.xats.json`** - Conditional learning paths

### Invalid Examples (for learning)
- **`invalid-missing-required.xats.json`** - Shows what happens with missing fields
- **`invalid-bad-semantictext.xats.json`** - Common SemanticText mistakes
- **`invalid-wrong-types.xats.json`** - Type mismatch errors

To explore an example:
```bash
# View the example
cat examples/single-chapter.xats.json

# Validate it
xats-validate -f examples/single-chapter.xats.json

# Copy it as a starting point
cp examples/single-chapter.xats.json my-document.xats.json
```

---

## 14. Next Steps

Now that you've created your first xats document, here's where to go next:

### 1. Explore Advanced Features

**Learning Objectives:**
Add pedagogical metadata to your sections:
```json
{
  "id": "section-1",
  "title": "Introduction",
  "learningObjectives": [
    {
      "id": "lo-1",
      "text": "Understand basic programming concepts",
      "bloomLevel": "understand"
    }
  ],
  "content": [ ... ]
}
```

**Assessments:**
Create quizzes and exercises (see `/docs/guides/assessment-guide.md`)

**Pathways:**
Build adaptive learning paths based on assessment results (see `examples/with-pathways.xats.json`)

### 2. Read the Documentation

- **Schema Reference:** `/docs/reference/index.md` - Complete property documentation
- **Architecture Guide:** `/docs/ARCHITECTURE.md` - Understanding design decisions
- **Authoring Guide:** `/docs/guides/authoring-guide.md` - Best practices
- **Extension Guide:** `/docs/guides/extension-guide.md` - Creating custom vocabularies

### 3. Join the Community

- **GitHub Issues:** Report bugs or request features at the project repository
- **Discussions:** Join conversations about xats development
- **Contributing:** See `/CONTRIBUTING.md` for how to contribute

### 4. Build Tools and Integrations

xats is designed for extensibility. Consider building:
- Converters (Markdown to xats, xats to HTML)
- Validators with custom rules
- Authoring tools with GUI interfaces
- LMS integrations
- AI-powered content generators

### 5. Validate Everything

Make validation part of your workflow:
```bash
# Add to your build process
npm run build && xats-validate -d ./content/

# Git pre-commit hook
xats-validate -f *.xats.json || exit 1
```

---

## 15. Quick Reference Card

### Essential Structure
```json
{
  "schemaVersion": "0.2.0",
  "bibliographicEntry": { /* CSL-JSON */ },
  "subject": "string",
  "bodyMatter": {
    "contents": [
      {
        "id": "chapter-id",
        "title": "Chapter Title",
        "sections": [
          {
            "id": "section-id",
            "title": "Section Title",
            "content": [ /* blocks */ ]
          }
        ]
      }
    ]
  }
}
```

### SemanticText Template
```json
{
  "runs": [
    { "type": "text", "text": "Plain " },
    { "type": "strong", "text": "bold " },
    { "type": "emphasis", "text": "italic " },
    { "type": "reference", "text": "link", "refId": "target-id" },
    { "type": "citation", "refId": "biblio-id" }
  ]
}
```

### Content Block Template
```json
{
  "id": "unique-id",
  "blockType": "https://xats.org/vocabularies/blocks/[type]",
  "content": { /* type-specific content */ }
}
```

### Validation Commands
```bash
xats-validate -f file.json        # Single file
xats-validate -d directory/       # Directory
xats-validate -f file.json -v     # Verbose
xats-validate --examples-only     # Examples only
```

---

## Conclusion

Congratulations! You now have the knowledge to create valid xats documents. Remember:
1. Always use SemanticText with runs for text content
2. Validate early and often
3. Reference the examples when in doubt
4. The schema is your source of truth

Happy authoring with xats!

---

*For questions, issues, or contributions, visit the [xats GitHub repository](https://github.com/xats-org/core).*