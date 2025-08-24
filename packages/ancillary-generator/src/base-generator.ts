import type {
  AncillaryGenerator,
  ExtractionOptions,
  ExtractedContent,
  GenerationOptions,
  GenerationResult,
  OutputFormat,
} from './types';
import type {
  XatsDocument,
  ContentBlock,
  SemanticText,
  Run,
  Unit,
  Chapter,
  Section,
  FrontMatter,
  BackMatter,
  BodyMatter,
} from '@xats-org/types';

/**
 * Base implementation of ancillary generator
 */
export abstract class BaseAncillaryGenerator implements AncillaryGenerator {
  abstract supportedFormats: OutputFormat[];

  /**
   * Extract content blocks that match the specified tags
   */
  extractTaggedContent(document: XatsDocument, options: ExtractionOptions): ExtractedContent[] {
    const extracted: ExtractedContent[] = [];
    const { tags, includeNested = true, maxDepth = 10, filter } = options;

    // Helper function to recursively extract content
    const extractFromContainer = (
      container: Unit | Chapter | Section | BodyMatter | FrontMatter | BackMatter,
      path: string[],
      depth: number
    ): void => {
      if (depth > maxDepth) return;

      // Check if container has contents array
      if ('contents' in container && Array.isArray(container.contents)) {
        for (const item of container.contents) {
          const currentPath = [...path];

          // Add container label/title to path if available
          if ('label' in item && typeof (item as Unit | Chapter | Section).label === 'string') {
            currentPath.push((item as Unit | Chapter | Section).label as string);
          } else if ('title' in item && (item as Unit | Chapter | Section).title) {
            currentPath.push(this.extractPlainText((item as Unit | Chapter | Section).title));
          }

          // Process content blocks
          if ('blockType' in item) {
            // Item is a ContentBlock
            const contentBlock = item as ContentBlock;
            if (this.shouldExtractBlock(contentBlock, tags, filter)) {
              extracted.push({
                sourceBlock: contentBlock,
                content: contentBlock.content,
                tags: contentBlock.tags || [],
                path: currentPath,
                metadata: contentBlock.extensions as Record<string, unknown>,
              });
            }
          } else if ('contents' in item && Array.isArray(item.contents)) {
            // Item is a structural container with contents
            const containerItem = item as Unit | Chapter | Section;
            for (const block of containerItem.contents) {
              if ('blockType' in block) {
                const contentBlock = block;
                if (this.shouldExtractBlock(contentBlock, tags, filter)) {
                  extracted.push({
                    sourceBlock: contentBlock,
                    content: contentBlock.content,
                    tags: contentBlock.tags || [],
                    path: currentPath,
                    metadata: contentBlock.extensions as Record<string, unknown>,
                  });
                }
              }
            }
          }

          // Recursively process nested containers if enabled
          if (includeNested && 'contents' in item) {
            extractFromContainer(item as Unit | Chapter | Section, currentPath, depth + 1);
          }
        }
      }

      // Also check for specific content arrays at current level
      if ('preface' in container && container.preface) {
        const frontMatter = container as FrontMatter;
        for (const block of frontMatter.preface) {
          if (this.shouldExtractBlock(block, tags, filter)) {
            extracted.push({
              sourceBlock: block,
              content: block.content,
              tags: block.tags || [],
              path,
              metadata: block.extensions as Record<string, unknown>,
            });
          }
        }
      }
      if ('acknowledgments' in container && container.acknowledgments) {
        const frontMatter = container as FrontMatter;
        for (const block of frontMatter.acknowledgments) {
          if (this.shouldExtractBlock(block, tags, filter)) {
            extracted.push({
              sourceBlock: block,
              content: block.content,
              tags: block.tags || [],
              path,
              metadata: block.extensions as Record<string, unknown>,
            });
          }
        }
      }
    };

    // Start extraction from document body matter
    if (document.bodyMatter) {
      extractFromContainer(document.bodyMatter, ['Body'], 0);
    }

    // Also check front matter if present
    if (document.frontMatter) {
      extractFromContainer(document.frontMatter, ['Front Matter'], 0);
    }

    // And back matter
    if (document.backMatter) {
      extractFromContainer(document.backMatter, ['Back Matter'], 0);
    }

    return extracted;
  }

  /**
   * Check if a block should be extracted based on tags and filter
   */
  protected shouldExtractBlock(
    block: ContentBlock,
    tags: string[],
    filter?: (block: ContentBlock) => boolean
  ): boolean {
    // Check custom filter first
    if (filter && !filter(block)) {
      return false;
    }

    // Check if block has any of the specified tags
    if (block.tags && block.tags.length > 0) {
      const blockTags = new Set(block.tags);
      return tags.some((tag) => blockTags.has(tag));
    }

    return false;
  }

  /**
   * Extract plain text from SemanticText
   */
  protected extractPlainText(semanticText: SemanticText | undefined): string {
    if (!semanticText || !semanticText.runs) return '';

    return semanticText.runs
      .map((run: Run) => {
        if (run.type === 'text') {
          return run.text;
        }
        if ('text' in run) {
          return run.text;
        }
        return '';
      })
      .join('');
  }

  /**
   * Validate generation options
   */
  validateOptions(options: GenerationOptions): boolean {
    // Check if format is supported
    if (!this.supportedFormats.includes(options.format)) {
      console.error(
        `Format ${options.format} is not supported. Supported formats: ${this.supportedFormats.join(', ')}`
      );
      return false;
    }

    // Additional validation can be added by subclasses
    return true;
  }

  /**
   * Abstract method to be implemented by specific generators
   */
  abstract generateOutput(
    content: ExtractedContent[],
    options: GenerationOptions
  ): Promise<GenerationResult>;

  /**
   * Helper method to create a successful result
   */
  protected createSuccessResult(
    output: string | Buffer,
    format: OutputFormat,
    stats?: GenerationResult['stats']
  ): GenerationResult {
    return {
      success: true,
      output,
      format,
      stats,
    };
  }

  /**
   * Helper method to create an error result
   */
  protected createErrorResult(format: OutputFormat, errors: string[]): GenerationResult {
    return {
      success: false,
      format,
      errors,
    };
  }
}
