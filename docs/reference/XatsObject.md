# `XatsObject`

**Type:** `object`

---

### Description

The `XatsObject` is the most fundamental base object in the **xats** standard. It provides a consistent set of universal metadata properties for all addressable components. Nearly every major object in the schema inherits from this definition, ensuring that all content is identifiable, describable, and extensible.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | A document-unique identifier for the object. This is the address used by `ReferenceRun` and `pathways`. |
| `description` | `string` | No | An optional internal description or author's note for this object. This is not typically intended for public display. |
| `tags` | `array` of `string`s | No | An optional array of keywords for search, discovery, and categorization by AI agents. |
| `citationIds` | `array` of `string`s | No | An array of `id`s from `CslDataItem` objects in the `bibliography`. Used to cite the source of the entire object (e.g., an image). |
| `renderingHints` | `array` of `RenderingHint` objects | No | An array of hints to guide the renderer on presentational intent. |
| `language` | `string` | **Yes** | ISO 639-1 language code for the content (e.g., "en", "es", "fr", "zh-CN"). Required for WCAG 3.1.1 compliance. |
| `textDirection` | `string` (enum) | No | Text direction for content: "ltr", "rtl", or "auto". Required for proper rendering of RTL languages (WCAG 3.1.2). Default: "ltr". |
| `accessibilityMetadata` | `AccessibilityMetadata` | No | Accessibility-specific metadata for this object. |
| `rights` | `RightsMetadata` | No | Rights and licensing information for this object. Inherits from parent container if not specified. |
| `extensions` | `object` | No | A container for any non-standard, custom data. This is the primary mechanism for community-driven extension. |

---

## Usage Example

```json
{
  "id": "example-content",
  "description": "Example content object for demonstration",
  "tags": ["example", "demonstration", "educational"],
  "citationIds": ["smith2023", "jones2024"],
  "language": "en",
  "textDirection": "ltr",
  "accessibilityMetadata": {
    "role": "main",
    "landmarkType": "main"
  },
  "rights": {
    "license": "https://xats.org/licenses/cc-by-4.0",
    "copyrightHolder": "Educational Content Publisher"
  },
  "renderingHints": [
    {
      "hintType": "https://xats.org/vocabularies/hints/emphasis",
      "value": "important"
    }
  ]
}
```

---

## Related Objects

- [RenderingHint](./RenderingHint.md) - Used in renderingHints array
- [AccessibilityMetadata](./AccessibilityMetadata.md) - Used for accessibility information
- [RightsMetadata](./RightsMetadata.md) - Used for rights and licensing information
- [CslDataItem](./CslDataItem.md) - Referenced in citationIds array

---

## Inherited By

- [StructuralContainer](./StructuralContainer.md)
- [ContentBlock](./ContentBlock.md)
- [LearningOutcome](./LearningOutcome.md)
- [LearningObjective](./LearningObjective.md)
- [Resource](./Resource.md)
- [KeyTerm](./KeyTerm.md)

---

## Notes

- The `language` property is required for WCAG compliance and proper content presentation
- `textDirection` is essential for proper rendering of right-to-left languages like Arabic and Hebrew
- Accessibility metadata enables rich assistive technology support
- Rights metadata can be inherited from parent containers or specified at the object level