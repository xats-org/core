---
name: impact-assessment
description: Analyzes the comprehensive impact of proposed changes on all stakeholders and systems
model: claude-opus-4-1-20250805
arguments:
  change:
    description: Description of the proposed change to assess
    required: true
    example: "adding-adaptive-pathways"
  scope:
    description: Scope of assessment (quick, standard, comprehensive)
    required: false
    default: "standard"
---

You are conducting an impact assessment for proposed xats schema changes. Your role is to identify and evaluate all potential effects on stakeholders, systems, and workflows.

## Arguments
- **change** (required): The proposed change to assess
- **scope** (optional): Depth of assessment (quick/standard/comprehensive)

## Memory Integration

### Historical Context
1. Load similar past assessments for comparison
2. Check outcomes of previously implemented changes
3. Review stakeholder reactions to similar changes

### Assessment Tracking
1. Create assessment record: `.claude/memory/assessments/YYYY-MM-DD-change/`
2. Link to relevant issues and PRs
3. Track predicted vs actual impacts over time

### Learning Loop
1. After implementation, compare actual to predicted impact
2. Update assessment models based on accuracy
3. Improve future predictions

## Assessment Framework

1. **Stakeholder Impact**: Effects on each user group
2. **Technical Impact**: System and integration changes needed
3. **Financial Impact**: Cost implications for adoption
4. **Timeline Impact**: Effect on project schedules
5. **Risk Assessment**: Potential negative consequences
6. **Opportunity Analysis**: New possibilities enabled

## Stakeholder Analysis

### Primary Stakeholders
- **Students**: Learning experience changes
- **Instructors**: Teaching workflow modifications
- **Authors**: Content creation process effects
- **Publishers**: Production and distribution impacts
- **Institutions**: Administrative and compliance implications
- **Developers**: Implementation requirements

### Impact Dimensions
- **Effort Required**: Low / Medium / High
- **Benefit Realized**: Immediate / Short-term / Long-term
- **Adoption Barrier**: None / Minor / Significant
- **Training Needed**: None / Minimal / Extensive

## Assessment Participants

Consult these agents for comprehensive impact analysis:
- `xats-student-advocate` - Student experience impact
- `xats-academic-administrator` - Institutional implications
- `xats-content-author` - Authoring workflow effects
- `xats-publishing-expert` - Publishing pipeline impact
- `xats-lms-integrator` - Platform integration requirements
- `xats-accessibility-champion` - Accessibility implications
- `xats-international-liaison` - Global adoption considerations
- `xats-assessment-specialist` - Assessment system effects

## Risk Categories

1. **Breaking Changes**: Incompatibility with existing content
2. **Complexity Increase**: Harder to understand or implement
3. **Performance Impact**: Slower processing or larger files
4. **Security Concerns**: New vulnerabilities introduced
5. **Adoption Resistance**: Stakeholders unwilling to change

## Output

- **Impact Matrix**: Stakeholder × Impact dimension table
- **Risk Register**: Identified risks with mitigation strategies
- **Cost-Benefit Analysis**: Quantified where possible
- **Implementation Timeline**: Phased rollout plan
- **Communication Plan**: How to inform stakeholders
- **Go/No-Go Recommendation**: Based on overall assessment