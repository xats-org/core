# @xats-org/ai-integration

AI Integration Framework for Multi-Agent Textbook Creation using the xats standard.

## Overview

The AI Integration Framework provides comprehensive tools for orchestrating multiple AI agents in collaborative educational content creation workflows. It uses xats as the data interchange format and includes robust metadata tracking, agent coordination, and quality assurance systems.

## Features

### 🤖 AI Generation Metadata
- **Model Attribution**: Track which AI models generated content
- **Prompt Preservation**: Store templates, parameters, and context
- **Confidence Scoring**: Monitor generation quality and reliability
- **Review Workflows**: Human oversight and approval processes
- **Cost Tracking**: Monitor token usage and generation costs

### 🔄 Agent Orchestration
- **Multi-Agent Workflows**: Coordinate multiple AI agents in sequence or parallel
- **Agent Registry**: Manage available agents and their capabilities
- **Dependency Management**: Define workflow steps and dependencies
- **Error Recovery**: Retry logic and graceful failure handling
- **State Management**: Preserve context between workflow steps

### 🔌 Enhanced MCP Server
- **Extended Tool Set**: AI-specific operations beyond base xats tools
- **Workflow Management**: Start, monitor, and control multi-agent workflows
- **Metadata Operations**: Add, update, and analyze AI generation metadata
- **Agent Management**: Register and coordinate AI agents
- **Review Integration**: Track human review and approval processes

## Quick Start

### Installation

```bash
npm install @xats-org/ai-integration
```

### Basic Usage

```typescript
import { 
  createFramework, 
  createAIGenerationExtension,
  WORKFLOW_TEMPLATES 
} from '@xats-org/ai-integration';

// Create framework instance
const framework = createFramework();

// Register an AI agent
framework.getAgentRegistry().register({
  id: 'content-writer',
  role: 'writer',
  capabilities: ['content-generation', 'writing'],
  version: '1.0.0'
});

// Add AI metadata to content
const metadata = createAIGenerationExtension(
  {
    provider: 'anthropic',
    id: 'claude-3-opus',
    version: '20240229'
  },
  {
    template: 'Generate educational content about {topic}',
    parameters: { topic: 'mathematics' },
    context: ['chapter context', 'learning objectives']
  }
);

// Start a multi-agent workflow
const document = {
  schemaVersion: '0.5.0',
  bibliographicEntry: { type: 'book', title: 'AI-Generated Textbook' },
  subject: 'Mathematics',
  bodyMatter: { contents: [] }
};

const executionId = await framework.getOrchestrator()
  .startWorkflow('textbook-creation', document);
```

### MCP Server Integration

```typescript
import { startAIIntegratedServer } from '@xats-org/ai-integration';

// Start enhanced MCP server
await startAIIntegratedServer({
  name: 'ai-xats-server',
  version: '0.5.0'
});
```

## Architecture

### Component Structure

```
@xats-org/ai-integration/
├── metadata/           # AI generation metadata schema and utilities
├── orchestration/      # Multi-agent workflow coordination
└── mcp/               # Enhanced MCP server with AI operations
```

### Core Classes

- **`AIIntegrationFramework`**: Main orchestration class
- **`AgentRegistry`**: Manages available AI agents
- **`WorkflowOrchestrator`**: Coordinates multi-agent workflows
- **`AIIntegratedMcpServer`**: Enhanced MCP server with AI capabilities

## AI Metadata Schema

The framework defines a comprehensive schema for tracking AI-generated content:

```typescript
interface AIGenerationExtension {
  model: {
    provider: string;    // 'openai', 'anthropic', 'google', etc.
    id: string;         // 'gpt-4', 'claude-3-opus', etc.
    version: string;    // Model version identifier
    config?: object;    // Model configuration used
  };
  prompt: {
    template: string;           // Prompt template used
    parameters: object;         // Template parameters
    context: string[];          // Context provided to model
    systemPrompt?: string;      // System prompt
    generationParams?: object;  // Temperature, etc.
  };
  metadata: {
    timestamp: string;      // ISO 8601 timestamp
    sessionId: string;      // UUID session identifier
    confidence?: number;    // 0.0 to 1.0 confidence score
    tokensUsed?: number;    // Token consumption
    cost?: number;          // Generation cost
    latencyMs?: number;     // Generation time
    attempts?: number;      // Retry attempts
  };
  review?: {
    status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';
    reviewer?: string;      // Reviewer identifier
    timestamp?: string;     // Review timestamp
    comments: string[];     // Review comments
    qualityScore?: number;  // 0.0 to 1.0 quality rating
  };
  agent?: {
    id: string;            // Agent identifier
    role: string;          // Agent role in workflow
    capabilities: string[]; // Agent capabilities
    version?: string;      // Agent version
  };
  workflow?: {
    workflowId: string;    // UUID workflow identifier
    step: number;          // Current step number
    totalSteps?: number;   // Total workflow steps
    previousAgent?: string; // Previous agent in chain
    nextAgent?: string;    // Next agent in chain
    state: object;         // Workflow state
  };
}
```

## Workflow Templates

### Textbook Creation Workflow

Pre-defined workflow for collaborative textbook creation:

1. **Content Planning** (`content-planner`)
   - Generate chapter structure and learning objectives
   - Required capabilities: `content-planning`, `structure-design`

2. **Content Writing** (`content-writer`)
   - Write educational content for chapters and sections
   - Required capabilities: `content-generation`, `writing`

3. **Example Generation** (`example-generator`)
   - Create examples, exercises, and practice problems
   - Required capabilities: `example-creation`, `problem-generation`

4. **Content Review** (`content-reviewer`)
   - Review and refine content quality
   - Required capabilities: `content-review`, `quality-assessment`

### Custom Workflows

Define custom workflows for specific use cases:

```typescript
const customWorkflow = {
  id: 'specialized-workflow',
  name: 'Specialized Content Creation',
  version: '1.0.0',
  steps: [
    {
      id: 'research',
      name: 'Research Phase',
      agentId: 'researcher',
      requiredCapabilities: ['research', 'fact-checking'],
    },
    {
      id: 'draft',
      name: 'Draft Creation',
      agentId: 'writer',
      requiredCapabilities: ['writing', 'technical-writing'],
    }
  ],
  dependencies: {
    draft: ['research']  // Draft depends on research completion
  }
};

framework.getOrchestrator().registerWorkflow(customWorkflow);
```

## MCP Tools

The enhanced MCP server provides these AI-specific tools:

- **`ai_add_generation_metadata`**: Add AI metadata to content blocks
- **`ai_start_workflow`**: Start multi-agent workflows
- **`ai_get_workflow_status`**: Monitor workflow execution
- **`ai_register_agent`**: Register AI agents for workflows
- **`ai_analyze_generation_metadata`**: Analyze AI content in documents
- **`ai_update_review_status`**: Update human review status

## Quality Assurance

### Round-trip Validation
- Ensure content fidelity through workflow steps
- Validate that AI-generated content maintains semantic structure
- Track quality degradation through agent handoffs

### Human Review Integration
- Built-in review workflows for AI-generated content
- Quality scoring and approval processes
- Revision request tracking and resolution

### Performance Monitoring
- Token usage and cost tracking
- Generation latency monitoring
- Agent performance analytics

## Examples

### Adding AI Metadata to Content

```typescript
import { createAIGenerationExtension } from '@xats-org/ai-integration';

// Create a content block with AI metadata
const contentBlock = {
  blockType: 'https://xats.org/vocabularies/blocks/paragraph',
  content: {
    runs: [
      { type: 'text', text: 'This is AI-generated educational content.' }
    ]
  },
  extensions: {
    aiGeneration: createAIGenerationExtension(
      { provider: 'openai', id: 'gpt-4', version: '2024-01-01' },
      { template: 'Generate content about {topic}', parameters: { topic: 'physics' } }
    )
  }
};
```

### Multi-Agent Workflow

```typescript
// Register agents for the workflow
const agents = [
  { id: 'planner', role: 'content-planner', capabilities: ['planning'] },
  { id: 'writer', role: 'content-writer', capabilities: ['writing'] },
  { id: 'reviewer', role: 'content-reviewer', capabilities: ['review'] }
];

agents.forEach(agent => framework.getAgentRegistry().register(agent));

// Start workflow
const executionId = await framework.getOrchestrator()
  .startWorkflow('textbook-creation', document, { 
    subject: 'Advanced Mathematics',
    targetAudience: 'undergraduate'
  });

// Monitor progress
const status = framework.getOrchestrator().getExecutionStatus(executionId);
console.log(`Workflow status: ${status?.metadata.status}`);
console.log(`Completed steps: ${status?.completedSteps.length}`);
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:watch
npm run test:coverage
```

### Type Checking

```bash
npm run typecheck
```

## Contributing

1. Follow the xats contribution guidelines
2. Ensure all tests pass
3. Add tests for new functionality
4. Update documentation as needed
5. Consider accessibility and international usage

## License

CC-BY-SA-4.0

## Related Packages

- **[@xats-org/schema](../schema)**: Core xats JSON Schema definitions
- **[@xats-org/types](../types)**: TypeScript type definitions
- **[@xats-org/validator](../validator)**: Document validation utilities
- **[@xats-org/mcp-server](../mcp-server)**: Base MCP server implementation
- **[@xats-org/renderer](../renderer)**: Document rendering framework