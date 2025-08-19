# Migration Tools Reference

## Overview

This document provides detailed reference information for xats schema migration tools, including automated migration scripts, validation utilities, and custom migration patterns. Use these tools to efficiently migrate content between schema versions while maintaining data integrity and compatibility.

## Table of Contents

- [Installation](#installation)
- [CLI Migration Tools](#cli-migration-tools)
- [Programmatic Migration API](#programmatic-migration-api)
- [Validation Tools](#validation-tools)
- [Custom Migration Scripts](#custom-migration-scripts)
- [Batch Processing](#batch-processing)
- [Error Handling](#error-handling)
- [Testing and Verification](#testing-and-verification)

## Installation

### NPM Package

```bash
# Install globally for CLI usage
npm install -g @xats-org/migration-tools

# Install locally for programmatic usage
npm install @xats-org/migration-tools
```

### Requirements

- **Node.js**: 18.0.0 or higher
- **NPM**: 8.0.0 or higher
- **Memory**: Minimum 512MB for large documents
- **Disk Space**: 100MB for tool installation

### Verify Installation

```bash
xats-migrate --version
xats-validate --version
```

## CLI Migration Tools

### Basic Migration Command

```bash
xats-migrate [options] <input> [output]
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `--from <version>` | Source schema version | Auto-detect |
| `--to <version>` | Target schema version | Latest |
| `--backup` | Create backup before migration | `true` |
| `--dry-run` | Preview changes without modification | `false` |
| `--verbose` | Detailed output | `false` |
| `--force` | Override safety checks | `false` |
| `--config <file>` | Custom configuration file | `xats.config.js` |

#### Examples

```bash
# Auto-detect source version, migrate to latest
xats-migrate document.json

# Specific version migration
xats-migrate --from 0.1.0 --to 0.2.0 document.json

# Preview migration without changes
xats-migrate --dry-run --verbose document.json

# Batch migration with backup
xats-migrate --backup documents/*.json
```

### Enhanced Migration Features

#### Feature-Specific Migration

```bash
# Migrate with accessibility enhancements
xats-migrate --features accessibility document.json

# Add assessment framework
xats-migrate --features assessments document.json

# Comprehensive migration with all features
xats-migrate --features all document.json
```

#### Output Formatting

```bash
# Specify output format
xats-migrate --format pretty document.json output.json
xats-migrate --format minified document.json output.json
```

### Validation Integration

```bash
# Migrate and validate in one step
xats-migrate --validate document.json

# Migrate with specific validation checks
xats-migrate --validate --checks accessibility,lti document.json
```

## Programmatic Migration API

### Basic Usage

```javascript
import { 
  migrateDocument, 
  validateDocument, 
  detectVersion,
  getSupportedVersions 
} from '@xats-org/migration-tools';

// Basic migration
const document = require('./document.json');
const migrated = await migrateDocument(document, {
  targetVersion: '0.3.0',
  features: ['accessibility', 'indexing']
});

// Validate result
const { valid, errors } = await validateDocument(migrated);
console.log('Migration successful:', valid);
```

### Advanced Configuration

```javascript
import { createMigrator } from '@xats-org/migration-tools';

const migrator = createMigrator({
  sourceVersion: '0.1.0',
  targetVersion: '0.3.0',
  options: {
    preserveExtensions: true,
    addAccessibility: true,
    enableIndexing: true,
    validateOutput: true
  }
});

const result = await migrator.migrate(document);
```

### Migration Chain

```javascript
// Chain multiple migrations
const migrationChain = [
  { from: '0.1.0', to: '0.2.0', features: ['accessibility'] },
  { from: '0.2.0', to: '0.3.0', features: ['indexing', 'caseStudies'] }
];

let document = originalDocument;
for (const step of migrationChain) {
  document = await migrateDocument(document, step);
}
```

### Feature Detection

```javascript
import { detectFeatures, recommendMigration } from '@xats-org/migration-tools';

// Analyze document capabilities
const features = await detectFeatures(document);
console.log('Current features:', features);

// Get migration recommendations
const recommendations = await recommendMigration(document, '0.3.0');
console.log('Recommended enhancements:', recommendations);
```

## Validation Tools

### CLI Validation

```bash
# Basic validation
xats-validate document.json

# Version-specific validation
xats-validate --schema 0.3.0 document.json

# Feature-specific validation
xats-validate --accessibility document.json
xats-validate --lti document.json
xats-validate --assessments document.json

# Comprehensive validation
xats-validate --comprehensive document.json
```

### Validation Output Formats

```bash
# JSON output for automation
xats-validate --format json document.json

# Detailed HTML report
xats-validate --format html --output report.html document.json

# JUnit XML for CI/CD
xats-validate --format junit --output results.xml document.json
```

### Programmatic Validation

```javascript
import { 
  validateDocument, 
  validateAccessibility,
  validateLTI,
  validateAssessments 
} from '@xats-org/validation-tools';

// Comprehensive validation
const result = await validateDocument(document);
console.log('Valid:', result.valid);
console.log('Errors:', result.errors);
console.log('Warnings:', result.warnings);

// Feature-specific validation
const accessibilityResult = await validateAccessibility(document);
const ltiResult = await validateLTI(document);
const assessmentResult = await validateAssessments(document);
```

## Custom Migration Scripts

### Document Structure Migration

```javascript
// Convert simple paragraphs to case studies
function convertToCaseStudies(document) {
  const processContent = (content) => {
    return content.map(block => {
      if (block.blockType === 'https://xats.org/core/blocks/paragraph' &&
          block.content.runs[0].text.includes('Consider the case')) {
        return {
          id: block.id,
          blockType: 'https://xats.org/core/blocks/caseStudy',
          content: extractCaseStudyContent(block.content.runs[0].text)
        };
      }
      return block;
    });
  };

  // Recursively process all content
  return processDocumentStructure(document, processContent);
}

function extractCaseStudyContent(text) {
  // Parse narrative text to extract case study elements
  const scenario = extractScenario(text);
  const stakeholders = extractStakeholders(text);
  const questions = extractQuestions(text);
  
  return {
    scenario,
    stakeholders,
    analysisQuestions: questions
  };
}
```

### Content Enhancement Migration

```javascript
// Add index terms to existing content
function addIndexTerms(document) {
  const termDictionary = loadTermDictionary();
  
  const processRuns = (runs) => {
    return runs.flatMap(run => {
      if (run.type === 'text') {
        return addIndexRunsToText(run, termDictionary);
      }
      return run;
    });
  };

  return processSemanticText(document, processRuns);
}

function addIndexRunsToText(textRun, dictionary) {
  const text = textRun.text;
  const runs = [];
  let lastIndex = 0;

  // Find terms to index
  const terms = findIndexableTerms(text, dictionary);
  
  terms.forEach(term => {
    // Add text before term
    if (term.start > lastIndex) {
      runs.push({
        type: 'text',
        text: text.slice(lastIndex, term.start)
      });
    }
    
    // Add index run
    runs.push({
      type: 'index',
      term: term.canonical,
      subterms: term.subterms,
      seeAlso: term.related,
      text: text.slice(term.start, term.end)
    });
    
    lastIndex = term.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    runs.push({
      type: 'text',
      text: text.slice(lastIndex)
    });
  }

  return runs;
}
```

### Accessibility Enhancement

```javascript
// Add accessibility metadata
function enhanceAccessibility(document) {
  // Add document-level accessibility info
  document.accessibility = {
    wcagLevel: 'AA',
    features: determineAccessibilityFeatures(document),
    hazards: [],
    apis: ['ARIA']
  };

  // Add language identification
  if (!document.language) {
    document.language = detectLanguage(document) || 'en-US';
  }

  // Enhance images with alt text
  document = enhanceImageAccessibility(document);

  // Add structural navigation
  document = enhanceStructuralNavigation(document);

  return document;
}

function enhanceImageAccessibility(document) {
  const processContent = (content) => {
    return content.map(block => {
      if (block.blockType === 'https://xats.org/core/blocks/figure' ||
          block.blockType === 'https://xats.org/core/blocks/image') {
        
        if (!block.content.altText) {
          block.content.altText = generateAltText(block);
        }
        
        if (isComplexImage(block) && !block.content.longDescription) {
          block.content.longDescription = generateLongDescription(block);
        }
      }
      return block;
    });
  };

  return processDocumentStructure(document, processContent);
}
```

## Batch Processing

### Directory Migration

```bash
# Migrate all JSON files in directory
xats-migrate --recursive ./documents/

# Migrate with pattern matching
xats-migrate --pattern "**/*.json" --exclude "**/drafts/**"
```

### Programmatic Batch Processing

```javascript
import { glob } from 'glob';
import { migrateDocument } from '@xats-org/migration-tools';
import { promises as fs } from 'fs';

async function batchMigrate(pattern, options) {
  const files = await glob(pattern);
  const results = [];

  for (const file of files) {
    try {
      const document = JSON.parse(await fs.readFile(file, 'utf8'));
      const migrated = await migrateDocument(document, options);
      
      await fs.writeFile(file, JSON.stringify(migrated, null, 2));
      results.push({ file, status: 'success' });
    } catch (error) {
      results.push({ file, status: 'error', error: error.message });
    }
  }

  return results;
}

// Usage
const results = await batchMigrate('documents/**/*.json', {
  targetVersion: '0.3.0',
  features: ['accessibility', 'indexing']
});

console.log('Migration results:', results);
```

### Progress Tracking

```javascript
import { ProgressBar } from 'cli-progress';

async function batchMigrateWithProgress(files, options) {
  const progressBar = new ProgressBar({
    format: 'Migration [{bar}] {percentage}% | {value}/{total} files',
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
  });

  progressBar.start(files.length, 0);

  const results = [];
  for (let i = 0; i < files.length; i++) {
    const result = await migrateFile(files[i], options);
    results.push(result);
    progressBar.update(i + 1);
  }

  progressBar.stop();
  return results;
}
```

## Error Handling

### Migration Error Types

```javascript
import { 
  MigrationError,
  ValidationError,
  VersionError,
  SchemaError
} from '@xats-org/migration-tools';

try {
  const migrated = await migrateDocument(document, options);
} catch (error) {
  if (error instanceof MigrationError) {
    console.error('Migration failed:', error.message);
    console.error('Details:', error.details);
  } else if (error instanceof ValidationError) {
    console.error('Validation failed:', error.errors);
  } else if (error instanceof VersionError) {
    console.error('Version incompatibility:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Recovery Strategies

```javascript
async function robustMigrate(document, options) {
  const backup = JSON.parse(JSON.stringify(document));
  
  try {
    // Attempt migration
    const migrated = await migrateDocument(document, options);
    
    // Validate result
    const { valid, errors } = await validateDocument(migrated);
    if (!valid) {
      throw new ValidationError('Migration produced invalid document', errors);
    }
    
    return migrated;
  } catch (error) {
    if (error instanceof MigrationError && options.fallbackStrategies) {
      // Try fallback strategies
      for (const strategy of options.fallbackStrategies) {
        try {
          return await strategy(backup, options);
        } catch (fallbackError) {
          console.warn('Fallback strategy failed:', fallbackError.message);
        }
      }
    }
    
    // Return backup if all strategies fail
    console.warn('All migration strategies failed, returning original document');
    return backup;
  }
}
```

### Logging and Debugging

```javascript
import { createLogger } from '@xats-org/migration-tools';

const logger = createLogger({
  level: 'debug',
  file: 'migration.log',
  console: true
});

const migrated = await migrateDocument(document, {
  targetVersion: '0.3.0',
  logger: logger,
  debug: true
});
```

## Testing and Verification

### Migration Test Suite

```javascript
// migration.test.js
import { describe, it, expect } from 'vitest';
import { migrateDocument, validateDocument } from '@xats-org/migration-tools';

describe('Document Migration', () => {
  it('should migrate v0.1.0 to v0.2.0', async () => {
    const v1Document = require('./fixtures/v0.1.0-document.json');
    const migrated = await migrateDocument(v1Document, { 
      targetVersion: '0.2.0' 
    });
    
    expect(migrated.schemaVersion).toBe('0.2.0');
    
    const { valid } = await validateDocument(migrated);
    expect(valid).toBe(true);
  });

  it('should preserve content during migration', async () => {
    const original = require('./fixtures/complex-document.json');
    const migrated = await migrateDocument(original, { 
      targetVersion: '0.3.0' 
    });
    
    // Verify content preservation
    expect(migrated.bodyMatter.contents.length)
      .toBe(original.bodyMatter.contents.length);
    
    // Verify enhancement additions
    expect(migrated.language).toBeDefined();
    expect(migrated.accessibility).toBeDefined();
  });
});
```

### Integration Testing

```javascript
// integration.test.js
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

describe('CLI Migration Tool', () => {
  it('should migrate via CLI', async () => {
    const { stdout } = await execAsync(
      'xats-migrate --from 0.1.0 --to 0.2.0 test-document.json'
    );
    
    expect(stdout).toContain('Migration completed successfully');
  });

  it('should validate migrated document', async () => {
    await execAsync('xats-migrate test-document.json migrated.json');
    const { stdout } = await execAsync('xats-validate migrated.json');
    
    expect(stdout).toContain('Document is valid');
  });
});
```

### Performance Testing

```javascript
// performance.test.js
import { performance } from 'perf_hooks';

describe('Migration Performance', () => {
  it('should migrate large documents within time limit', async () => {
    const largeDocument = generateLargeDocument(1000); // 1000 sections
    
    const start = performance.now();
    const migrated = await migrateDocument(largeDocument, {
      targetVersion: '0.3.0'
    });
    const end = performance.now();
    
    expect(end - start).toBeLessThan(5000); // 5 second limit
    expect(migrated.schemaVersion).toBe('0.3.0');
  });
});
```

## Configuration

### Migration Configuration File

```javascript
// xats.config.js
export default {
  migration: {
    defaultTargetVersion: '0.3.0',
    backup: true,
    features: {
      accessibility: {
        enabled: true,
        wcagLevel: 'AA',
        autoAltText: true
      },
      indexing: {
        enabled: true,
        dictionary: './terms.json',
        minTermLength: 3
      },
      caseStudies: {
        enabled: false,
        autoDetect: true
      }
    },
    validation: {
      strict: true,
      warningsAsErrors: false
    }
  },
  
  validation: {
    schemas: {
      '0.1.0': './schemas/0.1.0/xats.json',
      '0.2.0': './schemas/0.2.0/xats.json',
      '0.3.0': './schemas/0.3.0/xats.json'
    }
  }
};
```

### Environment Configuration

```bash
# .env
XATS_SCHEMA_PATH=./schemas
XATS_BACKUP_PATH=./backups
XATS_LOG_LEVEL=info
XATS_VALIDATION_STRICT=true
```

## Troubleshooting

### Common Issues

**Issue**: Migration fails with "Unknown schema version"
```bash
# Solution: Update tools to latest version
npm update -g @xats-org/migration-tools
```

**Issue**: Out of memory during migration
```bash
# Solution: Increase Node.js memory limit
node --max-old-space-size=4096 $(which xats-migrate) document.json
```

**Issue**: Validation fails after migration
```javascript
// Solution: Use debug mode to identify issues
const result = await migrateDocument(document, {
  targetVersion: '0.3.0',
  debug: true,
  validateSteps: true
});
```

### Support Resources

- **Documentation**: [Migration Guide](migration-guide.md)
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/xats-org/core/issues)
- **Community Forum**: [Get help from the community](https://github.com/xats-org/core/discussions)

---

*This tools reference is updated with each release. For the latest information, see the [official documentation](https://xats.org/docs).*