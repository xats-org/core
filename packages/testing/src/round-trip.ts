/**
 * Round-trip testing framework for bidirectional renderers
 */

import * as deepDiff from 'deep-diff';
import type {
  XatsDocument,
  BidirectionalRenderer,
  RoundTripOptions,
  RoundTripResult,
  DocumentDifference,
  RoundTripMetrics,
} from '@xats-org/types';

/**
 * Round-trip test suite for validating renderer fidelity
 */
export class RoundTripTester {
  private renderer: BidirectionalRenderer;
  private options: Required<RoundTripOptions>;

  constructor(renderer: BidirectionalRenderer, options: RoundTripOptions = {}) {
    this.renderer = renderer;
    this.options = {
      fidelityThreshold: 0.95,
      semanticComparison: true,
      ignoreElements: ['id', 'extensions'],
      includeIds: false,
      includeTags: false,
      includeExtensions: false,
      preserveMetadata: true,
      strictMode: false,
      customParsers: {},
      baseUrl: '',
      encoding: 'utf-8',
      ...options,
    };
  }

  /**
   * Test round-trip conversion for a document
   */
  async testDocument(document: XatsDocument): Promise<RoundTripResult> {
    const startTime = performance.now();

    try {
      // Step 1: Render document to target format
      const renderStart = performance.now();
      const renderResult = await this.renderer.render(document, this.options);
      const renderTime = performance.now() - renderStart;

      // Step 2: Parse back to xats format
      const parseStart = performance.now();
      const parseResult = await this.renderer.parse(renderResult.content, this.options);
      const parseTime = performance.now() - parseStart;

      // Step 3: Compare documents
      const differences = this.compareDocuments(document, parseResult.document);
      const fidelityScore = this.calculateFidelityScore(differences);
      const success = fidelityScore >= this.options.fidelityThreshold;

      // Step 4: Collect metrics
      const totalTime = performance.now() - startTime;
      const metrics: RoundTripMetrics = {
        renderTime,
        parseTime,
        totalTime,
        documentSize: this.calculateDocumentSize(document),
        outputSize: renderResult.content.length,
        memoryUsage: this.estimateMemoryUsage(document, parseResult.document),
      };

      return {
        success,
        fidelityScore,
        original: document,
        roundTrip: parseResult.document,
        differences,
        metrics,
      };
    } catch (error) {
      const totalTime = performance.now() - startTime;
      const metrics: RoundTripMetrics = {
        renderTime: 0,
        parseTime: 0,
        totalTime,
        documentSize: this.calculateDocumentSize(document),
        outputSize: 0,
      };

      return {
        success: false,
        fidelityScore: 0,
        original: document,
        roundTrip: document, // Fallback
        differences: [
          {
            type: 'changed',
            path: 'root',
            original: document,
            roundTrip: null,
            impact: 'critical',
          },
        ],
        metrics,
      };
    }
  }

  /**
   * Test multiple documents and return aggregate results
   */
  async testDocuments(documents: XatsDocument[]): Promise<RoundTripTestSuite> {
    const results: RoundTripResult[] = [];
    let totalTime = 0;
    let passCount = 0;
    let failCount = 0;
    let totalFidelityScore = 0;

    for (const document of documents) {
      const result = await this.testDocument(document);
      results.push(result);

      totalTime += result.metrics.totalTime;
      if (result.success) {
        passCount++;
      } else {
        failCount++;
      }
      totalFidelityScore += result.fidelityScore;
    }

    const averageFidelityScore = documents.length > 0 ? totalFidelityScore / documents.length : 0;

    return {
      results,
      summary: {
        totalTests: documents.length,
        passCount,
        failCount,
        averageFidelityScore,
        totalTime,
        renderer: this.renderer.format,
        threshold: this.options.fidelityThreshold,
      },
    };
  }

  /**
   * Compare two xats documents and identify differences
   */
  private compareDocuments(original: XatsDocument, roundTrip: XatsDocument): DocumentDifference[] {
    const differences: DocumentDifference[] = [];
    
    // Normalize documents for comparison if needed
    const normalizedOriginal = this.normalizeDocument(original);
    const normalizedRoundTrip = this.normalizeDocument(roundTrip);

    // Use deep-diff to find structural differences
    const diffs = deepDiff.diff(normalizedOriginal, normalizedRoundTrip) || [];

    for (const diff of diffs) {
      const path = this.getDiffPath(diff);
      
      // Skip ignored elements
      if (this.shouldIgnorePath(path)) {
        continue;
      }

      const documentDiff: DocumentDifference = {
        type: this.mapDiffType(diff.kind),
        path,
        original: diff.lhs,
        roundTrip: diff.rhs,
        impact: this.assessImpact(path, diff),
      };

      differences.push(documentDiff);
    }

    return differences;
  }

  /**
   * Calculate fidelity score based on differences found
   */
  private calculateFidelityScore(differences: DocumentDifference[]): number {
    if (differences.length === 0) {
      return 1.0; // Perfect fidelity
    }

    let totalPenalty = 0;
    const weights = {
      critical: 0.5,
      major: 0.2,
      minor: 0.05,
      cosmetic: 0.01,
    };

    for (const diff of differences) {
      totalPenalty += weights[diff.impact];
    }

    // Cap the penalty at 1.0 to ensure score doesn't go negative
    const cappedPenalty = Math.min(totalPenalty, 1.0);
    return Math.max(0, 1.0 - cappedPenalty);
  }

  /**
   * Normalize document for comparison
   */
  private normalizeDocument(document: XatsDocument): XatsDocument {
    if (!this.options.semanticComparison) {
      return document;
    }

    // Clone the document for normalization
    const normalized = JSON.parse(JSON.stringify(document)) as XatsDocument;

    // Remove elements that should be ignored
    this.removeIgnoredElements(normalized, this.options.ignoreElements);

    return normalized;
  }

  /**
   * Remove ignored elements from document structure
   */
  private removeIgnoredElements(obj: unknown, ignoreList: string[]): void {
    if (!obj || typeof obj !== 'object') {
      return;
    }

    for (const key of ignoreList) {
      if (key in obj) {
        delete (obj as Record<string, unknown>)[key];
      }
    }

    // Recursively process nested objects and arrays
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          this.removeIgnoredElements(item, ignoreList);
        }
      } else if (typeof value === 'object') {
        this.removeIgnoredElements(value, ignoreList);
      }
    }
  }

  /**
   * Get string path for a diff object
   */
  private getDiffPath(diff: deepDiff.Diff<unknown, unknown>): string {
    if (!diff.path) {
      return 'root';
    }
    return diff.path.join('.');
  }

  /**
   * Check if a path should be ignored during comparison
   */
  private shouldIgnorePath(path: string): boolean {
    return this.options.ignoreElements.some(ignored => path.includes(ignored));
  }

  /**
   * Map deep-diff kind to DocumentDifference type
   */
  private mapDiffType(kind: string): DocumentDifference['type'] {
    switch (kind) {
      case 'D': return 'missing';
      case 'N': return 'added';
      case 'E': return 'changed';
      case 'A': return 'changed'; // Array changes
      default: return 'changed';
    }
  }

  /**
   * Assess the impact of a difference
   */
  private assessImpact(path: string, diff: deepDiff.Diff<unknown, unknown>): DocumentDifference['impact'] {
    // Critical: Missing core document structure
    if (path.includes('schemaVersion') || path.includes('bibliographicEntry.title')) {
      return 'critical';
    }

    // Major: Missing important content or structure
    if (path.includes('bodyMatter') || path.includes('contents') || path.includes('blockType')) {
      return 'major';
    }

    // Minor: Missing optional metadata or formatting
    if (path.includes('tags') || path.includes('label') || path.includes('extensions')) {
      return 'minor';
    }

    // Cosmetic: Changes that don't affect meaning
    return 'cosmetic';
  }

  /**
   * Calculate document size in bytes (approximate)
   */
  private calculateDocumentSize(document: XatsDocument): number {
    return JSON.stringify(document).length;
  }

  /**
   * Estimate memory usage (simplified)
   */
  private estimateMemoryUsage(original: XatsDocument, roundTrip: XatsDocument): number {
    return this.calculateDocumentSize(original) + this.calculateDocumentSize(roundTrip);
  }
}

/**
 * Results from testing multiple documents
 */
export interface RoundTripTestSuite {
  results: RoundTripResult[];
  summary: RoundTripSummary;
}

/**
 * Summary of round-trip test results
 */
export interface RoundTripSummary {
  totalTests: number;
  passCount: number;
  failCount: number;
  averageFidelityScore: number;
  totalTime: number;
  renderer: string;
  threshold: number;
}

/**
 * Factory for creating round-trip testers
 */
export class RoundTripTestFactory {
  /**
   * Create a tester for the specified renderer
   */
  static createTester(
    renderer: BidirectionalRenderer,
    options?: RoundTripOptions
  ): RoundTripTester {
    return new RoundTripTester(renderer, options);
  }

  /**
   * Create multiple testers for different renderers
   */
  static createTesters(
    renderers: BidirectionalRenderer[],
    options?: RoundTripOptions
  ): Map<string, RoundTripTester> {
    const testers = new Map<string, RoundTripTester>();

    for (const renderer of renderers) {
      testers.set(renderer.format, new RoundTripTester(renderer, options));
    }

    return testers;
  }
}