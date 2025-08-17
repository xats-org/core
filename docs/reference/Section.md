# `Section`

**Type:** `object`  
**Inherits from:** [`StructuralContainer`](./StructuralContainer.md)

---

### Description

The `Section` is the primary content-delivery unit in a **xats** document. Its job is to hold the array of `ContentBlock`s that contain the actual instructional material.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `content` | `array` of `ContentBlock` objects | **Yes** | The sequence of content blocks that make up the section. |