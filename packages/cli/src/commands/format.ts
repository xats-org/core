import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

import type { FormatCommandOptions } from '../types.js';

export const formatCommand = new Command('format')
  .description('Format a xats document with proper indentation')
  .argument('<file>', 'path to the xats document')
  .option('-o, --output <file>', 'output file (default: overwrite input)')
  .option('-i, --indent <spaces>', 'number of spaces for indentation', '2')
  .option('--no-sort-keys', 'do not sort object keys')
  .option('--compact', 'use compact formatting (no extra whitespace)')
  .action((file: string, options: FormatCommandOptions) => {
    const spinner = ora('Loading document...').start();

    try {
      // Read and parse document (this will throw if file doesn't exist)
      spinner.text = 'Parsing document...';
      const filePath = resolve(file);
      let content: string;
      
      try {
        content = readFileSync(filePath, 'utf-8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          spinner.fail(chalk.red(`File not found: ${file}`));
        } else {
          spinner.fail(chalk.red(`Failed to read file: ${file}`));
        }
        if (options.parent?.verbose) {
          console.error(error);
        }
        process.exit(1);
      }
      let document: unknown;

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
      const indent = options.compact ? 0 : parseInt(options.indent || '2', 10);

      if (options.sortKeys !== false && !options.compact) {
        // Sort keys for consistent formatting
        formatted = JSON.stringify(sortObjectKeys(document), null, indent);
      } else {
        formatted = JSON.stringify(document, null, indent);
      }

      // Write output
      const outputPath = options.output ? resolve(options.output) : filePath;
      writeFileSync(outputPath, `${formatted}\n`, 'utf-8');

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
function sortObjectKeys(obj: unknown): unknown {
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

    const sorted: Record<string, unknown> = {};
    const keys = Object.keys(obj as Record<string, unknown>);

    // First, add keys in priority order
    for (const key of keyOrder) {
      if (keys.includes(key)) {
        sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
      }
    }

    // Then add remaining keys alphabetically
    const remainingKeys = keys.filter((key) => !keyOrder.includes(key)).sort();

    for (const key of remainingKeys) {
      sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
    }

    return sorted;
  }

  return obj;
}
