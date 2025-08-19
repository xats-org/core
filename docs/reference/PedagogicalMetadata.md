# PedagogicalMetadata Object (CognitiveMetadata)

**Since:** v0.2.0  
**Type:** Object  
**Context:** Used within assessment items and content blocks to provide pedagogical classification

## Description

The `PedagogicalMetadata` object (defined as `CognitiveMetadata` in the schema) provides cognitive and pedagogical classification for educational content, particularly assessment items. This metadata enables adaptive learning systems, learning analytics, and helps educators align content with learning objectives.

## Properties

### `bloomsLevel` (string, optional)
The cognitive level according to Bloom's Taxonomy (Revised).

Values:
- `remember`: Recall facts and basic concepts
- `understand`: Explain ideas or concepts
- `apply`: Use information in new situations
- `analyze`: Draw connections among ideas
- `evaluate`: Justify a stand or decision
- `create`: Produce new or original work

### `difficulty` (number, optional)
Difficulty level on a scale of 1-5.

- `1`: Very Easy - Basic recall, simple concepts
- `2`: Easy - Straightforward application
- `3`: Medium - Moderate complexity, some analysis required
- `4`: Hard - Complex analysis or evaluation
- `5`: Very Hard - Advanced synthesis or creation

### `estimatedTime` (string, optional)
Expected time to complete the item (ISO 8601 duration).

Examples:
- `PT30S`: 30 seconds
- `PT2M`: 2 minutes
- `PT15M`: 15 minutes
- `PT1H`: 1 hour

### `cognitiveLoad` (string, optional)
The cognitive effort required.

Values:
- `low`: Minimal mental effort required
- `medium`: Moderate mental effort required
- `high`: Significant mental effort required

### `prerequisites` (array, optional)
Array of learning objective IDs that should be mastered before attempting this content.

Enables:
- Prerequisite checking
- Adaptive sequencing
- Personalized learning paths

### `learningObjectives` (array, optional)
Array of learning objective IDs that this content addresses.

Links content to:
- Course learning outcomes
- Curriculum standards
- Competency frameworks

### `depthOfKnowledge` (number, optional)
Webb's Depth of Knowledge level (1-4).

- `1`: Recall & Reproduction
- `2`: Skills & Concepts
- `3`: Strategic Thinking
- `4`: Extended Thinking

### `tags` (array, optional)
Keywords for categorization and search.

Examples:
- Subject areas: `["algebra", "quadratic-equations"]`
- Skills: `["problem-solving", "critical-thinking"]`
- Topics: `["photosynthesis", "cell-biology"]`

### `itemType` (string, optional)
The pedagogical purpose of this assessment item.

Values:
- `formative`: For ongoing assessment during learning
- `summative`: For evaluation at the end of instruction
- `diagnostic`: To identify learning needs or gaps
- `practice`: For skill reinforcement and review

## Example: Basic Assessment Metadata

```json
{
  "cognitive": {
    "bloomsLevel": "apply",
    "difficulty": 3,
    "estimatedTime": "PT5M",
    "cognitiveLoad": "medium",
    "tags": ["physics", "newton-laws", "force-calculations"]
  }
}
```

## Example: Advanced with Prerequisites

```json
{
  "cognitive": {
    "bloomsLevel": "analyze",
    "difficulty": 4,
    "estimatedTime": "PT10M",
    "cognitiveLoad": "high",
    "depthOfKnowledge": 3,
    "prerequisites": ["obj-algebra-basics", "obj-graphing"],
    "learningObjectives": ["obj-systems-of-equations"],
    "tags": ["algebra", "systems-of-equations", "problem-solving"],
    "itemType": "summative"
  }
}
```

## Bloom's Taxonomy Alignment Guide

### Remember Level
- **Keywords:** Define, duplicate, list, memorize, recall, repeat, state
- **Example Questions:** "What is the capital of France?"
- **Typical Difficulty:** 1-2

### Understand Level
- **Keywords:** Classify, describe, discuss, explain, identify, locate, recognize
- **Example Questions:** "Explain why water freezes at 0°C"
- **Typical Difficulty:** 2-3

### Apply Level
- **Keywords:** Execute, implement, solve, use, demonstrate, interpret
- **Example Questions:** "Calculate the area of a triangle with base 5 and height 3"
- **Typical Difficulty:** 2-3

### Analyze Level
- **Keywords:** Differentiate, organize, relate, compare, contrast, distinguish
- **Example Questions:** "Compare and contrast mitosis and meiosis"
- **Typical Difficulty:** 3-4

### Evaluate Level
- **Keywords:** Appraise, argue, defend, judge, select, support, value
- **Example Questions:** "Evaluate the effectiveness of the New Deal policies"
- **Typical Difficulty:** 4-5

### Create Level
- **Keywords:** Design, assemble, construct, conjecture, develop, formulate
- **Example Questions:** "Design an experiment to test the effect of pH on enzyme activity"
- **Typical Difficulty:** 4-5

## Implementation Guidelines

### Automatic Difficulty Calibration
Systems can use response data to refine difficulty ratings:
- Track success rates
- Analyze completion times
- Monitor hint usage
- Adjust ratings based on empirical data

### Adaptive Learning Applications
Use metadata for:
- **Sequencing:** Order content by difficulty and prerequisites
- **Recommendation:** Suggest appropriate next items
- **Remediation:** Identify struggle points and provide support
- **Acceleration:** Skip content already mastered

### Learning Analytics
Track and analyze:
- Time spent at each cognitive level
- Success rates by difficulty
- Cognitive load patterns
- Prerequisite completion paths

## Best Practices

1. **Consistent Classification:** Use rubrics to ensure consistent Bloom's level assignment
2. **Empirical Validation:** Validate difficulty ratings with actual student performance
3. **Complete Metadata:** Provide as much metadata as possible for better adaptivity
4. **Regular Review:** Update metadata based on usage data and feedback
5. **Alignment Checking:** Ensure assessment items align with stated learning objectives
6. **Progressive Complexity:** Design sequences that gradually increase in cognitive demand

## Related Objects

- [MultipleChoiceContent](./MultipleChoiceContent.md) - Uses cognitive metadata
- [ShortAnswerContent](./ShortAnswerContent.md) - Uses cognitive metadata
- [EssayPromptContent](./EssayPromptContent.md) - Uses cognitive metadata
- [LearningObjective](./LearningObjective.md) - Referenced by prerequisites
- [LearningOutcome](./LearningOutcome.md) - Higher-level outcomes

## Schema Definition

View the complete schema definition at: `/schemas/0.2.0/xats.json#/definitions/CognitiveMetadata`