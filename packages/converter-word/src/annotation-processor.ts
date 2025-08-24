/**
 * @fileoverview Annotation and collaboration features processor
 */

import type {
  Annotation,
  TrackChange,
  Comment,
  AnnotationLocation,
  TrackChangesOptions,
  CommentsOptions,
} from './types';

/**
 * Processes annotations, track changes, and comments between Word and xats
 */
export class AnnotationProcessor {
  /**
   * Extract track changes from Word document
   */
  async extractTrackChanges(
    documentXml: string,
    options: TrackChangesOptions
  ): Promise<TrackChange[]> {
    const trackChanges: TrackChange[] = [];

    if (!options.preserve) {
      return trackChanges;
    }

    // Parse Word revision markup
    const insertRegex =
      /<w:ins[^>]*w:author="([^"]*)"[^>]*w:date="([^"]*)"[^>]*id="([^"]*)"[^>]*>(.*?)<\/w:ins>/gs;
    const deleteRegex =
      /<w:del[^>]*w:author="([^"]*)"[^>]*w:date="([^"]*)"[^>]*id="([^"]*)"[^>]*>(.*?)<\/w:del>/gs;

    // Extract insertions
    let match;
    while ((match = insertRegex.exec(documentXml)) !== null) {
      const [, author, dateStr, id, content] = match;

      trackChanges.push({
        id: `insert_${id}`,
        type: 'insert',
        author: (author && options.authorMappings?.[author]) || author || 'Unknown',
        timestamp: dateStr ? new Date(dateStr) : new Date(),
        content: this.cleanWordContent(content || ''),
        location: this.extractLocation(match.index || 0),
        status: 'pending',
      });
    }

    // Extract deletions
    while ((match = deleteRegex.exec(documentXml)) !== null) {
      const [, author, dateStr, id, content] = match;

      trackChanges.push({
        id: `delete_${id}`,
        type: 'delete',
        author: (author && options.authorMappings?.[author]) || author || 'Unknown',
        timestamp: dateStr ? new Date(dateStr) : new Date(),
        content: '',
        originalContent: this.cleanWordContent(content || ''),
        location: this.extractLocation(match.index || 0),
        status: 'pending',
      });
    }

    return trackChanges;
  }

  /**
   * Extract comments from Word document
   */
  async extractComments(
    commentsXml: string,
    documentXml: string,
    options: CommentsOptions
  ): Promise<Comment[]> {
    const comments: Comment[] = [];

    if (!options.preserve) {
      return comments;
    }

    // Parse comments.xml for comment definitions
    const commentRegex =
      /<w:comment[^>]*w:id="([^"]*)"[^>]*w:author="([^"]*)"[^>]*w:date="([^"]*)"[^>]*>(.*?)<\/w:comment>/gs;

    let match;
    while ((match = commentRegex.exec(commentsXml)) !== null) {
      const [, id, author, dateStr, content] = match;

      // Find comment references in document
      const commentRangeStart = new RegExp(`<w:commentRangeStart[^>]*w:id="${id}"[^>]*>`, 'g');
      const rangeMatch = commentRangeStart.exec(documentXml);

      comments.push({
        id: id || 'unknown',
        author: author || 'Unknown',
        timestamp: dateStr ? new Date(dateStr) : new Date(),
        content: this.cleanWordContent(content || ''),
        location: this.extractLocation(rangeMatch?.index || 0),
        status: 'open',
      });
    }

    // Process comment threading if enabled
    if (options.includeThreading) {
      this.processCommentThreads(comments);
    }

    return comments;
  }

  /**
   * Convert track changes to xats annotations
   */
  convertTrackChangesToAnnotations(trackChanges: TrackChange[]): Annotation[] {
    return trackChanges.map((change) => ({
      id: change.id,
      type: change.type === 'insert' ? 'suggestion' : 'suggestion',
      content:
        change.type === 'insert'
          ? `Suggested addition: ${change.content}`
          : `Suggested deletion: ${change.originalContent || ''}`,
      author: change.author,
      timestamp: change.timestamp,
      location: change.location,
      status: change.status === 'pending' ? 'open' : 'resolved',
      priority: 'medium',
    }));
  }

  /**
   * Convert comments to xats annotations
   */
  convertCommentsToAnnotations(comments: Comment[]): Annotation[] {
    return comments.map((comment) => ({
      id: comment.id,
      type: 'comment',
      content: comment.content,
      author: comment.author,
      timestamp: comment.timestamp,
      location: comment.location,
      status: comment.status,
      priority: 'medium',
    }));
  }

  /**
   * Generate Word track changes markup from annotations
   */
  generateTrackChangesMarkup(annotations: Annotation[]): string {
    const trackChanges = annotations.filter((a) => a.type === 'suggestion');
    let markup = '';

    for (const annotation of trackChanges) {
      const timestamp = annotation.timestamp.toISOString();
      const author = annotation.author;
      const content = annotation.content;

      if (content.startsWith('Suggested addition:')) {
        const addedText = content.replace('Suggested addition: ', '');
        markup += `<w:ins w:id="${annotation.id}" w:author="${author}" w:date="${timestamp}">`;
        markup += `<w:r><w:t>${this.escapeXml(addedText)}</w:t></w:r>`;
        markup += `</w:ins>`;
      } else if (content.startsWith('Suggested deletion:')) {
        const deletedText = content.replace('Suggested deletion: ', '');
        markup += `<w:del w:id="${annotation.id}" w:author="${author}" w:date="${timestamp}">`;
        markup += `<w:r><w:t>${this.escapeXml(deletedText)}</w:t></w:r>`;
        markup += `</w:del>`;
      }
    }

    return markup;
  }

  /**
   * Generate Word comments markup from annotations
   */
  generateCommentsMarkup(annotations: Annotation[]): {
    commentsXml: string;
    documentMarkup: string;
  } {
    const comments = annotations.filter((a) => a.type === 'comment');
    let commentsXml =
      '<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">';
    let documentMarkup = '';

    for (const annotation of comments) {
      const timestamp = annotation.timestamp.toISOString();

      // Add comment definition
      commentsXml += `<w:comment w:id="${annotation.id}" w:author="${annotation.author}" w:date="${timestamp}">`;
      commentsXml += `<w:p><w:r><w:t>${this.escapeXml(annotation.content)}</w:t></w:r></w:p>`;
      commentsXml += `</w:comment>`;

      // Add comment range markers
      documentMarkup += `<w:commentRangeStart w:id="${annotation.id}"/>`;
      documentMarkup += `<w:commentRangeEnd w:id="${annotation.id}"/>`;
      documentMarkup += `<w:r><w:commentReference w:id="${annotation.id}"/></w:r>`;
    }

    commentsXml += '</w:comments>';

    return { commentsXml, documentMarkup };
  }

  /**
   * Clean Word content from markup
   */
  private cleanWordContent(content: string): string {
    return content
      .replace(/<[^>]*>/g, '') // Remove XML tags
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Extract location information
   */
  private extractLocation(characterOffset: number): AnnotationLocation {
    return {
      characterOffset,
      selection: {
        start: characterOffset,
        end: characterOffset,
      },
    };
  }

  /**
   * Process comment threading
   */
  private processCommentThreads(comments: Comment[]): void {
    // Group comments by proximity and author patterns
    const threads = new Map<string, Comment[]>();

    for (const comment of comments) {
      // Simple threading logic - could be enhanced
      const threadKey = `${comment.author}_${Math.floor(comment.location.characterOffset! / 1000)}`;

      if (!threads.has(threadKey)) {
        threads.set(threadKey, []);
      }

      threads.get(threadKey)!.push(comment);
    }

    // Link threaded comments
    for (const threadComments of threads.values()) {
      if (threadComments.length > 1) {
        threadComments.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        for (let i = 1; i < threadComments.length; i++) {
          const firstComment = threadComments[0];
          if (firstComment) {
            if (!firstComment.thread) {
              firstComment.thread = [];
            }
            const comment = threadComments[i];
            if (comment) {
              firstComment.thread.push(comment);
            }
          }
        }
      }
    }
  }

  /**
   * Escape XML content
   */
  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
