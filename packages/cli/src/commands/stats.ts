import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { 
  extractContentBlocks, 
  countContentBlocks,
  getStructureDepth,
  extractPlainText,
  countWords,
} from '@xats/utils';

export const statsCommand = new Command('stats')
  .description('Display statistics about a xats document')
  .argument('<file>', 'path to the xats document')
  .option('--format <format>', 'output format (text, json)', 'text')
  .option('--detailed', 'show detailed statistics')
  .action((file: string, options: any) => {
    try {
      // Check if file exists
      const filePath = resolve(file);
      if (!existsSync(filePath)) {
        console.error(chalk.red(`File not found: ${file}`));
        process.exit(1);
      }
      
      // Read and parse document
      const content = readFileSync(filePath, 'utf-8');
      let document: any;
      
      try {
        document = JSON.parse(content);
      } catch (error) {
        console.error(chalk.red('Failed to parse JSON document'));
        process.exit(1);
      }
      
      // Calculate statistics
      const stats: any = {
        fileSize: content.length,
        schemaVersion: document.schemaVersion,
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
        stats.structuralDepth = getStructureDepth({ contents: document.bodyMatter.contents } as any);
        
        const blocks = extractContentBlocks({ contents: document.bodyMatter.contents } as any);
        stats.totalBlocks = blocks.length;
        
        // Analyze block types and content
        for (const block of blocks) {
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
          if (block.content && typeof block.content === 'object' && 'runs' in block.content) {
            stats.totalWords += countWords(block.content);
          }
          
          // Check for extensions
          if (block.extensions) {
            Object.keys(block.extensions).forEach(ext => {
              if (!stats.extensionsUsed.includes(ext)) {
                stats.extensionsUsed.push(ext);
              }
            });
          }
        }
        
        stats.averageWordsPerBlock = stats.totalBlocks > 0 
          ? Math.round(stats.totalWords / stats.totalBlocks) 
          : 0;
      }
      
      // Check for references and citations
      if (document.bibliography?.references?.length > 0) {
        stats.hasReferences = true;
        stats.referenceCount = document.bibliography.references.length;
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
          const sortedTypes = Object.entries(stats.blockTypes)
            .sort((a, b) => (b[1] as number) - (a[1] as number));
          
          for (const [type, count] of sortedTypes) {
            const percentage = ((count as number) / stats.totalBlocks * 100).toFixed(1);
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
          stats.extensionsUsed.forEach((ext: string) => {
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