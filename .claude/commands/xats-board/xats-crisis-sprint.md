# xats-crisis-sprint

Coordinates emergency sprint teams to address critical blockers, particularly accessibility compliance issues that are preventing adoption.

## Purpose

This command activates a crisis response team to rapidly address critical issues blocking xats adoption, with initial focus on WCAG 2.1 AA compliance.

## Usage

```bash
claude --command xats-board:xats-crisis-sprint
```

## Process

### Phase 1: Assessment (Immediate)

1. **WCAG Consultant Initial Review**
   - Agent: `xats-wcag-consultant`
   - Assess current schema for accessibility support
   - Identify critical compliance gaps
   - Provide strategic remediation plan

2. **Technical Audit**
   - Agent: `xats-wcag-auditor`
   - Perform systematic WCAG 2.1 audit
   - Generate findings report with severity ratings
   - Create test cases for validation

3. **Impact Analysis**
   - Agent: `xats-accessibility-champion`
   - Review findings for user impact
   - Prioritize based on adoption barriers
   - Coordinate with stakeholders

### Phase 2: Planning (Day 1-2)

4. **Schema Modifications**
   - Agent: `xats-schema-engineer`
   - Review required schema changes
   - Assess backward compatibility impact
   - Plan implementation approach

5. **Validation Updates**
   - Agent: `xats-validation-engineer`
   - Create accessibility test suite
   - Update validation rules
   - Prepare compliance tests

### Phase 3: Implementation (Day 3-7)

6. **Schema Updates**
   - Implement critical accessibility fields
   - Update schema documentation
   - Create migration guidance

7. **Example Updates**
   - Update all examples for compliance
   - Add accessibility-focused examples
   - Document best practices

8. **Testing & Validation**
   - Run comprehensive accessibility tests
   - Validate with assistive technologies
   - Document compliance level

### Phase 4: Documentation (Day 7-10)

9. **Compliance Documentation**
   - Generate VPAT (Voluntary Product Accessibility Template)
   - Create accessibility statement
   - Update implementation guides

10. **Communication**
    - Agent: `xats-project-steward`
    - Prepare stakeholder updates
    - Document resolved issues
    - Plan ongoing compliance monitoring

## Sprint Team Composition

### Core Team
- **Lead**: `xats-project-steward` (coordination)
- **Consultants**: `xats-wcag-consultant`, `xats-wcag-auditor`
- **Implementation**: `xats-schema-engineer`, `xats-validation-engineer`
- **Advocacy**: `xats-accessibility-champion`, `xats-student-advocate`

### Support Team
- **Documentation**: `xats-doc-writer`
- **Testing**: `xats-test-coordinator`
- **Integration**: `xats-lms-integrator`

## Success Criteria

1. **Critical Issues Resolved**: All Critical severity WCAG findings addressed
2. **Major Issues Planned**: Roadmap for Major severity findings
3. **Compliance Documented**: VPAT and accessibility statement completed
4. **Tests Automated**: Accessibility validation integrated into CI/CD
5. **Examples Updated**: All examples demonstrate accessibility best practices

## Communication

- **Daily Standups**: Quick status updates
- **Issue Tracking**: Use GitHub issues with `accessibility` and `critical` labels
- **Progress Reports**: Weekly summary to stakeholders
- **Final Report**: Comprehensive compliance assessment

## Example Execution

The command will:
1. Convene the crisis team
2. Run accessibility audit
3. Generate prioritized action items
4. Implement critical fixes
5. Document compliance status
6. Report to stakeholders

## Related Commands

- `xats-board:board-meeting` - For strategic decisions
- `xats-dev:schema-implement` - For implementation
- `xats-user:validate-content` - For testing