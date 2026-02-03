module.exports = {
  root: true,
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
    es2021: true,
  },
  extends: ["react-app", "plugin:react-hooks/recommended"],
  globals: {},
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    // Add global rules here that apply to both src and srcv2
    "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-debugger": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
