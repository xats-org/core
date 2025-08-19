# AccessibilityMetadata

**Type:** `object`

Comprehensive accessibility metadata for WCAG 2.1 AA compliance and enhanced user experience for learners with disabilities.

## Properties

### `altText` (optional)
- **Type:** `string`
- **Description:** Alternative text for images and visual content (WCAG 1.1.1).

### `longDescription` (optional)
- **Type:** `string`
- **Description:** Extended description for complex images, charts, or diagrams.

### `ariaLabel` (optional)
- **Type:** `string`
- **Description:** Accessible name for the element when the text content is insufficient (WCAG 4.1.2).

### `ariaDescribedBy` (optional)
- **Type:** `array` of `string`
- **Description:** IDs of elements that describe this object (WCAG 1.3.1).

### `landmarkType` (optional)
- **Type:** `string`
- **Enum:** `"banner"`, `"main"`, `"navigation"`, `"complementary"`, `"contentinfo"`, `"search"`, `"form"`, `"region"`
- **Description:** Semantic landmark type for navigation (WCAG 2.4.1).

### `skipTarget` (optional)
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Whether this element can be targeted by skip navigation links (WCAG 2.4.1).

### `headingLevel` (optional)
- **Type:** `integer`
- **Minimum:** 1
- **Maximum:** 6
- **Description:** Semantic heading level (1-6) for proper document structure (WCAG 2.4.6).

### `cognitiveSupport` (optional)
- **Type:** `object`
- **Description:** Cognitive accessibility features.
- **Properties:**
  - `complexityLevel`: Content complexity level (`"simple"`, `"moderate"`, `"complex"`, `"advanced"`)
  - `readingLevel`: Estimated reading level (grade level)
  - `simplifiedVersionAvailable`: Whether a simplified version exists
  - `summaryAvailable`: Whether a summary version exists

## Usage Example

```json
{
  "altText": "Diagram showing the structure of a plant cell with labeled organelles",
  "longDescription": "This diagram illustrates a typical plant cell cross-section. The large central vacuole occupies most of the cell's interior. The nucleus is positioned near the cell wall, surrounded by cytoplasm containing various organelles including chloroplasts, mitochondria, and the endoplasmic reticulum.",
  "ariaLabel": "Plant cell structure diagram",
  "landmarkType": "figure",
  "headingLevel": 3,
  "cognitiveSupport": {
    "complexityLevel": "moderate",
    "readingLevel": 9,
    "simplifiedVersionAvailable": true,
    "summaryAvailable": false
  }
}
```

## WCAG 2.1 AA Compliance

This metadata structure ensures compliance with Web Content Accessibility Guidelines 2.1 Level AA, supporting:

- **Perceivable:** Alternative text, color contrast, resizable text
- **Operable:** Keyboard navigation, seizure prevention, navigation aids  
- **Understandable:** Readable text, predictable functionality
- **Robust:** Compatible with assistive technologies

## Related Objects
- [XatsObject](./XatsObject.md)
- [AssessmentAccessibilitySettings](./AssessmentAccessibilitySettings.md)