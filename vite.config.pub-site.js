import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'docs',
  base: '/docs/',
  build: {
    outDir: '../pub-site/docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'docs/index.md'),
        architecture: resolve(__dirname, 'docs/ARCHITECTURE.md'),
        roadmap: resolve(__dirname, 'docs/ROADMAP.md'),
        // Add more entry points as needed
      },
    },
  },
  plugins: [
    // Custom plugin to convert markdown to HTML
    {
      name: 'markdown-to-html',
      transformIndexHtml: {
        enforce: 'pre',
        transform(html, context) {
          // Simple markdown processing logic would go here
          // For production, consider using a proper markdown processor
          return html;
        },
      },
    },
  ],
});