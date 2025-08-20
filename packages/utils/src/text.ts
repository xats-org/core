import type { SemanticText, SemanticTextRun } from '@xats/types';

/**
 * Create a SemanticText object from a plain string
 */
export function createSemanticText(text: string): SemanticText {
  return {
    runs: [
      {
        type: 'text',
        text,
      },
    ],
  };
}

/**
 * Extract plain text from a SemanticText object
 */
export function extractPlainText(semanticText: SemanticText): string {
  return semanticText.runs
    .map(run => {
      switch (run.type) {
        case 'text':
        case 'emphasis':
        case 'strong':
        case 'code':
        case 'subscript':
        case 'superscript':
        case 'strikethrough':
        case 'underline':
          return run.text;
        case 'reference':
          return run.label || '';
        case 'citation':
          return '';
        case 'mathInline':
          return run.math;
        default:
          return '';
      }
    })
    .join('');
}

/**
 * Count words in a SemanticText object
 */
export function countWords(semanticText: SemanticText): number {
  const text = extractPlainText(semanticText);
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Check if a SemanticText object is empty
 */
export function isEmptySemanticText(semanticText: SemanticText): boolean {
  return (
    semanticText.runs.length === 0 ||
    semanticText.runs.every(run => {
      if ('text' in run) {
        return run.text.trim() === '';
      }
      if (run.type === 'reference' && run.label) {
        return run.label.trim() === '';
      }
      if (run.type === 'mathInline') {
        return run.math.trim() === '';
      }
      return run.type === 'citation';
    })
  );
}

/**
 * Merge consecutive text runs of the same type
 */
export function mergeConsecutiveRuns(semanticText: SemanticText): SemanticText {
  const mergedRuns: SemanticTextRun[] = [];
  
  for (const run of semanticText.runs) {
    const lastRun = mergedRuns[mergedRuns.length - 1];
    
    if (
      lastRun &&
      lastRun.type === run.type &&
      'text' in lastRun &&
      'text' in run &&
      lastRun.type !== 'reference' &&
      lastRun.type !== 'citation' &&
      lastRun.type !== 'mathInline'
    ) {
      // Merge consecutive text runs of the same type
      lastRun.text += run.text;
    } else {
      mergedRuns.push({ ...run });
    }
  }
  
  return { runs: mergedRuns };
}

/**
 * Split a SemanticText object by a delimiter
 */
export function splitSemanticText(
  semanticText: SemanticText,
  delimiter: string
): SemanticText[] {
  const results: SemanticText[] = [];
  let currentRuns: SemanticTextRun[] = [];
  
  for (const run of semanticText.runs) {
    if ('text' in run) {
      const parts = run.text.split(delimiter);
      
      for (let i = 0; i < parts.length; i++) {
        if (i > 0) {
          // Found delimiter, start new SemanticText
          results.push({ runs: currentRuns });
          currentRuns = [];
        }
        
        if (parts[i]) {
          currentRuns.push({
            ...run,
            text: parts[i],
          } as SemanticTextRun);
        }
      }
    } else {
      currentRuns.push(run);
    }
  }
  
  if (currentRuns.length > 0) {
    results.push({ runs: currentRuns });
  }
  
  return results;
}

/**
 * Truncate a SemanticText object to a maximum length
 */
export function truncateSemanticText(
  semanticText: SemanticText,
  maxLength: number,
  ellipsis: string = '...'
): SemanticText {
  let currentLength = 0;
  const truncatedRuns: SemanticTextRun[] = [];
  
  for (const run of semanticText.runs) {
    const runText = 'text' in run ? run.text : 
                    run.type === 'reference' ? (run.label || '') :
                    run.type === 'mathInline' ? run.math : '';
    
    if (currentLength + runText.length <= maxLength) {
      truncatedRuns.push(run);
      currentLength += runText.length;
    } else {
      const remainingLength = maxLength - currentLength;
      
      if (remainingLength > ellipsis.length && 'text' in run) {
        truncatedRuns.push({
          ...run,
          text: run.text.substring(0, remainingLength - ellipsis.length) + ellipsis,
        } as SemanticTextRun);
      }
      
      break;
    }
  }
  
  return { runs: truncatedRuns };
}

/**
 * Apply emphasis to plain text
 */
export function emphasize(text: string): SemanticText {
  return {
    runs: [
      {
        type: 'emphasis',
        text,
      },
    ],
  };
}

/**
 * Apply strong emphasis to plain text
 */
export function strong(text: string): SemanticText {
  return {
    runs: [
      {
        type: 'strong',
        text,
      },
    ],
  };
}

/**
 * Create inline code
 */
export function code(text: string): SemanticText {
  return {
    runs: [
      {
        type: 'code',
        text,
      },
    ],
  };
}

/**
 * Concatenate multiple SemanticText objects
 */
export function concatSemanticText(...texts: SemanticText[]): SemanticText {
  const allRuns: SemanticTextRun[] = [];
  
  for (const text of texts) {
    allRuns.push(...text.runs);
  }
  
  return mergeConsecutiveRuns({ runs: allRuns });
}