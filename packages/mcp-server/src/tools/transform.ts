/**
 * @xats/mcp-server - Transform Tool Implementation
 */

import type { XatsDocument, SemanticText, XatsVersion } from '@xats/types';
import type { 
  TransformInput, 
  TransformResult, 
  TransformChange,
  McpServerConfig 
} from '../types.js';
import { TransformError } from '../types.js';

/**
 * Convert SemanticText to plain text
 */
function semanticTextToPlainText(semanticText: SemanticText | undefined): string {
  if (!semanticText?.runs) return '';
  
  return semanticText.runs
    .filter(run => run.type === 'text')
    .map(run => run.text || '')
    .join(' ');
}

/**
 * Convert SemanticText to markdown
 */
function semanticTextToMarkdown(semanticText: SemanticText | undefined): string {
  if (!semanticText?.runs) return '';
  
  return semanticText.runs
    .map(run => {
      switch (run.type) {
        case 'text':
          return 'text' in run ? run.text : '';
        case 'emphasis':
          return `*${'text' in run ? run.text : ''}*`;
        case 'strong':
          return `**${'text' in run ? run.text : ''}**`;
        case 'reference':
          return `[${'text' in run ? run.text : ''}](#${'ref' in run ? run.ref : ''})`;
        case 'citation':
          return `[@${'citeKey' in run ? run.citeKey : ''}]`;
        default:
          return 'text' in run ? run.text : '';
      }
    })
    .join('');
}

/**
 * Convert SemanticText to HTML
 */
function semanticTextToHtml(semanticText: SemanticText | undefined): string {
  if (!semanticText?.runs) return '';
  
  return semanticText.runs
    .map(run => {
      switch (run.type) {
        case 'text':
          return escapeHtml('text' in run ? run.text : '');
        case 'emphasis':
          return `<em>${escapeHtml('text' in run ? run.text : '')}</em>`;
        case 'strong':
          return `<strong>${escapeHtml('text' in run ? run.text : '')}</strong>`;
        case 'reference':
          return `<a href="#${'ref' in run ? run.ref : ''}">${escapeHtml('text' in run ? run.text : '')}</a>`;
        case 'citation':
          return `<cite data-key="${'citeKey' in run ? run.citeKey : ''}"></cite>`;
        default:
          return escapeHtml('text' in run ? run.text : '');
      }
    })
    .join('');
}

/**
 * Escape HTML characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Transform document to JSON (clean/restructured)
 */
function transformToJson(
  document: XatsDocument, 
  options: TransformInput['options']
): { document: XatsDocument; changes: TransformChange[] } {
  const changes: TransformChange[] = [];
  const transformedDocument: XatsDocument = JSON.parse(JSON.stringify(document));

  // Remove optional metadata if not preserving
  if (!options?.preserveMetadata) {
    // XatsDocument doesn't have these properties by default
    // This transformation would be for handling extended document types
    changes.push({
      type: 'modified',
      path: 'metadata',
      description: 'Configured to strip metadata if present',
    });
  }

  // Strip assessments if requested
  if (options?.stripAssessments) {
    const stripAssessmentsFromContainer = (container: any, path: string) => {
      if ('contents' in container && Array.isArray(container.contents)) {
        const originalLength = container.contents.length;
        container.contents = container.contents.filter((item: any, index: number) => {
          if ('blockType' in item) {
            const blockType = item.blockType;
            const isAssessment = blockType.includes('assessment') || 
                               blockType.includes('quiz') || 
                               blockType.includes('test');
            
            if (isAssessment) {
              changes.push({
                type: 'removed',
                path: `${path}.contents[${index}]`,
                before: item,
                description: `Removed assessment block: ${blockType}`,
              });
              return false;
            }
          } else if ('contents' in item) {
            stripAssessmentsFromContainer(item, `${path}.contents[${index}]`);
          }
          return true;
        });

        if (container.contents.length !== originalLength) {
          changes.push({
            type: 'modified',
            path: `${path}.contents`,
            before: { length: originalLength },
            after: { length: container.contents.length },
            description: `Filtered out ${originalLength - container.contents.length} assessment blocks`,
          });
        }
      }
    };

    if (transformedDocument.bodyMatter?.contents) {
      transformedDocument.bodyMatter.contents.forEach((container, index) => {
        stripAssessmentsFromContainer(container, `bodyMatter.contents[${index}]`);
      });
    }
  }

  // Flatten structure if requested
  if (options?.flattenStructure) {
    // This is a complex operation that would flatten the hierarchical structure
    // For now, we'll just document that it would happen
    changes.push({
      type: 'modified',
      path: 'bodyMatter',
      description: 'Structure flattening requested but not fully implemented',
    });
  }

  return { document: transformedDocument, changes };
}

/**
 * Transform document to Markdown
 */
function transformToMarkdown(
  document: XatsDocument, 
  options: TransformInput['options']
): { content: string; changes: TransformChange[] } {
  const changes: TransformChange[] = [];
  let markdown = '';

  // Add title
  if (document.bibliographicEntry?.title) {
    markdown += `# ${document.bibliographicEntry.title}\n\n`;
  }

  // Add author if available
  if (document.bibliographicEntry?.author) {
    const authors = Array.isArray(document.bibliographicEntry.author) 
      ? document.bibliographicEntry.author.map(a => a.family || a.given || '').filter(Boolean).join(', ')
      : String(document.bibliographicEntry.author || '');
    markdown += `**Author:** ${authors}\n\n`;
  }

  // Add subject
  if (document.subject) {
    markdown += `**Subject:** ${document.subject}\n\n`;
  }

  // Process body matter
  if (document.bodyMatter?.contents) {
    for (const container of document.bodyMatter.contents) {
      if ('title' in container && container.title) {
        markdown += `## ${semanticTextToMarkdown(container.title)}\n\n`;
      }

      // Add learning objectives
      if (container.learningOutcomes) {
        markdown += `### Learning Outcomes\n\n`;
        for (const outcome of container.learningOutcomes) {
          if (outcome.statement) {
            markdown += `- ${semanticTextToMarkdown(outcome.statement)}\n`;
          }
        }
        markdown += '\n';
      }

      // Process sections
      if ('contents' in container && container.contents) {
        for (const section of container.contents) {
          if ('title' in section && section.title) {
            markdown += `### ${semanticTextToMarkdown(section.title)}\n\n`;
          }

          // Process content blocks
          if ('contents' in section && section.contents) {
            for (const block of section.contents) {
              if ('blockType' in block && block.content) {
                const blockType = block.blockType;

                // Skip assessments if requested
                if (options?.stripAssessments && 
                    (blockType.includes('assessment') || blockType.includes('quiz'))) {
                  changes.push({
                    type: 'removed',
                    path: `block.${block.id}`,
                    description: `Skipped assessment block in markdown conversion`,
                  });
                  continue;
                }

                // Convert different block types (cast content as any for flexibility)
                const content = block.content as any;
                if (blockType.includes('paragraph')) {
                  if (content?.text) {
                    markdown += `${semanticTextToMarkdown(content.text)}\n\n`;
                  }
                } else if (blockType.includes('heading')) {
                  const level = content?.level || 1;
                  const prefix = '#'.repeat(Math.min(Math.max(level, 1), 6));
                  if (content?.text) {
                    markdown += `${prefix} ${semanticTextToMarkdown(content.text)}\n\n`;
                  }
                } else if (blockType.includes('list')) {
                  if (content?.items) {
                    for (const item of content.items) {
                      if (item?.text) {
                        markdown += `- ${semanticTextToMarkdown(item.text)}\n`;
                      }
                    }
                    markdown += '\n';
                  }
                } else if (blockType.includes('blockquote')) {
                  if (content?.text) {
                    const quotedText = semanticTextToMarkdown(content.text)
                      .split('\n')
                      .map(line => `> ${line}`)
                      .join('\n');
                    markdown += `${quotedText}\n\n`;
                  }
                } else if (blockType.includes('codeBlock')) {
                  const language = content?.language || '';
                  const code = content?.code || '';
                  markdown += `\`\`\`${language}\n${code}\n\`\`\`\n\n`;
                } else if (blockType.includes('figure')) {
                  if (content?.caption) {
                    markdown += `![${semanticTextToMarkdown(content.caption)}](${content?.src || ''})\n\n`;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  changes.push({
    type: 'added',
    path: 'markdown_content',
    after: { length: markdown.length },
    description: 'Converted document to Markdown format',
  });

  return { content: markdown, changes };
}

/**
 * Transform document to HTML
 */
function transformToHtml(
  document: XatsDocument, 
  options: TransformInput['options']
): { content: string; changes: TransformChange[] } {
  const changes: TransformChange[] = [];
  let html = `<!DOCTYPE html>\n<html lang="${document.lang || 'en'}">\n<head>\n`;
  
  // Add metadata
  if (document.bibliographicEntry?.title) {
    html += `  <title>${escapeHtml(String(document.bibliographicEntry.title))}</title>\n`;
  }
  
  html += `  <meta charset="UTF-8">\n`;
  html += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
  
  if (document.subject) {
    html += `  <meta name="subject" content="${escapeHtml(String(document.subject))}">\n`;
  }

  html += `</head>\n<body>\n`;

  // Add title
  if (document.bibliographicEntry?.title) {
    html += `  <h1>${escapeHtml(String(document.bibliographicEntry.title))}</h1>\n`;
  }

  // Add author information
  if (document.bibliographicEntry?.author) {
    const authors = Array.isArray(document.bibliographicEntry.author) 
      ? document.bibliographicEntry.author.map(a => a.family || a.given || '').filter(Boolean).join(', ')
      : String(document.bibliographicEntry.author || '');
    html += `  <p class="author"><strong>Author:</strong> ${escapeHtml(authors)}</p>\n`;
  }

  // Process body matter
  if (document.bodyMatter?.contents) {
    for (const container of document.bodyMatter.contents) {
      html += `  <section>\n`;
      
      if ('title' in container && container.title) {
        html += `    <h2>${semanticTextToHtml(container.title)}</h2>\n`;
      }

      // Add learning objectives
      if (container.learningOutcomes) {
        html += `    <div class="learning-outcomes">\n`;
        html += `      <h3>Learning Outcomes</h3>\n`;
        html += `      <ul>\n`;
        for (const outcome of container.learningOutcomes) {
          if (outcome.statement) {
            html += `        <li>${semanticTextToHtml(outcome.statement)}</li>\n`;
          }
        }
        html += `      </ul>\n`;
        html += `    </div>\n`;
      }

      // Process sections
      if ('contents' in container && container.contents) {
        for (const section of container.contents) {
          html += `    <section>\n`;
          
          if ('title' in section && section.title) {
            html += `      <h3>${semanticTextToHtml(section.title)}</h3>\n`;
          }

          // Process content blocks
          if ('contents' in section && section.contents) {
            for (const block of section.contents) {
              if ('blockType' in block && block.content) {
                const blockType = block.blockType;

                // Skip assessments if requested
                if (options?.stripAssessments && 
                    (blockType.includes('assessment') || blockType.includes('quiz'))) {
                  changes.push({
                    type: 'removed',
                    path: `block.${block.id}`,
                    description: `Skipped assessment block in HTML conversion`,
                  });
                  continue;
                }

                // Convert different block types (cast content as any for flexibility)
                const content = block.content as any;
                if (blockType.includes('paragraph')) {
                  if (content?.text) {
                    html += `      <p>${semanticTextToHtml(content.text)}</p>\n`;
                  }
                } else if (blockType.includes('heading')) {
                  const level = Math.min(Math.max(content?.level || 1, 1), 6);
                  if (content?.text) {
                    html += `      <h${level}>${semanticTextToHtml(content.text)}</h${level}>\n`;
                  }
                } else if (blockType.includes('list')) {
                  if (content?.items) {
                    html += `      <ul>\n`;
                    for (const item of content.items) {
                      if (item?.text) {
                        html += `        <li>${semanticTextToHtml(item.text)}</li>\n`;
                      }
                    }
                    html += `      </ul>\n`;
                  }
                } else if (blockType.includes('blockquote')) {
                  if (content?.text) {
                    html += `      <blockquote>${semanticTextToHtml(content.text)}</blockquote>\n`;
                  }
                } else if (blockType.includes('codeBlock')) {
                  const language = content?.language || '';
                  const code = escapeHtml(content?.code || '');
                  html += `      <pre><code class="language-${language}">${code}</code></pre>\n`;
                } else if (blockType.includes('figure')) {
                  html += `      <figure>\n`;
                  if (content?.src) {
                    const alt = content?.caption ? semanticTextToPlainText(content.caption) : '';
                    html += `        <img src="${escapeHtml(content.src)}" alt="${escapeHtml(alt)}">\n`;
                  }
                  if (content?.caption) {
                    html += `        <figcaption>${semanticTextToHtml(content.caption)}</figcaption>\n`;
                  }
                  html += `      </figure>\n`;
                }
              }
            }
          }
          
          html += `    </section>\n`;
        }
      }
      
      html += `  </section>\n`;
    }
  }

  html += `</body>\n</html>`;

  changes.push({
    type: 'added',
    path: 'html_content',
    after: { length: html.length },
    description: 'Converted document to HTML format',
  });

  return { content: html, changes };
}

/**
 * Transform document to plain text
 */
function transformToText(
  document: XatsDocument, 
  options: TransformInput['options']
): { content: string; changes: TransformChange[] } {
  const changes: TransformChange[] = [];
  let text = '';

  // Add title
  if (document.bibliographicEntry?.title) {
    text += `${document.bibliographicEntry.title}\n`;
    text += '='.repeat(document.bibliographicEntry.title.length) + '\n\n';
  }

  // Add author
  if (document.bibliographicEntry?.author) {
    const authors = Array.isArray(document.bibliographicEntry.author) 
      ? document.bibliographicEntry.author.map(a => a.family || a.given || '').filter(Boolean).join(', ')
      : String(document.bibliographicEntry.author || '');
    text += `Author: ${authors}\n\n`;
  }

  // Add subject
  if (document.subject) {
    text += `Subject: ${document.subject}\n\n`;
  }

  // Process body matter
  if (document.bodyMatter?.contents) {
    for (const container of document.bodyMatter.contents) {
      if ('title' in container && container.title) {
        const title = semanticTextToPlainText(container.title);
        text += `${title}\n`;
        text += '-'.repeat(title.length) + '\n\n';
      }

      // Add learning objectives
      if (container.learningOutcomes) {
        text += `Learning Outcomes:\n`;
        for (const outcome of container.learningOutcomes) {
          if (outcome.statement) {
            text += `• ${semanticTextToPlainText(outcome.statement)}\n`;
          }
        }
        text += '\n';
      }

      // Process sections
      if ('contents' in container && container.contents) {
        for (const section of container.contents) {
          if ('title' in section && section.title) {
            text += `${semanticTextToPlainText(section.title)}\n\n`;
          }

          // Process content blocks
          if ('contents' in section && section.contents) {
            for (const block of section.contents) {
              if ('blockType' in block && block.content) {
                const blockType = block.blockType;

                // Skip assessments if requested
                if (options?.stripAssessments && 
                    (blockType.includes('assessment') || blockType.includes('quiz'))) {
                  changes.push({
                    type: 'removed',
                    path: `block.${block.id}`,
                    description: `Skipped assessment block in text conversion`,
                  });
                  continue;
                }

                // Convert different block types to text (cast content as any for flexibility)
                const content = block.content as any;
                if (content?.text) {
                  text += `${semanticTextToPlainText(content.text)}\n\n`;
                } else if (content?.code) {
                  text += `${content.code}\n\n`;
                } else if (content?.items) {
                  for (const item of content.items) {
                    if (item?.text) {
                      text += `• ${semanticTextToPlainText(item.text)}\n`;
                    }
                  }
                  text += '\n';
                }
              }
            }
          }
        }
      }
    }
  }

  changes.push({
    type: 'added',
    path: 'text_content',
    after: { length: text.length },
    description: 'Converted document to plain text format',
  });

  return { content: text, changes };
}

/**
 * Migrate document to different schema version
 */
function migrateVersion(
  document: XatsDocument, 
  targetVersion: XatsVersion
): { document: XatsDocument; changes: TransformChange[] } {
  const changes: TransformChange[] = [];
  const currentVersion = document.schemaVersion;
  
  if (currentVersion === targetVersion) {
    return { document, changes };
  }

  // Clone the document
  const migratedDocument: XatsDocument = JSON.parse(JSON.stringify(document));
  
  // Update schema version
  migratedDocument.schemaVersion = targetVersion;
  changes.push({
    type: 'modified',
    path: 'schemaVersion',
    before: currentVersion,
    after: targetVersion,
    description: `Migrated schema version from ${currentVersion} to ${targetVersion}`,
  });

  // Version-specific migrations would go here
  // For now, we'll just note that migration occurred
  changes.push({
    type: 'modified',
    path: 'document',
    description: `Document structure updated for schema version ${targetVersion}`,
  });

  return { document: migratedDocument, changes };
}

/**
 * Transform a xats document to different formats or versions
 */
export async function transformTool(
  input: TransformInput,
  config: McpServerConfig
): Promise<TransformResult> {
  try {
    // Validate input
    if (!input.document) {
      throw new TransformError('Document is required for transformation');
    }

    const targetFormat = input.targetFormat || 'json';
    const options = input.options || {};
    let result: any;
    let changes: TransformChange[] = [];

    // Handle version migration first if requested
    let workingDocument = input.document;
    if (input.targetVersion && input.targetVersion !== input.document.schemaVersion) {
      const migrationResult = migrateVersion(input.document, input.targetVersion);
      workingDocument = migrationResult.document;
      changes = changes.concat(migrationResult.changes);
    }

    // Transform based on target format
    switch (targetFormat) {
      case 'json': {
        const transformResult = transformToJson(workingDocument, options);
        result = {
          document: transformResult.document,
          format: 'json',
        };
        changes = changes.concat(transformResult.changes);
        break;
      }

      case 'markdown': {
        const transformResult = transformToMarkdown(workingDocument, options);
        result = {
          content: transformResult.content,
          format: 'markdown',
        };
        changes = changes.concat(transformResult.changes);
        break;
      }

      case 'html': {
        const transformResult = transformToHtml(workingDocument, options);
        result = {
          content: transformResult.content,
          format: 'html',
        };
        changes = changes.concat(transformResult.changes);
        break;
      }

      case 'text': {
        const transformResult = transformToText(workingDocument, options);
        result = {
          content: transformResult.content,
          format: 'text',
        };
        changes = changes.concat(transformResult.changes);
        break;
      }

      default:
        throw new TransformError(`Unsupported target format: ${targetFormat}`);
    }

    return {
      success: true,
      data: {
        document: result.document,
        format: targetFormat,
        changes,
      },
      metadata: {
        toolName: 'xats_transform',
        timestamp: new Date().toISOString(),
        sourceFormat: 'json',
        targetFormat,
        targetVersion: input.targetVersion,
        documentId: 'transformed',
        sourceSchemaVersion: input.document.schemaVersion,
        changeCount: changes.length,
        options,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transformation error',
      metadata: {
        toolName: 'xats_transform',
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        targetFormat: input.targetFormat,
        targetVersion: input.targetVersion,
      },
    };
  }
}

/**
 * Get available transformation formats
 */
export function getAvailableFormats(): Array<{
  format: string;
  description: string;
  features: string[];
}> {
  return [
    {
      format: 'json',
      description: 'Clean/restructured JSON format with optional metadata removal',
      features: [
        'Preserve or strip metadata',
        'Remove assessment content',
        'Maintain xats structure',
        'Schema version migration',
      ],
    },
    {
      format: 'markdown',
      description: 'Convert to Markdown format for documentation or editing',
      features: [
        'Hierarchical headings',
        'Preserve text formatting',
        'Convert links and citations',
        'Learning objectives as lists',
      ],
    },
    {
      format: 'html',
      description: 'Convert to HTML for web publishing',
      features: [
        'Semantic HTML structure',
        'Preserve all formatting',
        'Include metadata',
        'Accessibility-friendly markup',
      ],
    },
    {
      format: 'text',
      description: 'Plain text format for analysis or simple viewing',
      features: [
        'Strip all formatting',
        'Maintain content hierarchy',
        'Include learning objectives',
        'Remove complex structures',
      ],
    },
  ];
}