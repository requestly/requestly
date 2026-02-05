module.exports = {
  root: false,
  extends: [
    "../.eslintrc.js",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:sonarjs/recommended",
    "plugin:tailwindcss/recommended",
    "prettier", // Must be last to override other configs
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint", "sonarjs", "simple-import-sort", "tailwindcss"],
  settings: {
    react: {
      version: "detect",
    },
    tailwindcss: {
      callees: ["cn", "clsx", "classnames"],
      config: "../tailwind.config.js",
      cssFiles: ["./styles.css"],
    },
  },
  rules: {
    // ============================================
    // Import Sorting (Auto-fixable)
    // ============================================
    "simple-import-sort/imports": [
      "error",
      {
        groups: [
          // React and external packages
          ["^react", "^@?\\w"],
          // Internal package imports
          ["^(@v2|@apiClientV2|@v2features)(/.*|$)"],
          // Side effect imports
          ["^\\u0000"],
          // Parent imports (../)
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
          // Relative imports (./)
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          // Style imports
          ["^.+\\.?(css|scss)$"],
        ],
      },
    ],
    "simple-import-sort/exports": "error",

    // ============================================
    // Tailwind CSS Best Practices (Utility Classes Only)
    // ============================================
    "tailwindcss/classnames-order": "error", // Auto-sort Tailwind classes
    "tailwindcss/enforces-negative-arbitrary-values": "error",
    "tailwindcss/enforces-shorthand": "error", // Prefer p-4 over px-4 py-4
    "tailwindcss/migration-from-tailwind-2": "off",
    "tailwindcss/no-arbitrary-value": "off", // Allow arbitrary values like w-[442px]
    "tailwindcss/no-custom-classname": "warn", // Warn on non-Tailwind classes
    "tailwindcss/no-contradicting-classname": "error", // Error on flex + block

    // ============================================
    // SonarJS - Code Quality & Bug Detection
    // ============================================
    // Note: Most rules enabled via 'plugin:sonarjs/recommended'
    // Override specific rules if needed:
    "sonarjs/cognitive-complexity": ["error", 15], // Max complexity
    "sonarjs/no-duplicate-string": ["warn", 3], // Threshold as number, not object
    "sonarjs/no-identical-functions": "error",

    // ============================================
    // TypeScript Best Practices
    // ============================================

    // Type Safety
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unsafe-assignment": "error",
    "@typescript-eslint/no-unsafe-member-access": "error",
    "@typescript-eslint/no-unsafe-return": "error",
    "@typescript-eslint/explicit-function-return-type": [
      "error",
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    // "@typescript-eslint/strict-boolean-expressions": [
    //   "error",
    //   {
    //     allowString: false,
    //     allowNumber: false,
    //     allowNullableObject: false,
    //     allowNullableBoolean: false,
    //   },
    // ],

    // Code Quality
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
        ignoreRestSiblings: true,
      },
    ],
    "@typescript-eslint/no-shadow": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/prefer-readonly": "error",
    "@typescript-eslint/prefer-reduce-type-parameter": "error",
    "@typescript-eslint/prefer-string-starts-ends-with": "error",
    "@typescript-eslint/prefer-includes": "error",
    "@typescript-eslint/prefer-for-of": "error",
    "@typescript-eslint/prefer-as-const": "error",

    // Naming Conventions
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "default",
        format: ["camelCase"],
        leadingUnderscore: "allow",
        trailingUnderscore: "allow",
      },
      {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE", "PascalCase"],
        leadingUnderscore: "allow",
        trailingUnderscore: "allow",
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
      },
      {
        selector: "enumMember",
        format: ["UPPER_CASE", "PascalCase"],
      },
      {
        selector: "interface",
        format: ["PascalCase"],
        custom: {
          regex: "^I[A-Z]",
          match: false,
        },
      },
    ],

    // Function Best Practices
    "@typescript-eslint/promise-function-async": "error",
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/no-confusing-void-expression": "error",
    "@typescript-eslint/no-invalid-void-type": "error",

    // Array & Object Best Practices
    "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
    "@typescript-eslint/consistent-type-definitions": ["error", "interface"],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        prefer: "type-imports",
        fixStyle: "separate-type-imports",
      },
    ],
    "@typescript-eslint/consistent-type-exports": [
      "error",
      {
        fixMixedExportsWithInlineTypeSpecifier: true,
      },
    ],

    // Class Best Practices
    "@typescript-eslint/explicit-member-accessibility": [
      "error",
      {
        accessibility: "explicit",
        overrides: {
          constructors: "no-public",
        },
      },
    ],
    "@typescript-eslint/member-ordering": "error",
    "@typescript-eslint/no-useless-constructor": "error",
    "@typescript-eslint/prefer-readonly-parameter-types": "off", // Too strict for React props

    // Disable base ESLint rules that are covered by TypeScript equivalents
    "no-unused-vars": "off",
    "no-shadow": "off",
    "no-use-before-define": "off",
    "no-useless-constructor": "off",
    "@typescript-eslint/no-use-before-define": ["error"],

    // React & TypeScript
    "react/prop-types": "off", // Not needed with TypeScript
    "react/require-default-props": "off", // Optional props handle defaults
    "import/no-restricted-paths": [
      "warn",
      {
        zones: [
          {
            target: "./**/*",
            from: "../src/**/*",
            message: "Importing from src/ into srcv2/ is forbidden. Use @v2 aliases for srcv2 imports.",
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // Disable TypeScript rules for config files
      files: [".eslintrc.js", "*.config.js"],
      parserOptions: {
        project: false,
      },
      rules: {
        "@typescript-eslint": "off",
      },
    },
    {
      // Relax strict type checking for test files and test utilities
      files: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/test-kit/**/*.{ts,tsx}"],
      rules: {
        "@typescript-eslint/no-unsafe-assignment": "off",
        "@typescript-eslint/no-unsafe-member-access": "off",
        "@typescript-eslint/no-unsafe-return": "off",
        "@typescript-eslint/no-unsafe-argument": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unnecessary-type-assertion": "off",
      },
    },
  ],
};
