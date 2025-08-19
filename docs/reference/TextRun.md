# `TextRun`

**Type:** `object`

---

## Description

A `TextRun` represents a basic span of plain text within a `SemanticText` object. It is the simplest form of text content and serves as the foundation for more complex text structures with inline formatting and semantic elements.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` (const: "text") | **Yes** | Identifies this as a plain text run. |
| `text` | `string` | **Yes** | The actual text content to be displayed. |

---

## Usage Example

```json
{
  "type": "text",
  "text": "This is a simple text run within a semantic text structure."
}
```

---

## Related Objects

- [SemanticText](./SemanticText.md) - Contains arrays of text runs
- [ReferenceRun](./ReferenceRun.md) - Text run with cross-reference functionality
- [CitationRun](./CitationRun.md) - Text run that represents a citation
- [EmphasisRun](./EmphasisRun.md) - Text run with emphasis formatting
- [StrongRun](./StrongRun.md) - Text run with strong emphasis formatting

---

## Notes

- TextRun is the most basic building block of semantic text content
- Multiple TextRun objects can be combined with other run types to create rich, structured text
- Text content should be in the language specified by the containing object's language property