import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'xats Documentation',
  description: 'Comprehensive documentation for the Extensible Academic Textbook Schema',
  
  // Base URL for deployment
  base: '/docs/',
  
  // Clean URLs
  cleanUrls: true,
  
  // Last updated timestamp
  lastUpdated: true,
  
  // Theme configuration
  themeConfig: {
    // Site logo
    logo: '/logo.svg',
    
    // Navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quick Start', link: '/getting-started/quickstart' },
      { 
        text: 'Guides', 
        items: [
          { text: 'Authoring Guide', link: '/guides/authoring' },
          { text: 'Migration Guide', link: '/guides/migration' },
          { text: 'Accessibility Guide', link: '/guides/accessibility' },
          { text: 'Integration Guide', link: '/guides/integration' }
        ]
      },
      { 
        text: 'Packages', 
        items: [
          { text: '@xats/schema', link: '/packages/schema/' },
          { text: '@xats/validator', link: '/packages/validator/' },
          { text: '@xats/types', link: '/packages/types/' },
          { text: '@xats/cli', link: '/packages/cli/' },
          { text: '@xats/renderer', link: '/packages/renderer/' },
          { text: 'All Packages', link: '/packages/' }
        ]
      },
      { 
        text: 'Reference', 
        items: [
          { text: 'Schema Reference', link: '/reference/schema/' },
          { text: 'API Reference', link: '/reference/api/' },
          { text: 'Vocabularies', link: '/reference/vocabularies' }
        ]
      },
      { 
        text: 'v0.4.0', 
        items: [
          { text: 'Changelog', link: '/releases/changelog' },
          { text: 'Migration Guide', link: '/guides/migration' },
          { text: 'Roadmap', link: '/project/roadmap' }
        ]
      }
    ],
    
    // Sidebar configuration
    sidebar: {
      '/getting-started/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Quick Start', link: '/getting-started/quickstart' },
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Your First Document', link: '/getting-started/first-document' },
            { text: 'Core Concepts', link: '/getting-started/concepts' }
          ]
        }
      ],
      
      '/guides/': [
        {
          text: 'User Guides',
          items: [
            { text: 'Authoring Guide', link: '/guides/authoring' },
            { text: 'Migration Guide', link: '/guides/migration' },
            { text: 'Accessibility Guide', link: '/guides/accessibility' },
            { text: 'Extension Guide', link: '/guides/extensions' },
            { text: 'Renderer Guide', link: '/guides/renderer' },
            { text: 'File Modularity', link: '/guides/file-modularity' }
          ]
        },
        {
          text: 'Integration',
          items: [
            { text: 'LTI 1.3 Integration', link: '/guides/integration/lti' },
            { text: 'LMS Integration', link: '/guides/integration/lms' },
            { text: 'AI Tools Integration', link: '/guides/integration/ai' }
          ]
        }
      ],
      
      '/packages/': [
        {
          text: 'Core Packages',
          items: [
            { text: 'Overview', link: '/packages/' },
            { text: '@xats/schema', link: '/packages/schema/' },
            { text: '@xats/validator', link: '/packages/validator/' },
            { text: '@xats/types', link: '/packages/types/' }
          ]
        },
        {
          text: 'Tools',
          items: [
            { text: '@xats/cli', link: '/packages/cli/' },
            { text: '@xats/renderer', link: '/packages/renderer/' },
            { text: '@xats/mcp-server', link: '/packages/mcp-server/' }
          ]
        },
        {
          text: 'Utilities',
          items: [
            { text: '@xats/utils', link: '/packages/utils/' },
            { text: '@xats/examples', link: '/packages/examples/' },
            { text: '@xats/vocabularies', link: '/packages/vocabularies/' }
          ]
        }
      ],
      
      '/reference/': [
        {
          text: 'Schema Reference',
          items: [
            { text: 'Overview', link: '/reference/schema/' },
            { text: 'Core Objects', link: '/reference/schema/core' },
            { text: 'Content Blocks', link: '/reference/schema/blocks' },
            { text: 'Assessments', link: '/reference/schema/assessments' },
            { text: 'Pathways', link: '/reference/schema/pathways' }
          ]
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Validation API', link: '/reference/api/validation' },
            { text: 'Rendering API', link: '/reference/api/rendering' },
            { text: 'CLI Commands', link: '/reference/api/cli' }
          ]
        },
        {
          text: 'Vocabularies',
          items: [
            { text: 'Core Vocabularies', link: '/reference/vocabularies' },
            { text: 'Block Types', link: '/reference/vocabularies/blocks' },
            { text: 'Assessment Types', link: '/reference/vocabularies/assessments' }
          ]
        }
      ],
      
      '/project/': [
        {
          text: 'Project Information',
          items: [
            { text: 'Architecture', link: '/project/architecture' },
            { text: 'Roadmap', link: '/project/roadmap' },
            { text: 'Contributing', link: '/project/contributing' },
            { text: 'Code of Conduct', link: '/project/code-of-conduct' }
          ]
        },
        {
          text: 'Releases',
          items: [
            { text: 'Changelog', link: '/releases/changelog' },
            { text: 'Release Notes', link: '/releases/' },
            { text: 'Version Policy', link: '/releases/versioning' }
          ]
        }
      ]
    },
    
    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/xats-org/core' }
    ],
    
    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present xats.org'
    },
    
    // Search
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: 'Search docs'
          }
        }
      }
    },
    
    // Edit link
    editLink: {
      pattern: 'https://github.com/xats-org/core/edit/main/apps/docs/:path',
      text: 'Edit this page on GitHub'
    },
    
    // Last updated text
    lastUpdatedText: 'Last updated',
    
    // Outline
    outline: {
      level: [2, 3],
      label: 'On this page'
    }
  },
  
  // Markdown configuration
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true,
    config: (md) => {
      // Add any custom markdown configurations here
    }
  },
  
  // Vite configuration
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  }
})