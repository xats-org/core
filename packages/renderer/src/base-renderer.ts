import type {
  XatsDocument,
  Unit,
  Chapter,
  Section,
  ContentBlock,
  SemanticText,
  SemanticTextRun,
  StructuralContainer,
} from '@xats-org/types';

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
  // Type guards for content block content types
  protected isSemanticText(value: unknown): value is SemanticText {
    return (
      typeof value === 'object' &&
      value !== null &&
      'runs' in value &&
      Array.isArray((value as SemanticText).runs)
    );
  }

  protected isHeadingContent(value: unknown): value is { level?: number; text: SemanticText } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'text' in value &&
      this.isSemanticText((value as { text: unknown }).text)
    );
  }

  protected isListContent(
    value: unknown
  ): value is { ordered?: boolean; items: (SemanticText | string)[] } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'items' in value &&
      Array.isArray((value as { items: unknown }).items)
    );
  }

  protected isBlockquoteContent(
    value: unknown
  ): value is { text: SemanticText; citation?: SemanticText } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'text' in value &&
      this.isSemanticText((value as { text: unknown }).text)
    );
  }

  protected isCodeBlockContent(value: unknown): value is { language?: string; code: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'code' in value &&
      typeof (value as { code: unknown }).code === 'string'
    );
  }

  protected isMathBlockContent(value: unknown): value is { math: string; format?: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'math' in value &&
      typeof (value as { math: unknown }).math === 'string'
    );
  }

  protected isTableContent(
    value: unknown
  ): value is { caption?: SemanticText; headers?: SemanticText[]; rows: SemanticText[][] } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'rows' in value &&
      Array.isArray((value as { rows: unknown }).rows)
    );
  }

  protected isFigureContent(
    value: unknown
  ): value is { src: string; alt?: string; caption?: SemanticText } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'src' in value &&
      typeof (value as { src: unknown }).src === 'string'
    );
  }
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
