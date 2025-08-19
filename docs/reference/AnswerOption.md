# AnswerOption

**Type:** `object`

Represents a single answer option in a multiple choice assessment question.

## Properties

### `id` (required)
- **Type:** `string`
- **Description:** Unique identifier for this answer option.

### `content` (required)
- **Type:** `SemanticText`
- **Description:** The text content of this answer option.

### `isCorrect` (required)
- **Type:** `boolean`
- **Description:** Whether this option is the correct answer.

### `feedback` (optional)
- **Type:** `SemanticText`
- **Description:** Specific feedback shown when this option is selected.

### `explanation` (optional)
- **Type:** `SemanticText`
- **Description:** Detailed explanation of why this option is correct or incorrect.

## Usage Example

```json
{
  "id": "opt-correct",
  "content": {
    "runs": [
      {
        "type": "text",
        "text": "Adenosine triphosphate (ATP)",
        "language": "en-US"
      }
    ]
  },
  "isCorrect": true,
  "feedback": {
    "runs": [
      {
        "type": "text", 
        "text": "Correct! ATP is the primary energy currency of cells."
      }
    ]
  },
  "explanation": {
    "runs": [
      {
        "type": "text",
        "text": "Mitochondria produce ATP through cellular respiration, converting glucose and oxygen into usable energy for cellular processes."
      }
    ]
  }
}
```

## Related Objects
- [MultipleChoiceContent](./MultipleChoiceContent.md)
- [SemanticText](./SemanticText.md)