# Content Transformation Extension

The Content Transformation extension provides tools for converting content between various formats and xats documents. It includes importers, exporters, and migration utilities for seamless content workflow integration.

## Overview

- **Extension ID**: `https://xats.org/extensions/content-transformation/schema.json`
- **Version**: 1.0.0
- **Compatibility**: xats v0.2.0+

## Features

### Import Formats
- **Markdown**: CommonMark, GitHub Flavored Markdown, Academic Markdown
- **HTML**: Structured HTML documents, web pages, EPUB content
- **Microsoft Word**: .docx documents with style preservation
- **LaTeX**: Academic papers, textbooks, mathematical content
- **Plain Text**: Simple text files with structure detection
- **CSV**: Tabular data conversion to xats tables
- **JSON**: Structured data import with custom mapping
- **XML**: DocBook, TEI, and custom XML formats
- **EPUB**: E-book content extraction and conversion
- **PDF**: Text extraction with limited formatting (OCR support)

### Export Formats
- **Markdown**: Standard markdown with xats extensions
- **HTML**: Static websites, single-page documents
- **EPUB**: E-book generation with proper structure
- **PDF**: Formatted documents via LaTeX or HTML
- **Microsoft Word**: .docx generation with styles
- **LaTeX**: Academic papers and textbooks
- **SCORM**: E-learning packages for LMS deployment
- **Common Cartridge**: IMS standard learning content packages
- **JSON**: Structured data export for APIs

### Migration Tools
- **Schema Version Migration**: Upgrade xats documents between versions
- **Content Validation**: Verify document integrity after transformation
- **Batch Processing**: Transform multiple documents simultaneously
- **Rollback Support**: Undo transformations when needed

## Usage Examples

### Basic Markdown Import

```json
{
  "extensions": {
    "importConfiguration": {
      "importId": "markdown-basic",
      "name": "Basic Markdown Import",
      "sourceFormat": "markdown",
      "documentStructure": {
        "detectStructure": true,
        "titleExtraction": {
          "method": "heading",
          "pattern": "^#\\s+(.+)$",
          "fallback": "Untitled Document"
        },
        "chapterDetection": {
          "headingLevel": 2,
          "keywords": ["chapter", "part", "section"]
        }
      },
      "transformationRules": [
        {
          "ruleId": "heading-to-title",
          "sourceFormat": "markdown",
          "targetBlockType": "https://xats.org/vocabularies/blocks/heading",
          "pattern": "^(#{1,6})\\s+(.+)$",
          "transformation": {
            "extractText": {
              "method": "regex",
              "selector": "(?<=^#{1,6}\\s)(.+)$",
              "flags": ["g", "m"]
            },
            "structureMapping": {
              "headingLevels": {
                "h1": "unit",
                "h2": "chapter", 
                "h3": "section"
              }
            }
          }
        },
        {
          "ruleId": "paragraph-to-paragraph",
          "sourceFormat": "markdown",
          "targetBlockType": "https://xats.org/vocabularies/blocks/paragraph",
          "pattern": "^(?!#|\\*|\\-|\\d+\\.)(.+)$",
          "transformation": {
            "preserveFormatting": {
              "emphasis": true,
              "strong": true,
              "links": true,
              "code": true
            }
          }
        }
      ]
    }
  }
}
```

### Advanced Academic Paper Import

```json
{
  "extensions": {
    "importConfiguration": {
      "importId": "academic-paper",
      "name": "Academic Paper Import",
      "sourceFormat": "markdown",
      "metadataExtraction": {
        "bibliographicData": {
          "title": "^title:\\s*(.+)$",
          "authors": "^authors?:\\s*(.+)$",
          "date": "^date:\\s*(.+)$",
          "publisher": "^publisher:\\s*(.+)$"
        },
        "subject": {
          "method": "keyword-based",
          "keywords": [
            {
              "subject": "Mathematics",
              "terms": ["calculus", "algebra", "geometry", "statistics", "probability"]
            },
            {
              "subject": "Physics", 
              "terms": ["mechanics", "thermodynamics", "quantum", "relativity", "electromagnetism"]
            },
            {
              "subject": "Biology",
              "terms": ["cell", "genetics", "evolution", "ecology", "biochemistry"]
            }
          ],
          "fallback": "General Science"
        }
      },
      "contentProcessing": {
        "imageHandling": {
          "extractImages": true,
          "optimizeImages": true,
          "maxWidth": 1200,
          "format": "webp",
          "altTextGeneration": true
        },
        "textCleaning": {
          "normalizeQuotes": true,
          "fixEncoding": true,
          "removeComments": false
        }
      },
      "transformationRules": [
        {
          "ruleId": "math-block",
          "sourceFormat": "markdown",
          "targetBlockType": "https://xats.org/vocabularies/blocks/mathBlock",
          "pattern": "^\\$\\$([\\s\\S]*?)\\$\\$$",
          "transformation": {
            "extractText": {
              "method": "regex",
              "selector": "(?<=^\\$\\$)([\\s\\S]*?)(?=\\$\\$$)",
              "flags": ["gm"]
            },
            "preserveFormatting": {
              "math": true
            }
          }
        },
        {
          "ruleId": "citation",
          "sourceFormat": "markdown",
          "targetBlockType": "https://xats.org/vocabularies/blocks/paragraph",
          "pattern": "\\[@([^\\]]+)\\]",
          "transformation": {
            "extractText": {
              "method": "regex",
              "selector": "(?<=\\[@)([^\\]]+)(?=\\])",
              "flags": ["g"]
            },
            "preserveFormatting": {
              "citations": true
            }
          },
          "postProcessing": [
            {
              "step": "extract-citations",
              "config": {
                "format": "bibtex",
                "generateCSL": true
              }
            }
          ]
        }
      ],
      "validation": {
        "strictMode": false,
        "schemaValidation": true,
        "requiredFields": ["title", "author", "subject"]
      }
    }
  }
}
```

### HTML Export Configuration

```json
{
  "extensions": {
    "exportConfiguration": {
      "exportId": "html-website",
      "name": "HTML Website Export",
      "targetFormat": "html",
      "outputStructure": {
        "singleFile": false,
        "preserveHierarchy": true,
        "includeMetadata": true,
        "fileNaming": {
          "pattern": "{container-type}_{label}_{title}",
          "sanitization": true,
          "maxLength": 50
        }
      },
      "contentMapping": {
        "blockTypeMapping": {
          "https://xats.org/vocabularies/blocks/paragraph": {
            "element": "p",
            "attributes": {
              "class": "xats-paragraph"
            }
          },
          "https://xats.org/vocabularies/blocks/heading": {
            "element": "h{level}",
            "attributes": {
              "class": "xats-heading xats-heading-{level}"
            }
          },
          "https://xats.org/vocabularies/blocks/mathBlock": {
            "element": "div",
            "attributes": {
              "class": "math-block"
            },
            "template": "<div class=\"math-block\">\\[{content}\\]</div>"
          }
        },
        "semanticTextMapping": {
          "preserveRunTypes": true,
          "fallbackFormatting": {
            "emphasis": "<em>{content}</em>",
            "strong": "<strong>{content}</strong>",
            "code": "<code>{content}</code>"
          }
        }
      },
      "resourceHandling": {
        "embedResources": false,
        "resourceDirectory": "assets",
        "optimizeImages": true,
        "copyResources": true
      },
      "templates": {
        "documentTemplate": "<!DOCTYPE html>\\n<html>\\n<head>\\n<title>{title}</title>\\n<meta charset=\"utf-8\">\\n</head>\\n<body>\\n{content}\\n</body>\\n</html>",
        "chapterTemplate": "<section class=\"chapter\" id=\"{id}\">\\n<h2>{title}</h2>\\n{content}\\n</section>",
        "sectionTemplate": "<section class=\"section\" id=\"{id}\">\\n<h3>{title}</h3>\\n{content}\\n</section>"
      }
    }
  }
}
```

### Schema Version Migration

```json
{
  "extensions": {
    "migrationRule": {
      "ruleId": "v0.1.0-to-v0.2.0",
      "sourceVersion": "0.1.0",
      "targetVersion": "0.2.0",
      "description": "Migrate from v0.1.0 to v0.2.0 adding assessment support",
      "transformations": [
        {
          "path": "$.schemaVersion",
          "operation": "transform",
          "from": "0.1.0",
          "to": "0.2.0"
        },
        {
          "path": "$..blockType",
          "operation": "transform",
          "conditions": [
            {
              "property": "blockType",
              "operator": "equals",
              "value": "https://xats.org/vocabularies/blocks/quiz"
            }
          ],
          "from": "https://xats.org/vocabularies/blocks/quiz",
          "to": "https://xats.org/vocabularies/blocks/multipleChoice"
        },
        {
          "path": "$..assessmentFramework",
          "operation": "add",
          "to": {
            "enabled": true,
            "defaultGradingScale": "percentage"
          }
        }
      ],
      "rollback": {
        "supported": true,
        "instructions": "Reverse transformation by changing schema version back to 0.1.0 and removing assessment-specific properties"
      }
    }
  }
}
```

## Implementation Examples

### TypeScript Transformer

```typescript
// content-transformer.ts
import { marked } from 'marked';
import { JSDOM } from 'jsdom';
import { XatsDocument, ContentBlock, SemanticText } from './types';

export interface TransformationOptions {
  sourceFormat: string;
  targetFormat?: string;
  rules?: TransformationRule[];
  validation?: boolean;
}

export class ContentTransformer {
  private rules: Map<string, TransformationRule[]> = new Map();
  
  constructor() {
    this.registerDefaultRules();
  }

  registerRule(rule: TransformationRule): void {
    const formatRules = this.rules.get(rule.sourceFormat) || [];
    formatRules.push(rule);
    formatRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    this.rules.set(rule.sourceFormat, formatRules);
  }

  async transformToXats(
    content: string, 
    options: TransformationOptions
  ): Promise<XatsDocument> {
    try {
      switch (options.sourceFormat.toLowerCase()) {
        case 'markdown':
          return this.transformMarkdownToXats(content, options);
        case 'html':
          return this.transformHtmlToXats(content, options);
        case 'docx':
          return this.transformDocxToXats(content, options);
        default:
          throw new Error(`Unsupported source format: ${options.sourceFormat}`);
      }
    } catch (error) {
      console.error('Transformation failed:', error);
      throw new Error(`Failed to transform ${options.sourceFormat} to xats: ${error.message}`);
    }
  }

  private async transformMarkdownToXats(
    markdown: string, 
    options: TransformationOptions
  ): Promise<XatsDocument> {
    // Parse frontmatter
    const { metadata, content } = this.parseFrontmatter(markdown);
    
    // Configure marked with custom renderer
    const renderer = new marked.Renderer();
    this.configureMarkdownRenderer(renderer);
    
    // Parse markdown to AST
    const tokens = marked.lexer(content);
    
    // Build xats structure
    const document: Partial<XatsDocument> = {
      schemaVersion: '0.3.0',
      bibliographicEntry: this.extractBibliographicData(metadata),
      subject: metadata.subject || this.inferSubject(content),
      bodyMatter: {
        contents: []
      }
    };

    // Transform tokens to xats content blocks
    const containers = this.buildContainerHierarchy(tokens);
    document.bodyMatter!.contents = containers;

    // Apply transformation rules
    if (options.rules) {
      this.applyTransformationRules(document, options.rules);
    }

    // Validate if requested
    if (options.validation) {
      await this.validateDocument(document as XatsDocument);
    }

    return document as XatsDocument;
  }

  private parseFrontmatter(markdown: string): { metadata: any, content: string } {
    const frontmatterRegex = /^---\s*\n(.*?)\n---\s*\n(.*)$/s;
    const match = markdown.match(frontmatterRegex);
    
    if (match) {
      try {
        const metadata = this.parseYaml(match[1]);
        return { metadata, content: match[2] };
      } catch (error) {
        console.warn('Failed to parse frontmatter:', error);
      }
    }
    
    return { metadata: {}, content: markdown };
  }

  private buildContainerHierarchy(tokens: marked.Token[]): any[] {
    const containers = [];
    let currentUnit: any = null;
    let currentChapter: any = null;
    let currentSection: any = null;
    
    for (const token of tokens) {
      switch (token.type) {
        case 'heading':
          const heading = token as marked.Tokens.Heading;
          const container = this.createContainerFromHeading(heading);
          
          if (heading.depth === 1) {
            currentUnit = container;
            currentChapter = null;
            currentSection = null;
            containers.push(currentUnit);
          } else if (heading.depth === 2) {
            currentChapter = container;
            currentSection = null;
            if (currentUnit) {
              currentUnit.contents = currentUnit.contents || [];
              currentUnit.contents.push(currentChapter);
            } else {
              containers.push(currentChapter);
            }
          } else if (heading.depth === 3) {
            currentSection = container;
            const parent = currentChapter || currentUnit;
            if (parent) {
              parent.contents = parent.contents || [];
              parent.contents.push(currentSection);
            } else {
              containers.push(currentSection);
            }
          }
          break;
          
        case 'paragraph':
        case 'blockquote':
        case 'list':
        case 'table':
          const block = this.createBlockFromToken(token);
          const targetContainer = currentSection || currentChapter || currentUnit;
          
          if (targetContainer) {
            targetContainer.contents = targetContainer.contents || [];
            targetContainer.contents.push(block);
          } else {
            // Create default section if no structure exists
            if (containers.length === 0) {
              const defaultSection = this.createDefaultSection();
              containers.push(defaultSection);
              currentSection = defaultSection;
            }
            currentSection.contents = currentSection.contents || [];
            currentSection.contents.push(block);
          }
          break;
      }
    }
    
    return containers;
  }

  private createContainerFromHeading(heading: marked.Tokens.Heading): any {
    const level = heading.depth;
    const title = this.parseInlineTokensToSemanticText(heading.tokens);
    
    let containerType: string;
    if (level === 1) containerType = 'unit';
    else if (level === 2) containerType = 'chapter';
    else containerType = 'section';
    
    return {
      id: this.generateId(title.runs[0]?.content || 'container'),
      containerType,
      title,
      contents: []
    };
  }

  private createBlockFromToken(token: marked.Token): ContentBlock {
    switch (token.type) {
      case 'paragraph':
        const paragraph = token as marked.Tokens.Paragraph;
        return {
          id: this.generateId('paragraph'),
          blockType: 'https://xats.org/vocabularies/blocks/paragraph',
          content: {
            text: this.parseInlineTokensToSemanticText(paragraph.tokens)
          }
        };
        
      case 'blockquote':
        const blockquote = token as marked.Tokens.Blockquote;
        return {
          id: this.generateId('blockquote'),
          blockType: 'https://xats.org/vocabularies/blocks/blockquote',
          content: {
            text: this.parseTokensToSemanticText(blockquote.tokens)
          }
        };
        
      case 'list':
        const list = token as marked.Tokens.List;
        return {
          id: this.generateId('list'),
          blockType: 'https://xats.org/vocabularies/blocks/list',
          content: {
            listType: list.ordered ? 'ordered' : 'unordered',
            items: list.items.map(item => ({
              content: this.parseTokensToSemanticText(item.tokens)
            }))
          }
        };
        
      case 'table':
        const table = token as marked.Tokens.Table;
        return {
          id: this.generateId('table'),
          blockType: 'https://xats.org/vocabularies/blocks/table',
          content: {
            headers: table.header.map(cell => ({
              content: this.parseInlineTokensToSemanticText(cell.tokens)
            })),
            rows: table.rows.map(row => ({
              cells: row.map(cell => ({
                content: this.parseInlineTokensToSemanticText(cell.tokens)
              }))
            }))
          }
        };
        
      default:
        return {
          id: this.generateId('unknown'),
          blockType: 'https://xats.org/vocabularies/blocks/paragraph',
          content: {
            text: { runs: [{ type: 'text', content: 'Unknown content type' }] }
          }
        };
    }
  }

  private parseInlineTokensToSemanticText(tokens: marked.Token[]): SemanticText {
    const runs: any[] = [];
    
    for (const token of tokens) {
      switch (token.type) {
        case 'text':
          const textToken = token as marked.Tokens.Text;
          runs.push({
            type: 'text',
            content: textToken.text
          });
          break;
          
        case 'em':
          const emToken = token as marked.Tokens.Em;
          runs.push({
            type: 'emphasis',
            content: this.parseInlineTokensToSemanticText(emToken.tokens).runs
          });
          break;
          
        case 'strong':
          const strongToken = token as marked.Tokens.Strong;
          runs.push({
            type: 'strong',
            content: this.parseInlineTokensToSemanticText(strongToken.tokens).runs
          });
          break;
          
        case 'link':
          const linkToken = token as marked.Tokens.Link;
          runs.push({
            type: 'reference',
            referenceId: this.generateId('link'),
            content: this.parseInlineTokensToSemanticText(linkToken.tokens).runs
          });
          break;
          
        case 'code':
          const codeToken = token as marked.Tokens.Code;
          runs.push({
            type: 'code',
            content: codeToken.text
          });
          break;
      }
    }
    
    return { runs };
  }

  private parseTokensToSemanticText(tokens: marked.Token[]): SemanticText {
    // Handle mixed block and inline tokens
    const textContent = tokens.map(token => {
      if ('text' in token) return token.text;
      if ('raw' in token) return token.raw;
      return '';
    }).join(' ');
    
    return {
      runs: [
        { type: 'text', content: textContent }
      ]
    };
  }

  private generateId(base: string): string {
    return base.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      + '-' + Math.random().toString(36).substr(2, 9);
  }

  private extractBibliographicData(metadata: any): any {
    return {
      id: metadata.id || this.generateId('document'),
      type: 'book',
      title: metadata.title || 'Untitled Document',
      author: metadata.author ? 
        (Array.isArray(metadata.author) ? 
          metadata.author.map(name => ({ literal: name })) :
          [{ literal: metadata.author }]
        ) : [],
      issued: metadata.date ? 
        { 'date-parts': [[new Date(metadata.date).getFullYear()]] } :
        undefined,
      publisher: metadata.publisher,
      ISBN: metadata.isbn
    };
  }

  private inferSubject(content: string): string {
    const keywords = {
      'Mathematics': ['equation', 'theorem', 'proof', 'calculus', 'algebra'],
      'Physics': ['energy', 'momentum', 'force', 'quantum', 'relativity'],
      'Chemistry': ['molecule', 'atom', 'reaction', 'compound', 'element'],
      'Biology': ['cell', 'gene', 'evolution', 'organism', 'DNA'],
      'Computer Science': ['algorithm', 'program', 'code', 'software', 'data']
    };
    
    const wordCounts = Object.entries(keywords).map(([subject, words]) => {
      const count = words.reduce((total, word) => {
        const regex = new RegExp(word, 'gi');
        return total + (content.match(regex) || []).length;
      }, 0);
      return { subject, count };
    });
    
    const topSubject = wordCounts.reduce((max, current) => 
      current.count > max.count ? current : max
    );
    
    return topSubject.count > 0 ? topSubject.subject : 'General';
  }

  // Additional methods for validation, rule application, etc...
  private async validateDocument(document: XatsDocument): Promise<void> {
    // Schema validation logic
    console.log('Validating document structure...');
  }

  private registerDefaultRules(): void {
    // Register common transformation rules
    console.log('Registering default transformation rules...');
  }
}

// Usage example
export async function transformMarkdownFile(filePath: string): Promise<XatsDocument> {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filePath, 'utf-8');
  
  const transformer = new ContentTransformer();
  return transformer.transformToXats(content, {
    sourceFormat: 'markdown',
    validation: true
  });
}
```

### CLI Tool Example

```typescript
// cli-transformer.ts
import { Command } from 'commander';
import { ContentTransformer } from './content-transformer';
import * as fs from 'fs/promises';
import * as path from 'path';

const program = new Command();

program
  .name('xats-transform')
  .description('Transform content to and from xats format')
  .version('1.0.0');

program
  .command('import')
  .description('Import content to xats format')
  .argument('<input>', 'Input file path')
  .option('-f, --format <format>', 'Source format', 'markdown')
  .option('-o, --output <output>', 'Output file path')
  .option('-c, --config <config>', 'Configuration file')
  .option('--validate', 'Validate output against schema')
  .action(async (input, options) => {
    try {
      const content = await fs.readFile(input, 'utf-8');
      const transformer = new ContentTransformer();
      
      // Load custom configuration if provided
      if (options.config) {
        const config = JSON.parse(await fs.readFile(options.config, 'utf-8'));
        // Apply configuration...
      }
      
      const result = await transformer.transformToXats(content, {
        sourceFormat: options.format,
        validation: options.validate
      });
      
      const outputPath = options.output || 
        path.join(path.dirname(input), path.parse(input).name + '.xats.json');
      
      await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
      console.log(`Successfully converted ${input} to ${outputPath}`);
      
    } catch (error) {
      console.error('Transformation failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('export')
  .description('Export xats content to other formats')
  .argument('<input>', 'Input xats file path')
  .option('-f, --format <format>', 'Target format', 'html')
  .option('-o, --output <output>', 'Output file or directory')
  .option('-c, --config <config>', 'Configuration file')
  .action(async (input, options) => {
    try {
      const content = await fs.readFile(input, 'utf-8');
      const document = JSON.parse(content);
      
      // Export logic would go here...
      console.log(`Exporting to ${options.format}...`);
      
    } catch (error) {
      console.error('Export failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('migrate')
  .description('Migrate xats document between schema versions')
  .argument('<input>', 'Input xats file path')
  .option('-t, --target <version>', 'Target schema version')
  .option('-o, --output <output>', 'Output file path')
  .option('--dry-run', 'Show changes without applying them')
  .action(async (input, options) => {
    try {
      const content = await fs.readFile(input, 'utf-8');
      const document = JSON.parse(content);
      
      console.log(`Migrating from ${document.schemaVersion} to ${options.target}...`);
      
      // Migration logic would go here...
      
    } catch (error) {
      console.error('Migration failed:', error.message);
      process.exit(1);
    }
  });

program.parse();
```

## Best Practices

### Content Import
- Always validate source content structure before transformation
- Preserve original formatting where semantically meaningful
- Generate meaningful IDs for all xats objects
- Handle edge cases gracefully with fallback options
- Log transformation decisions for debugging

### Content Export
- Maintain semantic meaning in target format
- Optimize resources for target medium (web vs print)
- Include metadata preservation options
- Provide template customization capabilities
- Test output across different viewers/browsers

### Schema Migration
- Always backup original documents before migration
- Test migrations on sample documents first
- Provide clear migration logs and error messages
- Support rollback where technically feasible
- Document breaking changes and migration paths

### Error Handling
- Provide detailed error messages with context
- Graceful degradation for unsupported features
- Validation at multiple stages of transformation
- Clear logging for debugging transformation issues

## Testing

Test all transformation scenarios:

```typescript
// transformation.test.ts
import { ContentTransformer } from '../src/content-transformer';

describe('Content Transformation', () => {
  let transformer: ContentTransformer;

  beforeEach(() => {
    transformer = new ContentTransformer();
  });

  test('should convert markdown headings to xats containers', async () => {
    const markdown = `
# Unit 1: Introduction
## Chapter 1: Getting Started
### Section 1.1: Overview
This is a paragraph.
    `;
    
    const result = await transformer.transformToXats(markdown, {
      sourceFormat: 'markdown'
    });
    
    expect(result.bodyMatter.contents).toHaveLength(1);
    expect(result.bodyMatter.contents[0].containerType).toBe('unit');
    expect(result.bodyMatter.contents[0].contents[0].containerType).toBe('chapter');
  });

  test('should preserve markdown formatting in semantic text', async () => {
    const markdown = 'This has **bold** and *italic* text.';
    
    const result = await transformer.transformToXats(markdown, {
      sourceFormat: 'markdown'
    });
    
    const paragraph = result.bodyMatter.contents[0].contents[0];
    const runs = paragraph.content.text.runs;
    
    expect(runs).toContainEqual(
      expect.objectContaining({ type: 'strong', content: 'bold' })
    );
    expect(runs).toContainEqual(
      expect.objectContaining({ type: 'emphasis', content: 'italic' })
    );
  });

  test('should handle math blocks correctly', async () => {
    const markdown = '$$E = mc^2$$';
    
    const result = await transformer.transformToXats(markdown, {
      sourceFormat: 'markdown'
    });
    
    const mathBlock = result.bodyMatter.contents[0].contents[0];
    expect(mathBlock.blockType).toBe('https://xats.org/vocabularies/blocks/mathBlock');
    expect(mathBlock.content.formula).toBe('E = mc^2');
  });
});
```

## Contributing

To extend the transformation system:

1. **Add New Format Support**: Implement transformer classes for new formats
2. **Create Transformation Rules**: Define rules for specific content patterns  
3. **Add Export Templates**: Create templates for new output formats
4. **Extend Migration Rules**: Add version migration capabilities
5. **Improve Validation**: Enhance content validation and error checking

## Support

For issues and questions:
- GitHub Issues: [Report bugs or request features](https://github.com/xats-org/core/issues)
- Documentation: [Extension Development Guide](../../docs/guides/extension-guide.md)
- Community: [xats Discussions](https://github.com/xats-org/core/discussions)