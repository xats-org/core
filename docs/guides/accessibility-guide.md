# xats Accessibility Guide

## Overview

The xats standard is designed with accessibility as a core principle. This guide explains how to create accessible educational content that meets WCAG 2.1 AA standards and serves all learners effectively.

## Table of Contents

- [WCAG 2.1 AA Compliance](#wcag-21-aa-compliance)
- [Required Accessibility Features](#required-accessibility-features)
- [Best Practices](#best-practices)
- [Testing and Validation](#testing-and-validation)
- [Common Patterns](#common-patterns)
- [Resources](#resources)

## WCAG 2.1 AA Compliance

xats v0.3.0 provides 100% WCAG 2.1 AA compliance through:

### 1. Perceivable Content

- **Text Alternatives**: All non-text content has text alternatives
- **Time-based Media**: Captions and transcripts for audio/video
- **Adaptable**: Content can be presented in different ways
- **Distinguishable**: Easy to see and hear content

### 2. Operable Interface

- **Keyboard Accessible**: All functionality via keyboard
- **Enough Time**: Users have enough time to read content
- **Seizures**: No content causes seizures
- **Navigable**: Clear navigation and structure

### 3. Understandable Information

- **Readable**: Text is readable and understandable
- **Predictable**: Pages appear and operate predictably
- **Input Assistance**: Help users avoid and correct mistakes

### 4. Robust Content

- **Compatible**: Works with current and future assistive technologies
- **Semantic Structure**: Proper use of semantic elements
- **Valid**: Well-formed, validated content

## Required Accessibility Features

### Language Identification

Every document and content element must identify its language:

```json
{
  "schemaVersion": "0.3.0",
  "language": "en-US",  // Document-level language
  "bodyMatter": {
    "contents": [
      {
        "id": "ch-1",
        "language": "en-US",  // Chapter-level language
        "title": "Introduction",
        "sections": [
          {
            "id": "sec-1-1",
            "language": "en-US",  // Section-level language
            "content": [
              {
                "id": "para-1",
                "blockType": "https://xats.org/vocabularies/blocks/paragraph",
                "content": {
                  "runs": [
                    {
                      "type": "text",
                      "text": "Hello",
                      "language": "en"  // Inline language
                    },
                    {
                      "type": "text",
                      "text": " Bonjour",
                      "language": "fr"  // Different language inline
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

### Alt Text for Images

All images must have alternative text:

```json
{
  "id": "fig-1",
  "blockType": "https://xats.org/vocabularies/blocks/figure",
  "content": {
    "resourceId": "img-dna-structure",
    "altText": "Double helix structure of DNA molecule",
    "longDescription": "The DNA double helix consists of two polynucleotide strands wound around each other. The sugar-phosphate backbones are on the outside with the nitrogenous bases pointing inward, connected by hydrogen bonds."
  }
}
```

### Heading Hierarchy

Maintain proper heading levels:

```json
{
  "id": "heading-1",
  "blockType": "https://xats.org/vocabularies/blocks/heading",
  "content": {
    "level": 1,  // h1
    "text": {
      "runs": [
        {
          "type": "text",
          "text": "Chapter 1: Introduction"
        }
      ]
    }
  }
},
{
  "id": "heading-2",
  "blockType": "https://xats.org/vocabularies/blocks/heading",
  "content": {
    "level": 2,  // h2 - properly nested under h1
    "text": {
      "runs": [
        {
          "type": "text",
          "text": "1.1 Overview"
        }
      ]
    }
  }
}
```

### Table Headers

Tables must have proper headers:

```json
{
  "id": "table-1",
  "blockType": "https://xats.org/vocabularies/blocks/table",
  "content": {
    "caption": "Comparison of Cell Types",
    "headers": ["Feature", "Plant Cell", "Animal Cell"],
    "rows": [
      {
        "cells": [
          {"content": {"runs": [{"type": "text", "text": "Cell Wall"}]}},
          {"content": {"runs": [{"type": "text", "text": "Present"}]}},
          {"content": {"runs": [{"type": "text", "text": "Absent"}]}}
        ]
      }
    ]
  }
}
```

## Best Practices

### 1. Descriptive Link Text

Avoid "click here" - use descriptive text:

```json
// ❌ Bad
{
  "type": "text",
  "text": "Click here for more information"
}

// ✅ Good
{
  "type": "text",
  "text": "Read more about cellular respiration"
}
```

### 2. Color and Contrast

Don't rely solely on color to convey information:

```json
{
  "renderingHints": [
    {
      "hintType": "https://xats.org/hints/emphasis",
      "value": "important",
      "description": "This text is important (shown in red with bold)"
    }
  ]
}
```

### 3. Mathematical Content

Provide text alternatives for equations:

```json
{
  "id": "eq-1",
  "blockType": "https://xats.org/vocabularies/blocks/math",
  "content": {
    "notation": "latex",
    "expression": "E = mc^2",
    "altText": "E equals m c squared",
    "description": "Einstein's mass-energy equivalence formula"
  }
}
```

### 4. Video and Audio

Include captions and transcripts:

```json
{
  "id": "video-1",
  "blockType": "https://xats.org/vocabularies/blocks/video",
  "content": {
    "resourceId": "mitosis-animation",
    "captions": [
      {
        "language": "en",
        "url": "https://example.com/captions/mitosis-en.vtt"
      }
    ],
    "transcript": {
      "url": "https://example.com/transcripts/mitosis.txt"
    },
    "audioDescription": {
      "url": "https://example.com/audio-desc/mitosis.mp3"
    }
  }
}
```

### 5. Skip Navigation

Provide skip links for repetitive content:

```json
{
  "navigationAids": {
    "skipLinks": [
      {
        "targetId": "main-content",
        "label": "Skip to main content"
      },
      {
        "targetId": "ch-nav",
        "label": "Skip to chapter navigation"
      }
    ]
  }
}
```

## Testing and Validation

### Automated Testing

Use the xats validator with accessibility checks:

```bash
xats validate --accessibility my-document.json
```

### Manual Testing

1. **Screen Reader Testing**
   - Test with NVDA (Windows)
   - Test with JAWS (Windows)
   - Test with VoiceOver (macOS/iOS)
   - Test with TalkBack (Android)

2. **Keyboard Navigation**
   - Tab through all interactive elements
   - Ensure focus indicators are visible
   - Test keyboard shortcuts

3. **Color Contrast**
   - Use tools like WebAIM's contrast checker
   - Ensure 4.5:1 ratio for normal text
   - Ensure 3:1 ratio for large text

### Validation Checklist

- [ ] All images have alt text
- [ ] Complex images have long descriptions
- [ ] Videos have captions
- [ ] Audio has transcripts
- [ ] Heading hierarchy is logical
- [ ] Tables have headers
- [ ] Links are descriptive
- [ ] Language is identified
- [ ] Color is not sole indicator
- [ ] Content is keyboard accessible

## Common Patterns

### Accessible Quiz

```json
{
  "id": "quiz-1",
  "blockType": "https://xats.org/extensions/assessment/quiz",
  "content": {
    "title": "Chapter Review Quiz",
    "instructions": "Select the best answer for each question. You have unlimited time.",
    "questions": [
      {
        "id": "q1",
        "type": "multiple-choice",
        "prompt": "Which organelle is responsible for photosynthesis?",
        "options": [
          {
            "id": "opt-a",
            "text": "Mitochondria",
            "feedback": "Incorrect. Mitochondria are responsible for cellular respiration."
          },
          {
            "id": "opt-b",
            "text": "Chloroplast",
            "correct": true,
            "feedback": "Correct! Chloroplasts contain chlorophyll and perform photosynthesis."
          }
        ],
        "hint": "Think about which organelle is green and found in plant cells."
      }
    ]
  },
  "accessibility": {
    "timeLimit": "none",
    "allowsScreenReader": true,
    "keyboardShortcuts": {
      "nextQuestion": "Alt+N",
      "previousQuestion": "Alt+P",
      "submitQuiz": "Alt+S"
    }
  }
}
```

### Accessible Diagram

```json
{
  "id": "diagram-1",
  "blockType": "https://xats.org/vocabularies/blocks/figure",
  "content": {
    "resourceId": "water-cycle-diagram",
    "altText": "Diagram of the water cycle",
    "longDescription": "The water cycle diagram shows: 1) Evaporation from oceans and lakes rising as water vapor, 2) Condensation forming clouds in the atmosphere, 3) Precipitation falling as rain or snow, 4) Collection in rivers and groundwater, 5) The cycle repeating as water returns to oceans.",
    "tactileVersion": {
      "url": "https://example.com/tactile/water-cycle.svg",
      "description": "Tactile diagram available for 3D printing"
    }
  }
}
```

## Accessibility Metadata

Declare your document's accessibility features:

```json
{
  "accessibility": {
    "wcagLevel": "AA",
    "features": [
      "altText",
      "audioDescription",
      "captions",
      "describedMath",
      "longDescription",
      "readingOrder",
      "structuralNavigation",
      "tableOfContents",
      "taggedPDF",
      "transcript"
    ],
    "hazards": [],  // No flashing, motion simulation, or sound hazards
    "apis": ["ARIA"],
    "controls": [
      "fullKeyboardControl",
      "fullMouseControl",
      "fullTouchControl"
    ],
    "languages": ["en-US", "es-MX", "fr-CA"]
  }
}
```

## Resources

### Standards and Guidelines

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/TR/wai-aria-practices-1.1/)
- [Section 508 Standards](https://www.section508.gov/)

### Testing Tools

- [axe DevTools](https://www.deque.com/axe/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [Pa11y Command Line Tool](https://pa11y.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Learning Resources

- [WebAIM Training](https://webaim.org/articles/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Assistive Technology

- [NVDA Screen Reader](https://www.nvaccess.org/)
- [JAWS Screen Reader](https://www.freedomscientific.com/products/software/jaws/)
- [Dragon NaturallySpeaking](https://www.nuance.com/dragon.html)

## Getting Help

- **Accessibility Issues**: [github.com/xats-org/core/issues](https://github.com/xats-org/core/issues) (tag with 'accessibility')
- **Community Forum**: [github.com/xats-org/core/discussions](https://github.com/xats-org/core/discussions)
- **Documentation**: [xats.org/docs/accessibility](https://xats.org/docs/accessibility)

---

*Remember: Accessibility is not just about compliance - it's about ensuring all learners can access and benefit from educational content.*