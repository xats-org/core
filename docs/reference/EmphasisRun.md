# `EmphasisRun`

**Type:** `object`

---

## Description

An `EmphasisRun` represents text with emphasis formatting, typically rendered as italic text. It provides semantic emphasis while maintaining accessibility and allowing for flexible presentation across different output formats.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` (const: "emphasis") | **Yes** | Identifies this as an emphasis run. |
| `text` | `string` | **Yes** | The text content to be emphasized. |

---

## Usage Example

```json
{
  "type": "emphasis",
  "text": "mitochondria"
}
```

---

## Related Objects

- [SemanticText](./SemanticText.md) - Contains arrays of text runs including emphasis
- [TextRun](./TextRun.md) - Basic text run without emphasis
- [StrongRun](./StrongRun.md) - Text run with stronger emphasis

---

## Notes

- Emphasis typically renders as italic text in visual presentations
- Screen readers and assistive technologies should convey the emphasis appropriately
- Use emphasis for terms being introduced, foreign words, or content that needs subtle highlighting
- For stronger emphasis, use `StrongRun` instead