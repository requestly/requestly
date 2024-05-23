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

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return defineConfig({
    define: {
      global: "window",
      "process.env": env,
    },
    plugins: [
      nodePolyfills(),
      {
        name: "treat-js-files-as-jsx",
        async transform(code, id) {
          if (!id.match(/src\/.*\.js$/)) return null;
          return transformWithEsbuild(code, id, {
            loader: "jsx",
            jsx: "automatic",
          });
        },
      },
      react(),
      viteTsconfigPaths(),
      monacoEditorPlugin({}),
      commonjs(),
      svgr(),
      // Custom plugin to serve selenium.bundle.js in dev mode
      {
        name: "serve-selenium-bundle",
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === "/selenium.bundle.js") {
              req.url = "/src/selenium.js";
            }
            next();
          });
        },
      },
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
};
