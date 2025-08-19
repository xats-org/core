# `CognitiveMetadata`

**Type:** `object`

---

## Description

Cognitive and pedagogical metadata that provides information about the learning characteristics and requirements of assessment items. This metadata helps educators and systems understand the cognitive demands, difficulty level, and educational context of assessments.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `bloomsLevel` | `string` (enum) | **Yes** | Bloom's taxonomy cognitive level: "remember", "understand", "apply", "analyze", "evaluate", or "create". |
| `difficulty` | `integer` (1-5) | **Yes** | Difficulty level from 1 (easiest) to 5 (hardest). |
| `estimatedTimeMinutes` | `integer` (≥1) | **Yes** | Estimated completion time in minutes. |
| `cognitiveLoad` | `string` (enum) | No | Expected cognitive load level: "low", "medium", or "high". |
| `prerequisites` | `array` of `string`s | No | Array of prerequisite learning objective IDs required before attempting this assessment. |

---

## Usage Example

```json
{
  "bloomsLevel": "apply",
  "difficulty": 3,
  "estimatedTimeMinutes": 5,
  "cognitiveLoad": "medium",
  "prerequisites": ["obj-basic-algebra", "obj-linear-equations"]
}
```

---

## Related Objects

- [MultipleChoiceContent](./MultipleChoiceContent.md) - Uses cognitive metadata for assessment characterization
- [ShortAnswerContent](./ShortAnswerContent.md) - Uses cognitive metadata for assessment characterization
- [EssayPromptContent](./EssayPromptContent.md) - Uses cognitive metadata for assessment characterization
- [LearningObjective](./LearningObjective.md) - Referenced in prerequisites array

---

## Notes

- Bloom's taxonomy levels progress from lower-order thinking (remember, understand) to higher-order thinking (analyze, evaluate, create)
- Difficulty ratings should be consistent within a course or learning context
- Estimated time helps students plan their study sessions and helps instructors design appropriate assessments
- Cognitive load information supports adaptive learning systems and accessibility considerations