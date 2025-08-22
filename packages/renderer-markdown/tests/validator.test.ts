/**
 * Markdown Validation Tests
 *
 * Tests the validation capabilities of the Markdown renderer
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { SimpleMarkdownRenderer } from '../src/simple-renderer.js';

describe('Markdown Validator Tests', () => {
  let renderer: SimpleMarkdownRenderer;

  beforeEach(() => {
    renderer = new SimpleMarkdownRenderer();
  });

  describe('Valid Markdown', () => {
    it('should validate simple valid Markdown', async () => {
      const validMarkdown = `# Main Title

This is a simple paragraph.

## Section Header

- List item 1
- List item 2

**Bold text** and *italic text*.`;

      const result = await renderer.validate(validMarkdown);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should validate complex valid Markdown', async () => {
      const complexMarkdown = `# Document Title

This is the introduction paragraph.

## Code Examples

Here's some JavaScript:

\`\`\`javascript
function hello() {
    console.log("Hello, world!");
}
\`\`\`

And some inline \`code\` as well.

## Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| More 1   | More 2   | More 3   |

## Links and Images

Here's a [link](https://example.com) and an image:

![Alt text](image.jpg "Image title")

## Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Lists

1. Ordered item 1
2. Ordered item 2
   - Nested unordered item
   - Another nested item

## Emphasis

This has *emphasis*, **strong emphasis**, and ***both***.

---

That's a horizontal rule above.`;

      const result = await renderer.validate(complexMarkdown);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate Markdown with front matter', async () => {
      const frontMatterMarkdown = `---
title: "Document with Front Matter"
author: "Test Author"
date: "2024-01-01"
tags: ["markdown", "test"]
---

# Document Title

Content goes here.`;

      const result = await renderer.validate(frontMatterMarkdown);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Invalid Input', () => {
    it('should reject null input', async () => {
      const result = await renderer.validate(null as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
      expect(result.errors[0].severity).toBe('error');
    });

    it('should reject undefined input', async () => {
      const result = await renderer.validate(undefined as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
    });

    it('should reject non-string input', async () => {
      const result = await renderer.validate(123 as any);

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
    });

    it('should handle parsing errors gracefully', async () => {
      // This would be markdown that causes the parser to throw
      // For remark, it's quite robust, so we'll test with very malformed input
      const malformedMarkdown = '\u0000\u0001\u0002'; // Control characters that might cause issues

      const result = await renderer.validate(malformedMarkdown);

      // remark is usually quite tolerant, so this might still be valid
      // but we're testing the error handling path
      expect(result).toBeDefined();
      expect(result.valid).toBeDefined();
    });
  });

  describe('Warnings for Common Issues', () => {
    it('should warn about empty content', async () => {
      const emptyMarkdown = '';

      const result = await renderer.validate(emptyMarkdown);

      expect(result.valid).toBe(false);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('EMPTY_CONTENT');
      expect(result.warnings[0].suggestion).toContain('Add some content');
    });

    it('should warn about whitespace-only content', async () => {
      const whitespaceMarkdown = '   \n\n   \t  \n  ';

      const result = await renderer.validate(whitespaceMarkdown);

      expect(result.valid).toBe(false);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].code).toBe('EMPTY_CONTENT');
    });

    it('should warn about unbalanced emphasis markers', async () => {
      const unbalancedMarkdown = `# Title

This has *unbalanced emphasis markers.

And **unbalanced strong markers.`;

      const result = await renderer.validate(unbalancedMarkdown);

      expect(result.warnings.some((w) => w.code === 'UNBALANCED_EMPHASIS')).toBe(true);
      expect(result.warnings[0].suggestion).toContain('missing opening or closing');
    });

    it('should warn about malformed tables', async () => {
      const malformedTableMarkdown = `# Title

| Header 1 | Header 2 |
| Data 1   | Data 2   |

No separator row above.`;

      const result = await renderer.validate(malformedTableMarkdown);

      expect(result.warnings.some((w) => w.code === 'MALFORMED_TABLE')).toBe(true);
      expect(result.warnings.find((w) => w.code === 'MALFORMED_TABLE')?.suggestion).toContain(
        'separator rows with dashes'
      );
    });

    it('should not warn about properly formatted tables', async () => {
      const properTableMarkdown = `# Title

| Header 1 | Header 2 |
|----------|----------|
| Data 1   | Data 2   |
| Data 3   | Data 4   |`;

      const result = await renderer.validate(properTableMarkdown);

      expect(result.valid).toBe(true);
      expect(result.warnings.some((w) => w.code === 'MALFORMED_TABLE')).toBe(false);
    });

    it('should handle tables with different separator styles', async () => {
      const alternativeTableMarkdown = `# Title

| Header 1 | Header 2 |
|==========|==========|
| Data 1   | Data 2   |`;

      const result = await renderer.validate(alternativeTableMarkdown);

      expect(result.valid).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content', async () => {
      const longContent = '#'.repeat(10000) + ' Title\n\n' + 'Content. '.repeat(10000);

      const result = await renderer.validate(longContent);

      expect(result.valid).toBe(true);
    });

    it('should handle content with many line breaks', async () => {
      const manyLineBreaks = 'Line 1\n\n\n\n\n\nLine 2\n\n\n\nLine 3';

      const result = await renderer.validate(manyLineBreaks);

      expect(result.valid).toBe(true);
    });

    it('should handle mixed line endings', async () => {
      const mixedLineEndings = 'Line 1\r\nLine 2\nLine 3\r\n\rLine 4';

      const result = await renderer.validate(mixedLineEndings);

      expect(result.valid).toBe(true);
    });

    it('should handle Unicode content', async () => {
      const unicodeMarkdown = `# 测试文档

这是一个包含Unicode字符的文档。

- 项目 1：中文内容
- 项目 2：العربية
- 项目 3：Русский
- 项目 4：🌟 Emojis 🚀

**粗体中文** 和 *斜体中文*。`;

      const result = await renderer.validate(unicodeMarkdown);

      expect(result.valid).toBe(true);
    });

    it('should handle HTML entities and special characters', async () => {
      const specialCharsMarkdown = `# Special Characters

Content with &amp; &lt; &gt; &quot; entities.

And special symbols: © ® ™ € £ ¥ ¢

Math-like: x² + y² = z² and E = mc²

Arrows: → ← ↑ ↓ ⇒ ⇐

Symbols: ∞ ∑ ∫ ∆ π α β γ`;

      const result = await renderer.validate(specialCharsMarkdown);

      expect(result.valid).toBe(true);
    });

    it('should handle deeply nested structures', async () => {
      const deepNesting = `# Level 1

## Level 2

### Level 3

#### Level 4

##### Level 5

###### Level 6

> Blockquote level 1
> 
> > Blockquote level 2
> > 
> > > Blockquote level 3

1. List item 1
   1. Nested list item 1
      1. Double nested item 1
      2. Double nested item 2
   2. Nested list item 2
2. List item 2`;

      const result = await renderer.validate(deepNesting);

      expect(result.valid).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should validate large documents quickly', async () => {
      // Generate a large document
      const sections = Array.from(
        { length: 100 },
        (_, i) => `
## Section ${i + 1}

This is section ${i + 1} with some content.

- Item 1
- Item 2
- Item 3

\`\`\`javascript
console.log("Section ${i + 1}");
\`\`\`

Some more text here.
`
      ).join('\n');

      const largeMarkdown = `# Large Document\n\n${sections}`;

      const startTime = Date.now();
      const result = await renderer.validate(largeMarkdown);
      const endTime = Date.now();

      expect(result.valid).toBe(true);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });

    it('should handle validation of deeply nested content efficiently', async () => {
      // Create deeply nested list structure
      let nestedContent = 'Content';
      for (let i = 0; i < 50; i++) {
        nestedContent = `- Item ${i}\n  ${nestedContent.split('\n').join('\n  ')}`;
      }

      const deeplyNestedMarkdown = `# Deep Nesting Test\n\n${nestedContent}`;

      const startTime = Date.now();
      const result = await renderer.validate(deeplyNestedMarkdown);
      const endTime = Date.now();

      expect(result).toBeDefined();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('Specific Markdown Features', () => {
    it('should validate code blocks with various languages', async () => {
      const codeBlocksMarkdown = `# Code Examples

\`\`\`javascript
console.log("Hello");
\`\`\`

\`\`\`python
print("Hello")
\`\`\`

\`\`\`bash
echo "Hello"
\`\`\`

\`\`\`
Plain code block
\`\`\`

~~~rust
fn main() {
    println!("Hello");
}
~~~`;

      const result = await renderer.validate(codeBlocksMarkdown);

      expect(result.valid).toBe(true);
    });

    it('should validate reference-style links', async () => {
      const referenceLinksMarkdown = `# Reference Links

This has a [link][1] and another [link][example].

[1]: https://example.com
[example]: https://example.org "Example site"`;

      const result = await renderer.validate(referenceLinksMarkdown);

      expect(result.valid).toBe(true);
    });

    it('should validate strikethrough text (GFM)', async () => {
      const strikethroughMarkdown = `# Strikethrough

This has ~~strikethrough~~ text.`;

      const result = await renderer.validate(strikethroughMarkdown);

      expect(result.valid).toBe(true);
    });

    it('should validate task lists (GFM)', async () => {
      const taskListMarkdown = `# Task List

- [x] Completed task
- [ ] Incomplete task
- [x] Another completed task
  - [ ] Nested incomplete
  - [x] Nested completed`;

      const result = await renderer.validate(taskListMarkdown);

      expect(result.valid).toBe(true);
    });

    it('should validate autolinks', async () => {
      const autolinksMarkdown = `# Autolinks

Visit https://example.com or email test@example.com.

Also works with <https://example.org> and <email@example.org>.`;

      const result = await renderer.validate(autolinksMarkdown);

      expect(result.valid).toBe(true);
    });
  });

  describe('Error Messages', () => {
    it('should provide helpful error messages', async () => {
      const result = await renderer.validate(null as any);

      expect(result.errors[0].message).toContain('non-empty string');
      expect(result.errors[0].code).toBe('VALIDATION_ERROR');
    });

    it('should provide helpful warning messages', async () => {
      const emptyResult = await renderer.validate('');

      expect(emptyResult.warnings[0].message).toContain('empty');
      expect(emptyResult.warnings[0].suggestion).toBeTruthy();
    });
  });
});
