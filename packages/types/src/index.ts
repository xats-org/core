export interface XatsDocument {
  schemaVersion: string;
  bibliographicEntry: any;
  subject: string;
  frontMatter?: any;
  bodyMatter: any;
  backMatter?: any;
}

export interface XatsMetadata {
  id?: string;
  tags?: string[];
  extensions?: Record<string, any>;
}

export type XatsVersion = '0.1.0' | '0.2.0' | '0.3.0' | '0.4.0';