const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const CracoLessPlugin = require("craco-less");
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const { getThemeVariables } = require("antd/dist/theme");
const { theme } = require("./src/lib/design-system/theme");
const webpack = require("webpack");

const { when } = require("@craco/craco");

module.exports = {
  plugins: [
    {
      plugin: CracoLessPlugin,
      options: {
        lessLoaderOptions: {
          lessOptions: {
            modifyVars: { ...getThemeVariables({ dark: true }), ...theme },
            javascriptEnabled: true,
          },
          // strictMath: true,
          // noIeCompat: true,
          // relativeUrls: false,
        },
        modifyLessRule: (lessRule, context) => {
          lessRule.use = lessRule.use.filter((i) => !i.loader.includes("resolve-url-loader"));
          return lessRule;
        },
      },
    },
  ],
  webpack: {
    configure: {
      resolve: {
        extensions: [".d.ts", ".ts", ".tsx", ".js", ".jsx"],
        fallback: {
          buffer: require.resolve("buffer/"),
          timers: require.resolve("timers-browserify"),
          stream: require.resolve("stream-browserify"),
          "process/browser": require.resolve("process/browser"),
        },
      },
      externals: "worker_threads", // a transitive dependency in @requestly/web-sdk depends on worker_threads in Node environment
      stats: {
        errorDetails: true,
      },
      module: {
        rules: [
          {
            test: /\.tsx?$/,
            exclude: /node_modules/,
            use: ["ts-loader"],
          },
          {
            test: [/\.jsx?$/, /\.tsx?$/],
            enforce: "pre",
            exclude: /node_modules/,
            use: ["source-map-loader"],
          },
        ],
      },
      output: {
        chunkFilename: "[contenthash].js",
      },
      devtool: "source-map",
    },

    plugins: [
      // fix "process is not defined" error:
      // (do "npm install process" before running the build)
      new webpack.ProvidePlugin({
        process: "process/browser",
      }),
      ...when(
        (process.env.GITHUB_ACTIONS === "true" || process.env.CI === "true") && process.env.NODE_ENV === "production",
        () => [
          new SentryWebpackPlugin({
            org: "requestly",
            project: "web-app",

            // Specify the directory containing build artifacts
            include: "./build",

            // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
            // and needs the `project:releases` and `org:read` scopes
            authToken: process.env.SENTRY_AUTH_TOKEN,

            // Optionally uncomment the line below to override automatic release name detection
            release: process.env.GITHUB_SHA,
          }),
        ],
        []
      ),
      new MonacoWebpackPlugin(),
    ],
  },
};
