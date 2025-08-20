import type { XatsObject } from '@xats/types';

/**
 * Deep clone a JSON-serializable object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item: unknown) => deepClone(item)) as unknown as T;
  }

  if (obj instanceof Object) {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * Deep merge two objects, with source overwriting target
 */
export function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        result[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * Check if a value is a valid XatsObject (has an id)
 */
export function isXatsObject(value: unknown): value is XatsObject {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as { id?: unknown }).id === 'string'
  );
}

/**
 * Extract all XatsObjects from a document tree
 */
export function extractXatsObjects(obj: unknown): XatsObject[] {
  const objects: XatsObject[] = [];

  function traverse(node: unknown): void {
    if (!node || typeof node !== 'object') return;

    if (isXatsObject(node)) {
      objects.push(node);
    }

    if (Array.isArray(node)) {
      node.forEach(traverse);
    } else {
      Object.values(node as Record<string, unknown>).forEach(traverse);
    }
  }

  traverse(obj);
  return objects;
}

/**
 * Find a XatsObject by ID in a document tree
 */
export function findXatsObjectById(obj: unknown, id: string): XatsObject | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  if (isXatsObject(obj) && obj.id === id) {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const found = findXatsObjectById(item, id);
      if (found) return found;
    }
  } else {
    for (const value of Object.values(obj as Record<string, unknown>)) {
      const found = findXatsObjectById(value, id);
      if (found) return found;
    }
  }

  return undefined;
}

/**
 * Remove undefined values from an object
 */
export function removeUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T;

  for (const key in obj) {
    if (obj[key] !== undefined) {
      if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
        result[key] = removeUndefined(obj[key] as Record<string, unknown>) as T[Extract<
          keyof T,
          string
        >];
      } else {
        result[key] = obj[key];
      }
    }
  }

  return result;
}
