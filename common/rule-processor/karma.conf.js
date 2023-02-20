const path = require("path");

module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: ["tests/**.js", "tests/**/*.spec.js"],
    preprocessors: {
      "tests/**.js": ["webpack"],
      "tests/**/*.spec.js": ["webpack"],
      "src/**/*.ts": ["webpack"],
    },
    webpack: {
      entry: "./src/index.ts",
      devtool: "inline-source-map",
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            use: "ts-loader",
            exclude: /node_modules/,
          },
        ],
      },
      resolve: {
        extensions: [".tsx", ".ts", ".js"],
      },
      output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist"),
      },
      stats: {
        colors: true,
        modules: true,
        reasons: true,
        errorDetails: true,
      },
    },
    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["ChromeHeadlessNoSandbox"],

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: "ChromeHeadless",
        flags: ["--no-sandbox"],
      },
    },
    singleRun: true,
    concurrency: Infinity,
  });
};
