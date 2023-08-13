import lazyWithRetry from "utils/lazyWithRetry";

export default lazyWithRetry(
  () => import(/* webpackChunkName: "TeamSolvingPuzzleAnimation" */ "./TeamSolvingPuzzleAnimation"),
  null
);

// export { default } from "./TeamSolvingPuzzleAnimation";
