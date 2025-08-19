#!/usr/bin/env node

/**
 * Generate HTML examples from xats documents
 * 
 * This script processes the example xats documents and generates HTML output
 * to demonstrate the renderer capabilities.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, resolve, basename, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import { XatsHtmlRenderer, RendererOptions, XatsDocument } from './renderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EXAMPLES_DIR = resolve(__dirname, '../examples');
const RENDERED_DIR = resolve(__dirname, '../examples/rendered');

interface ExampleDocument {
  name: string;
  path: string;
  document: XatsDocument;
}

function loadExampleDocuments(): ExampleDocument[] {
  const examples: ExampleDocument[] = [];
  const files = readdirSync(EXAMPLES_DIR);
  
  for (const file of files) {
    const filePath = join(EXAMPLES_DIR, file);
    
    // Skip directories and non-JSON files
    if (!file.endsWith('.json') || statSync(filePath).isDirectory()) {
      continue;
    }
    
    // Skip invalid examples
    if (file.startsWith('invalid-') || filePath.includes('/invalid/')) {
      continue;
    }
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      const document = JSON.parse(content) as XatsDocument;
      
      // Basic validation
      if (document.schemaVersion && document.bibliographicEntry && document.subject && document.bodyMatter) {
        examples.push({
          name: basename(file, extname(file)),
          path: filePath,
          document
        });
        console.log(`✓ Loaded: ${file}`);
      } else {
        console.log(`⚠ Skipped (invalid structure): ${file}`);
      }
    } catch (error) {
      console.log(`⚠ Skipped (parse error): ${file}`);
    }
  }
  
  return examples;
}

function generateHtml(example: ExampleDocument, options: RendererOptions = {}): string {
  const renderer = new XatsHtmlRenderer({
    includeCss: true,
    accessibility: true,
    direction: 'ltr',
    includeSkipNavigation: true,
    ...options
  });
  
  return renderer.render(example.document);
}

function generateExampleVariants(example: ExampleDocument): void {
  const baseOutputPath = join(RENDERED_DIR, example.name);
  
  // Generate different variants to showcase features
  const variants = [
    {
      suffix: '',
      description: 'Standard rendering with all features',
      options: {}
    },
    {
      suffix: '-minimal',
      description: 'Minimal rendering without CSS or skip navigation',
      options: {
        includeCss: false,
        includeSkipNavigation: false
      }
    },
    {
      suffix: '-rtl',
      description: 'Right-to-left rendering for RTL languages',
      options: {
        direction: 'rtl' as const
      }
    },
    {
      suffix: '-accessibility-focused',
      description: 'Enhanced accessibility features',
      options: {
        accessibility: true,
        includeSkipNavigation: true
      }
    }
  ];
  
  for (const variant of variants) {
    try {
      const html = generateHtml(example, variant.options);
      const outputPath = `${baseOutputPath}${variant.suffix}.html`;
      
      writeFileSync(outputPath, html, 'utf-8');
      console.log(`  ✓ Generated: ${basename(outputPath)} (${variant.description})`);
      
      // Generate a README for this variant if it's the first one
      if (variant.suffix === '') {
        generateReadme(example, outputPath);
      }
    } catch (error) {
      console.error(`  ✗ Failed to generate ${variant.suffix}: ${(error as Error).message}`);
    }
  }
}

function generateReadme(example: ExampleDocument, htmlPath: string): void {
  const readmePath = htmlPath.replace('.html', '-README.md');
  const document = example.document;
  
  const readme = `# ${document.bibliographicEntry.title || 'xats Document'} - Rendered Example

This HTML file demonstrates the xats HTML renderer capabilities with a **${document.schemaVersion}** schema document.

## Document Information

- **Title:** ${document.bibliographicEntry.title || 'Untitled'}
- **Subject:** ${document.subject}
- **Schema Version:** ${document.schemaVersion}
- **Target Audience:** ${document.targetAudience || 'General'}

## Document Structure

- **Units:** ${document.bodyMatter.contents.filter(item => 'contents' in item).length}
- **Chapters:** ${document.bodyMatter.contents.filter(item => 'sections' in item).length}
- **Has Front Matter:** ${document.frontMatter ? 'Yes' : 'No'}
- **Has Back Matter:** ${document.backMatter ? 'Yes' : 'No'}
- **Bibliography Entries:** ${document.backMatter?.bibliography?.length || 0}
- **Resources:** ${document.resources?.length || 0}

## Renderer Features Demonstrated

### Core Features
- ✅ Semantic HTML structure
- ✅ Accessibility compliance (WCAG guidelines)
- ✅ Responsive design
- ✅ Skip navigation links
- ✅ Inline CSS styling

### Content Block Support
- ✅ Paragraphs with SemanticText
- ✅ Headings (multiple levels)
- ✅ Lists (ordered and unordered)
- ✅ Blockquotes
- ✅ Code blocks with syntax highlighting
- ✅ Mathematical expressions
- ✅ Tables with accessibility features
- ✅ Figures with captions

### SemanticText Run Types
- ✅ Text runs
- ✅ Emphasis and strong formatting
- ✅ Internal references (links)
- ✅ Citations with bibliography linking
${document.schemaVersion === '0.3.0' ? '- ✅ Index terms with cross-references (v0.3.0)' : ''}

${document.schemaVersion === '0.3.0' ? `### v0.3.0 Features
- ✅ Case Study blocks with stakeholders, timeline, and discussion questions
- ✅ Metacognitive Prompt blocks with scaffolding and guidance
- ✅ IndexRun support for generating document indexes` : ''}

### Advanced Features
- ✅ Bibliography generation from CSL-JSON data
- ✅ Index generation from IndexRun instances
- ✅ Rights and licensing information display
- ✅ Multi-language support
- ✅ Print-friendly styles

## Viewing the Example

Open the HTML file in any modern web browser to see the rendered output. The styling is completely self-contained with inline CSS.

## Generated Variants

- \`${basename(htmlPath)}\` - Standard rendering with all features
- \`${basename(htmlPath).replace('.html', '-minimal.html')}\` - Minimal rendering without CSS
- \`${basename(htmlPath).replace('.html', '-rtl.html')}\` - Right-to-left text direction
- \`${basename(htmlPath).replace('.html', '-accessibility-focused.html')}\` - Enhanced accessibility

## Source Document

The source xats JSON document is located at: \`${example.path.replace(process.cwd(), '.')}\`

---

Generated by xats-html-renderer on ${new Date().toISOString()}
`;
  
  writeFileSync(readmePath, readme, 'utf-8');
  console.log(`  ✓ Generated README: ${basename(readmePath)}`);
}

function generateIndexFile(): void {
  const indexPath = join(RENDERED_DIR, 'index.html');
  const examples = readdirSync(RENDERED_DIR).filter(f => f.endsWith('.html') && !f.includes('-'));
  
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>xats HTML Renderer - Examples</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            color: #333;
        }
        
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid #e0e0e0;
        }
        
        .header h1 {
            color: #2c3e50;
            margin-bottom: 0.5rem;
        }
        
        .header p {
            color: #666;
            font-size: 1.1rem;
        }
        
        .examples-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
        }
        
        .example-card {
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1.5rem;
            background: #f8f9fa;
        }
        
        .example-card h3 {
            margin: 0 0 1rem 0;
            color: #2c3e50;
        }
        
        .example-card p {
            margin: 0.5rem 0;
            color: #666;
        }
        
        .example-links {
            margin-top: 1rem;
        }
        
        .example-links a {
            display: inline-block;
            margin-right: 1rem;
            margin-bottom: 0.5rem;
            padding: 0.25rem 0.5rem;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            font-size: 0.9rem;
        }
        
        .example-links a:hover {
            background: #2980b9;
        }
        
        .example-links .readme {
            background: #95a5a6;
        }
        
        .example-links .readme:hover {
            background: #7f8c8d;
        }
        
        .footer {
            margin-top: 4rem;
            padding-top: 2rem;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #666;
            font-size: 0.9rem;
        }
        
        .features {
            background: #e8f4f8;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 1.5rem;
            margin: 2rem 0;
        }
        
        .features h2 {
            color: #0c5460;
            margin: 0 0 1rem 0;
        }
        
        .features ul {
            margin: 0;
            padding-left: 1.5rem;
        }
        
        .features li {
            margin: 0.25rem 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>xats HTML Renderer Examples</h1>
        <p>Interactive demonstrations of the xats reference HTML renderer implementation</p>
    </div>

    <div class="features">
        <h2>Renderer Features</h2>
        <ul>
            <li><strong>Complete v0.3.0 Support:</strong> Case Studies, Metacognitive Prompts, and IndexRun</li>
            <li><strong>Accessibility:</strong> WCAG compliant HTML with proper ARIA labels and semantic structure</li>
            <li><strong>SemanticText:</strong> Full support for all run types including citations and references</li>
            <li><strong>Responsive Design:</strong> Mobile-friendly layout with print styles</li>
            <li><strong>Bibliography:</strong> Automatic generation from CSL-JSON data</li>
            <li><strong>Index Generation:</strong> Automatic index creation from IndexRun instances</li>
            <li><strong>Customizable:</strong> CSS classes and styling options for integration</li>
        </ul>
    </div>

    <div class="examples-grid">
        ${examples.map(filename => {
          const baseName = basename(filename, '.html');
          const readmeFile = `${baseName}-README.md`;
          return `
        <div class="example-card">
            <h3>${baseName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
            <p>Demonstrates xats HTML rendering capabilities</p>
            <div class="example-links">
                <a href="${filename}">View HTML</a>
                <a href="${baseName}-minimal.html">Minimal</a>
                <a href="${baseName}-rtl.html">RTL</a>
                <a href="${baseName}-accessibility-focused.html">A11y</a>
                <a href="${readmeFile}" class="readme">README</a>
            </div>
        </div>`;
        }).join('')}
    </div>

    <div class="footer">
        <p>Generated by xats-html-renderer on ${new Date().toISOString()}</p>
        <p>Part of the <a href="https://xats.org">Extensible Academic Textbook Schema (xats)</a> project</p>
    </div>
</body>
</html>`;
  
  writeFileSync(indexPath, indexHtml, 'utf-8');
  console.log(`✓ Generated index page: ${basename(indexPath)}`);
}

function main(): void {
  console.log('🚀 Generating xats HTML examples...\n');
  
  try {
    // Load example documents
    console.log('📚 Loading example documents...');
    const examples = loadExampleDocuments();
    
    if (examples.length === 0) {
      console.log('❌ No valid example documents found');
      process.exit(1);
    }
    
    console.log(`\n🎨 Generating HTML for ${examples.length} examples...\n`);
    
    // Generate HTML for each example
    for (const example of examples) {
      console.log(`Processing: ${example.name}`);
      generateExampleVariants(example);
    }
    
    // Generate index page
    console.log('\n📄 Generating index page...');
    generateIndexFile();
    
    console.log(`\n✅ Successfully generated ${examples.length} HTML examples!`);
    console.log(`📁 Output directory: ${RENDERED_DIR}`);
    console.log(`🌐 Open examples/rendered/index.html to browse all examples`);
    
  } catch (error) {
    console.error(`❌ Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };