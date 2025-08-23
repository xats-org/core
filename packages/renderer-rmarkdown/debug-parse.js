import { RMarkdownRenderer } from './dist/index.js';

const renderer = new RMarkdownRenderer();

const rmarkdownContent = `---
title: "Test Document"
author: "Test Author"
date: "2024-01-15"
output: html_document
---

# Introduction

This is a test document with R code.

\`\`\`{r setup, echo=TRUE, message=FALSE}
library(dplyr)
data <- mtcars
\`\`\`

The analysis shows interesting results.
`;

// Debug content processing manually
console.log('=== DEBUG CONTENT PROCESSING ===');
import { extractCodeChunks } from './dist/utils.js';
const chunks = extractCodeChunks(rmarkdownContent);
console.log('Extracted chunks:', chunks.length);
chunks.forEach((chunk, i) => {
  console.log(`Chunk ${i}:`, {
    start: chunk.start,
    end: chunk.end,
    header: chunk.header,
    code: chunk.code.substring(0, 50) + '...'
  });
});

// Test replacement manually
let testContent = rmarkdownContent;
console.log('\n=== CONTENT BEFORE REPLACEMENT ===');
console.log(testContent.substring(100, 200));

const placeholder = '__CHUNK_0__';
const firstChunk = chunks[0];
if (firstChunk) {
  testContent = testContent.substring(0, firstChunk.start) + 
                placeholder + 
                testContent.substring(firstChunk.end);
  console.log('\n=== CONTENT AFTER REPLACEMENT ===');
  console.log(testContent.substring(100, 200));
  console.log('Contains placeholder:', testContent.includes(placeholder));
}

async function test() {
  try {
    console.log('=== PARSING R MARKDOWN ===');
    const result = await renderer.parse(rmarkdownContent);
    
    console.log('\n=== PARSE RESULT ===');
    console.log('Title:', result.document.bibliographicEntry.title);
    console.log('Body contents length:', result.document.bodyMatter.contents.length);
    
    // Inspect first content item
    const firstContent = result.document.bodyMatter.contents[0];
    if (firstContent && 'contents' in firstContent) {
      console.log('First content type:', firstContent.constructor.name);
      console.log('First content contents:', firstContent.contents.length);
      
      // Deep inspect the content to see where placeholder might be
      firstContent.contents.forEach((item, i) => {
        console.log(`\nContent item ${i}:`, {
          id: item.id,
          blockType: 'blockType' in item ? item.blockType : 'no blockType',
        });
        
        if ('content' in item && item.content && typeof item.content === 'object') {
          if ('runs' in item.content && Array.isArray(item.content.runs)) {
            console.log('  Semantic text runs:', item.content.runs.map(run => ({
              type: run.runType || run.type,
              text: typeof run.text === 'string' ? run.text.substring(0, 50) + (run.text.length > 50 ? '...' : '') : run.text
            })));
          }
        }
      });
    }
    
    console.log('Metadata code chunks:', result.metadata?.codeChunks?.length);
    console.log('Errors:', result.errors);
    console.log('Warnings:', result.warnings);
  } catch (error) {
    console.error('Parse Error:', error);
  }
}

test();