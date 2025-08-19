# Migration Guide: v0.1.0 to v0.2.0

## Overview

This guide helps you migrate your xats documents from v0.1.0 to v0.2.0. Version 0.2.0 introduces significant enhancements while maintaining backward compatibility for most features.

## Table of Contents

- [Breaking Changes](#breaking-changes)
- [New Required Fields](#new-required-fields)
- [New Features](#new-features)
- [Migration Steps](#migration-steps)
- [Validation](#validation)
- [Examples](#examples)

## Breaking Changes

### None! 

v0.2.0 is designed to be fully backward compatible with v0.1.0 documents. All valid v0.1.0 documents will continue to work with v0.2.0.

## New Required Fields

While v0.2.0 maintains backward compatibility, to take advantage of new accessibility features, you should add:

### 1. Language Identification

**Recommended**: Add language attributes to your document and content:

```json
{
  "schemaVersion": "0.2.0",
  "language": "en-US",  // Document-level language
  "bodyMatter": {
    "contents": [
      {
        "language": "en-US",  // Content-level language
        // ... rest of content
      }
    ]
  }
}
```

### 2. Accessibility Metadata

**Recommended**: Add accessibility declarations:

```json
{
  "accessibility": {
    "wcagLevel": "AA",
    "features": ["altText", "structuralNavigation", "readingOrder"],
    "hazards": [],
    "apis": ["ARIA"]
  }
}
```

## New Features

### 1. WCAG 2.1 AA Compliance

v0.2.0 includes comprehensive accessibility support:

- **Alt Text**: Enhanced support for image descriptions
- **Long Descriptions**: For complex diagrams and figures
- **Language Identification**: For all content elements
- **Structural Navigation**: Improved heading hierarchy
- **Reading Order**: Explicit content sequencing

#### Example: Enhanced Image with Accessibility

```json
{
  "id": "fig-1",
  "blockType": "https://xats.org/core/blocks/figure",
  "content": {
    "resourceId": "img-cell-structure",
    "altText": "Diagram of a plant cell showing organelles",
    "longDescription": "A detailed cross-section of a plant cell displaying the cell wall, membrane, nucleus with nucleolus, chloroplasts, mitochondria, endoplasmic reticulum, Golgi apparatus, and vacuole. Each organelle is labeled and color-coded."
  }
}
```

### 2. LTI 1.3 Integration

Native support for Learning Tools Interoperability:

```json
{
  "extensions": {
    "https://xats.org/extensions/lti": {
      "configuration": {
        "platformId": "canvas.instructure.com",
        "clientId": "10000000000001",
        "deploymentId": "1:abc123",
        "authorizationUrl": "https://canvas.instructure.com/api/lti/authorize",
        "tokenUrl": "https://canvas.instructure.com/login/oauth2/token",
        "jwksUrl": "https://canvas.instructure.com/api/lti/security/jwks"
      }
    }
  }
}
```

### 3. Rights Management Extension

Comprehensive copyright and licensing support:

```json
{
  "extensions": {
    "https://xats.org/extensions/rights": {
      "copyright": {
        "holder": "Academic Publishers Inc.",
        "year": 2025,
        "statement": "All rights reserved"
      },
      "license": {
        "type": "CC-BY-SA-4.0",
        "url": "https://creativecommons.org/licenses/by-sa/4.0/",
        "permissions": ["read", "download", "print"],
        "restrictions": ["commercial-use"],
        "obligations": ["attribution", "share-alike"]
      }
    }
  }
}
```

### 4. Assessment Framework

Enhanced assessment capabilities:

```json
{
  "id": "quiz-1",
  "blockType": "https://xats.org/extensions/assessment/quiz",
  "content": {
    "title": "Chapter 1 Quiz",
    "questions": [
      {
        "id": "q1",
        "type": "multiple-choice",
        "prompt": "What is the powerhouse of the cell?",
        "options": [
          {"id": "a", "text": "Nucleus"},
          {"id": "b", "text": "Mitochondria", "correct": true},
          {"id": "c", "text": "Chloroplast"},
          {"id": "d", "text": "Ribosome"}
        ],
        "points": 1
      }
    ],
    "gradePassback": {
      "lineItemUrl": "https://canvas.instructure.com/api/lti/courses/123/line_items/456",
      "scoreMaximum": 10,
      "label": "Chapter 1 Quiz"
    }
  }
}
```

## Migration Steps

### Step 1: Update Schema Version

Change the `schemaVersion` field:

```json
// Before
"schemaVersion": "0.1.0"

// After
"schemaVersion": "0.2.0"
```

### Step 2: Add Language Identification

Add language attributes at document and content levels:

```json
{
  "schemaVersion": "0.2.0",
  "language": "en-US",  // Add this
  // ... rest of document
}
```

### Step 3: Enhance Accessibility

For each image, figure, or complex content:

1. Add meaningful `altText`
2. Add `longDescription` for complex visuals
3. Ensure proper heading hierarchy
4. Add language attributes to mixed-language content

### Step 4: Configure Extensions (Optional)

If using LTI or rights management:

```json
{
  "extensions": {
    "https://xats.org/extensions/lti": {
      // LTI configuration
    },
    "https://xats.org/extensions/rights": {
      // Rights management
    }
  }
}
```

## Validation

### Using the CLI

Validate your migrated document:

```bash
# Install the latest version
npm install -g @xats-org/core@latest

# Validate your document
xats-validate my-document.json
```

### Programmatic Validation

```javascript
import { validateDocument } from '@xats-org/core';

const document = require('./my-document.json');
const { valid, errors } = await validateDocument(document);

if (!valid) {
  console.error('Validation errors:', errors);
}
```

## Examples

### Minimal Migration

The simplest migration only requires updating the version:

```json
{
  "schemaVersion": "0.2.0",  // Only change needed
  "bibliographicEntry": {
    "id": "example-book",
    "type": "book",
    "title": "Example Book"
  },
  "subject": "Example",
  "bodyMatter": {
    // ... existing content works as-is
  }
}
```

### Full-Featured Migration

A complete migration taking advantage of all new features:

```json
{
  "schemaVersion": "0.2.0",
  "language": "en-US",
  "bibliographicEntry": {
    "id": "biology-101",
    "type": "book",
    "title": "Biology Fundamentals",
    "author": [{"family": "Smith", "given": "Jane"}],
    "publisher": "Academic Press",
    "issued": {"date-parts": [[2025, 1]]}
  },
  "subject": "Biology",
  "accessibility": {
    "wcagLevel": "AA",
    "features": ["altText", "structuralNavigation", "readingOrder"],
    "hazards": [],
    "apis": ["ARIA"]
  },
  "extensions": {
    "https://xats.org/extensions/lti": {
      "configuration": {
        "platformId": "canvas.instructure.com",
        "clientId": "10000000000001"
      }
    },
    "https://xats.org/extensions/rights": {
      "copyright": {
        "holder": "Academic Press",
        "year": 2025
      },
      "license": {
        "type": "CC-BY-SA-4.0"
      }
    }
  },
  "bodyMatter": {
    "contents": [
      {
        "id": "ch-1",
        "label": "Chapter 1",
        "title": "Introduction to Biology",
        "language": "en-US",
        "sections": [
          {
            "id": "sec-1-1",
            "title": "What is Life?",
            "content": [
              {
                "id": "para-1",
                "blockType": "https://xats.org/core/blocks/paragraph",
                "content": {
                  "runs": [
                    {
                      "type": "text",
                      "text": "Biology is the study of life.",
                      "language": "en-US"
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

## Getting Help

- **Documentation**: [xats.org/docs](https://xats.org/docs)
- **GitHub Issues**: [github.com/xats-org/core/issues](https://github.com/xats-org/core/issues)
- **Community Forum**: [github.com/xats-org/core/discussions](https://github.com/xats-org/core/discussions)

## Next Steps

After migrating:

1. ✅ Validate your documents
2. ✅ Test with your rendering system
3. ✅ Configure LTI if using an LMS
4. ✅ Review accessibility with screen readers
5. ✅ Update your authoring tools

---

*For more details on specific features, see the [v0.2.0 Release Notes](../../CHANGELOG.md#020).*