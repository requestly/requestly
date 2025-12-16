import { defineConfig, transformWithEsbuild, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import commonjs from "vite-plugin-commonjs";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { getThemeVariables } from "antd/dist/theme";
import { theme } from "./src/lib/design-system/theme";

// Either this with vite.config.mjs file or non top-level-import like below
// import { viteStaticCopy } from "vite-plugin-static-copy";

const config = async ({ mode }) => {
  // To Be used withing the vite.config.ts file
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  const { viteStaticCopy } = await import("vite-plugin-static-copy");

  const generateSourcemap = process.env.VITE_GENERATE_SOURCEMAP === "true";

  return defineConfig({
    define: {
      global: "globalThis",
      "process.env": {
        ...loadEnv(mode, process.cwd(), "VITE_"),
        NODE_ENV: process.env.NODE_ENV,
        GITHUB_SHA: process.env.GITHUB_SHA,
      },
    },
    plugins: [
      nodePolyfills(),

      // For files which has JSX elements in .js files
      {
        name: "treat-js-files-as-jsx",
        async transform(code, id) {
          if (!id.match(/src\/.*\.js$/)) return null; // include ts or tsx for TypeScript support
          // checks for .js files containing jsx code
          return transformWithEsbuild(code, id, {
            loader: "jsx",
            jsx: "automatic",
          });
        },
      },
      react(),

      // For setting home for relative imports to `src/`
      viteTsconfigPaths(),
      commonjs(),
      svgr(),
      // To support curlconverter
      viteStaticCopy({
        targets: [
          { src: "node_modules/web-tree-sitter/tree-sitter.wasm", dest: "." },
          { src: "node_modules/curlconverter/dist/tree-sitter-bash.wasm", dest: "." },
        ],
      }),
      generateSourcemap &&
        sentryVitePlugin({
          authToken: process.env.VITE_SENTRY_AUTH_TOKEN,
          org: "requestly",
          project: "web-app",
          sourcemaps: {
            filesToDeleteAfterUpload: ["**/*.js.map"],
          },
        }),
    ],
    resolve: {
      // { find: '@', replacement: path.resolve(__dirname, 'src') },
      // fix less import by: @import ~
      // https://github.com/vitejs/vite/issues/2185#issuecomment-784637827
      alias: [
        {
          find: /^~/,
          replacement: "",
        },
      ],
    },
    optimizeDeps: {
      force: true,
      esbuildOptions: {
        target: "esnext",
        loader: {
          ".js": "jsx",
        },
      },
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          additionalData: "@root-entry-name: default;",
          modifyVars: { ...getThemeVariables({ dark: true }), ...theme },
        },
        scss: {
          api: "modern",
        },
      },
    },
    build: {
      outDir: "build",
      target: "esnext",
      sourcemap: generateSourcemap,
    },
    server: {
      open: false,
      port: 3000,
      fs: {
        allow: [".."],
      },
    },
  });
};

export default config;
