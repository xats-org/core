# xats Pathway System Specification

**Version:** 0.1.0
**Canonical URL:** `https://xats.org/specs/pathway-system`

---

## 1. Philosophy

The **xats** Pathway System is designed to transform a static textbook into a dynamic, adaptive learning experience. Its purpose is to allow authors to define explicit, rule-based, non-linear journeys through the content.

A `Pathway` is not a simple hyperlink. It is a set of **conditional routing rules** that are evaluated at a specific "decision point" in the content flow. This enables the creation of remedial loops, advanced tracks, and personalized learning paths based on a learner's interactions.

## 2. The `Pathway` Object

A `Pathway` object is an array item within the `pathways` property of a `StructuralContainer` (`Unit`, `Chapter`, or `Section`). It consists of two main parts: a `trigger` and a set of `rules`.

```json
"pathways": [
  {
    "trigger": { ... },
    "rules": [ ... ]
  }
]
```

### a. The `trigger`

The `trigger` defines *when* the pathway's rules should be evaluated.

- **`triggerType` (URI, required):** The event that fires the check.
  - `https://xats.org/vocabularies/triggers/onCompletion`: The pathway is evaluated as soon as the learner finishes the container (e.g., reaches the end of a section).
  - `https://xats.org/vocabularies/triggers/onAssessment`: The pathway is evaluated upon the submission of a specific assessment.
- **`sourceId` (string, optional):** Required if `triggerType` is `onAssessment`. This is the `id` of the `ContentBlock` containing the assessment that provides the data for the rules.

### b. The `rules`

The `rules` array contains one or more routing instructions. A renderer evaluates the rules in order and directs the learner to the destination of the *first* rule whose condition is met.

- **`condition` (string, required):** A machine-evaluatable expression following the [xats Pathway Condition Grammar](./pathway-condition-grammar.md). The grammar defines a formal syntax for boolean expressions with variables (e.g., `score`, `attempts`), operators (e.g., `<`, `>=`, `AND`, `OR`), and functions (e.g., `count()`, `exists()`). Examples: `score >= 70`, `score < 70 AND attempts >= 3`, `count(objectives_met) >= 3`.
- **`destinationId` (string, required):** The `id` of the target `Unit`, `Chapter`, `Section`, or `ContentBlock` to which the learner should be routed.
- **`pathwayType` (URI, optional):** A semantic hint about the pedagogical purpose of the path. This allows a renderer to message the transition appropriately (e.g., "Let's review a concept" vs. "Ready for a challenge?").

---

## 3. Practical Examples

### a. Remedial Loop

At the end of **Section 3.2**, a quiz (`id: "quiz-3-2"`) checks for understanding. If the score is below 70, the learner is sent to a remedial section (`id: "sec-3-2-remedial"`). Otherwise, they proceed to Section 3.3.

**In the `pathways` property of the `Section` with `id: "sec-3-2"`:**
```json
"pathways": [
  {
    "trigger": {
      "triggerType": "[https://xats.org/vocabularies/triggers/onAssessment](https://xats.org/vocabularies/triggers/onAssessment)",
      "sourceId": "quiz-3-2"
    },
    "rules": [
      {
        "condition": "score < 70",
        "destinationId": "sec-3-2-remedial",
        "pathwayType": "[https://xats.org/vocabularies/pathways/remedial](https://xats.org/vocabularies/pathways/remedial)"
      },
      {
        "condition": "score >= 70",
        "destinationId": "sec-3-3",
        "pathwayType": "[https://xats.org/vocabularies/pathways/standard](https://xats.org/vocabularies/pathways/standard)"
      }
    ]
  }
]
```

### b. User-Choice Advanced Track

At the end of **Chapter 4**, the learner is given a choice to either continue to the standard next chapter or explore an optional enrichment chapter.

**In the `pathways` property of the `Chapter` with `id: "ch-4"`:**
```json
"pathways": [
  {
    "trigger": {
      "triggerType": "[https://xats.org/vocabularies/triggers/onCompletion](https://xats.org/vocabularies/triggers/onCompletion)"
    },
    "rules": [
      {
        "condition": "user_choice == 'advanced'",
        "destinationId": "ch-4-enrichment",
        "pathwayType": "[https://xats.org/vocabularies/pathways/enrichment](https://xats.org/vocabularies/pathways/enrichment)"
      },
      {
        "condition": "user_choice == 'standard'",
        "destinationId": "ch-5",
        "pathwayType": "[https://xats.org/vocabularies/pathways/standard](https://xats.org/vocabularies/pathways/standard)"
      }
    ]
  }
]
```
In this case, the renderer is responsible for presenting a UI to the user that sets the `user_choice` variable, which is then evaluated by the pathway rules.
