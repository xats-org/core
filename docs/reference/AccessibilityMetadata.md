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

### `readingLevel` (string, optional)
Required reading comprehension level.

Uses Common European Framework of Reference (CEFR) levels: `A1`, `A2`, `B1`, `B2`, `C1`, `C2`

WCAG Reference: 3.1.5 (Reading Level - AAA)

### `timeLimits` (object, optional)
Time-related accessibility considerations.

Properties:
- `hasTimeLimit` (boolean): Whether the content has time constraints
- `allowsExtension` (boolean): Whether time limits can be extended
- `minimumTime` (string): Minimum time needed (ISO 8601 duration)
- `recommendedTime` (string): Recommended completion time

WCAG Reference: 2.2.1 (Timing Adjustable)

### `languageSupport` (object, optional)
Language and internationalization features.

Properties:
- `primaryLanguage` (string): Primary language code (ISO 639-1)
- `availableLanguages` (array): List of available language codes
- `hasGlossary` (boolean): Whether glossary/definitions are available
- `hasTranslation` (boolean): Whether translations are available

### `ariaRoles` (array, optional)
ARIA roles used in the content for screen reader navigation.

Common values: `navigation`, `main`, `complementary`, `contentinfo`, `search`, `form`, `region`

### `ariaLabels` (object, optional)
Custom ARIA labels for better screen reader experience.

Key-value pairs where keys are element identifiers and values are descriptive labels.

### `keyboardShortcuts` (array, optional)
Available keyboard shortcuts for navigation and interaction.

Each shortcut object contains:
- `key` (string): Key combination (e.g., "Ctrl+F", "Alt+N")
- `action` (string): Description of the action
- `context` (string, optional): When the shortcut is available

## Example

```json
{
  "accessibility": {
    "alternativeFormats": [
      {
        "type": "audio",
        "resourceId": "res-audio-ch1",
        "description": "Professional narration of Chapter 1"
      },
      {
        "type": "simplified-text",
        "resourceId": "res-simple-ch1",
        "description": "Chapter 1 in simplified language"
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
    "readingLevel": "B2",
    "timeLimits": {
      "hasTimeLimit": false,
      "recommendedTime": "PT30M"
    },
    "languageSupport": {
      "primaryLanguage": "en",
      "availableLanguages": ["en", "es", "fr"],
      "hasGlossary": true,
      "hasTranslation": true
    },
    "ariaRoles": ["main", "navigation"],
    "ariaLabels": {
      "main-content": "Chapter 1: Introduction to Biology",
      "nav-menu": "Chapter navigation menu"
    },
    "keyboardShortcuts": [
      {
        "key": "Alt+N",
        "action": "Navigate to next section",
        "context": "Reading mode"
      },
      {
        "key": "Alt+P",
        "action": "Navigate to previous section",
        "context": "Reading mode"
      }
    ]
  }
}
```

## Implementation Notes

### Required vs. Optional Features

While all properties are technically optional, certain combinations are recommended for different WCAG compliance levels:

**WCAG Level A (Minimum):**
- Basic alternative text for images
- Keyboard navigation support
- Clear language identification

**WCAG Level AA (Recommended):**
- Multiple alternative formats
- Comprehensive ARIA labeling
- Cognitive load indicators
- Reading level specification

**WCAG Level AAA (Enhanced):**
- Sign language versions
- Simplified text alternatives
- Extended audio descriptions
- Multiple language support

### Best Practices

1. **Progressive Enhancement:** Start with basic accessibility and add enhanced features based on user needs
2. **User Testing:** Validate with actual users of assistive technologies
3. **Regular Updates:** Keep accessibility metadata current as content changes
4. **Comprehensive Coverage:** Consider all disability types, not just visual impairments
5. **Context Awareness:** Provide appropriate metadata for the content type and target audience

## Related Objects

- [AssessmentAccessibilitySettings](./AssessmentAccessibilitySettings.md) - Specialized settings for assessments
- [XatsObject](./XatsObject.md) - Parent object that contains accessibility metadata
- [NavigationContent](./NavigationContent.md) - Navigation-specific accessibility
- [SkipNavigationContent](./SkipNavigationContent.md) - Skip navigation links

## WCAG Compliance Matrix

| Property | WCAG Success Criterion | Level |
|----------|------------------------|-------|
| alternativeFormats | 1.1.1 Non-text Content | A |
| adaptations.hasCaptions | 1.2.2 Captions | A |
| adaptations.hasTranscript | 1.2.3 Audio Description | A |
| hazards | 2.3.1 Three Flashes | A |
| timeLimits | 2.2.1 Timing Adjustable | A |
| readingLevel | 3.1.5 Reading Level | AAA |
| languageSupport | 3.1.1 Language of Page | A |
| ariaRoles | 4.1.2 Name, Role, Value | A |
| keyboardShortcuts | 2.1.1 Keyboard | A |

## Schema Definition

View the complete schema definition at: `/schemas/0.2.0/xats.json#/definitions/AccessibilityMetadata`