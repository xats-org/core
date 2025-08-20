import { Command } from 'commander';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import ora from 'ora';

export const formatCommand = new Command('format')
  .description('Format a xats document with proper indentation')
  .argument('<file>', 'path to the xats document')
  .option('-o, --output <file>', 'output file (default: overwrite input)')
  .option('-i, --indent <spaces>', 'number of spaces for indentation', '2')
  .option('--no-sort-keys', 'do not sort object keys')
  .option('--compact', 'use compact formatting (no extra whitespace)')
  .action((file: string, options: any) => {
    const spinner = ora('Loading document...').start();
    
    try {
      // Check if file exists
      const filePath = resolve(file);
      if (!existsSync(filePath)) {
        spinner.fail(chalk.red(`File not found: ${file}`));
        process.exit(1);
      }
      
      // Read and parse document
      spinner.text = 'Parsing document...';
      const content = readFileSync(filePath, 'utf-8');
      let document: any;
      
      try {
        document = JSON.parse(content);
      } catch (error) {
        spinner.fail(chalk.red('Failed to parse JSON document'));
        if (options.parent?.verbose) {
          console.error(error);
        }
        process.exit(1);
      }
      
      // Format document
      spinner.text = 'Formatting document...';
      
      let formatted: string;
      const indent = options.compact ? 0 : parseInt(options.indent, 10);
      
      if (options.sortKeys !== false && !options.compact) {
        // Sort keys for consistent formatting
        formatted = JSON.stringify(sortObjectKeys(document), null, indent);
      } else {
        formatted = JSON.stringify(document, null, indent);
      }
      
      // Write output
      const outputPath = options.output ? resolve(options.output) : filePath;
      writeFileSync(outputPath, formatted + '\n', 'utf-8');
      
      spinner.succeed(chalk.green(`Document formatted successfully!`));
      
      if (options.output) {
        console.log(chalk.gray(`Output written to: ${outputPath}`));
      }
    } catch (error) {
      spinner.fail(chalk.red('Formatting failed'));
      if (options.parent?.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });

/**
 * Recursively sort object keys
 */
function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  
  if (obj !== null && typeof obj === 'object') {
    // Define key order priority
    const keyOrder = [
      // Top-level document keys
      '$schema',
      'schemaVersion',
      'bibliographicEntry',
      'subject',
      'frontMatter',
      'bodyMatter',
      'backMatter',
      
      // Common object keys
      'id',
      'type',
      'label',
      'title',
      'contents',
      
      // Block keys
      'blockType',
      'content',
      
      // SemanticText keys
      'runs',
      'text',
      
      // Extension keys (always last)
      'tags',
      'extensions',
    ];
    
    const sorted: any = {};
    const keys = Object.keys(obj);
    
    // First, add keys in priority order
    for (const key of keyOrder) {
      if (keys.includes(key)) {
        sorted[key] = sortObjectKeys(obj[key]);
      }
    }
    
    // Then add remaining keys alphabetically
    const remainingKeys = keys
      .filter(key => !keyOrder.includes(key))
      .sort();
    
    for (const key of remainingKeys) {
      sorted[key] = sortObjectKeys(obj[key]);
    }
    
    return sorted;
  }
  
  return obj;
}