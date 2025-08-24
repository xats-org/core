# @xats-org/ancillary-generator

Automated ancillary material generation for xats documents. This package provides tools to extract tagged content from xats documents and generate various supplementary materials including study guides, presentation slides, test banks, and more.

## Installation

```bash
npm install @xats-org/ancillary-generator
```

## Features

- **Study Guide Generation**: Create comprehensive study guides with summaries, key terms, and practice questions
- **Slide Deck Generation**: Generate presentation slides in multiple formats (PowerPoint, HTML, Markdown)
- **Test Bank Extraction**: Extract and organize assessment questions with answer keys and rubrics
- **Flexible Tagging System**: Use standardized ancillary tags to mark content for extraction
- **Multiple Output Formats**: Support for HTML, PDF, DOCX, PPTX, Markdown, and JSON
- **Customizable Templates**: Use templates to control output formatting and styling

## Usage

### Basic Example

```typescript
import { StudyGuideGenerator } from '@xats-org/ancillary-generator';
import { loadDocument } from '@xats-org/validator';

// Load your xats document
const document = await loadDocument('path/to/document.json');

// Create a study guide generator
const generator = new StudyGuideGenerator();

// Extract content tagged for study guides
const content = generator.extractTaggedContent(document, {
  tags: ['study-guide-content'],
  includeNested: true,
});

// Generate study guide
const result = await generator.generateOutput(content, {
  format: 'html',
  includeLearningObjectives: true,
  includeSummaries: true,
  includeGlossary: true,
  includePracticeQuestions: true,
  groupBy: 'chapter',
});

if (result.success) {
  // Save or process the output
  console.log('Study guide generated:', result.output);
}
```

### Generating Slides

```typescript
import { SlideDeckGenerator } from '@xats-org/ancillary-generator';

const slideGen = new SlideDeckGenerator();

// Extract content marked for slides
const slideContent = slideGen.extractTaggedContent(document, {
  tags: ['slide-content'],
});

// Generate slide deck
const slides = await slideGen.generateOutput(slideContent, {
  format: 'html',
  maxSlides: 30,
  slidesPerSection: 5,
  includeSpeakerNotes: true,
  theme: 'white',
  animations: true,
});
```

### Creating Test Banks

```typescript
import { TestBankExtractor } from '@xats-org/ancillary-generator';

const testBank = new TestBankExtractor();

// Extract quiz questions
const questions = testBank.extractTaggedContent(document, {
  tags: ['quiz-bank-item'],
});

// Generate test bank
const bank = await testBank.generateOutput(questions, {
  format: 'json',
  questionTypes: ['multiple-choice', 'short-answer'],
  difficultyLevels: ['easy', 'medium', 'hard'],
  questionsPerTopic: 10,
  includeAnswerKey: true,
  includeRubrics: true,
  randomizeOrder: true,
});
```

## Ancillary Tags

The package uses standardized vocabulary tags to mark content for extraction:

### Study Guide Tags

- `study-guide-content`: Content to include in study guides
  - Properties: `importance`, `reviewFrequency`, `studyTips`

### Slide Tags

- `slide-content`: Content to include in presentations
  - Properties: `slideType`, `maxBulletPoints`, `speakerNotes`, `animationHint`

### Assessment Tags

- `quiz-bank-item`: Questions for test banks
  - Properties: `questionType`, `difficulty`, `cognitiveLevel`, `points`

### Instructor Tags

- `instructor-note`: Notes for instructor manuals
  - Properties: `noteType`, `visibility`, `timing`, `experienceLevel`

### Solution Tags

- `solution-manual-content`: Solutions and answer keys
  - Properties: `solutionType`, `showWorkRequired`, `alternativeSolutions`

## Tagging Content

To mark content for ancillary generation, add tags to your xats blocks:

```json
{
  "blockType": "https://xats.org/vocabularies/blocks/paragraph",
  "content": {
    "runs": [
      {
        "type": "text",
        "text": "The mitochondria is the powerhouse of the cell."
      }
    ]
  },
  "tags": ["study-guide-content", "slide-content"],
  "extensions": {
    "ancillary": {
      "importance": "critical",
      "slideType": "bullet-points",
      "maxBulletPoints": 3
    }
  }
}
```

## Custom Generators

You can create custom generators by extending the base class:

```typescript
import { BaseAncillaryGenerator } from '@xats-org/ancillary-generator';
import type { ExtractedContent, GenerationResult, OutputFormat } from '@xats-org/ancillary-generator';

export class CustomGenerator extends BaseAncillaryGenerator {
  supportedFormats: OutputFormat[] = ['html', 'json'];

  async generateOutput(
    content: ExtractedContent[],
    options: any
  ): Promise<GenerationResult> {
    // Your custom generation logic
    const output = this.processContent(content, options);
    
    return this.createSuccessResult(
      output,
      options.format,
      {
        blocksProcessed: content.length,
        timeElapsed: Date.now() - startTime,
        outputSize: output.length,
      }
    );
  }

  private processContent(content: ExtractedContent[], options: any): string {
    // Custom processing logic
    return JSON.stringify(content);
  }
}
```

## API Reference

### BaseAncillaryGenerator

Base class for all ancillary generators.

#### Methods

- `extractTaggedContent(document, options)`: Extract content blocks matching specified tags
- `generateOutput(content, options)`: Generate output from extracted content (abstract)
- `validateOptions(options)`: Validate generation options
- `extractPlainText(semanticText)`: Extract plain text from SemanticText objects

### ExtractionOptions

```typescript
interface ExtractionOptions {
  tags: string[];              // Tags to filter by
  includeNested?: boolean;     // Include nested content
  maxDepth?: number;          // Maximum nesting depth
  preserveStructure?: boolean; // Preserve document structure
  filter?: (block) => boolean; // Custom filter function
}
```

### GenerationOptions

```typescript
interface GenerationOptions {
  format: OutputFormat;        // Output format
  template?: Template;         // Custom template
  styling?: Record<string, any>; // Custom styles
  metadata?: Record<string, any>; // Additional metadata
  includeReferences?: boolean; // Include source references
  outputPath?: string;        // Output file path
}
```

## Contributing

Contributions are welcome! Please see the [contributing guide](../../CONTRIBUTING.md) for details.

## License

MIT © xats.org