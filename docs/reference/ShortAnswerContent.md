# `ShortAnswerContent`

**Type:** `object`

---

## Description

Content structure for short answer assessment blocks that require brief text, numeric, or equation responses. Supports automatic scoring for predetermined answers while maintaining flexibility for various response formats.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `question` | `SemanticText` | **Yes** | The question text presented to students. |
| `answerFormat` | `string` (enum) | **Yes** | Expected format of the answer: "text", "numeric", or "equation". |
| `cognitiveMetadata` | `CognitiveMetadata` | **Yes** | Cognitive and pedagogical metadata for the assessment item. |
| `scoring` | `ScoringStructure` | **Yes** | Defines how the assessment item should be scored. |
| `expectedAnswers` | `array` of `string`s | No | Array of acceptable answers for automatic scoring. |
| `caseSensitive` | `boolean` | No | Whether answer matching should be case sensitive (default: false). |
| `maxLength` | `integer` | No | Maximum character length for the answer input field. |
| `feedback` | `FeedbackStructure` | No | Defines feedback provided to students for the assessment item. |
| `accessibilitySettings` | `AssessmentAccessibilitySettings` | No | Accessibility settings for this assessment item. |

---

## Usage Example

```json
{
  "question": {
    "runs": [
      {
        "type": "text",
        "text": "What is the chemical formula for water?"
      }
    ]
  },
  "answerFormat": "text",
  "expectedAnswers": ["H2O", "H₂O"],
  "caseSensitive": false,
  "maxLength": 50,
  "cognitiveMetadata": {
    "bloomsLevel": "remember",
    "difficulty": 1,
    "estimatedTimeMinutes": 1
  },
  "scoring": {
    "points": 5,
    "scoringMethod": "automatic",
    "attempts": 2
  },
  "feedback": {
    "onCorrect": {
      "runs": [{"type": "text", "text": "Correct! Water's chemical formula is H₂O."}]
    },
    "onIncorrect": {
      "runs": [{"type": "text", "text": "Think about the elements that make up water molecules."}]
    }
  }
}
```

---

## Related Objects

- [SemanticText](./SemanticText.md) - Used for question text and feedback
- [CognitiveMetadata](./CognitiveMetadata.md) - Required for assessment characterization
- [ScoringStructure](./ScoringStructure.md) - Required for scoring configuration
- [FeedbackStructure](./FeedbackStructure.md) - Optional feedback configuration
- [AssessmentAccessibilitySettings](./AssessmentAccessibilitySettings.md) - Optional accessibility configuration
- [ContentBlock](./ContentBlock.md) - Contains short answer content when blockType is shortAnswer

---

## Notes

- **Text format** is suitable for word or phrase answers
- **Numeric format** should be used for mathematical calculations or numerical responses
- **Equation format** is appropriate for mathematical expressions or formulas
- Multiple expected answers allow for various correct forms (e.g., "H2O" and "H₂O")
- Case sensitivity should be disabled for most text answers unless capitalization is specifically being assessed
- Maximum length helps prevent extremely long responses and guides input field sizing