# pub.xats.org Deployment Guide

This guide explains how the xats monorepo assets are deployed to pub.xats.org using GitHub Pages.

## Architecture Overview

The pub.xats.org site hosts multiple types of assets in a structured manner:

```
pub.xats.org/
├── /                     # Landing page with navigation
├── /storybook/          # Interactive component documentation
├── /schemas/            # JSON Schema files for all versions
├── /docs/              # Static documentation site
└── /examples/          # Example documents and validation cases
```

## URL Structure

### Component Library (Ladle)
- **URL**: `https://pub.xats.org/storybook/` (URL preserved for backward compatibility)
- **Purpose**: Interactive documentation for xats renderer components
- **Built from**: `.ladle/` configuration + `packages/*/src/**/*.stories.tsx`

### JSON Schemas
- **URL**: `https://pub.xats.org/schemas/`
- **Purpose**: Official schema definitions for validation
- **Built from**: `packages/schema/schemas/`
- **Versions Available**:
  - `https://pub.xats.org/schemas/latest/xats.json` (latest stable)
  - `https://pub.xats.org/schemas/0.5.0/xats.json` (current)
  - `https://pub.xats.org/schemas/0.3.0/xats.json`
  - `https://pub.xats.org/schemas/0.2.0/xats.json`
  - `https://pub.xats.org/schemas/0.1.0/xats.json`

### Documentation
- **URL**: `https://pub.xats.org/docs/`
- **Purpose**: Guides, API reference, and specifications
- **Built from**: `docs/` directory with markdown-to-HTML conversion

### Examples
- **URL**: `https://pub.xats.org/examples/`
- **Purpose**: Example documents for learning and testing
- **Built from**: `examples/` directory

## Build Process

### Local Development

1. **Build all assets locally**:
   ```bash
   # Full build matching production
   ./scripts/build-pub-site.sh
   
   # Or using npm scripts
   pnpm run build:pub-site
   ```

2. **Serve locally for testing**:
   ```bash
   # Using npm script (includes build)
   pnpm run serve:pub-site
   
   # Or manually after build
   npx http-server pub-site -p 8080
   ```

3. **Access locally**:
   - Main site: http://localhost:8080
   - Component Library: http://localhost:8080/storybook/
   - Schemas: http://localhost:8080/schemas/
   - Documentation: http://localhost:8080/docs/
   - Examples: http://localhost:8080/examples/

### Production Deployment

Deployment is automated via GitHub Actions when changes are pushed to the `main` branch:

1. **Trigger**: Push to `main` with changes to:
   - `packages/**`
   - `.ladle/**`
   - `docs/**`
   - `examples/**`
   - Build configuration files

2. **Process**:
   - Build all packages (`pnpm run build`)
   - Build Ladle with `DEPLOY_TARGET=pub-site`
   - Copy and organize all assets
   - Generate navigation pages
   - Deploy to GitHub Pages

3. **Workflow**: `.github/workflows/deploy-pub-site.yml`

## Configuration Details

### Component Library Configuration

The Ladle build is configured for the production deployment:

```javascript
// .ladle/config.mjs
export default {
  stories: 'packages/*/src/stories/*.stories.{ts,tsx}',
  outDir: 'ladle-build'
};
```

**Environment Variables**:
- `DEPLOY_TARGET=pub-site`: Configures base path for pub.xats.org
- `NODE_ENV=production`: Enables production optimizations

### URL Routing

**Base Paths by Component**:
- Component Library: `/storybook/` (Ladle build output)
- Schemas: `/schemas/` (static files)
- Documentation: `/docs/` (static files)
- Examples: `/examples/` (static files)

### Domain Configuration

The custom domain `pub.xats.org` is configured via:
1. `static/CNAME` file containing the domain name
2. GitHub repository settings pointing to GitHub Pages
3. DNS CNAME record pointing to `xats-org.github.io`

## Troubleshooting

### Component Library Path Issues

**Problem**: Ladle assets not loading correctly
**Solution**: Verify the build output is correctly copied to `/storybook/` directory

### Schema URL Access

**Problem**: Schema URLs returning 404
**Solution**: Ensure schemas are copied to the correct directory structure

### Build Failures

**Common Issues**:
1. **Missing dependencies**: Run `pnpm install` before building
2. **Build errors**: Check individual package builds with `pnpm run build`
3. **Ladle errors**: Test Ladle separately with `pnpm run ladle`

### Local vs Production Differences

**Base Path Issues**:
- Local: Use relative paths or no base path
- Production: Use absolute paths with base paths

**Asset Loading**:
- Verify that all asset references use the correct base paths
- Check browser developer tools for 404 errors

## Maintenance

### Adding New Schema Versions

1. Add the new schema to `packages/schema/schemas/VERSION/`
2. Update the schemas index page template in the build workflow
3. Test locally with `./scripts/build-pub-site.sh`

### Adding New Documentation

1. Add markdown files to `docs/`
2. Update the documentation index page if needed
3. The build process will automatically convert and include them

### Updating Component Library

1. Add new stories to `packages/*/src/**/*.stories.tsx`
2. The build process will automatically include them
3. Test with `pnpm run ladle` locally

### Adding New Examples

1. Add example files to `examples/`
2. Update the examples index page if needed
3. Organize by version for clarity

## Security Considerations

- All assets are public and served over HTTPS
- No server-side processing or user data collection
- Static files only - no authentication required
- Schema URLs are stable and can be cached long-term

## Performance Optimization

- **CDN**: GitHub Pages serves content via CDN
- **Caching**: Static assets have appropriate cache headers
- **Compression**: Assets are automatically compressed
- **Bundle Size**: Monitor Ladle bundle size in builds (typically smaller than Storybook)