module.exports = {
  ignorePatterns: [
    "node_modules",
    "app/build/*",
    "app/public/**",
    "browser-extension/*",
  ],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended", "prettier"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["prettier"],
  rules: {
    "no-unused-vars": "off",
  },
};
