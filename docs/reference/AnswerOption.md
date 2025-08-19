# AnswerOption Object

**Since:** v0.2.0  
**Type:** Object  
**Context:** Used within MultipleChoiceContent to define individual answer options

## Description

The `AnswerOption` object represents a single answer choice in a multiple choice or multiple response assessment item. Each option contains the content to display, correctness information, feedback, and optional scoring details.

## Properties

### `id` (string, required)
Unique identifier for the answer option within the question.

**Format:** Any unique string within the question scope  
**Examples:** `"opt-a"`, `"option-1"`, `"answer-uuid-123"`

### `content` (SemanticText, required)
The text or rich content of the answer option.

Can include:
- Plain text
- Mathematical expressions
- Images
- Formatted text with emphasis or links
- Any valid SemanticText runs

### `isCorrect` (boolean, required)
Whether this option is a correct answer.

- For single-answer questions: Only one option should be `true`
- For multiple-response questions: Multiple options can be `true`

### `feedback` (SemanticText, optional)
Specific feedback for when this option is selected.

Best practices:
- For correct answers: Reinforce why it's correct
- For incorrect answers: Explain the misconception
- Keep feedback constructive and educational

### `explanation` (SemanticText, optional)
Detailed explanation of why this option is correct or incorrect.

Provides deeper understanding beyond immediate feedback, often used in review modes or detailed explanations.

### `partialCredit` (number, optional)
Partial credit value if this option is selected.

**Range:** 0.0 to 1.0  
**Default:** 1.0 for correct answers, 0.0 for incorrect

Used in multiple-response questions to award partial points for partially correct selections.

### `metadata` (object, optional)
Additional metadata for analytics or specialized rendering.

Common uses:
- `distractorType`: Classification of incorrect answer type
- `commonMisconception`: The misconception this distractor addresses
- `selectionFrequency`: Historical data on how often selected

## Example: Simple Text Options

```json
{
  "options": [
    {
      "id": "opt-a",
      "content": {
        "runs": [
          {"type": "text", "text": "Mitochondria"}
        ]
      },
      "isCorrect": true,
      "feedback": {
        "runs": [
          {"type": "text", "text": "Correct! Mitochondria are known as the powerhouse of the cell."}
        ]
      }
    },
    {
      "id": "opt-b",
      "content": {
        "runs": [
          {"type": "text", "text": "Nucleus"}
        ]
      },
      "isCorrect": false,
      "feedback": {
        "runs": [
          {"type": "text", "text": "The nucleus controls cell activities but doesn't produce energy."}
        ]
      }
    }
  ]
}
```

## Example: Rich Content Options with Detailed Explanations

```json
{
  "options": [
    {
      "id": "opt-1",
      "content": {
        "runs": [
          {"type": "text", "text": "The equation "},
          {"type": "math", "tex": "E = mc^2"},
          {"type": "text", "text": " describes mass-energy equivalence"}
        ]
      },
      "isCorrect": true,
      "partialCredit": 1.0,
      "feedback": {
        "runs": [
          {"type": "text", "text": "Correct! This is Einstein's famous mass-energy equivalence equation."}
        ]
      },
      "explanation": {
        "runs": [
          {"type": "text", "text": "Einstein's equation E=mc² demonstrates that mass and energy are interchangeable. The equation shows that a small amount of mass (m) can be converted into a tremendous amount of energy (E) when multiplied by the speed of light squared (c²)."}
        ]
      }
    },
    {
      "id": "opt-2",
      "content": {
        "runs": [
          {"type": "text", "text": "The equation "},
          {"type": "math", "tex": "F = ma"},
          {"type": "text", "text": " describes mass-energy equivalence"}
        ]
      },
      "isCorrect": false,
      "feedback": {
        "runs": [
          {"type": "text", "text": "This is Newton's second law of motion, not Einstein's mass-energy equation."}
        ]
      },
      "explanation": {
        "runs": [
          {"type": "text", "text": "F = ma is Newton's second law of motion, which relates force (F) to mass (m) and acceleration (a). While it involves mass, it describes mechanical motion rather than the equivalence between mass and energy."}
        ]
      },
      "metadata": {
        "distractorType": "formula-confusion",
        "commonMisconception": "confusing-physics-equations"
      }
    }
  ]
}
```

## Example: Biology Assessment with Comprehensive Feedback

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

## Example: Partial Credit in Multiple Response

```json
{
  "multipleCorrect": true,
  "options": [
    {
      "id": "factor-2",
      "content": {"runs": [{"type": "text", "text": "2"}]},
      "isCorrect": true,
      "partialCredit": 0.33
    },
    {
      "id": "factor-3",
      "content": {"runs": [{"type": "text", "text": "3"}]},
      "isCorrect": true,
      "partialCredit": 0.33
    },
    {
      "id": "factor-4",
      "content": {"runs": [{"type": "text", "text": "4"}]},
      "isCorrect": false,
      "partialCredit": 0
    },
    {
      "id": "factor-6",
      "content": {"runs": [{"type": "text", "text": "6"}]},
      "isCorrect": true,
      "partialCredit": 0.34
    }
  ]
}
```

## Distractor Design Best Practices

### Effective Distractors Should Be:
1. **Plausible:** Based on common errors or misconceptions
2. **Similar in Length:** Avoid making correct answers obviously longer/shorter
3. **Grammatically Consistent:** All options should fit grammatically with the question
4. **Homogeneous:** Similar in content and structure
5. **Free from Clues:** Avoid absolute terms like "always" or "never" unless appropriate

### Common Distractor Types:
- **Computational Errors:** Result from common calculation mistakes
- **Conceptual Confusion:** Mix up related but distinct concepts
- **Partial Understanding:** Incomplete application of principles
- **Overgeneralization:** Applying rules beyond their scope
- **Common Misconceptions:** Based on typical student misunderstandings

## Accessibility Considerations

1. **Screen Reader Compatibility:**
   - Options should make sense when read aloud
   - Don't rely on visual positioning or formatting
   - Mathematical expressions should have proper alt text

2. **Visual Clarity:**
   - Sufficient spacing between options
   - Clear visual indicators for selection state
   - High contrast between text and background

3. **Cognitive Accessibility:**
   - Clear, concise language
   - Avoid unnecessarily complex vocabulary
   - Consider providing definitions for technical terms

## Implementation Notes

### Option Ordering:
- When `randomizeOptions` is false, maintain authored order
- When true, shuffle options but keep logical groups together
- Consider fixing position of "None of the above" type options

### Scoring Calculations:
- **Single Answer:** Full points for correct, zero for incorrect
- **Multiple Response with Partial Credit:** Sum of partial credits for correct selections minus penalties for incorrect selections
- **Minimum Score:** Usually capped at zero (no negative scores)

## Related Objects

- [MultipleChoiceContent](./MultipleChoiceContent.md) - Parent container for answer options
- [SemanticText](./SemanticText.md) - Content structure for option text
- [FeedbackStructure](./FeedbackStructure.md) - Detailed feedback configuration

## Schema Definition

The AnswerOption is defined inline within MultipleChoiceContent. View at: `/schemas/0.2.0/xats.json#/definitions/MultipleChoiceContent/properties/options`