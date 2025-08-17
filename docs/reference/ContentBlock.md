# `ContentBlock`

**Type:** `object`  
**Inherits from:** [`XatsObject`](./XatsObject.md)

---

### Description

The `ContentBlock` is the most granular unit of instructional content in a **xats** document. It represents a single, self-contained piece of content, such as a paragraph, an image, a list, or a definition. Its specific nature is defined by its `blockType`.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `blockType` | `string` (URI) | **Yes** | A URI that uniquely identifies the type of content this block represents. See the [Core Vocabularies](./core-vocabularies.md) for standard types. |
| `linkedObjectiveIds` | `array` of `string`s | No | An array of `id`s from `LearningObjective` objects that this specific block helps to fulfill. |
| `content` | `object` | **Yes** | The main data for the block. The structure of this object is determined by the `blockType` URI. |

---

### Example (Paragraph)

```json
{
  "id": "block-1-1-a",
  "blockType": "[https://xats.org/core/blocks/paragraph](https://xats.org/core/blocks/paragraph)",
  "content": {
    "runs": [
      { "type": "text", "text": "This is a simple paragraph." }
    ]
  }
}
```