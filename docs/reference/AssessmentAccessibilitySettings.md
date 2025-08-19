# AssessmentAccessibilitySettings Object

**Since:** v0.2.0  
**Type:** Object  
**Context:** Used within assessment content blocks to provide accessibility-specific settings

## Description

The `AssessmentAccessibilitySettings` object provides specialized accessibility configurations for assessment items, ensuring equitable testing conditions for all students. These settings go beyond general content accessibility to address the unique challenges of assessment scenarios.

## Properties

### `extendedTime` (object, optional)
Time accommodation settings for students who need additional time.

Properties:
- `multiplier` (number): Factor by which to extend time (e.g., 1.5 for 50% extra time)
- `unlimited` (boolean): Whether to allow unlimited time
- `pauseAllowed` (boolean): Whether students can pause and resume

**WCAG Reference:** 2.2.1 (Timing Adjustable), 2.2.6 (Timeouts)

### `responseFormat` (object, optional)
Alternative response format options.

Properties:
- `allowOralResponse` (boolean): Accept spoken answers instead of written
- `allowDrawing` (boolean): Accept drawn/sketched responses
- `allowTyping` (boolean): Allow typing instead of handwriting
- `allowDictation` (boolean): Accept dictated responses

### `presentationOptions` (object, optional)
Content presentation modifications.

Properties:
- `fontSize` (string): `small`, `medium`, `large`, `extra-large`
- `contrast` (string): `normal`, `high`, `inverted`
- `spacing` (string): `normal`, `increased`, `double`
- `font` (string): Font family preference (e.g., "OpenDyslexic", "sans-serif")

### `allowKeyboardOnly` (boolean, optional)
Whether the assessment can be completed using only keyboard navigation.

**Default:** `true`  
**WCAG Reference:** 2.1.1 (Keyboard)

### `screenReaderOptimized` (boolean, optional)
Whether the assessment has been optimized for screen reader users.

Optimizations include:
- Logical reading order
- Proper heading structure
- Descriptive labels for all interactive elements
- Clear instructions without relying on visual cues

**Default:** `true`  
**WCAG Reference:** 4.1.2 (Name, Role, Value), 4.1.3 (Status Messages)

### `colorIndependent` (boolean, optional)
Whether the assessment can be understood without color perception.

**Default:** `true`  
**WCAG Reference:** 1.4.1 (Use of Color)

### `motionIndependent` (boolean, optional)
Whether the assessment avoids requiring precise movements or gestures.

**Default:** `true`  
**WCAG Reference:** 2.5.1 (Pointer Gestures)

### `cognitiveSupports` (object, optional)
Cognitive accessibility accommodations.

Properties:
- `allowCalculator` (boolean): Permit calculator use
- `allowSpellCheck` (boolean): Enable spell checking
- `allowFormulaSheet` (boolean): Provide formula reference sheet
- `allowHighlighting` (boolean): Enable text highlighting tools
- `simplifiedLanguage` (boolean): Use simplified language version
- `chunkedPresentation` (boolean): Present questions one at a time

### `alternativeFormats` (array, optional)
Alternative assessment format options.

Values: `braille`, `large-print`, `audio`, `tactile-graphics`, `sign-language`

### `navigationSupports` (object, optional)
Navigation assistance features.

Properties:
- `allowReview` (boolean): Permit reviewing previous answers
- `showProgress` (boolean): Display progress indicator
- `allowBookmarks` (boolean): Enable bookmarking questions
- `providesWarnings` (boolean): Warn before submission or timeout

## Example

```json
{
  "assessmentAccessibilitySettings": {
    "extendedTime": {
      "multiplier": 1.5,
      "unlimited": false,
      "pauseAllowed": true
    },
    "responseFormat": {
      "allowOralResponse": true,
      "allowDrawing": false,
      "allowTyping": true,
      "allowDictation": true
    },
    "presentationOptions": {
      "fontSize": "large",
      "contrast": "high",
      "spacing": "increased",
      "font": "OpenDyslexic"
    },
    "allowKeyboardOnly": true,
    "screenReaderOptimized": true,
    "colorIndependent": true,
    "motionIndependent": true,
    "cognitiveSupports": {
      "allowCalculator": true,
      "allowSpellCheck": false,
      "allowFormulaSheet": true,
      "allowHighlighting": true,
      "simplifiedLanguage": false,
      "chunkedPresentation": true
    },
    "alternativeFormats": ["large-print", "audio"],
    "navigationSupports": {
      "allowReview": true,
      "showProgress": true,
      "allowBookmarks": true,
      "providesWarnings": true
    }
  }
}
```

## Implementation Guidelines

### Required vs. Optional Accommodations

1. **Always Required** (for WCAG AA compliance):
   - Keyboard accessibility
   - Screen reader compatibility
   - Color independence
   - Time adjustability options

2. **Context-Dependent**:
   - Calculator/spell check (based on assessment goals)
   - Alternative response formats (based on construct being measured)
   - Cognitive supports (based on student needs)

### Validation Considerations

When an assessment includes these settings, renderers should:

1. **Verify compatibility** between requested accommodations and assessment content
2. **Log accommodation usage** for compliance tracking
3. **Preserve construct validity** - ensure accommodations don't compromise what's being measured
4. **Apply consistently** across all questions in an assessment

## Legal Compliance

These settings support compliance with:

- **ADA (Americans with Disabilities Act)**
- **Section 504 of the Rehabilitation Act**
- **IDEA (Individuals with Disabilities Education Act)**
- **WCAG 2.1 Level AA** standards

## Best Practices

1. **Design for maximum accessibility by default** - don't rely solely on accommodations
2. **Test with actual assistive technologies** before deployment
3. **Document which accommodations may affect scoring or interpretation**
4. **Provide clear instructions** about available accommodations
5. **Train instructors** on appropriate accommodation selection
6. **Regular review** of accommodation effectiveness

## Related Objects

- [MultipleChoiceContent](./MultipleChoiceContent.md) - Assessment type that uses these settings
- [ShortAnswerContent](./ShortAnswerContent.md) - Assessment type that uses these settings  
- [EssayPromptContent](./EssayPromptContent.md) - Assessment type that uses these settings
- [AccessibilityMetadata](./AccessibilityMetadata.md) - General accessibility metadata

## Schema Definition

View the complete schema definition at: `/schemas/0.2.0/xats.json#/definitions/AssessmentAccessibilitySettings`