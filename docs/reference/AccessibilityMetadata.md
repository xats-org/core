# AccessibilityMetadata Object

**Since:** v0.2.0  
**Type:** Object  
**Context:** Used within any `XatsObject` to provide accessibility-specific metadata

## Description

The `AccessibilityMetadata` object provides comprehensive accessibility information for content elements, ensuring WCAG compliance and supporting diverse learner needs. This metadata helps renderers and assistive technologies present content appropriately for users with various disabilities.

## Properties

### `alternativeFormats` (array, optional)
Alternative representations of the content for different accessibility needs.

Each format object contains:
- `type` (string, required): Format type (`audio`, `braille`, `large-print`, `sign-language`, `simplified-text`, `tactile`)
- `resourceId` (string, optional): Reference to a resource containing the alternative format
- `description` (string, optional): Human-readable description of the alternative format

### `adaptations` (object, optional)
Content adaptations available for different needs.

Properties:
- `hasAudioDescription` (boolean): Audio descriptions for visual content
- `hasSignLanguage` (boolean): Sign language interpretation available
- `hasTranscript` (boolean): Text transcript for audio/video content  
- `hasCaptions` (boolean): Captions for audio content
- `hasExtendedDescription` (boolean): Extended descriptions beyond alt text
- `hasSimplifiedVersion` (boolean): Simplified language version available
- `hasTactileRepresentation` (boolean): Tactile graphics or 3D models available

### `cognitiveLoad` (string, optional)
Cognitive complexity level: `low`, `medium`, `high`

Helps identify content that may require additional cognitive processing or support.

### `interactionModes` (array, optional)
Supported interaction methods.

Values: `visual`, `auditory`, `tactile`, `keyboard-only`, `voice`, `gesture`, `eye-tracking`

### `hazards` (array, optional)
Potential accessibility hazards in the content.

Values: `flashing`, `motion-simulation`, `sound`, `cognitive-overload`, `physical-strain`

WCAG Reference: 2.3.1 (Three Flashes or Below Threshold)

### `supportTools` (array, optional)
Assistive technology compatibility information.

Each tool object contains:
- `name` (string, required): Tool name (e.g., "JAWS", "NVDA", "Dragon")
- `minVersion` (string, optional): Minimum compatible version
- `notes` (string, optional): Compatibility notes or known issues

### `timeRequirements` (object, optional)
Time-related accessibility considerations.

Properties:
- `typicalDuration` (string, ISO 8601): Expected completion time
- `extendedTimeMultiplier` (number): Recommended time extension factor (e.g., 1.5 for 50% extra time)
- `untimed` (boolean): Whether time limits can be completely removed

WCAG Reference: 2.2.1 (Timing Adjustable)

### `languageComplexity` (object, optional)
Language complexity metrics for readability assessment.

Properties:
- `readingLevel` (string): Grade level or CEFR level
- `technicalTermsDensity` (string): `low`, `medium`, `high`
- `sentenceComplexity` (string): `simple`, `moderate`, `complex`

## Example

```json
{
  "accessibilityMetadata": {
    "alternativeFormats": [
      {
        "type": "audio",
        "resourceId": "audio-narration-001",
        "description": "Professional narration of the text content"
      },
      {
        "type": "simplified-text",
        "resourceId": "simplified-version-001",
        "description": "Simplified language version for cognitive accessibility"
      }
    ],
    "adaptations": {
      "hasAudioDescription": true,
      "hasTranscript": true,
      "hasCaptions": true,
      "hasSimplifiedVersion": true
    },
    "cognitiveLoad": "medium",
    "interactionModes": ["visual", "auditory", "keyboard-only"],
    "hazards": [],
    "supportTools": [
      {
        "name": "NVDA",
        "minVersion": "2023.1",
        "notes": "Fully compatible with all interactive elements"
      }
    ],
    "timeRequirements": {
      "typicalDuration": "PT15M",
      "extendedTimeMultiplier": 1.5,
      "untimed": true
    },
    "languageComplexity": {
      "readingLevel": "Grade 10",
      "technicalTermsDensity": "low",
      "sentenceComplexity": "moderate"
    }
  }
}
```

## WCAG Compliance

This metadata structure supports compliance with multiple WCAG 2.1 AA and AAA success criteria:

- **1.1.1 Non-text Content**: Alternative formats provide text alternatives
- **1.2.1 Audio-only and Video-only**: Transcript and audio description support
- **1.2.2 Captions**: Caption availability tracking
- **1.2.5 Audio Description**: Audio description support
- **2.2.1 Timing Adjustable**: Time requirement specifications
- **2.3.1 Three Flashes**: Hazard warnings for photosensitive content
- **3.1.5 Reading Level**: Language complexity metrics

## Best Practices

1. **Always provide alternative formats** when content is primarily visual or auditory
2. **Specify cognitive load** for complex technical content
3. **List all hazards** even if mitigations are in place
4. **Test with actual assistive technologies** listed in supportTools
5. **Consider multiple disabilities** - content should be accessible to users with combined vision, hearing, motor, and cognitive disabilities
6. **Update regularly** as assistive technology compatibility changes

## Related Objects

- [AssessmentAccessibilitySettings](./AssessmentAccessibilitySettings.md) - Specific settings for assessment items
- [XatsObject](./XatsObject.md) - Parent object that contains AccessibilityMetadata
- [Resource](./Resource.md) - Referenced by alternativeFormats

## Schema Definition

View the complete schema definition at: `/schemas/0.2.0/xats.json#/definitions/AccessibilityMetadata`