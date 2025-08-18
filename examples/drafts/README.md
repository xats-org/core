# Draft Examples

This directory contains xats example documents that are works-in-progress and may not validate against the current schema. These examples are excluded from automated validation tests.

## Files

- `v0.2.0-comprehensive-example.json`: A comprehensive example showcasing v0.2.0 features, but currently has validation issues due to schema mismatches. This needs to be updated to properly conform to the v0.2.0 schema structure.

## Notes

The comprehensive example was moved here because it contained:
- Incorrect `rights` structure that doesn't match the v0.2.0 schema
- Missing required `language` properties on many objects
- Titles using SemanticText objects instead of strings
- Missing required properties like `sections`, `contents`, etc.
- Pathway structures that don't match schema requirements

For a working v0.2.0 example, see the `accessibility-sample-v0.2.0.json` and `rights-management-example.json` files in the main examples directory.