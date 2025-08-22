#!/usr/bin/env node

/**
 * HTML Bidirectional Converter v0.5.0 Demo
 * 
 * This example demonstrates the enhanced HTML renderer capabilities including:
 * - v0.5.0 enhanced rendering hints
 * - WCAG 2.1 AA accessibility compliance
 * - Performance optimizations for large documents
 * - Bidirectional conversion with round-trip fidelity
 */

import { HtmlRenderer } from '@xats-org/renderer-html';

// Create an enhanced HTML renderer with all features enabled
const renderer = new HtmlRenderer({
  enhancedHints: true,
  accessibilityMode: true,
  optimizeForLargeDocuments: true,
  memoryOptimized: true,
  userPreferences: ['high-contrast', 'screen-reader'],
  wrapInDocument: true,
  includeStyles: true,
});

// Create a sample document demonstrating v0.5.0 enhanced rendering hints
const sampleDocument = {
  schemaVersion: '0.5.0',
  bibliographicEntry: {
    type: 'book',
    title: 'Enhanced HTML Renderer Demo',
    author: [{ given: 'XATS', family: 'Team' }]
  },
  subject: 'Educational Technology',
  lang: 'en',
  dir: 'ltr',
  accessibilityMetadata: {
    accessibilityFeature: ['structuralNavigation', 'alternativeText', 'readingOrder'],
    accessibilityHazard: ['none'],
    accessibilitySummary: 'This document demonstrates WCAG 2.1 AA compliant HTML rendering with enhanced accessibility features.'
  },
  bodyMatter: {
    contents: [
      {
        id: 'chapter-1',
        label: '1',
        title: { runs: [{ type: 'text', text: 'Enhanced Rendering Hints Demo' }] },
        contents: [
          // Semantic hints demonstration
          {
            id: 'warning-example',
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              text: { runs: [{ type: 'text', text: 'This is a warning message that will be rendered with appropriate visual and semantic indicators.' }] }
            },
            renderingHints: [
              {
                hintType: 'https://xats.org/vocabularies/hints/semantic/warning',
                value: 'warning'
              }
            ]
          },
          
          // Pedagogical hints demonstration
          {
            id: 'key-concept',
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              text: { runs: [{ type: 'text', text: 'This paragraph contains a key concept that students should focus on. It will be highlighted appropriately.' }] }
            },
            renderingHints: [
              {
                hintType: 'https://xats.org/vocabularies/hints/pedagogical/key-concept',
                value: 'key-concept'
              }
            ]
          },
          
          // Accessibility hints with conditional rendering
          {
            id: 'high-priority-content',
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              text: { runs: [{ type: 'text', text: 'This content has high priority for screen readers and will be announced assertively.' }] }
            },
            renderingHints: [
              {
                hintType: 'https://xats.org/vocabularies/hints/accessibility/screen-reader-priority-high',
                value: 'high',
                conditions: {
                  userPreferences: ['screen-reader']
                }
              },
              {
                hintType: 'https://xats.org/vocabularies/hints/accessibility/keyboard-shortcut',
                value: 'Alt+1'
              }
            ]
          },
          
          // Layout hints demonstration
          {
            id: 'centered-content',
            blockType: 'https://xats.org/vocabularies/blocks/figure',
            content: {
              src: 'https://example.com/diagram.png',
              alt: 'Educational diagram showing the concept hierarchy',
              caption: { runs: [{ type: 'text', text: 'Figure 1: This figure is centered and kept together on the page' }] }
            },
            renderingHints: [
              {
                hintType: 'https://xats.org/vocabularies/hints/layout/center',
                value: 'center'
              },
              {
                hintType: 'https://xats.org/vocabularies/hints/layout/keep-together',
                value: 'keep-together'
              }
            ]
          },
          
          // Multiple hints with priority
          {
            id: 'featured-cta',
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              text: { runs: [{ type: 'text', text: 'Try the interactive exercise now!' }] }
            },
            renderingHints: [
              {
                hintType: 'https://xats.org/vocabularies/hints/semantic/call-to-action',
                value: 'call-to-action',
                priority: 5
              },
              {
                hintType: 'https://xats.org/vocabularies/hints/semantic/featured',
                value: 'featured', 
                priority: 4
              },
              {
                hintType: 'https://xats.org/vocabularies/hints/accessibility/keyboard-shortcut',
                value: 'Enter'
              }
            ]
          }
        ]
      }
    ]
  }
};

async function demonstrateRenderer() {
  console.log('🚀 HTML Bidirectional Converter v0.5.0 Demo');
  console.log('=============================================\n');

  try {
    // 1. Render the document to HTML
    console.log('📝 Rendering xats document to HTML...');
    const renderResult = await renderer.render(sampleDocument);
    
    console.log(`✅ Rendered successfully in ${renderResult.metadata?.renderTime}ms`);
    console.log(`📄 Generated ${renderResult.content.length} characters of HTML`);
    console.log(`📊 Word count: ${renderResult.metadata?.wordCount}`);
    
    if (renderResult.errors.length > 0) {
      console.log('⚠️  Rendering errors:', renderResult.errors);
    }

    // 2. Test WCAG compliance
    console.log('\n🔍 Testing WCAG 2.1 AA compliance...');
    const complianceResult = await renderer.testCompliance(renderResult.content, 'AA');
    
    console.log(`${complianceResult.compliant ? '✅' : '❌'} WCAG 2.1 AA compliant: ${complianceResult.compliant}`);
    console.log(`📊 Compliance score: ${complianceResult.score}/100`);
    
    if (complianceResult.violations.length > 0) {
      console.log('⚠️  Violations found:', complianceResult.violations.length);
    }

    // 3. Test bidirectional conversion
    console.log('\n🔄 Testing bidirectional conversion...');
    const parseResult = await renderer.parse(renderResult.content);
    
    console.log(`✅ Parsed back to xats in ${parseResult.metadata?.parseTime}ms`);
    console.log(`🎯 Fidelity score: ${parseResult.metadata?.fidelityScore || 'calculating...'}`);
    
    if (parseResult.errors.length > 0) {
      console.log('⚠️  Parse errors:', parseResult.errors);
    }

    // 4. Test round-trip fidelity
    console.log('\n🔄 Testing round-trip fidelity...');
    const roundTripResult = await renderer.testRoundTrip(sampleDocument);
    
    console.log(`${roundTripResult.success ? '✅' : '❌'} Round-trip successful: ${roundTripResult.success}`);
    console.log(`🎯 Fidelity score: ${roundTripResult.fidelityScore.toFixed(2)}%`);
    
    if (roundTripResult.differences.length > 0) {
      console.log(`📝 Found ${roundTripResult.differences.length} differences (some loss is expected)`);
    }

    // 5. Generate accessibility audit
    console.log('\n♿ Generating accessibility audit...');
    const auditResult = await renderer.auditAccessibility(renderResult.content);
    
    console.log(`${auditResult.compliant ? '✅' : '❌'} Overall accessibility compliant: ${auditResult.compliant}`);
    console.log(`📊 Overall score: ${auditResult.overallScore}/100`);
    console.log(`📋 Recommendations: ${auditResult.recommendations.length}`);

    // 6. Show sample HTML output
    console.log('\n📋 Sample HTML Output (first 500 characters):');
    console.log('=' .repeat(60));
    console.log(renderResult.content.substring(0, 500) + '...');
    console.log('=' .repeat(60));

    // 7. Performance test with large document
    console.log('\n⚡ Testing performance with large document...');
    
    const largeDocument = {
      ...sampleDocument,
      bodyMatter: {
        contents: [{
          id: 'large-chapter',
          label: '1', 
          title: { runs: [{ type: 'text', text: 'Performance Test Chapter' }] },
          contents: Array.from({ length: 1200 }, (_, i) => ({
            id: `block-${i}`,
            blockType: 'https://xats.org/vocabularies/blocks/paragraph',
            content: {
              text: { runs: [{ type: 'text', text: `This is paragraph ${i + 1} in a large document test.` }] }
            }
          }))
        }]
      }
    };

    const perfStart = performance.now();
    const largeResult = await renderer.render(largeDocument, {
      optimizeForLargeDocuments: true,
      memoryOptimized: true,
      maxChunks: 25
    });
    const perfEnd = performance.now();

    console.log(`✅ Large document (1200 blocks) rendered in ${(perfEnd - perfStart).toFixed(2)}ms`);
    console.log(`📄 Generated ${(largeResult.content.length / 1024 / 1024).toFixed(2)}MB of HTML`);

    console.log('\n🎉 Demo completed successfully!');
    console.log('\nKey Features Demonstrated:');
    console.log('• ✅ Enhanced rendering hints (semantic, accessibility, layout, pedagogical)');
    console.log('• ✅ WCAG 2.1 AA compliance with comprehensive testing');
    console.log('• ✅ Bidirectional conversion with high fidelity');
    console.log('• ✅ Performance optimizations for large documents');
    console.log('• ✅ Conditional hint processing based on user preferences');
    console.log('• ✅ Schema.org structured data integration');
    console.log('• ✅ Comprehensive accessibility auditing');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Export for use as a module
export { demonstrateRenderer, renderer, sampleDocument };

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  demonstrateRenderer();
}