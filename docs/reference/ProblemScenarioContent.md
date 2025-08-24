# `ProblemScenarioContent`

**Type:** `object`  
**Introduced in:** v0.5.0  
**Block Type URI:** `https://xats.org/vocabularies/blocks/problemScenario`

---

### Description

The `ProblemScenarioContent` object defines comprehensive problem-based learning scenarios that present authentic, complex challenges requiring analysis, collaboration, and solution development across multiple structured phases. This content type supports professional preparation and interdisciplinary learning through realistic stakeholder dynamics, constraints, and deliverables.

Problem-based learning blocks are designed to engage students with real-world problems that mirror professional challenges, promoting critical thinking, collaborative skills, and the integration of knowledge across multiple domains.

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `scenario` | [`SemanticText`](./SemanticText.md) | **Yes** | The main problem description presenting the central challenge students must address |
| `context` | [`SemanticText`](./SemanticText.md) | No | Background information providing setting, history, and additional details for understanding the scenario |
| `stakeholders` | `array` of [`Stakeholder`](#stakeholder) | No | Key individuals or groups with interests in the problem outcome, including their roles, motivations, and influence levels |
| `constraints` | `array` of [`Constraint`](#constraint) | No | Real-world limitations that students must work within (budget, time, technical, regulatory) |
| `deliverables` | `array` of [`Deliverable`](#deliverable) | **Yes** | Expected outputs with requirements and relative weightings for assessment |
| `phases` | `array` of [`Phase`](#phase) | **Yes** | Structured progression through the problem-solving process with activities and durations |
| `difficultyLevel` | `string` | No | Complexity indicator: `"beginner"`, `"intermediate"`, `"advanced"`, or `"expert"` |
| `estimatedTimeHours` | `number` | No | Total expected time commitment in hours across all phases |
| `collaborationType` | `string` | No | Intended group structure: `"individual"`, `"pair"`, `"small-group"`, `"large-group"`, or `"class"` |

---

### Nested Object Definitions

#### `Stakeholder`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Name or title of the stakeholder |
| `role` | `string` | **Yes** | Position or function in relation to the problem |
| `interests` | `array` of `string`s | No | Primary motivations or concerns of this stakeholder |
| `influence` | `string` | No | Level of power or impact: `"low"`, `"medium"`, `"high"`, or `"critical"` |

#### `Constraint`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` | **Yes** | Category of constraint: `"budget"`, `"time"`, `"technical"`, `"regulatory"`, `"social"`, or `"environmental"` |
| `description` | [`SemanticText`](./SemanticText.md) | **Yes** | Detailed explanation of the limitation |
| `severity` | `string` | No | Impact level: `"minor"`, `"moderate"`, `"major"`, `"critical"`, or `"absolute"` |

#### `Deliverable`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | `string` | **Yes** | Category of output: `"analysis"`, `"solution"`, `"presentation"`, `"report"`, `"prototype"`, or `"plan"` |
| `requirements` | [`SemanticText`](./SemanticText.md) | **Yes** | Specific expectations and criteria for the deliverable |
| `weight` | `number` | No | Relative importance for assessment (0.0 to 1.0, should sum to 1.0 across all deliverables) |

#### `Phase`

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | **Yes** | Title of the problem-solving phase |
| `activities` | `array` of `string`s | **Yes** | Types of work expected: `"research"`, `"analyze"`, `"brainstorm"`, `"ideate"`, `"synthesize"`, `"prototype"`, `"evaluate"`, `"document"`, `"collaborate"`, `"present"`, `"reflect"` |
| `duration` | `string` | No | Time allocation in ISO 8601 duration format (e.g., `"PT8H"` for 8 hours) |

---

### Example

```json
{
  "blockType": "https://xats.org/vocabularies/blocks/problemScenario",
  "content": {
    "scenario": {
      "runs": [
        {
          "type": "text",
          "text": "Your engineering consultancy firm has been hired by the City of Riverside to address increasing traffic congestion in the downtown core. The city is experiencing 40% longer commute times during peak hours, increased air pollution, and declining local business revenue due to reduced foot traffic. The mayor wants a comprehensive solution that balances transportation efficiency, environmental sustainability, economic vitality, and community needs."
        }
      ]
    },
    "context": {
      "runs": [
        {
          "type": "text",
          "text": "Riverside is a mid-sized city (population 180,000) with a historic downtown district, two major highways intersecting the city center, a university campus on the east side, and several residential neighborhoods. The city has limited public transportation and high car dependency."
        }
      ]
    },
    "stakeholders": [
      {
        "name": "Mayor Patricia Williams",
        "role": "City Leader",
        "interests": ["Re-election prospects", "Balanced budget", "Community satisfaction"],
        "influence": "high"
      },
      {
        "name": "Downtown Business Association",
        "role": "Economic Representatives", 
        "interests": ["Customer accessibility", "Parking availability", "Economic growth"],
        "influence": "medium"
      }
    ],
    "constraints": [
      {
        "type": "budget",
        "description": {
          "runs": [
            {
              "type": "text",
              "text": "Total project budget cannot exceed $25 million over 5 years"
            }
          ]
        },
        "severity": "absolute"
      },
      {
        "type": "time",
        "description": {
          "runs": [
            {
              "type": "text",
              "text": "Initial improvements must be visible within 18 months"
            }
          ]
        },
        "severity": "critical"
      }
    ],
    "deliverables": [
      {
        "type": "analysis",
        "requirements": {
          "runs": [
            {
              "type": "text",
              "text": "Comprehensive traffic flow analysis with current state assessment and problem identification"
            }
          ]
        },
        "weight": 0.25
      },
      {
        "type": "solution",
        "requirements": {
          "runs": [
            {
              "type": "text",
              "text": "Detailed transportation improvement plan with multiple integrated solutions"
            }
          ]
        },
        "weight": 0.4
      },
      {
        "type": "presentation",
        "requirements": {
          "runs": [
            {
              "type": "text",
              "text": "20-minute stakeholder presentation with visual aids and Q&A session"
            }
          ]
        },
        "weight": 0.35
      }
    ],
    "phases": [
      {
        "name": "Problem Analysis",
        "activities": ["research", "analyze", "document"],
        "duration": "PT8H"
      },
      {
        "name": "Solution Development",
        "activities": ["brainstorm", "ideate", "synthesize", "prototype"],
        "duration": "PT12H"
      },
      {
        "name": "Implementation Planning",
        "activities": ["evaluate", "document", "collaborate"],
        "duration": "PT6H"
      },
      {
        "name": "Stakeholder Presentation",
        "activities": ["present", "reflect"],
        "duration": "PT4H"
      }
    ],
    "difficultyLevel": "advanced",
    "estimatedTimeHours": 30,
    "collaborationType": "small-group"
  }
}
```

---

### Usage Notes

**Pedagogical Applications:**
- Professional program capstone projects
- Interdisciplinary course integration
- Real-world client-based learning
- Collaborative problem-solving skill development

**Assessment Integration:**
- Phase-based formative evaluation
- Weighted deliverable scoring
- Peer assessment of collaboration
- Authentic performance measurement

**Best Practices:**
- Ensure scenarios reflect genuine professional challenges
- Balance complexity with student capability level
- Provide clear phase transitions and milestone markers
- Include diverse stakeholder perspectives for realistic complexity

---

### Related Objects

- [`ContentBlock`](./ContentBlock.md) - Container for problem scenario content
- [`SemanticText`](./SemanticText.md) - Text formatting within scenario descriptions
- [`LearningObjective`](./LearningObjective.md) - Can be linked to specific problem-solving skills
- [`PedagogicalMetadata`](./PedagogicalMetadata.md) - Additional instructional metadata