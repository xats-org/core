# `KeyTerm`

**Type:** `object`  
**Inherits from:** [`XatsObject`](./XatsObject.md)

---

### Description

A `KeyTerm` object defines a piece of vocabulary. It is typically used in a `Chapter`'s `keyTerms` list or in the `backMatter` `glossary`.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `term` | `string` | **Yes** | The word or phrase being defined. |
| `definition` | `SemanticText` | **Yes** | The definition of the term. |