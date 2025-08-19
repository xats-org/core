# `MultipleChoiceContent`

**Type:** `object`

---

## Description

Content structure for multiple choice assessment blocks that require students to select one or more correct answers from a list of options. Supports both single-select (radio button) and multi-select (checkbox) question formats with comprehensive assessment metadata.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `question` | `SemanticText` | **Yes** | The question text presented to students. |
| `options` | `array` of option objects | **Yes** | The available answer choices for the question. Minimum 2 options required. |
| `multipleCorrect` | `boolean` | No | Whether multiple options can be correct (checkbox vs radio button interface). |
| `cognitiveMetadata` | `CognitiveMetadata` | **Yes** | Cognitive and pedagogical metadata for the assessment item. |
| `scoring` | `ScoringStructure` | **Yes** | Defines how the assessment item should be scored. |
| `feedback` | `FeedbackStructure` | No | Defines feedback provided to students for the assessment item. |
| `accessibilitySettings` | `AssessmentAccessibilitySettings` | No | Accessibility settings for this assessment item. |

### Option Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique identifier for this answer option. |
| `text` | `SemanticText` | **Yes** | The display text for this answer option. |
| `correct` | `boolean` | **Yes** | Whether this option is correct. |

---

## Usage Example

```json
{
  "question": {
    "runs": [
      {
        "type": "text",
        "text": "What is the primary function of mitochondria in cells?"
      }
    ]
  },
  "options": [
    {
      "id": "opt-a",
      "text": {
        "runs": [{"type": "text", "text": "Energy production"}]
      },
      "correct": true
    },
    {
      "id": "opt-b", 
      "text": {
        "runs": [{"type": "text", "text": "Protein synthesis"}]
      },
      "correct": false
    },
    {
      "id": "opt-c",
      "text": {
        "runs": [{"type": "text", "text": "DNA replication"}]
      },
      "correct": false
    }
  ],
  "multipleCorrect": false,
  "cognitiveMetadata": {
    "bloomsLevel": "understand",
    "difficulty": 2,
    "estimatedTimeMinutes": 2
  },
  "scoring": {
    "points": 10,
    "scoringMethod": "automatic",
    "attempts": 3
  },
  "feedback": {
    "onCorrect": {
      "runs": [{"type": "text", "text": "Correct! Mitochondria are the powerhouses of the cell."}]
    },
    "onIncorrect": {
      "runs": [{"type": "text", "text": "Not quite. Think about cellular energy production."}]
    }
  }
}
```

---

## Related Objects

- [SemanticText](./SemanticText.md) - Used for question and option text
- [CognitiveMetadata](./CognitiveMetadata.md) - Required for assessment characterization
- [ScoringStructure](./ScoringStructure.md) - Required for scoring configuration
- [FeedbackStructure](./FeedbackStructure.md) - Optional feedback configuration
- [AssessmentAccessibilitySettings](./AssessmentAccessibilitySettings.md) - Optional accessibility configuration
- [ContentBlock](./ContentBlock.md) - Contains multiple choice content when blockType is multipleChoice

---

## Notes

- Use `multipleCorrect: true` for questions where students can select multiple correct answers (checkbox interface)
- Use `multipleCorrect: false` or omit for single-correct-answer questions (radio button interface)
- All options should have unique IDs within the question for proper scoring and feedback
- Automatic scoring works best with predetermined correct answers