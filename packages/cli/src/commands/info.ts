/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import chalk from 'chalk';
import { Command } from 'commander';

import { isStructuralContainer, isXatsDocument } from '../types.js';

import type { CslAuthor, DocumentInfo, InfoCommandOptions } from '../types.js';

export const infoCommand = new Command('info')
  .description('Display information about a xats document')
  .argument('<file>', 'path to the xats document')
  .option('--format <format>', 'output format (text, json)', 'text')
  .action((file: string, options: InfoCommandOptions) => {
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

      // Now TypeScript knows document is a valid xats document
      const xatsDoc = document as any; // Type guard doesn't narrow properly, use any for now

      // Extract information
      const info: DocumentInfo = {
        schemaVersion: xatsDoc.schemaVersion || 'unknown',
        title: xatsDoc.bibliographicEntry?.title || 'Untitled',
        authors: xatsDoc.bibliographicEntry?.author || [],
        subject: typeof xatsDoc.subject === 'string' ? xatsDoc.subject : '',
        language: (xatsDoc.bibliographicEntry?.language as string) || 'en',
        hasFrontMatter: Boolean(xatsDoc.frontMatter),
        hasBackMatter: Boolean(xatsDoc.backMatter),
        unitCount: 0,
        chapterCount: 0,
        sectionCount: 0,
        ...(xatsDoc.bibliographicEntry?.publisher && {
          publisher: xatsDoc.bibliographicEntry.publisher,
        }),
        ...(xatsDoc.bibliographicEntry?.issued?.['date-parts']?.[0] && {
          publishedDate: xatsDoc.bibliographicEntry.issued['date-parts'][0],
        }),
        ...(xatsDoc.bibliographicEntry?.ISBN && { isbn: xatsDoc.bibliographicEntry.ISBN }),
      };

      // Count structural elements
      if (xatsDoc.bodyMatter?.contents) {
        for (const item of xatsDoc.bodyMatter.contents) {
          if (isStructuralContainer(item)) {
            if (item.type === 'unit') {
              info.unitCount++;
              if (item.contents && Array.isArray(item.contents)) {
                for (const chapter of item.contents) {
                  if (isStructuralContainer(chapter) && chapter.type === 'chapter') {
                    info.chapterCount++;
                    if (chapter.contents && Array.isArray(chapter.contents)) {
                      info.sectionCount += chapter.contents.filter(
                        (s) => isStructuralContainer(s) && s.type === 'section'
                      ).length;
                    }
                  }
                }
              }
            } else if (item.type === 'chapter') {
              info.chapterCount++;
              if (item.contents && Array.isArray(item.contents)) {
                info.sectionCount += item.contents.filter(
                  (s) => isStructuralContainer(s) && s.type === 'section'
                ).length;
              }
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
          const authorNames = info.authors
            .map((a: CslAuthor) => a.literal || `${a.given || ''} ${a.family || ''}`.trim())
            .join(', ');
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
