import type { TestRunnerConfig } from '@storybook/test-runner';
import { checkA11y, injectAxe } from 'axe-playwright';

const config: TestRunnerConfig = {
  async preVisit(page) {
    // Inject Axe for accessibility testing
    await injectAxe(page);
  },
  async postVisit(page) {
    // Run accessibility checks
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
    
    // Take visual snapshots for regression testing
    await page.screenshot({ 
      path: `screenshots/${new Date().toISOString()}.png`,
      fullPage: true 
    });
  },
};

export default config;