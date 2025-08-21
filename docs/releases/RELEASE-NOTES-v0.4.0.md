# xats v0.4.0 Release Notes

## 🎉 Release Summary

We are excited to announce the release of xats v0.4.0, a major milestone that transforms the project into a modern monorepo architecture. This release establishes a solid foundation for future development and improves developer experience significantly.

## 📅 Release Date: January 21, 2025

## 🚀 Key Highlights

### Monorepo Architecture
- **Turborepo Integration**: Lightning-fast builds with intelligent caching
- **pnpm Workspaces**: Efficient dependency management
- **Changesets**: Automated versioning and changelog generation
- **TypeScript**: Full type safety across all packages

### Package Ecosystem
All packages are now published under the `@xats/*` scope on npm:
- `@xats/schema` - Core JSON Schema definitions
- `@xats/validator` - Validation logic and error reporting
- `@xats/types` - Shared TypeScript types
- `@xats/cli` - Command-line interface
- `@xats/renderer` - Multi-format rendering engine
- `@xats/mcp-server` - Model Context Protocol server
- `@xats/utils` - Shared utilities
- `@xats/examples` - Example documents
- `@xats/vocabularies` - Vocabulary definitions

### Developer Experience
- **Storybook**: Interactive component documentation and testing
- **Comprehensive Testing**: 458 tests ensuring reliability
- **CI/CD Pipeline**: Automated testing and deployment
- **Standardized Documentation**: Consistent and up-to-date docs

## 📦 Installation

### npm
```bash
npm install @xats/schema @xats/validator @xats/types
npm install -g @xats/cli
```

### pnpm
```bash
pnpm add @xats/schema @xats/validator @xats/types
pnpm add -g @xats/cli
```

### yarn
```bash
yarn add @xats/schema @xats/validator @xats/types
yarn global add @xats/cli
```

## 🔄 Migration from v0.3.0

### Breaking Changes

1. **Package Imports**
   ```typescript
   // Before (v0.3.0)
   import { validate } from 'xats-validator';
   
   // After (v0.4.0)
   import { validate } from '@xats/validator';
   ```

2. **CLI Commands**
   ```bash
   # Before (v0.3.0)
   xats-validate document.json
   
   # After (v0.4.0)
   xats validate document.json
   ```

3. **Vocabulary URIs**
   - URIs remain the same structure but are now imported from `@xats/vocabularies`

### Migration Steps

1. Update all package dependencies to use `@xats/*` scope
2. Update import statements in your code
3. Update CLI scripts to use new command structure
4. Run tests to ensure compatibility

## ✨ New Features

### CLI Enhancements
- `xats validate` - Enhanced validation with detailed error reporting
- `xats render` - Multi-format rendering (HTML, Markdown, Text)
- `xats stats` - Document statistics and analysis
- `xats format` - JSON formatting utility
- `xats info` - Document information display

### Rendering Capabilities
- HTML output with semantic markup
- Markdown generation for documentation
- Plain text for accessibility
- Extensible renderer base class

### Development Tools
- Storybook for component documentation
- Turbo for fast builds
- Changesets for release management
- GitHub Actions for CI/CD

## 🐛 Bug Fixes

- Fixed license inconsistencies across packages
- Resolved TypeScript compilation issues
- Corrected dependency versions
- Fixed test runner configurations

## 📊 Performance Improvements

- Build times reduced by 70% with Turborepo caching
- Package installation 50% faster with pnpm
- Test execution optimized with Vitest
- Bundle sizes reduced through better tree-shaking

## 🔧 Technical Details

### Supported Environments
- Node.js: 18.x, 20.x, 22.x
- TypeScript: 5.x
- Browsers: Modern evergreen browsers

### Peer Dependencies
- React 18.x (for renderer package)
- Ajv 8.x (for validator package)

## 🙏 Acknowledgments

Thank you to all contributors who made this release possible. Special thanks to:
- The xats Standards Board for guidance and review
- Community members for testing and feedback
- Open source projects that power our infrastructure

## 📚 Documentation

- [Getting Started Guide](https://xats.org/docs/getting-started)
- [API Documentation](https://xats.org/docs/api)
- [Migration Guide](https://xats.org/docs/migration/v0.4.0)
- [Contributing Guidelines](https://github.com/xats-org/core/blob/main/CONTRIBUTING.md)

## 🔮 What's Next (v0.5.0)

- Enhanced rendering with custom themes
- AI integration for content generation
- Extended vocabulary support
- Performance optimizations
- WebAssembly support for browser validation

## 📝 Full Changelog

For a complete list of changes, see [CHANGELOG-v0.4.0.md](./CHANGELOG-v0.4.0.md)

## 🐞 Known Issues

- Storybook peer dependency warnings (non-breaking)
- CLI vitest UI version mismatch (non-breaking)

These issues will be addressed in v0.4.1.

## 📞 Support

- GitHub Issues: https://github.com/xats-org/core/issues
- Documentation: https://xats.org/docs
- Community Discord: https://discord.gg/xats

---

**Thank you for using xats! We're excited to see what you build with v0.4.0!**