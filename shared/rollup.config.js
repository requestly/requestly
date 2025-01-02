import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

import pkg from "./package.json";

export default {
  input: {
    index: "src/index.ts",
    "constants/index": "src/constants/index.ts",
    "helpers/index": "src/helpers/index.ts",
    "lib/index": "src/lib/index.ts",
    "modules/index": "src/modules/index.ts",
    "types/index": "src/types/index.ts",
  },

  output: [
    {
      dir: "./dist",
      format: "cjs",
      entryFileNames: "[name].cjs.js",
      preserveModules: true,
    },
    {
      dir: "./dist",
      format: "esm",
      entryFileNames: "[name].esm.js",
      preserveModules: true,
    },
  ],
  plugins: [
    json(),
    typescript(),
    nodeResolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: ["@babel/preset-env"],
    }),
    // terser(),
  ],
};
