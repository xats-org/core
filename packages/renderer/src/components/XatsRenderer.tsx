// eslint-disable-next-line import/no-named-as-default
import DOMPurify from 'dompurify';
import * as React from 'react';

import { render, type OutputFormat, type RenderOptions } from '../index.js';

import type { XatsDocument } from '@xats-org/types';

export interface XatsRendererProps {
  /** The xats document to render */
  document: XatsDocument;
  /** The output format */
  format?: OutputFormat;
  /** Renderer options */
  options?: RenderOptions;
  /** Additional CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * React component for rendering xats documents
 */
export const XatsRenderer: React.FC<XatsRendererProps> = ({
  document,
  format = 'html',
  options = {},
  className = '',
  style = {},
}) => {
  const renderedContent = React.useMemo(() => {
    try {
      return render(document, format, options);
    } catch (error) {
      console.error('Error rendering xats document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      // Sanitize error message to prevent XSS
      const safeError = DOMPurify.sanitize(errorMessage, { ALLOWED_TAGS: [] });
      return `<div class="error">Error rendering document: ${safeError}</div>`;
    }
  }, [document, format, options]);

  if (format === 'html') {
    // Sanitize HTML content before rendering to prevent XSS attacks
    const sanitizedContent = React.useMemo(
      () =>
        DOMPurify.sanitize(renderedContent, {
          ALLOWED_TAGS: [
            'p',
            'div',
            'span',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'ul',
            'ol',
            'li',
            'a',
            'strong',
            'em',
            'code',
            'pre',
            'blockquote',
            'table',
            'thead',
            'tbody',
            'tr',
            'th',
            'td',
            'img',
            'figure',
            'figcaption',
            'br',
            'hr',
            'section',
            'article',
            'nav',
            'aside',
            'header',
            'footer',
            'main',
            'mark',
            'cite',
            'abbr',
            'sup',
            'sub',
            'math',
            'annotation',
            'semantics',
            'mrow',
            'mi',
            'mo',
            'mn',
            'msup',
            'msub',
            'mfrac',
            'mroot',
            'msqrt',
            'mtext',
            'menclose',
            'mtable',
            'mtr',
            'mtd',
          ],
          ALLOWED_ATTR: [
            'href',
            'src',
            'alt',
            'title',
            'class',
            'id',
            'style',
            'target',
            'rel',
            'width',
            'height',
            'colspan',
            'rowspan',
            'data-*',
            'aria-*',
            'role',
            'tabindex',
            'lang',
            'dir',
            'cite',
            'datetime',
            'for',
            'name',
            'type',
            'value',
          ],
          ALLOW_DATA_ATTR: true,
          ALLOW_ARIA_ATTR: true,
          KEEP_CONTENT: true,
          ADD_TAGS: ['math', 'annotation', 'semantics'], // MathML support
          ADD_ATTR: ['xmlns'], // For MathML namespace
        }),
      [renderedContent]
    );

    return (
      <div
        className={`xats-renderer xats-renderer--html ${className}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  }

  return (
    <div
      className={`xats-renderer xats-renderer--${format} ${className}`}
      style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', ...style }}
    >
      {renderedContent}
    </div>
  );
};

export default XatsRenderer;
