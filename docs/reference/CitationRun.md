# `CitationRun`

**Type:** `object`

---

## Description

A `CitationRun` represents an inline citation to a bibliographic entry. It creates a reference to scholarly sources, ensuring proper academic attribution and enabling automatic bibliography generation according to specified citation styles.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` (const: "citation") | **Yes** | Identifies this as a citation run. |
| `refId` | `string` | **Yes** | The ID of the `CslDataItem` in the bibliography to cite. |

---

## Usage Example

```json
{
  "type": "citation",
  "refId": "smith2023-cellular-biology"
}
```

---

## Related Objects

- [SemanticText](./SemanticText.md) - Contains arrays of text runs including citations
- [CslDataItem](./CslDataItem.md) - The bibliographic entry being cited
- [BackMatter](./BackMatter.md) - Contains the bibliography with CSL data items

---

## Notes

- The `refId` must correspond to an existing `CslDataItem` ID in the document's bibliography
- Citation display format is determined by the document's `citationStyle` property
- Renderers should automatically format citations according to the specified CSL style
- Citations enable proper academic attribution and automatic bibliography generation
- No display text is specified as the citation format is determined by the citation style