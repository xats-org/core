# `ThinkPairShareContent`

**Type:** `object`  
**Introduced in:** v0.5.0  
**Block Type URI:** `https://xats.org/vocabularies/blocks/thinkPairShare`

---

### Description

The `ThinkPairShareContent` object defines structured collaborative learning activities that implement the Think-Pair-Share pedagogy. This three-phase approach promotes active engagement and peer learning through individual reflection, peer discussion, and whole-class sharing phases.

Think-Pair-Share activities are particularly effective for increasing student participation, surfacing diverse perspectives, encouraging critical thinking, and building classroom community through structured peer interaction.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `prompt` | [`SemanticText`](./SemanticText.md) | **Yes** | Central question, scenario, or problem that drives the activity |
| `context` | [`SemanticText`](./SemanticText.md) | No | Background information to situate the prompt and provide necessary context |
| `thinkPhase` | [`ThinkPhase`](#thinkphase) | **Yes** | Individual reflection phase configuration |
| `pairPhase` | [`PairPhase`](#pairphase) | **Yes** | Peer discussion phase configuration |
| `sharePhase` | [`SharePhase`](#sharephase) | **Yes** | Whole-class sharing phase configuration |
| `assessmentIntegration` | [`AssessmentIntegration`](#assessmentintegration) | No | Formative assessment and feedback mechanisms |
| `learningObjectives` | `array` of `string`s | No | Specific skills or knowledge students should develop through this activity |
| `totalDuration` | `string` | No | Total expected time in ISO 8601 duration format (e.g., `"PT15M"` for 15 minutes) |
| `classSize` | [`ClassSize`](#classsize) | No | Optimal class size parameters for the activity |
| `adaptations` | `array` of [`Adaptation`](#adaptation) | No | Modifications for different contexts (online, large classes, etc.) |

---

### Nested Object Definitions

#### `ThinkPhase`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `duration` | `string` | **Yes** | Time allocation in ISO 8601 format (e.g., `"PT3M"` for 3 minutes) |
| `instructions` | [`SemanticText`](./SemanticText.md) | **Yes** | Clear directions for individual reflection |
| `scaffolding` | `array` of [`Scaffolding`](#scaffolding) | No | Support structures to guide student thinking |
| `responseFormat` | `string` | No | Expected format for student responses: `"notes"`, `"bullet-points"`, `"sketch"`, `"concept-map"`, or `"free-form"` |

#### `PairPhase`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `duration` | `string` | **Yes** | Time allocation in ISO 8601 format |
| `instructions` | [`SemanticText`](./SemanticText.md) | **Yes** | Guidance for structured peer discussion |
| `pairingStrategy` | `string` | No | How pairs are formed: `"proximity"`, `"random"`, `"strategic"`, `"self-select"`, or `"instructor-assigned"` |
| `discussionPrompts` | `array` of [`SemanticText`](./SemanticText.md) | No | Specific questions to guide pair conversations |
| `recordResponse` | `boolean` | No | Whether pairs should document their discussion outcomes |
| `responseFormat` | `string` | No | Expected format for pair output: `"consensus"`, `"key-points"`, `"questions"`, `"action-items"`, or `"summary"` |

#### `SharePhase`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `duration` | `string` | **Yes** | Time allocation in ISO 8601 format |
| `format` | `string` | **Yes** | Sharing structure: `"volunteer"`, `"cold-call"`, `"round-robin"`, `"gallery-walk"`, or `"simultaneous"` |
| `instructions` | [`SemanticText`](./SemanticText.md) | **Yes** | Guidelines for class-wide sharing |
| `synthesis` | [`Synthesis`](#synthesis) | No | Methods for consolidating shared insights |
| `captureMethod` | `string` | No | How insights are recorded: `"board"`, `"digital"`, `"notes"`, or `"audio"` |

#### `Scaffolding`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` | **Yes** | Type of support: `"guiding-question"`, `"sentence-starter"`, `"example"`, `"framework"`, or `"reminder"` |
| `content` | [`SemanticText`](./SemanticText.md) | **Yes** | The scaffolding content provided to students |

#### `Synthesis`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `activity` | `string` | **Yes** | Method for organizing insights: `"categorization"`, `"prioritization"`, `"consensus"`, `"debate"`, or `"summary"` |
| `instructions` | [`SemanticText`](./SemanticText.md) | **Yes** | Directions for synthesis activity |

#### `AssessmentIntegration`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `formativeAssessment` | [`FormativeAssessment`](#formativeassessment) | No | Real-time learning checks and feedback |

#### `FormativeAssessment`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `checkUnderstanding` | `array` of `string`s | No | Skills or concepts being assessed during the activity |
| `feedbackMethod` | `string` | No | How feedback is provided: `"immediate"`, `"delayed"`, `"peer"`, or `"self-reflection"` |

#### `ClassSize`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `minimum` | `number` | No | Minimum number of students for effective implementation |
| `maximum` | `number` | No | Maximum class size before modifications are needed |
| `optimal` | `number` | No | Ideal class size for this specific activity |

#### `Adaptation`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `context` | `string` | **Yes** | Situation requiring modification: `"online"`, `"large-class"`, `"small-class"`, `"limited-time"`, or `"accessibility"` |
| `modification` | [`SemanticText`](./SemanticText.md) | **Yes** | Specific changes to implement for this context |

---

### Example

```json
{
  "blockType": "https://xats.org/vocabularies/blocks/thinkPairShare",
  "content": {
    "prompt": {
      "runs": [
        {
          "type": "text",
          "text": "Consider the ethical implications of artificial intelligence in healthcare decision-making. What are the potential benefits and risks when AI systems are used to diagnose diseases or recommend treatments? How should we balance efficiency and human judgment in medical care?"
        }
      ]
    },
    "context": {
      "runs": [
        {
          "type": "text",
          "text": "Recent advances in machine learning have enabled AI systems to achieve high accuracy in medical image analysis and diagnostic predictions. However, questions remain about accountability, bias, patient autonomy, and the role of human physicians in AI-assisted healthcare."
        }
      ]
    },
    "thinkPhase": {
      "duration": "PT3M",
      "instructions": {
        "runs": [
          {
            "type": "text",
            "text": "Take 3 minutes to reflect individually on the prompt. Consider both positive and negative aspects of AI in healthcare. Write down your initial thoughts and any questions that come to mind."
          }
        ]
      },
      "scaffolding": [
        {
          "type": "guiding-question",
          "content": {
            "runs": [
              {
                "type": "text",
                "text": "What are the potential advantages of using AI for medical diagnosis?"
              }
            ]
          }
        },
        {
          "type": "guiding-question",
          "content": {
            "runs": [
              {
                "type": "text",
                "text": "What risks or concerns might patients or doctors have about AI-driven healthcare?"
              }
            ]
          }
        },
        {
          "type": "sentence-starter",
          "content": {
            "runs": [
              {
                "type": "text",
                "text": "One benefit of AI in healthcare could be... / One concern I have is..."
              }
            ]
          }
        }
      ],
      "responseFormat": "bullet-points"
    },
    "pairPhase": {
      "duration": "PT5M",
      "instructions": {
        "runs": [
          {
            "type": "text",
            "text": "Share your thoughts with your partner and listen to their perspective. Work together to identify the most important benefits and risks. Try to build on each other's ideas and find points of agreement or interesting disagreements."
          }
        ]
      },
      "pairingStrategy": "proximity",
      "discussionPrompts": [
        {
          "runs": [
            {
              "type": "text",
              "text": "Which benefits or risks did you both identify? Which ones are unique to each of you?"
            }
          ]
        },
        {
          "runs": [
            {
              "type": "text",
              "text": "How might different stakeholders (patients, doctors, insurance companies) view AI in healthcare differently?"
            }
          ]
        }
      ],
      "recordResponse": true,
      "responseFormat": "key-points"
    },
    "sharePhase": {
      "duration": "PT7M",
      "format": "volunteer",
      "instructions": {
        "runs": [
          {
            "type": "text",
            "text": "We'll hear from several pairs about their key insights. Focus on sharing ideas that haven't been mentioned yet or that offer a unique perspective on the ethical challenges."
          }
        ]
      },
      "synthesis": {
        "activity": "categorization",
        "instructions": {
          "runs": [
            {
              "type": "text",
              "text": "Let's organize the benefits and risks we've identified into categories: technical/accuracy issues, ethical/moral concerns, social/economic impacts, and practical implementation challenges."
            }
          ]
        }
      },
      "captureMethod": "board"
    },
    "assessmentIntegration": {
      "formativeAssessment": {
        "checkUnderstanding": [
          "Ethical reasoning skills",
          "Ability to consider multiple perspectives",
          "Understanding of AI applications in healthcare"
        ],
        "feedbackMethod": "immediate"
      }
    },
    "learningObjectives": [
      "Analyze ethical implications of emerging technologies",
      "Consider multiple stakeholder perspectives in complex issues",
      "Engage in respectful dialogue about controversial topics",
      "Apply ethical frameworks to real-world scenarios"
    ],
    "totalDuration": "PT15M",
    "classSize": {
      "minimum": 6,
      "maximum": 40,
      "optimal": 20
    },
    "adaptations": [
      {
        "context": "online",
        "modification": {
          "runs": [
            {
              "type": "text",
              "text": "Use breakout rooms for pair phase, utilize chat for individual think phase responses, and use collaborative documents for sharing key points."
            }
          ]
        }
      },
      {
        "context": "large-class",
        "modification": {
          "runs": [
            {
              "type": "text",
              "text": "Consider using a gallery walk format for sharing phase, or have pairs post their key points on sticky notes around the room."
            }
          ]
        }
      }
    ]
  }
}
```

---

### Usage Notes

**Pedagogical Applications:**
- Activating prior knowledge before new content
- Encouraging participation in shy or large classes
- Exploring controversial or complex topics
- Building classroom community and peer relationships
- Surfacing misconceptions for targeted instruction

**Timing Recommendations:**
- **Think Phase**: 2-5 minutes (varies by complexity)
- **Pair Phase**: 3-7 minutes (includes sharing and discussion)
- **Share Phase**: 5-10 minutes (depends on class size)
- **Total Activity**: 10-22 minutes typical range

**Facilitation Strategies:**
- Circulate during pair phase to monitor engagement
- Use strategic questioning to deepen discussions
- Manage time strictly to maintain energy
- Synthesize insights to reinforce key concepts

**Assessment Opportunities:**
- Collect think phase responses for participation credit
- Monitor pair discussions for understanding checks
- Use shared insights as formative assessment data
- Include follow-up questions in subsequent assignments

---

### Related Objects

- [`ContentBlock`](./ContentBlock.md) - Container for think-pair-share content
- [`SemanticText`](./SemanticText.md) - Text formatting within prompts and instructions
- [`LearningObjective`](./LearningObjective.md) - Can be linked to collaborative and critical thinking skills
- [`AssessmentAccessibilitySettings`](./AssessmentAccessibilitySettings.md) - Accommodations for diverse learners