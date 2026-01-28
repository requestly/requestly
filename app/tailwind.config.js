const globalConfigs = require('@browserstack/tailwind-config');
const scopedPreflightPlugin = require('./src/features/apiClientV2/utils/scopedPreflightPlugin');

const contentPaths = [
  './index.html',
  `${__dirname}/src/**/*.{js,jsx,ts,tsx}`,
  `${__dirname}/node_modules/@browserstack/design-stack/dist/**/*.{js,jsx,mjs}`,
  `${__dirname}/node_modules/@browserstack/design-stack-icons/dist/**/*.{js,jsx,mjs}`
];

module.exports = {
  ...globalConfigs.globalTailwindConfig,
  content: contentPaths,
  corePlugins: {
    ...globalConfigs.globalTailwindConfig.corePlugins,
    // Disable default preflight - using scoped version instead
    preflight: false
  },
  // Use important with a selector to scope Tailwind utilities to BrowserStack DS components
  important: '.bs-ds-scope',
  plugins: [
    // Add scoped preflight plugin FIRST to ensure proper layer ordering
    scopedPreflightPlugin,
    ...globalConfigs.globalTailwindConfig.plugins
  ]
};
