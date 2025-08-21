# xats Authoring Guide

**Version:** 2.0 (for xats schema v0.2.0)
**Audience:** Authors, Instructional Designers, and AI Engineers

---

## 1. Introduction

This guide provides best practices for creating effective, semantically rich, and machine-readable documents using the **xats** standard. While the schema defines *what* is possible, this guide explains *how* to use the features to achieve the desired pedagogical and technical outcomes.

**New in v0.2.0:** This guide now covers the comprehensive assessment framework, LTI 1.3 integration, accessibility features, and rights management capabilities.

## 2. Thinking in `xats`: The Author's Mindset

- **Structure First:** Before writing content, map out your `Units`, `Chapters`, and `Sections`. A clear hierarchy is the foundation of a good `xats` document.
- **Embrace Semantics:** Don't think about what your content will *look like*. Think about what it *is*. Is this a `definition`? An `example`? A `paragraph`? Using the correct `blockType` is the most important part of authoring.
- **Link Everything:** A core strength of `xats` is its interconnectedness. As you write, constantly think about how you can use `ReferenceRun` and `CitationRun` to link concepts together and to outside sources.
- **Define Your Goals:** Even though `learningObjectives` are optional, they are the key to unlocking the full power of the AI ecosystem. If your content is instructional, define them clearly for each chapter to enable automated assessment and content generation.

## 3. Best Practices by Feature

### a. Assessment Framework (New in v0.2.0)

The v0.2.0 assessment framework provides powerful tools for creating pedagogically sound assessments with built-in analytics and accessibility support.

#### Assessment Types

**Multiple Choice Questions:**
```json
{
  "id": "question-1",
  "blockType": "https://xats.org/vocabularies/blocks/multipleChoice",
  "language": "en",
  "content": {
    "question": {
      "runs": [
        {
          "type": "text",
          "text": "Which organelle is responsible for cellular respiration?"
        }
      ]
    },
    "options": [
      {
        "id": "opt-mitochondria",
        "text": {"runs": [{"type": "text", "text": "Mitochondria"}]},
        "correct": true
      },
      {
        "id": "opt-nucleus",
        "text": {"runs": [{"type": "text", "text": "Nucleus"}]},
        "correct": false
      }
    ],
    "cognitiveMetadata": {
      "bloomsLevel": "remember",
      "difficulty": 1,
      "estimatedTimeMinutes": 2
    },
    "scoring": {
      "points": 10,
      "scoringMethod": "automatic"
    },
    "feedback": {
      "onCorrect": {
        "runs": [{"type": "text", "text": "Correct! Mitochondria are the powerhouses of the cell."}]
      },
      "onIncorrect": {
        "runs": [{"type": "text", "text": "Incorrect. Think about which organelle produces energy."}]
      }
    }
  }
}
```

**Short Answer Questions:**
```json
{
  "id": "short-answer-1",
  "blockType": "https://xats.org/vocabularies/blocks/shortAnswer",
  "language": "en",
  "content": {
    "question": {
      "runs": [{"type": "text", "text": "What is the chemical formula for water?"}]
    },
    "answerFormat": "text",
    "expectedAnswers": ["H2O", "H₂O"],
    "caseSensitive": false,
    "maxLength": 50,
    "cognitiveMetadata": {
      "bloomsLevel": "remember",
      "difficulty": 1,
      "estimatedTimeMinutes": 1
    },
    "scoring": {
      "points": 5,
      "scoringMethod": "automatic",
      "attempts": 2
    },
    "feedback": {
      "onCorrect": {
        "runs": [{"type": "text", "text": "Correct! Water's chemical formula is H₂O."}]
      },
      "onIncorrect": {
        "runs": [{"type": "text", "text": "Think about the elements that make up water molecules."}]
      }
    }
  }
}
```

#### Best Practices for Assessments

- **Use Cognitive Metadata:** Always include `bloomsLevel` (Bloom's Taxonomy) and `difficulty` (1-5) to enable intelligent content sequencing
- **Provide Rich Feedback:** Use comprehensive feedback structures with `onCorrect`, `onIncorrect`, and `onPartial` responses
- **Link to Learning Objectives:** Connect assessments to specific learning objectives using `linkedObjectiveIds`
- **Consider Accessibility:** Use `accessibilitySettings` for accommodations like extended time, screen reader support, or alternative input methods
- **Set Appropriate Scoring:** Configure `scoring` with proper point values, attempt limits, and penalty structures
- **Include Helpful Hints:** Use the `hints` array in feedback to provide progressive scaffolding

### b. Accessibility Best Practices (Enhanced in v0.2.0)

The v0.2.0 accessibility framework ensures WCAG 2.1 AA compliance and universal design principles.

#### Language and Internationalization
```json
{
  "language": "en",
  "textDirection": "ltr",
  "accessibilityMetadata": {
    "role": "figure",
    "ariaLabel": "Plant cell structure diagram",
    "landmarkType": "region",
    "headingLevel": 2,
    "cognitiveSupport": {
      "complexityLevel": "moderate",
      "readingLevel": 8,
      "simplifiedVersionAvailable": true
    }
  }
}
```

#### Best Practices for Accessibility

- **Set Language Properly:** Always specify `language` using ISO 639-1 codes (required for WCAG 3.1.1)
- **Configure Text Direction:** Use `textDirection` for proper RTL language support (WCAG 3.1.2)
- **Provide Alt Text:** All resources must have meaningful `altText` descriptions (WCAG 1.1.1)
- **Use ARIA Labels:** Set `ariaLabel` and `role` properties for screen reader accessibility (WCAG 4.1.2)
- **Maintain Heading Hierarchy:** Use `headingLevel` to create proper document structure (WCAG 2.4.6)
- **Support Cognitive Accessibility:** Include `cognitiveSupport` metadata with reading levels and complexity indicators
- **Enable Skip Navigation:** Use `SkipNavigationContent` blocks for keyboard accessibility (WCAG 2.4.1)

### c. LTI 1.3 Integration (New in v0.2.0)

The LTI 1.3 framework enables seamless integration with Learning Management Systems.

#### Basic LTI Configuration
```json
{
  "extensions": {
    "ltiConfiguration": {
      "toolConfiguration": {
        "version": "1.3.0",
        "deployment_id": "your-deployment-id",
        "target_link_uri": "https://your-tool.com/launch"
      },
      "gradePassbackConfig": {
        "enabled": true,
        "maxScore": 100,
        "gradingMethod": "automatic"
      }
    }
  }
}
```

#### Best Practices for LTI Integration

- **Configure Grade Passback:** Enable automatic grade synchronization with the LMS gradebook
- **Use Deep Linking:** Allow instructors to select specific content sections for their courses
- **Set Appropriate Permissions:** Configure NRPS (Names and Role Provisioning Services) for proper user management
- **Test Across Platforms:** Validate integration with major LMS platforms (Canvas, Blackboard, Moodle)

### d. Rights Management (New in v0.2.0)

The comprehensive rights framework supports commercial publishing and academic integrity.

```json
{
  "rights": {
    "license": "https://xats.org/licenses/cc-by-sa-4.0",
    "copyrightHolder": "Academic Publishing House",
    "copyrightYear": "2025",
    "permissions": {
      "redistribute": true,
      "modify": true,
      "commercialUse": false,
      "createDerivatives": true,
      "shareAlike": true
    },
    "attribution": {
      "required": true,
      "format": "Author Name, Title, Publisher, Year",
      "includeUrl": true,
      "includeLicense": true
    }
  }
}
```

### e. Content Pathways (Enhanced in v0.2.0)

Pathways now support assessment-based branching for adaptive learning.

```json
{
  "pathways": [
    {
      "id": "remedial-path",
      "triggerType": "https://xats.org/vocabularies/triggers/onAssessment",
      "sourceId": "assessment-1",
      "rules": [
        {
          "condition": "score < 70",
          "action": {
            "type": "redirect",
            "targetId": "remedial-section"
          }
        }
      ]
    }
  ]
}
```

### f. `SemanticText`

- **Keep Runs Small:** A run should be a single, coherent piece of text. Don't put multiple sentences in a single `TextRun` if they can be broken up by a reference or emphasis.
- **Use Emphasis Meaningfully:**
  - Use `EmphasisRun` (`<em>`) for light stress, defining a term for the first time, or for foreign words.
  - Use `StrongRun` (`<strong>`) for concepts of critical importance, key terms, and warnings. Overusing it will dilute its impact.
- **Make Reference Text Descriptive:** The `text` in a `ReferenceRun` should be the natural text of the sentence (e.g., "see the **previous chapter**"), not a generic "click here."

### g. Learning Objectives & Outcomes

- **Outcomes are Broad:** A `LearningOutcome` should be a high-level goal for the entire book or a major unit (e.g., "The learner will be able to analyze 19th-century poetry").
- **Objectives are Specific and Measurable:** A `LearningObjective` should be a concrete, testable skill (e.g., "The learner will be able to identify iambic pentameter in a sonnet").
- **Use Nesting for Clarity:** Break down complex objectives into smaller, nested sub-objectives. This creates a clear knowledge hierarchy for AI tutors.
- **Link Content to Objectives:** Use the `linkedObjectiveIds` property on `Sections` and `ContentBlocks` to create an explicit map between your content and your goals.

### h. `ContentBlock`s

- **Choose the Most Specific Block Possible:** Don't use a generic `paragraph` if a `definition` or `quote` block is more appropriate. The more specific you are, the smarter AI agents can be.
- **Use Placeholders Explicitly:** If you want a Table of Contents, you must add a `Section` in your `frontMatter` and place the `tableOfContents` placeholder block inside it. The schema will not generate one automatically.

### i. For AI Engineers (Prompting)

When prompting a large language model to generate `xats` content, be explicit in your instructions:
- **Request a Specific `blockType`:** "Generate a `ContentBlock` of `blockType: '.../quote'` about the importance of data standards."
- **Ask for Semantic Linking:** "In the generated paragraph, create a `ReferenceRun` that links the text 'data standards' to the `KeyTerm` with `id: 'term-data-standards'`."
- **Demand Metadata:** "For every `ContentBlock` generated, also generate a `description` and an array of relevant `tags`."

By providing these structured instructions, you can guide the AI to produce high-quality, semantically rich `xats` content.