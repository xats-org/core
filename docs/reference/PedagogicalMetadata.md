# PedagogicalMetadata

**Type:** `object`

Cognitive and pedagogical metadata for assessment items, enabling sophisticated learning analytics and adaptive pathways.

## Properties

### `cognitiveLevel` (optional)
- **Type:** `string`
- **Enum:** `"Remember"`, `"Understand"`, `"Apply"`, `"Analyze"`, `"Evaluate"`, `"Create"`
- **Description:** Bloom's Taxonomy cognitive level for this assessment.

### `difficultyLevel` (optional)
- **Type:** `string`
- **Enum:** `"easy"`, `"moderate"`, `"hard"`, `"expert"`
- **Description:** Subjective difficulty level of the assessment.

### `estimatedTimeMinutes` (optional)
- **Type:** `number`
- **Description:** Estimated time in minutes for students to complete this assessment.

### `prerequisites` (optional)
- **Type:** `array` of `string`
- **Description:** IDs of content blocks that should be completed before this assessment.

### `learningObjectiveIds` (optional)
- **Type:** `array` of `string`
- **Description:** IDs of learning objectives this assessment measures.

### `topicTags` (optional)
- **Type:** `array` of `string`
- **Description:** Subject matter tags for categorization and search.

### `depthOfKnowledge` (optional)
- **Type:** `integer`
- **Minimum:** 1
- **Maximum:** 4
- **Description:** Webb's Depth of Knowledge level (1-4).

### `itemType` (optional)
- **Type:** `string`
- **Enum:** `"formative"`, `"summative"`, `"diagnostic"`, `"practice"`
- **Description:** The pedagogical purpose of this assessment item.

## Usage Example

```json
{
  "cognitiveLevel": "Apply",
  "difficultyLevel": "moderate",
  "estimatedTimeMinutes": 3,
  "prerequisites": ["sec-cell-structure", "sec-organelles"],
  "learningObjectiveIds": ["lo-cell-energy"],
  "topicTags": ["cell biology", "metabolism", "ATP"],
  "depthOfKnowledge": 2,
  "itemType": "formative"
}
```

## Cognitive Levels (Bloom's Taxonomy)

- **Remember:** Recall facts and basic concepts
- **Understand:** Explain ideas or concepts  
- **Apply:** Use information in new situations
- **Analyze:** Draw connections among ideas
- **Evaluate:** Justify a stand or decision
- **Create:** Produce new or original work

## Depth of Knowledge Levels

- **Level 1:** Recall and reproduction
- **Level 2:** Skills and concepts
- **Level 3:** Strategic thinking
- **Level 4:** Extended thinking

## Related Objects
- [MultipleChoiceContent](./MultipleChoiceContent.md)
- [LearningObjective](./LearningObjective.md)