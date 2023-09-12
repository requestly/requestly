import lazyWithRetry from "utils/lazyWithRetry";

export default lazyWithRetry(() => import(/* webpackChunkName: "AstronautAnimation" */ "./AstronautAnimation"), null);

// export { default } from "./AstronautAnimation";
