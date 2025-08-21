import * as React from 'react';
import { render, type OutputFormat, type RenderOptions } from '../index.js';
import type { XatsDocument } from '@xats/types';

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
      return `<div class="error">Error rendering document: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
    }
  }, [document, format, options]);

  if (format === 'html') {
    return (
      <div
        className={`xats-renderer xats-renderer--html ${className}`}
        style={style}
        dangerouslySetInnerHTML={{ __html: renderedContent }}
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