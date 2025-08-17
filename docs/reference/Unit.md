# `Unit`

**Type:** `object`  
**Inherits from:** [`StructuralContainer`](./StructuralContainer.md)

---

### Description

A `Unit` is a high-level organizational container used to group related `Chapter`s thematically (e.g., "Unit 1: Classical Mechanics"). Units can be nested to create complex hierarchies.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `introduction` | `SemanticText` | No | An introductory text for the unit. |
| `contents` | `array` | **Yes** | An array containing either `Unit` objects (for nesting) or `Chapter` objects. |