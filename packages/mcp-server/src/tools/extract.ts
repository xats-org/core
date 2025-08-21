/**
 * @xats-org/mcp-server - Extract Tool Implementation
 */

import { McpError } from '../types.js';

import type { ExtractInput, ExtractResult, McpServerConfig } from '../types.js';
import type { XatsDocument, SemanticText } from '@xats-org/types';

/**
 * Extract content from SemanticText
 */
function extractSemanticTextContent(semanticText: SemanticText | undefined): any {
  if (!semanticText?.runs) return null;

  return {
    plainText: semanticText.runs
      .filter((run) => run.type === 'text')
      .map((run) => ('text' in run ? run.text : ''))
      .join(' '),
    runs: semanticText.runs.map((run) => ({
      type: run.type,
      text: 'text' in run ? run.text : '',
      ...('ref' in run ? { ref: run.ref } : {}),
      ...('citeKey' in run ? { citeKey: run.citeKey } : {}),
    })),
    references: semanticText.runs
      .filter((run) => run.type === 'reference')
      .map((run) => ({ type: run.type, ref: 'ref' in run ? run.ref : null })),
    citations: semanticText.runs
      .filter((run) => run.type === 'citation')
      .map((run) => ({ type: run.type, citeKey: 'citeKey' in run ? run.citeKey : null })),
  };
}

/**
 * Get value at JSON path
 */
function getValueAtPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    // Handle array indices
    if (part.includes('[') && part.includes(']')) {
      const [key, indexStr] = part.split('[');
      const indexStr2 = indexStr?.replace(']', '');
      const index = indexStr2 ? parseInt(indexStr2, 10) : -1;

      if (key) {
        current = current[key];
      }

      if (Array.isArray(current) && index >= 0 && index < current.length) {
        current = current[index];
      } else {
        return undefined;
      }
    } else {
      current = current[part];
    }
  }

  return current;
}

/**
 * Extract metadata from the document
 */
function extractMetadata(document: XatsDocument): any {
  return {
    schemaVersion: document.schemaVersion,
    bibliographicEntry: document.bibliographicEntry,
    subject: document.subject,
    lang: document.lang,
    dir: document.dir,
    rightsMetadata: document.rightsMetadata,
    accessibilityMetadata: document.accessibilityMetadata,
  };
}

/**
 * Extract structural information from the document
 */
function extractStructure(document: XatsDocument): any {
  const structure: any = {
    frontMatter: null,
    bodyMatter: null,
    backMatter: null,
  };

  if (document.frontMatter) {
    structure.frontMatter = {
      preface: document.frontMatter.preface?.length || 0,
      acknowledgments: document.frontMatter.acknowledgments?.length || 0,
    };
  }

  if (document.bodyMatter) {
    structure.bodyMatter = {
      containerCount: document.bodyMatter.contents.length,
      containers: document.bodyMatter.contents.map((container) => ({
        id: container.id,
        label: container.label,
        title: extractSemanticTextContent(container.title)?.plainText,
        type: 'contents' in container ? 'chapter' : 'unit',
        sectionCount: 'contents' in container ? container.contents.length : 0,
        learningOutcomesCount: container.learningOutcomes?.length || 0,
        pathwaysCount: container.pathways?.length || 0,
      })),
    };
  }

  if (document.backMatter) {
    structure.backMatter = {
      appendices: document.backMatter.appendices?.length || 0,
      glossary: document.backMatter.glossary?.length || 0,
      bibliography: document.backMatter.bibliography?.length || 0,
      index: document.backMatter.index?.length || 0,
    };
  }

  return structure;
}

/**
 * Extract all content blocks matching filter criteria
 */
function extractContent(document: XatsDocument, filter?: ExtractInput['filter']): any {
  const extractedContent: any[] = [];

  function processContainer(container: any, path: string): void {
    if ('contents' in container && Array.isArray(container.contents)) {
      for (let i = 0; i < container.contents.length; i++) {
        const item = container.contents[i];
        const itemPath = `${path}.contents[${i}]`;

        if ('blockType' in item) {
          // This is a content block
          const blockType = item.blockType;

          // Apply block type filter
          if (filter?.blockTypes && !filter.blockTypes.includes(blockType)) {
            continue;
          }

          // Check if content is empty and should be excluded
          if (!filter?.includeEmpty && (!item.content || Object.keys(item.content).length === 0)) {
            continue;
          }

          const contentData: any = {
            id: item.id,
            blockType,
            path: itemPath,
            tags: item.tags,
            extensions: item.extensions,
          };

          // Extract specific content based on block type
          if (item.content) {
            contentData.content = { ...item.content };

            // Process semantic text in content
            if (item.content.text) {
              contentData.textContent = extractSemanticTextContent(item.content.text);
            }

            if (item.content.title) {
              contentData.titleContent = extractSemanticTextContent(item.content.title);
            }

            if (item.content.caption) {
              contentData.captionContent = extractSemanticTextContent(item.content.caption);
            }
          }

          extractedContent.push(contentData);
        } else if ('contents' in item) {
          // This is a nested container, recurse
          processContainer(item, itemPath);
        }
      }
    }
  }

  // Process body matter
  if (document.bodyMatter?.contents) {
    for (let i = 0; i < document.bodyMatter.contents.length; i++) {
      const container = document.bodyMatter.contents[i];
      processContainer(container, `bodyMatter.contents[${i}]`);
    }
  }

  // Process front matter content blocks
  const processFrontMatterBlocks = (blocks: any[] | undefined, prefix: string) => {
    if (!blocks) return;
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if ('blockType' in block) {
        const blockType = block.blockType;

        if (!filter?.blockTypes || filter.blockTypes.includes(blockType)) {
          if (filter?.includeEmpty || (block.content && Object.keys(block.content).length > 0)) {
            extractedContent.push({
              id: block.id,
              blockType,
              path: `${prefix}[${i}]`,
              content: block.content,
              tags: block.tags,
              extensions: block.extensions,
            });
          }
        }
      }
    }
  };

  // Process front matter
  if (document.frontMatter) {
    processFrontMatterBlocks(document.frontMatter.preface, 'frontMatter.preface');
    processFrontMatterBlocks(document.frontMatter.acknowledgments, 'frontMatter.acknowledgments');
  }

  // Process back matter
  if (document.backMatter) {
    processFrontMatterBlocks(document.backMatter.appendices, 'backMatter.appendices');
    processFrontMatterBlocks(document.backMatter.glossary, 'backMatter.glossary');
    processFrontMatterBlocks(document.backMatter.bibliography, 'backMatter.bibliography');
    processFrontMatterBlocks(document.backMatter.index, 'backMatter.index');
  }

  return extractedContent;
}

/**
 * Extract assessment-related content
 */
function extractAssessments(document: XatsDocument, _filter?: ExtractInput['filter']): any {
  const assessments: any[] = [];

  function findAssessments(container: any, path: string): void {
    if ('contents' in container && Array.isArray(container.contents)) {
      for (let i = 0; i < container.contents.length; i++) {
        const item = container.contents[i];
        const itemPath = `${path}.contents[${i}]`;

        if ('blockType' in item) {
          const blockType = item.blockType;

          // Check if this is an assessment-related block
          if (
            blockType.includes('assessment') ||
            blockType.includes('quiz') ||
            blockType.includes('test') ||
            blockType.includes('multipleChoice') ||
            blockType.includes('shortAnswer') ||
            blockType.includes('essay')
          ) {
            assessments.push({
              id: item.id,
              blockType,
              path: itemPath,
              content: item.content,
              tags: item.tags,
              extensions: item.extensions,
            });
          }
        } else if ('contents' in item) {
          findAssessments(item, itemPath);
        }
      }
    }

    // Check for pathways (which might contain assessment conditions)
    if ('pathways' in container && Array.isArray(container.pathways)) {
      for (let i = 0; i < container.pathways.length; i++) {
        const pathway = container.pathways[i];
        if (pathway.condition && pathway.condition.includes('assessment')) {
          assessments.push({
            id: pathway.id,
            type: 'pathway',
            pathwayType: pathway.type,
            condition: pathway.condition,
            path: `${path}.pathways[${i}]`,
          });
        }
      }
    }
  }

  // Search in body matter
  if (document.bodyMatter?.contents) {
    for (let i = 0; i < document.bodyMatter.contents.length; i++) {
      const container = document.bodyMatter.contents[i];
      findAssessments(container, `bodyMatter.contents[${i}]`);
    }
  }

  return assessments;
}

/**
 * Extract specific content from a xats document
 */
export async function extractTool(
  input: ExtractInput,
  config: McpServerConfig
): Promise<ExtractResult> {
  try {
    // Validate input
    if (!input.document) {
      throw new McpError('Document is required for extraction', 'MISSING_DOCUMENT');
    }

    let extractedData: any;
    const extractionType = input.type || 'content';
    const path = input.path || 'root';

    // Handle specific path extraction first
    if (input.path && input.path !== 'root') {
      extractedData = getValueAtPath(input.document, input.path);

      if (extractedData === undefined) {
        return {
          success: false,
          error: `Path '${input.path}' not found in document`,
          metadata: {
            toolName: 'xats_extract',
            timestamp: new Date().toISOString(),
            path: input.path,
            type: extractionType,
          },
        };
      }
    } else {
      // Extract based on type
      switch (extractionType) {
        case 'metadata':
          extractedData = extractMetadata(input.document);
          break;

        case 'structure':
          extractedData = extractStructure(input.document);
          break;

        case 'assessments':
          extractedData = extractAssessments(input.document, input.filter);
          break;

        case 'content':
        default:
          extractedData = extractContent(input.document, input.filter);
          break;
      }
    }

    // Apply additional filtering if specified
    if (Array.isArray(extractedData) && input.filter) {
      // Filter by pathways if specified
      if (input.filter.pathways && input.filter.pathways.length > 0) {
        extractedData = extractedData.filter((item) => {
          if (item.pathwayType && input.filter?.pathways) {
            return input.filter.pathways.includes(item.pathwayType);
          }
          return true; // Include non-pathway items
        });
      }
    }

    return {
      success: true,
      data: {
        content: extractedData,
        path,
        type: extractionType,
      },
      metadata: {
        toolName: 'xats_extract',
        timestamp: new Date().toISOString(),
        documentId: 'extracted',
        schemaVersion: input.document.schemaVersion,
        path,
        type: extractionType,
        itemCount: Array.isArray(extractedData) ? extractedData.length : 1,
        filters: input.filter,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown extraction error',
      metadata: {
        toolName: 'xats_extract',
        timestamp: new Date().toISOString(),
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError',
        path: input.path,
        type: input.type,
      },
    };
  }
}

/**
 * Get available extraction types and their descriptions
 */
export function getExtractionTypes(): Array<{
  type: string;
  description: string;
  examples: string[];
}> {
  return [
    {
      type: 'content',
      description: 'Extract all content blocks with their text and metadata',
      examples: [
        'All paragraphs and their text content',
        'Figures with captions and sources',
        'Code blocks with syntax highlighting info',
      ],
    },
    {
      type: 'metadata',
      description: 'Extract document metadata and bibliographic information',
      examples: [
        'Title, author, subject information',
        'Schema version and document ID',
        'Rights and accessibility metadata',
      ],
    },
    {
      type: 'structure',
      description: 'Extract structural organization of the document',
      examples: [
        'Chapter and section hierarchy',
        'Content block counts by type',
        'Learning objectives and pathways',
      ],
    },
    {
      type: 'assessments',
      description: 'Extract all assessment-related content and pathways',
      examples: [
        'Quiz questions and answer options',
        'Assessment pathways and conditions',
        'Scoring and feedback structures',
      ],
    },
  ];
}

/**
 * Get common JSON paths for extraction
 */
export function getCommonPaths(): Array<{
  path: string;
  description: string;
  type: string;
}> {
  return [
    {
      path: 'bibliographicEntry',
      description: 'Document bibliographic metadata',
      type: 'object',
    },
    {
      path: 'bodyMatter.contents',
      description: 'Main content containers (chapters/units)',
      type: 'array',
    },
    {
      path: 'bodyMatter.contents[0].title',
      description: 'Title of the first chapter/unit',
      type: 'SemanticText',
    },
    {
      path: 'bodyMatter.contents[0].learningObjectives',
      description: 'Learning objectives of the first chapter',
      type: 'array',
    },
    {
      path: 'bodyMatter.contents[0].pathways',
      description: 'Learning pathways of the first chapter',
      type: 'array',
    },
    {
      path: 'frontMatter.contents',
      description: 'Front matter content blocks',
      type: 'array',
    },
    {
      path: 'backMatter.contents',
      description: 'Back matter content blocks',
      type: 'array',
    },
  ];
}
