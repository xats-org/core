#!/usr/bin/env node

/**
 * xats CLI Validator
 * 
 * Command-line interface for validating xats documents.
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { validateXatsFile } from '../dist/validator.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const program = new Command();

// Read package.json for version
let packageVersion = '0.1.0';
try {
  const packagePath = resolve(new URL('../package.json', import.meta.url).pathname);
  const packageData = JSON.parse(readFileSync(packagePath, 'utf-8'));
  packageVersion = packageData.version;
} catch (error) {
  // Use fallback version
}

program
  .name('xats-validate')
  .description('Validate xats documents against the JSON Schema')
  .version(packageVersion)
  .argument('<file>', 'Path to the xats document to validate')
  .option('-v, --schema-version <version>', 'Specific schema version to validate against')
  .option('-s, --strict', 'Enable strict validation mode', false)
  .option('--no-all-errors', 'Stop on first validation error')
  .option('-q, --quiet', 'Only output errors and warnings', false)
  .option('--json', 'Output results as JSON', false)
  .action(async (file, options) => {
    try {
      if (!options.quiet && !options.json) {
        console.log(chalk.blue(`Validating: ${file}`));
        if (options.schemaVersion) {
          console.log(chalk.gray(`Schema version: ${options.schemaVersion}`));
        }
        console.log();
      }

      const result = await validateXatsFile(file, {
        schemaVersion: options.schemaVersion,
        strict: options.strict,
        allErrors: options.allErrors
      });

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        process.exit(result.isValid ? 0 : 1);
      }

      if (result.isValid) {
        console.log(chalk.green('✓ Document is valid'));
        if (result.schemaVersion && !options.quiet) {
          console.log(chalk.gray(`  Schema version: ${result.schemaVersion}`));
        }
        process.exit(0);
      } else {
        console.log(chalk.red('✗ Document validation failed'));
        console.log();

        if (result.errors.length > 0) {
          console.log(chalk.red('Validation Errors:'));
          result.errors.forEach((error, index) => {
            console.log(chalk.red(`  ${index + 1}. ${error.path}: ${error.message}`));
            
            if (error.keyword && !options.quiet) {
              console.log(chalk.gray(`     Keyword: ${error.keyword}`));
            }
            
            if (error.params && Object.keys(error.params).length > 0 && !options.quiet) {
              console.log(chalk.gray(`     Params: ${JSON.stringify(error.params)}`));
            }
            
            console.log();
          });
        }

        process.exit(1);
      }
    } catch (error) {
      console.error(chalk.red('Error during validation:'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      process.exit(1);
    }
  });

// Add a command to list available schema versions
program
  .command('versions')
  .description('List available schema versions')
  .action(() => {
    console.log(chalk.blue('Available schema versions:'));
    console.log('  • 0.1.0 (current)');
  });

// Add a command to show schema information
program
  .command('schema [version]')
  .description('Show information about a schema version')
  .action((version = '0.1.0') => {
    console.log(chalk.blue(`Schema version: ${version}`));
    console.log(chalk.gray(`  URI: https://xats.org/schemas/${version}/schema.json`));
    console.log(chalk.gray(`  Description: Extensible Academic Textbook Schema`));
  });

// Error handling
program.configureOutput({
  writeErr: (str) => process.stderr.write(chalk.red(str))
});

program.parseAsync(process.argv).catch(error => {
  console.error(chalk.red('CLI Error:'), error.message);
  process.exit(1);
});