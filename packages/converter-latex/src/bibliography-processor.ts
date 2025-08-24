/**
 * @fileoverview Bibliography processing for LaTeX converter
 */

import type { BibliographyEntry, BibliographyOptions } from './types';

interface Citation {
  command: string;
  key: string;
  prefix?: string;
  suffix?: string;
  pages?: string;
}

interface CitationRun {
  key?: string;
  id?: string;
  prefix?: string;
  suffix?: string;
  pages?: string;
}

interface CSLAuthor {
  family?: string;
  given?: string;
  [key: string]: unknown;
}

interface CSLDate {
  'date-parts'?: number[][];
  [key: string]: unknown;
}

interface CSLEntry {
  id?: string;
  type?: string;
  title?: string;
  'container-title'?: string;
  author?: CSLAuthor[] | string;
  editor?: CSLAuthor[] | string;
  publisher?: string;
  'publisher-place'?: string;
  issued?: CSLDate | string | number;
  page?: string;
  volume?: string;
  issue?: string;
  ISBN?: string;
  DOI?: string;
  URL?: string;
  [key: string]: unknown;
}

/**
 * Processes bibliography and citations between xats and LaTeX formats
 */
export class BibliographyProcessor {
  /**
   * Convert xats bibliography to LaTeX format
   */
  renderBibliography(bibliography: unknown, options: BibliographyOptions = {}): string {
    const style = options.style || 'plain';
    const backend = options.backend || 'bibtex';

    let bibContent = '';

    if (backend === 'biblatex') {
      // Use biblatex format
      bibContent += `\\usepackage[style=${style}]{biblatex}\n`;

      if (options.includeFiles) {
        for (const file of options.includeFiles) {
          bibContent += `\\addbibresource{${file}}\n`;
        }
      }

      bibContent += `\\printbibliography\n`;
    } else {
      // Use traditional bibtex
      bibContent += `\\bibliographystyle{${style}}\n`;

      if (options.includeFiles) {
        const files = options.includeFiles.map((f) => f.replace('.bib', '')).join(',');
        bibContent += `\\bibliography{${files}}\n`;
      }
    }

    return bibContent;
  }

  /**
   * Parse BibTeX content to bibliography entries
   */
  parseBibTeX(content: string): BibliographyEntry[] {
    const entries: BibliographyEntry[] = [];

    // SECURITY: Fixed ReDoS vulnerability by limiting backtracking and adding match counting
    const entryRegex = /@(\w{1,20})\s*\{\s*([^,]{1,100}),\s*([\s\S]{0,2000}?)\s*\}/g;
    let match;
    let matchCount = 0;
    const MAX_MATCHES = 10000; // Reasonable limit for bibliography entries

    while ((match = entryRegex.exec(content)) !== null && matchCount < MAX_MATCHES) {
      matchCount++;
      const [, type, id, fieldsString] = match;
      const fields = this.parseFields(fieldsString || '');

      entries.push({
        id: id?.trim() || '',
        type: type?.toLowerCase() || '',
        fields,
        crossRefs: this.extractCrossRefs(fieldsString || ''),
      });
    }

    return entries;
  }

  /**
   * Convert xats citation to LaTeX citation
   */
  renderCitation(
    citationRun: CitationRun,
    style: 'numeric' | 'author-year' | 'alpha' = 'numeric'
  ): string {
    const key = citationRun.key || citationRun.id;
    const prefix = citationRun.prefix;
    const suffix = citationRun.suffix;
    const pages = citationRun.pages;

    let citation = '';

    // Choose citation command based on style
    switch (style) {
      case 'author-year':
        citation = '\\citep';
        break;
      case 'alpha':
        citation = '\\cite';
        break;
      case 'numeric':
      default:
        citation = '\\cite';
        break;
    }

    // Build citation with optional arguments
    if (prefix || suffix || pages) {
      const optionalArgs = [];
      if (prefix) optionalArgs.push(prefix);
      if (suffix || pages) {
        optionalArgs.push(suffix || '');
        if (pages) {
          optionalArgs[optionalArgs.length - 1] += pages;
        }
      }

      citation += `[${optionalArgs.join('][').replace(/\]\[$/g, '')}]`;
    }

    citation += `{${key}}`;

    return citation;
  }

  /**
   * Extract citations from LaTeX content
   */
  extractCitations(content: string): Citation[] {
    const citations: Citation[] = [];

    // SECURITY: Fixed ReDoS vulnerability by limiting backtracking and adding match counting
    const citationRegex =
      /\\(cite[a-z]{0,10}|ref)\*?\s*(?:\[([^\]]{0,200})\])?\s*(?:\[([^\]]{0,200})\])?\s*\{([^}]{1,100})\}/g;
    let match;
    let matchCount = 0;
    const MAX_MATCHES = 10000; // Reasonable limit for citations

    while ((match = citationRegex.exec(content)) !== null && matchCount < MAX_MATCHES) {
      matchCount++;
      const [, command, firstOpt, secondOpt, keys] = match;

      // Parse multiple keys
      const keyList = keys?.split(',').map((k) => k.trim()) || [];

      for (const key of keyList) {
        const citation: Citation = {
          command: command || '',
          key,
        };

        const prefix = firstOpt?.trim();
        if (prefix) {
          citation.prefix = prefix;
        }

        const suffix = secondOpt?.trim() || firstOpt?.trim();
        if (suffix && suffix !== prefix) {
          citation.suffix = suffix;
        }

        const pages = this.extractPages(secondOpt || firstOpt || '');
        if (pages) {
          citation.pages = pages;
        }

        citations.push(citation);
      }
    }

    return citations;
  }

  /**
   * Generate bibliography entry in LaTeX format
   */
  generateBibTeXEntry(entry: BibliographyEntry): string {
    let bibEntry = `@${entry.type}{${entry.id},\n`;

    // Add required and optional fields
    const fieldOrder = this.getFieldOrder(entry.type);

    for (const field of fieldOrder) {
      if (entry.fields[field]) {
        bibEntry += `  ${field} = {${this.escapeBibTeX(entry.fields[field])}},\n`;
      }
    }

    // Add remaining fields
    for (const [field, value] of Object.entries(entry.fields)) {
      if (!fieldOrder.includes(field) && value) {
        bibEntry += `  ${field} = {${this.escapeBibTeX(value)}},\n`;
      }
    }

    bibEntry = bibEntry.replace(/,\n$/, '\n'); // Remove trailing comma
    bibEntry += '}\n';

    return bibEntry;
  }

  /**
   * Validate bibliography entry
   */
  validateEntry(entry: BibliographyEntry): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields based on entry type
    const requiredFields = this.getRequiredFields(entry.type);

    for (const field of requiredFields) {
      if (!entry.fields[field]) {
        errors.push(`Missing required field '${field}' for ${entry.type} entry '${entry.id}'`);
      }
    }

    // Validate key format
    if (!this.isValidBibKey(entry.id)) {
      errors.push(`Invalid bibliography key format: ${entry.id}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Convert CSL-JSON to BibTeX
   */
  cslToBibTeX(cslEntry: CSLEntry): BibliographyEntry {
    const entry: BibliographyEntry = {
      id: cslEntry.id || 'unknown',
      type: this.mapCSLTypeToBibTeX(cslEntry.type),
      fields: {},
      crossRefs: [],
    };

    // Map CSL fields to BibTeX fields
    const fieldMapping: Record<string, string> = {
      title: 'title',
      'container-title': 'journal',
      author: 'author',
      editor: 'editor',
      publisher: 'publisher',
      'publisher-place': 'address',
      issued: 'year',
      page: 'pages',
      volume: 'volume',
      issue: 'number',
      ISBN: 'isbn',
      DOI: 'doi',
      URL: 'url',
    };

    for (const [cslField, bibField] of Object.entries(fieldMapping)) {
      if (cslEntry[cslField]) {
        let value = cslEntry[cslField];

        // Special handling for certain fields
        if (cslField === 'author' || cslField === 'editor') {
          value = this.formatAuthors(value as CSLAuthor[] | string);
        } else if (cslField === 'issued') {
          value = this.extractYear(value as CSLDate | string | number);
        }

        // Ensure we only assign string values
        if (typeof value === 'string') {
          entry.fields[bibField] = value;
        } else if (value !== null && value !== undefined) {
          entry.fields[bibField] = String(value);
        }
      }
    }

    return entry;
  }

  /**
   * Helper methods
   */
  private parseFields(fieldsString: string): Record<string, string> {
    const fields: Record<string, string> = {};

    // SECURITY: Fixed potential ReDoS vulnerability by limiting backtracking
    const fieldRegex = /(\w{1,30})\s*=\s*[{"']([^}"']{0,500})[}"']/g;
    let match;

    while ((match = fieldRegex.exec(fieldsString)) !== null) {
      const [, fieldName, fieldValue] = match;
      if (fieldName && fieldValue !== undefined) {
        fields[fieldName.toLowerCase()] = fieldValue;
      }
    }

    return fields;
  }

  private extractCrossRefs(fieldsString: string): string[] {
    const crossRefs: string[] = [];
    // SECURITY: Fixed potential ReDoS vulnerability by limiting backtracking
    const crossrefMatch = fieldsString.match(/crossref\s*=\s*[{"']([^}"']{0,100})[}"']/i);

    if (crossrefMatch && crossrefMatch[1]) {
      crossRefs.push(crossrefMatch[1]);
    }

    return crossRefs;
  }

  private extractPages(text: string): string | undefined {
    const pageMatch = text.match(/(?:pp?\.?\s*)(\d+(?:-\d+)?)/i);
    return pageMatch ? pageMatch[1] : undefined;
  }

  private getFieldOrder(entryType: string): string[] {
    const fieldOrders: Record<string, string[]> = {
      article: ['author', 'title', 'journal', 'year', 'volume', 'number', 'pages'],
      book: ['author', 'title', 'publisher', 'year', 'address', 'edition'],
      incollection: ['author', 'title', 'booktitle', 'editor', 'publisher', 'year', 'pages'],
      inproceedings: ['author', 'title', 'booktitle', 'year', 'pages', 'organization'],
      thesis: ['author', 'title', 'school', 'year', 'type'],
      techreport: ['author', 'title', 'institution', 'year', 'number'],
    };

    return fieldOrders[entryType.toLowerCase()] || ['author', 'title', 'year'];
  }

  private getRequiredFields(entryType: string): string[] {
    const requiredFields: Record<string, string[]> = {
      article: ['author', 'title', 'journal', 'year'],
      book: ['author', 'title', 'publisher', 'year'],
      incollection: ['author', 'title', 'booktitle', 'publisher', 'year'],
      inproceedings: ['author', 'title', 'booktitle', 'year'],
      thesis: ['author', 'title', 'school', 'year'],
      techreport: ['author', 'title', 'institution', 'year'],
    };

    return requiredFields[entryType.toLowerCase()] || ['title', 'year'];
  }

  private isValidBibKey(key: string): boolean {
    // SECURITY: Fixed potential ReDoS vulnerability by limiting key length
    return /^[a-zA-Z][a-zA-Z0-9_:-]{0,49}$/.test(key);
  }

  private escapeBibTeX(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\{/g, '\\{')
      .replace(/\}/g, '\\}')
      .replace(/\$/g, '\\$')
      .replace(/&/g, '\\&')
      .replace(/%/g, '\\%')
      .replace(/#/g, '\\#');
  }

  private mapCSLTypeToBibTeX(cslType?: string): string {
    const typeMapping: Record<string, string> = {
      'article-journal': 'article',
      'paper-conference': 'inproceedings',
      chapter: 'incollection',
      book: 'book',
      thesis: 'phdthesis',
      report: 'techreport',
    };

    return (cslType && typeMapping[cslType]) || 'misc';
  }

  private formatAuthors(authors: CSLAuthor[] | string): string {
    if (typeof authors === 'string') return authors;
    if (!Array.isArray(authors)) return String(authors);

    return authors
      .map((author) => {
        if (typeof author === 'string') return author;
        if (typeof author === 'object' && author !== null) {
          // Type narrowing - author is now narrowed to object type
          const { family, given } = author;
          if (family && given) {
            return `${family}, ${given}`;
          }
          return family || given || String(author);
        }
        return String(author);
      })
      .join(' and ');
  }

  private extractYear(issued: CSLDate | string | number): string {
    if (typeof issued === 'string') return issued;
    if (typeof issued === 'number') return String(issued);
    if (typeof issued === 'object' && issued !== null) {
      // issued is now narrowed to CSLDate
      if (issued['date-parts'] && Array.isArray(issued['date-parts'])) {
        const dateParts = issued['date-parts'][0];
        if (dateParts && dateParts[0]) {
          return String(dateParts[0]);
        }
      }
    }

    return 'unknown';
  }
}
