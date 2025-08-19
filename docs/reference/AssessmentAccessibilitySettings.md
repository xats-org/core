# AssessmentAccessibilitySettings

**Type:** `object`

Specialized accessibility settings for assessment items to ensure WCAG compliance and equitable testing conditions.

## Properties

### `allowedTime` (optional)
- **Type:** `integer`
- **Description:** Maximum time allowed for this assessment in seconds.

### `timeExtensionFactor` (optional)
- **Type:** `number`
- **Minimum:** 1.0
- **Description:** Multiplier for extended time (e.g., 1.5 for time-and-a-half).

### `keyboardAccessible` (optional)
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Whether the assessment can be completed with keyboard only (WCAG 2.1.1).

### `screenReaderCompatible` (optional)
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Whether the assessment works with screen reader technology.

### `alternativeFormats` (optional)
- **Type:** `array` of `string`
- **Description:** Available alternative formats (e.g., "large-print", "braille", "audio").

### `readAloudSupport` (optional)
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Whether text-to-speech is available for this assessment.

### `simplifiedLanguage` (optional)
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Whether a simplified language version is available.

## Usage Example

```json
{
  "allowedTime": 300,
  "timeExtensionFactor": 1.5,
  "keyboardAccessible": true,
  "screenReaderCompatible": true,
  "alternativeFormats": ["large-print", "audio"],
  "readAloudSupport": true,
  "simplifiedLanguage": false
}
```

## Related Objects
- [MultipleChoiceContent](./MultipleChoiceContent.md)
- [AccessibilityMetadata](./AccessibilityMetadata.md)