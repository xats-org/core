# `SemanticText`

**Type:** `object`

---

### Description

The `SemanticText` object is a core innovation of the **xats** standard. It replaces simple text strings with a structured array of "runs," allowing for the embedding of rich semantic meaning, such as in-line links and emphasis, directly within the flow of text.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `runs` | `array` | **Yes** | An array of run objects that, when concatenated, form the complete text content. |

### Run Types

The `runs` array can contain a mix of the following objects:

- **`TextRun`**: A plain string of text.
- **`ReferenceRun`**: An internal link to another `XatsObject`.
- **`CitationRun`**: A link to an external source in the bibliography.
- **`EmphasisRun`**: Semantic emphasis (typically rendered as italics).
- **`StrongRun`**: Semantic strong importance (typically rendered as bold).

---

### Example

```json
"content": {
  "runs": [
    { "type": "text", "text": "The key is " },
    { "type": "strong", "text": "semantic structure" },
    { "type": "text", "text": "." }
  ]
}
```