#!/usr/bin/env node

/**
 * @xats-org/mcp-server - Command Line Interface
 */

import { Command } from 'commander';

import { startServer, getServerInfo, DEFAULT_CONFIG } from './index.js';

import type { McpServerConfig } from './types.js';

const program = new Command();
const serverInfo = getServerInfo();

program
  .name('xats-mcp-server')
  .description('Model Context Protocol server for xats documents')
  .version(serverInfo.version);

// Main server command
program
  .command('start', { isDefault: true })
  .description('Start the MCP server')
  .option('--name <name>', 'Server name', DEFAULT_CONFIG.name)
  .option('--description <desc>', 'Server description', DEFAULT_CONFIG.description)
  .option(
    '--schema-version <version>',
    'Default schema version',
    DEFAULT_CONFIG.defaultSchemaVersion
  )
  .option('--strict', 'Enable strict validation mode', DEFAULT_CONFIG.validation?.strict)
  .option('--no-strict', 'Disable strict validation mode')
  .option('--all-errors', 'Show all validation errors', DEFAULT_CONFIG.validation?.allErrors)
  .option('--no-all-errors', 'Show only first validation error')
  .option('--tools', 'Enable tools capability (default)', true)
  .option('--no-tools', 'Disable tools capability')
  .option('--resources', 'Enable resources capability', DEFAULT_CONFIG.capabilities?.resources)
  .option('--no-resources', 'Disable resources capability')
  .option('--prompts', 'Enable prompts capability', DEFAULT_CONFIG.capabilities?.prompts)
  .option('--no-prompts', 'Disable prompts capability')
  .option('--debug', 'Enable debug logging', false)
  .option('--quiet', 'Suppress non-error output', false)
  .action(async (options) => {
    try {
      if (!options.quiet) {
        console.error(`Starting ${serverInfo.name} v${serverInfo.version}...`);
      }

      const config: Partial<McpServerConfig> = {
        name: options.name,
        description: options.description,
        defaultSchemaVersion: options.schemaVersion,
        capabilities: {
          tools: options.tools,
          resources: options.resources,
          prompts: options.prompts,
        },
        validation: {
          strict: options.strict,
          allErrors: options.allErrors,
        },
      };

      if (options.debug) {
        console.error('Configuration:', JSON.stringify(config, null, 2));
      }

      await startServer(config);
    } catch (error) {
      console.error('Failed to start server:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Info command
program
  .command('info')
  .description('Display server information')
  .option('--json', 'Output as JSON')
  .action((options) => {
    if (options.json) {
      console.log(JSON.stringify(serverInfo, null, 2));
    } else {
      console.log(`${serverInfo.name} v${serverInfo.version}`);
      console.log(`${serverInfo.description}\n`);

      console.log('Capabilities:');
      console.log(`  Tools: ${serverInfo.capabilities.toolCount} available`);
      console.log(`    - ${serverInfo.capabilities.tools.join('\n    - ')}\n`);

      console.log(`  Categories: ${serverInfo.capabilities.categories.join(', ')}\n`);

      console.log(`Supported Schema Versions: ${serverInfo.supportedSchemaVersions.join(', ')}`);
      console.log(`Supported Formats: ${serverInfo.supportedFormats.join(', ')}`);

      console.log(`\nAuthor: ${serverInfo.author}`);
      console.log(`License: ${serverInfo.license}`);
    }
  });

// Tools command
program
  .command('tools')
  .description('List available tools')
  .option('--json', 'Output as JSON')
  .option('--category <category>', 'Filter by category')
  .action(async (options) => {
    try {
      const { TOOL_REGISTRY, TOOL_CATEGORIES, getToolsByCategory } = await import('./index.js');

      if (options.json) {
        const tools = options.category
          ? getToolsByCategory(options.category)
          : Object.values(TOOL_REGISTRY);
        console.log(JSON.stringify(tools, null, 2));
      } else {
        if (options.category) {
          const categoryInfo = TOOL_CATEGORIES[options.category as keyof typeof TOOL_CATEGORIES];
          if (!categoryInfo) {
            console.error(`Unknown category: ${options.category}`);
            console.error(`Available categories: ${Object.keys(TOOL_CATEGORIES).join(', ')}`);
            process.exit(1);
          }

          console.log(`${categoryInfo.name} Tools:`);
          console.log(`${categoryInfo.description}\n`);

          const tools = getToolsByCategory(options.category);
          for (const tool of tools) {
            console.log(`  ${tool.name} - ${tool.description}`);
          }
        } else {
          console.log('Available Tools:\n');

          for (const [categoryName, categoryInfo] of Object.entries(TOOL_CATEGORIES)) {
            console.log(`${categoryInfo.name}:`);
            const tools = getToolsByCategory(categoryName as keyof typeof TOOL_CATEGORIES);
            for (const tool of tools) {
              console.log(`  ${tool.name} - ${tool.description}`);
            }
            console.log();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load tools:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Validate command (for testing)
program
  .command('validate <file>')
  .description('Validate a xats document (for testing)')
  .option('--schema-version <version>', 'Schema version to validate against')
  .option('--strict', 'Enable strict validation')
  .option('--json', 'Output as JSON')
  .action(async (file, options) => {
    try {
      const fs = await import('fs');
      const { validateTool } = await import('./index.js');

      if (!fs.existsSync(file)) {
        console.error(`File not found: ${file}`);
        process.exit(1);
      }

      const content = fs.readFileSync(file, 'utf-8');
      let document;

      try {
        document = JSON.parse(content);
      } catch (parseError) {
        console.error(
          'Failed to parse JSON:',
          parseError instanceof Error ? parseError.message : parseError
        );
        process.exit(1);
      }

      const result = await validateTool(
        {
          document,
          schemaVersion: options.schemaVersion,
          strict: options.strict,
        },
        {
          name: 'xats-mcp-server',
          version: serverInfo.version,
          description: serverInfo.description,
          defaultSchemaVersion: options.schemaVersion || '0.5.0',
          validation: {
            strict: options.strict || true,
            allErrors: true,
          },
        }
      );

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        if (result.success && result.data?.isValid) {
          console.log('✅ Document is valid');
          if (result.data.schemaVersion) {
            console.log(`Schema version: ${result.data.schemaVersion}`);
          }
        } else {
          console.log('❌ Document is invalid');
          if (result.data?.errors) {
            console.log('\nErrors:');
            for (const error of result.data.errors) {
              console.log(`  - ${error.path}: ${error.message}`);
            }
          }
          if (result.error) {
            console.log(`\nError: ${result.error}`);
          }
          process.exit(1);
        }
      }
    } catch (error) {
      console.error('Validation failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

// Version command (alternative to --version)
program
  .command('version')
  .description('Display version information')
  .action(() => {
    console.log(serverInfo.version);
  });

// Error handling
program.configureOutput({
  writeErr: (str) => process.stderr.write(str),
  writeOut: (str) => process.stdout.write(str),
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Parse command line arguments
program.parse();
