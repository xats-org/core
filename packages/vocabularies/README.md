# @xats/vocabularies

Core vocabulary definitions for the xats schema. This package contains JSON schema definitions for all standard block types, rendering hints, pathway types, placeholders, and triggers supported by the xats ecosystem.

## Usage

```typescript
import { getBlockVocabulary, getHintVocabulary } from '@xats/vocabularies';

// Get a specific block vocabulary
const paragraphBlock = await getBlockVocabulary('paragraph');
console.log(paragraphBlock.$id); // "https://xats.org/vocabularies/blocks/paragraph"

// Get all available vocabularies
import { blockTypes, hintTypes, pathwayTypes } from '@xats/vocabularies';
```

## Vocabulary Types

- **Blocks**: Content block types (paragraph, heading, figure, etc.)
- **Hints**: Rendering hint vocabularies (layout modes, TOC settings, etc.)
- **Pathways**: Learning pathway types (standard, remedial, enrichment, etc.)
- **Placeholders**: Placeholder block types (TOC, bibliography, index)
- **Triggers**: Pathway trigger conditions (onAssessment, onCompletion, etc.)

## File Structure

```
vocabularies/
├── blocks/           # Content block definitions
├── hints/           # Rendering hint definitions
├── pathways/        # Learning pathway definitions
├── placeholders/    # Placeholder definitions
└── triggers/        # Trigger definitions
```

All vocabulary files follow the JSON Schema format with standardized URIs using the pattern:
`https://xats.org/vocabularies/{category}/{name}`