import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import nodeResolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";
import svgr from "@svgr/rollup";
import terser from "@rollup/plugin-terser";
import svg from "rollup-plugin-svg";

const OUTPUT_DIR = "dist";
const isProductionBuildMode = process.env.BUILD_MODE === "production";

const commonPlugins = [typescript(), json()];

if (isProductionBuildMode) {
  commonPlugins.push(terser());
}

const commonConfig = {
  // https://github.com/vitejs/vite-plugin-react/pull/144
  onwarn(warning, defaultHandler) {
    // console.log({warning});
    if (warning.code === "MODULE_LEVEL_DIRECTIVE" && warning.message.includes("use client")) {
      return;
    } else {
      defaultHandler(warning);
    }
  },
};

export default [
  {
    ...commonConfig,
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
          {
            src: "resources/images/apiclient-container-bg.png",
            dest: `${OUTPUT_DIR}/popup`,
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
    ...commonConfig,
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
    ...commonConfig,
    input: "src/constants.ts",
    output: {
      file: `${OUTPUT_DIR}/constants.js`,
      name: "RQ.Constants",
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    ...commonConfig,
    input: "src/rulesStore.ts",
    output: {
      file: `${OUTPUT_DIR}/rulesStore.js`,
      name: "RQ.RulesStore",
      format: "iife",
    },
    plugins: commonPlugins,
  },
  {
    ...commonConfig,
    input: "src/utils.ts",
    output: {
      file: `${OUTPUT_DIR}/utils.js`,
      name: "RQ.commonUtils",
      format: "iife",
    },
    plugins: [...commonPlugins, nodeResolve()],
  },
  {
    ...commonConfig,
    input: "src/custom-elements/index.ts",
    output: {
      file: `${OUTPUT_DIR}/lib/customElements.js`,
      format: "iife",
    },
    plugins: [...commonPlugins, postcss({ inject: false }), svg()],
  },
];
