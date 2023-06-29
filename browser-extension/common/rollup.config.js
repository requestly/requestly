import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import svgr from "@svgr/rollup";
import { terser } from "rollup-plugin-terser";

const OUTPUT_DIR = "dist";
const isProductionBuildMode = process.env.BUILD_MODE === "production";

const commonPlugins = [typescript(), json()];

if (isProductionBuildMode) {
  commonPlugins.push(terser());
}

export default [
  {
    input: "src/popup/index.tsx",
    output: {
      file: `${OUTPUT_DIR}/popup/popup.js`,
      format: "iife",
    },
    context: "window",
    plugins: [
      copy({
        targets: [
          {
            src: "src/popup/index.html",
            dest: `${OUTPUT_DIR}/popup`,
            rename: "popup.html",
          },
        ],
      }),
      nodeResolve(),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      ...commonPlugins,
      commonjs(),
      postcss({
        extract: true,
      }),
      svgr(),
    ],
  },
  {
    input: "src/devtools/index.tsx",
    output: {
      file: `${OUTPUT_DIR}/devtools/index.js`,
      format: "iife",
    },
    context: "window",
    plugins: [
      copy({
        targets: [
          {
            src: ["src/devtools/devtools.html", "src/devtools/devtools.js", "src/devtools/index.html"],
            dest: `${OUTPUT_DIR}/devtools`,
          },
        ],
      }),
      nodeResolve(),
      replace({
        preventAssignment: true,
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      ...commonPlugins,
      commonjs(),
      postcss({
        extract: true,
        use: ["sass"],
      }),
      svgr(),
    ],
  },
  {
    input: "src/constants.ts",
    output: {
      file: `${OUTPUT_DIR}/constants.js`,
      name: "RQ.Constants",
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    input: "src/rulesStore.ts",
    output: {
      file: `${OUTPUT_DIR}/rulesStore.js`,
      name: "RQ.RulesStore",
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    input: "src/utils.ts",
    output: {
      file: `${OUTPUT_DIR}/utils.js`,
      name: "RQ.commonUtils",
      format: "iife",
    },
    plugins: [...commonPlugins, nodeResolve()],
  },
  {
    input: "custom-elements/index.ts",
    output: {
      file: `${OUTPUT_DIR}/lib/customElements.js`,
      format: "iife",
    },
    plugins: [...commonPlugins],
  },
];
