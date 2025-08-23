import { RMarkdownRenderer } from './dist/index.js';
import { createSemanticText, buildCoreUri } from '@xats-org/utils';

const renderer = new RMarkdownRenderer();

const sampleDocument = {
  schemaVersion: '0.3.0',
  bibliographicEntry: {
    type: 'article-journal',
    title: 'Statistical Analysis with R',
    author: [
      { given: 'Jane', family: 'Smith' },
      { given: 'John', family: 'Doe' },
    ],
    issued: { 'date-parts': [[2024, 1, 15]] },
  },
  subject: buildCoreUri('subjects', 'statistics'),
  bodyMatter: {
    contents: [
      {
        id: 'introduction',
        title: createSemanticText('Introduction'),
        contents: [
          {
            id: 'intro-para',
            blockType: buildCoreUri('blocks', 'paragraph'),
            content: createSemanticText(
              'This document demonstrates statistical analysis using R.'
            ),
          },
          {
            id: 'r-setup',
            blockType: buildCoreUri('blocks', 'codeBlock'),
            content: {
              code: 'library(dplyr)\nlibrary(ggplot2)\n\n# Load data\ndata <- mtcars',
              language: 'r',
              executable: true,
              label: 'setup',
              options: {
                message: false,
                warning: false,
              },
            },
          },
        ],
      },
    ],
  },
};

async function test() {
  try {
    // Debug YAML serialization
    const title = 'Statistical Analysis with R';
    console.log('=== YAML DEBUG ===');
    console.log('Title:', JSON.stringify(title));
    console.log('Contains spaces:', title.includes(' '));
    console.log('Trim check:', title.trim() !== title);
    
    const result = await renderer.render(sampleDocument);
    console.log('\n=== RENDER RESULT ===');
    console.log(result.content.split('\n').slice(0, 10).join('\n'));
  } catch (error) {
    console.error('Error:', error);
  }
}

test();