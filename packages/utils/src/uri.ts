/**
 * URI utilities for xats vocabulary management
 */

const XATS_BASE_URI = 'https://xats.org';

/**
 * Check if a string is a valid URI
 */
export function isValidUri(uri: string): boolean {
  try {
    new URL(uri);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a URI belongs to the xats core vocabulary
 */
export function isXatsCoreUri(uri: string): boolean {
  return uri.startsWith(`${XATS_BASE_URI}/core/`);
}

/**
 * Check if a URI is an extension vocabulary
 */
export function isExtensionUri(uri: string): boolean {
  return uri.startsWith(`${XATS_BASE_URI}/extensions/`);
}

/**
 * Extract the namespace from a URI
 */
export function extractNamespace(uri: string): string | null {
  if (!isValidUri(uri)) return null;
  
  try {
    const url = new URL(uri);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    if (pathParts.length >= 2) {
      return `${url.origin}/${pathParts[0]}`;
    }
    
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Extract the vocabulary type from a xats URI
 */
export function extractVocabularyType(uri: string): string | null {
  if (!uri.startsWith(XATS_BASE_URI)) return null;
  
  const match = uri.match(/^https:\/\/xats\.org\/(\w+)\//);
  return match ? (match[1] ?? null) : null;
}

/**
 * Build a xats core URI
 */
export function buildCoreUri(category: string, name: string): string {
  return `${XATS_BASE_URI}/core/${category}/${name}`;
}

/**
 * Build a xats extension URI
 */
export function buildExtensionUri(
  publisher: string,
  extension: string,
  category: string,
  name: string
): string {
  return `${XATS_BASE_URI}/extensions/${publisher}/${extension}/${category}/${name}`;
}

/**
 * Parse a URI into its components
 */
export interface ParsedUri {
  namespace: string;
  vocabulary: string | null;
  category: string | null;
  name: string | null;
  isCore: boolean;
  isExtension: boolean;
}

export function parseXatsUri(uri: string): ParsedUri | null {
  if (!isValidUri(uri)) return null;
  
  const isCore = isXatsCoreUri(uri);
  const isExtension = isExtensionUri(uri);
  
  if (!isCore && !isExtension) {
    return {
      namespace: extractNamespace(uri) || uri,
      vocabulary: null,
      category: null,
      name: null,
      isCore: false,
      isExtension: false,
    };
  }
  
  try {
    const url = new URL(uri);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    if (isCore && pathParts.length >= 3) {
      return {
        namespace: XATS_BASE_URI,
        vocabulary: 'core',
        category: pathParts[1] ?? null,
        name: pathParts[2] ?? null,
        isCore: true,
        isExtension: false,
      };
    }
    
    if (isExtension && pathParts.length >= 5) {
      return {
        namespace: XATS_BASE_URI,
        vocabulary: `${pathParts[1]}/${pathParts[2]}`,
        category: pathParts[3] ?? null,
        name: pathParts[4] ?? null,
        isCore: false,
        isExtension: true,
      };
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Normalize a URI (remove trailing slashes, lowercase scheme)
 */
export function normalizeUri(uri: string): string {
  if (!isValidUri(uri)) return uri;
  
  try {
    const url = new URL(uri);
    url.protocol = url.protocol.toLowerCase();
    url.hostname = url.hostname.toLowerCase();
    
    // Remove trailing slash from pathname unless it's root
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    
    return url.toString();
  } catch {
    return uri;
  }
}