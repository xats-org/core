# `ScoringStructure`

**Type:** `object`

---

## Description

Defines how an assessment item should be scored, including point values, scoring methods, attempt limits, and penalty structures. This provides comprehensive scoring configuration for various assessment types and grading strategies.

---

## Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `points` | `number` (≥0) | **Yes** | Maximum points available for this assessment. |
| `scoringMethod` | `string` (enum) | **Yes** | Method used to calculate the score: "automatic", "manual", or "hybrid". |
| `partialCredit` | `boolean` | No | Whether partial credit is awarded for partially correct answers. |
| `attempts` | `integer` (≥-1) | No | Number of attempts allowed. Use -1 for unlimited attempts. |
| `penaltyPerAttempt` | `number` (0-1) | No | Point penalty per incorrect attempt as a fraction of total points (0-1). |

---

## Usage Example

```json
{
  "points": 10,
  "scoringMethod": "automatic",
  "partialCredit": true,
  "attempts": 3,
  "penaltyPerAttempt": 0.1
}
```

---

## Related Objects

- [MultipleChoiceContent](./MultipleChoiceContent.md) - Uses scoring structure for assessment configuration
- [ShortAnswerContent](./ShortAnswerContent.md) - Uses scoring structure for assessment configuration
- [EssayPromptContent](./EssayPromptContent.md) - Uses scoring structure for assessment configuration
- [FeedbackStructure](./FeedbackStructure.md) - Works with scoring to determine appropriate feedback

---

## Notes

- **Automatic scoring** works with predetermined correct answers (multiple choice, short answer)
- **Manual scoring** requires human graders (essays, open-ended responses)
- **Hybrid scoring** combines automatic initial scoring with optional manual review
- Partial credit is particularly useful for multi-part questions or complex assessments
- Penalty systems can discourage random guessing while still allowing multiple attempts
- Unlimited attempts (-1) supports mastery-based learning approaches