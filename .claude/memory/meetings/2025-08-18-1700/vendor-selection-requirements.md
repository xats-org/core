# External Accessibility Audit Vendor Selection Requirements
**Date:** 2025-08-18  
**Prepared by:** xats Project Team  
**Purpose:** Define requirements for selecting external accessibility audit vendor
**Timeline:** URGENT - Vendor selection by August 20, 2025

## Executive Summary

Following the discovery of 92% WCAG 2.1 AA failure rate in xats v0.1.0 and subsequent improvements to ~85% compliance in v0.2.0, we require immediate external validation through a professional accessibility audit. This document outlines vendor selection criteria and requirements.

## Audit Objectives

### Primary Goals
1. **Independent Validation** - Verify our self-assessed 85% WCAG 2.1 AA compliance
2. **Legal Risk Assessment** - Evaluate liability exposure for educational institutions
3. **Remediation Roadmap** - Prioritized list of remaining accessibility gaps
4. **Certification Path** - Clear steps to achieve full compliance certification

### Secondary Goals
- International accessibility standards review (EN 301 549, ISO/IEC 40500)
- Best practice recommendations for schema design
- User testing protocol recommendations
- Long-term accessibility maintenance strategy

## Vendor Requirements

### Mandatory Qualifications

#### Certifications & Credentials
- [ ] **IAAP Certification** - At least one team member with CPWA or WAS certification
- [ ] **WCAG Expertise** - Demonstrated experience with WCAG 2.1 Level AA audits
- [ ] **Educational Sector Experience** - Prior work with educational technology or content
- [ ] **JSON Schema Experience** - Understanding of technical schema validation

#### Technical Capabilities
- [ ] **Automated Testing Tools** - axe DevTools, WAVE, Pa11y, or equivalent
- [ ] **Manual Testing Expertise** - Screen reader testing across platforms
- [ ] **Code Review Capability** - Ability to review JSON Schema structures
- [ ] **Documentation Review** - Experience auditing technical documentation

#### Business Requirements
- [ ] **Insurance** - Professional liability insurance minimum $1M
- [ ] **Availability** - Can begin audit by August 22, 2025
- [ ] **Turnaround** - Can deliver final report by August 30, 2025
- [ ] **References** - Three references from similar projects

### Preferred Qualifications

- Experience with Learning Management Systems (Canvas, Blackboard, Moodle)
- Familiarity with educational content standards (QTI, SCORM, xAPI)
- International accessibility standards expertise
- Experience with AI-driven educational content
- Published research or thought leadership in accessibility

## Scope of Work

### Phase 1: Schema Audit (Days 1-3)
- Review xats v0.2.0 JSON Schema structure
- Evaluate accessibility fields and requirements
- Assess enforcement mechanisms for compliance
- Review example documents and patterns

### Phase 2: Implementation Testing (Days 3-5)
- Test rendered content from schema
- Validate with assistive technologies
- Check keyboard navigation patterns
- Evaluate cognitive accessibility features

### Phase 3: Documentation Review (Days 5-6)
- Review authoring guidelines
- Assess implementation documentation
- Evaluate example accessibility patterns
- Check compliance guidance completeness

### Phase 4: Report Generation (Days 6-8)
- Create detailed WCAG compliance matrix
- Develop remediation priority list
- Provide legal risk assessment
- Generate executive summary

## Deliverables Required

### 1. WCAG 2.1 Compliance Report
- Success criteria evaluation (Pass/Fail/Partial/NA)
- Specific code examples of issues
- Screenshots/recordings where applicable
- Severity ratings for each issue

### 2. Remediation Roadmap
**Priority Levels:**
- **Critical** - Legal liability, complete barriers
- **High** - Significant user impact
- **Medium** - Usability degradation
- **Low** - Best practice improvements

**For Each Issue:**
- Specific location in schema
- Recommended fix with code example
- Effort estimate (hours)
- Testing methodology

### 3. Legal Risk Assessment
- Jurisdiction-specific compliance requirements
- Liability exposure analysis
- Safe harbor recommendations
- Timeline for compliance achievement

### 4. Executive Summary
- Overall compliance percentage
- Critical findings summary
- Business impact assessment
- Recommended action plan

## Evaluation Criteria

### Scoring Matrix (100 points total)

| Criterion | Weight | Description |
|-----------|--------|-------------|
| **Technical Expertise** | 30 | WCAG knowledge, testing capabilities |
| **Relevant Experience** | 25 | Educational sector, schema work |
| **Methodology** | 20 | Proposed audit approach |
| **Timeline** | 15 | Ability to meet urgent deadline |
| **Cost** | 10 | Value for services provided |

### Evaluation Process
1. Initial screening for mandatory requirements
2. Scoring of qualified vendors
3. Reference checks for top 3 vendors
4. Final selection by August 20

## Proposal Requirements

### Vendor proposals must include:

1. **Company Overview**
   - Team member credentials
   - Relevant project examples
   - Client references

2. **Technical Approach**
   - Proposed methodology
   - Testing tools and techniques
   - Timeline with milestones

3. **Deliverables Sample**
   - Example WCAG report excerpt
   - Sample remediation guidance
   - Previous executive summary

4. **Pricing Structure**
   - Fixed price for defined scope
   - Hourly rate for additional work
   - Payment terms

5. **Project Management**
   - Primary point of contact
   - Communication protocol
   - Status reporting frequency

## Timeline

| Date | Milestone |
|------|-----------|
| **Aug 18** | RFP Released |
| **Aug 19** | Vendor Q&A (2pm EST) |
| **Aug 20** | Proposals Due (5pm EST) |
| **Aug 20** | Vendor Selection |
| **Aug 21** | Contract Execution |
| **Aug 22** | Audit Begins |
| **Aug 26** | Preliminary Findings |
| **Aug 30** | Final Report Delivery |
| **Sep 1** | Board Review |

## Budget Parameters

- **Authorized Budget Range**: $15,000 - $25,000
- **Payment Terms**: 50% upon start, 50% upon delivery
- **Additional Work**: Hourly rate for post-audit support

## Submission Instructions

### Submit proposals to:
- **Email**: accessibility-audit@xats.org
- **Subject**: "xats Accessibility Audit Proposal - [Vendor Name]"
- **Format**: PDF with supplementary materials

### Questions:
- **Deadline**: August 19, 12pm EST
- **Submit to**: audit-questions@xats.org
- **Q&A Session**: August 19, 2pm EST via Zoom

## Selection Notification

- All vendors will be notified of selection decision by August 20, 8pm EST
- Selected vendor will receive contract for immediate execution
- Unsuccessful vendors will receive feedback upon request

## Confidentiality

- All vendor proposals will be kept confidential
- Schema and documentation provided under NDA
- Audit results may be shared publicly in aggregate

## Contact Information

**Technical Questions:**
- Role: xats-accessibility-champion
- Scope: Schema structure, technical requirements

**Administrative Questions:**
- Role: xats-project-steward
- Scope: Process, timeline, budget

**Contract Questions:**
- Role: Project Administrator
- Scope: Legal, payment, terms

---

## Appendix A: Current Compliance Status

### Self-Assessment Results (v0.2.0)
- **WCAG 2.1 Level A**: ~90% compliant
- **WCAG 2.1 Level AA**: ~85% compliant
- **Section 508**: ~80% compliant

### Known Issues
- Dynamic content announcements (WCAG 4.1.3)
- Error handling completeness (WCAG 3.3.1)
- Motion control specifications (WCAG 2.2.2)

### Improvements Made
- Language field now REQUIRED
- Alt text REQUIRED on all resources
- Comprehensive media accessibility
- Mathematical content accessibility
- Table structure improvements
- Assessment accommodations framework

## Appendix B: Evaluation Rubric

### Technical Expertise (30 points)
- IAAP Certifications (10 points)
- WCAG 2.1 Experience (10 points)
- Testing Tool Proficiency (5 points)
- JSON/Schema Experience (5 points)

### Relevant Experience (25 points)
- Educational Sector Work (10 points)
- Schema/API Audits (8 points)
- Similar Project Scale (7 points)

### Methodology (20 points)
- Comprehensive Approach (10 points)
- Clear Deliverables (5 points)
- Risk Identification (5 points)

### Timeline (15 points)
- Meets Deadline (10 points)
- Realistic Milestones (5 points)

### Cost (10 points)
- Within Budget (5 points)
- Value Proposition (5 points)

---

**Document Status**: FINAL
**Distribution**: Public RFP
**Next Action**: Release to vendor community