import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import chalk from 'chalk';
import { Command } from 'commander';

import { countWords, extractContentBlocks, getStructureDepth } from '@xats/utils';

import { isContentBlock, isSemanticText, isXatsDocument } from '../types.js';

import type { DocumentStats, StatsCommandOptions } from '../types.js';

export const statsCommand = new Command('stats')
  .description('Display statistics about a xats document')
  .argument('<file>', 'path to the xats document')
  .option('--format <format>', 'output format (text, json)', 'text')
  .option('--detailed', 'show detailed statistics')
  .action((file: string, options: StatsCommandOptions) => {
    try {
      // Check if file exists
      const filePath = resolve(file);
      if (!existsSync(filePath)) {
        console.error(chalk.red(`File not found: ${file}`));
        process.exit(1);
      }

      // Read and parse document
      const content = readFileSync(filePath, 'utf-8');
      let document: unknown;

      try {
        document = JSON.parse(content);
      } catch (error) {
        console.error(chalk.red('Failed to parse JSON document'));
        process.exit(1);
      }

      // Validate that it's a xats document
      if (!isXatsDocument(document)) {
        console.error(chalk.red('Document is not a valid xats document structure'));
        process.exit(1);
      }

      // Calculate statistics
      const stats: DocumentStats = {
        fileSize: content.length,
        schemaVersion: document.schemaVersion || 'unknown',
        structuralDepth: 0,
        totalBlocks: 0,
        blockTypes: {} as Record<string, number>,
        totalWords: 0,
        averageWordsPerBlock: 0,
        hasAssessments: false,
        hasFigures: false,
        hasTables: false,
        hasCode: false,
        hasMath: false,
        hasReferences: false,
        hasCitations: false,
        extensionsUsed: [] as string[],
      };

      // Analyze body matter
      if (document.bodyMatter?.contents) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
          stats.structuralDepth = getStructureDepth(document.bodyMatter as any);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
          const blocks = extractContentBlocks(document.bodyMatter as any);
          stats.totalBlocks = blocks.length;

          // Analyze block types and content
          for (const block of blocks) {
            if (isContentBlock(block)) {
              // Count block types
              const blockType = block.blockType.split('/').pop() || 'unknown';
              stats.blockTypes[blockType] = (stats.blockTypes[blockType] || 0) + 1;

              // Check for specific content types
              if (blockType === 'assessment') stats.hasAssessments = true;
              if (blockType === 'figure') stats.hasFigures = true;
              if (blockType === 'table') stats.hasTables = true;
              if (blockType === 'codeBlock') stats.hasCode = true;
              if (blockType === 'mathBlock') stats.hasMath = true;

              // Count words in text content
              if (isSemanticText(block.content)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
                stats.totalWords += countWords(block.content as any);
              }

              // Check for extensions
              if (block.extensions) {
                Object.keys(block.extensions).forEach((ext) => {
                  if (!stats.extensionsUsed.includes(ext)) {
                    stats.extensionsUsed.push(ext);
                  }
                });
              }
            }
          }
        } catch (error) {
          console.warn(chalk.yellow('Warning: Could not analyze document structure completely'));
        }

        stats.averageWordsPerBlock =
          stats.totalBlocks > 0 ? Math.round(stats.totalWords / stats.totalBlocks) : 0;
      }

      // Check for references and citations in back matter
      if (document.backMatter?.bibliography && Array.isArray(document.backMatter.bibliography)) {
        stats.hasReferences = true;
        stats.referenceCount = document.backMatter.bibliography.length;
      }

      // Output statistics
      if (options.format === 'json') {
        console.log(JSON.stringify(stats, null, 2));
      } else {
        console.log(chalk.bold('\nDocument Statistics:'));
        console.log(chalk.gray('═'.repeat(50)));

        console.log(chalk.cyan('\nGeneral:'));
        console.log(`  File Size: ${(stats.fileSize / 1024).toFixed(2)} KB`);
        console.log(`  Schema Version: ${stats.schemaVersion}`);
        console.log(`  Structural Depth: ${stats.structuralDepth} levels`);

        console.log(chalk.cyan('\nContent:'));
        console.log(`  Total Blocks: ${stats.totalBlocks}`);
        console.log(`  Total Words: ${stats.totalWords.toLocaleString()}`);
        console.log(`  Avg Words/Block: ${stats.averageWordsPerBlock}`);

        if (options.detailed && Object.keys(stats.blockTypes).length > 0) {
          console.log(chalk.cyan('\nBlock Types:'));
          const sortedTypes = Object.entries(stats.blockTypes).sort((a, b) => b[1] - a[1]);

          for (const [type, count] of sortedTypes) {
            const percentage = ((count / stats.totalBlocks) * 100).toFixed(1);
            console.log(`  ${type}: ${count} (${percentage}%)`);
          }
        }

        console.log(chalk.cyan('\nFeatures:'));
        const features = [
          ['Assessments', stats.hasAssessments],
          ['Figures', stats.hasFigures],
          ['Tables', stats.hasTables],
          ['Code Blocks', stats.hasCode],
          ['Math Blocks', stats.hasMath],
          ['References', stats.hasReferences],
        ];

        for (const [feature, present] of features) {
          const icon = present ? chalk.green('✓') : chalk.gray('✗');
          console.log(`  ${icon} ${feature}`);
        }

        if (stats.referenceCount) {
          console.log(chalk.cyan('\nBibliography:'));
          console.log(`  References: ${stats.referenceCount}`);
        }

        if (stats.extensionsUsed.length > 0) {
          console.log(chalk.cyan('\nExtensions:'));
          stats.extensionsUsed.forEach((ext) => {
            console.log(`  - ${ext}`);
          });
        }
      }
    } catch (error) {
      console.error(chalk.red('Failed to analyze document'));
      if (options.parent?.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });
