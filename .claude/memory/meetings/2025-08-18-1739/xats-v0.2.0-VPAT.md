# Voluntary Product Accessibility Template (VPAT®) 2.5
## xats - Extensible Academic Textbook Schema v0.2.0

**Date:** January 18, 2025  
**Product Name:** xats (Extensible Academic Textbook Schema)  
**Product Version:** v0.2.0  
**Product Description:** JSON-based standard for defining accessible educational materials  
**Contact Information:** xats-org/core on GitHub  
**Evaluation Methods:** Schema analysis, automated testing, assistive technology validation  

---

## Executive Summary

The xats v0.2.0 schema provides comprehensive support for creating WCAG 2.1 AA compliant educational content. This VPAT documents the schema's accessibility capabilities and guidance for content authors to create accessible materials.

### Key Accessibility Features in v0.2.0

- **Language Support** (WCAG 3.1.1, 3.1.2): Required language identification at all levels
- **Navigation Infrastructure** (WCAG 2.4.1): Landmark support and skip navigation capabilities
- **Semantic Structure** (WCAG 1.3.1): Heading levels, relationships, and document structure
- **Alternative Content** (WCAG 1.1.1): Comprehensive text alternatives and descriptions
- **Internationalization**: RTL text support for global content

---

## WCAG 2.1 Level A Conformance

### Table 1: Success Criteria, Level A

| Criteria | Conformance Level | Remarks and Explanations |
|----------|------------------|--------------------------|
| **1.1.1 Non-text Content** | **Supports** | Schema provides `alternativeText` for all Resource objects, `ariaLabel` in AccessibilityMetadata |
| **1.2.1 Audio-only and Video-only** | **Supports** | Resource type supports transcript links and alternative content |
| **1.2.2 Captions** | **Supports** | Video resources can reference caption files via `captionUrl` |
| **1.2.3 Audio Description** | **Supports** | AudioDescription can be linked as separate Resource |
| **1.3.1 Info and Relationships** | **Supports** | Full semantic structure with headingLevel, role, relationships |
| **1.3.2 Meaningful Sequence** | **Supports** | Document structure enforces logical reading order |
| **1.3.3 Sensory Characteristics** | **Supports** | Schema doesn't rely on sensory characteristics |
| **1.4.1 Use of Color** | **Not Applicable** | Schema is content structure, not presentation |
| **1.4.2 Audio Control** | **Not Applicable** | Implementation concern, not schema |
| **2.1.1 Keyboard** | **Supports** | Schema enables keyboard-navigable structure |
| **2.1.2 No Keyboard Trap** | **Not Applicable** | Implementation concern |
| **2.2.1 Timing Adjustable** | **Supports** | Assessment timing controls in schema |
| **2.2.2 Pause, Stop, Hide** | **Not Applicable** | Implementation concern |
| **2.3.1 Three Flashes** | **Not Applicable** | Content rendering concern |
| **2.4.1 Bypass Blocks** | **Supports** | skipTarget and landmark navigation |
| **2.4.2 Page Titled** | **Supports** | Required title fields at all structural levels |
| **2.4.3 Focus Order** | **Supports** | Logical document structure ensures proper focus order |
| **2.4.4 Link Purpose** | **Supports** | ReferenceRun includes descriptive text |
| **2.5.1 Pointer Gestures** | **Not Applicable** | Implementation concern |
| **2.5.2 Pointer Cancellation** | **Not Applicable** | Implementation concern |
| **2.5.3 Label in Name** | **Supports** | ariaLabel supplements visible labels |
| **2.5.4 Motion Actuation** | **Not Applicable** | Implementation concern |
| **3.1.1 Language of Page** | **Supports** | Required language property on XatsObject |
| **3.2.1 On Focus** | **Not Applicable** | Implementation concern |
| **3.2.2 On Input** | **Not Applicable** | Implementation concern |
| **3.3.1 Error Identification** | **Supports** | Assessment feedback structures |
| **3.3.2 Labels or Instructions** | **Supports** | Question prompts and instructions |
| **4.1.1 Parsing** | **Supports** | Valid JSON Schema ensures parsing |
| **4.1.2 Name, Role, Value** | **Supports** | AccessibilityMetadata provides role, ariaLabel |

---

## WCAG 2.1 Level AA Conformance

### Table 2: Success Criteria, Level AA

| Criteria | Conformance Level | Remarks and Explanations |
|----------|------------------|--------------------------|
| **1.2.4 Captions (Live)** | **Not Applicable** | No live content in schema |
| **1.2.5 Audio Description** | **Supports** | AudioDescription resource type |
| **1.3.4 Orientation** | **Not Applicable** | Implementation concern |
| **1.3.5 Identify Input Purpose** | **Supports** | Assessment input types defined |
| **1.4.3 Contrast (Minimum)** | **Not Applicable** | Presentation layer concern |
| **1.4.4 Resize Text** | **Not Applicable** | Implementation concern |
| **1.4.5 Images of Text** | **Supports** | Schema encourages semantic text |
| **1.4.10 Reflow** | **Not Applicable** | Implementation concern |
| **1.4.11 Non-text Contrast** | **Not Applicable** | Presentation concern |
| **1.4.12 Text Spacing** | **Not Applicable** | Implementation concern |
| **1.4.13 Content on Hover** | **Not Applicable** | Implementation concern |
| **2.4.5 Multiple Ways** | **Supports** | TOC, index, search metadata |
| **2.4.6 Headings and Labels** | **Supports** | headingLevel property, semantic labels |
| **2.4.7 Focus Visible** | **Not Applicable** | Implementation concern |
| **3.1.2 Language of Parts** | **Supports** | Language property at any level |
| **3.2.3 Consistent Navigation** | **Supports** | Structural consistency enforced |
| **3.2.4 Consistent Identification** | **Supports** | Consistent object types |
| **3.3.3 Error Suggestion** | **Supports** | Assessment feedback hints |
| **3.3.4 Error Prevention** | **Supports** | Schema validation prevents errors |
| **4.1.3 Status Messages** | **Supports** | ariaLive property support |

---

## Implementation Guidance

### For Content Authors

1. **Always provide language codes** - Required field ensures screen reader pronunciation
2. **Use heading levels correctly** - Sequential heading structure (h1→h2→h3)
3. **Add alternative text** - All images need meaningful descriptions
4. **Structure content semantically** - Use appropriate block types
5. **Include skip navigation** - Mark main content areas with skipTarget

### For Platform Developers

1. **Honor accessibility metadata** - Implement ARIA roles and properties
2. **Preserve document structure** - Maintain heading hierarchy
3. **Support keyboard navigation** - Use landmark and skip navigation hints
4. **Implement focus management** - Follow document's logical order
5. **Provide user controls** - Allow timing adjustments for assessments

---

## Testing & Validation

### Automated Testing Available
- Language validation ✅
- Heading hierarchy checking ✅
- Alternative text presence ✅
- Structural validation ✅
- Link text validation ✅

### Manual Testing Required
- Alternative text quality
- Color contrast (presentation layer)
- Keyboard navigation flow
- Screen reader compatibility
- Cognitive accessibility

---

## Compliance Summary

**xats v0.2.0 Schema Compliance Level: WCAG 2.1 AA Capable**

The schema provides all necessary structures and metadata to create WCAG 2.1 AA compliant educational content. Actual compliance depends on:
- Content authors properly using accessibility features
- Implementation platforms correctly rendering accessibility metadata
- Quality of alternative content provided

### Critical Requirements Met ✅
- Language identification (3.1.1, 3.1.2)
- Document structure (1.3.1, 2.4.6)
- Navigation mechanisms (2.4.1, 2.4.5)
- Alternative content (1.1.1)
- Semantic markup (4.1.2)

### Testing Suite Available
Comprehensive automated testing framework at:
`/test/accessibility/wcag-compliance.test.ts`

---

## Revision History

| Version | Date | Description |
|---------|------|-------------|
| 1.0 | 2025-01-18 | Initial VPAT for xats v0.2.0 |

---

*VPAT® is a registered trademark of the Information Technology Industry Council (ITI)*