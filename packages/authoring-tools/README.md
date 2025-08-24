# @xats-org/authoring-tools - Enhanced Authoring Tools

The `@xats-org/authoring-tools` package provides simplified authoring capabilities for creating xats documents with markdown-like syntax, DOCX import/export, real-time validation, and preview generation. This package is designed to make xats document creation accessible to non-technical users while maintaining the full power and semantic richness of the xats standard.

## Features

- **Simplified Syntax**: Write content using familiar markdown-like syntax that automatically converts to valid xats documents
- **DOCX Import/Export**: Import existing Word documents and export xats documents to DOCX format
- **Real-time Validation**: Get immediate feedback on document validity with user-friendly error messages
- **Live Preview**: Generate HTML or Markdown previews of your content as you write
- **Smart Error Messages**: Context-aware error messages with suggestions for fixes
- **Multiple User Levels**: Adaptive interface that adjusts to beginner, intermediate, or advanced users
- **Auto-completion**: Intelligent suggestions for content structure and formatting

## Installation

```bash
npm install @xats-org/authoring-tools
```

## Quick Start

```typescript
import { XatsAuthoringTool } from '@xats-org/authoring-tools';

// Create an authoring tool instance
const authoringTool = new XatsAuthoringTool({
  realTimeValidation: true,
  enablePreview: true,
  previewFormat: 'html',
  userLevel: 'intermediate',
});

// Create a document from simplified syntax
const result = await authoringTool.createDocument({
  title: 'My Educational Content',
  author: 'Jane Educator',
  subject: 'Mathematics',
  content: `# Chapter 1: Introduction to Algebra

Algebra is the branch of mathematics that deals with symbols and the rules for manipulating those symbols.

## 1.1 Variables and Constants

A **variable** is a symbol that represents a number. Variables are usually represented by letters such as *x*, *y*, or *z*.

### Key Concepts

- Variables can represent unknown values
- Constants are fixed values
- Expressions combine variables and constants

> **Important**: Always define your variables clearly when solving equations.

### Example Problem

Solve for x in the equation: 2x + 5 = 11

\`\`\`
2x + 5 = 11
2x = 11 - 5
2x = 6
x = 3
\`\`\`

| Term | Definition |
|------|------------|
| Variable | A symbol representing an unknown value |
| Constant | A fixed numerical value |
| Expression | A combination of variables and constants |
`,
});

if (result.success) {
  console.log('Document created successfully!');
  console.log('Quality score:', result.validation?.qualityScore);
  
  // Generate a preview
  const preview = await authoringTool.generatePreview(result.document!);
  console.log('Preview generated:', preview.format);
} else {
  console.log('Errors found:');
  result.errors?.forEach(error => {
    console.log(`- ${error.message}`);
    error.suggestions.forEach(suggestion => {
      console.log(`  Suggestion: ${suggestion.description}`);
    });
  });
}
```

## Simplified Syntax Guide

The authoring tools use an extended markdown syntax that maps to xats document structures:

### Document Structure

```markdown
# Chapter 1: Introduction
This creates a new chapter with the title "Introduction"

## Section 1.1: Overview  
This creates a section within the chapter

### Subsection
This creates a heading within the section
```

### Text Formatting

```markdown
*italic text*           -> emphasis run
**bold text**           -> strong run
`inline code`           -> code run
~~strikethrough~~       -> strikethrough run
```

### Lists

```markdown
- Unordered list item
- Another item
  - Nested item

1. Ordered list item
2. Second item
   1. Nested ordered item
```

### Code Blocks

```markdown
\`\`\`javascript
const message = "Hello, World!";
console.log(message);
\`\`\`
```

### Tables

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Data A   | Data B   | Data C   |
```

### Blockquotes

```markdown
> This is a blockquote that will be converted
> to a xats blockquote content block.
> 
> It can span multiple lines.
```

### Images and Figures

```markdown
![Alt text for accessibility](path/to/image.jpg "Optional caption text")
```

## API Reference

### XatsAuthoringTool

The main class that coordinates all authoring functionality.

#### Constructor

```typescript
constructor(options?: AuthoringToolOptions)
```

##### AuthoringToolOptions

```typescript
interface AuthoringToolOptions {
  realTimeValidation?: boolean;    // Enable real-time validation (default: true)
  enablePreview?: boolean;         // Enable preview generation (default: true)
  previewFormat?: 'html' | 'markdown'; // Default preview format (default: 'html')
  autoSaveInterval?: number;       // Auto-save interval in ms (default: 5000)
  maxValidationErrors?: number;    // Max errors to display (default: 10)
  includeSuggestions?: boolean;    // Include fix suggestions (default: true)
  userLevel?: 'beginner' | 'intermediate' | 'advanced'; // User experience level
  language?: string;               // Language for messages (default: 'en')
}
```

#### Methods

##### createDocument(simplifiedDoc: SimplifiedDocument): Promise<AuthoringResult>

Creates a xats document from simplified markdown-like syntax.

```typescript
const result = await authoringTool.createDocument({
  title: 'My Document',
  author: 'Author Name', 
  subject: 'Subject Area',
  content: '# Chapter 1\n\nContent here...',
});
```

##### importFromDocx(docxContent: string): Promise<ImportResult>

Imports a document from DOCX format.

```typescript
const result = await authoringTool.importFromDocx(base64DocxContent);
```

##### importFromMarkdown(markdownContent: string): Promise<ImportResult>

Imports a document from Markdown format.

```typescript
const result = await authoringTool.importFromMarkdown(markdownText);
```

##### exportDocument(document: XatsDocument, format: 'docx' | 'markdown' | 'html'): Promise<ExportResult>

Exports a xats document to the specified format.

```typescript
const result = await authoringTool.exportDocument(document, 'docx');
```

##### generatePreview(document: XatsDocument, options?: PreviewOptions): Promise<PreviewResult>

Generates a preview of the document.

```typescript
const preview = await authoringTool.generatePreview(document, {
  format: 'html',
  includeStyles: true,
  theme: 'academic',
  accessibilityMode: true,
});
```

##### validateDocument(document: XatsDocument): Promise<ValidationFeedback>

Validates a document and provides user-friendly feedback.

```typescript
const validation = await authoringTool.validateDocument(document);
console.log('Valid:', validation.isValid);
console.log('Quality Score:', validation.qualityScore);
```

##### getAuthoringHelp(): Array<HelpItem>

Returns help documentation for authoring.

```typescript
const help = authoringTool.getAuthoringHelp();
help.forEach(item => {
  console.log(`${item.title}: ${item.description}`);
  item.examples.forEach(example => console.log(`  ${example}`));
});
```

### Error Handling and User Feedback

The authoring tools provide comprehensive error handling with user-friendly messages:

#### Error Severity Levels

- **error**: Critical issues that prevent document creation
- **warning**: Issues that should be addressed but don't prevent creation
- **info**: Informational messages about best practices
- **hint**: Suggestions for improvement

#### Smart Error Messages

Error messages adapt to the user's experience level:

**Beginner Level:**
```
You need to include a "title" in your document. This is a required field that cannot be left empty.
```

**Intermediate Level:**
```
Missing required field: "title". Please add this field to your document.
```

**Advanced Level:**
```
Required property "title" is missing from root.
```

#### Automatic Fix Suggestions

Many errors include automatic fix suggestions:

```typescript
{
  message: "Missing required field: schemaVersion",
  suggestions: [{
    description: "Add the required schemaVersion field",
    action: "add",
    to: '"schemaVersion": "0.5.0"',
    confidence: 0.9,
    automatic: true,  // Can be applied automatically
  }]
}
```

## Advanced Usage

### Custom Validation Rules

```typescript
import { XatsAuthoringTool } from '@xats-org/authoring-tools';

const authoringTool = new XatsAuthoringTool({
  userLevel: 'advanced',
  maxValidationErrors: 20,
  includeSuggestions: true,
});

// Add custom validation logic
const result = await authoringTool.createDocument(document);
if (!result.success) {
  // Handle custom validation
  result.errors?.forEach(error => {
    if (error.code === 'CUSTOM_RULE_VIOLATION') {
      // Handle custom rule violation
    }
  });
}
```

### Batch Processing

```typescript
const documents = [doc1, doc2, doc3];
const results = await Promise.all(
  documents.map(doc => authoringTool.createDocument(doc))
);

const successCount = results.filter(r => r.success).length;
console.log(`Successfully processed ${successCount}/${documents.length} documents`);
```

### Custom Preview Themes

```typescript
const preview = await authoringTool.generatePreview(document, {
  format: 'html',
  theme: 'academic',          // Built-in academic theme
  includeStyles: true,
  accessibilityMode: true,    // Enhanced accessibility features
});
```

### Real-time Collaboration

```typescript
// Set up real-time validation for collaborative editing
const authoringTool = new XatsAuthoringTool({
  realTimeValidation: true,
  autoSaveInterval: 1000,     // Validate every second
  maxValidationErrors: 5,     // Show top 5 errors only
});

// Handle validation results
const handleContentChange = async (content: string) => {
  const result = await authoringTool.createDocument({
    title: 'Collaborative Document',
    content,
  });
  
  if (result.validation) {
    updateValidationUI(result.validation);
  }
};
```

## Integration Examples

### Web Application Integration

```typescript
import { XatsAuthoringTool } from '@xats-org/authoring-tools';

class DocumentEditor {
  private authoringTool: XatsAuthoringTool;
  
  constructor() {
    this.authoringTool = new XatsAuthoringTool({
      realTimeValidation: true,
      previewFormat: 'html',
      userLevel: this.getUserLevel(),
    });
  }
  
  async handleContentChange(content: string) {
    const result = await this.authoringTool.createDocument({
      title: this.getDocumentTitle(),
      content,
    });
    
    // Update UI with validation feedback
    this.updateValidationPanel(result.validation);
    
    // Generate live preview
    if (result.success && result.document) {
      const preview = await this.authoringTool.generatePreview(result.document);
      this.updatePreviewPanel(preview.content);
    }
  }
  
  async exportToDocx() {
    const document = await this.getCurrentDocument();
    const result = await this.authoringTool.exportDocument(document, 'docx');
    
    if (result.success) {
      this.downloadFile(result.content!, 'document.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
  }
}
```

### Node.js Batch Processing

```typescript
import { XatsAuthoringTool } from '@xats-org/authoring-tools';
import { readFile, writeFile } from 'fs/promises';

async function convertMarkdownFiles(inputDir: string, outputDir: string) {
  const authoringTool = new XatsAuthoringTool({
    realTimeValidation: false, // Skip validation for batch processing
    userLevel: 'advanced',
  });
  
  const files = await readdir(inputDir);
  const markdownFiles = files.filter(f => f.endsWith('.md'));
  
  for (const file of markdownFiles) {
    const content = await readFile(join(inputDir, file), 'utf-8');
    const result = await authoringTool.importFromMarkdown(content);
    
    if (result.success && result.document) {
      const outputFile = file.replace('.md', '.json');
      await writeFile(
        join(outputDir, outputFile),
        JSON.stringify(result.document, null, 2)
      );
      console.log(`Converted ${file} -> ${outputFile}`);
    } else {
      console.error(`Failed to convert ${file}:`, result.errors);
    }
  }
}
```

## Performance Considerations

### Large Documents

For large documents, consider these optimizations:

```typescript
const authoringTool = new XatsAuthoringTool({
  realTimeValidation: false,    // Disable for large documents
  maxValidationErrors: 5,       // Limit error reporting
  previewFormat: 'markdown',    // Faster than HTML preview
});

// Validate manually when needed
const document = await authoringTool.createDocument(largeDocument);
if (document.success) {
  const validation = await authoringTool.validateDocument(document.document!);
  // Handle validation results
}
```

### Memory Management

```typescript
// Clear caches periodically for long-running applications
authoringTool.updateOptions({ realTimeValidation: false });
// Process documents
authoringTool.updateOptions({ realTimeValidation: true });
```

## Accessibility Features

The authoring tools include comprehensive accessibility support:

- **WCAG 2.1 AA compliant** HTML previews
- **Screen reader friendly** error messages
- **High contrast themes** for visual accessibility
- **Keyboard navigation** support in generated previews
- **Alt text validation** for images
- **Semantic markup** in all generated content

## Contributing

To contribute to the authoring tools:

1. Follow the xats contribution guidelines
2. Add comprehensive tests for new features
3. Update documentation for any API changes
4. Ensure accessibility compliance
5. Test with different user experience levels

## Migration from Legacy Tools

If you're migrating from previous xats authoring tools:

```typescript
// Old API (deprecated)
import { createXatsDocument } from '@xats-org/old-tools';

// New API
import { XatsAuthoringTool } from '@xats-org/authoring-tools';

const authoringTool = new XatsAuthoringTool();
const result = await authoringTool.createDocument(simplifiedDoc);
```

## Troubleshooting

### Common Issues

**Issue: "Schema version not found"**
```typescript
// Solution: Ensure you're using a supported schema version
const result = await authoringTool.createDocument({
  title: 'My Document',
  content: '# Content here',
  // schemaVersion is automatically set to latest
});
```

**Issue: "Preview generation failed"**
```typescript
// Solution: Check document validity first
const validation = await authoringTool.validateDocument(document);
if (validation.isValid) {
  const preview = await authoringTool.generatePreview(document);
}
```

**Issue: "Import from DOCX failed"**
```typescript
// Solution: Verify DOCX content is base64 encoded
const buffer = await readFile('document.docx');
const base64Content = buffer.toString('base64');
const result = await authoringTool.importFromDocx(base64Content);
```

## License

MIT - see LICENSE file for details.

## Related Packages

- [@xats-org/renderer-html](../renderer-html/): HTML rendering with WCAG compliance
- [@xats-org/renderer-docx](../renderer-docx/): Microsoft Word DOCX support
- [@xats-org/renderer-markdown](../renderer-markdown/): Markdown bidirectional conversion
- [@xats-org/validator](../validator/): Document validation engine
- [@xats-org/types](../types/): TypeScript type definitions