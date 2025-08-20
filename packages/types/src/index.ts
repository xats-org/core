export interface XatsDocument {
  schemaVersion: string;
  bibliographicEntry: Record<string, unknown>;
  subject: string;
  frontMatter?: Record<string, unknown>;
  bodyMatter: Record<string, unknown>;
  backMatter?: Record<string, unknown>;
}

export interface XatsMetadata {
  id?: string;
  tags?: string[];
  extensions?: Record<string, unknown>;
}

export type XatsVersion = '0.1.0' | '0.2.0' | '0.3.0' | '0.4.0';
