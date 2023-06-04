const MonacoWebpackPlugin = require("monaco-editor-webpack-plugin");
const CracoLessPlugin = require("craco-less");
const { getThemeVariables } = require("antd/dist/theme");
const { theme } = require("./src/lib/design-system/theme");
const webpack = require("webpack");

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
          util: require.resolve("util"),
          path: false,
          fs: false,
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
      new MonacoWebpackPlugin(),
    ],
  },
};
