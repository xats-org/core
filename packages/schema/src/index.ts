export const XatsSchema = {
  version: '0.4.0',
  $schema: 'http://json-schema.org/draft-07/schema#',
  description: 'Extensible Academic Textbook Schema',
};

export function loadSchema(version: string): Record<string, unknown> | null {
  // TODO: Load actual schema from files
  if (version === '0.1.0') {
    return {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      $id: `https://xats.org/schemas/${version}/xats.json`,
      type: 'object',
      required: ['schemaVersion', 'bibliographicEntry', 'subject', 'bodyMatter'],
    };
  }
  return null;
}

export function getSchemaVersion(schemaId?: string): string | null {
  if (!schemaId) return XatsSchema.version;
  
  const match = schemaId.match(/schemas\/(\d+\.\d+\.\d+)\//);
  return match && match[1] ? match[1] : null;
}

export function validateAgainstSchema(
  document: unknown,
  version: string
): { valid: boolean; errors: string[] } {
  const schema = loadSchema(version);
  if (!schema) {
    return {
      valid: false,
      errors: [`Schema version ${version} not found`],
    };
  }

  // Basic validation logic
  const doc = document as Record<string, unknown>;
  const errors: string[] = [];
  
  if (!doc.schemaVersion) errors.push('Missing schemaVersion');
  if (!doc.bibliographicEntry) errors.push('Missing bibliographicEntry');
  if (!doc.subject) errors.push('Missing subject');
  if (!doc.bodyMatter) errors.push('Missing bodyMatter');

  return {
    valid: errors.length === 0,
    errors,
  };
}
