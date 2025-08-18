# Schema Validation Test Suite

This directory contains a comprehensive test suite for validating the xats JSON schema integrity, correctness, and performance. The test suite ensures that the schema properly validates xats documents and catches validation errors appropriately.

## Test Organization

The test suite is organized into 8 main categories:

### 1. Schema Structure Validation (`schema-structure.test.ts`)
- **Purpose**: Validates the JSON schema itself for correctness
- **Coverage**: Schema metadata, property definitions, reference integrity, URI formats, constraints
- **Key Tests**:
  - JSON Schema meta-validation
  - Required/optional property definitions
  - Internal reference validation
  - Constraint validation (const, enum, pattern, minItems)

### 2. Definition Reference Validation (`definition-references.test.ts`)
- **Purpose**: Tests schema definition relationships and inheritance
- **Coverage**: Object inheritance, reference chains, external dependencies
- **Key Tests**:
  - XatsObject inheritance hierarchy
  - StructuralContainer inheritance
  - SemanticText structure and run types
  - Content block type definitions
  - CSL-JSON external reference

### 3. Required Field Validation (`required-fields.test.ts`)
- **Purpose**: Ensures all required fields are properly enforced
- **Coverage**: Root document fields, object hierarchies, content-specific requirements
- **Key Tests**:
  - Root document required fields (schemaVersion, bibliographicEntry, subject, bodyMatter)
  - XatsObject id field requirements
  - Content block and text run requirements
  - Matter structure requirements

### 4. Type Constraint Validation (`type-constraints.test.ts`)
- **Purpose**: Tests type enforcement and constraint validation
- **Coverage**: Primitive types, arrays, objects, enums, const values
- **Key Tests**:
  - String, array, object, boolean type enforcement
  - Const value validation (schema version, run types)
  - Enum value validation (list types, math notation)
  - Null/undefined handling

### 5. Pattern and Format Validation (`pattern-format.test.ts`)
- **Purpose**: Validates pattern matching and format constraints
- **Coverage**: URI formats, regex patterns, international characters
- **Key Tests**:
  - URI format validation for block types, resources, pathways
  - Pattern validation for pathway conditions
  - Edge cases in URI handling
  - Custom and extension block types

### 6. Example Document Validation (`example-documents.test.ts`)
- **Purpose**: Tests with realistic document examples
- **Coverage**: Valid/invalid documents, comprehensive examples, stress tests
- **Key Tests**:
  - Valid example documents with all features
  - Invalid example rejection
  - Complex nested structures
  - Large document handling

### 7. Edge Case Validation (`edge-cases.test.ts`)
- **Purpose**: Tests boundary conditions and unusual inputs
- **Coverage**: Empty structures, extreme values, special characters, performance edge cases
- **Key Tests**:
  - Empty arrays and minimal documents
  - Very long strings and large structures
  - Unicode and special character handling
  - Schema version edge cases

### 8. Performance Validation (`performance.test.ts`)
- **Purpose**: Tests validation performance and scalability
- **Coverage**: Speed, memory usage, concurrent validation, scalability
- **Key Tests**:
  - Validation speed across document sizes
  - Memory usage patterns
  - Concurrent validation handling
  - Scalability with document complexity

## Test Metrics

### Coverage Targets
- **Schema Validation**: >90% coverage of schema structure and definitions
- **Field Validation**: >95% coverage of required and optional fields
- **Type Validation**: >90% coverage of type constraints
- **Format Validation**: >85% coverage of patterns and formats
- **Example Coverage**: >95% coverage of valid and invalid examples
- **Edge Case Coverage**: >80% coverage of boundary conditions
- **Performance Coverage**: >75% coverage of performance characteristics

### Test Statistics
- **Total Tests**: 193 tests across 8 test files
- **Schema Elements Tested**: 21+ core definitions, 11+ block types
- **Validation Scenarios**: 50+ valid scenarios, 40+ invalid scenarios
- **Performance Benchmarks**: Multiple document sizes and complexities

## Running the Tests

### Run All Schema Tests
```bash
npm test -- test/schema/
```

### Run Specific Test Categories
```bash
# Schema structure validation
npm test -- test/schema/schema-structure.test.ts

# Required field validation
npm test -- test/schema/required-fields.test.ts

# Performance validation
npm test -- test/schema/performance.test.ts
```

### Run with Coverage
```bash
npm test -- test/schema/ --coverage
```

### Run Performance Tests Only
```bash
npm test -- test/schema/performance.test.ts
```

## Test Development Guidelines

### Adding New Tests
1. **Identify the Category**: Determine which of the 8 test categories your test belongs to
2. **Follow Naming Conventions**: Use descriptive test names that explain the specific validation being tested
3. **Include Documentation**: Add comments explaining complex test scenarios
4. **Test Both Positive and Negative Cases**: Ensure both valid and invalid inputs are tested
5. **Consider Edge Cases**: Think about boundary conditions and unusual inputs

### Test Structure Template
```typescript
describe('Category Name', () => {
  let validator: any;

  beforeAll(() => {
    validator = createValidator();
  });

  describe('Subcategory', () => {
    it('should validate expected behavior', async () => {
      // Arrange
      const testDocument = { /* test data */ };
      
      // Act
      const result = await validator.validate(testDocument);
      
      // Assert
      expect(result.isValid).toBe(true/false);
      if (!result.isValid) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });
  });
});
```

### Performance Test Guidelines
- **Use Realistic Data Sizes**: Test with documents that reflect real-world usage
- **Allow for System Variance**: Performance thresholds should account for different hardware
- **Test Scalability**: Verify that performance scales reasonably with document complexity
- **Monitor Memory Usage**: Ensure tests don't consume excessive memory

## Schema Coverage Analysis

### Core Schema Elements Tested
- ✅ XatsObject (base object with id, metadata)
- ✅ StructuralContainer (units, chapters, sections)
- ✅ SemanticText (rich text with runs)
- ✅ ContentBlock (all core block types)
- ✅ Learning objects (objectives, outcomes)
- ✅ Resources and figures
- ✅ Pathways and adaptive content
- ✅ Front/back matter structures
- ✅ CSL-JSON integration

### Block Types Tested
- ✅ Paragraph, heading, blockquote
- ✅ Lists (ordered/unordered)
- ✅ Code blocks
- ✅ Math blocks (LaTeX, MathML, AsciiMath)
- ✅ Tables
- ✅ Figures
- ✅ Placeholders (TOC, bibliography, index)
- ✅ Custom/extension blocks

### Validation Scenarios Tested
- ✅ Required field enforcement
- ✅ Type constraint validation
- ✅ Format and pattern validation
- ✅ Reference integrity
- ✅ Inheritance relationships
- ✅ External schema integration
- ✅ Performance characteristics
- ✅ Error handling and reporting

## Integration with CI/CD

The schema validation tests are integrated into the project's continuous integration pipeline:

1. **Pre-commit Hooks**: Basic validation tests run before commits
2. **CI Pipeline**: Full test suite runs on pull requests
3. **Coverage Reports**: Generated and tracked over time
4. **Performance Monitoring**: Performance regressions are detected
5. **Schema Evolution**: Tests ensure backward compatibility

## Troubleshooting

### Common Test Failures
1. **Schema Structure Changes**: Update helper functions when schema structure changes
2. **Performance Variance**: Adjust thresholds if tests fail due to system performance differences
3. **New Schema Features**: Add corresponding tests when new schema features are added
4. **External Dependencies**: Ensure external schemas (like CSL-JSON) are accessible

### Debugging Test Issues
1. **Enable Verbose Logging**: Use `--reporter=verbose` for detailed output
2. **Run Individual Tests**: Isolate failing tests with specific test filters
3. **Check Schema Changes**: Verify recent schema modifications haven't broken assumptions
4. **Review Error Messages**: Validator error messages provide clues about validation failures

## Contributing

When contributing to the schema validation tests:

1. **Follow the Test Categories**: Add tests to the appropriate category file
2. **Maintain Coverage**: Ensure new schema features have corresponding tests
3. **Update Documentation**: Update this README when adding new test categories
4. **Performance Considerations**: Add performance tests for new complex features
5. **Error Message Testing**: Verify that validation errors provide helpful messages

The schema validation test suite is crucial for maintaining the integrity and reliability of the xats schema. It ensures that the schema correctly validates documents and provides a safety net for schema evolution.