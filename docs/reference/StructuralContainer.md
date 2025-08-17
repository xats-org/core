# `StructuralContainer`

**Type:** `object`  
**Inherits from:** [`XatsObject`](./XatsObject.md)

---

### Description

A base definition for all primary structural components of the textbook body: `Unit`, `Chapter`, and `Section`. It provides the common properties needed for labeling, titling, and creating adaptive pathways.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | No | The display label for this container (e.g., 'III', 'A.1', 'Part 1'). This replaces the old numeric-only identifiers. |
| `title` | `string` | **Yes** | The main title of the container (e.g., "Core Concepts of Photosynthesis"). |
| `linkedObjectiveIds` | `array` of `string`s | No | An array of `id`s from `LearningObjective` objects that this container helps to fulfill. |
| `pathways` | `array` of `Pathway` objects | No | A set of conditional rules for non-linear navigation that are triggered at the end of this container. |

---

### Inherited By

- [`Unit`](./Unit.md)
- [`Chapter`](./Chapter.md)
- [`Section`](./Section.md)