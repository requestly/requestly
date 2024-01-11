import lazyWithRetry from "utils/lazyWithRetry";

export default lazyWithRetry(() => import(/* webpackChunkName: "TeamWideAnimation" */ "./TeamWideAnimation"), null);

// export { default } from "./TeamWideAnimation";
