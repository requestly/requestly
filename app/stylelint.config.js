module.exports = {
  // plugins: ['stylelint-scss', variableLintRules],
  plugins: ['stylelint-scss'],
  extends: ['stylelint-config-standard-scss', 'stylelint-prettier/recommended'],
  rules: {
    // 'browserstack/consistent-css-variables': [
    //   ['color', 'font-size'],
    //   {
    //     ignoreValues: ['transparent', 'inherit', 'initial'],
    //     mappedFiles: {},
    //   },
    // ],
    'declaration-block-no-duplicate-properties': true,
    'string-quotes': 'single',
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: ['tailwind', 'apply', 'variants', 'responsive', 'screen']
      }
    ],
    'declaration-block-trailing-semicolon': 'always',
    'no-descending-specificity': null,
    'scss/at-rule-no-unknown': true,
    'selector-pseudo-element-colon-notation': 'single',
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['export']
      }
    ],
    'property-no-unknown': [
      true,
      {
        ignoreSelectors: [':export']
      }
    ]
  }
};
