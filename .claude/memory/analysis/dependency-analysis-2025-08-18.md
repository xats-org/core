# GitHub Issues Dependency Analysis
**Date**: 2025-08-18  
**Analyst**: xats-project-steward  
**Purpose**: Identify critical dependencies and update GitHub issues with proper relationships

## Issue Classification by Priority and Dependencies

### CRITICAL PATH ISSUES (Must be done first)

#### Foundation Layer - No Dependencies
1. **#38/#32/#1/#13 - Assessment Framework** (4 duplicate issues)
   - NO dependencies - can start immediately
   - BLOCKS: #35, #41 (LMS Integration), #3 (Formative Assessment)
   - Priority: CRITICAL - Base requirement for all educational use

2. **#39/#33 - WCAG Compliance** (2 duplicate issues) 
   - NO dependencies - can start immediately
   - BLOCKS: All public release and institutional adoption
   - Priority: CRITICAL - Legal requirement

3. **#42 - Emergency External Accessibility Audit**
   - NO dependencies - external contractor work
   - SUPPORTS: #39/#33 (WCAG Compliance)
   - Priority: CRITICAL - Risk mitigation

#### Business Requirements Layer
4. **#40/#34 - Rights Management** (2 duplicate issues)
   - NO dependencies - can start immediately
   - BLOCKS: All commercial/publisher adoption
   - Priority: CRITICAL - Commercial viability

### DEPENDENT ISSUES (Cannot start until foundations complete)

#### LMS Integration Tier
5. **#41/#35 - LTI 1.3 Support** (2 duplicate issues)
   - DEPENDS ON: #38 (Assessment Framework) - MUST complete first
   - DEPENDS ON: #39 (WCAG Compliance) - Legal requirement
   - BLOCKS: All institutional adoption
   - Priority: CRITICAL

#### Content Creation Tier  
6. **#36 - Authoring Tools Foundation**
   - DEPENDS ON: #38 (Assessment Framework) - tools must support assessments
   - DEPENDS ON: #40 (Rights Management) - tools must handle rights
   - BLOCKS: Content creator adoption
   - Priority: CRITICAL

#### Advanced Features Tier
7. **#37 - Sprint Planning** (Meta-issue)
   - NO technical dependencies - project management
   - COORDINATES: All other critical issues
   - Priority: CRITICAL - Project management

8. **#3 - Formative Assessment Systems**
   - DEPENDS ON: #38 (Assessment Framework) - MUST complete first
   - EXTENDS: Core assessment with advanced feedback
   - Priority: HIGH

9. **#2 - Cognitive Level Metadata**
   - DEPENDS ON: #38 (Assessment Framework) - MUST complete first
   - ENHANCES: Assessment quality
   - Priority: HIGH

### v0.3.0 ISSUES (Lower Priority)
- #18 - Schema Versioning (documentation)
- #17 - Reference Renderer (tooling)
- #15 - Extension Examples (ecosystem)
- #5 - Learning Analytics (advanced features)
- #4 - Active Learning Blocks (advanced pedagogy)

## Critical Path Analysis

### Phase 1 (Parallel - Start Immediately)
- **#38** - Assessment Framework [8 weeks]
- **#39** - WCAG Compliance [6 weeks] 
- **#42** - External Audit [2 weeks]
- **#40** - Rights Management [4 weeks]

### Phase 2 (Dependent - Start after Phase 1)
- **#41** - LTI Integration [AFTER #38 + #39] [4 weeks]
- **#36** - Authoring Tools [AFTER #38 + #40] [6 weeks]

### Phase 3 (Enhancement)
- **#3** - Formative Assessment [AFTER #38] [3 weeks]
- **#2** - Cognitive Metadata [AFTER #38] [2 weeks]

## Risk Analysis

### HIGHEST RISK
- **#38 Assessment Framework**: Blocks everything educational
- **#39 WCAG Compliance**: Legal liability, blocks public release

### HIGH RISK  
- **#41 LTI Integration**: Blocks institutional adoption
- **#40 Rights Management**: Blocks commercial adoption

### MODERATE RISK
- **#36 Authoring Tools**: Blocks content creator adoption

## Duplicate Issues Identified
- Assessment Framework: #38, #32, #1, #13 (CONSOLIDATE)
- WCAG Compliance: #39, #33 (CONSOLIDATE) 
- Rights Management: #40, #34 (CONSOLIDATE)
- LTI Integration: #41, #35 (CONSOLIDATE)

## Recommended Actions
1. Close duplicate issues and consolidate into primary issues
2. Update all issues with dependency information  
3. Focus sprint teams on Phase 1 parallel work
4. Do NOT start Phase 2 until Phase 1 dependencies complete