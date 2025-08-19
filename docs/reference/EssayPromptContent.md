# `EssayPromptContent`

**Type:** `object`

---

## Description

Content structure for essay prompt assessment blocks that require extended written responses. Includes rubric-based scoring, word count constraints, and comprehensive feedback mechanisms for evaluating complex written work.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `question` | `SemanticText` | **Yes** | The main essay question or topic. |
| `prompt` | `SemanticText` | **Yes** | Detailed essay prompt or writing instructions providing guidance and context. |
| `rubric` | `EssayRubric` | **Yes** | Scoring rubric defining evaluation criteria and performance levels. |
| `cognitiveMetadata` | `CognitiveMetadata` | **Yes** | Cognitive and pedagogical metadata for the assessment item. |
| `scoring` | `ScoringStructure` | **Yes** | Defines how the assessment item should be scored. |
| `minWordCount` | `integer` | No | Minimum required word count for the essay response. |
| `maxWordCount` | `integer` | No | Maximum allowed word count for the essay response. |
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
        "text": "Analyze the impact of climate change on biodiversity."
      }
    ]
  },
  "prompt": {
    "runs": [
      {
        "type": "text",
        "text": "In a well-organized essay, discuss how climate change affects biodiversity at local and global scales. Include specific examples of species or ecosystems that have been impacted, and evaluate potential conservation strategies. Support your arguments with evidence from scientific literature."
      }
    ]
  },
  "minWordCount": 500,
  "maxWordCount": 1500,
  "cognitiveMetadata": {
    "bloomsLevel": "analyze",
    "difficulty": 4,
    "estimatedTimeMinutes": 45
  },
  "scoring": {
    "points": 100,
    "scoringMethod": "manual"
  },
  "rubric": {
    "criteria": [
      {
        "id": "content-knowledge",
        "name": "Content Knowledge",
        "description": {
          "runs": [{"type": "text", "text": "Demonstrates understanding of climate change and biodiversity concepts."}]
        },
        "weight": 0.4,
        "levels": [
          {
            "level": "Excellent",
            "points": 4,
            "description": {
              "runs": [{"type": "text", "text": "Shows comprehensive understanding with accurate scientific concepts and detailed examples."}]
            }
          }
        ]
      }
    ],
    "totalPoints": 100
  }
}
```

---

## Related Objects

- [SemanticText](./SemanticText.md) - Used for question text, prompt, and feedback
- [EssayRubric](./EssayRubric.md) - Required for structured evaluation
- [CognitiveMetadata](./CognitiveMetadata.md) - Required for assessment characterization
- [ScoringStructure](./ScoringStructure.md) - Required for scoring configuration
- [FeedbackStructure](./FeedbackStructure.md) - Optional feedback configuration
- [AssessmentAccessibilitySettings](./AssessmentAccessibilitySettings.md) - Optional accessibility configuration
- [ContentBlock](./ContentBlock.md) - Contains essay content when blockType is essayPrompt

---

## Notes

- The **prompt** should provide clear instructions, expectations, and context for the essay
- **Rubrics** are essential for consistent, objective evaluation of essay responses
- Word count limits help scope the assignment and guide student effort
- **Manual scoring** is typically required for essay assessments due to their complexity
- Essays assess higher-order thinking skills like analysis, synthesis, and evaluation
- Consider providing example essays or sample responses to help students understand expectations