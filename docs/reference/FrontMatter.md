# `FrontMatter`

**Type:** `object`

---

### Description

The `FrontMatter` object is a container for all the preliminary content of a textbook that comes before the main instructional body.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sections` | `array` of `Section` objects | No | An array for any prose-based front matter, such as a `Preface`, `Dedication`, or a section containing a `tableOfContents` placeholder. |
| `extensions` | `object` | No | A container for non-standard, custom data. |