# `NavigationContent`

**Type:** `object`

---

## Description

Content structure for navigation blocks that provide semantic navigation landmarks and structured navigation menus. Supports WCAG accessibility guidelines by creating clear navigation hierarchies and landmarks for assistive technologies.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `navigationLabel` | `string` | **Yes** | Accessible label for the navigation area (WCAG 2.4.1 compliance). |
| `navigationItems` | `array` of navigation items | **Yes** | Array of navigation items that define the navigation structure. |

### Navigation Item Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique identifier for this navigation item. |
| `label` | `SemanticText` | **Yes** | Display text for the navigation item. |
| `destinationId` | `string` | **Yes** | ID of the target structural container or content block. |
| `level` | `integer` (1-6) | **Yes** | Hierarchical level of this navigation item for proper heading structure. |
| `subItems` | `array` of `NavigationItem`s | No | Nested navigation items for hierarchical navigation. |

---

## Usage Example

```json
{
  "navigationLabel": "Chapter Navigation",
  "navigationItems": [
    {
      "id": "nav-intro",
      "label": {
        "runs": [{"type": "text", "text": "Introduction"}]
      },
      "destinationId": "chapter-1-intro",
      "level": 1
    },
    {
      "id": "nav-concepts",
      "label": {
        "runs": [{"type": "text", "text": "Core Concepts"}]
      },
      "destinationId": "section-concepts",
      "level": 1,
      "subItems": [
        {
          "id": "nav-definition",
          "label": {
            "runs": [{"type": "text", "text": "Definitions"}]
          },
          "destinationId": "subsection-definitions",
          "level": 2
        },
        {
          "id": "nav-examples",
          "label": {
            "runs": [{"type": "text", "text": "Examples"}]
          },
          "destinationId": "subsection-examples", 
          "level": 2
        }
      ]
    }
  ]
}
```

---

## Related Objects

- [NavigationItem](./NavigationItem.md) - Individual navigation items used in the navigationItems array
- [SemanticText](./SemanticText.md) - Used for navigation item labels
- [ContentBlock](./ContentBlock.md) - Contains navigation content when blockType is navigation
- [SkipNavigationContent](./SkipNavigationContent.md) - Complementary accessibility navigation feature

---

## Notes

- Navigation labels should be descriptive and meaningful for screen reader users
- Hierarchical levels (1-6) correspond to heading levels and must follow proper heading structure
- Destination IDs must reference existing structural containers or content blocks
- Nested navigation supports complex document structures with sub-sections
- Navigation blocks serve as semantic landmarks for accessibility compliance
- Consider keyboard navigation and focus management when implementing navigation interfaces