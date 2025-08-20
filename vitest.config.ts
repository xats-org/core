import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  'packages/schema',
  'packages/types',
  'packages/validator', 
  'packages/utils',
  'packages/examples',
  'packages/mcp-server',
  'packages/vocabularies',
]);