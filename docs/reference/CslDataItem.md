# `CslDataItem`

**Type:** `object`

---

### Description

A `CslDataItem` is a single bibliographic entry that **must** conform to the official **Citation Style Language (CSL-JSON)** standard. The `id` property is required by **xats** to enable in-line linking via `CitationRun`.

---

### Schema

This object's structure is defined externally. It must validate against:
1.  The official CSL-JSON schema: `https://raw.githubusercontent.com/citation-style-language/schema/master/csl-data.json`
2.  The local **xats** requirement for a unique `id` property.