# `BackMatter`

**Type:** `object`

---

### Description

The `BackMatter` object is a container for all the supplementary content that comes after the main instructional body.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sections` | `array` of `Section` objects | No | An array for any prose-based back matter, such as an `Appendix`, `Author's Note`, or a section containing a `bibliography` placeholder. |
| `glossary` | `array` of `KeyTerm` objects | No | A list of all key terms and their definitions. |
| `bibliography` | `array` of `CslDataItem` objects | No | The raw CSL-JSON data for all bibliographic entries cited in the work. |
| `extensions` | `object` | No | A container for non-standard, custom data. |