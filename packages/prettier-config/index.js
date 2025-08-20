module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'es5',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  embeddedLanguageFormatting: 'auto',
  singleAttributePerLine: false,
  overrides: [
    {
      files: '*.md',
      options: {
        proseWrap: 'always'
      }
    },
    {
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 80
      }
    },
    {
      files: '*.yml',
      options: {
        singleQuote: false
      }
    }
  ]
};