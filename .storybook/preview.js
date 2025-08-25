import React from 'react';

/** @type { import('@storybook/react').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    a11y: {
      // Accessibility configuration
      element: '#storybook-root',
      config: {},
      options: {
        checks: { 'color-contrast': { enabled: true } },
        restoreScroll: true,
      },
      manual: false,
    },
  },
  decorators: [
    (Story) => React.createElement('div', { style: { padding: '1rem' } }, React.createElement(Story)),
  ],
};

export default preview;