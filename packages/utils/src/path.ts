import type { Unit, Chapter, ContentBlock, StructuralContainer, Pathway } from '@xats/types';

/**
 * Pathway condition interface for evaluation
 */
export interface PathwayCondition {
  type: 'assessment' | 'completion' | 'composite';
  operator?:
    | 'and'
    | 'or'
    | 'greater_than'
    | 'less_than'
    | 'equal_to'
    | 'greater_than_or_equal'
    | 'less_than_or_equal';
  assessmentId?: string;
  contentId?: string;
  value?: number;
  conditions?: PathwayCondition[];
}

/**
 * Generate a path string for a structural element
 */
export function generatePath(
  ancestors: StructuralContainer[],
  current: StructuralContainer
): string {
  const parts = [...ancestors, current].map((item) => item.id).filter(Boolean);

  return parts.join('.');
}

/**
 * Parse a path string into component IDs
 */
export function parsePath(path: string): string[] {
  return path.split('.').filter(Boolean);
}

/**
 * Find an element by path in a document structure
 */
export function findByPath(
  root: Unit[] | Chapter[],
  path: string
): StructuralContainer | ContentBlock | undefined {
  const parts = parsePath(path);

  if (parts.length === 0) return undefined;

  let current: Unit[] | Chapter[] | StructuralContainer | ContentBlock | undefined = root;

  for (const part of parts) {
    if (Array.isArray(current)) {
      current = current.find((item) => item.id === part);
    } else if (current && 'contents' in current && current.contents) {
      current = (current.contents as Array<{ id: string }>).find((item) => item.id === part) as
        | StructuralContainer
        | ContentBlock
        | undefined;
    } else {
      return undefined;
    }

    if (!current) return undefined;
  }

  return current as StructuralContainer | ContentBlock | undefined;
}

/**
 * Get all pathways from a structural container
 */
export function extractPathways(container: StructuralContainer): Pathway[] {
  const pathways: Pathway[] = [];

  if (container.pathways) {
    pathways.push(...container.pathways);
  }

  if ('contents' in container && Array.isArray(container.contents)) {
    for (const item of container.contents) {
      if ('pathways' in item) {
        pathways.push(...extractPathways(item as StructuralContainer));
      }
    }
  }

  return pathways;
}

/**
 * Evaluate a pathway condition
 */
export function evaluateCondition(
  condition: PathwayCondition,
  context: Record<string, unknown>
): boolean {
  switch (condition.type) {
    case 'assessment': {
      if (!condition.assessmentId || condition.value === undefined) return false;
      const score = context[condition.assessmentId];
      if (typeof score !== 'number') return false;

      switch (condition.operator) {
        case 'greater_than':
          return score > condition.value;
        case 'less_than':
          return score < condition.value;
        case 'equal_to':
          return score === condition.value;
        case 'greater_than_or_equal':
          return score >= condition.value;
        case 'less_than_or_equal':
          return score <= condition.value;
        default:
          return false;
      }
    }

    case 'completion':
      if (!condition.contentId) return false;
      return Boolean(context[condition.contentId]);

    case 'composite':
      if (!condition.conditions) return false;
      if (condition.operator === 'and') {
        return condition.conditions.every((c) => evaluateCondition(c, context));
      } else {
        return condition.conditions.some((c) => evaluateCondition(c, context));
      }

    default:
      return false;
  }
}

/**
 * Get the next content based on pathway conditions
 */
export function getNextContent(
  pathways: Pathway[],
  context: Record<string, unknown>
): string | null {
  for (const pathway of pathways) {
    if (
      !pathway.condition ||
      (typeof pathway.condition === 'string'
        ? false
        : evaluateCondition(pathway.condition as PathwayCondition, context))
    ) {
      // Pathways don't have targetId in the current schema, use id instead
      return pathway.id;
    }
  }

  return null;
}

/**
 * Build a breadcrumb trail
 */
export interface Breadcrumb {
  id: string;
  title?: string;
  label?: string | undefined;
  path: string;
}

export function buildBreadcrumbs(root: Unit[] | Chapter[], targetPath: string): Breadcrumb[] {
  const parts = parsePath(targetPath);
  const breadcrumbs: Breadcrumb[] = [];
  let currentPath = '';

  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}.${part}` : part;
    const element = findByPath(root, currentPath);

    if (element && 'title' in element) {
      breadcrumbs.push({
        id: element.id || '',
        title: typeof element.title === 'string' ? element.title : JSON.stringify(element.title),
        label: 'label' in element && element.label ? element.label : undefined,
        path: currentPath,
      });
    }
  }

  return breadcrumbs;
}

/**
 * Get all content blocks from a structural container
 */
export function extractContentBlocks(
  container: StructuralContainer | ContentBlock
): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  if ('blockType' in container) {
    // It's a ContentBlock
    blocks.push(container);
  }

  if ('contents' in container && Array.isArray(container.contents)) {
    for (const item of container.contents) {
      blocks.push(...extractContentBlocks(item as StructuralContainer | ContentBlock));
    }
  }

  return blocks;
}

/**
 * Count total content blocks in a structure
 */
export function countContentBlocks(container: StructuralContainer | ContentBlock): number {
  return extractContentBlocks(container).length;
}

/**
 * Get depth of a structure
 */
export function getStructureDepth(
  container: StructuralContainer | ContentBlock,
  currentDepth: number = 0
): number {
  if ('blockType' in container) {
    return currentDepth;
  }

  let maxDepth = currentDepth;

  if ('contents' in container && Array.isArray(container.contents)) {
    for (const item of container.contents) {
      const depth = getStructureDepth(item as StructuralContainer | ContentBlock, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }

  return maxDepth;
}
