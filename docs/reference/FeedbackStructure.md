# `FeedbackStructure`

**Type:** `object`

---

## Description

Defines the feedback provided to students for assessment items, including immediate responses, outcome-specific feedback, hints, and detailed explanations. This supports comprehensive learning through targeted instructional feedback.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `immediate` | `SemanticText` | No | Feedback shown immediately after answering, regardless of correctness. |
| `onCorrect` | `SemanticText` | No | Feedback shown when the answer is correct. |
| `onIncorrect` | `SemanticText` | No | Feedback shown when the answer is incorrect. |
| `onPartial` | `SemanticText` | No | Feedback shown when partial credit is earned. |
| `hints` | `array` of hint objects | No | Array of progressive hints available to students. |
| `explanations` | `array` of explanation objects | No | Detailed explanations for each answer option (for multiple choice). |

### Hint Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique identifier for the hint. |
| `text` | `SemanticText` | **Yes** | The hint content displayed to students. |
| `pointPenalty` | `number` (≥0) | No | Points deducted for using this hint. |

### Explanation Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `optionId` | `string` | **Yes** | ID of the answer option this explanation applies to. |
| `explanation` | `SemanticText` | **Yes** | Detailed explanation for why this option is correct or incorrect. |

---

## Usage Example

```json
{
  "immediate": {
    "runs": [{"type": "text", "text": "Thank you for your response."}]
  },
  "onCorrect": {
    "runs": [{"type": "text", "text": "Excellent! You correctly identified the primary function of mitochondria."}]
  },
  "onIncorrect": {
    "runs": [{"type": "text", "text": "Not quite. Think about where cellular energy production occurs."}]
  },
  "hints": [
    {
      "id": "hint-1",
      "text": {
        "runs": [{"type": "text", "text": "Consider what 'powerhouse of the cell' refers to."}]
      },
      "pointPenalty": 1
    }
  ],
  "explanations": [
    {
      "optionId": "opt-a",
      "explanation": {
        "runs": [{"type": "text", "text": "Correct! Mitochondria are responsible for cellular energy production through ATP synthesis."}]
      }
    }
  ]
}
```

---

## Related Objects

- [MultipleChoiceContent](./MultipleChoiceContent.md) - Uses feedback structure for student responses
- [ShortAnswerContent](./ShortAnswerContent.md) - Uses feedback structure for student responses
- [EssayPromptContent](./EssayPromptContent.md) - Uses feedback structure for student responses
- [SemanticText](./SemanticText.md) - Used for all feedback text content
- [ScoringStructure](./ScoringStructure.md) - Works with feedback to provide complete assessment experience

---

## Notes

- Feedback should be constructive and educational, not just correctness indicators
- Progressive hints allow students to work through problems with scaffolded support
- Explanation arrays are particularly valuable for multiple choice questions to address common misconceptions
- Point penalties for hints encourage independent problem-solving while still providing support
- Immediate feedback can provide encouragement regardless of answer correctness