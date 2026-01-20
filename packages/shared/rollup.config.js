import { globSync } from "glob";
import path from "path";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import alias from "@rollup/plugin-alias";
import { fileURLToPath } from "url";

export default {
  /** This wasn't working for files which weren't exported and
   * some exported files too like /types/syncEntities/rules/rulesData
   * Moved to Matching glob patterns approach */
  // input: {
  //   index: "src/index.ts",
  //   "constants/index": "src/constants/index.ts",
  //   "helpers/index": "src/helpers/index.ts",
  //   "lib/index": "src/lib/index.ts",
  //   "modules/index": "src/modules/index.ts",
  //   "types/index": "src/types/index.ts",
  // },

  input: Object.fromEntries(
    globSync("src/**/*.ts").map((file) => {
      return [
        // This remove `src/` as well as the file extension from each
        // file, so e.g. src/nested/foo.js becomes nested/foo
        path.relative("src", file.slice(0, file.length - path.extname(file).length)),
        // This expands the relative paths to absolute paths, so e.g.
        // src/nested/foo becomes /project/src/nested/foo.js
        fileURLToPath(new URL(file, import.meta.url)),
      ];
    })
  ),

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
    alias({
      entries: [{ find: "~/", replacement: path.resolve(__dirname, "./src/") }],
    }),
    json(),
    typescript(),
    nodeResolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      presets: ["@babel/preset-env"],
    }),
  ],
};
