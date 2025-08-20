import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import chalk from 'chalk';
import { extractPlainText } from '@xats/utils';

export const infoCommand = new Command('info')
  .description('Display information about a xats document')
  .argument('<file>', 'path to the xats document')
  .option('--format <format>', 'output format (text, json)', 'text')
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
      
      // Extract information
      const info = {
        schemaVersion: document.schemaVersion,
        title: document.bibliographicEntry?.title || 'Untitled',
        authors: document.bibliographicEntry?.author || [],
        subject: document.subject,
        publisher: document.bibliographicEntry?.publisher,
        publishedDate: document.bibliographicEntry?.issued?.['date-parts']?.[0],
        isbn: document.bibliographicEntry?.ISBN,
        language: document.bibliographicEntry?.language || 'en',
        hasFrontMatter: Boolean(document.frontMatter),
        hasBackMatter: Boolean(document.backMatter),
        unitCount: 0,
        chapterCount: 0,
        sectionCount: 0,
      };
      
      // Count structural elements
      if (document.bodyMatter?.contents) {
        for (const item of document.bodyMatter.contents) {
          if (item.type === 'unit') {
            info.unitCount++;
            if (item.contents) {
              for (const chapter of item.contents) {
                if (chapter.type === 'chapter') {
                  info.chapterCount++;
                  if (chapter.contents) {
                    info.sectionCount += chapter.contents.filter(
                      (s: any) => s.type === 'section'
                    ).length;
                  }
                }
              }
            }
          } else if (item.type === 'chapter') {
            info.chapterCount++;
            if (item.contents) {
              info.sectionCount += item.contents.filter(
                (s: any) => s.type === 'section'
              ).length;
            }
          }
        }
      }
      
      // Output information
      if (options.format === 'json') {
        console.log(JSON.stringify(info, null, 2));
      } else {
        console.log(chalk.bold('\nDocument Information:'));
        console.log(chalk.gray('─'.repeat(50)));
        
        console.log(chalk.cyan('Title:'), info.title);
        console.log(chalk.cyan('Schema Version:'), info.schemaVersion);
        console.log(chalk.cyan('Subject:'), info.subject);
        
        if (info.authors.length > 0) {
          const authorNames = info.authors.map((a: any) => 
            a.literal || `${a.given} ${a.family}`
          ).join(', ');
          console.log(chalk.cyan('Authors:'), authorNames);
        }
        
        if (info.publisher) {
          console.log(chalk.cyan('Publisher:'), info.publisher);
        }
        
        if (info.publishedDate) {
          console.log(chalk.cyan('Published:'), info.publishedDate.join('-'));
        }
        
        if (info.isbn) {
          console.log(chalk.cyan('ISBN:'), info.isbn);
        }
        
        console.log(chalk.cyan('Language:'), info.language);
        
        console.log(chalk.bold('\nStructure:'));
        console.log(chalk.gray('─'.repeat(50)));
        
        if (info.unitCount > 0) {
          console.log(chalk.green('Units:'), info.unitCount);
        }
        console.log(chalk.green('Chapters:'), info.chapterCount);
        console.log(chalk.green('Sections:'), info.sectionCount);
        
        console.log(chalk.bold('\nComponents:'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.yellow('Front Matter:'), info.hasFrontMatter ? '✓' : '✗');
        console.log(chalk.yellow('Back Matter:'), info.hasBackMatter ? '✓' : '✗');
      }
    } catch (error) {
      console.error(chalk.red('Failed to process document'));
      if (options.parent?.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });