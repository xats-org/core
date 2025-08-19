# `Resource`

**Type:** `object`  
**Inherits from:** [`XatsObject`](./XatsObject.md)

---

### Description

A `Resource` is an entry in the centralized `resources` repository. It defines a shared asset (like an image or video) that can be referenced from multiple places within the document.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` (URI) | **Yes** | A URI identifying the type of resource. See [Core Vocabularies](../specs/core-vocabularies.md). |
| `url` | `string` (URI) | **Yes** | The URL where the resource file can be found. |
| `altText` | `string` | No | For `image` types, a textual description for accessibility (WCAG). |