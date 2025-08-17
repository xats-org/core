# xats Quickstart Tutorial

**Version:** 1.0 (for xats schema v0.1.0)
**Audience:** First-time authors and developers.

---

## 1. Introduction

This tutorial will guide you through the process of creating your first valid **xats** document from scratch. We will build a simple, single-chapter document that demonstrates the core concepts of the schema, including content blocks, semantic text, and referencing.

By the end of this guide, you will have a complete `xats.json` file and a practical understanding of how the different parts of the schema work together.

---

## 2. Step 1: The Document Shell

Every `xats` document starts with a root object that defines its version and core metadata. Let's create a file named `my-book.xats.json` and add the essential top-level properties.

The `bibliographicEntry` uses the CSL-JSON standard to describe the book itself.

```json
{
  "schemaVersion": "0.1.0",
  "bibliographicEntry": {
    "id": "my-first-xats-book",
    "type": "book",
    "title": "A Quickstart Guide to xats",
    "author": [
      {
        "given": "Your",
        "family": "Name"
      }
    ],
    "issued": {
      "date-parts": [
        [2025]
      ]
    }
  },
  "subject": "Educational Technology",
  "bodyMatter": {
    "contents": []
  }
}