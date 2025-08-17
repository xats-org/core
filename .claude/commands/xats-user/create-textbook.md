---
name: create-textbook
description: Helps users create a complete xats-compliant textbook from scratch or existing content
model: sonnet
arguments:
  title:
    description: Title of the textbook
    required: true
    example: "Introduction to Computer Science"
  source:
    description: Source material (file path, URL, or "scratch")
    required: false
    default: "scratch"
---

You are helping a user create a complete xats-compliant textbook. Guide them through the process and generate valid content.

## Textbook Creation Process

### 1. Initial Setup
- Gather bibliographic information
- Define subject area
- Plan structure (units/chapters/sections)
- Set learning objectives

### 2. Content Structure
```json
{
  "schemaVersion": "0.1.0",
  "bibliographicEntry": {
    "id": "textbook-id",
    "type": "book",
    "title": "${title}",
    "author": [...]
  },
  "subject": "${subject}",
  "bodyMatter": {
    "contents": [...]
  }
}
```

### 3. Content Development
- Create chapters and sections
- Add content blocks (paragraphs, headings, lists)
- Include assessments
- Add multimedia resources
- Define learning pathways

## Agents to Use

### Planning Phase
- `xats-content-author` - Content structure planning
- `xats-pedagogy-architect` - Learning design
- `xats-implementation-guide` - Technical setup

### Content Creation
- `xats-content-author` - Writing content
- `xats-assessment-specialist` - Creating assessments
- `docs-architect` - Organizing content

### Technical Implementation
- `xats-implementation-guide` - xats compliance
- `xats-validation-engineer` - Content validation
- `xats-consumer-advocate` - Best practices

### Quality Assurance
- `xats-accessibility-champion` - Accessibility check
- `xats-international-liaison` - Internationalization
- `xats-student-advocate` - Student perspective

## Content Templates

### Chapter Template
```json
{
  "id": "chapter-${number}",
  "label": "${number}",
  "title": "${chapter_title}",
  "learningObjectives": [...],
  "sections": [...]
}
```

### Section Template
```json
{
  "id": "section-${chapter}-${section}",
  "label": "${chapter}.${section}",
  "title": "${section_title}",
  "content": [...]
}
```

### Assessment Template
```json
{
  "id": "assessment-${id}",
  "assessmentType": "https://xats.org/core/assessments/quiz",
  "title": "${title}",
  "questions": [...]
}
```

## Migration from Other Formats

### From Word/PDF
1. Extract text content
2. Identify structure (headings → sections)
3. Convert formatting to semantic markup
4. Add metadata and learning objectives
5. Validate and refine

### From Markdown
1. Parse markdown structure
2. Map headings to chapters/sections
3. Convert markdown to SemanticText
4. Add xats-specific metadata
5. Enhance with assessments

### From HTML
1. Parse HTML structure
2. Extract semantic content
3. Map to xats blocks
4. Clean and validate
5. Add educational metadata

## Validation & Testing

1. **Schema Validation**
   - Validate against xats schema
   - Check all required fields
   - Verify URI vocabularies
   - Test with multiple validators

2. **Content Review**
   - Check learning objectives
   - Verify assessment alignment
   - Review accessibility
   - Test pathways

3. **Quality Checks**
   - Consistent formatting
   - Proper citations
   - Working references
   - Complete metadata

## Output

- Complete xats JSON document
- Validation report
- Example renderings
- Migration notes (if applicable)
- Implementation guide
- Best practices checklist