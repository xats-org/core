# xats Extension Guide

**Version:** 1.0 (for xats schema v0.1.0)
**Audience:** Developers, Publishers, and Community Contributors

---

## 1. Philosophy of Extensibility

The **xats** standard was designed with the core principle that it is impossible to predict every future need. The schema is therefore built to be extended. This guide provides the best practices for creating your own vocabularies and custom data fields in a way that ensures compatibility and interoperability within the **xats** ecosystem.

There are two primary mechanisms for extending the standard:
1.  **Creating Custom Vocabularies** using URIs for open lists.
2.  **Adding Custom Data** using the `extensions` property.

---

## 2. Creating Custom Vocabularies (URIs)

This is the preferred method for creating entirely new types of content or metadata that have a shared, public meaning. It applies to fields like `blockType`, `resourceType`, `pathwayType`, and `hintType`.

### Step 1: Define Your Vocabulary

Create a stable, public web page that serves as the official definition for your new URI. This page is critical for both human and machine understanding.

**Best Practices:**
- **Use a domain you control.** For example, a Chemistry Education Consortium might use `https://chem-ed.org/xats/vocab/`.
- **Be specific in your URI path.** `.../blocks/moleculeViewer` is better than `.../myBlock`.
- **The definition page should clearly state:**
    - The full URI.
    - A human-readable description of what the vocabulary means.
    - For `blockType`s, a formal JSON Schema definition for its `content` object. This is crucial for tooling.

### Step 2: Use Your URI

Once defined, you can use your full URI as the value for the appropriate property in your `xats` document.

**Example:**
```json
{
  "id": "block-ch2-caffeine-model",
  "blockType": "[https://chem-ed.org/xats/vocab/moleculeViewer](https://chem-ed.org/xats/vocab/moleculeViewer)",
  "content": {
    "chemicalIdentifier": "RYYVLZVUVIJVGH-UHFFFAOYSA-N",
    "standard": "InChIKey"
  }
}