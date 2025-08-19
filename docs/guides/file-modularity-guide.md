# File Modularity Guide

This guide explains how to use file modularity features in xats v0.3.0 to manage large textbooks across multiple files.

## Overview

Starting with xats v0.3.0, content can be split across multiple files using JSON references (`$ref`). This enables:

- Better collaboration with multiple authors
- Manageable file sizes for version control
- Content reusability across documents
- Improved performance for large textbooks

## Basic Usage

### Main Document Structure

The main document serves as the entry point and references external files:

```json
{
  "schemaVersion": "0.3.0",
  "bibliographicEntry": { /* ... */ },
  "subject": "Physics",
  "bodyMatter": {
    "contents": [
      {
        "$ref": "./chapters/chapter-01.json",
        "xats:refMetadata": {
          "title": "Introduction to Mechanics",
          "lastModified": "2025-08-18T23:33:00Z"
        }
      },
      {
        "$ref": "./chapters/chapter-02.json",
        "xats:refMetadata": {
          "title": "Forces and Motion",
          "lastModified": "2025-08-18T23:33:00Z"
        }
      }
    ]
  }
}
```

### Referenced File Structure

Each referenced file contains a complete xats object:

```json
{
  "$schema": "https://xats.org/schemas/0.3.0/xats.json#/definitions/Chapter",
  "type": "Chapter",
  "id": "chapter-01",
  "label": "Chapter 1",
  "title": {
    "runs": [{"type": "text", "text": "Introduction to Mechanics"}]
  },
  "contents": [
    {
      "$ref": "./sections/chapter-01-section-01.json"
    }
  ]
}
```

## File Organization

Recommended directory structure:

```
textbook/
├── index.json           # Main document
├── chapters/
│   ├── chapter-01.json
│   ├── chapter-02.json
│   └── ...
├── sections/
│   ├── chapter-01-section-01.json
│   ├── chapter-01-section-02.json
│   └── ...
├── resources/
│   ├── images/
│   ├── videos/
│   └── data/
└── metadata.json       # Document-wide metadata
```

## Security Considerations

- All file references are resolved relative to the document root
- Absolute paths and parent directory traversal (`../`) outside the document root are blocked
- Only `.json` files can be referenced by default
- Validation occurs across all referenced files

## Migration from Single File

To migrate an existing single-file document:

1. Identify logical boundaries (chapters, units)
2. Extract each section to its own file
3. Replace content with `$ref` and metadata
4. Validate the complete document structure

## Performance Tips

- Keep individual files under 1MB
- Use shallow nesting (max 3-4 levels)
- Consider lazy loading for web applications
- Cache resolved references when possible

## Tool Support

Tools supporting xats v0.3.0 file modularity:

- xats-validator: Validates multi-file documents
- xats-bundler: Combines multi-file into single file
- xats-server: Serves documents with reference resolution

## Future Features (v0.3.1+)

Planned enhancements include:

- Content registries with `xats://` URIs
- Advanced caching strategies
- Real-time collaborative editing
- Streaming large documents