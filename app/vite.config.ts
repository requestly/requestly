import { defineConfig, transformWithEsbuild, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import commonjs from "vite-plugin-commonjs";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { getThemeVariables } from "antd/dist/theme";
import { theme } from "./src/lib/design-system/theme";
import monacoEditorPlugin from "vite-plugin-monaco-editor";
import path from "path";

const config = ({ mode }) =>
  defineConfig({
    define: {
      global: "window",
      "process.env": loadEnv(mode, process.cwd(), ""),
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
      monacoEditorPlugin({}),
      commonjs(),
      svgr(),
    ],
    resolve: {
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
      },
    },
    build: {
      outDir: "build",
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, "index.html"),
          selenium: path.resolve(__dirname, "public/selenium.html"),
        },
        output: {
          entryFileNames: (assetInfo) => {
            return assetInfo.name === "selenium" ? "selenium.bundle.js" : "assets/[name].[hash].js";
          },
        },
      },
    },
    server: {
      open: true,
      port: 3000,
      fs: {
        allow: [".."],
      },
    },
  });

export default config;
