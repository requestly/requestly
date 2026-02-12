import { defineConfig, transformWithEsbuild, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";
import commonjs from "vite-plugin-commonjs";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { nodePolyfills } from "vite-plugin-node-polyfills";
// @ts-ignore
import { getThemeVariables } from "antd/dist/theme";
import { theme } from "./src/lib/design-system/theme";

// Either this with vite.config.mjs file or non top-level-import like below
// import { viteStaticCopy } from "vite-plugin-static-copy";

const config = async ({ mode }: { mode: string }) => {
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
      include: [
        // Pre-bundle these to prevent duplicates
        "@sentry/react",
        "@sentry/core",
        "firebase/firestore",
        "firebase/database",
        "firebase/app",
        "firebase/auth",
        "firebase/analytics",
        "curlconverter",
        "@firebase/firestore",
        "@firebase/database",
      ],
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
      minify: "esbuild",
      cssMinify: true,
      modulePreload: {
        polyfill: true, // Ensure module preloading works in older browsers
      },
      cssCodeSplit: true, // Split CSS for better caching
      chunkSizeWarningLimit: 1000, // Warn for chunks over 1MB
      rollupOptions: {
        treeshake: {
          moduleSideEffects: (id) => {
            // Assume no side effects for these packages to enable better tree shaking
            if (id.includes("lodash") || id.includes("date-fns")) {
              return false;
            }
            return "no-external";
          },
          preset: "recommended",
          propertyReadSideEffects: false, // More aggressive tree shaking
        },
        output: {
          // Ensure proper chunk loading order
          chunkFileNames: (chunkInfo) => {
            // Name chunks to control load priority
            const facadeModuleId = chunkInfo.facadeModuleId || "";
            if (facadeModuleId.includes("react")) return "assets/[name]-[hash].js";
            if (facadeModuleId.includes("antd")) return "assets/[name]-[hash].js";
            return "assets/[name]-[hash].js";
          },
          manualChunks(id) {
            // Split vendor chunks
            if (id.includes("node_modules")) {
              // Sentry - group together to prevent duplicates
              if (id.includes("@sentry/core") || id.includes("@sentry/react") || id.includes("@sentry")) {
                return "sentry-vendor";
              }
              // Firebase - group all firebase together
              if (id.includes("@firebase") || id.includes("firebase/")) {
                return "firebase";
              }
              // CurlConverter
              if (id.includes("curlconverter")) {
                return "curlconverter-vendor";
              }
              // React ecosystem
              if (id.includes("react") || id.includes("react-dom") || id.includes("react-router")) {
                return "react-vendor";
              }
              // // Ant Design - separate chunk
              // if (id.includes("antd") || id.includes("@ant-design")) {
              //   return "ant-design";
              // }
              // CodeMirror
              if (id.includes("codemirror") || id.includes("@codemirror") || id.includes("@uiw/react-codemirror")) {
                return "codemirror";
              }
              // Lodash
              if (id.includes("lodash")) {
                return "lodash";
              }
              // Other large libraries
              if (id.includes("graphiql") || id.includes("graphql")) {
                return "graphql-vendor";
              }
              if (id.includes("prettier")) {
                return "prettier-vendor";
              }
              if (id.includes("lottie")) {
                return "lottie-vendor";
              }
              // Redux
              if (id.includes("redux") || id.includes("@reduxjs")) {
                return "redux-vendor";
              }
            }
          },
        },
      },
      esbuild: {
        // More aggressive minification
        treeShaking: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        minifyWhitespace: true,
        drop: generateSourcemap ? [] : ["console", "debugger"], // Remove console logs in production
      },
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
