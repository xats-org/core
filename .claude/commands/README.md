# xats Command Collection

Comprehensive workflow commands for the xats (Extensible Academic Textbook Schema) project, organized by functional area.

## Command Structure

Commands are organized into three categories:

```
commands/
├── xats-board/     # Board governance and decision-making
├── xats-dev/       # Development team workflows
└── xats-user/      # User and consumer workflows
```

## Command Namespaces

### 📋 `/xats-board:*` - Board Governance
Strategic and governance commands for the xats standards board:

- **board-meeting** - Convenes full board for major decisions
- **feature-ideation** - Facilitates creative feature brainstorming
- **issue-triage** - Reviews and prioritizes GitHub issues
- **schema-review** - Technical review of proposed changes
- **impact-assessment** - Analyzes effects on all stakeholders
- **release-planning** - Coordinates version releases
- **extension-review** - Evaluates extension proposals
- **stakeholder-feedback** - Gathers input from user groups
- **memory-utils** - Manages board memory and archives

### 💻 `/xats-dev:*` - Development Workflows
Core development team workflows:

- **schema-implement** - Implements new features with full development workflow
- **test-suite** - Creates comprehensive test suites for schema features
- **code-review** - Performs thorough code reviews of changes

### 👤 `/xats-user:*` - User Workflows
Commands for schema consumers and third-party developers:

- **create-textbook** - Helps create xats-compliant textbooks from scratch or existing content
- **validate-content** - Validates xats content for compliance and quality
- **create-extension** - Guides users through creating custom extensions

## Usage

Commands follow the namespace pattern: `/<namespace>:<command>`

```bash
# Board commands
claude --command xats-board:board-meeting --topics "v0.2.0-features"
claude --command xats-board:issue-triage --milestone "v0.1.0"

# Development commands
claude --command xats-dev:schema-implement --feature "adaptive-pathways" --issue "123"
claude --command xats-dev:test-suite --target "assessment-blocks"
claude --command xats-dev:code-review --pr "456"

# User commands
claude --command xats-user:create-textbook --title "Introduction to Physics"
claude --command xats-user:validate-content --file "textbook.json"
claude --command xats-user:create-extension --name "interactive-simulations"
```

## Quick Start

### For Board Members
1. **Strategic planning?** Use `/xats-board:board-meeting`
2. **Review issues?** Try `/xats-board:issue-triage`
3. **Assess impact?** Run `/xats-board:impact-assessment`

### For Developers
1. **Implement feature?** Start with `/xats-dev:schema-implement`
2. **Write tests?** Use `/xats-dev:test-suite`
3. **Review code?** Try `/xats-dev:code-review`

### For Users
1. **Create content?** Begin with `/xats-user:create-textbook`
2. **Validate content?** Use `/xats-user:validate-content`
3. **Build extension?** Try `/xats-user:create-extension`

## Command Workflow Integration

Commands leverage the full suite of available agents:

### Board Workflows
Board commands coordinate multiple board member agents:
- xats-project-steward (chair)
- xats-schema-engineer
- xats-pedagogy-architect
- xats-accessibility-champion
- Other board members as needed

### Development Workflows
Development commands use technical agents:
- xats-dev-lead
- xats-test-coordinator
- xats-validation-engineer
- Language-specific pros (python-pro, typescript-pro, etc.)
- code-reviewer, test-automator

### User Workflows
User commands guide with consumer-focused agents:
- xats-consumer-advocate
- xats-implementation-guide
- xats-extension-developer
- xats-doc-writer

## Memory System

Commands utilize persistent memory for continuity:

```
.claude/memory/
├── meetings/       # Board meeting records
├── issues/         # Issue-specific context
├── decisions/      # Architecture decisions
├── designs/        # Technical designs
└── context/        # Shared state
```

## Examples

### Feature Development
```bash
# Full feature implementation workflow
claude --command xats-dev:schema-implement \
  --feature "adaptive-learning-paths" \
  --issue "234"

# This will:
# 1. Review requirements from issue #234
# 2. Create technical design
# 3. Implement schema changes
# 4. Create examples
# 5. Write tests
# 6. Update documentation
# 7. Create pull request
```

### Board Decision Making
```bash
# Convene board for major decision
claude --command xats-board:board-meeting \
  --topics "v0.3.0-roadmap,assessment-redesign"

# This will:
# 1. Load relevant context from memory
# 2. Invoke relevant board members
# 3. Facilitate discussion
# 4. Document decisions
# 5. Create action items
# 6. Update project roadmap
```

### Content Creation
```bash
# Create new textbook
claude --command xats-user:create-textbook \
  --title "Advanced Mathematics" \
  --source "outline.md"

# This will:
# 1. Parse source material
# 2. Create xats structure
# 3. Add metadata
# 4. Generate content blocks
# 5. Create assessments
# 6. Validate output
# 7. Provide implementation guide
```

## Command Development

### Adding New Commands

1. Choose appropriate category folder
2. Create `.md` file with frontmatter:
   ```yaml
   ---
   name: command-name
   description: What this command does
   model: claude-sonnet-4-20250514  # or opus/haiku
   arguments:
     param:
       description: Parameter description
       required: true/false
       example: "example value"
   ---
   ```
3. Define workflow and agent coordination
4. Update this README

### Command Best Practices

- Use descriptive names
- Provide clear argument descriptions
- Coordinate appropriate agents
- Integrate with memory system
- Include validation and error handling
- Document expected outputs

## Integration with GitHub

Commands integrate with GitHub for project management:

- Create issues and pull requests
- Update issue status
- Link commits to issues
- Post review comments
- Track milestones

## Command Availability

Commands are loaded from:
- **Project-level**: `.claude/commands/` (this directory)
- **User-level**: `~/.claude/commands/` (your personal commands)

Project-level commands take precedence when there are naming conflicts.

## Troubleshooting

### Command Not Found
- Check command name and category
- Ensure proper folder structure
- Verify command file exists

### Missing Arguments
- Review command documentation
- Check required vs optional arguments
- Use --help for argument details

### Agent Coordination Issues
- Verify agents are available
- Check agent model specifications
- Review agent dependencies

## Contributing

To contribute new commands:
1. Identify workflow need
2. Choose appropriate category
3. Design agent coordination
4. Implement command
5. Test thoroughly
6. Document usage
7. Submit pull request

## License

Part of the xats project - see main repository for license details.