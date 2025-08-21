# Multi-File Textbook Example

This example demonstrates the file modularity feature introduced in xats v0.3.0.

## Structure

```
multi-file-textbook/
├── index.json                          # Main entry point
├── chapters/
│   ├── chapter-01-mechanics.json       # Chapter with file references to sections
│   └── chapter-02-thermodynamics.json  # Another chapter (placeholder)
└── sections/
    ├── ch01-section-01-newtons-laws.json  # Section content
    └── ch01-section-02-forces.json        # Another section (placeholder)
```

## How It Works

1. **Main Document** (`index.json`): Contains the root structure and references to chapter files
2. **Chapter Files**: Each chapter is in its own file and can reference section files
3. **Section Files**: Individual sections with actual content blocks

## Benefits

- **Collaboration**: Multiple authors can work on different chapters simultaneously
- **Version Control**: Smaller files mean cleaner diffs and easier merges
- **Performance**: Tools can load only needed parts of the document
- **Reusability**: Sections can potentially be shared across different textbooks

## File References

File references use the JSON Schema `$ref` property with xats-specific metadata:

```json
{
  "$ref": "./chapters/chapter-01-mechanics.json",
  "xats:refMetadata": {
    "title": "Classical Mechanics",
    "authors": ["Jane Smith"],
    "lastModified": "2025-08-18T23:33:00Z"
  }
}
```

## Security

- All paths are relative to the document root
- Parent directory traversal (`../`) outside the root is blocked
- Only `.json` files can be referenced

## Validation

Use xats validators that support v0.3.0 to validate the complete document structure across all files.