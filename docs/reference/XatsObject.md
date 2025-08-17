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
| `extensions` | `object` | No | A container for any non-standard, custom data. This is the primary mechanism for community-driven extension. |

---

### Inherited By

- [`StructuralContainer`](./StructuralContainer.md)
- [`ContentBlock`](./ContentBlock.md)
- [`LearningOutcome`](./LearningOutcome.md)
- [`LearningObjective`](./LearningObjective.md)
- [`Resource`](./Resource.md)
- [`KeyTerm`](./KeyTerm.md)