# `ReferenceRun`

**Type:** `object`

---

## Description

A `ReferenceRun` creates an inline cross-reference to another object within the document. It displays text that acts as a clickable link to the referenced content, enabling rich internal navigation and connectivity between different parts of the textbook.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` (const: "reference") | **Yes** | Identifies this as a reference run. |
| `text` | `string` | **Yes** | The display text for the reference link (e.g., "Figure 3.1", "Section 2.4"). |
| `refId` | `string` | **Yes** | The ID of the target object being referenced. Must match an existing object's ID. |

---

## Usage Example

```json
{
  "type": "reference",
  "text": "Figure 3.1",
  "refId": "fig-cellular-structure"
}
```

---

## Related Objects

- [SemanticText](./SemanticText.md) - Contains arrays of text runs including references
- [TextRun](./TextRun.md) - Basic text run without reference functionality
- [XatsObject](./XatsObject.md) - Any object with an ID can be referenced
- [ContentBlock](./ContentBlock.md) - Common target for references

---

## Notes

- The `refId` must correspond to an existing object's `id` property within the document
- Reference text should be descriptive and help users understand what they're linking to
- Renderers should validate that referenced IDs exist and provide appropriate error handling for broken references
- References enable rich internal navigation and help create cohesive learning experiences