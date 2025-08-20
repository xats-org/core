import type {
  XatsDocument,
  Unit,
  Chapter,
  Section,
  ContentBlock,
  SemanticText,
  SemanticTextRun,
  StructuralContainer,
} from '@xats/types';

/**
 * Base renderer options
 */
export interface RendererOptions {
  includeIds?: boolean;
  includeTags?: boolean;
  includeExtensions?: boolean;
  customRenderers?: Record<string, (block: ContentBlock, renderer: BaseRenderer) => string>;
}

/**
 * Base class for all renderers
 */
export abstract class BaseRenderer {
  protected options: RendererOptions;

  constructor(options: RendererOptions = {}) {
    this.options = {
      includeIds: true,
      includeTags: false,
      includeExtensions: false,
      ...options,
    };
  }

  /**
   * Render a complete xats document
   */
  abstract render(document: XatsDocument): string;

  /**
   * Render document metadata
   */
  abstract renderMetadata(document: XatsDocument): string;

  /**
   * Render a structural container
   */
  abstract renderStructuralContainer(container: StructuralContainer): string;

  /**
   * Render a unit
   */
  abstract renderUnit(unit: Unit): string;

  /**
   * Render a chapter
   */
  abstract renderChapter(chapter: Chapter): string;

  /**
   * Render a section
   */
  abstract renderSection(section: Section): string;

  /**
   * Render a content block
   */
  abstract renderContentBlock(block: ContentBlock): string;

  /**
   * Render semantic text
   */
  abstract renderSemanticText(text: SemanticText): string;

  /**
   * Render a semantic text run
   */
  abstract renderSemanticTextRun(run: SemanticTextRun): string;

  /**
   * Get block type name from URI
   */
  protected getBlockTypeName(uri: string): string {
    const parts = uri.split('/');
    return parts[parts.length - 1] || 'unknown';
  }

  /**
   * Check if a custom renderer exists for a block type
   */
  protected hasCustomRenderer(blockType: string): boolean {
    const typeName = this.getBlockTypeName(blockType);
    return Boolean(this.options.customRenderers?.[typeName]);
  }

  /**
   * Apply custom renderer for a block
   */
  protected applyCustomRenderer(block: ContentBlock): string | null {
    if (!this.options.customRenderers) return null;

    const typeName = this.getBlockTypeName(block.blockType);
    const customRenderer = this.options.customRenderers[typeName];

    if (customRenderer) {
      return customRenderer(block, this);
    }

    return null;
  }

  /**
   * Render contents of a container
   */
  protected renderContents(contents: Array<Unit | Chapter | Section | ContentBlock>): string {
    return contents
      .map((item) => {
        if ('blockType' in item) {
          return this.renderContentBlock(item);
        } else {
          // Determine type by examining the structure
          if ('contents' in item) {
            const firstContent = Array.isArray(item.contents) ? item.contents[0] : null;
            if (firstContent && 'blockType' in firstContent) {
              return this.renderSection(item as Section);
            } else if (firstContent && 'contents' in firstContent) {
              const nestedContent = Array.isArray(firstContent.contents)
                ? firstContent.contents[0]
                : null;
              if (nestedContent && 'blockType' in nestedContent) {
                return this.renderChapter(item as Chapter);
              }
              return this.renderUnit(item as Unit);
            }
            return this.renderSection(item as Section);
          }
        }
        return '';
      })
      .join('');
  }

  /**
   * Escape special characters for the target format
   */
  protected abstract escapeText(text: string): string;
}
