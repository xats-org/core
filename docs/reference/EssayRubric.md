# `EssayRubric`

**Type:** `object`

---

## Description

A scoring rubric for essay assessments that defines evaluation criteria and performance levels. Rubrics provide structured, objective frameworks for assessing complex written responses while ensuring consistency and transparency in grading.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `criteria` | `array` of criterion objects | **Yes** | Array of scoring criteria that define different aspects of essay evaluation. |
| `totalPoints` | `number` (≥0) | **Yes** | Total points available across all criteria. |

### Criterion Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique identifier for this criterion. |
| `name` | `string` | **Yes** | Display name for the criterion (e.g., "Content Quality", "Organization"). |
| `description` | `SemanticText` | **Yes** | Detailed description of what this criterion evaluates. |
| `weight` | `number` (0-1) | **Yes** | Relative weight of this criterion as a fraction of the total score. |
| `levels` | `array` of level objects | **Yes** | Performance levels for this criterion (e.g., Excellent, Good, Fair, Poor). |

### Level Object Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `level` | `string` | **Yes** | Name of the performance level (e.g., "Excellent", "Proficient"). |
| `points` | `number` | **Yes** | Points awarded for achieving this level. |
| `description` | `SemanticText` | **Yes** | Detailed description of what constitutes this performance level. |

---

## Usage Example

```json
{
  "criteria": [
    {
      "id": "content-quality",
      "name": "Content Quality",
      "description": {
        "runs": [{"type": "text", "text": "Accuracy, depth, and relevance of content and ideas presented."}]
      },
      "weight": 0.4,
      "levels": [
        {
          "level": "Excellent",
          "points": 4,
          "description": {
            "runs": [{"type": "text", "text": "Content is highly accurate, demonstrates deep understanding, and directly addresses the prompt with relevant, well-developed ideas."}]
          }
        },
        {
          "level": "Good",
          "points": 3,
          "description": {
            "runs": [{"type": "text", "text": "Content is mostly accurate with good understanding and addresses the prompt with relevant ideas."}]
          }
        }
      ]
    },
    {
      "id": "organization",
      "name": "Organization",
      "description": {
        "runs": [{"type": "text", "text": "Logical structure, clear transitions, and effective presentation of ideas."}]
      },
      "weight": 0.3,
      "levels": [
        {
          "level": "Excellent",
          "points": 4,
          "description": {
            "runs": [{"type": "text", "text": "Essay has clear introduction, body, and conclusion with smooth transitions and logical flow."}]
          }
        }
      ]
    }
  ],
  "totalPoints": 20
}
```

---

## Related Objects

- [EssayPromptContent](./EssayPromptContent.md) - Uses essay rubrics for scoring guidance
- [SemanticText](./SemanticText.md) - Used for all descriptive text in the rubric
- [ScoringStructure](./ScoringStructure.md) - Works with rubrics for comprehensive essay assessment

---

## Notes

- Criterion weights should sum to 1.0 to ensure proper score calculation
- Performance levels should be clearly differentiated and consistently applied
- Rubrics support both formative and summative assessment of student writing
- Detailed level descriptions help ensure consistent grading across multiple evaluators
- Rubrics should be shared with students before assignment completion for transparency