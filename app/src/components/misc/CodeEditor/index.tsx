import lazyWithRetry from "utils/lazyWithRetry";

export default lazyWithRetry(() => import(/* webpackChunkName: "CodeEditor" */ "./CodeEditor"));

// export { default } from "./CodeEditor";
