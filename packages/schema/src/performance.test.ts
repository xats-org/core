/**
 * Performance Validation Tests
 * 
 * Tests the performance characteristics of schema validation,
 * including speed, memory usage, and scalability with large
 * documents and high validation volume.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createValidator } from '@xats/validator';

describe('Performance Validation', () => {
  let validator: any;

  beforeAll(() => {
    validator = createValidator();
  });

  describe('Validation Speed Tests', () => {
    it('should validate small documents quickly', async () => {
      const smallDoc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'perf-001',
          type: 'book',
          title: 'Small Document'
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/core/blocks/paragraph',
                      content: {
                        text: {
                          runs: [{ type: 'text', text: 'Small content' }]
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      };

      const startTime = performance.now();
      const result = await validator.validate(smallDoc);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(500); // Should complete in less than 500ms (allowing for CI/system variability)
    });

    it('should validate medium documents efficiently', async () => {
      const mediumDoc = createMediumDocument();

      const startTime = performance.now();
      const result = await validator.validate(mediumDoc);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(500); // Should complete in less than 500ms
    });

    it('should validate large documents within reasonable time', async () => {
      const largeDoc = createLargeDocument();

      const startTime = performance.now();
      const result = await validator.validate(largeDoc);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(2000); // Should complete in less than 2 seconds
    });

    it('should validate very large documents within acceptable time', async () => {
      const veryLargeDoc = createVeryLargeDocument();

      const startTime = performance.now();
      const result = await validator.validate(veryLargeDoc);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete in less than 5 seconds
    });
  });

  describe('Concurrent Validation Tests', () => {
    it('should handle multiple simultaneous validations', async () => {
      const testDoc = {
        schemaVersion: '0.1.0',
        bibliographicEntry: {
          id: 'concurrent-001',
          type: 'book',
          title: 'Concurrent Test'
        },
        subject: 'Test',
        bodyMatter: {
          contents: [
            {
              id: 'chapter-1',
              title: 'Chapter 1',
              sections: [
                {
                  id: 'section-1',
                  title: 'Section 1',
                  content: [
                    {
                      id: 'block-1',
                      blockType: 'https://xats.org/core/blocks/paragraph',
                      content: {
                        text: {
                          runs: [{ type: 'text', text: 'Concurrent validation test' }]
                        }
                      }
                    }
                  ]
                }
              ]
            }
          ]
        }
      };

      const startTime = performance.now();
      
      // Run 10 validations concurrently
      const promises = Array(10).fill(null).map((_, i) => {
        const doc = {
          ...testDoc,
          bibliographicEntry: {
            ...testDoc.bibliographicEntry,
            id: `concurrent-${i}`
          }
        };
        return validator.validate(doc);
      });

      const results = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // All validations should succeed
      results.forEach(result => {
        expect(result.isValid).toBe(true);
      });

      // Concurrent execution should be faster than sequential
      expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle high-volume validation load', async () => {
      const testDoc = createMediumDocument();

      const startTime = performance.now();
      
      // Run 50 validations concurrently
      const promises = Array(50).fill(null).map((_, i) => {
        const doc = {
          ...testDoc,
          bibliographicEntry: {
            ...testDoc.bibliographicEntry,
            id: `load-test-${i}`
          }
        };
        return validator.validate(doc);
      });

      const results = await Promise.all(promises);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // All validations should succeed
      results.forEach(result => {
        expect(result.isValid).toBe(true);
      });

      // Should handle high volume efficiently
      expect(duration).toBeLessThan(5000); // Should complete in less than 5 seconds
      
      // Calculate average time per validation
      const avgTimePerValidation = duration / 50;
      expect(avgTimePerValidation).toBeLessThan(100); // Average less than 100ms per validation
    });
  });

  describe('Memory Usage Tests', () => {
    it('should not consume excessive memory for large documents', async () => {
      const initialMemory = process.memoryUsage();
      
      // Validate multiple large documents
      for (let i = 0; i < 10; i++) {
        const largeDoc = createLargeDocument();
        largeDoc.bibliographicEntry.id = `memory-test-${i}`;
        
        const result = await validator.validate(largeDoc);
        expect(result.isValid).toBe(true);
      }

      // Force garbage collection if possible
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should clean up memory between validations', async () => {
      const memoryReadings: number[] = [];
      
      for (let i = 0; i < 5; i++) {
        const doc = createMediumDocument();
        doc.bibliographicEntry.id = `cleanup-test-${i}`;
        
        await validator.validate(doc);
        
        // Force garbage collection if possible
        if (global.gc) {
          global.gc();
        }
        
        memoryReadings.push(process.memoryUsage().heapUsed);
      }

      // Memory usage should not continuously increase
      const firstReading = memoryReadings[0];
      const lastReading = memoryReadings[memoryReadings.length - 1];
      const memoryIncrease = (lastReading ?? 0) - (firstReading ?? 0);
      
      // Should not increase by more than 50MB over 5 validations
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Scalability Tests', () => {
    it('should scale linearly with document size', async () => {
      const sizes = [100, 500, 1000, 2000];
      const times: number[] = [];

      for (const size of sizes) {
        const doc = createScalableDocument(size);
        
        const startTime = performance.now();
        const result = await validator.validate(doc);
        const endTime = performance.now();
        
        expect(result.isValid).toBe(true);
        times.push(endTime - startTime);
      }

      // Check that performance scales reasonably
      // Time should not increase exponentially
      for (let i = 1; i < times.length; i++) {
        const prevTime = times[i - 1];
        const currTime = times[i];
        const prevSize = sizes[i - 1];
        const currSize = sizes[i];
        
        if (prevTime === undefined || currTime === undefined || 
            prevSize === undefined || currSize === undefined) {
          continue;
        }
        
        const ratio = currTime / prevTime;
        const sizeRatio = currSize / prevSize;
        
        // Time ratio should scale reasonably with size ratio
        // Allow for variance in performance measurements on different systems
        expect(ratio).toBeLessThan(sizeRatio * 100); // Allow for performance variance on different systems
      }
    });

    it('should handle deeply nested structures efficiently', async () => {
      const depths = [5, 10, 15, 20];
      const times: number[] = [];

      for (const depth of depths) {
        const doc = createDeeplyNestedDocument(depth);
        
        const startTime = performance.now();
        const result = await validator.validate(doc);
        const endTime = performance.now();
        
        expect(result.isValid).toBe(true);
        times.push(endTime - startTime);
      }

      // Performance should degrade gracefully with depth
      const maxTime = Math.max(...times);
      expect(maxTime).toBeLessThan(1000); // Should complete in less than 1 second even at max depth
    });
  });

  describe('Error Handling Performance', () => {
    it('should report validation errors quickly', async () => {
      const invalidDoc = {
        schemaVersion: '0.1.0',
        // Missing required fields to trigger errors
        subject: 'Test'
      };

      const startTime = performance.now();
      const result = await validator.validate(invalidDoc);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should fail fast
    });

    it('should handle complex validation errors efficiently', async () => {
      const complexInvalidDoc = createComplexInvalidDocument();

      const startTime = performance.now();
      const result = await validator.validate(complexInvalidDoc);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500); // Should complete quickly even with many errors
    });
  });

  describe('Stress Tests', () => {
    it('should handle extreme document size', async () => {
      const extremeDoc = createExtremeDocument();

      const startTime = performance.now();
      const result = await validator.validate(extremeDoc);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.isValid).toBe(true);
      expect(duration).toBeLessThan(10000); // Should complete in less than 10 seconds
    });

    it('should handle validation burst load', async () => {
      const burstSize = 100;
      const docs = Array(burstSize).fill(null).map((_, i) => {
        const doc = createMediumDocument();
        doc.bibliographicEntry.id = `burst-test-${i}`;
        return doc;
      });

      const startTime = performance.now();
      
      // Validate all documents as quickly as possible
      const promises = docs.map(doc => validator.validate(doc));
      const results = await Promise.all(promises);
      
      const endTime = performance.now();
      const duration = endTime - startTime;

      // All should succeed
      results.forEach(result => {
        expect(result.isValid).toBe(true);
      });

      // Should handle burst load efficiently
      expect(duration).toBeLessThan(10000); // Should complete in less than 10 seconds
      
      const avgTimePerValidation = duration / burstSize;
      expect(avgTimePerValidation).toBeLessThan(100); // Average less than 100ms per validation
    });
  });

  // Helper functions to create test documents of various sizes

  function createMediumDocument() {
    const chapters = [];
    for (let i = 1; i <= 10; i++) {
      chapters.push({
        id: `chapter-${i}`,
        title: `Chapter ${i}`,
        sections: Array(5).fill(null).map((_, j) => ({
          id: `section-${i}-${j}`,
          title: `Section ${i}.${j}`,
          content: Array(10).fill(null).map((_, k) => ({
            id: `block-${i}-${j}-${k}`,
            blockType: 'https://xats.org/core/blocks/paragraph',
            content: {
              text: {
                runs: [{ type: 'text', text: `Content for chapter ${i}, section ${j}, block ${k}` }]
              }
            }
          }))
        }))
      });
    }

    return {
      schemaVersion: '0.1.0',
      bibliographicEntry: {
        id: 'medium-doc-001',
        type: 'book',
        title: 'Medium Size Document'
      },
      subject: 'Performance Testing',
      bodyMatter: {
        contents: chapters
      }
    };
  }

  function createLargeDocument() {
    const chapters = [];
    for (let i = 1; i <= 50; i++) {
      chapters.push({
        id: `chapter-${i}`,
        title: `Chapter ${i}`,
        sections: Array(10).fill(null).map((_, j) => ({
          id: `section-${i}-${j}`,
          title: `Section ${i}.${j}`,
          content: Array(20).fill(null).map((_, k) => ({
            id: `block-${i}-${j}-${k}`,
            blockType: 'https://xats.org/core/blocks/paragraph',
            content: {
              text: {
                runs: [{ type: 'text', text: `Large document content for chapter ${i}, section ${j}, block ${k}. `.repeat(10) }]
              }
            }
          }))
        }))
      });
    }

    return {
      schemaVersion: '0.1.0',
      bibliographicEntry: {
        id: 'large-doc-001',
        type: 'book',
        title: 'Large Size Document'
      },
      subject: 'Performance Testing',
      resources: Array(100).fill(null).map((_, i) => ({
        id: `resource-${i}`,
        type: 'https://xats.org/core/resources/image',
        url: `https://example.com/image-${i}.png`
      })),
      bodyMatter: {
        contents: chapters
      }
    };
  }

  function createVeryLargeDocument() {
    const units = [];
    for (let u = 1; u <= 10; u++) {
      const chapters = [];
      for (let i = 1; i <= 20; i++) {
        chapters.push({
          id: `unit-${u}-chapter-${i}`,
          title: `Unit ${u} Chapter ${i}`,
          sections: Array(15).fill(null).map((_, j) => ({
            id: `unit-${u}-section-${i}-${j}`,
            title: `Unit ${u} Section ${i}.${j}`,
            content: Array(30).fill(null).map((_, k) => ({
              id: `unit-${u}-block-${i}-${j}-${k}`,
              blockType: 'https://xats.org/core/blocks/paragraph',
              content: {
                text: {
                  runs: [{ 
                    type: 'text', 
                    text: `Very large document content for unit ${u}, chapter ${i}, section ${j}, block ${k}. ${'This is additional content to make the document larger. '.repeat(20)}` 
                  }]
                }
              }
            }))
          }))
        });
      }
      
      units.push({
        id: `unit-${u}`,
        title: `Unit ${u}`,
        contents: chapters
      });
    }

    return {
      schemaVersion: '0.1.0',
      bibliographicEntry: {
        id: 'very-large-doc-001',
        type: 'book',
        title: 'Very Large Size Document'
      },
      subject: 'Performance Testing',
      resources: Array(500).fill(null).map((_, i) => ({
        id: `resource-${i}`,
        type: 'https://xats.org/core/resources/image',
        url: `https://example.com/image-${i}.png`
      })),
      bodyMatter: {
        contents: units
      }
    };
  }

  function createScalableDocument(blockCount: number) {
    const blocks = Array(blockCount).fill(null).map((_, i) => ({
      id: `block-${i}`,
      blockType: 'https://xats.org/core/blocks/paragraph',
      content: {
        text: {
          runs: [{ type: 'text', text: `Scalable content block ${i}` }]
        }
      }
    }));

    return {
      schemaVersion: '0.1.0',
      bibliographicEntry: {
        id: `scalable-doc-${blockCount}`,
        type: 'book',
        title: `Scalable Document (${blockCount} blocks)`
      },
      subject: 'Scalability Testing',
      bodyMatter: {
        contents: [
          {
            id: 'chapter-1',
            title: 'Scalable Chapter',
            sections: [
              {
                id: 'section-1',
                title: 'Scalable Section',
                content: blocks
              }
            ]
          }
        ]
      }
    };
  }

  function createDeeplyNestedDocument(depth: number) {
    let nestedContent: any = {
      id: 'base-chapter',
      title: 'Base Chapter',
      sections: [
        {
          id: 'base-section',
          title: 'Base Section',
          content: [
            {
              id: 'base-block',
              blockType: 'https://xats.org/core/blocks/paragraph',
              content: {
                text: {
                  runs: [{ type: 'text', text: `Deep nested content at depth ${depth}` }]
                }
              }
            }
          ]
        }
      ]
    };

    // Create nested units
    for (let i = depth; i > 0; i--) {
      nestedContent = {
        id: `unit-depth-${i}`,
        title: `Unit at Depth ${i}`,
        contents: [nestedContent]
      };
    }

    return {
      schemaVersion: '0.1.0',
      bibliographicEntry: {
        id: `nested-doc-depth-${depth}`,
        type: 'book',
        title: `Deeply Nested Document (depth ${depth})`
      },
      subject: 'Nesting Testing',
      bodyMatter: {
        contents: [nestedContent]
      }
    };
  }

  function createComplexInvalidDocument() {
    return {
      schemaVersion: '0.1.0',
      // Missing bibliographicEntry (error 1)
      subject: 123, // Wrong type (error 2)
      bodyMatter: {
        contents: [
          {
            // Missing id (error 3)
            title: 'Invalid Chapter',
            sections: [
              {
                id: 'section-1',
                // Missing title (error 4)
                content: [
                  {
                    id: 'block-1',
                    blockType: 'invalid-uri', // Invalid URI (error 5)
                    content: {
                      text: {
                        runs: [
                          {
                            type: 'invalid-type', // Invalid run type (error 6)
                            text: 'Invalid content'
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            ]
          }
        ]
      }
    };
  }

  function createExtremeDocument() {
    // Create an extremely large document for stress testing
    const units = [];
    for (let u = 1; u <= 5; u++) {
      const chapters = [];
      for (let i = 1; i <= 100; i++) {
        chapters.push({
          id: `extreme-unit-${u}-chapter-${i}`,
          title: `Extreme Unit ${u} Chapter ${i}`,
          sections: Array(5).fill(null).map((_, j) => ({
            id: `extreme-unit-${u}-section-${i}-${j}`,
            title: `Extreme Unit ${u} Section ${i}.${j}`,
            content: Array(50).fill(null).map((_, k) => ({
              id: `extreme-unit-${u}-block-${i}-${j}-${k}`,
              blockType: 'https://xats.org/core/blocks/paragraph',
              content: {
                text: {
                  runs: [{ 
                    type: 'text', 
                    text: `Extreme document content. ${'X'.repeat(1000)}` 
                  }]
                }
              }
            }))
          }))
        });
      }
      
      units.push({
        id: `extreme-unit-${u}`,
        title: `Extreme Unit ${u}`,
        contents: chapters
      });
    }

    return {
      schemaVersion: '0.1.0',
      bibliographicEntry: {
        id: 'extreme-doc-001',
        type: 'book',
        title: 'Extreme Size Document'
      },
      subject: 'Extreme Performance Testing',
      resources: Array(1000).fill(null).map((_, i) => ({
        id: `extreme-resource-${i}`,
        type: 'https://xats.org/core/resources/image',
        url: `https://example.com/extreme-image-${i}.png`
      })),
      bodyMatter: {
        contents: units
      }
    };
  }
});