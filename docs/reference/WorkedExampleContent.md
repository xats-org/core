# `WorkedExampleContent`

**Type:** `object`  
**Introduced in:** v0.5.0  
**Block Type URI:** `https://xats.org/vocabularies/blocks/workedExample`

---

### Description

The `WorkedExampleContent` object defines step-by-step worked examples with progressive fading support and scaffolded practice problems. This content type facilitates skill acquisition and transfer by demonstrating expert problem-solving procedures through detailed solutions with gradually decreasing support levels.

Worked examples are particularly effective for teaching procedural knowledge, problem-solving strategies, and complex cognitive skills. The progressive fading system supports learners as they transition from guided practice to independent application.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `concept` | `string` | **Yes** | The skill, procedure, or concept being demonstrated |
| `problem` | [`SemanticText`](./SemanticText.md) | **Yes** | The example problem statement being solved |
| `solution` | [`Solution`](#solution) | **Yes** | Complete step-by-step solution with explanations and fading levels |
| `practiceProblems` | `array` of [`PracticeProblem`](#practiceproblem) | No | Scaffolded practice activities with progressive independence |
| `learningObjectives` | `array` of `string`s | No | Specific skills or knowledge students should acquire from this example |
| `prerequisites` | `array` of `string`s | No | Prior knowledge or skills students need before engaging with this example |
| `cognitiveLoad` | `string` | No | Complexity assessment: `"low"`, `"medium"`, `"high"`, or `"very-high"` |
| `estimatedTimeMinutes` | `number` | No | Expected time for students to work through example and practice |

---

### Nested Object Definitions

#### `Solution`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `steps` | `array` of [`SolutionStep`](#solutionstep) | **Yes** | Ordered sequence of solution steps with explanations |

#### `SolutionStep`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `number` | `number` | **Yes** | Sequential step number in the solution process |
| `action` | [`SemanticText`](./SemanticText.md) | **Yes** | What to do in this step |
| `explanation` | [`SemanticText`](./SemanticText.md) | No | Why this step is necessary and how it contributes to the solution |
| `result` | [`SemanticText`](./SemanticText.md) | No | Expected outcome after completing this step |
| `fadingLevel` | `number` | No | Level of support provided (0=full explanation, 1=partial scaffolding, 2=minimal support, 3=student completion) |
| `hints` | `array` of [`Hint`](#hint) | No | Progressive clues for student practice |

#### `Hint`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `level` | `number` | **Yes** | Hint progression level (1=general guidance, 2=specific reminder, 3=detailed explanation) |
| `hint` | [`SemanticText`](./SemanticText.md) | **Yes** | The hint content provided to students |

#### `PracticeProblem`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique identifier for the practice problem |
| `problem` | [`SemanticText`](./SemanticText.md) | **Yes** | The practice problem statement |
| `scaffoldingLevel` | `number` | No | Amount of support provided (0.0=full independence, 1.0=full scaffolding) |
| `providedSteps` | `array` of `number`s | No | Which solution steps are given to students |
| `studentCompletes` | `array` of `number`s | No | Which solution steps students must complete independently |
| `expectedSolution` | [`ExpectedSolution`](#expectedsolution) | No | Model answer for assessment and feedback |
| `difficulty` | `string` | No | Problem complexity relative to worked example: `"easier"`, `"similar"`, `"harder"`, `"transfer"` |

#### `ExpectedSolution`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `finalAnswer` | [`SemanticText`](./SemanticText.md) | **Yes** | The correct final answer or solution |
| `keySteps` | `array` of [`SemanticText`](./SemanticText.md) | No | Critical intermediate steps students should demonstrate |

---

### Example

```json
{
  "blockType": "https://xats.org/vocabularies/blocks/workedExample",
  "content": {
    "concept": "Solving Linear Equations with Variables on Both Sides",
    "problem": {
      "runs": [
        {
          "type": "text",
          "text": "Solve for x: 3x + 7 = 2x + 12"
        }
      ]
    },
    "solution": {
      "steps": [
        {
          "number": 1,
          "action": {
            "runs": [
              {
                "type": "text",
                "text": "Subtract 2x from both sides of the equation"
              }
            ]
          },
          "explanation": {
            "runs": [
              {
                "type": "text",
                "text": "We subtract 2x from both sides to collect all x terms on one side. This maintains the equality while simplifying the equation."
              }
            ]
          },
          "result": {
            "runs": [
              {
                "type": "text",
                "text": "3x - 2x + 7 = 2x - 2x + 12, which simplifies to x + 7 = 12"
              }
            ]
          },
          "fadingLevel": 0
        },
        {
          "number": 2,
          "action": {
            "runs": [
              {
                "type": "text",
                "text": "Subtract 7 from both sides of the equation"
              }
            ]
          },
          "explanation": {
            "runs": [
              {
                "type": "text",
                "text": "We subtract the constant term (7) from both sides to isolate the variable term x."
              }
            ]
          },
          "result": {
            "runs": [
              {
                "type": "text",
                "text": "x + 7 - 7 = 12 - 7, which simplifies to x = 5"
              }
            ]
          },
          "fadingLevel": 0,
          "hints": [
            {
              "level": 1,
              "hint": {
                "runs": [
                  {
                    "type": "text",
                    "text": "What operation would undo adding 7?"
                  }
                ]
              }
            },
            {
              "level": 2,
              "hint": {
                "runs": [
                  {
                    "type": "text",
                    "text": "Subtract 7 from both sides to maintain equality."
                  }
                ]
              }
            }
          ]
        },
        {
          "number": 3,
          "action": {
            "runs": [
              {
                "type": "text",
                "text": "Check the solution by substituting x = 5 back into the original equation"
              }
            ]
          },
          "explanation": {
            "runs": [
              {
                "type": "text",
                "text": "Verification ensures our solution is correct and helps build confidence in the problem-solving process."
              }
            ]
          },
          "result": {
            "runs": [
              {
                "type": "text",
                "text": "Left side: 3(5) + 7 = 15 + 7 = 22. Right side: 2(5) + 12 = 10 + 12 = 22. ✓ Solution verified!"
              }
            ]
          },
          "fadingLevel": 1
        }
      ]
    },
    "practiceProblems": [
      {
        "id": "practice-1",
        "problem": {
          "runs": [
            {
              "type": "text",
              "text": "Solve for x: 4x + 3 = 2x + 9"
            }
          ]
        },
        "scaffoldingLevel": 0.8,
        "providedSteps": [1],
        "studentCompletes": [2, 3],
        "expectedSolution": {
          "finalAnswer": {
            "runs": [
              {
                "type": "text",
                "text": "x = 3"
              }
            ]
          }
        },
        "difficulty": "similar"
      },
      {
        "id": "practice-2",
        "problem": {
          "runs": [
            {
              "type": "text",
              "text": "Solve for y: 5y - 2 = 3y + 8"
            }
          ]
        },
        "scaffoldingLevel": 0.3,
        "providedSteps": [],
        "studentCompletes": [1, 2, 3],
        "expectedSolution": {
          "finalAnswer": {
            "runs": [
              {
                "type": "text",
                "text": "y = 5"
              }
            ]
          }
        },
        "difficulty": "similar"
      }
    ],
    "learningObjectives": [
      "Apply properties of equality to solve linear equations",
      "Collect like terms on opposite sides of an equation", 
      "Verify solutions by substitution"
    ],
    "prerequisites": [
      "Basic algebraic operations",
      "Understanding of equality properties",
      "Ability to combine like terms"
    ],
    "cognitiveLoad": "medium",
    "estimatedTimeMinutes": 15
  }
}
```

---

### Usage Notes

**Pedagogical Applications:**
- Teaching mathematical procedures and algorithms
- Demonstrating scientific problem-solving methods
- Training professional decision-making processes
- Building computational thinking skills

**Progressive Fading Strategy:**
- **Level 0**: Complete worked example with full explanations (modeling)
- **Level 1**: Partial scaffolding with strategic hints (guided practice)
- **Level 2**: Minimal support requiring student completion (coached practice)
- **Level 3**: Independent practice with feedback only

**Cognitive Load Management:**
- Break complex procedures into discrete steps
- Provide both procedural and conceptual explanations
- Use consistent notation and terminology
- Sequence practice problems from high to low scaffolding

**Assessment Integration:**
- Monitor completion of practice problems
- Track which hints students access most frequently
- Assess transfer to novel problem contexts
- Evaluate explanation quality in student work

---

### Related Objects

- [`ContentBlock`](./ContentBlock.md) - Container for worked example content
- [`SemanticText`](./SemanticText.md) - Text formatting within steps and explanations
- [`LearningObjective`](./LearningObjective.md) - Can be linked to specific procedural skills
- [`MultipleChoiceContent`](./MultipleChoiceContent.md) - Can be used for practice problem assessment