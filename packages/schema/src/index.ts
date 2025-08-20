export const XatsSchema = {
  version: '0.4.0',
  $schema: 'http://json-schema.org/draft-07/schema#',
  description: 'Extensible Academic Textbook Schema'
};

export const getSchemaVersion = () => XatsSchema.version;