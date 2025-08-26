/** @type {import('@ladle/react').UserConfig} */
export default {
  // Stories configuration
  stories: "packages/*/src/**/*.stories.{js,jsx,ts,tsx}",
  
  // Build configuration
  outDir: "ladle-build",
  base: process.env.NODE_ENV === 'production' && process.env.DEPLOY_TARGET === 'pub-site' ? '/ladle/' : '/',
};