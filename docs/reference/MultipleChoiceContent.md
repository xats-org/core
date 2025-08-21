# MultipleChoiceContent Object

**Since:** v0.2.0  
**Type:** Object  
**Context:** Content structure for multiple choice assessment blocks

## Description

The `MultipleChoiceContent` object defines the structure for multiple choice and multiple response assessment items. It supports both single-answer and multiple-answer questions with comprehensive feedback, scoring, and accessibility features.

## Properties

### `question` (SemanticText, required)
The question or prompt presented to the student.

### `options` (array, required)
Array of answer options.

Each option contains:
- `id` (string, required): Unique identifier for the option
- `content` (SemanticText, required): The option text or content
- `isCorrect` (boolean, required): Whether this option is correct
- `feedback` (SemanticText, optional): Specific feedback for this option
- `partialCredit` (number, optional): Partial credit value (0-1) if selected

### `multipleCorrect` (boolean, optional)
Whether multiple options can be correct (multiple response question).

**Default:** `false` (single answer)

When `true`:
- Students can select multiple options
- Scoring can use partial credit
- Instructions should clarify how many answers to select

### `randomizeOptions` (boolean, optional)
Whether to randomize the order of options.

**Default:** `false`

### `displayMode` (string, optional)
How to display the options.

Values:
- `vertical`: Stack options vertically (default)
- `horizontal`: Arrange options horizontally
- `grid`: Arrange in a grid layout

### `numberingStyle` (string, optional)
How to label the options.

Values:
- `letters`: A, B, C, D...
- `numbers`: 1, 2, 3, 4...
- `roman`: I, II, III, IV...
- `none`: No labels

**Default:** `letters`

### `cognitive` (CognitiveMetadata, optional)
Cognitive and pedagogical metadata for the question.

See [PedagogicalMetadata](./PedagogicalMetadata.md) for details.

### `scoring` (ScoringStructure, optional)
Scoring configuration for the question.

Properties:
- `points` (number): Maximum points available
- `partialCreditStrategy` (string): How to calculate partial credit
- `negativeScoringEnabled` (boolean): Whether wrong answers deduct points

### `feedback` (FeedbackStructure, optional)
Feedback configuration for the question.

Properties:
- `immediate` (SemanticText): Shown right after answering
- `delayed` (SemanticText): Shown after assessment completion
- `hint` (SemanticText): Available before answering
- `explanation` (SemanticText): Detailed explanation of correct answer

### `accessibilitySettings` (AssessmentAccessibilitySettings, optional)
Accessibility-specific settings for this assessment item.

See [AssessmentAccessibilitySettings](./AssessmentAccessibilitySettings.md) for details.

## Example: Single Answer Question

```json
{
  "blockType": "https://xats.org/vocabularies/blocks/assessment/multipleChoice",
  "content": {
    "question": {
      "runs": [
        {
          "type": "text",
          "text": "What is the capital of France?"
        }
      ]
    },
    "options": [
      {
        "id": "opt-a",
        "content": {
          "runs": [{"type": "text", "text": "London"}]
        },
        "isCorrect": false,
        "feedback": {
          "runs": [{"type": "text", "text": "London is the capital of the United Kingdom."}]
        }
      },
      {
        "id": "opt-b",
        "content": {
          "runs": [{"type": "text", "text": "Paris"}]
        },
        "isCorrect": true,
        "feedback": {
          "runs": [{"type": "text", "text": "Correct! Paris is the capital of France."}]
        }
      },
      {
        "id": "opt-c",
        "content": {
          "runs": [{"type": "text", "text": "Berlin"}]
        },
        "isCorrect": false,
        "feedback": {
          "runs": [{"type": "text", "text": "Berlin is the capital of Germany."}]
        }
      },
      {
        "id": "opt-d",
        "content": {
          "runs": [{"type": "text", "text": "Madrid"}]
        },
        "isCorrect": false,
        "feedback": {
          "runs": [{"type": "text", "text": "Madrid is the capital of Spain."}]
        }
      }
    ],
    "multipleCorrect": false,
    "randomizeOptions": true,
    "cognitive": {
      "bloomsLevel": "remember",
      "difficulty": 1,
      "estimatedTime": "PT30S"
    },
    "scoring": {
      "points": 1
    },
    "feedback": {
      "explanation": {
        "runs": [
          {
            "type": "text",
            "text": "Paris has been the capital of France since 987 CE, serving as the political, economic, and cultural center of the country."
          }
        ]
      }
    }
  }
}
```

## Example: Multiple Response Question

```json
{
  "blockType": "https://xats.org/vocabularies/blocks/assessment/multipleChoice",
  "content": {
    "question": {
      "runs": [
        {
          "type": "text",
          "text": "Select all prime numbers from the following list:"
        }
      ]
    },
    "options": [
      {
        "id": "opt-1",
        "content": {"runs": [{"type": "text", "text": "2"}]},
        "isCorrect": true,
        "partialCredit": 0.25
      },
      {
        "id": "opt-2",
        "content": {"runs": [{"type": "text", "text": "3"}]},
        "isCorrect": true,
        "partialCredit": 0.25
      },
      {
        "id": "opt-3",
        "content": {"runs": [{"type": "text", "text": "4"}]},
        "isCorrect": false,
        "feedback": {
          "runs": [{"type": "text", "text": "4 is not prime (4 = 2 × 2)"}]
        }
      },
      {
        "id": "opt-4",
        "content": {"runs": [{"type": "text", "text": "5"}]},
        "isCorrect": true,
        "partialCredit": 0.25
      },
      {
        "id": "opt-5",
        "content": {"runs": [{"type": "text", "text": "6"}]},
        "isCorrect": false,
        "feedback": {
          "runs": [{"type": "text", "text": "6 is not prime (6 = 2 × 3)"}]
        }
      },
      {
        "id": "opt-6",
        "content": {"runs": [{"type": "text", "text": "7"}]},
        "isCorrect": true,
        "partialCredit": 0.25
      }
    ],
    "multipleCorrect": true,
    "cognitive": {
      "bloomsLevel": "understand",
      "difficulty": 2,
      "estimatedTime": "PT1M"
    },
    "scoring": {
      "points": 4,
      "partialCreditStrategy": "proportional",
      "negativeScoringEnabled": false
    }
  }
}
```

## Example: Biology Assessment with Rich Metadata

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
      "content": {
        "runs": [{"type": "text", "text": "Energy production"}]
      },
      "isCorrect": true
    },
    {
      "id": "opt-b", 
      "content": {
        "runs": [{"type": "text", "text": "Protein synthesis"}]
      },
      "isCorrect": false
    },
    {
      "id": "opt-c",
      "content": {
        "runs": [{"type": "text", "text": "DNA replication"}]
      },
      "isCorrect": false
    }
  ],
  "multipleCorrect": false,
  "cognitive": {
    "bloomsLevel": "understand",
    "difficulty": 2,
    "estimatedTime": "PT2M"
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

## Scoring Strategies

### Single Answer Questions
- Full points for correct answer
- Zero points for incorrect answer
- No partial credit

### Multiple Response Questions

**Proportional Strategy:**
- Points = (correct selections - incorrect selections) / total correct × max points
- Minimum score: 0

**All or Nothing Strategy:**
- Full points only if all correct options selected and no incorrect options
- Zero points otherwise

**Per Option Strategy:**
- Each correct selection earns partial credit
- Each incorrect selection may deduct points (if negative scoring enabled)

## Accessibility Considerations

1. **Screen Reader Support:**
   - Clear question text without relying on visual formatting
   - Option labels announced clearly
   - Feedback associated with specific options

2. **Keyboard Navigation:**
   - Tab through options
   - Space/Enter to select
   - Arrow keys for radio button groups (single answer)

3. **Visual Design:**
   - Sufficient contrast between text and background
   - Clear visual indication of selected state
   - No reliance on color alone to convey information

## Best Practices

1. **Question Writing:**
   - Clear, unambiguous question text
   - Avoid negative phrasing unless testing comprehension of negatives
   - Include "Select all that apply" for multiple response questions

2. **Option Design:**
   - Similar length and complexity across options
   - Plausible distractors based on common misconceptions
   - Avoid "all of the above" or "none of the above" unless pedagogically justified

3. **Feedback Quality:**
   - Explain why correct answers are correct
   - Address misconceptions in incorrect option feedback
   - Provide learning resources for remediation

4. **Cognitive Alignment:**
   - Match question difficulty to learning objectives
   - Use appropriate Bloom's taxonomy level
   - Consider cognitive load in question design

## Related Objects

- [AnswerOption](./AnswerOption.md) - Detailed structure for answer options
- [PedagogicalMetadata](./PedagogicalMetadata.md) - Cognitive metadata structure
- [AssessmentAccessibilitySettings](./AssessmentAccessibilitySettings.md) - Accessibility settings
- [SemanticText](./SemanticText.md) - Text content structure
- [ScoringStructure](./ScoringStructure.md) - Required for scoring configuration
- [FeedbackStructure](./FeedbackStructure.md) - Optional feedback configuration
- [ContentBlock](./ContentBlock.md) - Contains multiple choice content when blockType is multipleChoice

## Notes

- Use `multipleCorrect: true` for questions where students can select multiple correct answers (checkbox interface)
- Use `multipleCorrect: false` or omit for single-correct-answer questions (radio button interface)
- All options should have unique IDs within the question for proper scoring and feedback
- Automatic scoring works best with predetermined correct answers

## Schema Definition

View the complete schema definition at: `/schemas/0.2.0/xats.json#/definitions/MultipleChoiceContent`