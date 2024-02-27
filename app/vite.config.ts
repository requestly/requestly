import { defineConfig, transformWithEsbuild, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import vitePluginImp from "vite-plugin-imp";
import commonjs from "vite-plugin-commonjs";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { getThemeVariables } from "antd/dist/theme";
import { theme } from "./src/lib/design-system/theme";
import monacoEditorPlugin from "vite-plugin-monaco-editor";

const config = ({ mode }) =>
  defineConfig({
    define: {
      global: "window",
      "process.env": loadEnv(mode, process.cwd(), ""),
    },
    plugins: [
      nodePolyfills(),
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
      viteTsconfigPaths(),
      vitePluginImp({
        libList: [
          {
            libName: "antd",
            style: (name) => `antd/es/${name}/style`,
          },
        ],
      }),
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
