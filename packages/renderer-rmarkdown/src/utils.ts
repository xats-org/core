/**
 * Utility functions for R Markdown processing
 */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import type {
  RChunkOptions,
  RChunkEngine,
  RMarkdownFrontmatter,
  BookdownReference,
  BookdownRefType,
  RMarkdownContext,
  RMarkdownValidationError,
} from './types.js';

/**
 * Parse R code chunk header to extract options
 */
export function parseChunkHeader(header: string): {
  engine: RChunkEngine;
  label?: string;
  options: RChunkOptions;
} {
  // Remove the opening and closing braces (and optional backticks)
  const content = header.replace(/^`*\{|\}`*$/g, '').trim();

  // First separate engine and label from options
  const spaceIndex = content.search(/[,\s]/);
  const enginePart = spaceIndex === -1 ? content : content.substring(0, spaceIndex);
  const optionsPart = spaceIndex === -1 ? '' : content.substring(spaceIndex);

  const engine = (enginePart.trim() || 'r') as RChunkEngine;

  // Smart split the options part by commas, respecting parentheses
  const parts = optionsPart ? smartSplit(optionsPart, ',') : [];

  const options: RChunkOptions = {};
  let label: string | undefined;

  // Parse all parts as options (since we already extracted the engine)
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]?.trim();
    if (!part) continue;

    // Handle label (first unnamed parameter)
    if (!part.includes('=') && !label) {
      label = part.replace(/['"]/g, '') || undefined;
      if (label) {
        options.label = label;
      }
      continue;
    }

    // Handle key=value pairs
    const equalIndex = part.indexOf('=');
    if (equalIndex === -1) continue;

    const key = part.substring(0, equalIndex).trim();
    const value = part.substring(equalIndex + 1).trim();
    if (!key) continue;

    // Parse the value based on its format
    options[key] = parseChunkOptionValue(value);
  }

  const result: { engine: RChunkEngine; label?: string; options: RChunkOptions } = {
    engine,
    options,
  };
  if (label) {
    result.label = label;
  }
  return result;
}

/**
 * Smart split function that respects parentheses and quotes
 */
function smartSplit(str: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let parenCount = 0;
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];

    if (!inQuotes && (char === '"' || char === "'")) {
      inQuotes = true;
      quoteChar = char;
      current += char;
    } else if (inQuotes && char === quoteChar) {
      inQuotes = false;
      quoteChar = '';
      current += char;
    } else if (!inQuotes && char === '(') {
      parenCount++;
      current += char;
    } else if (!inQuotes && char === ')') {
      parenCount--;
      current += char;
    } else if (!inQuotes && char === delimiter && parenCount === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    result.push(current.trim());
  }

  return result;
}

/**
 * Parse individual chunk option value
 */
export function parseChunkOptionValue(value: string): unknown {
  if (!value) return undefined;

  // Remove quotes
  const cleaned = value.replace(/^['"]|['"]$/g, '');

  // Boolean values
  if (cleaned.toLowerCase() === 'true') return true;
  if (cleaned.toLowerCase() === 'false') return false;

  // Numeric values
  if (/^-?\d+\.?\d*$/.test(cleaned)) {
    const num = Number(cleaned);
    return isNaN(num) ? cleaned : num;
  }

  // Array values (R-style)
  if (cleaned.startsWith('c(') && cleaned.endsWith(')')) {
    const arrayContent = cleaned.slice(2, -1);
    return arrayContent.split(',').map((item) => parseChunkOptionValue(item.trim()));
  }

  // String values or expressions
  return cleaned;
}

/**
 * Serialize chunk options back to R Markdown format
 */
export function serializeChunkOptions(
  engine: RChunkEngine,
  label?: string,
  options: RChunkOptions = {}
): string {
  const parts: string[] = [];

  // Engine and label go together
  if (label) {
    parts.push(`${engine} ${label}`);
  } else {
    parts.push(engine);
  }

  // Add other options
  for (const [key, value] of Object.entries(options)) {
    if (key === 'label') continue; // Already handled

    const serialized = serializeChunkOptionValue(value);
    if (serialized !== undefined) {
      parts.push(`${key}=${serialized}`);
    }
  }

  return `{${parts.join(', ')}}`;
}

/**
 * Serialize individual chunk option value
 */
export function serializeChunkOptionValue(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;

  if (typeof value === 'boolean') {
    return value.toString().toUpperCase();
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => serializeChunkOptionValue(item)).filter(Boolean);
    return `c(${items.join(', ')})`;
  }

  if (typeof value === 'string') {
    // Quote strings that contain spaces or special characters
    if (/[\s,=]/.test(value) || value.includes("'") || value.includes('"')) {
      return `"${value.replace(/"/g, '\\"')}"`;
    }
    return value;
  }

  // For objects or other complex types, convert to string
  return JSON.stringify(value);
}

/**
 * Parse YAML frontmatter
 */
export function parseYamlFrontmatter(content: string): RMarkdownFrontmatter | null {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*/);
  if (!match?.[1]) return null;

  const yamlContent = match[1];
  try {
    // Simple YAML parsing - in production, use a proper YAML library
    return parseSimpleYaml(yamlContent);
  } catch (error) {
    console.warn('Failed to parse YAML frontmatter:', error);
    return null;
  }
}

/**
 * Simple YAML parser for basic frontmatter (in production, use js-yaml)
 */
function parseSimpleYaml(yaml: string): RMarkdownFrontmatter {
  const result: RMarkdownFrontmatter = {};
  const lines = yaml
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line.startsWith('#') || line.startsWith('//')) continue;

    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.substring(0, colonIndex).trim();
    const value = line.substring(colonIndex + 1).trim();
    if (!key) continue;

    result[key] = parseYamlValue(value);
  }

  return result;
}

/**
 * Parse YAML value
 */
function parseYamlValue(value: string): unknown {
  if (!value) return null;

  // Remove quotes
  const cleaned = value.replace(/^['"]|['"]$/g, '');

  // Boolean values
  if (cleaned === 'true' || cleaned === 'yes') return true;
  if (cleaned === 'false' || cleaned === 'no') return false;

  // Null values
  if (cleaned === 'null' || cleaned === '~') return null;

  // Numeric values
  if (/^-?\d+\.?\d*$/.test(cleaned)) {
    const num = Number(cleaned);
    return isNaN(num) ? cleaned : num;
  }

  // Arrays (YAML format with quotes)
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    const arrayContent = cleaned.slice(1, -1);
    return arrayContent.split(',').map((item) => {
      const trimmed = item.trim();
      // Remove quotes from array items
      return trimmed.replace(/^["']|["']$/g, '');
    });
  }

  return cleaned;
}

/**
 * Serialize frontmatter to YAML
 */
export function serializeYamlFrontmatter(frontmatter: RMarkdownFrontmatter): string {
  const lines: string[] = ['---'];

  for (const [key, value] of Object.entries(frontmatter)) {
    if (value === undefined) continue;
    lines.push(`${key}: ${serializeYamlValue(value)}`);
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * Serialize YAML value
 */
function serializeYamlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return 'null';
  }

  if (typeof value === 'boolean') {
    return value.toString();
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return `[${value.map(serializeYamlValue).join(', ')}]`;
  }

  if (typeof value === 'object') {
    // For complex objects, use a simple format
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';

    const parts = entries.map(([k, v]) => `${k}: ${serializeYamlValue(v)}`);
    return `{${parts.join(', ')}}`;
  }

  // String values - quote only when necessary (more YAML-like)
  const str = String(value);

  // Special case for bookdown/rmarkdown output formats - don't quote these
  if (str.startsWith('bookdown::') || str.startsWith('rmarkdown::')) {
    return str;
  }

  // Quote if the string contains special characters, spaces, or looks like other types
  if (
    str.includes(' ') ||
    str.includes(':') ||
    str.includes('[') ||
    str.includes('{') ||
    str.includes('\n') ||
    str.includes(',') ||
    str.includes('#') ||
    str.trim() !== str ||
    /^(true|false|null|yes|no|\d+(\.\d+)?|\[.*\]|\{.*\})$/i.test(str)
  ) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }

  return str;
}

/**
 * Extract R code chunks from R Markdown content
 */
export function extractCodeChunks(content: string): Array<{
  start: number;
  end: number;
  header: string;
  code: string;
  options: ReturnType<typeof parseChunkHeader>;
}> {
  const chunks: Array<{
    start: number;
    end: number;
    header: string;
    code: string;
    options: ReturnType<typeof parseChunkHeader>;
  }> = [];

  // Regex to match code chunks
  const chunkRegex = /^```+\s*\{([^}]+)\}\s*\n([\s\S]*?)\n```+\s*$/gm;
  let match;

  while ((match = chunkRegex.exec(content)) !== null) {
    const header = match[1] || '';
    const code = match[2] || '';
    const options = parseChunkHeader(header);

    chunks.push({
      start: match.index,
      end: match.index + match[0].length,
      header,
      code,
      options,
    });
  }

  return chunks;
}

/**
 * Extract inline R code
 */
export function extractInlineCode(content: string): Array<{
  start: number;
  end: number;
  engine: RChunkEngine;
  code: string;
}> {
  const inline: Array<{
    start: number;
    end: number;
    engine: RChunkEngine;
    code: string;
  }> = [];

  // Match `r code` or `{r} code`
  const inlineRegex = /`\s*(\w+)?\s*([^`]+)`/g;
  let match;

  while ((match = inlineRegex.exec(content)) !== null) {
    const engine = (match[1] || 'r') as RChunkEngine;
    const code = match[2]?.trim() || '';

    inline.push({
      start: match.index,
      end: match.index + match[0].length,
      engine,
      code,
    });
  }

  return inline;
}

/**
 * Parse Bookdown cross-references
 */
export function parseBookdownReferences(content: string): BookdownReference[] {
  const references: BookdownReference[] = [];

  // Match references like \@ref(fig:label), \@ref(tab:label), etc.
  const refRegex = /\\@ref\(([^)]+)\)/g;
  let match;

  while ((match = refRegex.exec(content)) !== null) {
    const refContent = match[1];
    if (!refContent) continue;
    const colonIndex = refContent.indexOf(':');

    if (colonIndex !== -1) {
      const type = refContent.substring(0, colonIndex) as BookdownRefType;
      const label = refContent.substring(colonIndex + 1);
      if (!type || !label) continue;

      references.push({
        type,
        label,
        line: getLineNumber(content, match.index),
      });
    }
  }

  return references;
}

/**
 * Validate R Markdown content
 */
export function validateRMarkdown(content: string): RMarkdownValidationError[] {
  const errors: RMarkdownValidationError[] = [];
  const context: RMarkdownContext = {
    chunkNumber: 0,
    headingLevel: 0,
    inCodeChunk: false,
    chunkLabels: new Set(),
    crossRefs: new Map(),
    citationKeys: new Set(),
    figureCounter: 0,
    tableCounter: 0,
    equationCounter: 0,
  };

  // Extract and validate code chunks
  const chunks = extractCodeChunks(content);
  for (const chunk of chunks) {
    const { options } = chunk;

    // Check for duplicate labels
    if (options.label && typeof options.label === 'string') {
      if (context.chunkLabels.has(options.label)) {
        errors.push({
          type: 'duplicate-label',
          message: `Duplicate chunk label: ${options.label}`,
          line: getLineNumber(content, chunk.start),
          chunk: options.label,
          severity: 'error',
        });
      }
      context.chunkLabels.add(options.label);
    }

    // Validate chunk options (filter out label and engine as they're not chunk options)
    const actualOptions = options.options || options;
    for (const [key, value] of Object.entries(actualOptions)) {
      if (key === 'label' || key === 'engine') continue; // Skip label and engine as they're handled separately
      if (!validateChunkOption(key, value)) {
        const error: RMarkdownValidationError = {
          type: 'invalid-option',
          message: `Invalid chunk option: ${key}=${String(value)}`,
          line: getLineNumber(content, chunk.start),
          severity: 'warning',
        };
        if (options.label) {
          error.chunk = options.label;
        }
        errors.push(error);
      }
    }
  }

  // Validate cross-references
  const references = parseBookdownReferences(content);
  for (const ref of references) {
    // Check if referenced label exists
    if (!hasReferencedLabel(content, ref.type, ref.label)) {
      errors.push({
        type: 'missing-reference',
        message: `Missing reference target: ${ref.type}:${ref.label}`,
        line: ref.line || 0,
        severity: 'warning',
        suggestion: `Add a ${ref.type} with label "${ref.label}"`,
      });
    }
  }

  return errors;
}

/**
 * Validate individual chunk option
 */
function validateChunkOption(key: string, value: unknown): boolean {
  // Define valid options and their types
  const validOptions: Record<string, (value: unknown) => boolean> = {
    eval: (v) => typeof v === 'boolean' || typeof v === 'string',
    echo: (v) => typeof v === 'boolean' || typeof v === 'number' || typeof v === 'string',
    include: (v) => typeof v === 'boolean',
    warning: (v) => typeof v === 'boolean' || typeof v === 'string',
    error: (v) => typeof v === 'boolean' || typeof v === 'string',
    message: (v) => typeof v === 'boolean' || typeof v === 'string',
    results: (v) => ['markup', 'asis', 'hold', 'hide'].includes(v as string),
    collapse: (v) => typeof v === 'boolean',
    prompt: (v) => typeof v === 'boolean',
    comment: (v) => typeof v === 'string',
    highlight: (v) => typeof v === 'boolean',
    tidy: (v) => typeof v === 'boolean' || typeof v === 'string',
    cache: (v) => typeof v === 'boolean' || typeof v === 'string',
    fig: (v) => typeof v === 'object',
  };

  const validator = validOptions[key];
  return validator ? validator(value) : false; // Reject unknown options
}

/**
 * Check if a referenced label exists in the content
 */
function hasReferencedLabel(content: string, type: BookdownRefType, label: string): boolean {
  switch (type) {
    case 'fig':
      return (
        content.includes(`{#fig:${label}}`) ||
        content.includes(`fig.cap`) ||
        content.includes(`fig-${label}`)
      );
    case 'tab':
      return content.includes(`{#tab:${label}}`) || content.includes(`tab-${label}`);
    case 'eq':
      return content.includes(`{#eq:${label}}`) || content.includes(`\\label{${label}}`);
    case 'sec':
      return (
        content.includes(`{#sec:${label}}`) || content.includes(`# `) || content.includes(`## `)
      );
    default:
      return content.includes(`{#${type}:${label}}`);
  }
}

/**
 * Get line number for a given position in content
 */
function getLineNumber(content: string, position: number): number {
  return content.substring(0, position).split('\n').length;
}

/**
 * Normalize chunk options by merging with defaults
 */
export function normalizeChunkOptions(
  options: RChunkOptions = {},
  defaults: Partial<RChunkOptions> = {}
): RChunkOptions {
  // Only apply minimal defaults, let user options override everything
  const baseDefaults: Partial<RChunkOptions> = {
    eval: true,
    include: true,
    results: 'markup',
  };

  return {
    ...baseDefaults,
    ...defaults,
    ...options,
  };
}

/**
 * Generate unique chunk label
 */
export function generateChunkLabel(
  engine: RChunkEngine,
  index: number,
  existingLabels: Set<string>
): string {
  let label = `${engine}-chunk-${index}`;
  let counter = 1;

  while (existingLabels.has(label)) {
    label = `${engine}-chunk-${index}-${counter}`;
    counter++;
  }

  return label;
}

/**
 * Extract math expressions from content
 */
export function extractMathExpressions(content: string): Array<{
  type: 'inline' | 'display';
  content: string;
  start: number;
  end: number;
}> {
  const expressions: Array<{
    type: 'inline' | 'display';
    content: string;
    start: number;
    end: number;
  }> = [];

  // Display math: $$...$$
  const displayRegex = /\$\$([^$]+)\$\$/g;
  let match;

  while ((match = displayRegex.exec(content)) !== null) {
    if (match[1]) {
      expressions.push({
        type: 'display',
        content: match[1].trim(),
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }

  // Inline math: $...$  (avoiding display math)
  const inlineRegex = /(?<!\$)\$([^$\n]+)\$(?!\$)/g;
  while ((match = inlineRegex.exec(content)) !== null) {
    if (!match[1]) continue;

    // Skip if this is part of display math
    const matchIndex = match?.index;
    if (matchIndex === undefined) continue;

    const isInDisplay = expressions.some(
      (expr) => matchIndex >= expr.start && matchIndex <= expr.end
    );

    if (!isInDisplay) {
      expressions.push({
        type: 'inline',
        content: match[1].trim(),
        start: matchIndex,
        end: matchIndex + match[0].length,
      });
    }
  }

  return expressions.sort((a, b) => a.start - b.start);
}

/**
 * Clean R Markdown content by removing chunks and frontmatter
 */
export function cleanRMarkdownContent(content: string): string {
  // Remove YAML frontmatter
  let cleaned = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '');

  // Remove code chunks
  cleaned = cleaned.replace(/^```+\s*\{[^}]+\}\s*\n[\s\S]*?\n```+\s*$/gm, '');

  // Remove inline code
  cleaned = cleaned.replace(/`[^`]+`/g, '');

  return cleaned.trim();
}
