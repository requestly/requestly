import lazyWithRetry from "utils/lazyWithRetry";

export default lazyWithRetry(
  () => import(/* webpackChunkName: "TeamWorkSolvePuzzleAnimation" */ "./TeamWorkSolvePuzzleAnimation"),
  null
);

// export { default } from "./TeamWorkSolvePuzzleAnimation";
