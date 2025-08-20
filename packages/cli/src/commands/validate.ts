/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import chalk from 'chalk';
import { Command } from 'commander';
import ora from 'ora';

import { XatsValidator } from '@xats/validator';

import { isXatsDocument } from '../types.js';

import type { ValidateCommandOptions } from '../types.js';
import type { XatsVersion } from '@xats/types';

export const validateCommand = new Command('validate')
  .description('Validate a xats document against the schema')
  .argument('<file>', 'path to the xats document')
  .option('-s, --schema <version>', 'schema version to validate against', 'latest')
  .option('--strict', 'enable strict validation mode')
  .option('--no-extensions', 'disallow extensions')
  .option('--format <format>', 'output format (text, json)', 'text')
  .action(async (file: string, options: ValidateCommandOptions) => {
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
      let document: unknown;

      try {
        document = JSON.parse(content);
      } catch (error) {
        spinner.fail(chalk.red('Failed to parse JSON document'));
        if (options.verbose) {
          console.error(error);
        }
        process.exit(1);
      }

      // Validate that it's a xats document
      if (!isXatsDocument(document)) {
        spinner.fail(chalk.red('Document is not a valid xats document structure'));
        process.exit(1);
      }

      // Validate document
      spinner.text = 'Validating document...';
      const validator = new XatsValidator({
        strict: Boolean(options.strict),
        allErrors: true,
        verbose: Boolean(options.verbose),
      });

      const _version = options.schema === 'latest' ? undefined : (options.schema as XatsVersion);
      const result = await validator.validate(document);

      if (result.isValid) {
        spinner.succeed(chalk.green('Document is valid!'));

        if (options.verbose && result.warnings && result.warnings.length > 0) {
          console.log(chalk.yellow('\nWarnings:'));
          result.warnings.forEach((warning, index) => {
            console.log(chalk.yellow(`  ${index + 1}. ${warning.message}`));
            if (warning.path) {
              console.log(chalk.gray(`     at: ${warning.path}`));
            }
          });
        }

        if (options.format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        }
      } else {
        spinner.fail(chalk.red('Document is invalid'));

        if (result.errors && result.errors.length > 0) {
          console.log(chalk.red('\nErrors:'));
          result.errors.forEach((error, index) => {
            console.log(chalk.red(`  ${index + 1}. ${error.message}`));
            if (error.path) {
              console.log(chalk.gray(`     at: ${error.path}`));
            }
            if (options.verbose && error.keyword) {
              console.log(chalk.gray(`     keyword: ${error.keyword}`));
            }
          });
        }

        if (options.format === 'json') {
          console.log(JSON.stringify(result, null, 2));
        }

        process.exit(1);
      }
    } catch (error) {
      spinner.fail(chalk.red('Validation failed'));
      if (options.verbose) {
        console.error(error);
      }
      process.exit(1);
    }
  });
