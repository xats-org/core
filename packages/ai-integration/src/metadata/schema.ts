/**
 * @xats-org/ai-integration - AI Generation Metadata Extension Schema
 *
 * This module defines the schema for tracking AI-generated content within xats documents.
 * It provides comprehensive metadata about model attribution, prompt preservation,
 * confidence scoring, and human review tracking.
 */

import { randomUUID } from 'node:crypto';

import { z } from 'zod';

/**
 * Model information for AI attribution
 */
export const AIModelSchema = z.object({
  /** Provider of the AI model (e.g., 'openai', 'anthropic', 'google') */
  provider: z.string().min(1),
  /** Model identifier (e.g., 'gpt-4', 'claude-3-opus') */
  id: z.string().min(1),
  /** Model version (e.g., '20240229', 'v1.2.3') */
  version: z.string().min(1),
  /** Optional model configuration used */
  config: z.record(z.unknown()).optional(),
});

/**
 * Prompt information for generation transparency
 */
export const AIPromptSchema = z.object({
  /** Template used for generation */
  template: z.string().min(1),
  /** Parameters passed to the template */
  parameters: z.record(z.unknown()).default({}),
  /** Context provided to the model */
  context: z.array(z.string()).default([]),
  /** System prompt used */
  systemPrompt: z.string().optional(),
  /** Temperature or other generation parameters */
  generationParams: z.record(z.unknown()).optional(),
});

/**
 * Generation metadata tracking
 */
export const AIMetadataSchema = z.object({
  /** Timestamp when generation occurred */
  timestamp: z.string().datetime(),
  /** Unique session identifier */
  sessionId: z.string().uuid(),
  /** Confidence score (0.0 to 1.0) */
  confidence: z.number().min(0).max(1).optional(),
  /** Number of tokens used in generation */
  tokensUsed: z.number().int().positive().optional(),
  /** Cost of the generation operation */
  cost: z.number().positive().optional(),
  /** Generation latency in milliseconds */
  latencyMs: z.number().int().positive().optional(),
  /** Number of generation attempts */
  attempts: z.number().int().positive().default(1),
});

/**
 * Human review tracking
 */
export const AIReviewSchema = z.object({
  /** Review status */
  status: z.enum(['pending', 'in_review', 'approved', 'rejected', 'needs_revision']),
  /** Reviewer identifier */
  reviewer: z.string().optional(),
  /** Review timestamp */
  timestamp: z.string().datetime().optional(),
  /** Review comments */
  comments: z.array(z.string()).default([]),
  /** Quality score (0.0 to 1.0) */
  qualityScore: z.number().min(0).max(1).optional(),
  /** Revision requests */
  revisionRequests: z.array(z.string()).default([]),
});

/**
 * Agent orchestration metadata
 */
export const AIAgentSchema = z.object({
  /** Agent identifier */
  id: z.string().min(1),
  /** Agent role in the workflow */
  role: z.string().min(1),
  /** Agent capabilities */
  capabilities: z.array(z.string()).default([]),
  /** Agent version */
  version: z.string().optional(),
});

/**
 * Workflow context tracking
 */
export const AIWorkflowSchema = z.object({
  /** Workflow identifier */
  workflowId: z.string().uuid(),
  /** Step within the workflow */
  step: z.number().int().positive(),
  /** Total steps in workflow */
  totalSteps: z.number().int().positive().optional(),
  /** Previous agent in the workflow */
  previousAgent: z.string().optional(),
  /** Next agent in the workflow */
  nextAgent: z.string().optional(),
  /** Workflow state */
  state: z.record(z.unknown()).default({}),
});

/**
 * Complete AI Generation Extension
 * This is the main schema that gets added to xats objects under the 'aiGeneration' extension key
 */
export const AIGenerationExtensionSchema = z.object({
  /** Model attribution */
  model: AIModelSchema,
  /** Prompt information */
  prompt: AIPromptSchema,
  /** Generation metadata */
  metadata: AIMetadataSchema,
  /** Human review tracking */
  review: AIReviewSchema.optional(),
  /** Agent information */
  agent: AIAgentSchema.optional(),
  /** Workflow context */
  workflow: AIWorkflowSchema.optional(),
  /** Custom metadata for specific use cases */
  custom: z.record(z.unknown()).optional(),
});

// Type exports
export type AIModel = z.infer<typeof AIModelSchema>;
export type AIPrompt = z.infer<typeof AIPromptSchema>;
export type AIMetadata = z.infer<typeof AIMetadataSchema>;
export type AIReview = z.infer<typeof AIReviewSchema>;
export type AIAgent = z.infer<typeof AIAgentSchema>;
export type AIWorkflow = z.infer<typeof AIWorkflowSchema>;
export type AIGenerationExtension = z.infer<typeof AIGenerationExtensionSchema>;

/**
 * Helper function to create a minimal AI generation extension
 */
export function createAIGenerationExtension(
  model: AIModel,
  prompt: AIPrompt,
  sessionId?: string
): AIGenerationExtension {
  return {
    model,
    prompt,
    metadata: {
      timestamp: new Date().toISOString(),
      sessionId: sessionId || randomUUID(),
      attempts: 1,
    },
  };
}

/**
 * Helper function to add review to an existing AI generation extension
 */
export function addReviewToExtension(
  extension: AIGenerationExtension,
  review: Partial<AIReview>
): AIGenerationExtension {
  return {
    ...extension,
    review: {
      status: 'pending',
      comments: [],
      revisionRequests: [],
      ...review,
    },
  };
}

/**
 * Helper function to validate AI generation extension
 */
export function validateAIGenerationExtension(data: unknown): AIGenerationExtension {
  return AIGenerationExtensionSchema.parse(data);
}

/**
 * Helper function to check if an object has AI generation metadata
 */
export function hasAIGenerationMetadata(
  obj: unknown
): obj is { extensions: { aiGeneration: AIGenerationExtension } } {
  // SECURITY: Fixed type comparison vulnerability
  return Boolean(
    obj &&
      typeof obj === 'object' &&
      obj != null &&
      'extensions' in obj &&
      obj.extensions &&
      typeof obj.extensions === 'object' &&
      obj.extensions != null &&
      'aiGeneration' in obj.extensions &&
      (obj.extensions as Record<string, unknown>).aiGeneration &&
      typeof (obj.extensions as Record<string, unknown>).aiGeneration === 'object'
  );
}

/**
 * Helper function to extract AI generation metadata from an object
 */
export function getAIGenerationMetadata(obj: unknown): AIGenerationExtension | null {
  if (hasAIGenerationMetadata(obj)) {
    try {
      return validateAIGenerationExtension(obj.extensions.aiGeneration);
    } catch {
      return null;
    }
  }
  return null;
}
