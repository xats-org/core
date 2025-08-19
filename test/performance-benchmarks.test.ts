/**
 * Performance Benchmark Tests for File Modularity
 * 
 * Tests to validate performance characteristics of multi-file xats documents
 * and ensure file modularity doesn't introduce significant performance overhead.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { join, resolve } from 'path';
import { FileModularityValidator } from '../src/file-modularity-validator.js';
import { writeFileSync, mkdirSync } from 'fs';
// import type { PerformanceMetrics } from '../src/file-modularity-validator.js';

const FIXTURES_DIR = resolve(__dirname, 'fixtures/file-modularity');
const PERF_TEST_DIR = join(FIXTURES_DIR, 'performance-tests');

describe('File Modularity Performance Benchmarks', () => {
  let validator: FileModularityValidator;

  beforeEach(() => {
    validator = new FileModularityValidator();
    
    // Create performance test directory
    try {
      mkdirSync(PERF_TEST_DIR, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }
  });

  afterEach(() => {
    validator.clearCache();
  });

  describe('Single File vs Multi-File Performance', () => {
    it('should have reasonable overhead for file modularity', async () => {
      // Create a single large file for comparison
      const singleFileContent = createLargeTextbook(50); // 50 sections in one file
      const singleFilePath = join(PERF_TEST_DIR, 'single-file-large.json');
      writeFileSync(singleFilePath, JSON.stringify(singleFileContent, null, 2));

      // Create equivalent multi-file structure
      const multiFileMainPath = createModularTextbook(50); // 50 sections across multiple files

      // Benchmark single file
      const singleFileStart = performance.now();
      const singleResult = await validator.validate(singleFilePath);
      const singleFileTime = performance.now() - singleFileStart;

      // Benchmark multi-file
      const multiFileStart = performance.now();
      const multiResult = await validator.validate(multiFileMainPath);
      const multiFileTime = performance.now() - multiFileStart;

      expect(singleResult.isValid).toBe(true);
      expect(multiResult.isValid).toBe(true);

      // Multi-file shouldn't be more than 3x slower than single file
      expect(multiFileTime).toBeLessThan(singleFileTime * 3);

      console.log(`Single file time: ${singleFileTime}ms`);
      console.log(`Multi-file time: ${multiFileTime}ms`);
      console.log(`Overhead factor: ${multiFileTime / singleFileTime}x`);
    });

    it('should scale reasonably with number of files', async () => {
      const fileCounts = [5, 10, 25, 50];
      const benchmarkResults: Array<{
        fileCount: number;
        loadTime: number;
        totalFiles: number;
        totalSize: number;
      }> = [];

      for (const count of fileCounts) {
        const textbookPath = createModularTextbook(count);
        const benchmark = await validator.benchmarkTextbook(textbookPath, 3);

        benchmarkResults.push({
          fileCount: count,
          loadTime: benchmark.averageMetrics.totalLoadTimeMs,
          totalFiles: benchmark.averageMetrics.totalFiles,
          totalSize: benchmark.averageMetrics.totalSizeBytes
        });
      }

      // Performance should scale sub-linearly with file count
      for (let i = 1; i < benchmarkResults.length; i++) {
        const prev = benchmarkResults[i - 1];
        const current = benchmarkResults[i];
        
        const fileRatio = current.totalFiles / prev.totalFiles;
        const timeRatio = current.loadTime / prev.loadTime;
        
        // Time ratio should be less than 2x the file ratio (sub-linear scaling)
        expect(timeRatio).toBeLessThan(fileRatio * 2);
      }

      console.log('Scaling benchmark results:');
      benchmarkResults.forEach(result => {
        console.log(`${result.fileCount} sections: ${result.loadTime.toFixed(2)}ms for ${result.totalFiles} files (${(result.totalSize / 1024).toFixed(1)}KB)`);
      });
    });
  });

  describe('Memory Usage Benchmarks', () => {
    it('should not cause excessive memory usage for large textbooks', async () => {
      const largeTextbookPath = createModularTextbook(100); // 100 sections
      
      const initialMemory = process.memoryUsage();
      const benchmark = await validator.benchmarkTextbook(largeTextbookPath, 1);
      expect(benchmark).toBeDefined(); // Use benchmark to avoid lint error
      const finalMemory = process.memoryUsage();

      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreasePercent = (memoryIncrease / initialMemory.heapUsed) * 100;

      // Memory increase should be reasonable (less than 50% increase)
      expect(memoryIncreasePercent).toBeLessThan(50);

      console.log(`Memory usage for large textbook:`);
      console.log(`Initial heap: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Final heap: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB (${memoryIncreasePercent.toFixed(1)}%)`);
    });

    it('should properly clean up memory after validation', async () => {
      const textbookPath = createModularTextbook(20);
      
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Run validation multiple times
      for (let i = 0; i < 10; i++) {
        await validator.validate(textbookPath);
        validator.clearCache(); // Force cache cleanup
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDifference = finalMemory - initialMemory;
      const memoryDifferencePercent = (memoryDifference / initialMemory) * 100;
      
      // Memory should not grow excessively after multiple runs
      expect(memoryDifferencePercent).toBeLessThan(50);
    });
  });

  describe('File I/O Performance', () => {
    it('should have acceptable file loading times', async () => {
      const textbookPath = createModularTextbook(30);
      const result = await validator.validate(textbookPath);
      
      expect(result.isValid).toBe(true);
      expect(result.fileResolution).toBeDefined();
      
      const metrics = result.fileResolution!.performanceMetrics;
      
      // Average file load time should be reasonable (< 200ms per file on average, allowing for CI/system variability)
      const avgLoadTime = metrics.totalLoadTimeMs / metrics.totalFiles;
      expect(avgLoadTime).toBeLessThan(200);
      
      // Maximum single file load time should be reasonable (< 300ms, allowing for system variability)
      expect(metrics.maxFileLoadTimeMs).toBeLessThan(300);
      
      console.log(`File I/O Performance for ${metrics.totalFiles} files:`);
      console.log(`Total load time: ${metrics.totalLoadTimeMs.toFixed(2)}ms`);
      console.log(`Average per file: ${avgLoadTime.toFixed(2)}ms`);
      console.log(`Maximum single file: ${metrics.maxFileLoadTimeMs.toFixed(2)}ms`);
    });

    it('should benefit from caching on repeated validations', async () => {
      const textbookPath = createModularTextbook(20);
      
      // First validation (cold cache)
      const coldStart = performance.now();
      const firstResult = await validator.validate(textbookPath);
      const coldTime = performance.now() - coldStart;
      
      // Second validation (warm cache - though our current implementation doesn't cache)
      const warmStart = performance.now();
      const secondResult = await validator.validate(textbookPath);
      const warmTime = performance.now() - warmStart;
      
      expect(firstResult.isValid).toBe(true);
      expect(secondResult.isValid).toBe(true);
      
      // Note: Our current implementation doesn't implement caching,
      // so this test documents the current behavior
      console.log(`Cold cache time: ${coldTime.toFixed(2)}ms`);
      console.log(`Warm cache time: ${warmTime.toFixed(2)}ms`);
      console.log(`Cache effectiveness: ${((coldTime - warmTime) / coldTime * 100).toFixed(1)}%`);
    });
  });

  describe('Large Document Stress Tests', () => {
    it('should handle textbooks with many small files', async () => {
      const textbookPath = createModularTextbook(200); // 200 small files
      
      const result = await validator.validate(textbookPath);
      expect(result.isValid).toBe(true);
      
      const metrics = result.fileResolution!.performanceMetrics;
      expect(metrics.totalFiles).toBeGreaterThan(10);
      
      // Should complete within reasonable time even with many files
      expect(metrics.totalLoadTimeMs).toBeLessThan(5000); // 5 seconds max
    });

    it('should handle deeply nested file references', async () => {
      const deepTextbookPath = createDeeplyNestedTextbook(10); // 10 levels deep
      
      const result = await validator.validate(deepTextbookPath);
      expect(result.isValid).toBe(true);
      
      // Should handle deep nesting without performance degradation
      const metrics = result.fileResolution!.performanceMetrics;
      expect(metrics.totalLoadTimeMs).toBeLessThan(1000); // 1 second max
    });
  });

  // Helper functions for creating test content
  function createLargeTextbook(sectionCount: number) {
    const sections = [];
    
    for (let i = 1; i <= sectionCount; i++) {
      sections.push({
        id: `section-${i}`,
        language: 'en',
        title: `Section ${i}`,
        content: [
          {
            id: `paragraph-${i}-1`,
            language: 'en',
            blockType: 'https://xats.org/core/blocks/paragraph',
            content: {
              text: {
                runs: [
                  {
                    type: 'text',
                    text: `This is the content of section ${i}. It contains important information about topic ${i}.`
                  }
                ]
              }
            }
          }
        ]
      });
    }

    return {
      schemaVersion: '0.3.0',
      id: 'large-textbook',
      language: 'en',
      bibliographicEntry: {
        id: 'large-book',
        type: 'book',
        title: 'Large Performance Test Textbook',
        author: [{ family: 'Test', given: 'Author' }],
        issued: { 'date-parts': [[2023]] },
        publisher: 'Test Press'
      },
      subject: 'Testing',
      bodyMatter: {
        contents: [
          {
            id: 'chapter-1',
            language: 'en',
            title: 'Large Chapter',
            sections
          }
        ]
      }
    };
  }

  function createModularTextbook(sectionCount: number): string {
    const mainPath = join(PERF_TEST_DIR, `modular-${sectionCount}-sections.json`);
    const chaptersDir = join(PERF_TEST_DIR, `modular-${sectionCount}-chapters`);
    
    try {
      mkdirSync(chaptersDir, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Create separate files for sections
    const chapterRefs = [];
    const sectionsPerChapter = Math.min(10, sectionCount);
    const chapterCount = Math.ceil(sectionCount / sectionsPerChapter);
    
    for (let c = 1; c <= chapterCount; c++) {
        const chapterPath = join(chaptersDir, `chapter-${c}.json`);
        const sectionsInChapter = Math.min(sectionsPerChapter, sectionCount - (c - 1) * sectionsPerChapter);
        
        const chapterSections = [];
        for (let s = 1; s <= sectionsInChapter; s++) {
          const sectionIndex = (c - 1) * sectionsPerChapter + s;
          chapterSections.push({
            id: `section-${sectionIndex}`,
            language: 'en',
            title: `Section ${sectionIndex}`,
            content: [
              {
                id: `paragraph-${sectionIndex}-1`,
                language: 'en',
                blockType: 'https://xats.org/core/blocks/paragraph',
                content: {
                  text: {
                    runs: [
                      {
                        type: 'text',
                        text: `Content for section ${sectionIndex} in chapter ${c}.`
                      }
                    ]
                  }
                }
              }
            ]
          });
        }
        
        const chapterContent = {
          id: `chapter-${c}`,
          language: 'en',
          title: `Chapter ${c}`,
          sections: chapterSections
        };
        
        writeFileSync(chapterPath, JSON.stringify(chapterContent, null, 2));
        
        chapterRefs.push({
          $ref: `./modular-${sectionCount}-chapters/chapter-${c}.json`,
          'xats:refMetadata': {
            title: `Chapter ${c}`,
            version: '1.0'
          }
        });
      }
      
      const mainContent = {
        schemaVersion: '0.3.0',
        id: `modular-textbook-${sectionCount}`,
        language: 'en',
        bibliographicEntry: {
          id: `modular-book-${sectionCount}`,
          type: 'book',
          title: `Modular Performance Test Textbook (${sectionCount} sections)`,
          author: [{ family: 'Test', given: 'Author' }],
          issued: { 'date-parts': [[2023]] },
          publisher: 'Test Press'
        },
        subject: 'Performance Testing',
        bodyMatter: {
          contents: chapterRefs
        }
      };
      
      writeFileSync(mainPath, JSON.stringify(mainContent, null, 2));
    
    return mainPath;
  }

  function createDeeplyNestedTextbook(depth: number): string {
    const basePath = join(PERF_TEST_DIR, `deep-nested-${depth}`);
    const mainPath = join(basePath, 'main.json');
    
    try {
      mkdirSync(basePath, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }

    // Create the main document
    const mainContent = {
      schemaVersion: '0.3.0',
      id: 'deep-nested-main',
      language: 'en',
      bibliographicEntry: {
        id: 'deep-book',
        type: 'book',
        title: `Deep Nested Test (${depth} levels)`,
        author: [{ family: 'Test', given: 'Author' }],
        issued: { 'date-parts': [[2023]] },
        publisher: 'Test Press'
      },
      subject: 'Deep Nesting Test',
      bodyMatter: {
        contents: [
          {
            $ref: './level-1.json'
          }
        ]
      }
    };
    
    writeFileSync(mainPath, JSON.stringify(mainContent, null, 2));
    
    // Create nested levels
    for (let level = 1; level <= depth; level++) {
      const levelPath = join(basePath, `level-${level}.json`);
      
      const levelContent = {
        id: `level-${level}`,
        language: 'en',
        title: `Level ${level}`,
        sections: level < depth ? [
          {
            $ref: `./level-${level + 1}.json`
          }
        ] : [
          {
            id: `final-section`,
            language: 'en',
            title: 'Final Section',
            content: [
              {
                id: 'final-paragraph',
                language: 'en',
                blockType: 'https://xats.org/core/blocks/paragraph',
                content: {
                  text: {
                    runs: [
                      {
                        type: 'text',
                        text: `This is the final section at depth ${depth}.`
                      }
                    ]
                  }
                }
              }
            ]
          }
        ]
      };
      
      writeFileSync(levelPath, JSON.stringify(levelContent, null, 2));
    }
    
    return mainPath;
  }
});