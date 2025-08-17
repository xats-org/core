# `Chapter`

**Type:** `object`  
**Inherits from:** [`StructuralContainer`](./StructuralContainer.md)

---

### Description

The `Chapter` is the central pedagogical unit in a **xats** document. Its primary role is to define a set of `learningObjectives` and to contain the `Section`s that teach them.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `introduction` | `SemanticText` | No | An introductory text for the chapter. |
| `learningObjectives` | `array` of `LearningObjective` objects | No | The set of learning goals for this chapter. While optional, this is a key feature for AI-driven tools. |
| `sections` | `array` of `Section` objects | **Yes** | The instructional sections that make up the chapter. |
| `summary` | `SemanticText` | No | A concluding summary for the chapter. |
| `keyTerms` | `array` of `KeyTerm` objects | No | A list of important vocabulary introduced in the chapter. |