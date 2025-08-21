/**
 * @xats-org/testing - Testing framework for xats renderer validation
 *
 * This package provides comprehensive testing capabilities for bidirectional
 * renderers including round-trip fidelity testing, WCAG compliance validation,
 * and performance benchmarking.
 */

// Round-trip testing
export {
  RoundTripTester,
  RoundTripTestFactory,
  type RoundTripTestSuite,
  type RoundTripSummary,
} from './round-trip.js';

// WCAG compliance testing
export { WcagTester, WcagTestFactory } from './wcag.js';

// Performance benchmarking
export {
  PerformanceBenchmark,
  BenchmarkTestFactory,
  type BenchmarkResult,
  type BenchmarkTestCase,
  type BenchmarkSuiteResult,
  type BenchmarkSuiteConfig,
  type BenchmarkSummary,
  type PerformanceMetrics,
  type MemoryMetrics,
} from './benchmarks.js';

// Re-export relevant types from @xats-org/types
export type {
  BidirectionalRenderer,
  RoundTripOptions,
  RoundTripResult,
  WcagResult,
  WcagCompliance,
  AccessibilityAudit,
} from '@xats-org/types';

/**
 * Test suite orchestrator for comprehensive renderer validation
 */
export class RendererTestSuite {
  private roundTripTester: RoundTripTester;
  private wcagTester: WcagTester;
  private benchmark: PerformanceBenchmark;

  constructor(renderer: BidirectionalRenderer, options: RendererTestSuiteOptions = {}) {
    this.roundTripTester = new RoundTripTester(renderer, options.roundTrip);
    this.wcagTester = new WcagTester(options.wcag);
    this.benchmark = new PerformanceBenchmark(options.benchmark);
  }

  /**
   * Run complete test suite including fidelity, accessibility, and performance tests
   */
  async runCompleteSuite(
    documents: XatsDocument[],
    benchmarkCases?: BenchmarkTestCase[]
  ): Promise<CompleteSuiteResult> {
    console.log('Starting complete renderer test suite...');

    // Run round-trip tests
    console.log('Running round-trip fidelity tests...');
    const roundTripResults = await this.roundTripTester.testDocuments(documents);

    // Run WCAG compliance tests on rendered content
    console.log('Running WCAG compliance tests...');
    const wcagResults: WcagSuiteResult[] = [];

    for (const document of documents) {
      const renderResult = await this.roundTripTester['renderer'].render(document);
      const wcagResult = await this.wcagTester.auditAccessibility(renderResult.content);
      wcagResults.push({
        documentId: document.bibliographicEntry?.title || 'unnamed',
        audit: wcagResult,
      });
    }

    // Run performance benchmarks if provided
    let benchmarkResults: BenchmarkSuiteResult | null = null;
    if (benchmarkCases && benchmarkCases.length > 0) {
      console.log('Running performance benchmarks...');
      benchmarkResults = await this.benchmark.runBenchmarkSuite(
        this.roundTripTester['renderer'],
        benchmarkCases
      );
    }

    // Calculate overall results
    const overallSuccess = this.calculateOverallSuccess(
      roundTripResults,
      wcagResults,
      benchmarkResults
    );

    return {
      success: overallSuccess,
      roundTrip: roundTripResults,
      wcag: wcagResults,
      benchmark: benchmarkResults,
      summary: {
        totalDocuments: documents.length,
        roundTripPassRate: roundTripResults.summary.passCount / roundTripResults.summary.totalTests,
        wcagComplianceRate: this.calculateWcagComplianceRate(wcagResults),
        benchmarkPassRate: benchmarkResults
          ? benchmarkResults.summary.successCount / benchmarkResults.summary.totalTests
          : null,
      },
      testedAt: new Date(),
    };
  }

  /**
   * Calculate WCAG compliance rate
   */
  private calculateWcagComplianceRate(wcagResults: WcagSuiteResult[]): number {
    if (wcagResults.length === 0) return 0;

    const compliantCount = wcagResults.filter((r) => r.audit.compliant).length;
    return compliantCount / wcagResults.length;
  }

  /**
   * Calculate overall test suite success
   */
  private calculateOverallSuccess(
    roundTrip: RoundTripTestSuite,
    wcag: WcagSuiteResult[],
    benchmark: BenchmarkSuiteResult | null
  ): boolean {
    // Round-trip tests must have > 80% pass rate
    const roundTripPass = roundTrip.summary.passCount / roundTrip.summary.totalTests > 0.8;

    // WCAG tests must have > 90% compliance rate
    const wcagPass = this.calculateWcagComplianceRate(wcag) > 0.9;

    // Benchmark tests must have > 80% pass rate (if run)
    const benchmarkPass =
      !benchmark || benchmark.summary.successCount / benchmark.summary.totalTests > 0.8;

    return roundTripPass && wcagPass && benchmarkPass;
  }
}

/**
 * Options for configuring the renderer test suite
 */
export interface RendererTestSuiteOptions {
  roundTrip?: RoundTripOptions;
  wcag?: axe.RunOptions;
  benchmark?: Partial<BenchmarkSuiteConfig>;
}

/**
 * Complete test suite result
 */
export interface CompleteSuiteResult {
  success: boolean;
  roundTrip: RoundTripTestSuite;
  wcag: WcagSuiteResult[];
  benchmark: BenchmarkSuiteResult | null;
  summary: SuiteSummary;
  testedAt: Date;
}

/**
 * WCAG test result for a single document
 */
export interface WcagSuiteResult {
  documentId: string;
  audit: AccessibilityAudit;
}

/**
 * Summary of test suite results
 */
export interface SuiteSummary {
  totalDocuments: number;
  roundTripPassRate: number;
  wcagComplianceRate: number;
  benchmarkPassRate: number | null;
}

// Import required types
import { PerformanceBenchmark } from './benchmarks.js';
import { RoundTripTester } from './round-trip.js';
import { WcagTester } from './wcag.js';

import type {
  BenchmarkTestCase,
  BenchmarkSuiteConfig,
  BenchmarkSuiteResult,
} from './benchmarks.js';
import type { RoundTripTestSuite } from './round-trip.js';
import type {
  XatsDocument,
  RoundTripOptions,
  AccessibilityAudit,
  BidirectionalRenderer,
} from '@xats-org/types';
import type * as axe from 'axe-core';
