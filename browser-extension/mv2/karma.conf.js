module.exports = function (config) {
  config.set({
    basePath: "",

    frameworks: ["jasmine"],

    plugins: ["karma-jasmine", "karma-chrome-launcher"],

    files: [
      "node_modules/babel-polyfill/dist/polyfill.js",

      /* Helper files */
      "tests/helpers/chromeApiHelper.js",
      "tests/helpers/utils.js",
      "tests/helpers/helper.js",

      /* Code files */
      "dist/generated/background/background-bundled.js",
      "src/client/js/scriptRuleHandler.js",
      "src/client/js/sessionRecorder.js",

      /* Mock Objects */
      "tests/helpers/mockObjects.js",
      "tests/helpers/mockClientUtils.js",

      /* Spec files */
      "tests/**/*.spec.js",
    ],

    exclude: [],

    preprocessors: {},

    reporters: ["progress"],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: false,

    browsers: ["ChromeHeadless"],

    singleRun: true,
  });
};
