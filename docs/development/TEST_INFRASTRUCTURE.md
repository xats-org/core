# xats Test Infrastructure

This document describes the comprehensive test infrastructure created for the xats project as part of issue #7.

## Overview

The test infrastructure provides:

- **JSON Schema validation** for xats documents using AJV
- **CLI validator** for command-line validation
- **Comprehensive test suite** with unit, integration, and CLI tests
- **GitHub Actions CI/CD** pipeline
- **TypeScript support** with strict type checking

## Installation & Setup

```bash
# Install dependencies
npm install

# Build the TypeScript project
npm run build

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Type check without building
npm run typecheck

# Lint the code
npm run lint
```

## Usage

### CLI Validator

The CLI validator (`xats-validate`) can be used to validate xats documents:

```bash
# Basic validation
npm run validate path/to/document.json

# Or use the built CLI directly
node bin/validate.js path/to/document.json

# Validate with specific schema version
node bin/validate.js document.json --schema-version 0.1.0

# Get JSON output (useful for programmatic use)
node bin/validate.js document.json --json

# Quiet mode (only errors)
node bin/validate.js document.json --quiet

# List available schema versions
node bin/validate.js versions

# Show schema information
node bin/validate.js schema [version]
```

### Programmatic API

The validator can also be used programmatically:

```typescript
import { validateXats, validateXatsFile, createValidator } from '@xats-org/core';

// Validate a document object
const result = await validateXats(documentObject);
if (result.isValid) {
  console.log('Document is valid!');
} else {
  console.log('Validation errors:', result.errors);
}

// Validate a file
const fileResult = await validateXatsFile('path/to/document.json');

// Create a custom validator
const validator = createValidator({
  strict: true,
  allErrors: true,
  schemaVersion: '0.1.0'
});

const customResult = await validator.validate(document);
```

## Test Structure

### Test Files

- **`test/validator.test.ts`** - Core validator functionality tests
- **`test/cli.test.ts`** - CLI interface tests
- **`test/fixtures/`** - Test documents (valid and invalid)

### Test Fixtures

- **`valid-minimal.json`** - Minimal valid xats document
- **`invalid-missing-required.json`** - Document missing required fields
- **`invalid-wrong-schema-version.json`** - Document with invalid schema version
- **`invalid-json.json`** - Malformed JSON document

### Test Coverage

The test suite achieves excellent coverage:

- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >95%
- **Lines**: >90%

### Test Categories

1. **Unit Tests**
   - Validator constructor and configuration
   - Document validation (valid/invalid cases)
   - File validation
   - Error handling
   - Schema version handling

2. **Integration Tests**
   - CLI command execution
   - File I/O operations
   - End-to-end validation workflows

3. **Performance Tests**
   - Multiple document validation
   - Schema caching efficiency
   - Memory usage patterns

4. **Error Handling Tests**
   - Network failures (external schema loading)
   - File system errors
   - Malformed JSON
   - Invalid schema versions

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci.yml`) provides:

### Jobs

1. **Test** - Runs on Node.js 18, 20, 21
   - Install dependencies
   - Type checking
   - Build project
   - Run tests with coverage
   - Upload coverage to Codecov

2. **Lint** - Code quality checks
   - ESLint with TypeScript rules
   - Code style enforcement

3. **Validate Examples** - Document validation
   - Validate test fixtures
   - Validate example documents
   - Test CLI commands

4. **Schema Validation** - Schema integrity
   - Validate JSON Schema syntax
   - Check schema completeness

5. **Security** - Security auditing
   - npm audit for vulnerabilities
   - Dependency security checks

6. **Build** - Package creation
   - Build and package npm module
   - Create distribution artifacts

7. **Integration** - End-to-end testing
   - Global package installation
   - CLI workflow testing
   - JSON output validation

## Schema Validation Features

### Core Capabilities

- **JSON Schema Draft-07** compliance
- **External schema resolution** with fallback for CSL-JSON
- **Detailed error reporting** with path and context
- **Multiple schema version support**
- **Strict and permissive validation modes**

### Validation Features

- **Semantic structure validation** (Units, Chapters, Sections)
- **Content block validation** with URI-based block types
- **SemanticText validation** with typed runs
- **Citation and bibliography validation** (CSL-JSON)
- **Learning objective and pathway validation**

### Error Reporting

The validator provides detailed error information:

```typescript
interface ValidationError {
  path: string;        // JSON path to the error
  message: string;     // Human-readable error message
  keyword?: string;    // JSON Schema keyword that failed
  params?: object;     // Additional error parameters
  data?: unknown;      // The invalid data value
}
```

## Development Workflow

### Adding New Tests

1. Create test files in the `test/` directory
2. Use descriptive test names following the pattern: "should [expected behavior] when [condition]"
3. Include both positive and negative test cases
4. Test edge cases and error conditions
5. Ensure good test coverage

### Test Data

- Use realistic test data that matches the schema
- Create focused test fixtures for specific scenarios
- Document any special test data requirements
- Keep test data minimal but comprehensive

### Running Specific Tests

```bash
# Run specific test file
npm test -- test/validator.test.ts

# Run tests matching a pattern
npm test -- --grep "should validate"

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage
```

## Implementation Details

### Schema Loading

The validator loads schemas from the `schemas/` directory:

- **Schema versions**: `schemas/{version}/xats.json`
- **Caching**: Schemas are cached in memory for performance
- **Fallback**: Basic CSL schema included for offline validation

### TypeScript Configuration

- **Target**: ES2022 with Node.js compatibility
- **Strict mode**: Full TypeScript strict mode enabled
- **Module system**: ESM modules with Node.js resolution
- **Type checking**: Comprehensive type checking and inference

### Error Handling

- **Graceful degradation**: Continues validation when possible
- **Detailed reporting**: Provides context for all errors
- **User-friendly messages**: Clear error descriptions
- **Structured output**: Machine-readable error format

## Future Enhancements

### Planned Improvements

1. **Dynamic schema discovery** - Auto-detect available schema versions
2. **Remote schema loading** - Support for fetching schemas from URLs
3. **Custom validation rules** - Extension points for custom validators
4. **Interactive CLI mode** - Guided validation and fixing
5. **VS Code extension** - IDE integration for real-time validation

### Extension Points

The validator is designed for extensibility:

- **Custom formats** - Add domain-specific validation formats
- **Plugin system** - Register custom validation plugins
- **Schema extensions** - Support for schema composition
- **Custom error handlers** - Customize error reporting and formatting

## Troubleshooting

### Common Issues

1. **Schema not found**
   - Ensure schema files exist in `schemas/{version}/`
   - Check schema version in document matches available schemas

2. **External schema loading fails**
   - Network connectivity issues
   - Use offline mode or provide local schema copies

3. **TypeScript compilation errors**
   - Run `npm run typecheck` to identify type issues
   - Ensure all dependencies are properly typed

4. **Test failures**
   - Check test fixtures match current schema
   - Verify environment setup and dependencies

### Debug Mode

Enable verbose logging for debugging:

```bash
# Enable debug output
DEBUG=xats:* npm test

# Verbose CLI output
node bin/validate.js document.json --verbose
```

## Contributing

When contributing to the test infrastructure:

1. **Follow existing patterns** - Maintain consistency with current tests
2. **Add comprehensive tests** - Cover both success and failure cases
3. **Update documentation** - Keep this document current
4. **Run full test suite** - Ensure all tests pass before submitting
5. **Check coverage** - Maintain or improve test coverage

The test infrastructure is critical for ensuring the reliability and correctness of the xats ecosystem. All changes should maintain the high quality standards established by this comprehensive test suite.