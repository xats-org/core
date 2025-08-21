/**
 * Performance benchmarking system for renderer testing
 */

import type {
  XatsDocument,
  BidirectionalRenderer,
  RoundTripMetrics,
} from '@xats-org/types';

/**
 * Performance benchmark result
 */
export interface BenchmarkResult {
  renderer: string;
  testCase: string;
  metrics: PerformanceMetrics;
  memoryUsage: MemoryMetrics;
  success: boolean;
  error?: string;
}

/**
 * Detailed performance metrics
 */
export interface PerformanceMetrics {
  renderTime: number;
  parseTime: number;
  roundTripTime: number;
  validationTime: number;
  totalTime: number;
  throughput: number; // documents per second
}

/**
 * Memory usage metrics
 */
export interface MemoryMetrics {
  peakUsage: number; // bytes
  averageUsage: number; // bytes
  gcCollections: number;
  memoryLeaks: boolean;
}

/**
 * Benchmark test case
 */
export interface BenchmarkTestCase {
  name: string;
  description: string;
  document: XatsDocument;
  iterations: number;
  timeout: number; // milliseconds
  expectedThroughput?: number; // minimum documents per second
  maxMemoryUsage?: number; // maximum bytes
}

/**
 * Benchmark suite configuration
 */
export interface BenchmarkSuiteConfig {
  warmupIterations: number;
  testIterations: number;
  timeout: number;
  collectGarbage: boolean;
  memoryProfiling: boolean;
}

/**
 * Performance benchmarking framework
 */
export class PerformanceBenchmark {
  private config: BenchmarkSuiteConfig;
  private gcAvailable: boolean;

  constructor(config: Partial<BenchmarkSuiteConfig> = {}) {
    this.config = {
      warmupIterations: 5,
      testIterations: 100,
      timeout: 30000, // 30 seconds
      collectGarbage: true,
      memoryProfiling: true,
      ...config,
    };

    // Check if garbage collection is available (Node.js with --expose-gc)
    this.gcAvailable = typeof global !== 'undefined' && 
                      typeof global.gc === 'function';
  }

  /**
   * Run benchmark suite for a renderer
   */
  async runBenchmarkSuite(
    renderer: BidirectionalRenderer,
    testCases: BenchmarkTestCase[]
  ): Promise<BenchmarkSuiteResult> {
    const results: BenchmarkResult[] = [];
    let totalTime = 0;
    let successCount = 0;
    let failureCount = 0;

    console.log(`Starting benchmark suite for ${renderer.format} renderer...`);

    for (const testCase of testCases) {
      console.log(`Running test case: ${testCase.name}`);
      
      try {
        const result = await this.runBenchmarkTest(renderer, testCase);
        results.push(result);
        totalTime += result.metrics.totalTime;
        
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
        }
      } catch (error) {
        results.push({
          renderer: renderer.format,
          testCase: testCase.name,
          metrics: this.createEmptyMetrics(),
          memoryUsage: this.createEmptyMemoryMetrics(),
          success: false,
          error: String(error),
        });
        failureCount++;
      }
    }

    const aggregateMetrics = this.aggregateResults(results);

    return {
      renderer: renderer.format,
      results,
      summary: {
        totalTests: testCases.length,
        successCount,
        failureCount,
        totalTime,
        averageThroughput: aggregateMetrics.metrics.throughput,
        averageMemoryUsage: aggregateMetrics.memoryUsage.averageUsage,
        peakMemoryUsage: Math.max(...results.map(r => r.memoryUsage.peakUsage)),
      },
      testedAt: new Date(),
    };
  }

  /**
   * Run a single benchmark test
   */
  async runBenchmarkTest(
    renderer: BidirectionalRenderer,
    testCase: BenchmarkTestCase
  ): Promise<BenchmarkResult> {
    // Warmup phase
    await this.warmup(renderer, testCase);

    // Collect garbage before testing if available
    if (this.config.collectGarbage && this.gcAvailable) {
      global.gc!();
    }

    const startMemory = this.getMemoryUsage();
    const memoryReadings: number[] = [startMemory];
    let gcCollections = 0;

    // Performance measurement setup
    const renderTimes: number[] = [];
    const parseTimes: number[] = [];
    const validationTimes: number[] = [];
    
    let iterations = 0;
    let errors = 0;
    const startTime = performance.now();

    // Memory monitoring interval
    const memoryInterval = this.config.memoryProfiling ? 
      setInterval(() => {
        memoryReadings.push(this.getMemoryUsage());
      }, 100) : null;

    try {
      // Run test iterations
      while (iterations < testCase.iterations) {
        const iterationStart = performance.now();

        try {
          // Render phase
          const renderStart = performance.now();
          const renderResult = await renderer.render(testCase.document);
          const renderTime = performance.now() - renderStart;
          renderTimes.push(renderTime);

          // Parse phase
          const parseStart = performance.now();
          const parseResult = await renderer.parse(renderResult.content);
          const parseTime = performance.now() - parseStart;
          parseTimes.push(parseTime);

          // Validation phase
          const validationStart = performance.now();
          await renderer.validate(renderResult.content);
          const validationTime = performance.now() - validationStart;
          validationTimes.push(validationTime);

          iterations++;

          // Check timeout
          if (performance.now() - startTime > testCase.timeout) {
            console.warn(`Test case ${testCase.name} timed out after ${iterations} iterations`);
            break;
          }

        } catch (error) {
          errors++;
          console.warn(`Error in iteration ${iterations}: ${error}`);
          
          // Fail if too many errors
          if (errors > testCase.iterations * 0.1) { // 10% error rate
            throw new Error(`Too many errors in test case: ${testCase.name}`);
          }
        }
      }

      // Stop memory monitoring
      if (memoryInterval) {
        clearInterval(memoryInterval);
      }

      const totalTime = performance.now() - startTime;
      const endMemory = this.getMemoryUsage();

      // Calculate metrics
      const metrics: PerformanceMetrics = {
        renderTime: this.average(renderTimes),
        parseTime: this.average(parseTimes),
        roundTripTime: this.average(renderTimes) + this.average(parseTimes),
        validationTime: this.average(validationTimes),
        totalTime: totalTime / iterations, // Per iteration
        throughput: (iterations / totalTime) * 1000, // Per second
      };

      const memoryUsage: MemoryMetrics = {
        peakUsage: Math.max(...memoryReadings),
        averageUsage: this.average(memoryReadings),
        gcCollections,
        memoryLeaks: endMemory > startMemory * 1.5, // Simple leak detection
      };

      // Check performance requirements
      const success = this.checkPerformanceRequirements(testCase, metrics, memoryUsage);

      return {
        renderer: renderer.format,
        testCase: testCase.name,
        metrics,
        memoryUsage,
        success,
      };

    } finally {
      if (memoryInterval) {
        clearInterval(memoryInterval);
      }
    }
  }

  /**
   * Warmup phase to stabilize JIT compilation
   */
  private async warmup(renderer: BidirectionalRenderer, testCase: BenchmarkTestCase): Promise<void> {
    for (let i = 0; i < this.config.warmupIterations; i++) {
      try {
        const renderResult = await renderer.render(testCase.document);
        await renderer.parse(renderResult.content);
        await renderer.validate(renderResult.content);
      } catch (error) {
        // Ignore warmup errors
      }
    }

    // Collect garbage after warmup
    if (this.config.collectGarbage && this.gcAvailable) {
      global.gc!();
    }
  }

  /**
   * Get current memory usage in bytes
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    // Browser fallback (less accurate)
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  /**
   * Check if results meet performance requirements
   */
  private checkPerformanceRequirements(
    testCase: BenchmarkTestCase,
    metrics: PerformanceMetrics,
    memoryUsage: MemoryMetrics
  ): boolean {
    if (testCase.expectedThroughput && metrics.throughput < testCase.expectedThroughput) {
      return false;
    }

    if (testCase.maxMemoryUsage && memoryUsage.peakUsage > testCase.maxMemoryUsage) {
      return false;
    }

    if (memoryUsage.memoryLeaks) {
      return false;
    }

    return true;
  }

  /**
   * Calculate average of number array
   */
  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  /**
   * Aggregate results from multiple test cases
   */
  private aggregateResults(results: BenchmarkResult[]): BenchmarkResult {
    const successfulResults = results.filter(r => r.success);
    
    if (successfulResults.length === 0) {
      return {
        renderer: 'aggregate',
        testCase: 'aggregate',
        metrics: this.createEmptyMetrics(),
        memoryUsage: this.createEmptyMemoryMetrics(),
        success: false,
      };
    }

    const metrics: PerformanceMetrics = {
      renderTime: this.average(successfulResults.map(r => r.metrics.renderTime)),
      parseTime: this.average(successfulResults.map(r => r.metrics.parseTime)),
      roundTripTime: this.average(successfulResults.map(r => r.metrics.roundTripTime)),
      validationTime: this.average(successfulResults.map(r => r.metrics.validationTime)),
      totalTime: this.average(successfulResults.map(r => r.metrics.totalTime)),
      throughput: this.average(successfulResults.map(r => r.metrics.throughput)),
    };

    const memoryUsage: MemoryMetrics = {
      peakUsage: Math.max(...successfulResults.map(r => r.memoryUsage.peakUsage)),
      averageUsage: this.average(successfulResults.map(r => r.memoryUsage.averageUsage)),
      gcCollections: Math.max(...successfulResults.map(r => r.memoryUsage.gcCollections)),
      memoryLeaks: successfulResults.some(r => r.memoryUsage.memoryLeaks),
    };

    return {
      renderer: 'aggregate',
      testCase: 'aggregate',
      metrics,
      memoryUsage,
      success: true,
    };
  }

  /**
   * Create empty metrics for error cases
   */
  private createEmptyMetrics(): PerformanceMetrics {
    return {
      renderTime: 0,
      parseTime: 0,
      roundTripTime: 0,
      validationTime: 0,
      totalTime: 0,
      throughput: 0,
    };
  }

  /**
   * Create empty memory metrics for error cases
   */
  private createEmptyMemoryMetrics(): MemoryMetrics {
    return {
      peakUsage: 0,
      averageUsage: 0,
      gcCollections: 0,
      memoryLeaks: false,
    };
  }
}

/**
 * Benchmark suite result
 */
export interface BenchmarkSuiteResult {
  renderer: string;
  results: BenchmarkResult[];
  summary: BenchmarkSummary;
  testedAt: Date;
}

/**
 * Summary of benchmark results
 */
export interface BenchmarkSummary {
  totalTests: number;
  successCount: number;
  failureCount: number;
  totalTime: number;
  averageThroughput: number;
  averageMemoryUsage: number;
  peakMemoryUsage: number;
}

/**
 * Factory for creating benchmark test cases
 */
export class BenchmarkTestFactory {
  /**
   * Create a small document test case
   */
  static createSmallDocumentTest(document: XatsDocument): BenchmarkTestCase {
    return {
      name: 'small-document',
      description: 'Test with a small document (< 1MB)',
      document,
      iterations: 1000,
      timeout: 10000,
      expectedThroughput: 100, // 100 docs/sec
      maxMemoryUsage: 10 * 1024 * 1024, // 10MB
    };
  }

  /**
   * Create a large document test case
   */
  static createLargeDocumentTest(document: XatsDocument): BenchmarkTestCase {
    return {
      name: 'large-document',
      description: 'Test with a large document (> 10MB)',
      document,
      iterations: 10,
      timeout: 30000,
      expectedThroughput: 1, // 1 doc/sec
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    };
  }

  /**
   * Create a stress test case
   */
  static createStressTest(document: XatsDocument): BenchmarkTestCase {
    return {
      name: 'stress-test',
      description: 'High-volume stress test',
      document,
      iterations: 10000,
      timeout: 60000,
      expectedThroughput: 50, // 50 docs/sec
    };
  }

  /**
   * Create memory test case
   */
  static createMemoryTest(document: XatsDocument): BenchmarkTestCase {
    return {
      name: 'memory-test',
      description: 'Memory usage and leak detection test',
      document,
      iterations: 5000,
      timeout: 30000,
      maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    };
  }
}