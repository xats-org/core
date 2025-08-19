#!/usr/bin/env node

/**
 * xats HTML Renderer CLI
 * 
 * Command-line tool for rendering xats documents to HTML
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { XatsHtmlRenderer, RendererOptions, XatsDocument } from './renderer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface CliOptions {
  input: string;
  output?: string;
  includeCss?: boolean;
  baseUrl?: string;
  accessibility?: boolean;
  direction?: 'ltr' | 'rtl' | 'auto';
  includeSkipNavigation?: boolean;
  help?: boolean;
  version?: boolean;
}

function showHelp(): void {
  console.log(`
xats HTML Renderer CLI

Usage: xats-render [options] <input-file>

Options:
  -o, --output <file>           Output HTML file path
  -c, --include-css             Include CSS styles inline (default: true)
  -b, --base-url <url>          Base URL for resolving resources
  -a, --accessibility           Enable accessibility features (default: true)
  -d, --direction <dir>         Text direction: ltr, rtl, auto (default: ltr)
  -s, --skip-navigation         Include skip navigation links (default: true)
  -h, --help                    Show this help message
  -v, --version                 Show version information

Examples:
  xats-render textbook.json                        # Render to textbook.html
  xats-render textbook.json -o output.html         # Render to output.html
  xats-render textbook.json --no-css               # Render without inline CSS
  xats-render textbook.json -d rtl                 # Render with RTL direction
`);
}

function showVersion(): void {
  const packagePath = resolve(__dirname, '../package.json');
  try {
    const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
    console.log(`xats-render v${pkg.version}`);
  } catch {
    console.log('xats-render (version unknown)');
  }
}

function parseArgs(args: string[]): CliOptions {
  const options: CliOptions = {
    input: '',
    includeCss: true,
    accessibility: true,
    direction: 'ltr',
    includeSkipNavigation: true
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '-h':
      case '--help':
        options.help = true;
        break;
      case '-v':
      case '--version':
        options.version = true;
        break;
      case '-o':
      case '--output':
        if (i + 1 < args.length) {
          const outputArg = args[++i];
          if (outputArg) {
            options.output = outputArg;
          }
        } else {
          throw new Error('Output file path required');
        }
        break;
      case '-c':
      case '--include-css':
        options.includeCss = true;
        break;
      case '--no-css':
        options.includeCss = false;
        break;
      case '-b':
      case '--base-url':
        if (i + 1 < args.length) {
          const baseUrlArg = args[++i];
          if (baseUrlArg) {
            options.baseUrl = baseUrlArg;
          }
        } else {
          throw new Error('Base URL required');
        }
        break;
      case '-a':
      case '--accessibility':
        options.accessibility = true;
        break;
      case '--no-accessibility':
        options.accessibility = false;
        break;
      case '-d':
      case '--direction':
        if (i + 1 < args.length) {
          const dirArg = args[++i];
          if (dirArg && (dirArg === 'ltr' || dirArg === 'rtl' || dirArg === 'auto')) {
            options.direction = dirArg;
          } else {
            throw new Error('Direction must be ltr, rtl, or auto');
          }
        } else {
          throw new Error('Direction required');
        }
        break;
      case '-s':
      case '--skip-navigation':
        options.includeSkipNavigation = true;
        break;
      case '--no-skip-navigation':
        options.includeSkipNavigation = false;
        break;
      default:
        if (arg && arg.startsWith('-')) {
          throw new Error(`Unknown option: ${arg}`);
        } else if (!options.input && arg) {
          options.input = arg;
        } else if (arg) {
          throw new Error(`Unexpected argument: ${arg}`);
        }
        break;
    }
  }

  return options;
}

function validateInput(filePath: string): void {
  try {
    const content = readFileSync(filePath, 'utf-8');
    JSON.parse(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Input file not found: ${filePath}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in input file: ${filePath}`);
    } else {
      throw new Error(`Error reading input file: ${error}`);
    }
  }
}

function loadDocument(filePath: string): XatsDocument {
  try {
    const content = readFileSync(filePath, 'utf-8');
    const document = JSON.parse(content) as XatsDocument;
    
    // Basic validation
    if (!document.schemaVersion) {
      throw new Error('Document missing required schemaVersion field');
    }
    
    if (!document.bibliographicEntry) {
      throw new Error('Document missing required bibliographicEntry field');
    }
    
    if (!document.subject) {
      throw new Error('Document missing required subject field');
    }
    
    if (!document.bodyMatter || !document.bodyMatter.contents) {
      throw new Error('Document missing required bodyMatter.contents field');
    }
    
    return document;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Error loading document: ${error}`);
  }
}

function ensureOutputDirectory(outputPath: string): void {
  const outputDir = dirname(outputPath);
  try {
    mkdirSync(outputDir, { recursive: true });
  } catch (error) {
    throw new Error(`Error creating output directory: ${error}`);
  }
}

function generateOutputPath(inputPath: string): string {
  const baseName = basename(inputPath, extname(inputPath));
  return resolve(dirname(inputPath), `${baseName}.html`);
}

function main(): void {
  try {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
      showHelp();
      process.exit(1);
    }
    
    const options = parseArgs(args);
    
    if (options.help) {
      showHelp();
      return;
    }
    
    if (options.version) {
      showVersion();
      return;
    }
    
    if (!options.input) {
      console.error('Error: Input file required');
      showHelp();
      process.exit(1);
    }
    
    // Validate input file
    validateInput(options.input);
    
    // Load document
    console.log(`Loading xats document: ${options.input}`);
    const document = loadDocument(options.input);
    console.log(`✓ Document loaded (schema v${document.schemaVersion})`);
    
    // Determine output path
    const outputPath = options.output || generateOutputPath(options.input);
    ensureOutputDirectory(outputPath);
    
    // Prepare renderer options
    const rendererOptions: RendererOptions = {};
    if (options.includeCss !== undefined) rendererOptions.includeCss = options.includeCss;
    if (options.baseUrl !== undefined) rendererOptions.baseUrl = options.baseUrl;
    if (options.accessibility !== undefined) rendererOptions.accessibility = options.accessibility;
    if (options.direction !== undefined) rendererOptions.direction = options.direction;
    if (options.includeSkipNavigation !== undefined) rendererOptions.includeSkipNavigation = options.includeSkipNavigation;
    
    // Render document
    console.log('Rendering HTML...');
    const renderer = new XatsHtmlRenderer(rendererOptions);
    const html = renderer.render(document);
    
    // Write output
    writeFileSync(outputPath, html, 'utf-8');
    console.log(`✓ HTML rendered successfully: ${outputPath}`);
    
    // Show some stats
    const stats = {
      htmlSize: Math.round(html.length / 1024),
      title: document.bibliographicEntry.title || 'Untitled',
      chapters: document.bodyMatter.contents.filter(item => 'sections' in item).length,
      units: document.bodyMatter.contents.filter(item => 'contents' in item).length
    };
    
    console.log(`\nDocument Statistics:`);
    console.log(`  Title: ${stats.title}`);
    console.log(`  Units: ${stats.units}`);
    console.log(`  Chapters: ${stats.chapters}`);
    console.log(`  HTML size: ${stats.htmlSize} KB`);
    
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
export type { CliOptions };