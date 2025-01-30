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

    // host must not include port number for firefox, safari
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
    return `${webUrlObj.protocol}//${webUrlObj.hostname}/*`;
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

  return JSON.stringify(manifestJson, null, 2);
};

const commonPlugins = [typescript(), json()];

if (isProductionBuildMode) {
  commonPlugins.push(terser());
}

export default [
  {
    input: "src/service-worker/index.safari.ts",
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
        ],
      }),
    ],
  },
  {
    input: "src/content-scripts/app/index.safari.ts",
    output: {
      file: `${OUTPUT_DIR}/app.cs.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    input: "src/content-scripts/client/index.safari.ts",
    output: {
      file: `${OUTPUT_DIR}/client.cs.js`,
      format: "iife",
    },
    plugins: commonPlugins,
  },
];
