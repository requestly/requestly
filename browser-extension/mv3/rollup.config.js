import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import terser from "@rollup/plugin-terser";
import nodeResolve from "@rollup/plugin-node-resolve";
import { version } from "./package.json";
import { browser, WEB_URL, OTHER_WEB_URLS } from "../config/dist/config.build.json";

const OUTPUT_DIR = "dist";
const isProductionBuildMode = process.env.BUILD_MODE === "production";

const generateUrlPattern = (urlString) => {
  try {
    const webUrlObj = new URL(urlString);
    return `${webUrlObj.protocol}//${webUrlObj.host}/*`;
  } catch (error) {
    console.error(`Invalid URL: ${urlString}`, error);
    return null;
  }
};

const processManifest = (content) => {
  const manifestJson = JSON.parse(content);

  manifestJson.version = version;
  manifestJson.version_name = version;

  const { content_scripts: contentScripts } = manifestJson;

  const webURLPatterns = [WEB_URL, ...OTHER_WEB_URLS].map(generateUrlPattern).filter((pattern) => !!pattern); // remove null entries

  contentScripts[0].matches = webURLPatterns;
  contentScripts[1].exclude_matches = webURLPatterns;

  if (!isProductionBuildMode) {
    manifestJson.commands = {
      ...manifestJson.commands,
      reload: {
        description: "Reload extension in development mode",
        suggested_key: {
          default: "Alt+T",
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
      nodeResolve(),
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
          { src: "../common/dist/devtools", dest: OUTPUT_DIR },
          { src: "../common/dist/popup", dest: OUTPUT_DIR },
          { src: "../common/dist/lib/customElements.js", dest: `${OUTPUT_DIR}/libs` },
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
    input: "src/page-scripts/sessionRecorderHelper.js",
    output: {
      file: `${OUTPUT_DIR}/page-scripts/sessionRecorderHelper.ps.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    input: "src/page-scripts/ajaxRequestInterceptor/index.js",
    output: {
      file: `${OUTPUT_DIR}/page-scripts/ajaxRequestInterceptor.ps.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    input: "src/utility-scripts/cacheJson/cacheJsonOnPage.js",
    output: {
      file: `${OUTPUT_DIR}/libs/cacheJson.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
];
