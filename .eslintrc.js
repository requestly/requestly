module.exports = {
  globals: {
    NodeJS: true,
    Chai: true,
  },
  ignorePatterns: [
    "node_modules",
    "app/build/*",
    "app/public/**",
    "browser-extension/*",
    "app/src/views/features/apis/curl-to-json.js",
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
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^_",
      },
    ],
    "no-dupe-class-members": "off",
  },
};
