#!/usr/bin/env node
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

import { Command } from 'commander';

import { formatCommand } from './commands/format.js';
import { infoCommand } from './commands/info.js';
import { statsCommand } from './commands/stats.js';
import { validateCommand } from './commands/validate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read package.json for version
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

const program = new Command();

program
  .name('xats')
  .description('Command-line interface for xats document validation and processing')
  .version(packageJson.version)
  .option('--no-color', 'disable colored output')
  .option('-q, --quiet', 'suppress non-error output')
  .option('-v, --verbose', 'enable verbose output');

// Add commands
program.addCommand(validateCommand);
program.addCommand(infoCommand);
program.addCommand(statsCommand);
program.addCommand(formatCommand);

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
