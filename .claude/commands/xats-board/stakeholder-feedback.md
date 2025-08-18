---
name: stakeholder-feedback
description: Gathers and synthesizes feedback from different stakeholder groups to inform schema development
model: claude-3-opus-20240229
arguments:
  groups:
    description: Specific stakeholder groups to consult (comma-separated)
    required: false
    example: "students,instructors,publishers"
  topics:
    description: Specific topics to gather feedback on
    required: false
    example: "assessment-experience,mobile-usage,ai-features"
---

You are conducting a stakeholder feedback session for the xats schema. Your role is to gather diverse perspectives, identify common themes, and translate feedback into actionable improvements.

## Arguments
- **groups** (optional): Specific stakeholder groups to focus on
- **topics** (optional): Particular areas to gather feedback about

## Memory Integration

### Continuous Feedback Loop
1. All feedback stored in `.claude/memory/context/stakeholder-feedback.json`
2. Accumulates over time, not replaced
3. Tagged by date, group, and topic for filtering
4. Summarized periodically to identify trends

### Before Gathering
1. Load previous feedback from same groups
2. Check what changes were made based on past feedback
3. Identify recurring themes to probe deeper

### During Gathering
1. Record raw feedback with metadata
2. Tag with stakeholder group and topics
3. Note sentiment and priority indicators

### After Gathering
1. Update accumulated feedback database
2. Generate trend analysis comparing to past
3. Create issues for high-priority items
4. Update roadmap with stakeholder priorities

## Feedback Collection Process

1. **Stakeholder Identification**: Determine which groups to consult
2. **Question Design**: Create targeted questions for each group
3. **Feedback Gathering**: Collect input through appropriate channels
4. **Theme Analysis**: Identify patterns and common concerns
5. **Prioritization**: Rank feedback by importance and feasibility
6. **Action Planning**: Convert feedback into concrete tasks

## Stakeholder Groups

### Primary Users
- **Students**: End users of educational content
- **Instructors**: Teachers using materials in courses
- **Content Authors**: Professors and textbook writers
- **Publishers**: Commercial and OER publishers

### Technical Stakeholders
- **Developers**: Implementing xats tools
- **LMS Administrators**: Managing platforms
- **IT Staff**: Supporting infrastructure
- **Integration Partners**: Third-party tool providers

### Institutional Stakeholders
- **Administrators**: Deans, department heads
- **Librarians**: Managing educational resources
- **Instructional Designers**: Supporting faculty
- **Accessibility Officers**: Ensuring compliance

## Feedback Channels

1. **Direct Consultation**: One-on-one with board agents
2. **Survey Simulation**: Structured questionnaires
3. **Use Case Analysis**: Real-world implementation stories
4. **Pain Point Identification**: Current frustrations
5. **Wish List Collection**: Desired features

## Board Agents to Consult

Each agent represents their stakeholder perspective:
- `xats-student-advocate` - Student needs and preferences
- `xats-content-author` - Author workflows and challenges
- `xats-academic-administrator` - Institutional requirements
- `xats-publishing-expert` - Publisher constraints
- `xats-lms-integrator` - Platform integration needs
- `xats-accessibility-champion` - Accessibility requirements
- `xats-international-liaison` - Global perspectives
- `xats-assessment-specialist` - Assessment needs
- `xats-ai-education-expert` - Future technology requirements

## Analysis Framework

### Feedback Categories
- **Critical Issues**: Blocking adoption or use
- **Feature Requests**: New capabilities desired
- **Usability Concerns**: Difficulty understanding or using
- **Performance Issues**: Speed or efficiency problems
- **Documentation Gaps**: Missing or unclear information

### Impact vs Effort Matrix
- **Quick Wins**: High impact, low effort
- **Major Projects**: High impact, high effort
- **Fill-Ins**: Low impact, low effort
- **Question Marks**: Low impact, high effort

## Output

- **Feedback Report**: Saved to `.claude/memory/feedback/YYYY-MM-DD/report.md`
- **Updated Context**: Accumulated feedback in shared context updated
- **Theme Analysis**: Patterns saved for long-term tracking
- **Priority Matrix**: Saved to guide future development
- **GitHub Issues**: Created for actionable feedback
- **Trend Report**: Comparison with historical feedback
- **Response Plan**: How to communicate back to stakeholders