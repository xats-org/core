# `NavigationItem`

**Type:** `object`

---

## Description

An individual navigation item that can be nested to create hierarchical navigation structures. Navigation items provide structured links within textbook content while maintaining proper accessibility and semantic markup.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique identifier for this navigation item. |
| `label` | `SemanticText` | **Yes** | Display text for the navigation item. |
| `destinationId` | `string` | **Yes** | ID of the target structural container or content block to navigate to. |
| `level` | `integer` (1-6) | **Yes** | Hierarchical level of this navigation item for proper heading structure (1-6). |
| `subItems` | `array` of `NavigationItem`s | No | Nested navigation items for creating hierarchical navigation structures. |

---

## Usage Example

```json
{
  "id": "nav-genetics",
  "label": {
    "runs": [{"type": "text", "text": "Genetics and Heredity"}]
  },
  "destinationId": "chapter-genetics",
  "level": 1,
  "subItems": [
    {
      "id": "nav-mendelian",
      "label": {
        "runs": [{"type": "text", "text": "Mendelian Genetics"}]
      },
      "destinationId": "section-mendelian",
      "level": 2,
      "subItems": [
        {
          "id": "nav-laws",
          "label": {
            "runs": [{"type": "text", "text": "Mendel's Laws"}]
          },
          "destinationId": "subsection-laws",
          "level": 3
        }
      ]
    },
    {
      "id": "nav-molecular",
      "label": {
        "runs": [{"type": "text", "text": "Molecular Genetics"}]
      },
      "destinationId": "section-molecular",
      "level": 2
    }
  ]
}
```

---

## Related Objects

- [NavigationContent](./NavigationContent.md) - Contains arrays of NavigationItem objects
- [SemanticText](./SemanticText.md) - Used for navigation item labels
- [StructuralContainer](./StructuralContainer.md) - Common targets for navigation (Units, Chapters, Sections)
- [ContentBlock](./ContentBlock.md) - Can also be navigation targets

---

## Notes

- Navigation items can be nested to any depth to support complex document hierarchies
- The `level` property should reflect the actual hierarchical position in the document structure
- Destination IDs must reference existing objects within the document
- Proper level assignment ensures accessible heading structures (WCAG 2.4.6)
- Labels should be concise but descriptive enough to understand the destination content
- Self-referencing navigation items (where id equals destinationId) should be avoided