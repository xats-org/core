# xats Vocabulary URIs

## Important: URIs are Identifiers, Not Web Resources

The xats schema uses URIs (Uniform Resource Identifiers) like `https://pub.xats.org/vocabularies/blocks/paragraph` as **identifiers** for vocabulary terms. These are NOT meant to be dereferenced as web URLs.

### Why URIs?

1. **Globally Unique**: URIs ensure that vocabulary terms are globally unique
2. **Namespaced**: The domain provides clear ownership and organization
3. **Extensible**: Third parties can create their own vocabularies with their own URI schemes
4. **Future-Proof**: If we decide to make these dereferenceable in the future, we can

### Current Vocabulary URIs

All xats vocabulary URIs use the pattern:
```
https://pub.xats.org/vocabularies/{category}/{term}
```

Categories include:
- `blocks` - Content block types (paragraph, heading, list, etc.)
- `placeholders` - Placeholder types (tableOfContents, bibliography, index)
- `triggers` - Pathway triggers (onCompletion, onAssessment)
- `pathways` - Pathway types (remedial, standard, enrichment)
- `hints` - Rendering hints (semantic, layout, prominence, etc.)
- `annotations` - Annotation types (suggestion, clarification_request, etc.)

### Important Notes

1. **These URIs do not resolve to web pages** - Attempting to visit them in a browser will result in a 404 error
2. **The domain (pub.xats.org) hosts documentation and schemas** - But not individual vocabulary term endpoints
3. **URIs must match exactly** - The schema validates against specific URI patterns
4. **Third-party extensions can use their own URI schemes** - For example: `https://example.edu/xats/vocabularies/custom/term`

### Migration from xats.org to pub.xats.org

In PR #222, all vocabulary URIs were migrated from `https://xats.org/vocabularies/` to `https://pub.xats.org/vocabularies/` for consistency with where the schemas and documentation are hosted. This is purely a naming convention change - neither the old nor new URIs resolve as web resources.