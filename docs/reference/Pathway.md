# `Pathway`

**Type:** `object`

---

### Description

A `Pathway` defines a set of conditional routing rules for creating adaptive, non-linear learning experiences. Pathways enable dynamic content routing based on assessment scores, completion status, user choices, and other contextual variables.

For complete details, see:
- [Pathway System Specification](../specs/pathway-system.md) - Overview and examples
- [Pathway Condition Grammar](../specs/pathway-condition-grammar.md) - Formal condition syntax

---

### Properties

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `trigger` | `object` | **Yes** | Defines the event that initiates the pathway check. |
| `trigger.triggerType` | `string` (URI) | **Yes** | The event type (e.g., `https://xats.org/core/triggers/onCompletion`, `https://xats.org/core/triggers/onAssessment`). |
| `trigger.sourceId` | `string` | No* | The ID of the source element. *Required when `triggerType` is `onAssessment`. |
| `rules` | `array` | **Yes** | An ordered list of routing rules (minimum 1 item). |
| `rules[].condition` | `string` | **Yes** | A boolean expression following the [Pathway Condition Grammar](../specs/pathway-condition-grammar.md). |
| `rules[].destinationId` | `string` | **Yes** | The ID of the target container or block. |
| `rules[].pathwayType` | `string` (URI) | No | Pedagogical purpose (e.g., `remedial`, `enrichment`). |

---

### Condition Grammar Quick Reference

#### Variables
- **Assessment**: `score`, `attempts`, `time_spent`, `passed`, `completed`
- **Progress**: `objectives_met`, `completion_percentage`
- **User**: `user_choice`, `user_level`, `user_preference`

#### Operators
- **Comparison**: `==`, `!=`, `<`, `>`, `<=`, `>=`
- **Logical**: `AND`, `OR`, `NOT`
- **Array**: `IN`, `NOT IN`

#### Functions
- **Aggregate**: `min()`, `max()`, `avg()`, `count()`
- **Predicate**: `exists()`, `all()`, `any()`

---

### Examples

#### Basic Score-Based Routing
```json
{
  "trigger": {
    "triggerType": "https://xats.org/core/triggers/onAssessment",
    "sourceId": "quiz-3-1"
  },
  "rules": [
    {
      "condition": "score < 70",
      "destinationId": "section-3-1-remedial",
      "pathwayType": "https://xats.org/core/pathways/remedial"
    },
    {
      "condition": "score >= 70 AND score < 90",
      "destinationId": "section-3-2",
      "pathwayType": "https://xats.org/core/pathways/standard"
    },
    {
      "condition": "score >= 90",
      "destinationId": "section-3-2-advanced",
      "pathwayType": "https://xats.org/core/pathways/enrichment"
    }
  ]
}
```

#### Complex Multi-Factor Routing
```json
{
  "trigger": {
    "triggerType": "https://xats.org/core/triggers/onAssessment",
    "sourceId": "chapter-test"
  },
  "rules": [
    {
      "condition": "(score < 70 OR time_spent < 120) AND attempts < 3",
      "destinationId": "chapter-review",
      "pathwayType": "https://xats.org/core/pathways/remedial"
    },
    {
      "condition": "score >= 85 AND count(objectives_met) >= objectives_total * 0.9",
      "destinationId": "bonus-content",
      "pathwayType": "https://xats.org/core/pathways/enrichment"
    },
    {
      "condition": "passed",
      "destinationId": "next-chapter",
      "pathwayType": "https://xats.org/core/pathways/standard"
    }
  ]
}
```

#### User Choice Pathway
```json
{
  "trigger": {
    "triggerType": "https://xats.org/core/triggers/onCompletion"
  },
  "rules": [
    {
      "condition": "user_choice == \"deep_dive\" AND score >= 80",
      "destinationId": "advanced-topics",
      "pathwayType": "https://xats.org/core/pathways/enrichment"
    },
    {
      "condition": "user_choice == \"practice_more\"",
      "destinationId": "practice-problems",
      "pathwayType": "https://xats.org/core/pathways/standard"
    },
    {
      "condition": "true",
      "destinationId": "next-section",
      "pathwayType": "https://xats.org/core/pathways/standard"
    }
  ]
}
```