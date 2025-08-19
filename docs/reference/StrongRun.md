# `StrongRun`

**Type:** `object`

---

## Description

A `StrongRun` represents text with strong emphasis formatting, typically rendered as bold text. It provides strong semantic emphasis for important content while maintaining accessibility and allowing for flexible presentation.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` (const: "strong") | **Yes** | Identifies this as a strong emphasis run. |
| `text` | `string` | **Yes** | The text content to be strongly emphasized. |

---

## Usage Example

```json
{
  "type": "strong",
  "text": "Important:"
}
```

---

## Related Objects

- [SemanticText](./SemanticText.md) - Contains arrays of text runs including strong emphasis
- [TextRun](./TextRun.md) - Basic text run without emphasis
- [EmphasisRun](./EmphasisRun.md) - Text run with lighter emphasis

---

## Notes

- Strong emphasis typically renders as bold text in visual presentations
- Screen readers and assistive technologies should convey the strong emphasis appropriately
- Use strong emphasis for key terms, warnings, important concepts, or content requiring significant attention
- For lighter emphasis, use `EmphasisRun` instead