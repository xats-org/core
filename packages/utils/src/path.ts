import type { 
  Unit, 
  Chapter, 
  Section, 
  ContentBlock,
  StructuralContainer,
  Pathway,
  PathwayCondition,
} from '@xats/types';

/**
 * Generate a path string for a structural element
 */
export function generatePath(
  ancestors: StructuralContainer[],
  current: StructuralContainer
): string {
  const parts = [...ancestors, current]
    .map(item => item.id)
    .filter(Boolean);
  
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
  
  let current: any = root;
  
  for (const part of parts) {
    if (Array.isArray(current)) {
      current = current.find(item => item.id === part);
    } else if (current?.contents) {
      current = current.contents.find((item: any) => item.id === part);
    } else {
      return undefined;
    }
    
    if (!current) return undefined;
  }
  
  return current;
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
  context: Record<string, any>
): boolean {
  switch (condition.type) {
    case 'assessment':
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
    
    case 'completion':
      return Boolean(context[condition.contentId]);
    
    case 'composite':
      if (condition.operator === 'and') {
        return condition.conditions.every(c => evaluateCondition(c, context));
      } else {
        return condition.conditions.some(c => evaluateCondition(c, context));
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
  context: Record<string, any>
): string | null {
  for (const pathway of pathways) {
    if (!pathway.condition || evaluateCondition(pathway.condition, context)) {
      return pathway.targetId;
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
  label?: string;
  path: string;
}

export function buildBreadcrumbs(
  root: Unit[] | Chapter[],
  targetPath: string
): Breadcrumb[] {
  const parts = parsePath(targetPath);
  const breadcrumbs: Breadcrumb[] = [];
  let currentPath = '';
  
  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}.${part}` : part;
    const element = findByPath(root, currentPath);
    
    if (element && 'title' in element) {
      breadcrumbs.push({
        id: element.id,
        title: element.title,
        label: 'label' in element ? element.label : undefined,
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
      blocks.push(...extractContentBlocks(item));
    }
  }
  
  return blocks;
}

/**
 * Count total content blocks in a structure
 */
export function countContentBlocks(
  container: StructuralContainer | ContentBlock
): number {
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
      const depth = getStructureDepth(item, currentDepth + 1);
      maxDepth = Math.max(maxDepth, depth);
    }
  }
  
  return maxDepth;
}