# `LearningObjective`

**Type:** `object`  
**Inherits from:** [`XatsObject`](./XatsObject.md)

---

### Description

A `LearningObjective` describes a specific, measurable, and observable skill a student must master to achieve a `LearningOutcome`. It represents the "How" of the learning experience. Objectives can be nested.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `linkedOutcomeId` | `string` | No | The `id` of the parent `LearningOutcome` this objective supports. |
| `subItems` | `array` of `LearningObjective` objects | No | An array of more granular sub-objectives. |