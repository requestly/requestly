import lazyWithRetry from "utils/lazyWithRetry";

export default lazyWithRetry(() => import(/* webpackChunkName: "WelcomeAnimation" */ "./WelcomeAnimation"), null);

// export { default } from "./WelcomeAnimation";
