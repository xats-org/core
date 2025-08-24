# xats Schema Migration Guide

## Overview

This comprehensive guide helps you migrate your xats documents between schema versions. The xats project follows a forward-compatible versioning strategy, ensuring that existing documents continue to work with newer schema versions while enabling you to take advantage of enhanced features.

## Table of Contents

- [Quick Reference](#quick-reference)
- [v0.1.0 → v0.2.0 Migration](#v010--v020-migration)
- [v0.2.0 → v0.3.0 Migration](#v020--v030-migration)
- [General Migration Patterns](#general-migration-patterns)
- [Migration Tools](#migration-tools)
- [Validation and Testing](#validation-and-testing)
- [Common Migration Issues](#common-migration-issues)

## Quick Reference

| Migration Path | Difficulty | Breaking Changes | Recommended Tools |
|---------------|------------|------------------|-------------------|
| v0.1.0 → v0.2.0 | Easy | None | Manual enhancement |
| v0.2.0 → v0.3.0 | Easy | None | Manual enhancement |
| v0.3.0 → v0.4.0 | Easy | None | Monorepo transition |
| v0.4.0 → v0.5.0 | Easy | None | AI integration setup |
| v0.1.0 → v0.5.0 | Moderate | None | Comprehensive upgrade |
| v0.3.0 → v0.5.0 | Easy | None | Direct upgrade recommended |

## v0.1.0 → v0.2.0 Migration

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
  "blockType": "https://xats.org/vocabularies/blocks/figure",
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
npm install -g @xats-org/cli@latest

# Validate your document
xats validate my-document.json
```

### Programmatic Validation

```javascript
import { validateDocument } from '@xats-org/cli';

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
                "blockType": "https://xats.org/vocabularies/blocks/paragraph",
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

## v0.2.0 → v0.3.0 Migration

### Breaking Changes

**✅ NO BREAKING CHANGES**

Version 0.3.0 maintains full backward compatibility with v0.2.0 documents. All existing content will continue to validate and function correctly.

### New Features in v0.3.0

#### 1. Formal Indexing Support

Enhanced `SemanticText` with `IndexRun` for professional publishing:

```json
{
  "runs": [
    {
      "type": "text",
      "text": "The process of "
    },
    {
      "type": "index",
      "term": "photosynthesis",
      "subterms": ["light reactions", "Calvin cycle"],
      "seeAlso": ["cellular respiration", "chloroplast"],
      "text": "photosynthesis"
    },
    {
      "type": "text", 
      "text": " converts sunlight into chemical energy."
    }
  ]
}
```

**IndexRun Properties:**
- `term` (required): Main index term
- `subterms` (optional): Array of sub-index terms
- `seeAlso` (optional): Array of related terms
- `redirect` (optional): Points to preferred term for aliases

#### 2. Case Study Blocks

New structured content type for case-based learning:

```json
{
  "id": "case-climate-policy",
  "blockType": "https://xats.org/vocabularies/blocks/caseStudy",
  "content": {
    "scenario": {
      "title": "Urban Climate Policy Implementation",
      "background": "The city of Greenville is developing a comprehensive climate action plan...",
      "context": "Metropolitan area with 500,000 residents, significant industrial sector",
      "timeline": "2020-2030 implementation period"
    },
    "stakeholders": [
      {
        "name": "City Council",
        "role": "Policy makers and budget approvers",
        "interests": ["Economic impact", "Public support", "Implementation feasibility"],
        "perspective": "Balance environmental goals with economic development"
      },
      {
        "name": "Environmental Groups",
        "role": "Community advocates",
        "interests": ["Carbon reduction", "Air quality", "Renewable energy"],
        "perspective": "Prioritize aggressive environmental targets"
      }
    ],
    "analysisQuestions": [
      "What are the key trade-offs between economic and environmental priorities?",
      "How can the city build consensus among diverse stakeholders?",
      "What metrics should be used to measure success?"
    ],
    "discussionPrompts": [
      "Debate the merits of carbon pricing vs. regulatory approaches",
      "Role-play negotiations between different stakeholder groups"
    ],
    "learningObjectives": [
      "Analyze competing policy priorities in environmental decision-making",
      "Evaluate stakeholder management strategies in complex policy contexts"
    ]
  }
}
```

#### 3. Metacognitive Prompt Blocks

Support for self-reflection and metacognitive learning:

```json
{
  "id": "reflection-prompt-1",
  "blockType": "https://xats.org/vocabularies/blocks/metacognitivePrompt",
  "content": {
    "promptType": "self-reflection",
    "prompt": "How does this new concept of photosynthesis connect to what you already know about energy in living systems?",
    "scaffolding": {
      "examples": [
        "Think about how plants get energy compared to animals",
        "Consider the role of sunlight in this process",
        "Connect this to what you know about food chains"
      ],
      "framework": "Use the following structure: What I already knew... What I learned... How they connect..."
    },
    "selfAssessment": {
      "reflectionDepth": {
        "surface": "I can identify basic connections",
        "deep": "I can explain relationships and implications",
        "expert": "I can synthesize across multiple domains"
      }
    }
  }
}
```

**Available Prompt Types:**
- `self-reflection`: Connecting new learning to prior knowledge
- `strategy-monitoring`: Evaluating learning strategies
- `comprehension-monitoring`: Checking understanding
- `goal-setting`: Planning learning objectives
- `self-evaluation`: Assessing learning outcomes
- `knowledge-organization`: Structuring and categorizing knowledge
- `transfer-application`: Applying knowledge to new contexts
- `error-analysis`: Learning from mistakes and misconceptions

### Migration Steps for v0.3.0

#### Step 1: Update Schema Version

```json
// Before
"schemaVersion": "0.2.0"

// After
"schemaVersion": "0.3.0"
```

#### Step 2: Add Indexing (Optional)

Enhance your content with index terms:

```json
{
  "content": {
    "runs": [
      {
        "type": "text",
        "text": "Darwin's theory of "
      },
      {
        "type": "index",
        "term": "evolution",
        "subterms": ["natural selection", "adaptation"],
        "text": "evolution"
      },
      {
        "type": "text",
        "text": " explains biological diversity."
      }
    ]
  }
}
```

#### Step 3: Convert Narratives to Case Studies (Optional)

Transform existing narrative content into structured case studies:

```json
// Before: Generic content block
{
  "blockType": "https://xats.org/vocabularies/blocks/paragraph",
  "content": {
    "runs": [
      {
        "type": "text",
        "text": "Consider the ethical implications of genetic engineering in agriculture..."
      }
    ]
  }
}

// After: Structured case study
{
  "blockType": "https://xats.org/vocabularies/blocks/caseStudy",
  "content": {
    "scenario": {
      "title": "Genetic Engineering in Agriculture",
      "background": "A biotechnology company has developed drought-resistant wheat...",
      "context": "Growing global food security concerns amid climate change"
    },
    "stakeholders": [
      {
        "name": "Farmers",
        "interests": ["Crop yields", "Economic viability", "Regulatory compliance"]
      },
      {
        "name": "Consumers",
        "interests": ["Food safety", "Environmental impact", "Cost"]
      }
    ],
    "analysisQuestions": [
      "What are the potential benefits and risks of this technology?",
      "How should regulatory frameworks balance innovation and safety?"
    ]
  }
}
```

#### Step 4: Add Metacognitive Prompts (Optional)

Integrate reflection opportunities throughout your content:

```json
{
  "blockType": "https://xats.org/vocabularies/blocks/metacognitivePrompt",
  "content": {
    "promptType": "comprehension-monitoring",
    "prompt": "Before moving to the next section, assess your understanding of cellular respiration. What aspects are clear? What needs more review?",
    "selfAssessment": {
      "confidenceLevel": {
        "low": "I need to review the basic concepts",
        "medium": "I understand the main ideas but need practice",
        "high": "I can explain the process to someone else"
      }
    }
  }
}
```

### Examples: Complete v0.3.0 Document

```json
{
  "schemaVersion": "0.3.0",
  "language": "en-US",
  "bibliographicEntry": {
    "id": "biology-advanced",
    "type": "book",
    "title": "Advanced Biology: Molecular to Ecological",
    "author": [{"family": "Chen", "given": "Maria"}],
    "publisher": "Academic Press",
    "issued": {"date-parts": [[2025, 8]]}
  },
  "subject": "Biology",
  "accessibility": {
    "wcagLevel": "AA",
    "features": ["altText", "structuralNavigation", "readingOrder"],
    "hazards": [],
    "apis": ["ARIA"]
  },
  "bodyMatter": {
    "contents": [
      {
        "id": "ch-photosynthesis",
        "label": "Chapter 3",
        "title": "Photosynthesis and Energy Conversion",
        "sections": [
          {
            "id": "sec-process-overview",
            "title": "The Photosynthetic Process",
            "content": [
              {
                "id": "para-intro",
                "blockType": "https://xats.org/vocabularies/blocks/paragraph",
                "content": {
                  "runs": [
                    {
                      "type": "index",
                      "term": "photosynthesis",
                      "subterms": ["light reactions", "Calvin cycle", "chloroplast"],
                      "seeAlso": ["cellular respiration", "ATP synthesis"],
                      "text": "Photosynthesis"
                    },
                    {
                      "type": "text",
                      "text": " is the fundamental process by which plants convert light energy into chemical energy, forming the basis of most food webs on Earth."
                    }
                  ]
                }
              },
              {
                "id": "case-study-biofuel",
                "blockType": "https://xats.org/vocabularies/blocks/caseStudy",
                "content": {
                  "scenario": {
                    "title": "Optimizing Algae for Biofuel Production",
                    "background": "A renewable energy company is engineering algae strains to maximize oil production while maintaining photosynthetic efficiency.",
                    "context": "Growing demand for sustainable fuel alternatives"
                  },
                  "stakeholders": [
                    {
                      "name": "Research Scientists",
                      "role": "Genetic engineering and optimization",
                      "interests": ["Scientific accuracy", "Innovation potential"],
                      "perspective": "Focus on maximizing both oil yield and photosynthetic rate"
                    },
                    {
                      "name": "Environmental Groups",
                      "role": "Sustainability advocates",
                      "interests": ["Ecological impact", "Long-term sustainability"],
                      "perspective": "Ensure biofuel production doesn't compromise ecosystem health"
                    }
                  ],
                  "analysisQuestions": [
                    "What trade-offs exist between oil production and photosynthetic efficiency?",
                    "How can genetic modifications be tested for environmental safety?",
                    "What regulatory frameworks should govern commercial algae biofuel production?"
                  ],
                  "learningObjectives": [
                    "Analyze the relationship between photosynthetic efficiency and metabolic engineering",
                    "Evaluate ethical considerations in biotechnology applications"
                  ]
                }
              },
              {
                "id": "metacognitive-connection",
                "blockType": "https://xats.org/vocabularies/blocks/metacognitivePrompt",
                "content": {
                  "promptType": "self-reflection",
                  "prompt": "How does understanding photosynthesis change your perspective on the relationship between plants and other organisms in ecosystems?",
                  "scaffolding": {
                    "examples": [
                      "Consider how energy flows through food webs",
                      "Think about the role of oxygen in supporting life",
                      "Reflect on how human activities impact photosynthetic organisms"
                    ],
                    "framework": "Before studying this: I thought... Now I understand... This connects to... Future applications might include..."
                  },
                  "selfAssessment": {
                    "reflectionDepth": {
                      "surface": "I can identify basic connections between plants and animals",
                      "deep": "I can explain how photosynthesis supports entire ecosystems",
                      "expert": "I can predict how changes in photosynthetic organisms affect global systems"
                    }
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

#### 4. File Modularity System

**NEW FEATURE**: Split large textbooks across multiple JSON files for better organization and team collaboration.

**FileReference Support:**

```json
{
  "bodyMatter": {
    "contents": [
      {"$ref": "./chapters/introduction.json"},
      {"$ref": "./chapters/chapter-01.json"},
      {"$ref": "./chapters/chapter-02.json"},
      {"$ref": "./appendices/glossary.json"}
    ]
  }
}
```

**With Reference Metadata:**

```json
{
  "$ref": "./chapters/chapter-01.json",
  "xats:refMetadata": {
    "title": "Introduction to Biology",
    "authors": ["Dr. Jane Smith"],
    "lastModified": "2025-08-15T10:30:00Z",
    "checksum": "sha256:abc123...",
    "version": "1.2.0"
  }
}
```

**Migration Strategy:**
- **Monolithic Documents**: Continue to work as-is, no changes needed
- **Large Documents**: Consider splitting by chapter or logical sections
- **Team Projects**: Use file modularity for concurrent editing

#### 5. Enhanced Internationalization

**ENHANCED**: Comprehensive language and text direction support.

**Language Identification (Enhanced):**

```json
{
  "schemaVersion": "0.3.0",
  "language": "en-US",  // ISO 639-1 with region
  "textDirection": "ltr",
  "content": {
    "runs": [
      {"type": "text", "text": "The English term ", "language": "en"},
      {"type": "emphasis", "text": "bonjour", "language": "fr"},
      {"type": "text", "text": " means hello.", "language": "en"}
    ]
  }
}
```

**Right-to-Left Language Support:**

```json
{
  "language": "ar-SA",
  "textDirection": "rtl",
  "content": {
    "runs": [
      {"type": "text", "text": "مرحبا بكم في كتابنا المدرسي"}
    ]
  }
}
```

**Migration Benefits:**
- **WCAG 3.1.1 Compliance**: Automatic language identification for screen readers
- **WCAG 3.1.2 Compliance**: Proper text direction rendering
- **Global Content**: Better support for international textbooks

#### 6. Enhanced Rights Management

**ENHANCED**: Publisher-ready licensing and attribution framework.

**Granular Rights Control:**

```json
{
  "rights": {
    "license": "https://xats.org/licenses/cc-by-sa-4.0",
    "copyrightHolder": "Advanced Biology Textbooks Inc.",
    "copyrightYear": "2025",
    "permissions": {
      "redistribute": true,
      "modify": true,
      "commercialUse": false,
      "createDerivatives": true,
      "shareAlike": true
    },
    "restrictions": {
      "noCommercialUse": true,
      "educationalUseOnly": true,
      "geographicRestrictions": ["US", "CA"]
    },
    "attribution": {
      "required": true,
      "format": "Advanced Biology by Dr. Smith, licensed under CC BY-SA 4.0",
      "includeUrl": true,
      "includeLicense": true
    }
  }
}
```

**Multi-Stakeholder Copyright:**

```json
{
  "rights": {
    "copyrightHolder": "Primary Publisher Inc.",
    "additionalCopyrightHolders": [
      {
        "name": "Dr. Jane Smith",
        "year": "2025",
        "contribution": "Chapters 1-5"
      },
      {
        "name": "Research Institute",
        "year": "2024-2025",
        "contribution": "Data visualizations"
      }
    ]
  }
}
```

#### 7. Enhanced Accessibility Features

**ENHANCED**: Comprehensive accessibility support for diverse learning needs.

**Enhanced Accessibility Metadata:**

```json
{
  "accessibilityMetadata": {
    "role": "main",
    "ariaLabel": "Chapter 3: Cellular Biology",
    "landmarkType": "main",
    "headingLevel": 1,
    "cognitiveSupport": {
      "complexityLevel": "moderate",
      "readingLevel": 12.5,
      "simplifiedVersionAvailable": true,
      "summaryAvailable": true
    }
  }
}
```

**Assessment Accessibility Settings:**

```json
{
  "accessibilitySettings": {
    "extendedTime": 1.5,
    "allowScreenReader": true,
    "allowKeyboardOnly": true,
    "textToSpeech": true,
    "alternativeInputMethods": ["voice", "switch"],
    "cognitiveSupports": {
      "allowCalculator": true,
      "simplifiedInstructions": true,
      "readAloud": true
    }
  }
}
```

### Migration Tools for v0.3.0

#### Command Line Tools

```bash
# Validate v0.3.0 documents with all features
xats validate --version 0.3.0 document.json

# Check modular document integrity
xats validate --modular --verify-refs document.json

# Validate accessibility compliance
xats validate --accessibility --wcag-level AA document.json

# Check internationalization support
xats validate --i18n --check-language-tags document.json
```

#### Modularization Helper

```bash
# Split large document by chapters
xats modularize textbook.json --strategy=by-chapter --output-dir=./chapters

# Generate index from IndexRun markers
xats generate-index textbook.json --output=generated-index.json

# Extract translatable content
xats extract-i18n textbook.json --target-language=es --output=translation-strings.json
```

### Recommended Migration Steps

1. **Update Schema Version**: Change `"schemaVersion"` from `"0.2.0"` to `"0.3.0"`

2. **Enhance Language Support**: Add language and text direction properties

3. **Consider File Modularity**: For large documents, evaluate splitting into multiple files

4. **Add IndexRun Markers**: Mark important terms for automatic index generation

5. **Enhance Rights Metadata**: Add granular licensing information if needed

6. **Validate Thoroughly**: Use comprehensive validation tools to ensure compliance

---

## v0.3.0 → v0.4.0 Migration

### Breaking Changes

**✅ NO BREAKING CHANGES**

Version 0.4.0 maintains full backward compatibility with v0.3.0 documents. All existing content will continue to validate and function correctly.

### Major Infrastructure Changes in v0.4.0

#### 1. Monorepo Architecture with TypeScript

Version 0.4.0 introduces a comprehensive monorepo structure using Turborepo and pnpm workspaces:

**New Package Structure:**
```
xats/
├── packages/
│   ├── @xats-org/schema/         # Core JSON Schema definitions
│   ├── @xats-org/validator/      # Validation logic and error reporting
│   ├── @xats-org/types/          # Shared TypeScript types
│   ├── @xats-org/cli/            # Command-line interface
│   ├── @xats-org/renderer/       # Basic rendering framework
│   ├── @xats-org/utils/          # Shared utilities
│   └── @xats-org/examples/       # Example documents
├── apps/
│   ├── docs/                     # Documentation site
│   └── website/                  # xats.org website
└── turbo.json                    # Turborepo configuration
```

#### 2. Enhanced Developer Experience

**Modern Build Pipeline:**
- Turborepo for parallel builds and caching
- TypeScript-first development with strict type checking  
- ESLint and Prettier for code quality
- Comprehensive test suite with coverage reporting
- Automated dependency management

**Installation for v0.4.0:**
```bash
# New installation method
npm install @xats-org/schema @xats-org/validator @xats-org/cli

# Development setup
pnpm install  # Use pnpm for monorepo
pnpm run build
pnpm run test
```

### Migration Steps for v0.4.0

#### Step 1: Update Schema Version
```json
// Before
"schemaVersion": "0.3.0"

// After  
"schemaVersion": "0.4.0"
```

#### Step 2: Update Dependencies (For Developers)
```bash
# Replace old packages
npm uninstall @xats-org/core

# Install new modular packages
npm install @xats-org/schema @xats-org/validator @xats-org/cli
```

#### Step 3: Update Import Statements (For Developers)
```typescript
// Before (v0.3.0)
import { validateDocument } from '@xats-org/core';

// After (v0.4.0)
import { validateDocument } from '@xats-org/validator';
import { XatsDocument } from '@xats-org/types';
```

### Developer Benefits in v0.4.0

1. **Faster Builds**: Turborepo provides parallel execution and intelligent caching
2. **Better Type Safety**: Enhanced TypeScript definitions with strict null checks
3. **Modular Architecture**: Import only the packages you need
4. **Improved Documentation**: Comprehensive API documentation with examples
5. **Better Testing**: 701 tests with comprehensive coverage

---

## v0.4.0 → v0.5.0 Migration

### Breaking Changes

**✅ NO BREAKING CHANGES**

Version 0.5.0 maintains full backward compatibility with v0.4.0 documents while introducing powerful new capabilities.

### Major Features in v0.5.0

#### 1. Bidirectional Rendering Architecture

**Multi-Format Output Support:**
- **HTML**: Modern semantic HTML5 with accessibility features
- **Markdown**: GitHub Flavored Markdown with extensions
- **LaTeX**: Professional academic typesetting
- **Microsoft Word**: .docx format with proper styling
- **R Markdown**: Integration with R statistical environment

**95%+ Round-Trip Fidelity:**
```json
{
  "renderingHints": {
    "formats": ["html", "markdown", "latex", "docx", "rmd"],
    "fidelity": "high",
    "roundTrip": true,
    "preserveSemantics": true
  }
}
```

#### 2. AI Integration with Model Context Protocol (MCP)

**MCP Server Integration:**
```json
{
  "extensions": {
    "https://xats.org/extensions/ai": {
      "version": "0.5.0",
      "mcp": {
        "server": "@xats-org/mcp-server",
        "capabilities": [
          "content-validation",
          "content-generation", 
          "assessment-creation",
          "accessibility-analysis"
        ]
      },
      "providers": {
        "anthropic": {
          "model": "claude-3-5-sonnet",
          "capabilities": ["content", "assessment"]
        },
        "openai": {
          "model": "gpt-4",
          "capabilities": ["content", "assessment"]
        }
      }
    }
  }
}
```

#### 3. Enhanced Rendering Hints System

**Advanced Layout Controls:**
```json
{
  "renderingHints": {
    "layout": {
      "columns": 2,
      "columnGap": "2rem",
      "responsive": true,
      "breakpoints": {
        "mobile": "768px",
        "tablet": "1024px"
      }
    },
    "accessibility": {
      "focusManagement": true,
      "screenReaderOptimized": true,
      "colorContrast": "AAA",
      "fontSize": "scalable"
    },
    "print": {
      "pageSize": "letter",
      "margins": "1in",
      "orphanControl": true,
      "widowControl": true
    }
  }
}
```

#### 4. Full WCAG 2.1 AA Compliance Validation

**Automated Accessibility Checking:**
```json
{
  "accessibility": {
    "wcagLevel": "AA",
    "features": [
      "altText", 
      "structuralNavigation", 
      "colorContrast",
      "focusManagement",
      "keyboardNavigation"
    ],
    "validation": {
      "automated": true,
      "colorContrast": {
        "minimum": 4.5,
        "enhanced": 7.0
      },
      "focusIndicators": true
    }
  }
}
```

### Migration Steps for v0.5.0

#### Step 1: Update Schema Version
```json
// Before
"schemaVersion": "0.4.0"

// After
"schemaVersion": "0.5.0"
```

#### Step 2: Install New Packages
```bash
# Add new rendering and AI packages
pnpm add @xats-org/renderer @xats-org/mcp-server

# Update existing packages
pnpm update @xats-org/schema @xats-org/validator @xats-org/cli
```

#### Step 3: Configure Rendering (Optional)
```json
{
  "renderingHints": {
    "formats": ["html", "markdown"],  // Start with basic formats
    "fidelity": "high"
  }
}
```

#### Step 4: Set Up AI Integration (Optional)
```bash
# Install MCP server
npm install -g @xats-org/mcp-server

# Configure AI providers (requires API keys)
export ANTHROPIC_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
```

#### Step 5: Enable Enhanced Accessibility (Recommended)
```json
{
  "accessibility": {
    "wcagLevel": "AA",
    "features": ["altText", "structuralNavigation", "colorContrast"],
    "validation": {
      "automated": true
    }
  }
}
```

### v0.5.0 Usage Examples

#### Multi-Format Rendering
```typescript
import { renderDocument } from '@xats-org/renderer';

const document = /* your xats document */;

// Render to multiple formats
const html = await renderDocument(document, { format: 'html' });
const markdown = await renderDocument(document, { format: 'markdown' });
const latex = await renderDocument(document, { format: 'latex' });
const docx = await renderDocument(document, { format: 'docx' });
```

#### AI-Powered Content Generation
```typescript
import { generateContent } from '@xats-org/mcp-server';

// Generate assessment questions from content
const questions = await generateContent({
  type: 'assessment',
  source: document,
  questionType: 'multiple-choice',
  count: 5,
  difficulty: 'intermediate'
});

// Generate alt text for images
const altText = await generateContent({
  type: 'accessibility',
  element: imageElement,
  purpose: 'alt-text'
});
```

---

## v0.3.0 → v0.5.0 Migration (Direct Path)

### Why Skip v0.4.0?

For most content authors, migrating directly from v0.3.0 to v0.5.0 is the recommended path because:

1. **v0.4.0** focused on developer infrastructure (monorepo, TypeScript packages)
2. **v0.5.0** adds significant end-user features (AI integration, multi-format rendering)
3. **Full compatibility** - v0.5.0 supports all v0.3.0 documents without changes

### Breaking Changes

**✅ NO BREAKING CHANGES**

All v0.3.0 documents work perfectly in v0.5.0 without modification.

### Migration Steps for v0.3.0 → v0.5.0

#### Step 1: Update Schema Version
```json
// Before
"schemaVersion": "0.3.0"

// After
"schemaVersion": "0.5.0"
```

#### Step 2: Choose Your Enhancement Level

**Level 1: Basic Compatibility (No Changes Required)**
Your existing v0.3.0 documents work immediately with v0.5.0 tools.

**Level 2: Add Multi-Format Rendering**
```json
{
  "schemaVersion": "0.5.0",
  "renderingHints": {
    "formats": ["html", "markdown", "latex"],
    "fidelity": "high"
  }
  // ... rest of your existing document
}
```

**Level 3: Enable AI Integration**
```json
{
  "schemaVersion": "0.5.0",
  "extensions": {
    "https://xats.org/extensions/ai": {
      "version": "0.5.0",
      "capabilities": ["content-validation", "assessment-creation"],
      "provider": "anthropic"
    }
  }
  // ... rest of your existing document
}
```

**Level 4: Full v0.5.0 Feature Set**
```json
{
  "schemaVersion": "0.5.0",
  "accessibility": {
    "wcagLevel": "AA",
    "validation": { "automated": true }
  },
  "renderingHints": {
    "formats": ["html", "markdown", "latex", "docx"],
    "fidelity": "high",
    "accessibility": {
      "focusManagement": true,
      "colorContrast": "AAA"
    }
  },
  "extensions": {
    "https://xats.org/extensions/ai": {
      "version": "0.5.0",
      "mcp": {
        "server": "@xats-org/mcp-server",
        "capabilities": ["content-validation", "assessment-creation"]
      }
    }
  }
  // ... rest of your existing document
}
```

### Tool Migration for v0.3.0 → v0.5.0

#### Old CLI Usage (v0.3.0)
```bash
# v0.3.0 validation
xats-validate document.json
```

#### New CLI Usage (v0.5.0)
```bash
# Install new CLI
npm install -g @xats-org/cli

# Enhanced validation with accessibility and AI
xats validate document.json
xats validate --accessibility --wcag-level AA document.json
xats render --format html --format markdown document.json
xats generate --type assessment --from document.json
```

### Benefits of Direct v0.3.0 → v0.5.0 Migration

1. **Skip Infrastructure Changes**: Avoid the v0.4.0 developer-focused changes
2. **Immediate Feature Access**: Get AI integration and multi-format rendering right away
3. **Future-Proof**: v0.5.0 is stable and production-ready
4. **Comprehensive Upgrade**: Single migration gives you all modern features
5. **Better Tooling**: Latest CLI with enhanced capabilities

---

## General Migration Patterns

### Incremental Enhancement Strategy

Rather than migrating all features at once, adopt an incremental approach:

1. **Version Update**: Change `schemaVersion` for immediate compatibility
2. **Core Enhancements**: Add accessibility and language metadata
3. **Advanced Features**: Implement assessments, case studies, or indexing as needed
4. **Integration Features**: Configure LTI or rights management for deployment

### Content Enhancement Priorities

**Priority 1: Accessibility and Standards Compliance**
```json
{
  "language": "en-US",
  "accessibility": {
    "wcagLevel": "AA",
    "features": ["altText", "structuralNavigation"]
  }
}
```

**Priority 2: Rich Content Features**
- Case studies for applied learning
- Metacognitive prompts for reflection
- Index terms for navigation

**Priority 3: Platform Integration**
- LTI configuration for LMS deployment
- Assessment framework for interactive learning
- Rights management for publishing

### Migration Validation Checklist

- [ ] Schema version updated
- [ ] Document validates against new schema
- [ ] All accessibility features implemented
- [ ] Language attributes specified
- [ ] New content types properly structured
- [ ] Extensions configured correctly
- [ ] Existing content remains functional
- [ ] Rendering systems updated for new features

## Migration Tools

### Automated Migration Scripts

The xats project provides migration utilities:

```bash
# Install migration tools
npm install -g @xats-org/cli

# Migrate document from v0.1.0 to v0.2.0
xats migrate --from 0.1.0 --to 0.2.0 document.json

# Validate migration result
xats validate document.json
```

### Schema-Specific Validators

```bash
# Validate against specific schema version
xats validate --schema 0.3.0 document.json

# Check accessibility compliance
xats validate --wcag-check document.json

# Validate LTI configuration
xats validate --lti-check document.json
```

### Custom Migration Scripts

For complex migrations, create custom scripts:

```javascript
import { migrateDocument, validateDocument } from '@xats-org/migration-tools';

async function migrateToV3(document) {
  // Update schema version
  document.schemaVersion = '0.3.0';
  
  // Add index terms to existing content
  document = await addIndexTerms(document);
  
  // Convert narratives to case studies
  document = await convertToCaseStudies(document);
  
  // Add metacognitive prompts
  document = await addMetacognitivePrompts(document);
  
  // Validate result
  const { valid, errors } = await validateDocument(document);
  if (!valid) {
    throw new Error(`Migration failed: ${errors.join(', ')}`);
  }
  
  return document;
}
```

## Validation and Testing

### Pre-Migration Assessment

Before starting migration:

1. **Document Inventory**: Catalog all documents requiring migration
2. **Feature Analysis**: Identify which new features to adopt
3. **Tool Compatibility**: Verify rendering and authoring tool support
4. **Timeline Planning**: Establish migration schedule and milestones

### Migration Testing Process

1. **Schema Validation**: Ensure documents validate against target schema
2. **Content Rendering**: Test with all rendering systems
3. **Accessibility Testing**: Verify WCAG compliance
4. **Integration Testing**: Confirm LTI and LMS functionality
5. **User Acceptance Testing**: Validate with end users

### Validation Commands

```bash
# Complete validation suite
xats validate --comprehensive document.json

# Accessibility-specific validation
xats validate --accessibility document.json

# Assessment validation
xats validate --assessments document.json

# Extension validation
xats validate --extensions document.json
```

## Common Migration Issues

### Issue 1: Schema Version Mismatch

**Problem**: Document uses newer features but declares older schema version

**Solution**:
```json
// Ensure version matches features used
{
  "schemaVersion": "0.3.0",  // Must match newest features
  // ... content with v0.3.0 features
}
```

### Issue 2: Invalid Language Codes

**Problem**: Non-standard language codes fail validation

**Solution**: Use BCP 47 language tags:
```json
// ❌ Incorrect
"language": "english"

// ✅ Correct  
"language": "en-US"
```

### Issue 3: Missing Alt Text

**Problem**: Images lack proper alternative text

**Solution**: Add meaningful descriptions:
```json
{
  "blockType": "https://xats.org/vocabularies/blocks/figure",
  "content": {
    "resourceId": "img-cell-diagram",
    "altText": "Cross-section diagram of plant cell showing labeled organelles",
    "longDescription": "Detailed cellular structures include nucleus, chloroplasts, mitochondria, and cell wall with color coding for each organelle type."
  }
}
```

### Issue 4: Malformed Index Terms

**Problem**: IndexRun elements with invalid structure

**Solution**: Follow proper IndexRun format:
```json
{
  "type": "index",
  "term": "photosynthesis",           // Required: main term
  "subterms": ["light reactions"],   // Optional: array of strings
  "seeAlso": ["cellular respiration"], // Optional: array of strings
  "text": "photosynthesis"            // Required: display text
}
```

### Issue 5: Assessment Configuration Errors

**Problem**: LTI grade passback misconfiguration

**Solution**: Ensure proper LTI extension setup:
```json
{
  "extensions": {
    "https://xats.org/extensions/lti": {
      "configuration": {
        "platformId": "canvas.instructure.com",
        "clientId": "10000000000001",
        "deploymentId": "1:abc123"
      },
      "gradePassback": {
        "lineItemUrl": "https://canvas.instructure.com/api/lti/courses/123/line_items/456",
        "scoreMaximum": 100
      }
    }
  }
}
```

## Getting Help

### Documentation Resources
- [Schema Versioning Policy](../specs/schema-versioning-policy.md)
- [Version Compatibility Matrix](../specs/version-compatibility-matrix.md)
- [Schema Reference](../reference/index.md)

### Community Support
- [GitHub Issues](https://github.com/xats-org/core/issues)
- [Discussion Forum](https://github.com/xats-org/core/discussions)
- [Migration Assistance](https://github.com/xats-org/core/discussions/categories/migration)

### Professional Support
- [Migration Consulting](mailto:migration@xats.org)
- [Training Workshops](https://xats.org/training)
- [Integration Support](https://xats.org/support)

---

*This migration guide is updated with each schema release. For version-specific details, see the [Release Notes](../../CHANGELOG.md).*