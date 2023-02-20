import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import { terser } from "rollup-plugin-terser";
import { version } from "./package.json";
import { browser, WEB_URL } from "../config/dist/config.build.json";

const OUTPUT_DIR = "dist";
const isProductionBuildMode = process.env.BUILD_MODE === "production";

const processManifest = (content) => {
  const manifestJson = JSON.parse(content);

  manifestJson.version = version;
  manifestJson.version_name = `${version} (MV3)`;

  const contentScripts = manifestJson.content_scripts;
  const webUrl = new URL(WEB_URL);
  const webUrlPattern = `${webUrl.protocol}//${webUrl.hostname}/*`;
  contentScripts[0].matches = [webUrlPattern];
  contentScripts[1].exclude_matches = [webUrlPattern];

  if (!isProductionBuildMode) {
    manifestJson.commands = {
      ...manifestJson.commands,
      reload: {
        description: "Reload extension in development mode",
        suggested_key: {
          default: "Alt+Shift+T",
        },
      },
    };
  }

  return JSON.stringify(manifestJson, null, 2);
};

const commonPlugins = [typescript(), json()];

if (isProductionBuildMode) {
  commonPlugins.push(terser());
}

export default [
  {
    input: "src/service-worker/index.ts",
    output: {
      file: `${OUTPUT_DIR}/serviceWorker.js`,
      format: "iife",
    },
    plugins: [
      ...commonPlugins,
      copy({
        targets: [
          { src: "resources", dest: OUTPUT_DIR },
          { src: "_locales", dest: OUTPUT_DIR },
          {
            src: `src/manifest.${browser}.json`,
            dest: OUTPUT_DIR,
            rename: "manifest.json",
            transform: processManifest,
          },
          {
            src: "node_modules/@requestly/web-sdk/dist/requestly-web-sdk.js",
            dest: `${OUTPUT_DIR}/libs`,
          },
          {
            src: [
              "src/devtools/devtools.html",
              "src/devtools/devtools.js",
              "../common/dist/devtools/network-panel",
            ],
            dest: `${OUTPUT_DIR}/devtools`,
          },
          {
            src: "../common/dist/popup",
            dest: OUTPUT_DIR,
          },
        ],
      }),
    ],
  },
  {
    input: "src/content-scripts/app/index.ts",
    output: {
      file: `${OUTPUT_DIR}/app.cs.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    input: "src/content-scripts/client/index.ts",
    output: {
      file: `${OUTPUT_DIR}/client.cs.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    input: "src/client-scripts/index.ts",
    output: {
      file: `${OUTPUT_DIR}/client.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
];
