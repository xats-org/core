/**
 * @xats-org/ai-integration - AI Metadata Schema Tests
 */

import { randomUUID } from 'node:crypto';
import { describe, test, expect } from 'vitest';

import {
  AIModelSchema,
  AIPromptSchema,
  AIMetadataSchema,
  AIReviewSchema,
  AIGenerationExtensionSchema,
  createAIGenerationExtension,
  addReviewToExtension,
  validateAIGenerationExtension,
  hasAIGenerationMetadata,
  getAIGenerationMetadata,
  type AIModel,
  type AIPrompt,
} from '../metadata/schema.js';

describe('AI Metadata Schema', () => {
  describe('AIModelSchema', () => {
    test('validates valid model data', () => {
      const model = {
        provider: 'anthropic',
        id: 'claude-3-opus',
        version: '20240229',
        config: { temperature: 0.7 },
      };

      expect(() => AIModelSchema.parse(model)).not.toThrow();
    });

    test('requires provider, id, and version', () => {
      expect(() => AIModelSchema.parse({})).toThrow();
      expect(() => AIModelSchema.parse({ provider: 'anthropic' })).toThrow();
      expect(() => AIModelSchema.parse({ provider: 'anthropic', id: 'claude-3-opus' })).toThrow();
    });

    test('allows optional config', () => {
      const model = {
        provider: 'openai',
        id: 'gpt-4',
        version: '2024-01-01',
      };

      expect(() => AIModelSchema.parse(model)).not.toThrow();
    });
  });

  describe('AIPromptSchema', () => {
    test('validates valid prompt data', () => {
      const prompt = {
        template: 'Generate content about {topic}',
        parameters: { topic: 'mathematics' },
        context: ['previous chapter', 'learning objectives'],
        systemPrompt: 'You are an educational content creator',
        generationParams: { temperature: 0.8 },
      };

      expect(() => AIPromptSchema.parse(prompt)).not.toThrow();
    });

    test('requires template', () => {
      expect(() => AIPromptSchema.parse({})).toThrow();
    });

    test('provides defaults for optional fields', () => {
      const prompt = { template: 'Simple template' };
      const parsed = AIPromptSchema.parse(prompt);

      expect(parsed.parameters).toEqual({});
      expect(parsed.context).toEqual([]);
    });
  });

  describe('AIMetadataSchema', () => {
    test('validates valid metadata', () => {
      const metadata = {
        timestamp: new Date().toISOString(),
        sessionId: randomUUID(),
        confidence: 0.95,
        tokensUsed: 1500,
        cost: 0.05,
        latencyMs: 2000,
        attempts: 1,
      };

      expect(() => AIMetadataSchema.parse(metadata)).not.toThrow();
    });

    test('requires timestamp and sessionId', () => {
      expect(() => AIMetadataSchema.parse({})).toThrow();
    });

    test('validates confidence range', () => {
      const base = {
        timestamp: new Date().toISOString(),
        sessionId: randomUUID(),
      };

      expect(() => AIMetadataSchema.parse({ ...base, confidence: -0.1 })).toThrow();
      expect(() => AIMetadataSchema.parse({ ...base, confidence: 1.1 })).toThrow();
      expect(() => AIMetadataSchema.parse({ ...base, confidence: 0.5 })).not.toThrow();
    });
  });

  describe('AIReviewSchema', () => {
    test('validates review statuses', () => {
      const validStatuses = ['pending', 'in_review', 'approved', 'rejected', 'needs_revision'];

      for (const status of validStatuses) {
        expect(() => AIReviewSchema.parse({ status })).not.toThrow();
      }

      expect(() => AIReviewSchema.parse({ status: 'invalid' })).toThrow();
    });

    test('provides defaults for arrays', () => {
      const review = AIReviewSchema.parse({ status: 'pending' });
      expect(review.comments).toEqual([]);
      expect(review.revisionRequests).toEqual([]);
    });
  });

  describe('AIGenerationExtensionSchema', () => {
    test('validates complete extension', () => {
      const extension = {
        model: {
          provider: 'anthropic',
          id: 'claude-3-opus',
          version: '20240229',
        },
        prompt: {
          template: 'Generate educational content',
          parameters: {},
          context: [],
        },
        metadata: {
          timestamp: new Date().toISOString(),
          sessionId: randomUUID(),
        },
        review: {
          status: 'approved' as const,
          reviewer: 'educator-123',
          timestamp: new Date().toISOString(),
          comments: ['Excellent content'],
        },
        agent: {
          id: 'content-writer',
          role: 'writer',
          capabilities: ['writing', 'education'],
        },
        workflow: {
          workflowId: randomUUID(),
          step: 1,
          totalSteps: 3,
          state: {},
        },
      };

      expect(() => AIGenerationExtensionSchema.parse(extension)).not.toThrow();
    });

    test('requires model, prompt, and metadata', () => {
      expect(() => AIGenerationExtensionSchema.parse({})).toThrow();
    });
  });

  describe('Helper Functions', () => {
    test('createAIGenerationExtension creates valid extension', () => {
      const model: AIModel = {
        provider: 'anthropic',
        id: 'claude-3-opus',
        version: '20240229',
      };

      const prompt: AIPrompt = {
        template: 'Test template',
        parameters: {},
        context: [],
      };

      const extension = createAIGenerationExtension(model, prompt);

      expect(() => validateAIGenerationExtension(extension)).not.toThrow();
      expect(extension.model).toEqual(model);
      expect(extension.prompt).toEqual(prompt);
      expect(extension.metadata.timestamp).toBeDefined();
      expect(extension.metadata.sessionId).toBeDefined();
    });

    test('addReviewToExtension adds review to extension', () => {
      const extension = createAIGenerationExtension(
        { provider: 'test', id: 'test', version: '1.0' },
        { template: 'test', parameters: {}, context: [] }
      );

      const withReview = addReviewToExtension(extension, {
        status: 'approved',
        reviewer: 'test-reviewer',
        comments: ['Good work'],
      });

      expect(withReview.review).toBeDefined();
      expect(withReview.review?.status).toBe('approved');
      expect(withReview.review?.reviewer).toBe('test-reviewer');
      expect(withReview.review?.comments).toEqual(['Good work']);
    });

    test('hasAIGenerationMetadata correctly identifies objects', () => {
      const withMetadata = {
        extensions: {
          aiGeneration: {
            model: { provider: 'test', id: 'test', version: '1.0' },
            prompt: { template: 'test', parameters: {}, context: [] },
            metadata: {
              timestamp: new Date().toISOString(),
              sessionId: randomUUID(),
            },
          },
        },
      };

      const withoutMetadata = { id: 'test' };

      expect(hasAIGenerationMetadata(withMetadata)).toBe(true);
      expect(hasAIGenerationMetadata(withoutMetadata)).toBe(false);
      expect(hasAIGenerationMetadata(null)).toBe(false);
    });

    test('getAIGenerationMetadata extracts metadata correctly', () => {
      const extension = createAIGenerationExtension(
        { provider: 'test', id: 'test', version: '1.0' },
        { template: 'test', parameters: {}, context: [] }
      );

      const obj = {
        extensions: { aiGeneration: extension },
      };

      const extracted = getAIGenerationMetadata(obj);
      expect(extracted).toEqual(extension);

      const empty = getAIGenerationMetadata({});
      expect(empty).toBeNull();
    });
  });
});
