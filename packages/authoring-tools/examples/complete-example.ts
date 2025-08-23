/**
 * Complete example demonstrating the xats authoring tools
 */

/* eslint-disable no-console */

import type { XatsDocument } from '@xats-org/types';

import { XatsAuthoringTool } from '../src/index.js';
import type { SimplifiedDocument } from '../src/types.js';

async function demonstrateAuthoringTools() {
  console.log('🚀 xats Authoring Tools Demo\n');

  // Create an authoring tool with comprehensive settings
  const authoringTool = new XatsAuthoringTool({
    realTimeValidation: true,
    enablePreview: true,
    previewFormat: 'html',
    autoSaveInterval: 5000,
    maxValidationErrors: 10,
    includeSuggestions: true,
    userLevel: 'intermediate',
    language: 'en',
  });

  // Example 1: Create a complete educational document
  console.log('📝 Creating a comprehensive educational document...');

  const educationalContent: SimplifiedDocument = {
    title: 'Introduction to Data Structures and Algorithms',
    author: 'Dr. Jane Computer-Scientist',
    subject: 'Computer Science',
    content: `# Chapter 1: Fundamental Concepts

Data structures and algorithms form the foundation of computer science and software engineering. Understanding these concepts is crucial for writing efficient and maintainable code.

## 1.1 What are Data Structures?

A **data structure** is a way of organizing and storing data so that it can be accessed and modified efficiently. Different data structures are suited for different kinds of applications.

### Key Characteristics

- **Organization**: How data is arranged in memory
- **Access patterns**: How we retrieve and modify data
- **Performance**: Time and space complexity considerations
- **Use cases**: When to use each structure

> **Important Note**: The choice of data structure can significantly impact the performance of your algorithms.

### Common Data Structures

1. **Arrays**: Contiguous memory locations storing elements of the same type
2. **Linked Lists**: Dynamic structures where elements point to the next element
3. **Stacks**: Last-In-First-Out (LIFO) data structure
4. **Queues**: First-In-First-Out (FIFO) data structure
5. **Trees**: Hierarchical structures with parent-child relationships
6. **Graphs**: Collections of vertices connected by edges

## 1.2 Introduction to Algorithms

An **algorithm** is a step-by-step procedure for solving a problem or performing a computation. Algorithms must be:

- **Finite**: Must terminate after a finite number of steps
- **Well-defined**: Each step must be precisely defined
- **Input**: Must have zero or more inputs
- **Output**: Must produce one or more outputs
- **Effective**: Steps must be basic enough to be carried out

### Algorithm Analysis

| Notation | Name | Description |
|----------|------|-------------|
| O(1) | Constant | Execution time doesn't change with input size |
| O(log n) | Logarithmic | Execution time grows logarithmically |
| O(n) | Linear | Execution time grows linearly with input |
| O(n²) | Quadratic | Execution time grows quadratically |

### Example: Linear Search Algorithm

Here's a simple linear search implementation:

\`\`\`python
def linear_search(arr, target):
    """
    Search for target in arr using linear search.
    
    Args:
        arr: List of elements to search through
        target: Element to find
        
    Returns:
        Index of target if found, -1 otherwise
    """
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

# Example usage
numbers = [1, 3, 5, 7, 9, 11, 13]
result = linear_search(numbers, 7)
print(f"Found at index: {result}")  # Output: Found at index: 3
\`\`\`

**Time Complexity**: O(n) - In the worst case, we examine every element
**Space Complexity**: O(1) - We only use a constant amount of extra space

## 1.3 Choosing the Right Data Structure

The choice of data structure depends on several factors:

### Performance Requirements

- **Fast insertion**: Use dynamic arrays or linked lists
- **Fast search**: Use hash tables or balanced trees  
- **Fast sorting**: Consider the data distribution and size

### Memory Constraints

- **Limited memory**: Choose compact representations
- **Abundant memory**: Optimize for speed over space

### Access Patterns

- **Sequential access**: Arrays are ideal
- **Random access**: Hash tables provide O(1) lookup
- **Hierarchical data**: Trees are natural choices

### Example Decision Matrix

| Operation | Array | Linked List | Hash Table | Binary Tree |
|-----------|-------|-------------|------------|-------------|
| Access by index | O(1) | O(n) | N/A | O(log n) |
| Insert at end | O(1)* | O(1) | O(1)* | O(log n) |
| Insert at beginning | O(n) | O(1) | O(1)* | O(log n) |
| Delete | O(n) | O(1) | O(1)* | O(log n) |
| Search | O(n) | O(n) | O(1)* | O(log n) |

*Average case; worst case may differ

## Chapter Summary

In this chapter, we covered:

1. ✅ The definition and importance of data structures
2. ✅ Key characteristics of algorithms
3. ✅ Basic algorithm analysis and Big O notation
4. ✅ Factors to consider when choosing data structures
5. ✅ A complete example with linear search

### Key Takeaways

- Data structures organize information for efficient access
- Algorithms provide systematic approaches to problem-solving
- Performance analysis helps us make informed decisions
- Different problems require different data structure choices

### Next Steps

In the next chapter, we'll dive deep into arrays and their variants, exploring:

- Static vs. dynamic arrays
- Multi-dimensional arrays
- Array algorithms and their complexity
- Practical applications and examples

---

**Practice Problems**

1. Implement a binary search algorithm and analyze its complexity
2. Compare the performance of different sorting algorithms
3. Design a data structure for a phone book application

**Further Reading**

- *Introduction to Algorithms* by Cormen, Leiserson, Rivest, and Stein
- *Data Structures and Algorithms in Python* by Goodrich, Tamassia, and Goldwasser
- Online visualizations at [VisuAlgo.net](https://visualgo.net)`,
  };

  try {
    const result = await authoringTool.createDocument(educationalContent);

    if (result.success) {
      console.log('✅ Document created successfully!');
      console.log(`📊 Quality Score: ${result.validation?.qualityScore}/100`);
      console.log(`⏱️  Processing Time: ${result.processingTime?.toFixed(2)}ms`);

      if (result.validation?.errors.length) {
        console.log(`⚠️  Validation Issues: ${result.validation.errors.length}`);
        result.validation.errors.slice(0, 3).forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.message}`);
        });
      }

      // Generate HTML preview
      console.log('\n🎨 Generating HTML preview...');
      const htmlPreview = await authoringTool.generatePreview(result.document as XatsDocument, {
        format: 'html',
        includeStyles: true,
        theme: 'academic',
        accessibilityMode: true,
      });

      console.log(`✅ HTML preview generated (${htmlPreview.content.length} characters)`);
      console.log(`⏱️  Generation Time: ${htmlPreview.generationTime.toFixed(2)}ms`);

      // Generate Markdown preview
      console.log('\n📝 Generating Markdown preview...');
      const mdPreview = await authoringTool.generatePreview(result.document as XatsDocument, {
        format: 'markdown',
      });

      console.log(`✅ Markdown preview generated (${mdPreview.content.length} characters)`);

      // Demonstrate export functionality
      console.log('\n📤 Testing export functionality...');

      const exportResults = await Promise.all([
        authoringTool.exportDocument(result.document as XatsDocument, 'html'),
        authoringTool.exportDocument(result.document as XatsDocument, 'markdown'),
        // Note: DOCX export would work but requires binary handling in this example
      ]);

      exportResults.forEach((exportResult, index) => {
        const formats = ['HTML', 'Markdown'];
        if (exportResult.success) {
          console.log(`✅ ${formats[index]} export: ${exportResult.content?.length} characters`);
        } else {
          console.log(`❌ ${formats[index]} export failed: ${exportResult.errors?.[0]?.message}`);
        }
      });
    } else {
      console.log('❌ Document creation failed:');
      result.errors?.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.message}`);
        if (error.suggestions.length > 0) {
          console.log(`      💡 Suggestion: ${error.suggestions[0]?.description}`);
        }
      });
    }
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }

  // Example 2: Demonstrate import from Markdown
  console.log('\n📥 Demonstrating Markdown import...');

  const markdownContent = `# Quick Start Guide

## Installation

\`\`\`bash
npm install my-package
\`\`\`

## Basic Usage

Here's how to get started:

1. Import the library
2. Create an instance
3. Call the main function

> **Note**: Make sure to handle errors appropriately.

### Example Code

\`\`\`javascript
import { MyLibrary } from 'my-package';

const lib = new MyLibrary();
const result = lib.process('input');
console.log(result);
\`\`\``;

  try {
    const importResult = await authoringTool.importFromMarkdown(markdownContent);

    if (importResult.success) {
      console.log('✅ Markdown import successful!');
      console.log(`📊 Fidelity Score: ${((importResult.fidelityScore ?? 0) * 100).toFixed(1)}%`);
      console.log(`⏱️  Import Time: ${importResult.processingTime?.toFixed(2)}ms`);

      if (importResult.warnings?.length) {
        console.log(`⚠️  Import Warnings: ${importResult.warnings.length}`);
        importResult.warnings.slice(0, 2).forEach((warning, index) => {
          console.log(`   ${index + 1}. ${warning}`);
        });
      }
    } else {
      console.log('❌ Markdown import failed');
      importResult.errors?.forEach((error) => console.log(`   - ${error.message}`));
    }
  } catch (error) {
    console.error('💥 Import error:', error);
  }

  // Example 3: Show authoring help
  console.log('\n📚 Available authoring help:');
  const help = authoringTool.getAuthoringHelp();

  help.slice(0, 3).forEach((item, index) => {
    console.log(`\n${index + 1}. ${item.title}`);
    console.log(`   ${item.description}`);
    console.log(`   Example: ${item.examples[0]}`);
  });

  // Example 4: Demonstrate different user levels
  console.log('\n👤 Testing different user experience levels...');

  const userLevels: Array<'beginner' | 'intermediate' | 'advanced'> = [
    'beginner',
    'intermediate',
    'advanced',
  ];
  const invalidDoc: SimplifiedDocument = {
    title: '', // Invalid: empty title
    content: '# Test\n\nContent without required fields.',
  };

  for (const level of userLevels) {
    const levelTool = new XatsAuthoringTool({ userLevel: level });
    const result = await levelTool.createDocument(invalidDoc);

    console.log(`\n${level.toUpperCase()} level error message:`);
    if (result.validation?.errors.length) {
      console.log(`   "${result.validation.errors[0]?.message}"`);
    }
  }

  console.log('\n🎉 Demo completed successfully!');
  console.log('\nThe xats authoring tools provide:');
  console.log('   ✅ Simplified markdown-like syntax');
  console.log('   ✅ Real-time validation with smart error messages');
  console.log('   ✅ DOCX and Markdown import/export');
  console.log('   ✅ Live HTML and Markdown preview generation');
  console.log('   ✅ User experience level adaptation');
  console.log('   ✅ Comprehensive accessibility support');
}

// To run the demo, import and call demonstrateAuthoringTools()
export { demonstrateAuthoringTools };
